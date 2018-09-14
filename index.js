const chalk = require('chalk');
const config = require('./.config');
const convertToGithubUrl = require('./lib/helpers/convertToGithubUrl');
const dbConnect = require('./lib/mongoose');
const findUpdates = require('./lib/findUpdates');
const getChangelog = require('./lib/getChangelog');
const handleLicense = require('./lib/helpers/handleLicense');
const moment = require('moment');
const parseChangelog = require('./lib/parseChangelog');
const postToSlack = require('./lib/postToSlack');
const superagent = require('superagent');

const server = 'registry.npmjs.org';

run().catch(error => console.error(error.stack));

async function run() {
  const db = await dbConnect(config.mongodb);

  const Package = db.model('Package');
  const State = db.model('State');
  const Version = db.model('Version');

  const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
  const state = await State.findOneAndUpdate({}, {}, opts);

  while (true) {
    console.log(ts(), `Start loop at ${state.lastSequenceNumber}`);
    const { updated, lastSequenceNumber } =
      await findUpdates(state.lastSequenceNumber);

    for (const item of updated) {
      const { seq, id } = item;
      console.log(ts(), `Updated package "${id}"`);
      const npmData = await superagent.get(`https://${server}/${id}`).
        then(res => res.body);

      npmData['distTags'] = npmData['dist-tags'] || {};
      for (const key of Object.keys(npmData['distTags'])) {
        let sanitized = key;
        if (key.includes('.')) {
          sanitized = key.replace(/\./g, '-');
        }
        if (key.startsWith('$')) {
          sanitized = key.substr(1);
        }
        if (key !== sanitized) {
          npmData['distTags'][sanitized] = npmData['distTags'][key];
          delete npmData['distTags'][key];
        }
      }
      const versionDetail = npmData['versions'] || {};
      npmData['versions'] = Object.keys(versionDetail);
      delete npmData.readme;
      npmData['license'] = handleLicense(npmData['license']);

      let pkg = await Package.findOne({ _id: id });

      if (pkg == null) {
        pkg = new Package(npmData);
        await pkg.save();
      } else {
        pkg.set(npmData);
        await pkg.save();
      }

      const { changelog, url, githubUrl } = await getParsedChangelog(pkg);

      for (const version of npmData['versions']) {
        let doc = await Version.findOne({ packageId: pkg._id, version });

        const data = versionDetail[version];

        if (doc == null) {
          console.log(ts(), `Save ${pkg._id}@${version}`);
          const _changelog = changelog == null ? null : changelog[version];
          console.log(ts(), Object.keys(changelog || {}));
          if (_changelog != null) {
            console.log(ts(), _changelog);
          }
          doc = await Version.create({
            packageId: pkg._id,
            version,
            dependencies: toKeyValueArray(data.dependencies),
            license: handleLicense(data.license),
            publishedAt: npmData.time[version],
            changelog: _changelog
          });

          if (version === npmData['versions'][npmData['versions'].length - 1]) {
            if (!config.packages.includes(id)) {
              console.log(ts(), `Skip posting ${id}`);
              continue;
            }

            await postToSlack(id, version, url, changelog[version], githubUrl);
          }
        }
      }

      state.lastSequenceNumber = seq;
      await state.save();

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    state.lastSequenceNumber = lastSequenceNumber;
    await state.save();

    console.log(ts(), 'Done with this loop, waiting 5 mins');

    // Wait 5 minutes
    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
  }
}

function ts() {
  return chalk.blue(moment().format('YYYYMMDD HH:mm:ss'));
}

function toKeyValueArray(obj) {
  if (obj == null) {
    return [];
  }
  return Object.keys(obj).
    reduce((cur, key) => cur.concat([[key, obj[key]]]), []);
}

async function getParsedChangelog(pkg) {
  const { repository } = pkg;

  let githubUrl;
  try {
    githubUrl = convertToGithubUrl(repository);
  } catch (error) {
    return { changelog: null, url: null, githubUrl: null };
  }
  const changelogInfo = await getChangelog(githubUrl);

  if (changelogInfo == null) {
    return { changelog: null, url: null, githubUrl };
  }

  const { changelog, url } = changelogInfo;
  const parsed = parseChangelog(changelog);
  return { changelog: parsed, url, githubUrl };
}

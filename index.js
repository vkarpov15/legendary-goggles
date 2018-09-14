const chalk = require('chalk');
const config = require('./.config');
const convertToGithubUrl = require('./lib/helpers/convertToGithubUrl');
const dbConnect = require('./lib/mongoose');
const findUpdates = require('./lib/findUpdates');
const getChangelog = require('./lib/getChangelog');
const handleLicense = require('./lib/helpers/handleLicense');
const http = require('http');
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
  // const Version = db.model('Version');

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
      }

      state.lastSequenceNumber = seq;
      await state.save();

      const { changelog, version, url, githubUrl } = await getLatestChangelog(id);

      if (version == null) {
        continue;
      }

      console.log(ts(), changelog);

      if (!config.packages.includes(id)) {
        console.log(ts(), `Skip posting ${id}`);
        continue;
      }

      await postToSlack(id, version, url, changelog, githubUrl);

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

async function getLatestChangelog(pkg) {
  // Use native HTTP because superagent struggles with application/octet-stream,
  // which is what npm gives you for very large packages.
  // See https://github.com/visionmedia/superagent/issues/402
  const res = await new Promise((resolve, reject) => {
    const opts = {
      method: 'GET',
      hostname: server,
      path: `/${pkg}`
    };
    let str = '';
    const request = http.request(opts, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        str += chunk.toString('utf8');
      });
      res.on('end', () => {
        resolve(JSON.parse(str));
      });
      res.on('error', err => reject(err));
    });

    request.on('error', error => reject(error));
    request.end();
  });

  const { versions, repository } = res;
  const version = Object.keys(versions || {}).reverse()[0];

  if (version == null) {
    return { changelog: null, version: null, url: null, githubUrl: null };
  }

  let githubUrl;
  try {
    githubUrl = convertToGithubUrl(repository);
  } catch (error) {
    return { changelog: null, version, url: null, githubUrl: null };
  }
  const changelogInfo = await getChangelog(githubUrl);

  if (changelogInfo == null) {
    return { changelog: null, version, url: null, githubUrl };
  }

  const { changelog, url } = changelogInfo;
  const parsed = parseChangelog(changelog);
  return { changelog: parsed[version], version, url, githubUrl };
}

const getParsedChangelog = require('./getParsedChangelog');
const handleLicense = require('./helpers/handleLicense');
const superagent = require('superagent');
const toKeyValueArray = require('./helpers/toKeyValueArray');
const ts = require('./util/ts');

const server = 'registry.npmjs.org';

module.exports = db => async function updatePackage(id) {
  const Package = db.model('Package');
  const Version = db.model('Version');

  const npmData = await superagent.get(`https://${server}/${id}`).
    then(res => res.body).
    catch(error => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });

  // Package not found, skip it
  if (npmData == null) {
    return { pkg: null, newVersions: [] };
  }

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
  const isNewPackage = pkg == null;

  if (pkg == null) {
    pkg = new Package(npmData);
    await pkg.save();
  } else {
    pkg.set(npmData);
    await pkg.save();
  }

  const { changelog, url } = await getParsedChangelog(pkg);

  pkg.changelogUrl = url;
  await pkg.save();

  const newVersions = [];
  for (const version of npmData['versions']) {
    let doc = await Version.findOne({ packageId: pkg._id, version });

    const data = versionDetail[version];

    if (doc == null) {
      console.log(ts(), `Save ${pkg._id}@${version}`);
      const _changelog = changelog == null ? null : changelog[version];
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

      if (!isNewPackage) {
        newVersions.push(doc);
      }
    }
  }

  return { pkg, newVersions };
};

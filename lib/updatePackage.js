// const findTagMessage = require('./findTagMessage');
const getParsedChangelog = require('./getParsedChangelog');
const handleLicense = require('./helpers/handleLicense');
const { get } = require('./util/get');
const toKeyValueArray = require('./helpers/toKeyValueArray');
const logger = require('./logger');

const server = 'registry.npmjs.org';

module.exports = db => async function updatePackage(id) {
  const Package = db.model('Package');
  const Version = db.model('Version');

  const npmData = await get(`https://${server}/${id}`).
    catch(error => {
      if (error.status === 404 || error.status === 405) {
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

  logger.debug(`find package ${id}`);
  let pkg = await Package.findOne({ _id: id });

  if (pkg == null) {
    pkg = new Package(npmData);
    await pkg.save();
  } else {
    pkg.set(npmData);
    await pkg.save();
  }

  logger.debug(`fetching changelog for ${id}`);

  const { changelog, url } = await getParsedChangelog(pkg);

  pkg.changelogUrl = url;
  await pkg.save();

  logger.debug(`persisting ${npmData['versions'].length} versions`);

  const newVersions = [];
  let promises = [];
  for (const version of npmData['versions']) {
    const promise = persistVersion(pkg._id, version, versionDetail, changelog).
      then(version => {
        if (version != null) {
          newVersions.push(version);
        }
      });
    promises.push(promise);
    if (promises.length >= 5) {
      await Promise.all(promises);
      promises = [];
    }
  }

  logger.debug(`updated package ${id}`);

  await Promise.all(promises);

  return { pkg, newVersions };

  async function persistVersion(packageId, version, versionDetail, changelog) {
    let doc = await Version.findOne({ packageId, version });

    const data = versionDetail[version];

    const _changelog = changelog == null ? null : changelog[version];
    if (_changelog != null) {
      logger.debug(_changelog);
    }

    if (doc == null) {
      logger.debug(`Save ${pkg._id}@${version}`);

      /*const tagMessage = await findTagMessage(pkg, version);
      if (tagMessage != null) {
        console.log(ts(), `Tag Message: "${tagMessage}"`);
      }*/

      doc = await Version.create({
        packageId,
        version,
        dependencies: toKeyValueArray(data.dependencies),
        license: handleLicense(data.license),
        publishedAt: npmData.time[version],
        changelog: _changelog
        // tagMessage
      });

      return doc;
    }

    doc.changelog = _changelog;
    await doc.save();

    return null;
  }
};

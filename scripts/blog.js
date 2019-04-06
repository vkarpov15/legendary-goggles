const _ = require('lodash');
const moment = require('moment');
const semver = require('semver');

run().catch(error => console.error(error.stack));

async function run() {
  const lib = await require('../lib')(require('../config'));
  const db = lib.db;

  const lastFriday = moment().subtract(7, 'days').startOf('day').toDate();
  const today = moment().subtract(0, 'days').startOf('day').toDate();

  const count = await db.model('Version').count({
    publishedAt: { $gte: lastFriday, $lte: today }
  });

  console.log('Count', count);

  const pkgs = await db.model('Package').find({ downloadsLastMonth: { $gte: 400000 } });

  let top10major = [];
  let top10minor = [];
  let top10patch = [];

  for (const pkg of pkgs) {
    const versions = await db.model('Version').
      find({
        packageId: pkg._id,
        publishedAt: { $gte: lastFriday, $lte: today }
      }).
      sort({ publishedAt: -1 });
    if (versions.length === 0) {
      continue;
    }
    // Avoid nightly pre-releases and other junk
    const version = versions.find(v => !semver.prerelease(v.version));
    if (!version) {
      continue;
    }

    const major = versions.find(v => {
      v = semver.parse(v.version);
      return v.minor === 0 && v.patch === 0 && v.prerelease.length === 0;
    });

    if (major != null) {
      if (top10major.length < 10) {
        top10major.push({ version: major, pkg });
        top10major = _.sortBy(top10major, obj => obj.pkg.downloadsLastMonth);
        continue;
      }

      const first = top10major[0];
      if (pkg.downloadsLastMonth > first.pkg.downloadsLastMonth) {
        top10major[0] = { version: major, pkg };
        top10major = _.sortBy(top10major, obj => obj.pkg.downloadsLastMonth);
      }

      continue;
    }

    const minor = versions.find(v => {
      v = semver.parse(v.version);
      return v.minor !== 0 && v.patch === 0 && v.prerelease.length === 0;
    });

    if (minor != null) {
      if (top10minor.length < 10) {
        top10minor.push({ version: minor, pkg });
        top10minor = _.sortBy(top10minor, obj => obj.pkg.downloadsLastMonth);
        continue;
      }

      const first = top10minor[0];
      if (pkg.downloadsLastMonth > first.pkg.downloadsLastMonth) {
        top10minor[0] = { version: minor, pkg };
        top10minor = _.sortBy(top10minor, obj => obj.pkg.downloadsLastMonth);
      }

      continue;
    }

    version.package = pkg;
    console.log(pkg._id, version.version, pkg.downloadsLastMonth);
    if (top10patch.length < 10) {
      top10patch.push({ version, pkg });
      top10patch = _.sortBy(top10patch, obj => obj.pkg.downloadsLastMonth);
      continue;
    }

    const first = top10patch[0];
    if (pkg.downloadsLastMonth > first.pkg.downloadsLastMonth) {
      top10patch[0] = { version, pkg };
      top10patch = _.sortBy(top10patch, obj => obj.pkg.downloadsLastMonth);
    }
  }

  top10major.reverse().forEach((o, i) => {
    const str = `${i + 1}) **[${o.pkg._id}](https://npmjs.com/package/${o.pkg._id})@${o.version.version}**: ${o.pkg.description}\n`;
    console.log(str);
  });

  console.log('\n\n');

  top10minor.reverse().forEach((o, i) => {
    const str = `${i + 1}) **[${o.pkg._id}](https://npmjs.com/package/${o.pkg._id})@${o.version.version}**: ${o.pkg.description}\n`;
    console.log(str);
  });

  console.log('\n\n');

  top10patch.reverse().forEach((o, i) => {
    const str = `${i + 1}) **[${o.pkg._id}](https://npmjs.com/package/${o.pkg._id})@${o.version.version}**: ${o.pkg.description}\n`;
    console.log(str);
  });

  console.log('Count:', count);
}

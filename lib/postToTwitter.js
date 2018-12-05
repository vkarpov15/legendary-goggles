'use strict';

const config = require('../config');
const semver = require('semver');
const twitter = require('twit')({
  'consumer_key': config.twitterApi,
  'consumer_secret': config.twitterSecret,
  'access_token': config.twitterAccess,
  'access_token_secret': config.twitterAccessSecret
});

// Ignore overly noisy packages
const ignorePkgs = [
  /^caniuse/
];

module.exports = () => async function postToTwitter({ pkg, newVersions }) {
  for (const re of ignorePkgs) {
    if (re.test(pkg._id)) {
      return;
    }
  }
  // Filter out pre-releases
  newVersions = newVersions.filter(v => !semver.prerelease(v.version));
  if (newVersions.length < 1) {
    return;
  }
  const version = newVersions[newVersions.length - 1];

  const status = `${pkg._id} v${version.version} released\n\nhttps://js.report/package/${pkg._id}/${version.version}`;

  await twitter.post('statuses/update', { status });
};

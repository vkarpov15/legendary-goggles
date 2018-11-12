'use strict';

const config = require('../config');
const twitter = require('twit')({
  'consumer_key': config.twitterApi,
  'consumer_secret': config.twitterSecret,
  'access_token': config.twitterAccess,
  'access_token_secret': config.twitterAccessSecret
});

module.exports = () => async function postToTwitter({ pkg, newVersions }) {
  if (newVersions.length < 1) {
    return;
  }
  const version = newVersions[newVersions.length - 1];

  const status = `${pkg._id} v${version.version} released\n\nhttps://js.report/package/${pkg._id}/${version.version}`;

  await twitter.post('statuses/update', { status });
};

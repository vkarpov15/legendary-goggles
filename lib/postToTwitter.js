'use strict';

const config = require('../config');
const firstChangelogLines = require('./helpers/firstChangelogLines');
const twitter = require('twit')({
  'consumer_key': config.twitterApi,
  'consumer_secret': config.twitterSecret,
  'access_token': config.twitterAccess,
  'access_token_secret': config.twitterAccessSecret
});

module.exports = db => async function postToTwitter({ pkg, newVersions }) {
  if (newVersions.length < 1) {
    return;
  }
  const version = newVersions[newVersions.length - 1];

  const status = `${pkg._id} v${version.version} released\n\nhttps://js.report/package/${pkg._id}/${version.version}`;

  console.log('Test', status)
  await twitter.post('statuses/update', { status });
};

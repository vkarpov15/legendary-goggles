const connect = require('./db');
const handler = require('./handler');
const marked = require('marked');

exports.handler = handler(latestVersions);

exports.latestVersions = latestVersions;

async function latestVersions() {
  const db = await connect();

  const versions = await db.model('Version').
    find({ changelog: { $ne: null } }).
    sort({ publishedAt: -1 }).
    limit(10);

  versions.
    filter(v => v.changelog != null).
    forEach(v => { v.changelog = marked(v.changelog); });

  return { versions };
}

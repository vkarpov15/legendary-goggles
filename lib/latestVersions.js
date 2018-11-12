const marked = require('marked');

module.exports = db => async function latestVersions() {
  const versions = await db.model('Version').
    find({ changelog: { $ne: null } }).
    sort({ publishedAt: -1 }).
    limit(10);

  versions.
    filter(v => v.changelog != null).
    forEach(v => { v.changelog = marked(v.changelog); });

  return { versions };
};

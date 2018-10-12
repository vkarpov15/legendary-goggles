const Archetype = require('archetype');
const Timestamp = require('./types/timestamp');
const assert = require('assert');
const marked = require('marked');

const FeedParamsType = new Archetype({
  before: { $type: Timestamp },
  limit: {
    $type: 'number',
    $default: 25,
    $required: true,
    $validate: v => assert.ok(v < 100, `Limit must be less than 100, got ${v}`)
  }
}).compile('FeedParamsType');

module.exports = db => async function feed(params) {
  const { before, limit } = new FeedParamsType(params);

  const versions = await db.model('Version').
    find(before == null ? {} : { publishedAt: { $lt: before.toDate() } }).
    sort({ publishedAt: -1 }).
    populate('package').
    limit(limit);

  versions.filter(v => v.changelog != null).forEach(v => {
    v.changelog = marked(v.changelog);
  });

  return { versions };
};

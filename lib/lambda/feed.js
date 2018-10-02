const Archetype = require('archetype');
const Timestamp = require('../types/timestamp');
const assert = require('assert');
const connect = require('./db');
const handler = require('./handler');
const marked = require('marked');

exports.handler = handler(feed);

exports.feed = feed;

const FeedParamsType = new Archetype({
  before: { $type: Timestamp },
  limit: {
    $type: 'number',
    $default: 25,
    $required: true,
    $validate: v => assert.ok(v < 100, `Limit must be less than 100, got ${v}`)
  }
}).compile('FeedParamsType');

async function feed(params) {
  const db = await connect();

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
}

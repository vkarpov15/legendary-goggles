'use strict';

const Archetype = require('archetype');
const assert = require('assert');

const TopParamsType = new Archetype({
  sortBy: { $type: 'string', $required: true },
  count: { $type: 'number', $default: 100, $required: true }
}).compile('TopParamsType');

module.exports = db => async function top(params) {
  const { sortBy, count } = new TopParamsType(params);

  assert.ok(['downloads', 'stars'].includes(sortBy), `Invalid sort ${sortBy}`);
  assert.ok(count > 0 && count <= 5000, `Invalid count ${count}`);

  const sort = {
    downloads: 'downloadsLastMonth',
    stars: 'github.numStars'
  }[sortBy];

  const packages = await db.model('Package').find().sort({ [sort]: -1 }).limit(count);

  return { packages };
};

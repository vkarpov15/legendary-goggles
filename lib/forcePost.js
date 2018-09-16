const assert = require('assert');
const postToSlack = require('./postToSlack');

module.exports = db => async function forcePost(pkg, version) {
  pkg = await db.model('Package').findOne({ _id: pkg });
  assert.ok(pkg);
  version = await db.model('Version').findOne({ packageId: pkg, version });

  const { changelog } = version;

  await postToSlack(pkg._id, version.version, null, changelog);
};

'use strict';

const Archetype = require('archetype');

const VersionParamsType = new Archetype({
  packageId: { $type: 'string', $required: true },
  version: { $type: 'string', $required: true }
}).compile('VersionParamsType');

module.exports = db => async function version(params) {
  const { packageId, version } = new VersionParamsType(params);

  return {
    version: await db.model('Version').findOne({ packageId, version }),
    package: await db.model('Package').findOne({ _id: packageId })
  };
};

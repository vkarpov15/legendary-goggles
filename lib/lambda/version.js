const Archetype = require('archetype');
const connect = require('./db');
const handler = require('./handler');

exports.handler = handler(version);

exports.version = version;

const VersionParamsType = new Archetype({
  packageId: { $type: 'string', $required: true },
  version: { $type: 'string', $required: true }
}).compile('VersionParamsType');

async function version(params) {
  const db = await connect();

  const { packageId, version } = new VersionParamsType(params);

  return {
    version: await db.model('Version').findOne({ packageId, version })
  };
}

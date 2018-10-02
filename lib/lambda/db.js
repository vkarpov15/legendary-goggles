const assert = require('assert');
const config = require('../../.config');
const connectDb = require('../mongoose');

let conn = null;

const isTest = process.env.NODE_ENV === 'test';

module.exports = async function connect(uri) {
  if (conn == null) {
    assert.ok(uri || !isTest, 'Must specify URI if running in test');

    conn = await connectDb(uri || config.mongodb, {
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // and MongoDB driver buffering
    });
  }

  return conn;
};

const config = require('../../.config');
const connectDb = require('../mongoose');

let conn = null;

module.exports = async function connect() {
  if (conn == null) {
    conn = await connectDb(config.mongodb, {
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // and MongoDB driver buffering
    });
  }

  return conn;
};

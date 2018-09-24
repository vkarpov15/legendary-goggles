const connect = require('./mongoose');

const findUpdates = require('./findUpdates');
const getParsedChangelog = require('./getParsedChangelog');
const postToSlack = require('./postToSlack');
const updatePackage = require('./updatePackage');

module.exports = async function(config) {
  const db = await connect(config.mongodb);

  return {
    db,
    findUpdates,
    getParsedChangelog,
    postToSlack: postToSlack(db),
    updatePackage: updatePackage(db)
  };
};

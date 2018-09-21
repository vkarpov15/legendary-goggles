const connect = require('./mongoose');

const findUpdates = require('./findUpdates');
const getParsedChangelog = require('./getParsedChangelog');
const postToSlack = require('./postToSlack');
const updatePackage = require('./updatePackage');

module.exports = async function(uri) {
  const db = await connect(uri);

  return {
    db,
    findUpdates,
    getParsedChangelog,
    postToSlack: postToSlack(db),
    updatePackage: updatePackage(db)
  };
};

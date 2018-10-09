const connect = require('./mongoose');

const findUpdates = require('./findUpdates');
const getParsedChangelog = require('./getParsedChangelog');
const getState = require('./getState');
const postToSlack = require('./postToSlack');
const registerSlackOauth = require('./registerSlackOauth');
const updateNumGitHubStars = require('./updateNumGitHubStars');
const updatePackage = require('./updatePackage');

module.exports = async function(config) {
  const db = await connect(config.mongodb);

  return {
    db,
    findUpdates,
    getParsedChangelog,
    getState: getState(db),
    postToSlack: postToSlack(db),
    registerSlackOauth: registerSlackOauth(db),
    updateNumGitHubStars,
    updatePackage: updatePackage(db)
  };
};

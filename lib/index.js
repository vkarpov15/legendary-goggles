const connect = require('./mongoose');

const dlStats = require('./dlStats');
const feed = require('./feed');
const findUpdates = require('./findUpdates');
const getParsedChangelog = require('./getParsedChangelog');
const getState = require('./getState');
const loginSlack = require('./loginSlack');
const postToSlack = require('./postToSlack');
const registerSlackOauth = require('./registerSlackOauth');
const updateNumGitHubStars = require('./updateNumGitHubStars');
const updatePackage = require('./updatePackage');

module.exports = async function(config) {
  const db = await connect(config.mongodb);

  return {
    db,
    dlStats,
    feed: feed(db),
    findUpdates,
    getParsedChangelog,
    getState: getState(db),
    loginSlack: loginSlack(config, db),
    postToSlack: postToSlack(db),
    registerSlackOauth: registerSlackOauth(db),
    updateNumGitHubStars,
    updatePackage: updatePackage(db)
  };
};

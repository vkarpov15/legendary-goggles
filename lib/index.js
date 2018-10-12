const connect = require('./mongoose');

const dlStats = require('./dlStats');
const feed = require('./feed');
const findUpdates = require('./findUpdates');
const getParsedChangelog = require('./getParsedChangelog');
const getState = require('./getState');
const postToSlack = require('./postToSlack');
const slackOauth = require('./slackOauth');
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
    postToSlack: postToSlack(db),
    slackOauth: slackOauth(config, db),
    updateNumGitHubStars,
    updatePackage: updatePackage(db)
  };
};

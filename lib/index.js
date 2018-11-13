const connect = require('./mongoose');

const feed = require('./feed');
const findUpdates = require('./findUpdates');
const getParsedChangelog = require('./getParsedChangelog');
const getState = require('./getState');
const postToSlack = require('./postToSlack');
const slackOauth = require('./slackOauth');
const updateAccount = require('./updateAccount');
const updateCustomer = require('./updateCustomer');
const updateNumGitHubStars = require('./updateNumGitHubStars');
const updatePackage = require('./updatePackage');

module.exports = async function(config) {
  const db = await connect(config.mongodb);

  return {
    db,
    dlStats: require('./dlStats')(db),
    feed: feed(db),
    findUpdates,
    me: require('./me')(db),
    getParsedChangelog,
    getState: getState(db),
    latestVersions: require('./latestVersions')(db),
    postToSlack: postToSlack(db),
    postToTwitter: require('./postToTwitter')(db),
    slackOauth: slackOauth(config, db),
    updateAccount: updateAccount(db),
    updateCustomer: updateCustomer(db),
    updateNumGitHubStars,
    updatePackage: updatePackage(db),
    updateStripe: require('./updateStripe')(db)
  };
};

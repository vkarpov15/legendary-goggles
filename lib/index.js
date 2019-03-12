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

  const lib = {};

  Object.assign(lib, {
    createAccount: require('./createAccount')(db),
    db,
    dlStats: require('./dlStats')(db),
    feed: feed(db),
    findUpdates,
    me: require('./me')(db),
    getGitHubRepos: require('./getGitHubRepos')({ db }),
    getParsedChangelog,
    getState: getState(db),
    getVersion: require('./functions/getVersion')(db),
    githubOauth: require('./githubOauth')({ config, db, lib }),
    latestVersions: require('./latestVersions')(db),
    postToSlack: postToSlack(db),
    postToTwitter: require('./postToTwitter')(db),
    sendEmailDigests: require('./sendEmailDigests')({ db, config }),
    slackOauth: slackOauth(config, db),
    syncPackageJson: require('./syncPackageJson')({ db }),
    top: require('./functions/top')(db),
    unsubscribe: require('./unsubscribe')({ db }),
    updateAccount: updateAccount({ db, lib }),
    updateCustomer: updateCustomer(db),
    updateNumGitHubStars,
    updatePackage: updatePackage(db),
    updateStripe: require('./updateStripe')(db)
  });

  return lib;
};

const logger = require('./logger');
const slack = require('slack');
const util = require('util');

module.exports = (config, db) => async function registerStackOauth(params) {
  const Account = db.model('Account');
  const Customer = db.model('Customer');

  const res = await slack.oauth.access({
    'client_id': config.slackClientId,
    'client_secret': config.slackClientSecret,
    code: params.code
  });

  if (!res.ok) {
    throw new Error('Error from slack: ' + util.inspect(res));
  }

  const {
    team_name: teamName,
    incoming_webhook: webhook,
    user_id: userId
  } = res;

  const account = await Account.create({
    name: `${teamName}: #${webhook.channel}`,
    slackWebhooks: [webhook.url],
    packagesWatched: ['lodash']
  });

  const customer = await Customer.findOneAndUpdate(
    { slackId: userId },
    { $addToSet: { accountIds: [account._id] } },
    { upsert: true, new: true });

  logger.debug({ function: 'registerStackOauth', params, res });
  return { res, account, customer };
};

const logger = require('./logger');
const slack = require('slack');
const util = require('util');

module.exports = (config, db) => async function registerStackOauth(params) {
  const Account = db.model('Account');
  const Customer = db.model('Customer');

  const slackData = await slack.oauth.access({
    'client_id': config.slackClientId,
    'client_secret': config.slackClientSecret,
    code: params.code
  });

  if (!slackData.ok) {
    throw new Error('Error from slack: ' + util.inspect(slackData));
  }

  const {
    team_name: teamName,
    incoming_webhook: webhook,
    user_id: userId
  } = slackData;

  const response = {};
  const update = {};

  if (webhook != null) {
    const account = await Account.create({
      name: `${teamName}: #${webhook.channel}`,
      slackWebhooks: [webhook.url],
      packagesWatched: ['lodash']
    });
    response.account = account;
    update.$addToSet = { accountIds: [account._id] };
  }

  const customer = await Customer.findOneAndUpdate(
    { slackId: userId },
    update,
    { upsert: true, new: true });

  logger.debug({ function: 'registerStackOauth', params, slackData });
  Object.assign(response, { customer, slackData });
  return response;
};

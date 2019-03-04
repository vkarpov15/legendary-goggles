const assert = require('assert');
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
    access_token: accessToken,
    team_name: teamName,
    incoming_webhook: webhook,
    user
  } = slackData;

  const response = {};
  const update = {};

  if (webhook != null) {
    const account = await Account.create({
      name: `${teamName}: #${webhook.channel}`,
      slackWebhooks: [webhook.url],
      packagesWatched: ['lodash'],
      type: 'SLACK'
    });
    response.account = account;
    update.$addToSet = { accountIds: [account._id] };
  }

  if (user != null) {
    const [firstName, lastName] = (user.name || '').split(/s+/).concat(['']);
    update.$set = {
      email: user.email,
      firstName,
      lastName
    };
  }

  const slackId = user == null ? slackData['user_id'] : user.id;
  assert.ok(slackId != null, `Couldn't find slack user id from ${util.inspect(slackData)}`);

  const customer = await Customer.
    findOneAndUpdate({ slackId }, update, { upsert: true, new: true });

  const token = await db.model('Token').
    findOneAndUpdate({ _id: accessToken }, { customerId: customer._id }, { upsert: true, new: true });

  logger.debug({ function: 'slackOauth', params, slackData });
  Object.assign(response, { customer, slackData, token });
  return response;
};

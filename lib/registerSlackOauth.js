const config = require('../.config');
const logger = require('./logger');
const slack = require('slack');
const superagent = require('superagent');
const util = require('util');

module.exports = db => async function registerStackOauth(params) {
  const Account = db.model('Account');

  const res = await slack.oauth.access({
    'client_id': config.slackClientId,
    'client_secret': config.slackClientSecret,
    code: params.code
  });

  if (!res.ok) {
    throw new Error('Error from slack: ' + inspect(res));
  }

  const { team_name: teamName, incoming_webhook: webhook } = res;

  const account = await Account.create({
    name: `${teamName}: #${webhook.channel}`,
    slackWebhooks: [webhook.url],
    packagesWatched: ['lodash']
  });

  logger.debug({ function: 'registerStackOauth', params, res });
  return { params, res };
};

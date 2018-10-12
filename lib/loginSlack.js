const Archetype = require('archetype');
const logger = require('./logger');
const slack = require('slack');
const superagent = require('superagent');
const util = require('util');

const LoginSlackParamsType = new Archetype({
  code: { $type: 'string', $required: true }
}).compile('LoginSlackParamsType');

module.exports = (config, db) => async function loginSlack(params) {
  const { code } = new LoginSlackParamsType(params);
  const Account = db.model('Account');
  const Customer = db.model('Customer');

  const res = await slack.oauth.access({
    'client_id': config.slackClientId,
    'client_secret': config.slackClientSecret,
    code
  });

  console.log(util.inspect(res));

  return { res };
};

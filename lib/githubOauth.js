'use strict';

const assert = require('assert');
const superagent = require('superagent');

module.exports = ({ config, db, lib }) => async function registerGithubOauth(params) {
  const { code } = params;
  assert.ok(typeof code === 'string', `Invalid code "${code}"`);

  const { access_token: accessToken } = await superagent.
    post('https://github.com/login/oauth/access_token').
    send({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code
    }).
    then(res => res.body).
    then(res => {
      if (res.error) {
        throw new Error(`${res.error}: ${res.error_description}`);
      }
      return res;
    });

  const { email, login, id } = await superagent.
    get(`https://api.github.com/user?access_token=${accessToken}`).
    then(res => {
      return res.body;
    });

  const { customer, isNew } = await db.model('Customer').
    findOneAndUpdate(
      { $or: [{ githubId: id }, { email }] },
      {
        $set: {
          email,
          githubId: id,
          githubUsername: login,
          githubAccessToken: accessToken
        }
      },
      { returnOriginal: false, upsert: true, rawResult: true }
    ).
    then(res => {
      return {
        customer: res.value,
        isNew: !res.lastErrorObject.updatedExisting
      };
    });

  const response = { customer };

  response.token = await db.model('Token').findOneAndUpdate(
    { _id: accessToken },
    { customerId: customer._id },
    { upsert: true, new: true }
  );

  if (isNew) {
    const account = await db.model('Account').create({
      name: `GitHub: ${login}`,
      packagesWatched: [],
      reposWatched: [],
      emails: [email],
      type: 'GITHUB'
    });
    response.account = account;

    response.customer = await db.model('Customer').findOneAndUpdate({ _id: account._id }, {
      $addToSet: {
        accountIds: account._id
      }
    });
  }

  response.customer = await lib.getGitHubRepos({ accessTokenId: response.token._id }).
    then(res => res.customer);

  return response;
};

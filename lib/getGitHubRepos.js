'use strict';

const Archetype = require('archetype');
const superagent = require('superagent');

const GetGitHubReposParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  }
}).compile('GetGitHubReposParams');

module.exports = ({ db }) => async function getGithubRepos(params) {
  const { accessTokenId } = new GetGitHubReposParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  let customer = await db.model('Customer').findOne({ _id: token.customerId });
  if (customer == null) {
    throw new Error(`Customer ${token.customerId} not found`);
  }

  let repos = [];

  for (let i = 1;; ++i) {
    const _repos = await superagent.
      get(`https://api.github.com/user/repos?per_page=100&page=${i}&access_token=${token._id}`).
      then(res => {
        console.log(res.body.map(repo => repo['full_name']));
        return res.body.map(repo => repo['full_name']);
      });
    repos = repos.concat(_repos);
    if (_repos.length < 100) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  customer = await db.model('Customer').findOneAndUpdate({ _id: customer._id }, {
    $set: {
      githubRepos: repos
    }
  });

  return { customer };
};

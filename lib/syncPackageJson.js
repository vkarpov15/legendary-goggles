'use strict';

const { ObjectId } = require('mongodb');
const Archetype = require('archetype');
const superagent = require('superagent');

const SyncPackageJsonParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  },
  accountId: {
    $type: ObjectId,
    $required: true
  }
}).compile('SyncPackageJsonParams');

module.exports = ({ db }) => async function syncPackageJson(params) {
  const { accessTokenId, accountId } = new SyncPackageJsonParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  const customer = await db.model('Customer').findOne({ _id: token.customerId });
  if (customer == null) {
    throw new Error(`Customer ${token.customerId} not found`);
  }
  if (!customer.accountIds.map(id => id.toString()).includes(accountId.toString())) {
    throw new Error(`Customer ${customer._id} does not have access to ` +
      `account ${accountId}`);
  }

  let account = await db.model('Account').findOne({ _id: accountId });
  if (account == null) {
    throw new Error(`Account ${accountId} not found`);
  }

  const accessToken = customer.githubAccessToken;
  if (accessToken == null) {
    throw new Error(`Customer ${customer._id} has not authorized GitHub`);
  }

  const packagesWatched = new Set();
  for (const repo of account.reposWatched) {
    const pkg = await superagent.
      get(`https://api.github.com/repos/${repo}/contents/package.json?access_token=${accessToken}`).
      then(res => res.body.content).
      then(content => JSON.parse(Buffer.from(content, 'base64').toString('utf8'))).
      catch(error => console.log(error));

    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    const peerDeps = Object.keys(pkg.peerDependencies || {});
    deps.concat(devDeps).concat(peerDeps).forEach(dep => {
      packagesWatched.add(dep);
    });
  }

  console.log('Setting watched packages', packagesWatched);
  account = await db.model('Account').findOneAndUpdate({ _id: account._id }, {
    $set: { packagesWatched: Array.from(packagesWatched) }
  });

  return { account };
};

const Archetype = require('archetype');
const mongodb = require('mongodb');

const UpdateAccountParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  },
  accountId: {
    $type: mongodb.ObjectId,
    $required: true
  },
  name: { $type: 'string' },
  slackWebhooks: { $type: ['string'] },
  packagesWatched: { $type: ['string'] },
  reposWatched: { $type: ['string'] }
}).compile('UpdateAccountParams');

module.exports = ({ db, lib }) => async function updateCustomer(params) {
  const {
    accessTokenId,
    accountId,
    name,
    slackWebhooks,
    packagesWatched,
    reposWatched
  } = new UpdateAccountParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  const customer = await db.model('Customer').findOne({ _id: token.customerId });
  if (customer == null) {
    throw new Error(`Customer ${token.customerId} not found`);
  }
  if (!customer.accountIds.map(id => id.toString()).includes(accountId.toString())) {
    throw new Error(`Account ${accountId} not found`);
  }

  let account = await db.model('Account').findOne({
    _id: accountId
  });
  if (account == null) {
    throw new Error(`Account ${accountId} not found`);
  }

  account.set(removeNullish({ name, slackWebhooks, packagesWatched, reposWatched }));

  await account.save();

  if (account.type === 'GITHUB') {
    account = await lib.
      syncPackageJson({ accessTokenId, accountId: account._id }).
      then(res => res.account);
  }

  return { account };
};

function removeNullish(obj) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (obj[key] == null) {
      delete obj[key];
    }
  }

  return obj;
}

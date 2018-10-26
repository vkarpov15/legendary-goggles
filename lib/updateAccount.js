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
  packagesWatched: { $type: ['string'] }
}).compile('UpdateAccountParams');

module.exports = db => async function updateCustomer(params) {
  const {
    accessTokenId,
    accountId,
    name,
    slackWebhooks,
    packagesWatched
  } = new UpdateAccountParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  const account = await db.collection('Account').findOne({
    _id: accountId,
    customerId: token.customerId
  });
  if (account == null) {
    throw new Error(`Account ${accountId} not found`);
  }

  account.set(removeNullish({ name, slackWebhooks, packagesWatched }));

  await account.save();

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

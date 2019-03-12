'use strict';

const Archetype = require('archetype');

const CreateAccountParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  },
  type: {
    $type: 'string',
    $required: true
  }
}).compile('CreateAccountParams');

module.exports = db => async function updateCustomer(params) {
  const {
    accessTokenId,
    type
  } = new CreateAccountParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  let customer = await db.model('Customer').findOne({ _id: token.customerId });
  if (customer == null) {
    throw new Error(`Customer ${token.customerId} not found`);
  }

  if (type !== 'GITHUB') {
    throw new Error('Can only create GitHub integrations');
  }

  const accountData = {
    type,
    name: `GitHub: ${customer.githubId}`,
    emails: [customer.email]
  };

  const account = await db.model('Account').create(accountData);

  customer = await db.collection('Customer').findOneAndUpdate(
    { _id: customer._id },
    { $addToSet: { accountIds: account._id } },
    { new: true }
  );

  return { account, customer };
};

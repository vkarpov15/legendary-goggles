const Archetype = require('archetype');

const GetAccountParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  }
}).compile('GetAccountParams');

module.exports = db => async function me(params) {
  const { accessTokenId } = new GetAccountParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });

  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  const customer = await db.model('Customer')
    .findOne({ _id: token.customerId });

  return { customer, accounts: customer.accounts, token };
};

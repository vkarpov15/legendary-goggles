const Archetype = require('archetype');

const GetAccountParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  }
}).compile('GetAccountParams');

module.exports = db => async function getAccount(params) {
  const { accessTokenId } = new GetAccountParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });

  const customer = await db.model('Customer')
    .findOne({ _id: token.customerId });

  return { customer, accounts: customer.accounts };
};

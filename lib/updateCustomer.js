const Archetype = require('archetype');
const mongodb = require('mongodb');

const UpdateCustomerParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  },
  firstName: { $type: 'string' },
  lastName: { $type: 'string' },
  email: { $type: 'string' }
}).compile('UpdateCustomerParams');

module.exports = db => async function updateCustomer(params) {
  const {
    accessTokenId,
    firstName,
    lastName,
    email
  } = new UpdateCustomerParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  const customer = await db.model('Customer').findOne({ _id: token.customerId });
  if (customer == null) {
    throw new Error(`Customer ${token.customerId} not found`);
  }

  customer.set(removeNullish({ firstName, lastName, email }));

  await customer.save();

  return { customer };
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

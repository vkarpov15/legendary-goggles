'use strict';

const Archetype = require('archetype');
const config = require('../.config');
const stripe = require('stripe')(config.stripe);

const UpdateStripeParams = new Archetype({
  accessTokenId: {
    $type: 'string',
    $required: true
  },
  stripeToken: {
    $type: 'string',
    $required: true
  }
}).compile('UpdateStripeParams');

module.exports = db => async function updateStripe(params) {
  const { accessTokenId, stripeToken } = new UpdateStripeParams(params);

  const token = await db.model('Token').findOne({ _id: accessTokenId });
  if (token == null) {
    throw new Error(`Token ${accessTokenId} not found`);
  }

  const customer = await db.model('Customer').findOne({ _id: token.customerId });
  if (customer == null) {
    throw new Error(`Customer ${token.customerId} not found`);
  }
  if (customer.email == null) {
    throw new Error('Please set your email address before setting your billing info');
  }

  if (customer.stripe.customerId == null) {
    let res = await stripe.customers.create({
      email: customer.email,
      description: customer._id.toString(),
      card: stripeToken
    });

    const card = res.cards ? res.cards.data[0] : res.sources.data[0];
    customer.stripe.customerId = res.id;
    customer.stripe.last4 = card.last4;

    res = await stripe.subscriptions.create({
      customer: customer.stripe.customerId,
      items: [{ plan: 'plan_Dw8E4Knwanvqtr', quantity: 1 }]
    });

    customer.stripe.subscriptionId = res.id;
  } else {
    const res = await stripe.customers.update(customer.stripe.customerId, {
      card: stripeToken
    });

    const card = res.cards ? res.cards.data[0] : res.sources.data[0];
    customer.stripe.last4 = card.last4;
  }

  await customer.save();

  return { customer };
};

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  slackId: String,
  githubId: String,
  accountIds: [mongoose.ObjectId],
  stripe: {
    customerId: String,
    subscriptionId: String,
    last4: String
  }
}, { timestamps: true });

customerSchema.virtual('accounts', {
  ref: 'Account',
  localField: 'accountIds',
  foreignField: '_id'
});

module.exports = customerSchema;

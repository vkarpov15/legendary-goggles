const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  slackId: String,
  accountIds: [mongoose.ObjectId]
}, { timestamps: true });

customerSchema.virtual('accounts', {
  ref: 'Account',
  localField: 'accountIds',
  foreignField: '_id'
});

module.exports = customerSchema;
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  accountIds: [mongoose.ObjectId]
}, { timestamps: true });

customerSchema.virtual('accounts', {
  ref: 'Account',
  localField: 'accountIds',
  foreignField: '_id'
});

module.exports = customerSchema;

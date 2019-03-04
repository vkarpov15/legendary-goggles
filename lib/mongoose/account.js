const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slackWebhooks: [String],
  packagesWatched: [String],
  reposWatched: [String],
  emails: [String],
  type: {
    type: String,
    enum: ['SLACK', 'GITHUB']
  }
}, { timestamps: true });

accountSchema.virtual('customer', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'accountIds'
});

module.exports = accountSchema;

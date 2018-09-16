const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slackWebhooks: [String],
  packagesWatched: [String]
}, { timestamps: true });

module.exports = accountSchema;

const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  packageId: { type: String, required: true },
  version: { type: String, required: true },
  dependencies: [[String]],
  license: String,
  publishedAt: { type: Date, required: true },
  changelog: String
}, { timestamps: true });

versionSchema.index({ packageId: 1, version: 1 }, { unique: true });

module.exports = versionSchema;

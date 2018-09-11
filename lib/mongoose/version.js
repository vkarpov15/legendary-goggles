const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  packageId: { type: String, required: true },
  version: { type: String, required: true },
  dependencies: { type: Map, of: String, required: true },
  license: String,
  publishedAt: { type: Date, required: true }
}, { timestamps: true });

versionSchema.index({ packageId: 1, version: 1 }, { unique: true });

module.exports = versionSchema;

const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  packageId: { type: String, required: true },
  version: { type: String, required: true },
  dependencies: [[String]],
  license: String,
  // Example: http://registry.npmjs.org/Graph has no publishedAt
  publishedAt: { type: Date },
  changelog: String,
  tagMessage: String
}, { timestamps: true });

versionSchema.index({ packageId: 1, version: 1 }, { unique: true });
versionSchema.index({ publishedAt: -1 });

versionSchema.virtual('package', {
  ref: 'Package',
  localField: 'packageId',
  foreignField: '_id',
  justOne: true
});

module.exports = versionSchema;

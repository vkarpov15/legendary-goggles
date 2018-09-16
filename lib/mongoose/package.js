const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  distTags: { type: Map, of: String, required: true },
  maintainers: [{
    name: { type: String, required: true },
    email: { type: String, required: true }
  }],
  repository: Object,
  license: String,
  description: String,
  versions: [String],
  changelogUrl: String
}, { timestamps: true });

module.exports = packageSchema;

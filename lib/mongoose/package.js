const mongoose = require('mongoose');

const githubInfoSchema = new mongoose.Schema({
  numStars: { type: Number, required: true }
}, { id: false, _id: false, versionKey: false });

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
  changelogUrl: String,
  github: githubInfoSchema
}, { timestamps: true });

module.exports = packageSchema;

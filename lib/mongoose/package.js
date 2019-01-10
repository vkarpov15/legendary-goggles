const mongoose = require('mongoose');

const githubInfoSchema = new mongoose.Schema({
  numStars: { type: Number, required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true }
}, { id: false, _id: false, versionKey: false, timestamps: true });

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
  github: githubInfoSchema,
  downloadsLastMonth: Number,
  downloadsMonth: { type: String },
  random: {
    type: Number,
    required: true,
    default: () => Math.random()
  }
}, { timestamps: true });

module.exports = packageSchema;

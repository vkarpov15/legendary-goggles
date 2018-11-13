const assert = require('assert');
const mongoose = require('mongoose');

const downloadStatsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    validate: v => assert.ok(v.match(/^\d{8}$/))
  }
}, { timestamps: true });

module.exports = downloadStatsSchema;

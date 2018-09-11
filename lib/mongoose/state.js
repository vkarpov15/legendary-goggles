const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  lastSequenceNumber: { type: Number, default: 4968206 }
}, { timestamps: true });

module.exports = stateSchema;

const mongoose = require('mongoose');

const sequenceNumberSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  packageId: { type: String, required: true },
  processed: {
    type: Boolean,
    required: true,
    default: false
  },
  random: {
    type: Number,
    required: true,
    default: () => Math.random()
  }
}, { timestamps: true });

module.exports = sequenceNumberSchema;

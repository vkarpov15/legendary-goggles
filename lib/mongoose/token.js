const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customerId: { type: mongoose.ObjectId, required: true }
}, { timestamps: true });

module.exports = tokenSchema;

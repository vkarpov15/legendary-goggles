const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  medium: { type: String, required: true },
  to: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = messageSchema;

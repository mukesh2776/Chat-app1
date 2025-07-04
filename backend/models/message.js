const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },   // username
  text: { type: String, required: true }    // message content
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
    
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },   // e.g. 'mukesh'
  email: { type: String, required: true, unique: true },     // e.g. 'mukesh@example.com'
  password: { type: String, required: true }                 // hashed password
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

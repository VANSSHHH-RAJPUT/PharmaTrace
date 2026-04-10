const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Actor', actorSchema);
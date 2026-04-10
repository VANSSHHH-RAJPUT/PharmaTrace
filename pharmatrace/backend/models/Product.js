const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  contractId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  batchNumber: { type: String, required: true },
  manufacturerName: { type: String, required: true },
  manufactureDate: { type: Number, required: true },
  expiryDate: { type: Number, required: true },
  imageUrl: String,
  description: String,
  metadataHash: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
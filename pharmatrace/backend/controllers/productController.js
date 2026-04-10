const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { contractId, name, batchNumber, manufacturerName, manufactureDate, expiryDate, imageUrl, description, metadataHash } = req.body;
    
    const product = new Product({
      contractId,
      name,
      batchNumber,
      manufacturerName,
      manufactureDate,
      expiryDate,
      imageUrl,
      description,
      metadataHash
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ contractId: id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
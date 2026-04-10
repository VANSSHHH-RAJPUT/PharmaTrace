const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

router.post('/', productController.createProduct);
router.get('/:id', productController.getProduct);
router.get('/', productController.getAllProducts);

module.exports = router;
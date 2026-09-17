const express = require('express');
const { getProducts, createProduct } = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', authenticateToken, requireAdmin, createProduct);

module.exports = router;

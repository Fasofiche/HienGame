const express = require('express');
const {
  addCodes,
  getInventory,
} = require('../controllers/inventoryController');
const {
  authenticateToken,
  requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, requireAdmin, addCodes);
router.get('/:productId', authenticateToken, requireAdmin, getInventory);

module.exports = router;

const express = require('express');

const {
  createPack,
  addProductToPack,
} = require('../controllers/packAdminController');

const {
  authenticateToken,
  requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  createPack
);

router.post(
  '/:packId/items',
  authenticateToken,
  requireAdmin,
  addProductToPack
);

module.exports = router;

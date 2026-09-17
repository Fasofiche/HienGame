const express = require('express');

const {
  getMyEntitlements,
  checkProductOwnership,
} = require('../controllers/userController');

const {
  authenticateToken,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/entitlements',
  authenticateToken,
  getMyEntitlements
);

router.get(
  '/products/:productId/ownership',
  authenticateToken,
  checkProductOwnership
);

module.exports = router;

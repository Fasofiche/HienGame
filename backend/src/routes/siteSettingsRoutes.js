const express = require('express');

const {
  getSiteSettings,
  updateSiteSettings,
} = require('../controllers/siteSettingsController');

const {
  authenticateToken,
  requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSiteSettings);

router.put(
  '/',
  authenticateToken,
  requireAdmin,
  updateSiteSettings
);

module.exports = router;

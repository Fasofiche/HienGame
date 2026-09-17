const express = require('express');
const { getPacks } = require('../controllers/packController');

const router = express.Router();

router.get('/', getPacks);

module.exports = router;

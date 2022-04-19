const express = require('express');
const router = express.Router();

router.get('/today', require('./personalityTodayGET'));
router.get('/new', require('./personalityNewGET'));

module.exports = router;

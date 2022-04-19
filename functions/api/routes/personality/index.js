const express = require('express');
const router = express.Router();

router.get('/today', require('./personalityTodayGET'));

module.exports = router;

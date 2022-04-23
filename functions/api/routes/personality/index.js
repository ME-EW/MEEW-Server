const express = require('express');
const router = express.Router();

router.get('/today', require('./personalityTodayGET'));
router.get('/new', require('./personalityNewGET'));
router.get('/me', require('./personalityMeGET'));
router.patch('/check', require('./personalityCheckPATCH'));
router.post('/today', require('./personalityTodayPOST'));

module.exports = router;

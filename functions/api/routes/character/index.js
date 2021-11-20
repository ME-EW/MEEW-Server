const express = require('express');
const router = express.Router();

router.get('/me/:userId', require('./characterMeGET'));
router.get('/list', require('./characterListGET'));

module.exports = router;

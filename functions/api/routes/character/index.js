const express = require('express');
const router = express.Router();

router.get('/me/:characterID', require('./characterMeGET'));
router.get('/list', require('./characterListGET'));

module.exports = router;

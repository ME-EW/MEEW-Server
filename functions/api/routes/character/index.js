const express = require('express');
const router = express.Router();

router.get('/me/:characterID', require('./characterMeGET'));

module.exports = router;

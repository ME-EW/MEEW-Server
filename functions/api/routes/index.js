const express = require('express');
const router = express.Router();

router.use('/character', require('./character'));

module.exports = router;

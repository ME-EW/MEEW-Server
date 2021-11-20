const express = require('express');
const router = express.Router();

router.use('/character', require('./character'));
router.use('/result', require('./result'));
router.use('/user', require('./user'));

module.exports = router;

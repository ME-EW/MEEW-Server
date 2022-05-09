const express = require('express');
const router = express.Router();

router.use('/auth', require('./user'));
router.use('/personality', require('./personality'));

module.exports = router;

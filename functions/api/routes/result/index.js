const express = require('express');
const router = express.Router();

router.post('', require('./resultPOST'));

module.exports = router;

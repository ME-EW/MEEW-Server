const express = require('express');
const router = express.Router();

router.post('', require('./resultPOST'));
router.get('/:userID', require('./resultGET'));

module.exports = router;

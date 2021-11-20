const express = require('express');
const router = express.Router();

router.post('/:userID', require('./resultPOST'));
router.get('/:userID', require('./resultGET'));

module.exports = router;

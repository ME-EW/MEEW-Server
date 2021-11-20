const express = require('express');
const router = express.Router();

router.post('/:userId/character', require('./userCharacterPOST'));

module.exports = router;
const express = require('express');
const router = express.Router();

router.get('/:userId', require('./userTodoListGET'));
router.post('/:userId/character', require('./userCharacterPOST'));

module.exports = router;
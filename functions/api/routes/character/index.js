const express = require('express');
const router = express.Router();

router.get('/list', require('./characterListGET'));

module.exports = router;
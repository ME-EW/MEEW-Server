const express = require('express');
const router = express.Router();

router.post('/signup', require('./userSignupPOST'));
router.post('/login', require('./userLoginPOST'));
router.get('/nickname/check', require('./userNicknameCheckGET'));

module.exports = router;
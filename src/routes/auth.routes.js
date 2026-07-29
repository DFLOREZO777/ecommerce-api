const express = require('express');
const { register, login, googleLogin, verifyOtp } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/verify-otp', verifyOtp);

module.exports = router;

// routes/authRoutes.js
const express = require('express');
const router = express.Router();
// const {  } = require('../controller/authController');
const { signup, login, sendOtp, verifyOtp, setPassword, googleLogin } = require('../controller/authController');


// router.post('/signup', signup);
router.post('/login', login);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/set-password', setPassword);

router.post('/google-login', googleLogin);

module.exports = router;

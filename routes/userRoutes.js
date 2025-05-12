const express = require('express');
const auth = require('../middleware/auth');
const { getLoggedInApplicant } = require('../controller/userController');
const router = express.Router();


router.get("/",auth, getLoggedInApplicant )
module.exports = router;

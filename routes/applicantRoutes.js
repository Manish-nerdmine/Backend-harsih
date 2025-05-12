const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllApplicants, createApplicant } = require('../controller/applicantController');

router.get('/', auth , getAllApplicants);
router.post('/',auth, createApplicant);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllJobPositions, createJobPosition } = require('../controller/jobController');


router.get('/',  getAllJobPositions);
router.post('/', createJobPosition);

module.exports = router;

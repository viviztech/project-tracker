const express = require('express');
const router = express.Router();
const { getRisks, createRisk, updateRisk, deleteRisk } = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getRisks)
    .post(protect, createRisk);

router.route('/:id')
    .put(protect, updateRisk)
    .delete(protect, deleteRisk);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getComments)
    .post(protect, createComment);

router.route('/:id')
    .delete(protect, deleteComment);

module.exports = router;

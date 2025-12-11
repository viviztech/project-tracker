const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    getArchivedProjects
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/archived').get(protect, getArchivedProjects);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, admin, deleteProject);
router.route('/:id/archive').put(protect, admin, archiveProject);
router.route('/:id/unarchive').put(protect, admin, unarchiveProject);

module.exports = router;

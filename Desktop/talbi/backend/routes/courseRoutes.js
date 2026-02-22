const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/auth');

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authMiddleware, courseController.createCourse);

module.exports = router;

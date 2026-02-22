const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, enrollmentController.enrollCourse);

module.exports = router;

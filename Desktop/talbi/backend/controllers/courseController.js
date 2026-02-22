const pool = require('../config/db');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const { language, search } = req.query;
        let query = 'SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE 1=1';
        const params = [];

        if (language) {
            params.push(language);
            query += ` AND c.language = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`;
        }

        query += ' ORDER BY c.created_at DESC';

        const courses = await pool.query(query, params);
        res.json(courses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await pool.query('SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = $1', [req.params.id]);
        if (course.rows.length === 0) return res.status(404).json({ msg: 'Course not found' });

        // Get reviews
        const reviews = await pool.query('SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.course_id = $1 ORDER BY r.created_at DESC', [req.params.id]);

        res.json({
            ...course.rows[0],
            reviews: reviews.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a course (Admin/Instructor)
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({ msg: 'Not authorized to create courses' });
        }

        const { title, description, content, price, language } = req.body;

        const newCourse = await pool.query(
            'INSERT INTO courses (instructor_id, title, description, content, price, language) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, title, description, content, price, language]
        );

        res.json(newCourse.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getCourses, getCourseById, createCourse };

const pool = require('../config/db');

// @desc    Enroll in a course / Mock Payment
// @route   POST /api/enrollments
// @access  Private
const enrollCourse = async (req, res) => {
    try {
        const { course_id, payment_method } = req.body;
        const user_id = req.user.id;

        // Check if course exists
        const course = await pool.query('SELECT * FROM courses WHERE id = $1', [course_id]);
        if (course.rows.length === 0) return res.status(404).json({ msg: 'Course not found' });

        // Check if already enrolled
        const existing = await pool.query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [user_id, course_id]);
        if (existing.rows.length > 0) return res.status(400).json({ msg: 'Already enrolled in this course' });

        // Mock payment processing
        console.log(`Processing mock payment of ${course.rows[0].price} using ${payment_method}`);
        const payment_status = 'completed'; // Assume successful payment

        // Create enrollment
        const newEnrollment = await pool.query(
            'INSERT INTO enrollments (user_id, course_id, payment_status, amount) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, course_id, payment_status, course.rows[0].price]
        );

        res.json(newEnrollment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { enrollCourse };

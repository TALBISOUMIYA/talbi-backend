const pool = require('../config/db');

// @desc    Get user profile with enrolled courses
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);

        const enrollments = await pool.query(`
      SELECT e.*, c.title, c.description, c.price 
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      WHERE e.user_id = $1
    `, [req.user.id]);

        const uploadedFiles = await pool.query('SELECT * FROM files WHERE user_id = $1', [req.user.id]);

        res.json({
            user: user.rows[0],
            enrollments: enrollments.rows,
            files: uploadedFiles.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getProfile };

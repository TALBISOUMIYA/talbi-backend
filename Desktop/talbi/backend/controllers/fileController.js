const pool = require('../config/db');

// @desc    Upload a file for a course
// @route   POST /api/files
// @access  Private
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const { course_id } = req.body;
        const file_name = req.file.originalname;
        const file_path = req.file.path.replace(/\\/g, '/'); // Normalize path for DB

        const newFile = await pool.query(
            'INSERT INTO files (user_id, course_id, file_name, file_path) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, course_id || null, file_name, file_path]
        );

        res.json(newFile.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { uploadFile };

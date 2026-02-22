const pool = require('../config/db');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const sender_id = req.user.id;

        if (!receiver_id || !content) {
            return res.status(400).json({ msg: 'Please provide receiver_id and content' });
        }

        const newMessage = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [sender_id, receiver_id, content]
        );

        // Also create a notification for the receiver
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [receiver_id, `You have a new message from user ${sender_id}`]
        );

        res.json(newMessage.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:other_user_id
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { other_user_id } = req.params;
        const user_id = req.user.id;

        const messages = await pool.query(
            `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY sent_at ASC`,
            [user_id, other_user_id]
        );

        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { sendMessage, getMessages };

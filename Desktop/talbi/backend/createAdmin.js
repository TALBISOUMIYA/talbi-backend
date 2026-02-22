const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createAdmin() {
    try {
        const email = 'admin@example.com';
        const password = 'password123';

        // Check if user exists
        let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            console.log('Admin account already exists.');
            pool.end();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', $1, $2, 'admin')",
            [email, hashedPassword]
        );

        console.log('Successfully created admin account!');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        pool.end();
    }
}

createAdmin();

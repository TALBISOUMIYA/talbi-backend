const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createUser() {
    try {
        console.log('\n--- إنشاء مستخدم جديد (New User) ---');
        const name = await question('الاسم (Name): ');
        const email = await question('البريد الإلكتروني (Email): ');
        const password = await question('كلمة المرور (Password): ');
        let role = await question('الصلاحية (student, instructor, admin) [student]: ');

        if (!role) role = 'student';

        // Check if user exists
        let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            console.log('\n❌ خطأ: هذا البريد الإلكتروني مسجل مسبقاً.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
            [name, email, hashedPassword, role]
        );

        console.log('\n✅ تمت إضافة المستخدم بنجاح!');
        console.log(`الاسم: ${name} | البريد: ${email} | الصلاحية: ${role}`);
    } catch (error) {
        console.error('❌ حدث خطأ:', error);
    } finally {
        pool.end();
        rl.close();
    }
}

createUser();

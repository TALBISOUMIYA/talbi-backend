const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seedCourses() {
    try {
        // Check if admin exists to get ID
        const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@example.com'");
        if (adminRes.rows.length === 0) {
            console.log("Admin account not found. Please run createAdmin.js first.");
            return;
        }
        const adminId = adminRes.rows[0].id;

        // Check if courses already exist to avoid duplicates
        const coursesRes = await pool.query("SELECT COUNT(*) FROM courses");
        if (parseInt(coursesRes.rows[0].count) > 0) {
            console.log("Courses already exist in the database. Skipping seeding.");
            return;
        }

        console.log("Adding sample courses...");

        const sampleCourses = [
            {
                title: "أساسيات تطوير الويب باللغة العربية",
                description: "دورة شاملة لتعلم أساسيات HTML و CSS و JavaScript للمبتدئين وبناء أول موقع إلكتروني خاص بك.",
                content: "محتوى الدورة سيتضمن فيديوهات وملفات تدريبية على HTML, CSS, JS...",
                price: 29.99,
                language: "Arabic"
            },
            {
                title: "Advanced React Patterns & State Management",
                description: "Master complex React applications using Hooks, Context API, Redux, and modern performance optimization techniques.",
                content: "Content includes advanced component patterns, custom hooks, and state management strategies...",
                price: 49.99,
                language: "English"
            },
            {
                title: "Développement Backend avec Node.js",
                description: "Apprenez à créer des API RESTful robustes et sécurisées en utilisant Node.js, Express, et PostgreSQL.",
                content: "Le contenu comprend la création de serveurs, la gestion des bases de données et l'authentification JWT...",
                price: 39.99,
                language: "French"
            }
        ];

        for (const course of sampleCourses) {
            await pool.query(
                "INSERT INTO courses (instructor_id, title, description, content, price, language) VALUES ($1, $2, $3, $4, $5, $6)",
                [adminId, course.title, course.description, course.content, course.price, course.language]
            );
        }

        console.log("Successfully added 3 sample courses!");

    } catch (error) {
        console.error('Error seeding courses:', error);
    } finally {
        pool.end();
    }
}

seedCourses();

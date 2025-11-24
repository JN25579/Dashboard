const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function waitForDb(pool, retries = 10, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await pool.getConnection();
            conn.release();
            console.log('MySQL connection successful!');
            return;
        } catch (err) {
            console.warn(`MySQL not ready, retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw new Error('Could not connect to MySQL after multiple attempts');
}

(async () => {
    await waitForDb(pool);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(session({
        secret: 'your-secret',
        resave: false,
        saveUninitialized: true
    }));

    app.use('/static', express.static(path.join(__dirname, 'static')));

    app.get('/', (req, res) => {
        if (req.session.userId) {
            res.sendFile(path.join(__dirname, 'views/dashboard.html'));
        } else {
            res.sendFile(path.join(__dirname, 'views/login.html'));
        }
    });

    app.post('/signup', async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const hashed = await bcrypt.hash(password, 10);
            await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hashed]);
            res.json({ success: true });
        } catch (err) {
            console.error('Signup error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });
    app.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(400).json({ error: 'Invalid email or password' });

            req.session.userId = user.id;
            res.json({ success: true });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) return res.status(500).json({ error: 'Logout failed' });
            res.json({ success: true });
        });
    });

    return app;
}

if (require.main === module) {
    (async () => {
        const app = createApp();
        const PORT = process.env.CONTAINER_PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })();
}
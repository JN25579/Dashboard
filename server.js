require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");

function createApp(opts = {}) {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  // Serve static assets (CSS/JS/images) from the static/ folder.
  // In production we apply long cache lifetimes for fingerprinted assets (query param `v=`)
  app.use(
    "/static",
    express.static(path.join(__dirname, "static"), {
      setHeaders: (res, filePath) => {
        if (process.env.NODE_ENV === "production") {
          const reqUrl =
            res.req && res.req.originalUrl ? res.req.originalUrl : "";
          if (reqUrl.includes("v=")) {
            // Fingerprinted asset — safe to cache for a long time
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable"
            );
          } else {
            // Non-fingerprinted assets — short cache
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        }
      },
    })
  );
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "keyboard cat",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );

  const pool =
    opts.pool ||
    mysql.createPool({
      host: process.env.DB_HOST || "db",
      port: process.env.DB_PORT || 3306,
      user: process.env.MYSQL_USER || "dashboard_user",
      password: process.env.MYSQL_PASSWORD || "password",
      database: process.env.MYSQL_DATABASE || "dashboard_db",
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

  app.get("/", (req, res) => {
    if (req.session && req.session.userId) {
      return res.sendFile(path.join(__dirname, "views", "dashboard.html"));
    }
    res.sendFile(path.join(__dirname, "views", "login.html"));
  });

  // Server-side validation for login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({ error: "Invalid password" });
    }
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, email, password_hash FROM users WHERE email = ?",
        [email]
      );
      if (!rows || rows.length === 0)
        return res.status(401).json({ error: "Invalid credentials" });
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash || "");
      if (!match) return res.status(401).json({ error: "Invalid credentials" });
      req.session.userId = user.id;
      req.session.userName = user.name;
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/logout", (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  return app;
}

module.exports = { createApp };

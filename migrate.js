require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const dbHost = process.env.DB_HOST || "db";
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.MYSQL_USER || "dashboard_user";
  const dbPass = process.env.MYSQL_PASSWORD || "password";
  const dbName = process.env.MYSQL_DATABASE || "dashboard_db";

  // Retry connecting to the database a few times while it comes up
  const maxAttempts = 10;
  let conn;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      conn = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPass,
        database: dbName,
      });
      break;
    } catch (err) {
      console.log(
        `DB connect attempt ${attempt} failed: ${err.code || err.message}`
      );
      if (attempt === maxAttempts) throw err;
      await wait(2000);
    }
  }

  const [tables] = await conn.query(
    "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
    [dbName]
  );
  if (!tables || tables[0].cnt === 0) {
    console.log("No users table found in database; skipping user migrations.");
    await conn.end();
    return;
  }

  const [cols] = await conn.query(
    "SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users' AND column_name = 'password_hash'",
    [dbName]
  );
  if (!cols || cols[0].cnt === 0) {
    console.log("Adding password_hash column to users table");
    await conn.query(
      "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL"
    );
  } else {
    console.log("password_hash column already exists");
  }

  const defaultPassword = "secret";
  const hashed = await bcrypt.hash(defaultPassword, 10);
  await conn.query(
    "UPDATE users SET password_hash = ? WHERE password_hash IS NULL",
    [hashed]
  );

  console.log(
    "Migration complete. Default password for existing users is: " +
      defaultPassword
  );
  await conn.end();
})().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

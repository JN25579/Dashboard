const request = require("supertest");
const { createApp } = require("../server");
const bcrypt = require("bcryptjs");

// Helper to create a fake pool that matches mysql2/promise interface for execute
function createFakePool(users = []) {
  return {
    execute: async (sql, params) => {
      const email = params[0];
      const found = users.filter((u) => u.email === email);
      return [found];
    },
  };
}
test("returns 400 for invalid email", async () => {
  const app = createApp({ pool: createFakePool() });
  const res = await request(app)
    .post("/login")
    .send({ email: "invalid", password: "pw" });
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});

test("returns 400 for short password", async () => {
  const app = createApp({ pool: createFakePool() });
  const res = await request(app)
    .post("/login")
    .send({ email: "a@b.com", password: "1" });
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});

test("returns 401 for unknown user", async () => {
  const pool = createFakePool([]);
  const app = createApp({ pool });
  const res = await request(app)
    .post("/login")
    .send({ email: "noone@example.com", password: "secret" });
  expect(res.status).toBe(401);
});

test("returns 401 for incorrect password", async () => {
  const hashed = await bcrypt.hash("rightpw", 10);
  const pool = createFakePool([
    { id: 1, name: "Test", email: "test@example.com", password_hash: hashed },
  ]);
  const app = createApp({ pool });
  const res = await request(app)
    .post("/login")
    .send({ email: "test@example.com", password: "wrong" });
  expect(res.status).toBe(401);
});

test("returns success for valid credentials", async () => {
  const hashed = await bcrypt.hash("secret", 10);
  const pool = createFakePool([
    {
      id: 2,
      name: "Alice",
      email: "alice@example.com",
      password_hash: hashed,
    },
  ]);
  const app = createApp({ pool });
  const res = await request(app)
    .post("/login")
    .send({ email: "alice@example.com", password: "secret" });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("success", true);
});

/**
 * Dutch Accounting Academy — servidor de progresso
 *
 * Zero dependências: usa apenas módulos nativos do Node (http, sqlite, crypto).
 * Requer Node 22.5 ou superior (o módulo node:sqlite é embutido).
 *
 * Arrancar:  npm run server     → http://localhost:3001
 * Base de dados: server/daa.db  (ficheiro SQLite criado automaticamente)
 */

import http from "node:http";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "daa.db");

/* ---------------------------------------------------------------- base de dados */

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL,
    salt       TEXT NOT NULL,
    hash       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data       TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  );
`);

/* ---------------------------------------------------------------- utilitários */

const now = () => new Date().toISOString();

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, expected) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

function userFromRequest(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const row = db
    .prepare("SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?")
    .get(token);
  return row || null;
}

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error("payload demasiado grande"));
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

/* ---------------------------------------------------------------- rotas */

const routes = {
  "POST /api/register": async (req, res) => {
    const { username, password } = await readBody(req);
    if (!username || username.trim().length < 3)
      return send(res, 400, { error: "O nome de utilizador precisa de pelo menos 3 caracteres." });
    if (!password || password.length < 6)
      return send(res, 400, { error: "A palavra-passe precisa de pelo menos 6 caracteres." });

    const name = username.trim().toLowerCase();
    if (db.prepare("SELECT 1 FROM users WHERE username = ?").get(name))
      return send(res, 409, { error: "Esse nome de utilizador já existe." });

    const { salt, hash } = hashPassword(password);
    const info = db
      .prepare("INSERT INTO users (username, salt, hash, created_at) VALUES (?, ?, ?, ?)")
      .run(name, salt, hash, now());
    const userId = Number(info.lastInsertRowid);

    const token = newToken();
    db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(token, userId, now());
    send(res, 201, { token, username: name });
  },

  "POST /api/login": async (req, res) => {
    const { username, password } = await readBody(req);
    const name = (username || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(name);
    if (!user || !verifyPassword(password || "", user.salt, user.hash))
      return send(res, 401, { error: "Nome de utilizador ou palavra-passe incorretos." });

    const token = newToken();
    db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(token, user.id, now());
    send(res, 200, { token, username: user.username });
  },

  "POST /api/logout": async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    send(res, 200, { ok: true });
  },

  "GET /api/progress": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const row = db.prepare("SELECT data, updated_at FROM progress WHERE user_id = ?").get(user.id);
    send(res, 200, {
      username: user.username,
      progress: row ? JSON.parse(row.data) : null,
      updatedAt: row ? row.updated_at : null,
    });
  },

  "PUT /api/progress": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const { progress } = await readBody(req);
    if (!progress || typeof progress !== "object")
      return send(res, 400, { error: "Progresso em falta." });

    db.prepare(`
      INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).run(user.id, JSON.stringify(progress), now());

    send(res, 200, { ok: true, updatedAt: now() });
  },
};

/* ---------------------------------------------------------------- servidor */

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host}`);
  const handler = routes[`${req.method} ${url.pathname}`];
  if (!handler) return send(res, 404, { error: "Rota não encontrada." });

  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    send(res, 500, { error: "Erro interno do servidor." });
  }
});

server.listen(PORT, () => {
  console.log(`Dutch Accounting Academy — API a correr em http://localhost:${PORT}`);
  console.log(`Base de dados SQLite: ${DB_PATH}`);
});

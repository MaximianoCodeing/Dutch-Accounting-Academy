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

/* ---------------------------------------------------------------- tradução automática
   Usa a API gratuita da MyMemory (sem chave). Tem um limite de ~500
   carateres por pedido, por isso divide-se o texto em frases. Se algo
   falhar (limite diário, sem rede, etc.), devolve-se o texto original
   em vez de rebentar — o utilizador fica só sem tradução dessa vez.
*/
const LANGS = ["pt", "en", "nl"];

async function translateChunk(text, source, target) {
  if (!text || !text.trim()) return "";
  if (source === target) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || /MYMEMORY WARNING|INVALID/.test(translated)) return text;
    return translated;
  } catch {
    return text;
  }
}

async function translateText(text, source, target) {
  if (!text || !text.trim()) return "";
  if (source === target) return text;
  // divide em frases para respeitar o limite de carateres por pedido
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let buffer = "";
  for (const s of sentences) {
    if ((buffer + s).length > 450) {
      if (buffer) chunks.push(buffer);
      buffer = s;
    } else {
      buffer += s;
    }
  }
  if (buffer) chunks.push(buffer);

  const translatedChunks = [];
  for (const chunk of chunks) {
    translatedChunks.push(await translateChunk(chunk, source, target));
  }
  return translatedChunks.join(" ").trim();
}

async function translateToAll(text, source) {
  const out = {};
  for (const lang of LANGS) {
    out[lang] = lang === source ? text : await translateText(text, source, lang);
  }
  return out;
}

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

  CREATE TABLE IF NOT EXISTS custom_courses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_name  TEXT NOT NULL,
    data        TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS custom_tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_name  TEXT NOT NULL,
    data        TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS custom_lessons (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_name  TEXT NOT NULL,
    course_id   TEXT NOT NULL,
    data        TEXT NOT NULL,
    created_at  TEXT NOT NULL
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
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
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

  /* ---- conteúdo personalizado: cursos ---- */
  "GET /api/custom-courses": async (req, res) => {
    const rows = db.prepare("SELECT id, owner_name, data, created_at FROM custom_courses ORDER BY id ASC").all();
    send(res, 200, { courses: rows.map((r) => ({ id: r.id, ownerName: r.owner_name, createdAt: r.created_at, ...JSON.parse(r.data) })) });
  },

  "POST /api/custom-courses": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const { course } = await readBody(req);
    if (!course || typeof course !== "object" || !course.title)
      return send(res, 400, { error: "Curso inválido." });

    const source = LANGS.includes(course.sourceLang) ? course.sourceLang : "pt";

    const translatedCourse = {
      title: await translateToAll(course.title, source),
      icon: course.icon,
      lessons: [],
    };
    for (const lesson of course.lessons || []) {
      translatedCourse.lessons.push({
        title: await translateToAll(lesson.title, source),
        theory: await translateToAll(lesson.theory, source),
        flashcard: {
          front: await translateToAll(lesson.flashcard?.front, source),
          back: await translateToAll(lesson.flashcard?.back, source),
        },
        quiz: {
          q: await translateToAll(lesson.quiz?.q, source),
          options: await Promise.all((lesson.quiz?.options || []).map((o) => translateToAll(o, source))),
          answer: lesson.quiz?.answer ?? 0,
        },
      });
    }

    const info = db
      .prepare("INSERT INTO custom_courses (owner_id, owner_name, data, created_at) VALUES (?, ?, ?, ?)")
      .run(user.id, user.username, JSON.stringify(translatedCourse), now());
    send(res, 201, { id: Number(info.lastInsertRowid) });
  },

  "DELETE /api/custom-courses": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = Number(url.searchParams.get("id"));
    if (!id) return send(res, 400, { error: "ID em falta." });

    const row = db.prepare("SELECT owner_id FROM custom_courses WHERE id = ?").get(id);
    if (!row) return send(res, 404, { error: "Curso não encontrado." });
    if (row.owner_id !== user.id) return send(res, 403, { error: "Sem permissão para apagar este curso." });

    db.prepare("DELETE FROM custom_courses WHERE id = ?").run(id);
    send(res, 200, { ok: true });
  },

  /* ---- conteúdo personalizado: tarefas do Modo Empresa ---- */
  "GET /api/custom-tasks": async (req, res) => {
    const rows = db.prepare("SELECT id, owner_name, data, created_at FROM custom_tasks ORDER BY id ASC").all();
    send(res, 200, { tasks: rows.map((r) => ({ id: r.id, ownerName: r.owner_name, createdAt: r.created_at, ...JSON.parse(r.data) })) });
  },

  "POST /api/custom-tasks": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const { task } = await readBody(req);
    if (!task || typeof task !== "object" || !task.title)
      return send(res, 400, { error: "Tarefa inválida." });

    const source = LANGS.includes(task.sourceLang) ? task.sourceLang : "pt";

    const translatedTask = {
      title: await translateToAll(task.title, source),
      xp: task.xp,
      icon: task.icon,
      brief: await translateToAll(task.brief, source),
    };

    const info = db
      .prepare("INSERT INTO custom_tasks (owner_id, owner_name, data, created_at) VALUES (?, ?, ?, ?)")
      .run(user.id, user.username, JSON.stringify(translatedTask), now());
    send(res, 201, { id: Number(info.lastInsertRowid) });
  },

  "DELETE /api/custom-tasks": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = Number(url.searchParams.get("id"));
    if (!id) return send(res, 400, { error: "ID em falta." });

    const row = db.prepare("SELECT owner_id FROM custom_tasks WHERE id = ?").get(id);
    if (!row) return send(res, 404, { error: "Tarefa não encontrada." });
    if (row.owner_id !== user.id) return send(res, 403, { error: "Sem permissão para apagar esta tarefa." });

    db.prepare("DELETE FROM custom_tasks WHERE id = ?").run(id);
    send(res, 200, { ok: true });
  },

  /* ---- lições avulsas: adicionadas a QUALQUER curso já existente,
     seja um dos módulos de origem (ex.: "ifrs") ou um curso personalizado ---- */
  "GET /api/custom-lessons": async (req, res) => {
    const rows = db.prepare("SELECT id, owner_name, course_id, data, created_at FROM custom_lessons ORDER BY id ASC").all();
    send(res, 200, {
      lessons: rows.map((r) => ({ id: r.id, ownerName: r.owner_name, courseId: r.course_id, createdAt: r.created_at, ...JSON.parse(r.data) })),
    });
  },

  "POST /api/custom-lessons": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const { lesson } = await readBody(req);
    if (!lesson || typeof lesson !== "object" || !lesson.title || !lesson.courseId)
      return send(res, 400, { error: "Lição inválida." });

    const source = LANGS.includes(lesson.sourceLang) ? lesson.sourceLang : "pt";
    const translatedLesson = {
      title: await translateToAll(lesson.title, source),
      theory: await translateToAll(lesson.theory, source),
      flashcard: {
        front: await translateToAll(lesson.flashcard?.front, source),
        back: await translateToAll(lesson.flashcard?.back, source),
      },
      quiz: {
        q: await translateToAll(lesson.quiz?.q, source),
        options: await Promise.all((lesson.quiz?.options || []).map((o) => translateToAll(o, source))),
        answer: lesson.quiz?.answer ?? 0,
      },
    };

    const info = db
      .prepare("INSERT INTO custom_lessons (owner_id, owner_name, course_id, data, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(user.id, user.username, lesson.courseId, JSON.stringify(translatedLesson), now());
    send(res, 201, { id: Number(info.lastInsertRowid) });
  },

  "DELETE /api/custom-lessons": async (req, res) => {
    const user = userFromRequest(req);
    if (!user) return send(res, 401, { error: "Sessão inválida." });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = Number(url.searchParams.get("id"));
    if (!id) return send(res, 400, { error: "ID em falta." });

    const row = db.prepare("SELECT owner_id FROM custom_lessons WHERE id = ?").get(id);
    if (!row) return send(res, 404, { error: "Lição não encontrada." });
    if (row.owner_id !== user.id) return send(res, 403, { error: "Sem permissão para apagar esta lição." });

    db.prepare("DELETE FROM custom_lessons WHERE id = ?").run(id);
    send(res, 200, { ok: true });
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

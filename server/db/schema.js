const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'atlas.db');

let db = null;
let initPromise = null;

function getDb() {
  if (db) return db;
  throw new Error('Database not initialized. Call initDb() first.');
}

async function initDb() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    db.run('PRAGMA foreign_keys = ON');
    migrate(db);
    saveDb();
    return db;
  })();

  return initPromise;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function migrate(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination TEXT NOT NULL,
      origin TEXT DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'planned' CHECK(status IN ('planned','booked','completed')),
      purpose TEXT DEFAULT 'leisure',
      airline TEXT DEFAULT '',
      flight_id TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS points_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_name TEXT NOT NULL UNIQUE,
      balance INTEGER DEFAULT 0,
      cpp REAL DEFAULT 1.0,
      expiration_date TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      target_price REAL NOT NULL,
      current_price REAL,
      active INTEGER DEFAULT 1,
      last_checked TEXT,
      date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS budget_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT DEFAULT 'actual' CHECK(type IN ('planned','actual')),
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS points_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      transaction_type TEXT NOT NULL CHECK(transaction_type IN ('earned','redeemed')),
      description TEXT DEFAULT '',
      date TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// Helper functions to make sql.js easier to use like better-sqlite3
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
  const changes = db.getRowsModified();
  return { lastInsertRowid: lastId, changes };
}

module.exports = { getDb, initDb, all, get, run, saveDb };

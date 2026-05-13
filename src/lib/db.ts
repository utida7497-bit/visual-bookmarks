import { sql } from '@vercel/postgres';
import Database from 'better-sqlite3';
import path from 'path';

// クラウド環境（Vercel）かどうかを判定
const isCloud = process.env.POSTGRES_URL !== undefined;

let sqliteDB: any;
if (!isCloud) {
  const dbPath = path.resolve(process.cwd(), 'data.db');
  sqliteDB = new Database(dbPath);
}

// 共通のデータベース操作インターフェース
export const db = {
  async query(query: string, params: any[] = []) {
    if (isCloud) {
      // Vercel Postgres (Cloud)
      return sql.query(query.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    } else {
      // SQLite (Local)
      return sqliteDB.prepare(query).all(...params);
    }
  },
  
  async execute(query: string, params: any[] = []) {
    if (isCloud) {
      // Vercel Postgres (Cloud)
      return sql.query(query.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    } else {
      // SQLite (Local)
      return sqliteDB.prepare(query).run(...params);
    }
  },

  async get(query: string, params: any[] = []) {
    if (isCloud) {
      const { rows } = await sql.query(query.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      return rows[0];
    } else {
      return sqliteDB.prepare(query).get(...params);
    }
  }
};

// 初期化スクリプト
export async function initDB() {
  const createGroupsTable = `
    CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createBookmarksTable = `
    CREATE TABLE IF NOT EXISTS bookmarks (
      id SERIAL PRIMARY KEY,
      group_id INTEGER,
      url TEXT NOT NULL,
      title TEXT,
      image_url TEXT,
      summary TEXT,
      memo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (isCloud) {
    await sql.query(createGroupsTable);
    await sql.query(createBookmarksTable);
    await sql.query("INSERT INTO groups (name) VALUES ('未分類') ON CONFLICT (name) DO NOTHING");
  } else {
    // SQLite用 (SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT)
    sqliteDB.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER,
        url TEXT NOT NULL,
        title TEXT,
        image_url TEXT,
        summary TEXT,
        memo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    sqliteDB.prepare("INSERT OR IGNORE INTO groups (name) VALUES (?)").run('未分類');
  }
}

export default db;

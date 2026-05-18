import { sql as vercelSql } from '@vercel/postgres';
import path from 'path';

// クラウド環境（Vercel）かどうかを判定 (Neon対応)
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
const isCloud = process.env.POSTGRES_URL !== undefined;

export { isCloud };
export const sql = vercelSql;

let sqliteDB: any;

// クラウド環境では better-sqlite3 をインポートしないようにする
async function getSQLite() {
  if (isCloud) return null;
  if (sqliteDB) return sqliteDB;
  const Database = (await import('better-sqlite3')).default;
  const dbPath = path.resolve(process.cwd(), 'data.db');
  sqliteDB = new Database(dbPath);
  return sqliteDB;
}

export const db = {
  async query(query: string, params: any[] = []) {
    const sdb = await getSQLite();
    return sdb.prepare(query).all(...params);
  },
  
  async execute(query: string, params: any[] = []) {
    const sdb = await getSQLite();
    return sdb.prepare(query).run(...params);
  },

  async get(query: string, params: any[] = []) {
    const sdb = await getSQLite();
    return sdb.prepare(query).get(...params);
  }
};

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
    // Vercel Postgres Native (sql tagged template)
    await vercelSql.query(createGroupsTable);
    await vercelSql.query(createBookmarksTable);
    await vercelSql.query("INSERT INTO groups (name) VALUES ('未分類') ON CONFLICT (name) DO NOTHING");
  } else {
    const sdb = await getSQLite();
    sdb.exec(`
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
    sdb.prepare("INSERT OR IGNORE INTO groups (name) VALUES (?)").run('未分類');
  }
}

export default db;

import { sql } from '@vercel/postgres';
import path from 'path';

// クラウド環境（Vercel）かどうかを判定
const isCloud = process.env.POSTGRES_URL !== undefined;

let sqliteDB: any;

// 修正：クラウド環境では better-sqlite3 をインポートしないようにする
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
    try {
      if (isCloud) {
        const { rows } = await sql.query(query.replace(/\?/g, (_, i) => `$${i + 1}`), params);
        return rows;
      } else {
        const sdb = await getSQLite();
        return sdb.prepare(query).all(...params);
      }
    } catch (err) {
      console.error("DB Query Error:", err, { query, params });
      throw err;
    }
  },
  
  async execute(query: string, params: any[] = []) {
    try {
      if (isCloud) {
        return await sql.query(query.replace(/\?/g, (_, i) => `$${i + 1}`), params);
      } else {
        const sdb = await getSQLite();
        return sdb.prepare(query).run(...params);
      }
    } catch (err) {
      console.error("DB Execute Error:", err, { query, params });
      throw err;
    }
  },

  async get(query: string, params: any[] = []) {
    try {
      if (isCloud) {
        const { rows } = await sql.query(query.replace(/\?/g, (_, i) => `$${i + 1}`), params);
        return rows[0];
      } else {
        const sdb = await getSQLite();
        return sdb.prepare(query).get(...params);
      }
    } catch (err) {
      console.error("DB Get Error:", err, { query, params });
      throw err;
    }
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

  try {
    if (isCloud) {
      await sql.query(createGroupsTable);
      await sql.query(createBookmarksTable);
      await sql.query("INSERT INTO groups (name) VALUES ('未分類') ON CONFLICT (name) DO NOTHING");
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
  } catch (err) {
    console.error("DB Init Error:", err);
  }
}

export default db;

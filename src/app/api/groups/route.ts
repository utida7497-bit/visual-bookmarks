import { NextResponse } from "next/server";
import { db, initDB, isCloud, sql } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    if (isCloud) {
      const { rows } = await sql`
        SELECT g.*, 
               CAST((SELECT COUNT(*) FROM bookmarks b WHERE b.group_id = g.id OR (g.name = '未分類' AND b.group_id IS NULL)) AS INTEGER) AS bookmark_count
        FROM groups g
        ORDER BY g.sort_order ASC, g.id ASC
      `;
      return NextResponse.json(rows);
    } else {
      const groups = await db.query(`
        SELECT g.*, 
               (SELECT COUNT(*) FROM bookmarks b WHERE b.group_id = g.id OR (g.name = '未分類' AND b.group_id IS NULL)) AS bookmark_count
        FROM groups g
        ORDER BY g.sort_order ASC, g.id ASC
      `);
      return NextResponse.json(groups);
    }
  } catch (err: any) {
    return NextResponse.json({ error: "GET Groups Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { name } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
    }
    
    const trimmedName = name.trim();

    try {
      if (isCloud) {
        await sql`INSERT INTO groups (name) VALUES (${trimmedName})`;
        const { rows } = await sql`SELECT * FROM groups WHERE name = ${trimmedName}`;
        return NextResponse.json(rows[0], { status: 201 });
      } else {
        await db.execute("INSERT INTO groups (name) VALUES (?)", [trimmedName]);
        const newGroup = await db.get("SELECT * FROM groups WHERE name = ?", [trimmedName]);
        return NextResponse.json(newGroup, { status: 201 });
      }
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: "すでに存在するグループ名です", details: err.message }, { status: 409 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "POST Groups Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

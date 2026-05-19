import { NextResponse } from "next/server";
import { db, initDB, isCloud, sql } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    if (isCloud) {
      const { rows } = await sql`SELECT * FROM groups ORDER BY sort_order ASC, id ASC`;
      return NextResponse.json(rows);
    } else {
      const groups = await db.query("SELECT * FROM groups ORDER BY sort_order ASC, id ASC");
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

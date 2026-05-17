import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    const groups = await db.query("SELECT * FROM groups ORDER BY created_at ASC");
    // Vercel Postgresの場合は rows プロパティにデータが入っている
    return NextResponse.json(Array.isArray(groups) ? groups : (groups as any).rows);
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
    
    try {
      const result = await db.execute("INSERT INTO groups (name) VALUES (?)", [name.trim()]);
      // INSERT後のID取得
      const newGroup = await db.get("SELECT * FROM groups WHERE name = ?", [name.trim()]);
      return NextResponse.json(newGroup, { status: 201 });
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: "すでに存在するグループ名です", details: err.message }, { status: 409 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "POST Groups Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

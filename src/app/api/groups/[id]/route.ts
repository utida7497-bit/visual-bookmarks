import { NextResponse } from "next/server";
import { db, initDB, isCloud, sql } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId)) throw new Error("Invalid id");
    
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
    }

    const trimmedName = name.trim();

    try {
      if (isCloud) {
        await sql`UPDATE groups SET name = ${trimmedName} WHERE id = ${numId}`;
        const { rows } = await sql`SELECT * FROM groups WHERE id = ${numId}`;
        return NextResponse.json(rows[0]);
      } else {
        await db.execute(`UPDATE groups SET name = ? WHERE id = ${numId}`, [trimmedName]);
        const group = await db.get(`SELECT * FROM groups WHERE id = ${numId}`);
        return NextResponse.json(group);
      }
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: "すでに存在するグループ名です", details: err.message }, { status: 409 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "PUT Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId)) throw new Error("Invalid id");
    
    if (isCloud) {
      await sql`DELETE FROM groups WHERE id = ${numId}`;
    } else {
      await db.execute(`DELETE FROM groups WHERE id = ${numId}`);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "DELETE Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

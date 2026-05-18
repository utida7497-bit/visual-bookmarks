import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
    }

    try {
      await db.execute("UPDATE groups SET name = ? WHERE id = CAST(? AS INTEGER)", [name.trim(), Number(id)]);
      const group = await db.get("SELECT * FROM groups WHERE id = CAST(? AS INTEGER)", [Number(id)]);
      return NextResponse.json(group);
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
    await db.execute("DELETE FROM groups WHERE id = CAST(? AS INTEGER)", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "DELETE Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
  }

  try {
    await db.execute("UPDATE groups SET name = ? WHERE id = ?", [name.trim(), Number(id)]);
    const group = await db.get("SELECT * FROM groups WHERE id = ?", [Number(id)]);
    return NextResponse.json(group);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "すでに存在するグループ名です" }, { status: 409 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  await db.execute("DELETE FROM groups WHERE id = ?", [Number(id)]);
  return NextResponse.json({ success: true });
}

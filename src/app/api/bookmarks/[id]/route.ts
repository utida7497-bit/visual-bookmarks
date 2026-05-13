import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  const body = await request.json();
  const { memo, groupId } = body;

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (memo !== undefined) {
    updates.push("memo = ?");
    values.push(memo);
  }
  if (groupId !== undefined) {
    updates.push("group_id = ?");
    values.push(groupId);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "更新する内容がありません" }, { status: 400 });
  }

  values.push(Number(id));
  const query = `UPDATE bookmarks SET ${updates.join(", ")} WHERE id = ?`;
  await db.execute(query, values);

  const bookmark = await db.get("SELECT * FROM bookmarks WHERE id = ?", [Number(id)]);
  return NextResponse.json(bookmark);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDB();
  const { id } = await params;
  await db.execute("DELETE FROM bookmarks WHERE id = ?", [Number(id)]);
  return NextResponse.json({ success: true });
}

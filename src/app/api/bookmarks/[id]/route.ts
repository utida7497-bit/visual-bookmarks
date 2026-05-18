import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";

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
    const { memo, groupId } = body;

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (memo !== undefined) {
      updates.push("memo = ?");
      values.push(memo);
    }
    if (groupId !== undefined) {
      updates.push(`group_id = ${groupId ? Number(groupId) : 'NULL'}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "更新する内容がありません" }, { status: 400 });
    }

    const query = `UPDATE bookmarks SET ${updates.join(", ")} WHERE id = ${numId}`;
    await db.execute(query, values);

    const bookmark = await db.get(`SELECT * FROM bookmarks WHERE id = ${numId}`);
    return NextResponse.json(bookmark);
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

    await db.execute(`DELETE FROM bookmarks WHERE id = ${numId}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "DELETE Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

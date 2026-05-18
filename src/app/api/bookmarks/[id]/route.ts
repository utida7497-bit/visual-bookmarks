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
    const { memo, groupId, isFavorite } = body;

    const hasMemo = memo !== undefined;
    const hasGroupId = groupId !== undefined;
    const hasIsFavorite = isFavorite !== undefined;

    if (!hasMemo && !hasGroupId && !hasIsFavorite) {
      return NextResponse.json({ error: "更新する内容がありません" }, { status: 400 });
    }

    if (isCloud) {
      if (hasIsFavorite) {
        const favBool = Boolean(isFavorite);
        await sql`UPDATE bookmarks SET is_favorite = ${favBool} WHERE id = ${numId}`;
      }
      if (hasMemo) {
        await sql`UPDATE bookmarks SET memo = ${memo} WHERE id = ${numId}`;
      }
      if (hasGroupId) {
        const numGroupId = groupId ? Number(groupId) : null;
        await sql`UPDATE bookmarks SET group_id = ${numGroupId} WHERE id = ${numId}`;
      }
      const { rows } = await sql`SELECT * FROM bookmarks WHERE id = ${numId}`;
      return NextResponse.json(rows[0]);
    } else {
      const updates: string[] = [];
      const values: any[] = [];

      if (hasMemo) {
        updates.push("memo = ?");
        values.push(memo);
      }
      if (hasGroupId) {
        updates.push("group_id = ?");
        values.push(groupId ? Number(groupId) : null);
      }
      if (hasIsFavorite) {
        updates.push("is_favorite = ?");
        values.push(isFavorite ? 1 : 0);
      }

      const query = `UPDATE bookmarks SET ${updates.join(", ")} WHERE id = ${numId}`;
      await db.execute(query, values);

      const bookmark = await db.get(`SELECT * FROM bookmarks WHERE id = ${numId}`);
      return NextResponse.json(bookmark);
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
      await sql`DELETE FROM bookmarks WHERE id = ${numId}`;
    } else {
      await db.execute(`DELETE FROM bookmarks WHERE id = ${numId}`);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "DELETE Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

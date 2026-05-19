import { NextResponse } from "next/server";
import { db, initDB, isCloud, sql } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { orders } = body; // orders: Array of { id: number, sortOrder: number }

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid reorder parameters" }, { status: 400 });
    }

    if (isCloud) {
      // Vercel Postgres
      for (const item of orders) {
        const numId = Number(item.id);
        const sortVal = Number(item.sortOrder);
        if (!isNaN(numId) && !isNaN(sortVal)) {
          await sql`UPDATE groups SET sort_order = ${sortVal} WHERE id = ${numId}`;
        }
      }
    } else {
      // SQLite
      for (const item of orders) {
        const numId = Number(item.id);
        const sortVal = Number(item.sortOrder);
        if (!isNaN(numId) && !isNaN(sortVal)) {
          await db.execute("UPDATE groups SET sort_order = ? WHERE id = ?", [sortVal, numId]);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reorder groups error:", err);
    return NextResponse.json({ error: "Reorder groups error", details: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db, initDB, isCloud, sql } from "@/lib/db";

// URLからOGPタイトル・画像を取得する
async function fetchMetadata(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VisualBookmarks/1.0; +https://github.com)",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      url;

    const imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      null;

    const resolvedImageUrl = imageUrl ? new URL(imageUrl, url).href : null;

    return { title: title.trim(), imageUrl: resolvedImageUrl, summary: description };
  } catch (err) {
    console.error("Failed to fetch metadata:", err);
    return { title: url, imageUrl: null, summary: null };
  }
}

export async function GET(request: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (isCloud) {
      if (groupId === "favorites") {
        const { rows } = await sql`SELECT * FROM bookmarks WHERE is_favorite = TRUE ORDER BY created_at DESC`;
        return NextResponse.json(rows);
      } else if (groupId) {
        const numId = Number(groupId);
        if (isNaN(numId)) throw new Error("Invalid groupId");
        const { rows } = await sql`SELECT * FROM bookmarks WHERE group_id = ${numId} ORDER BY created_at DESC`;
        return NextResponse.json(rows);
      } else {
        const { rows } = await sql`SELECT * FROM bookmarks ORDER BY created_at DESC`;
        return NextResponse.json(rows);
      }
    } else {
      let result;
      if (groupId === "favorites") {
        result = await db.query("SELECT * FROM bookmarks WHERE is_favorite = 1 ORDER BY created_at DESC");
      } else if (groupId) {
        const numId = Number(groupId);
        if (isNaN(numId)) throw new Error("Invalid groupId");
        result = await db.query(`SELECT * FROM bookmarks WHERE group_id = ${numId} ORDER BY created_at DESC`);
      } else {
        result = await db.query("SELECT * FROM bookmarks ORDER BY created_at DESC");
      }
      return NextResponse.json(result);
    }
  } catch (err: any) {
    return NextResponse.json({ error: "GET Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { url, groupId } = body;

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URLを入力してください" }, { status: 400 });
    }

    const { title, imageUrl, summary } = await fetchMetadata(url);
    const numId = groupId ? Number(groupId) : null;

    if (isCloud) {
      await sql`
        INSERT INTO bookmarks (group_id, url, title, image_url, summary, memo)
        VALUES (${numId}, ${url}, ${title}, ${imageUrl}, ${summary}, '')
      `;
      const { rows } = await sql`SELECT * FROM bookmarks WHERE url = ${url} ORDER BY created_at DESC LIMIT 1`;
      return NextResponse.json(rows[0], { status: 201 });
    } else {
      await db.execute(`
        INSERT INTO bookmarks (group_id, url, title, image_url, summary, memo)
        VALUES (${numId !== null ? numId : 'NULL'}, ?, ?, ?, ?, '')
      `, [url, title, imageUrl, summary]);
      const bookmark = await db.get("SELECT * FROM bookmarks WHERE url = ? ORDER BY created_at DESC LIMIT 1", [url]);
      return NextResponse.json(bookmark, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "POST Error", details: err.message, stack: err.stack }, { status: 500 });
  }
}

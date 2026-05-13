import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db, initDB } from "@/lib/db";

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
  await initDB();
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  let result;
  if (groupId) {
    result = await db.query(
      "SELECT * FROM bookmarks WHERE group_id = ? ORDER BY created_at DESC",
      [Number(groupId)]
    );
  } else {
    result = await db.query("SELECT * FROM bookmarks ORDER BY created_at DESC");
  }
  
  const bookmarks = Array.isArray(result) ? result : (result as any).rows;
  return NextResponse.json(bookmarks);
}

export async function POST(request: Request) {
  await initDB();
  const body = await request.json();
  const { url, groupId } = body;

  if (!url || !url.trim()) {
    return NextResponse.json({ error: "URLを入力してください" }, { status: 400 });
  }

  const { title, imageUrl, summary } = await fetchMetadata(url);

  await db.execute(`
    INSERT INTO bookmarks (group_id, url, title, image_url, summary, memo)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [groupId || null, url, title, imageUrl, summary, ""]);

  // 最新のデータを取得して返す
  const bookmark = await db.get("SELECT * FROM bookmarks WHERE url = ? ORDER BY created_at DESC LIMIT 1", [url]);

  return NextResponse.json(bookmark, { status: 201 });
}

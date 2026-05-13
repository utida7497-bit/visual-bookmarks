"use client";

import { useState, useRef, useEffect } from "react";

interface Bookmark {
  id: number;
  url: string;
  title: string | null;
  image_url: string | null;
  summary: string | null;
  memo: string | null;
  created_at: string;
}

export default function BookmarkCard({ bookmark, onDelete }: {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
}) {
  const [memo, setMemo] = useState(bookmark.memo || "");
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // メモを自動保存（入力後1秒後）
  useEffect(() => {
    if (memo === (bookmark.memo || "")) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo }),
      });
      setSaving(false);
    }, 1000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [memo]);

  const domain = (() => {
    try { return new URL(bookmark.url).hostname; } catch { return bookmark.url; }
  })();

  return (
    <div className="glass-panel" style={{
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px 0 rgba(0,0,0,0.37)";
    }}
    >
      {/* サムネイル */}
      <div style={{
        height: "160px",
        background: "linear-gradient(135deg, #1e3a5f, #2d1b69)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {bookmark.image_url && !imgError ? (
          <img
            src={bookmark.image_url}
            alt={bookmark.title || ""}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "2.5rem", opacity: 0.5 }}>📄</span>
        )}
        {/* ドメイン名バッジ */}
        <span style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          background: "rgba(0,0,0,0.6)",
          color: "#94a3b8",
          fontSize: "0.7rem",
          padding: "3px 8px",
          borderRadius: "6px",
          backdropFilter: "blur(4px)",
        }}>{domain}</span>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#f8fafc",
            textDecoration: "none",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {bookmark.title || bookmark.url}
        </a>

        {bookmark.summary && (
          <p style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
            lineHeight: "1.5",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{bookmark.summary}</p>
        )}

        {/* メモエリア */}
        <div style={{ position: "relative" }}>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="✏️ メモを追加..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: "0.82rem",
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(251,191,36,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          {saving && (
            <span style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              fontSize: "0.7rem",
              color: "#fbbf24",
            }}>保存中...</span>
          )}
        </div>

        {/* フッター */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <span style={{ fontSize: "0.7rem", color: "#475569" }}>
            {new Date(bookmark.created_at).toLocaleDateString("ja-JP")}
          </span>
          <button
            onClick={() => onDelete(bookmark.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: "0.75rem",
              transition: "color 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#f87171")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#475569")}
          >
            🗑 削除
          </button>
        </div>
      </div>
    </div>
  );
}

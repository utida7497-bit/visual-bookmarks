"use client";

import { useEffect, useState, useCallback } from "react";
import BookmarkCard from "./BookmarkCard";
import AddBookmarkForm from "./AddBookmarkForm";

interface Bookmark {
  id: number;
  url: string;
  title: string | null;
  image_url: string | null;
  summary: string | null;
  memo: string | null;
  created_at: string;
}

interface BookmarkGridProps {
  selectedGroupId: number | null;
}

type ViewMode = "grid" | "list";

export default function BookmarkGrid({ selectedGroupId }: BookmarkGridProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const fetchBookmarks = useCallback(async () => {
    if (selectedGroupId === null) return;
    setLoading(true);
    const res = await fetch(`/api/bookmarks?groupId=${selectedGroupId}`);
    const data = await res.json();
    setBookmarks(data);
    setLoading(false);
  }, [selectedGroupId]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleDelete = async (id: number) => {
    if (!confirm("この蔵書を削除しますか？")) return;
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <AddBookmarkForm selectedGroupId={selectedGroupId} onAdded={fetchBookmarks} />
        </div>
        
        {/* 表示切替ボタン */}
        <div className="glass-panel" style={{ 
          display: "flex", 
          padding: "4px", 
          borderRadius: "12px",
          height: "fit-content"
        }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{
              padding: "8px 12px",
              background: viewMode === "grid" ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: viewMode === "grid" ? "var(--accent-color)" : "var(--text-muted)",
              fontSize: "1.2rem",
              transition: "all 0.2s"
            }}
            title="グリッド表示"
          >
            🔲
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{
              padding: "8px 12px",
              background: viewMode === "list" ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: viewMode === "list" ? "var(--accent-color)" : "var(--text-muted)",
              fontSize: "1.2rem",
              transition: "all 0.2s"
            }}
            title="リスト表示"
          >
            ☰
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px" }}>
          <div className="loading-spinner" />
          <p>蔵書を検索中...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div style={{
          textAlign: "center",
          color: "#475569",
          padding: "80px 40px",
          border: "2px dashed rgba(255,255,255,0.08)",
          borderRadius: "20px"
        }}>
          <p style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</p>
          <p>この棚はまだ空っぽです。</p>
        </div>
      ) : viewMode === "grid" ? (
        /* グリッド表示（画像あり） */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}>
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        /* リスト表示（画像なし・コンパクト） */
        <div className="glass-panel" style={{ padding: "10px", display: "flex", flexDirection: "column" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 2fr 100px", 
            padding: "10px 15px",
            borderBottom: "1px solid var(--border-color)",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            fontWeight: "600"
          }}>
            <span>タイトル</span>
            <span>メモ / 内容</span>
            <span style={{ textAlign: "right" }}>操作</span>
          </div>
          {bookmarks.map((bookmark) => (
            <div 
              key={bookmark.id} 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 2fr 100px", 
                padding: "12px 15px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                alignItems: "center",
                gap: "15px",
                transition: "background 0.2s"
              }}
              className="list-item-hover"
            >
              <a 
                href={bookmark.url} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  color: "var(--text-main)", 
                  textDecoration: "none", 
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {bookmark.title || bookmark.url}
              </a>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {bookmark.memo || bookmark.summary || "---"}
              </span>
              <div style={{ textAlign: "right" }}>
                <button 
                  onClick={() => handleDelete(bookmark.id)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", opacity: 0.5 }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .loading-spinner {
          display: inline-block;
          width: 32px; height: 32px;
          border: 3px solid rgba(251,191,36,0.3);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .list-item-hover:hover {
          background: rgba(255,255,255,0.03);
        }
        .list-item-hover:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}

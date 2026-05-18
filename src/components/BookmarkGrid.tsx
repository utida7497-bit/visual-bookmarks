"use client";

import { useEffect, useState, useCallback } from "react";
import BookmarkCard from "./BookmarkCard";
import AddBookmarkForm from "./AddBookmarkForm";
import { LayoutGrid, List, PackageOpen, Trash2 } from "lucide-react";

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
  const [errorObj, setErrorObj] = useState<any>(null);

  const fetchBookmarks = useCallback(async () => {
    if (selectedGroupId === null) return;
    setLoading(true);
    setErrorObj(null);
    try {
      const res = await fetch(`/api/bookmarks?groupId=${selectedGroupId}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorObj(data);
        setBookmarks([]);
      } else {
        setBookmarks(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setErrorObj({ error: "Fetch Exception", details: err.message });
    }
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <AddBookmarkForm selectedGroupId={selectedGroupId} onAdded={fetchBookmarks} />
        </div>
        
        {/* 表示切替ボタン */}
        <div className="glass-panel" style={{ 
          display: "flex", 
          padding: "4px", 
          borderRadius: "10px",
          height: "fit-content",
          border: "1px solid rgba(212, 175, 55, 0.2)"
        }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{
              padding: "6px 10px",
              background: viewMode === "grid" ? "rgba(212, 175, 55, 0.15)" : "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: viewMode === "grid" ? "var(--accent-color)" : "var(--text-muted)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="グリッド表示"
          >
            <LayoutGrid size={18} strokeWidth={viewMode === "grid" ? 2.5 : 2} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{
              padding: "6px 10px",
              background: viewMode === "list" ? "rgba(212, 175, 55, 0.15)" : "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: viewMode === "list" ? "var(--accent-color)" : "var(--text-muted)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="リスト表示"
          >
            <List size={18} strokeWidth={viewMode === "list" ? 2.5 : 2} />
          </button>
        </div>
      </div>

      {errorObj ? (
        <div style={{ padding: "20px", background: "rgba(255,0,0,0.1)", border: "1px solid red", borderRadius: "8px", color: "white" }}>
          <h3 style={{ fontFamily: "Inter, sans-serif" }}>データベースエラーが発生しました</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: "12px", marginTop: "10px" }}>
            {JSON.stringify(errorObj, null, 2)}
          </pre>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", color: "var(--accent-color)", padding: "80px", opacity: 0.7 }}>
          <div className="loading-spinner" />
          <p style={{ fontFamily: "Playfair Display, serif", letterSpacing: "2px", fontSize: "1.1rem" }}>検索中...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.3)",
          padding: "100px 40px",
          border: "1px dashed rgba(212, 175, 55, 0.2)",
          borderRadius: "24px",
          background: "rgba(0,0,0,0.2)"
        }}>
          <PackageOpen size={64} strokeWidth={1} style={{ marginBottom: "20px", opacity: 0.5, color: "var(--accent-color)" }} />
          <p style={{ fontFamily: "Playfair Display, serif", letterSpacing: "1px", fontSize: "1.2rem", color: "rgba(255,255,255,0.5)" }}>この棚にはまだ蔵書がありません</p>
        </div>
      ) : viewMode === "grid" ? (
        /* グリッド表示（画像あり） */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}>
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        /* リスト表示（画像なし・コンパクト） */
        <div className="glass-panel" style={{ padding: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "minmax(200px, 1.5fr) 2fr 80px", 
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-color)",
            color: "var(--accent-color)",
            fontSize: "0.85rem",
            fontWeight: "600",
            letterSpacing: "1px",
            background: "rgba(0,0,0,0.3)"
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
                gridTemplateColumns: "minmax(200px, 1.5fr) 2fr 80px", 
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center",
                gap: "20px",
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
                  fontSize: "0.95rem",
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
              <div style={{ textAlign: "right", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handleDelete(bookmark.id)}
                  style={{ 
                    background: "transparent", 
                    border: "none", 
                    color: "rgba(255,255,255,0.3)",
                    padding: "6px",
                    borderRadius: "4px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#ff6b6b";
                    e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                    e.currentTarget.style.background = "transparent";
                  }}
                  title="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .loading-spinner {
          display: inline-block;
          width: 40px; height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
          margin-bottom: 16px;
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

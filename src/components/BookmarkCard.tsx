"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, FileText, Loader2, Star } from "lucide-react";

interface Bookmark {
  id: number;
  url: string;
  title: string | null;
  image_url: string | null;
  summary: string | null;
  memo: string | null;
  is_favorite?: boolean | number;
  created_at: string;
}

export default function BookmarkCard({ bookmark, onDelete, onToggleFavorite }: {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
  onToggleFavorite?: () => void;
}) {
  const [memo, setMemo] = useState(bookmark.memo || "");
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(Boolean(bookmark.is_favorite));
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
  }, [memo, bookmark.id, bookmark.memo]);

  const handleToggleFavorite = async () => {
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    try {
      const res = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextVal }),
      });
      if (res.ok) {
        if (onToggleFavorite) onToggleFavorite();
      } else {
        setIsFavorite(!nextVal);
      }
    } catch {
      setIsFavorite(!nextVal);
    }
  };

  const domain = (() => {
    try { return new URL(bookmark.url).hostname; } catch { return bookmark.url; }
  })();

  return (
    <div className="glass-panel" style={{
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      height: "100%",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px -4px rgba(0,0,0,0.6), 0 0 2px 1px rgba(255, 255, 255, 0.1) inset";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px -1px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.03) inset";
    }}
    >
      {/* サムネイル */}
      <div style={{
        height: "180px",
        background: "linear-gradient(135deg, #17223b, #0b1120)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {bookmark.image_url && !imgError ? (
          <>
            <img
              src={bookmark.image_url}
              alt={bookmark.title || ""}
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* ダークグラデーションオーバーレイで上の文字を見やすく */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to top, rgba(11,17,32,0.9) 0%, rgba(11,17,32,0.2) 50%, rgba(11,17,32,0) 100%)",
              pointerEvents: "none"
            }} />
          </>
        ) : (
          <FileText size={48} strokeWidth={1} style={{ opacity: 0.3, color: "var(--accent-color)" }} />
        )}
        
        {/* ドメイン名バッジ */}
        <span style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          background: "rgba(0,0,0,0.6)",
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.75rem",
          padding: "4px 10px",
          borderRadius: "6px",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>{domain}</span>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "1.05rem",
            fontWeight: "600",
            color: "#f1f5f9",
            textDecoration: "none",
            lineHeight: "1.5",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily: "Playfair Display, serif",
            letterSpacing: "0.5px"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-color)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#f1f5f9"}
        >
          {bookmark.title || bookmark.url}
        </a>

        {bookmark.summary && (
          <p style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            lineHeight: "1.6",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{bookmark.summary}</p>
        )}

        {/* メモエリア */}
        <div style={{ position: "relative", marginTop: "auto", paddingTop: "10px" }}>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを追加..."
            rows={2}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "0.85rem",
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent-color)";
              e.target.style.background = "rgba(0,0,0,0.5)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.05)";
              e.target.style.background = "rgba(0,0,0,0.3)";
            }}
          />
          {saving && (
            <span style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              color: "var(--accent-color)",
              animation: "pulse 1.5s infinite"
            }}>
              <Loader2 size={14} className="spin-animation" />
            </span>
          )}
        </div>

        {/* フッター */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Playfair Display, serif" }}>
            {new Date(bookmark.created_at).toLocaleDateString("ja-JP")}
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleToggleFavorite}
              style={{
                background: "transparent",
                border: "none",
                color: isFavorite ? "var(--accent-color)" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "4px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title={isFavorite ? "お気に入り解除" : "お気に入り登録"}
              onMouseEnter={(e) => {
                if (!isFavorite) e.currentTarget.style.color = "var(--accent-color)";
              }}
              onMouseLeave={(e) => {
                if (!isFavorite) e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              }}
            >
              <Star size={16} fill={isFavorite ? "var(--accent-color)" : "none"} stroke={isFavorite ? "var(--accent-color)" : "currentColor"} />
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "4px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
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
      </div>
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

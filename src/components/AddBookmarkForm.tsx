"use client";

import { useState } from "react";
import { Plus, BookOpen, Loader2 } from "lucide-react";

interface AddBookmarkFormProps {
  selectedGroupId: number | string | null;
  onAdded?: () => void;
}

export default function AddBookmarkForm({ selectedGroupId, onAdded }: AddBookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, groupId: selectedGroupId === "favorites" ? null : selectedGroupId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "追加に失敗しました。");
      } else {
        setUrl("");
        onAdded?.();
      }
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      <label style={{ 
        fontSize: "0.9rem", 
        color: "var(--accent-color)", 
        letterSpacing: "2px",
        fontFamily: "Playfair Display, serif",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: "600"
      }}>
        <BookOpen size={16} /> 新しい蔵書を追加
      </label>
      <div style={{ display: "flex", gap: "12px" }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... URLを入力してください"
          required
          style={{
            flex: 1,
            padding: "12px 18px",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "12px",
            color: "#f8fafc",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent-color)";
            e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(212, 175, 55, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(212, 175, 55, 0.3)";
            e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.5)";
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: loading ? "rgba(212, 175, 55, 0.5)" : "linear-gradient(135deg, #d4af37, #b5952f)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            color: "#0b1120",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            minWidth: "120px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)"
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "translateY(0)")}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin-animation" />
              取得中...
            </>
          ) : (
            <>
              <Plus size={18} strokeWidth={2.5} />
              追加する
            </>
          )}
        </button>
      </div>
      {error && <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginTop: "4px" }}>{error}</p>}
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}

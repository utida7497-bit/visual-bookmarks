"use client";

import { useState } from "react";

interface AddBookmarkFormProps {
  selectedGroupId: number | null;
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
        body: JSON.stringify({ url, groupId: selectedGroupId }),
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
      <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", letterSpacing: "1px" }}>
        📖 新しい蔵書を追加
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
            background: "rgba(255,255,255,0.07)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            color: "#f8fafc",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 28px",
            background: loading ? "#78716c" : "linear-gradient(135deg, #fbbf24, #f59e0b)",
            border: "none",
            borderRadius: "12px",
            color: "#1a1a1a",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            minWidth: "100px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid #1a1a1a",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              取得中...
            </span>
          ) : "追加する"}
        </button>
      </div>
      {error && <p style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

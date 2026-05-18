"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BookmarkGrid from "@/components/BookmarkGrid";
import SyncModal from "@/components/SyncModal";
import { Smartphone } from "lucide-react";

export default function Home() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* サイドバー: タブグループ */}
      <Sidebar
        onSelectGroup={setSelectedGroupId}
        selectedGroupId={selectedGroupId}
        onGroupsChange={() => setRefresh((r) => r + 1)}
      />

      {/* メインコンテンツ */}
      <div style={{
        flex: 1,
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        overflowY: "auto",
      }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "2.8rem", marginBottom: "8px", letterSpacing: "1px" }}>
              Library Archival
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              あなただけのデジタル図書館。URLを追加して、知識を整理してください。
            </p>
          </div>
          
          {/* スマホ連携ボタン */}
          <button 
            onClick={() => setIsSyncOpen(true)}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
          >
            <Smartphone size={18} />
            <span>スマホ連携</span>
          </button>
        </header>

        {/* ブックマーク一覧（内部にフォームを含む） */}
        <BookmarkGrid key={`${selectedGroupId}-${refresh}`} selectedGroupId={selectedGroupId} />
      </div>

      {/* 同期用QRコードモーダル */}
      {isSyncOpen && (
        <SyncModal onClose={() => setIsSyncOpen(false)} />
      )}
    </div>
  );
}

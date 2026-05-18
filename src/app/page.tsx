"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BookmarkGrid from "@/components/BookmarkGrid";

export default function Home() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

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
          
        </header>

        {/* ブックマーク一覧（内部にフォームを含む） */}
        <BookmarkGrid key={`${selectedGroupId}-${refresh}`} selectedGroupId={selectedGroupId} />
      </div>
    </div>
  );
}

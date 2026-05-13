"use client";

import { useEffect, useState, useCallback } from "react";

interface Group {
  id: number;
  name: string;
}

interface SidebarProps {
  onSelectGroup: (id: number | null) => void;
  selectedGroupId: number | null;
  onGroupsChange?: () => void;
}

export default function Sidebar({ onSelectGroup, selectedGroupId, onGroupsChange }: SidebarProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const fetchGroups = useCallback(async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
    if (selectedGroupId === null && data.length > 0) {
      onSelectGroup(data[0].id);
    }
  }, [selectedGroupId, onSelectGroup]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName }),
    });
    setNewGroupName("");
    setIsAdding(false);
    fetchGroups();
    onGroupsChange?.();
  };

  const handleStartEdit = (group: Group) => {
    setEditingId(group.id);
    setEditingName(group.name);
  };

  const handleRenameGroup = async (id: number) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    await fetch(`/api/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });
    setEditingId(null);
    fetchGroups();
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("この棚を削除しますか？（蔵書は未分類に移動されます）")) return;
    await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (selectedGroupId === id) {
      onSelectGroup(groups.find((g) => g.id !== id)?.id ?? null);
    }
    fetchGroups();
  };

  return (
    <aside className="glass-panel" style={{
      width: "260px",
      minHeight: "calc(100vh - 40px)",
      margin: "20px",
      padding: "30px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      borderRadius: "24px",
      flexShrink: 0,
    }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        color: "var(--accent-color)",
        fontSize: "1.1rem",
        letterSpacing: "3px",
        textAlign: "center",
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: "1px solid var(--border-color)"
      }}>
        📚 ARCHIVES
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {groups.map((group) => (
          <div
            key={group.id}
            onMouseEnter={() => setHoveredId(group.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ position: "relative" }}
          >
            {editingId === group.id ? (
              /* 編集モード */
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameGroup(group.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid #fbbf24",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => handleRenameGroup(group.id)}
                  title="保存"
                  style={{
                    padding: "6px 8px",
                    background: "#fbbf24",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#1a1a1a",
                  }}
                >✓</button>
                <button
                  onClick={() => setEditingId(null)}
                  title="キャンセル"
                  style={{
                    padding: "6px 8px",
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                  }}
                >✕</button>
              </div>
            ) : (
              /* 通常モード */
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => onSelectGroup(group.id)}
                  style={{
                    flex: 1,
                    padding: "11px 14px",
                    textAlign: "left",
                    background: selectedGroupId === group.id
                      ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                      : "transparent",
                    color: selectedGroupId === group.id ? "#1a1a1a" : "#f8fafc",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: selectedGroupId === group.id ? "600" : "400",
                    transition: "all 0.25s ease",
                    fontFamily: "inherit",
                    boxShadow: selectedGroupId === group.id
                      ? "0 4px 14px rgba(251, 191, 36, 0.3)"
                      : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {group.name}
                </button>

                {/* ホバー時に表示される編集・削除ボタン */}
                {hoveredId === group.id && (
                  <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                    <button
                      onClick={() => handleStartEdit(group)}
                      title="名前を変更"
                      style={{
                        padding: "6px 7px",
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        transition: "all 0.15s",
                      }}
                    >✎</button>
                    {group.name !== "未分類" && (
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        title="棚を削除"
                        style={{
                          padding: "6px 7px",
                          background: "rgba(255,255,255,0.1)",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#f87171")}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#94a3b8")}
                      >🗑</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 新しい棚の追加 */}
      {isAdding ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
            placeholder="棚の名前..."
            autoFocus
            style={{
              padding: "8px 12px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "0.85rem",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={handleAddGroup} style={{
              flex: 1, padding: "7px", background: "#fbbf24", border: "none",
              borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#1a1a1a"
            }}>追加</button>
            <button onClick={() => setIsAdding(false)} style={{
              flex: 1, padding: "7px", background: "rgba(255,255,255,0.08)", border: "none",
              borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", color: "#94a3b8"
            }}>キャンセル</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} style={{
          padding: "10px",
          background: "rgba(255,255,255,0.05)",
          border: "1px dashed rgba(255,255,255,0.2)",
          color: "#94a3b8",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontFamily: "inherit",
          transition: "all 0.2s ease",
        }}>
          + 新しい棚を追加
        </button>
      )}
    </aside>
  );
}

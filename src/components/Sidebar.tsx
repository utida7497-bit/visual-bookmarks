"use client";

import { useEffect, useState } from "react";

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
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [sidebarError, setSidebarError] = useState<any>(null);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (!res.ok || data.error) {
        setSidebarError(data);
        setGroups([]);
      } else {
        setGroups(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setSidebarError({ error: "Fetch Exception", details: err.message });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && selectedGroupId === null) {
      onSelectGroup(groups[0].id);
    }
  }, [groups, selectedGroupId, onSelectGroup]);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName }),
    });

    if (res.ok) {
      setNewGroupName("");
      setIsAdding(false);
      await fetchGroups();
      if (onGroupsChange) onGroupsChange();
    } else {
      const data = await res.json();
      alert(data.error || "エラーが発生しました");
    }
  };

  const handleEditGroup = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editGroupName.trim()) return;

    const res = await fetch(`/api/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editGroupName }),
    });

    if (res.ok) {
      setEditingGroupId(null);
      await fetchGroups();
      if (onGroupsChange) onGroupsChange();
    } else {
      const data = await res.json();
      alert(data.error || "エラーが発生しました");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("この本棚を削除しますか？\n※中の蔵書もすべて削除されます（未実装）")) return;

    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedGroupId === id) {
        onSelectGroup(groups.find(g => g.id !== id)?.id || null);
      }
      await fetchGroups();
      if (onGroupsChange) onGroupsChange();
    }
  };

  return (
    <div className="glass-panel" style={{
      width: "280px",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      height: "100vh",
      position: "sticky",
      top: 0,
      padding: "20px 0"
    }}>
      <div style={{ padding: "0 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.2rem", color: "var(--text-muted)", fontWeight: "600", letterSpacing: "2px" }}>
          BOOKSHELVES
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{
            background: "none", border: "none", color: "var(--accent-color)", 
            cursor: "pointer", fontSize: "1.5rem", padding: "0 5px", transition: "transform 0.2s"
          }}
          title="新しい棚を追加"
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          +
        </button>
      </div>

      {sidebarError && (
        <div style={{ padding: "10px", margin: "0 20px 20px", background: "rgba(255,0,0,0.1)", border: "1px solid red", borderRadius: "8px", color: "white", fontSize: "0.7rem", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
          ⚠️ DB Error<br/>
          {JSON.stringify(sidebarError, null, 2)}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddGroup} style={{ padding: "0 20px", marginBottom: "15px" }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="棚の名前..."
            autoFocus
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--accent-color)",
              borderRadius: "8px",
              color: "var(--text-main)",
              outline: "none"
            }}
          />
        </form>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, overflowY: "auto" }}>
        {groups.map((group) => (
          <li key={group.id} className="group-item" style={{ position: "relative" }}>
            {editingGroupId === group.id ? (
              <form 
                onSubmit={(e) => handleEditGroup(e, group.id)}
                style={{ padding: "10px 20px" }}
              >
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  autoFocus
                  onBlur={() => setEditingGroupId(null)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid var(--accent-color)",
                    borderRadius: "6px",
                    color: "white"
                  }}
                />
              </form>
            ) : (
              <div 
                style={{
                  padding: "15px 20px",
                  cursor: "pointer",
                  background: selectedGroupId === group.id ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  borderLeft: selectedGroupId === group.id ? "4px solid var(--accent-color)" : "4px solid transparent",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                onClick={() => onSelectGroup(group.id)}
              >
                <span style={{ 
                  fontWeight: selectedGroupId === group.id ? "600" : "400",
                  color: selectedGroupId === group.id ? "var(--text-main)" : "var(--text-muted)"
                }}>
                  {group.name}
                </span>
                
                {/* ホバー時に表示されるアクションボタン */}
                <div className="group-actions" style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditGroupName(group.name);
                      setEditingGroupId(group.id);
                    }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-muted)" }}
                    title="名前を変更"
                  >
                    ✏️
                  </button>
                  {group.name !== '未分類' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-muted)" }}
                      title="削除"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <style>{`
        .group-item .group-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .group-item:hover .group-actions {
          opacity: 1;
        }
        .group-item:hover > div {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}

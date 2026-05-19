"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Library, Star } from "lucide-react";
import MasterCatalogModal from "./MasterCatalogModal";

interface Group {
  id: number;
  name: string;
  bookmark_count?: number;
}

interface SidebarProps {
  onSelectGroup: (id: number | string | null) => void;
  selectedGroupId: number | string | null;
  onGroupsChange?: () => void;
  refresh?: number;
}

// 背表紙のカラーパレット（アンティークな本の装丁風）
const spineColors = [
  "linear-gradient(90deg, #2b1810 0%, #4a2f24 50%, #2b1810 100%)", // レザーブラウン
  "linear-gradient(90deg, #0f1c2e 0%, #1a2f4c 50%, #0f1c2e 100%)", // ネイビー
  "linear-gradient(90deg, #182815 0%, #294025 50%, #182815 100%)", // フォレストグリーン
  "linear-gradient(90deg, #3d1b1b 0%, #5c2a2a 50%, #3d1b1b 100%)", // ワインレッド
  "linear-gradient(90deg, #2a2236 0%, #3d314e 50%, #2a2236 100%)", // ディープパープル
];

export default function Sidebar({ onSelectGroup, selectedGroupId, onGroupsChange, refresh }: SidebarProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [sidebarError, setSidebarError] = useState<any>(null);
  
  // サイドバーの開閉状態
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ドラッグ＆ドロップ状態
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...groups];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setGroups(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // データベースに並び順を保存
    try {
      const orders = updated.map((group, idx) => ({
        id: group.id,
        sortOrder: idx,
      }));

      await fetch("/api/groups/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (onGroupsChange) onGroupsChange();
    } catch (err) {
      console.error("Failed to persist group order:", err);
    }
  };

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

      // Also fetch favorites count
      const favRes = await fetch("/api/bookmarks?groupId=favorites");
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavoritesCount(Array.isArray(favData) ? favData.length : 0);
      }
    } catch (err: any) {
      setSidebarError({ error: "Fetch Exception", details: err.message });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [refresh]);

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
    <div style={{ position: "relative", zIndex: 50 }}>
      {/* サイドバー本体 */}
      <div className="glass-panel" style={{
        width: isCollapsed ? "0px" : "280px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRight: isCollapsed ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
        borderTop: isCollapsed ? "none" : undefined,
        borderBottom: isCollapsed ? "none" : undefined,
        borderLeft: isCollapsed ? "none" : undefined,
        boxShadow: isCollapsed ? "none" : undefined,
        background: isCollapsed ? "transparent" : undefined,
        backdropFilter: isCollapsed ? "none" : undefined,
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: isCollapsed ? "20px 0" : "20px 0",
        transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        opacity: isCollapsed ? 0 : 1,
      }}>
        <div style={{ padding: "0 20px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: "280px" }}>
          <h2 style={{ fontSize: "1.1rem", color: "var(--accent-color)", fontWeight: "600", letterSpacing: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Library size={18} />
            BOOKSHELVES
          </h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            style={{
              background: "none", border: "none", color: "var(--accent-color)", 
              fontSize: "1.2rem", padding: "4px", borderRadius: "4px", transition: "all 0.2s"
            }}
            title="新しい棚を追加"
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <Plus size={20} />
          </button>
        </div>

        {sidebarError && (
          <div style={{ padding: "10px", margin: "0 20px 20px", background: "rgba(255,0,0,0.1)", border: "1px solid red", borderRadius: "8px", color: "white", fontSize: "0.7rem", wordBreak: "break-all", whiteSpace: "pre-wrap", minWidth: "240px" }}>
            ⚠️ DB Error<br/>
            {JSON.stringify(sidebarError, null, 2)}
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleAddGroup} style={{ padding: "0 20px", marginBottom: "15px", minWidth: "280px" }}>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="棚の名前..."
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(234, 179, 8, 0.4)",
                borderRadius: "8px",
                color: "var(--text-main)",
                outline: "none",
                fontFamily: "Playfair Display, serif",
                letterSpacing: "1px"
              }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 8px rgba(234, 179, 8, 0.3)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </form>
        )}

        <ul style={{ listStyle: "none", padding: "0 10px 0 20px", margin: 0, flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: "280px" }}>
          {/* お気に入り (Special Shelf) */}
          <li 
            className={`book-spine ${selectedGroupId === "favorites" ? "selected" : ""}`} 
            style={{ 
              background: "linear-gradient(90deg, #5f4b1e 0%, #a67c1e 50%, #5f4b1e 100%)", // Golden brown spine
            }}
          >
            <div 
              style={{
                padding: "12px 14px 12px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
                minHeight: "44px"
              }}
              onClick={() => onSelectGroup("favorites")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Star size={16} fill={selectedGroupId === "favorites" ? "var(--accent-color)" : "none"} stroke={selectedGroupId === "favorites" ? "var(--accent-color)" : "rgba(255,255,255,0.8)"} style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} />
                <span style={{ 
                  fontFamily: "Playfair Display, serif",
                  fontWeight: selectedGroupId === "favorites" ? "700" : "500",
                  color: "#fff",
                  letterSpacing: "1px",
                  fontSize: "0.95rem",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                }}>
                  お気に入り
                </span>
              </div>
              <span style={{
                fontSize: "0.72rem",
                background: "rgba(234, 179, 8, 0.25)",
                border: "1px solid rgba(234, 179, 8, 0.4)",
                padding: "2px 8px",
                borderRadius: "20px",
                color: "var(--accent-color)",
                fontFamily: "Playfair Display, serif",
                fontWeight: "700",
                textShadow: "none",
                backdropFilter: "blur(4px)"
              }}>
                {favoritesCount}
              </span>
            </div>
          </li>

          {/* Separator line */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "12px 0" }} />

          {groups.map((group, index) => (
            <li 
              key={group.id} 
              className={`book-spine ${selectedGroupId === group.id ? "selected" : ""}`} 
              draggable={editingGroupId === null}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              style={{ 
                background: spineColors[index % spineColors.length],
                opacity: draggedIndex === index ? 0.4 : 1,
                transform: dragOverIndex === index ? "translateY(-2px) scale(1.02)" : undefined,
                boxShadow: dragOverIndex === index 
                  ? "0 0 15px rgba(234, 179, 8, 0.5), inset 0 0 1px 1px rgba(255,255,255,0.15)" 
                  : undefined,
                border: dragOverIndex === index ? "1px dashed var(--accent-color)" : undefined,
                transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                cursor: editingGroupId === null ? "grab" : "default"
              }}
            >
              {editingGroupId === group.id ? (
                <form 
                  onSubmit={(e) => handleEditGroup(e, group.id)}
                  style={{ padding: "8px 12px", zIndex: 5, position: "relative" }}
                >
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    autoFocus
                    onBlur={() => setEditingGroupId(null)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1px solid var(--accent-color)",
                      borderRadius: "4px",
                      color: "white",
                      fontFamily: "Playfair Display, serif"
                    }}
                  />
                </form>
              ) : (
                <div 
                  style={{
                    padding: "12px 14px 12px 30px", // 左パディングを開けて背表紙の溝をよける
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 2,
                    minHeight: "44px"
                  }}
                  onClick={() => onSelectGroup(group.id)}
                >
                  <span style={{ 
                    fontFamily: "Playfair Display, serif",
                    fontWeight: selectedGroupId === group.id ? "700" : "500",
                    color: selectedGroupId === group.id ? "#fff" : "rgba(255,255,255,0.85)",
                    letterSpacing: "1px",
                    fontSize: "0.95rem",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                  }}>
                    {group.name}
                  </span>
                  
                  {/* アクションボタンとバッジの親コンテナ */}
                  <div style={{ position: "relative", height: "24px", display: "flex", alignItems: "center", minWidth: "60px", justifyContent: "flex-end" }}>
                    {/* 図書カウントバッジ */}
                    <span className="group-count" style={{
                      fontSize: "0.72rem",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily: "Playfair Display, serif",
                      fontWeight: "600",
                      backdropFilter: "blur(4px)",
                      position: "absolute",
                      right: 0
                    }}>
                      {group.bookmark_count || 0}
                    </span>

                    {/* ホバー時に表示されるアクションボタン */}
                    <div className="group-actions" style={{ display: "flex", gap: "4px", position: "absolute", right: 0 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditGroupName(group.name);
                          setEditingGroupId(group.id);
                        }}
                        style={{ background: "rgba(0,0,0,0.3)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px", color: "rgba(255,255,255,0.7)" }}
                        title="名前を変更"
                        onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                      >
                        <Edit2 size={14} />
                      </button>
                      {group.name !== '未分類' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          style={{ background: "rgba(0,0,0,0.3)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px", color: "rgba(255,255,255,0.7)" }}
                          title="削除"
                          onMouseEnter={(e) => e.currentTarget.style.color = "#ff6b6b"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* 図書総目録 (Master Catalog Index) Button */}
        {!isCollapsed && (
          <div style={{ padding: "15px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", minWidth: "280px" }}>
            <button
              onClick={() => setIsCatalogOpen(true)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(166, 124, 30, 0.05) 100%)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                borderRadius: "8px",
                color: "var(--accent-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "Playfair Display, serif",
                fontSize: "0.85rem",
                letterSpacing: "2px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(166, 124, 30, 0.1) 100%)";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(234, 179, 8, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(166, 124, 30, 0.05) 100%)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Library size={15} style={{ color: "var(--accent-color)" }} />
              図書総目録を開く
            </button>
          </div>
        )}

        <style>{`
          .group-actions {
            opacity: 0;
            transform: translateX(10px);
            transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
            pointer-events: none;
          }
          .book-spine:hover .group-actions {
            opacity: 1;
            transform: translateX(0);
            pointer-events: auto;
          }
          .group-count {
            opacity: 1;
            transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .book-spine:hover .group-count {
            opacity: 0;
            transform: translateX(-10px);
            pointer-events: none;
          }
        `}</style>
      </div>

      <MasterCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        groups={groups}
        onSelectGroup={onSelectGroup}
      />

      {/* 枠外の折りたたみトグルボタン */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          top: "22px",
          right: isCollapsed ? "-40px" : "-16px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "var(--panel-bg)",
          border: "1px solid var(--border-color)",
          color: "var(--accent-color)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          backdropFilter: "var(--glass-blur)",
          transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          zIndex: 60,
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  );
}

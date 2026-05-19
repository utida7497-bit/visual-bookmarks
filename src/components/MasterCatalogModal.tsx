"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Library, Search, ArrowUpRight, Star } from "lucide-react";

interface BookmarkItem {
  id: number;
  group_id: number | null;
  url: string;
  title: string;
  image_url: string | null;
  summary: string | null;
  memo: string | null;
  is_favorite: boolean | number;
  created_at: string;
}

interface Group {
  id: number;
  name: string;
  bookmark_count?: number;
}

interface MasterCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onSelectGroup: (id: number | string | null) => void;
}

export default function MasterCatalogModal({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
}: MasterCatalogModalProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAllBookmarks = async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/bookmarks");
          if (res.ok) {
            const data = await res.json();
            setBookmarks(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error("Catalog fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllBookmarks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 検索条件に合致するブックマークをフィルタリング
  const filteredBookmarks = bookmarks.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.url?.toLowerCase().includes(q) ||
      b.summary?.toLowerCase().includes(q) ||
      b.memo?.toLowerCase().includes(q)
    );
  });

  // グループIDごとにブックマークをマッピング
  const getBookmarksForGroup = (groupId: number, groupName: string) => {
    return filteredBookmarks.filter((b) => {
      // 「未分類」グループの場合、group_idが一致するか、もしくはnull/undefinedのものを集約する
      if (groupName === "未分類") {
        return b.group_id === groupId || b.group_id === null;
      }
      return b.group_id === groupId;
    });
  };

  const totalCount = bookmarks.length;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      {/* 羊皮紙・アンティーク台帳調のコンテナ */}
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          height: "85vh",
          background: "#faf5eb", // セピアがかった紙の色
          backgroundImage: "radial-gradient(circle, #fcfaf2 0%, #f5ecd8 100%)",
          border: "8px double #8c6a3c", // 二重線ゴールド枠
          borderRadius: "4px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 0 100px rgba(140, 106, 60, 0.15)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          color: "#2c1d11", // セピアダークブラウン
          overflow: "hidden",
          animation: "catalogOpen 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div
          style={{
            padding: "25px 30px 15px",
            borderBottom: "1px dashed rgba(140, 106, 60, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Library size={24} style={{ color: "#8c6a3c" }} />
            <div>
              <h2
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                  letterSpacing: "3px",
                  color: "#54381d",
                  margin: 0,
                }}
              >
                図書総目録
              </h2>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "0.75rem",
                  color: "#8c6a3c",
                  fontFamily: "Playfair Display, serif",
                  letterSpacing: "1px",
                }}
              >
                MASTER CATALOG INDEX &bull; 総蔵書数 {totalCount} 冊
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid rgba(140, 106, 60, 0.3)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#8c6a3c",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(140, 106, 60, 0.1)";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 検索・コントロールエリア */}
        <div style={{ padding: "15px 30px", display: "flex", gap: "15px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8c6a3c",
              }}
            />
            <input
              type="text"
              placeholder="目録カードから絞り込み検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 40px",
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(140, 106, 60, 0.4)",
                borderRadius: "6px",
                fontSize: "0.85rem",
                color: "#2c1d11",
                outline: "none",
                fontFamily: "Playfair Display, serif",
              }}
            />
          </div>
        </div>

        {/* 目録リスト（スクロール領域） */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 30px 30px",
          }}
          className="catalog-scroll"
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#8c6a3c", fontSize: "0.9rem" }}>
              目録台帳を開いています...
            </div>
          ) : (
            groups.map((group) => {
              const groupBookmarks = getBookmarksForGroup(group.id, group.name);

              return (
                <div key={group.id} style={{ marginBottom: "25px" }}>
                  {/* 本棚（グループ）の見出し */}
                  <div
                    style={{
                      borderBottom: "2px solid #8c6a3c",
                      paddingBottom: "6px",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontSize: "1.05rem",
                        fontWeight: "bold",
                        color: "#54381d",
                        margin: 0,
                        letterSpacing: "1px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      📖 {group.name}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(140, 106, 60, 0.15)",
                          color: "#8c6a3c",
                          padding: "1px 6px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        {groupBookmarks.length} 冊
                      </span>
                    </h3>

                    <button
                      onClick={() => {
                        onSelectGroup(group.id);
                        onClose();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8c6a3c",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(140, 106, 60, 0.1)";
                        e.currentTarget.style.color = "#54381d";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#8c6a3c";
                      }}
                    >
                      この本棚へ移動
                      <ArrowUpRight size={12} />
                    </button>
                  </div>

                  {/* その棚に入っている蔵書リスト */}
                  {groupBookmarks.length === 0 ? (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(140, 106, 60, 0.6)",
                        fontStyle: "italic",
                        padding: "8px 10px",
                      }}
                    >
                      この棚には現在、蔵書がありません。
                    </div>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {groupBookmarks.map((b) => (
                        <li
                          key={b.id}
                          style={{
                            padding: "10px",
                            borderBottom: "1px dashed rgba(140, 106, 60, 0.15)",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "20px",
                            transition: "background-color 0.2s ease",
                          }}
                          className="catalog-item"
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <a
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#3d220a",
                                  fontWeight: "600",
                                  fontSize: "0.88rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                              >
                                {b.title || b.url}
                                <ExternalLink size={12} style={{ opacity: 0.6 }} />
                              </a>

                              {/* お気に入りスターバッジ */}
                              {Boolean(b.is_favorite) && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "2px",
                                    fontSize: "0.7rem",
                                    background: "rgba(234, 179, 8, 0.2)",
                                    color: "#a67c1e",
                                    border: "1px solid rgba(234, 179, 8, 0.3)",
                                    padding: "0 6px",
                                    borderRadius: "10px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  <Star size={8} fill="#a67c1e" stroke="none" />
                                  お気に入り
                                </span>
                              )}
                            </div>

                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: "0.75rem",
                                color: "#6e523a",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "580px",
                              }}
                            >
                              {b.url}
                            </p>

                            {(b.summary || b.memo) && (
                              <p
                                style={{
                                  margin: "6px 0 0",
                                  fontSize: "0.75rem",
                                  color: "#8c6a3c",
                                  fontStyle: "italic",
                                  paddingLeft: "8px",
                                  borderLeft: "2px solid rgba(140, 106, 60, 0.3)",
                                }}
                              >
                                {b.memo || b.summary}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes catalogOpen {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .catalog-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .catalog-scroll::-webkit-scrollbar-track {
          background: rgba(140, 106, 60, 0.05);
          border-radius: 4px;
        }
        .catalog-scroll::-webkit-scrollbar-thumb {
          background: rgba(140, 106, 60, 0.3);
          border-radius: 4px;
        }
        .catalog-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(140, 106, 60, 0.5);
        }
        .catalog-item:hover {
          background-color: rgba(140, 106, 60, 0.04);
        }
      `}</style>
    </div>
  );
}

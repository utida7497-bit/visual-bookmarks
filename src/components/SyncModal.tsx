"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface SyncModalProps {
  onClose: () => void;
}

export default function SyncModal({ onClose }: SyncModalProps) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // 認証情報を埋め込んだURLを生成
    // 形式: https://user:pass@domain.com
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // 環境変数から取得するのが理想的ですが、
    // クライアントサイドで生成するため、デフォルト値をセットします
    // ※後ほど page.tsx から props で渡すように改良も可能です
    const user = "admin"; 
    const pass = "password";

    const authUrl = `${protocol}//${user}:${pass}@${host}`;
    setCurrentUrl(authUrl);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }} onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{
          padding: "40px",
          textAlign: "center",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "1.5rem" }}>スマートフォンと連携</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          スマホでスキャンすると、パスワード入力なしでこの図書館にアクセスできます。
        </p>
        
        <div style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "16px",
          display: "inline-block",
          margin: "0 auto"
        }}>
          {currentUrl && (
            <QRCodeSVG value={currentUrl} size={200} />
          )}
        </div>

        <p style={{ fontSize: "0.8rem", color: "var(--accent-color)" }}>
          ※ ngrokなどで外部公開している場合、そのURLでQRが生成されます。
        </p>

        <button 
          onClick={onClose}
          style={{
            padding: "12px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            color: "white",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

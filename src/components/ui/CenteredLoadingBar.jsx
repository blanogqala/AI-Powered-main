"use client"

import { FaTimes } from "react-icons/fa"

export default function CenteredLoadingBar({ label = "Loading...", onCancel, spinner, style = {} }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        background: "rgba(255, 107, 107, 0.1)",
        backdropFilter: "blur(8px)",
        ...style.overlay,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 400,
          minWidth: 320,
          maxWidth: 450,
          minHeight: 160,
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(255, 107, 107, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem 2rem",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          overflow: "hidden",
          ...style.container,
        }}
      >
        {/* Decorative top border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #ff6b6b, #ffa726, #66bb6a)",
            borderRadius: "24px 24px 0 0",
          }}
        />

        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label="Cancel"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#ff6b6b",
            cursor: "pointer",
            zIndex: 2,
            transition: "all 0.3s ease",
            ...style.closeBtn,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 107, 107, 0.2)"
            e.target.style.transform = "scale(1.1) rotate(90deg)"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 107, 107, 0.1)"
            e.target.style.transform = "scale(1) rotate(0deg)"
          }}
        >
          <FaTimes />
        </button>

        {/* Enhanced Spinner */}
        {spinner || (
          <div
            style={{
              position: "relative",
              marginBottom: 24,
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                width: 64,
                height: 64,
                border: "4px solid rgba(255, 107, 107, 0.1)",
                borderTop: "4px solid #ff6b6b",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            {/* Inner ring */}
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                width: 48,
                height: 48,
                border: "3px solid rgba(255, 167, 38, 0.1)",
                borderBottom: "3px solid #ffa726",
                borderRadius: "50%",
                animation: "spin 1.5s linear infinite reverse",
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* Enhanced Label */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {label}
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "#666",
            fontSize: 14,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          This may take a few moments...
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: 4,
            background: "rgba(255, 107, 107, 0.1)",
            borderRadius: 2,
            marginTop: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #ff6b6b, #ffa726)",
              borderRadius: 2,
              animation: "progress 2s ease-in-out infinite",
            }}
          />
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
            }
            
            @keyframes progress {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 100%; }
            }
          `}
        </style>
      </div>
    </div>
  )
} 
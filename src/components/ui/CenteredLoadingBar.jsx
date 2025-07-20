import React from "react";

export default function CenteredLoadingBar({ label = "Loading...", onCancel, spinner, style = {} }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      background: 'rgba(100, 100, 100, 0.15)',
      ...style.overlay
    }}>
      <div style={{
        position: 'relative',
        width: 360,
        minWidth: 300,
        maxWidth: 400,
        height: 140,
        minHeight: 100,
        maxHeight: 200,
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(31,38,135,0.13)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        ...style.container
      }}>
        {/* X icon */}
        <button
          onClick={onCancel}
          aria-label="Cancel"
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: '#888',
            cursor: 'pointer',
            zIndex: 2,
            ...style.closeBtn
          }}
        >
          &#10005;
        </button>
        {/* Spinner */}
        {spinner || (
          <div style={{
            width: 48,
            height: 48,
            border: '6px solid #e0e0e0',
            borderTop: '6px solid #3576d3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 18
          }} />
        )}
        {/* Label */}
        <div style={{ fontWeight: 700, fontSize: 18, color: '#3576d3', textAlign: 'center', marginBottom: 0 }}>{label}</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
} 
"use client"

import { FaCheck, FaArrowRight, FaClock, FaRocket } from "react-icons/fa"

export default function ProgressFooter({ lessonId, isComplete, onMarkComplete, onNextLesson, progress }) {
  async function saveProgress({ userId, courseId, lessonId }) {
    try {
      await fetch("/api/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId, lessonId }),
      })
    } catch (err) {
      console.error("Failed to save progress", err)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginTop: 40,
        padding: "2rem 2.5rem",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)",
        borderRadius: 16,
        border: "1px solid rgba(255, 107, 107, 0.1)",
        boxShadow: "0 4px 20px rgba(255, 107, 107, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gradient line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #ff6b6b, #ffa726, #66bb6a)",
        }}
      />

      {/* Mark Complete Button */}
      <button
        onClick={onMarkComplete}
        disabled={isComplete}
        style={{
          background: isComplete
            ? "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)"
            : "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "1rem 2rem",
          fontWeight: 700,
          fontSize: 16,
          cursor: isComplete ? "default" : "pointer",
          opacity: isComplete ? 0.9 : 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: isComplete ? "0 4px 15px rgba(102, 187, 106, 0.3)" : "0 4px 15px rgba(255, 107, 107, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          if (!isComplete) {
            e.target.style.transform = "translateY(-2px)"
            e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)"
          }
        }}
        onMouseLeave={(e) => {
          if (!isComplete) {
            e.target.style.transform = "translateY(0)"
            e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)"
          }
        }}
      >
        {/* Shimmer effect for incomplete button */}
        {!isComplete && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
              transition: "left 0.6s",
              pointerEvents: "none",
            }}
            className="shimmer"
          />
        )}
        {isComplete ? (
          <>
            <FaCheck style={{ fontSize: 18 }} />
            Completed
          </>
        ) : (
          <>
            <FaRocket style={{ fontSize: 18 }} />
            Mark as Complete
          </>
        )}
      </button>

      {/* Next Lesson Button */}
      <button
        onClick={onNextLesson}
        style={{
          background: "linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)",
          color: "#42a5f5",
          border: "2px solid rgba(66, 165, 245, 0.2)",
          borderRadius: 12,
          padding: "1rem 2rem",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={(e) => {
          e.target.style.background =
            "linear-gradient(135deg, rgba(66, 165, 245, 0.15) 0%, rgba(102, 187, 106, 0.15) 100%)"
          e.target.style.transform = "translateY(-2px)"
          e.target.style.boxShadow = "0 4px 15px rgba(66, 165, 245, 0.2)"
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            "linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)"
          e.target.style.transform = "translateY(0)"
          e.target.style.boxShadow = "none"
        }}
      >
        <FaArrowRight style={{ fontSize: 16 }} />
        Next Lesson
      </button>

      {/* Enhanced Progress Display */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0.8rem 1.5rem",
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: 12,
          border: "1px solid rgba(255, 107, 107, 0.1)",
        }}
      >
        <FaClock style={{ color: "#ffa726", fontSize: 18 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              color: "#666",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Progress:
          </span>
          <span
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {progress}%
          </span>
        </div>
        {/* Mini progress bar */}
        <div
          style={{
            width: 60,
            height: 6,
            background: "rgba(255, 107, 107, 0.1)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ff6b6b, #ffa726)",
              borderRadius: 3,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      <style>
        {`
          button:hover .shimmer {
            left: 100%;
          }
        `}
      </style>
    </div>
  )
} 
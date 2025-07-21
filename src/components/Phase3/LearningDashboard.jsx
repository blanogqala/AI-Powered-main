"use client"

import { FaPlay, FaTrophy, FaClock, FaRocket } from "react-icons/fa"

export default function LearningDashboard({
  progress = 0,
  currentModule = "Module 1: Introduction",
  currentLesson = "Lesson 1: Getting Started",
  achievements = [],
  onContinue,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 750,
        margin: "2rem auto",
        padding: "0 1rem",
      }}
    >
      {/* Enhanced Progress Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(255, 107, 107, 0.12)",
          padding: "2rem 2.5rem",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #ff6b6b, #ffa726, #66bb6a)",
            borderRadius: "20px 20px 0 0",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <FaClock style={{ color: "#ffa726", fontSize: 24 }} />
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Learning Progress: {progress}%
          </div>
        </div>
        <div
          style={{
            background: "rgba(255, 107, 107, 0.1)",
            borderRadius: 12,
            height: 20,
            width: "100%",
            overflow: "hidden",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            position: "relative",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #ff6b6b 0%, #ffa726 50%, #66bb6a 100%)",
              height: "100%",
              borderRadius: 12,
              width: `${progress}%`,
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
            }}
          >
            {progress > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  animation: "shimmer 2s infinite",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Current Module Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
          borderRadius: 20,
          padding: "2rem 2.5rem",
          boxShadow: "0 4px 20px rgba(255, 107, 107, 0.08)",
          border: "2px solid rgba(255, 107, 107, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            fontSize: 60,
            opacity: 0.1,
          }}
        >
          📚
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: 22,
              fontWeight: 700,
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaRocket style={{ color: "#ff6b6b", fontSize: 20 }} />
            {currentModule}
          </h3>
          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {currentLesson}
          </p>
        </div>
        <button
          style={{
            background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "1rem 2rem",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onClick={onContinue}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)"
            e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)"
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)"
            e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)"
          }}
        >
          <FaPlay style={{ fontSize: 14 }} />
          Continue Learning
        </button>
      </div>

      {/* Enhanced Achievements Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          padding: "2rem 2.5rem",
          boxShadow: "0 8px 32px rgba(255, 107, 107, 0.12)",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #66bb6a, #42a5f5, #ab47bc)",
            borderRadius: "20px 20px 0 0",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <FaTrophy style={{ color: "#ffa726", fontSize: 24 }} />
          <h4
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              background: "linear-gradient(135deg, #66bb6a 0%, #42a5f5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Achievements & Badges
          </h4>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {achievements.length === 0 ? (
            <div
              style={{
                color: "#888",
                fontStyle: "italic",
                fontSize: 16,
                padding: "2rem",
                textAlign: "center",
                width: "100%",
                background: "rgba(255, 167, 38, 0.05)",
                borderRadius: 12,
                border: "2px dashed rgba(255, 167, 38, 0.2)",
              }}
            >
              🏆 No badges earned yet - keep learning to unlock achievements!
            </div>
          ) : (
            achievements.map((badge, i) => {
              const badgeColors = ["#66bb6a", "#42a5f5", "#ab47bc", "#ffa726", "#ff6b6b"]
              const color = badgeColors[i % badgeColors.length]
              return (
                <span
                  key={i}
                  style={{
                    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                    color: color,
                    borderRadius: 12,
                    padding: "0.8rem 1.2rem",
                    fontWeight: 600,
                    fontSize: 14,
                    border: `2px solid ${color}20`,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)"
                    e.target.style.boxShadow = `0 4px 15px ${color}20`
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  🏅 {badge}
                </span>
              )
            })
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  )
}

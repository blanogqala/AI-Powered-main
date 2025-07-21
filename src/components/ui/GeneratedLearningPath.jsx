"use client"

import { useState, useEffect } from "react"
import { FaPlay, FaBook, FaExternalLinkAlt, FaClock, FaGraduationCap, FaRocket } from "react-icons/fa"

export default function GeneratedLearningPath({ result, formData, onStartLearning, userId, setEnrolling }) {
  const [tab, setTab] = useState("curriculum")
  const [resources, setResources] = useState(null)
  const [loadingResources, setLoadingResources] = useState(false)
  const modules = result.curriculum ? Object.entries(result.curriculum) : []
  const resourcesArr = resources ? Object.entries(resources) : []

  // Flatten all resources into a single array (remove week grouping)
  const allResources = resourcesArr.flatMap(([_, res]) => (Array.isArray(res) ? res : [res]))

  // Fetch resources on demand
  useEffect(() => {
    if (tab === "resources" && !resources && !loadingResources) {
      setLoadingResources(true)
      fetch("/api/generate-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: result.title,
          timeline: formData.timeline,
          level: formData.level,
          userId,
        }),
      })
        .then((res) => res.json())
        .then((data) => setResources(data.resources))
        .catch(() => setResources({}))
        .finally(() => setLoadingResources(false))
    }
  }, [tab])

  // Handle enrollment
  const handleStartLearning = async () => {
    try {
      if (setEnrolling) setEnrolling(true) // Show loading overlay
      await fetch("/api/enroll-learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, learningPath: result }),
      })
      // Remove from recommendedPaths in localStorage
      const recKey = `recommendedPaths_${userId}`
      let recArr = JSON.parse(localStorage.getItem(recKey) || "[]")
      recArr = recArr.filter((lp) => lp.title !== result.title)
      localStorage.setItem(recKey, JSON.stringify(recArr))
      if (onStartLearning) onStartLearning()
    } catch (err) {
      alert("Failed to enroll in this learning path.")
    } finally {
      if (setEnrolling) setEnrolling(false) // Hide loading overlay
    }
  }

  // Helper: Render curriculum with week/module/lessons
  function renderCurriculum() {
    const moduleColors = [
      { bg: "linear-gradient(135deg, #ff6b6b15 0%, #ff8a8015 100%)", accent: "#ff6b6b", icon: "🎯" },
      { bg: "linear-gradient(135deg, #ffa72615 0%, #ffcc0215 100%)", accent: "#ffa726", icon: "🚀" },
      { bg: "linear-gradient(135deg, #66bb6a15 0%, #81c78415 100%)", accent: "#66bb6a", icon: "💡" },
      { bg: "linear-gradient(135deg, #42a5f515 0%, #64b5f615 100%)", accent: "#42a5f5", icon: "⭐" },
      { bg: "linear-gradient(135deg, #ab47bc15 0%, #ba68c815 100%)", accent: "#ab47bc", icon: "🎨" },
      { bg: "linear-gradient(135deg, #ef535015 0%, #f48fb115 100%)", accent: "#ef5350", icon: "🔥" },
    ]

    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <FaBook style={{ color: "#ff6b6b", fontSize: 24 }} />
          <h4
            style={{
              color: "#ff6b6b",
              margin: 0,
              fontWeight: 700,
              fontSize: 24,
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Learning Curriculum
          </h4>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {modules.map(([week, module], idx) => {
            // If module is an object with header/lessons, use that, else fallback
            let header = `Module: ${Array.isArray(module) ? module[0] : module}`
            let lessons = Array.isArray(module) ? module : [module]
            if (typeof module === "object" && module !== null && module.header && module.lessons) {
              header = module.header
              lessons = module.lessons
            }

            const colorScheme = moduleColors[idx % moduleColors.length]

            return (
              <div
                key={week}
                style={{
                  background: colorScheme.bg,
                  borderRadius: 16,
                  boxShadow: `0 4px 20px ${colorScheme.accent}10`,
                  padding: "1.5rem 1.8rem",
                  minWidth: 280,
                  flex: "1 1 280px",
                  marginBottom: 16,
                  border: `2px solid ${colorScheme.accent}20`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.boxShadow = `0 8px 30px ${colorScheme.accent}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = `0 4px 20px ${colorScheme.accent}10`
                }}
              >
                {/* Decorative corner */}
                <div
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    width: 32,
                    height: 32,
                    background: `${colorScheme.accent}20`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {colorScheme.icon}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: colorScheme.accent,
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FaClock style={{ fontSize: 14 }} />
                  {week}
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 18,
                    lineHeight: 1.3,
                  }}
                >
                  {header}
                </div>

                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {lessons.map((lesson, tIdx) => (
                    <li
                      key={tIdx}
                      style={{
                        color: "#555",
                        fontSize: 15,
                        marginBottom: 8,
                        paddingLeft: 20,
                        position: "relative",
                        lineHeight: 1.4,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 6,
                          height: 6,
                          background: colorScheme.accent,
                          borderRadius: "50%",
                        }}
                      />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Helper: Render resources with links
  function renderResources() {
    return (
      <div style={{ padding: 8 }}>
        {loadingResources ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div
              style={{
                width: 60,
                height: 60,
                border: "6px solid rgba(255, 107, 107, 0.1)",
                borderTop: "6px solid #ff6b6b",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <FaExternalLinkAlt style={{ color: "#ffa726", fontSize: 22 }} />
              <h4
                style={{
                  fontWeight: 700,
                  color: "#ffa726",
                  margin: 0,
                  fontSize: 22,
                  background: "linear-gradient(135deg, #ffa726 0%, #66bb6a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Learning Resources
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {allResources.length === 0 && (
                <div
                  style={{
                    color: "#888",
                    textAlign: "center",
                    padding: "2rem",
                    background: "rgba(255, 167, 38, 0.05)",
                    borderRadius: 12,
                    border: "2px dashed rgba(255, 167, 38, 0.2)",
                  }}
                >
                  📚 No resources available yet
                </div>
              )}
              {allResources.map((res, idx) => {
                const name = typeof res === "string" ? res : res.title || res.name || "Resource"
                let url = typeof res === "object" && res.url ? res.url : null
                if (!url && typeof res === "string") {
                  const match = res.match(/(https?:\/\/[^"]+)/)
                  if (match) url = match[1]
                }

                const resourceColors = ["#ff6b6b", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#ef5350"]
                const color = resourceColors[idx % resourceColors.length]

                return (
                  <div
                    key={idx}
                    style={{
                      background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
                      borderRadius: 12,
                      boxShadow: `0 2px 12px ${color}10`,
                      padding: "1.2rem 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      border: `1px solid ${color}15`,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = `0 4px 20px ${color}20`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = `0 2px 12px ${color}10`
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: `${color}15`,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: color,
                        fontSize: 18,
                      }}
                    >
                      📖
                    </div>
                    <span style={{ fontWeight: 500, color: "#333", flex: 1, fontSize: 16 }}>{name}</span>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: color,
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "0.5rem 1rem",
                          background: `${color}10`,
                          borderRadius: 8,
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = `${color}20`
                          e.target.style.transform = "scale(1.05)"
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = `${color}10`
                          e.target.style.transform = "scale(1)"
                        }}
                      >
                        <FaExternalLinkAlt style={{ fontSize: 14 }} />
                        View
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        minWidth: "80vw",
        minHeight: "70vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        padding: "2.5rem 2rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title and Description */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 32,
            background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #66bb6a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FaRocket style={{ color: "#ff6b6b", fontSize: 28 }} />
          {result.title}
        </div>
        <div
          style={{
            color: "#555",
            fontSize: 18,
            marginBottom: 12,
            lineHeight: 1.5,
            padding: "1rem 1.5rem",
            background: "linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 167, 38, 0.05) 100%)",
            borderRadius: 12,
            border: "1px solid rgba(255, 107, 107, 0.1)",
          }}
        >
          {result.description}
        </div>
      </div>

      {/* Summary Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          marginBottom: 24,
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(255, 107, 107, 0.08)",
          border: "1px solid rgba(255, 107, 107, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.8rem 1.2rem",
              background: "linear-gradient(135deg, #ff6b6b15 0%, #ffa72615 100%)",
              borderRadius: 12,
              border: "1px solid rgba(255, 107, 107, 0.2)",
            }}
          >
            <FaBook style={{ color: "#ff6b6b", fontSize: 18 }} />
        <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#ff6b6b" }}>{modules.length} modules</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#666",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            <FaClock style={{ color: "#ffa726" }} />
            {formData.timeline} months
            <span style={{ margin: "0 8px", color: "#ddd" }}>|</span>
            <FaGraduationCap style={{ color: "#66bb6a" }} />
            {formData.level}
          </div>
        </div>

        <button
          style={{
            marginLeft: "auto",
            background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "1rem 2rem",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onClick={handleStartLearning}
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
          Start Learning
        </button>
      </div>

      {/* Enhanced Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: 20,
          background: "rgba(255, 255, 255, 0.6)",
          padding: "0.5rem",
          borderRadius: 12,
          border: "1px solid rgba(255, 107, 107, 0.1)",
        }}
      >
        {["curriculum", "resources"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)" : "transparent",
              border: "none",
              color: tab === t ? "#fff" : "#666",
              fontWeight: tab === t ? 700 : 500,
              fontSize: 16,
              padding: "0.8rem 1.5rem",
              cursor: "pointer",
              borderRadius: 8,
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (tab !== t) {
                e.target.style.background = "rgba(255, 107, 107, 0.1)"
                e.target.style.color = "#ff6b6b"
              }
            }}
            onMouseLeave={(e) => {
              if (tab !== t) {
                e.target.style.background = "transparent"
                e.target.style.color = "#666"
              }
            }}
          >
            {t === "curriculum" ? <FaBook /> : <FaExternalLinkAlt />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          maxHeight: 400,
          marginBottom: 12,
          textAlign: "left",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)",
          borderRadius: 16,
          padding: "2rem 2.5rem",
          boxShadow: "0 4px 20px rgba(255, 107, 107, 0.08)",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          overflowY: "auto",
        }}
      >
        {tab === "curriculum" && renderCurriculum()}
        {tab === "resources" && renderResources()}
      </div>
    </div>
  )
} 
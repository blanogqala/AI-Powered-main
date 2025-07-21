"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import LessonView from "../components/Phase4/LessonView"
import { useUser } from "../context/UserContext"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import CenteredLoadingBar from "../components/ui/CenteredLoadingBar"
import { FaArrowLeft, FaClock, FaPlay, FaCheck, FaTrophy, FaCreditCard } from "react-icons/fa"

const API_URL = process.env.REACT_APP_API_URL || ""

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

// Helper to generate subtopics/lessons from module object
function getSubtopics(module) {
  if (module && typeof module === "object" && Array.isArray(module.lessons)) {
    return module.lessons
  }
  if (typeof module === "string" && module.includes(",")) {
    return module.split(",").map((s) => s.trim())
  }
  if (typeof module === "string") {
    return [`${module} - Basics`, `${module} - Applications`, `${module} - Advanced Concepts`]
  }
  return []
}

export default function Lesson() {
  const { user } = useUser()
  const query = useQuery()
  const courseTitle = query.get("course")
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState(null)
  const [selectedSubtopic, setSelectedSubtopic] = useState({ moduleIdx: 0, subIdx: 0 })
  const [lessonContent, setLessonContent] = useState(null)
  const [completedTopics, setCompletedTopics] = useState([]) // [{moduleIdx, subIdx}]
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lessonAbortController, setLessonAbortController] = useState(null)

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/my-courses?userId=${user?.uid || "demoUser"}`)
        const data = await res.json()
        const found = (data.enrollments || []).find((c) => c.title === courseTitle)
        setCourse(found || null)
        // Load completed topics from localStorage
        const saved = localStorage.getItem(`completedTopics_${encodeURIComponent(courseTitle)}`)
        if (saved) {
          const { completedTopics, progress } = JSON.parse(saved)
          setCompletedTopics(completedTopics)
          setProgress(progress)
        }
      } catch {
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }
    if (courseTitle) fetchCourse()
  }, [courseTitle, user])

  // Fetch lesson content, quiz, and project for selected subtopic
  useEffect(() => {
    async function fetchLesson() {
      if (!course) return
      const modules = Object.entries(course.curriculum || {})
      const [modKey, modObj] = modules[selectedSubtopic.moduleIdx]
      const subtopics = getSubtopics(modObj)
      const subtopic = subtopics[selectedSubtopic.subIdx]
      setLessonContent(null)
      setLessonLoading(true)
      const controller = new AbortController()
      setLessonAbortController(controller)

      const payload = {
        userId: user?.uid || "demoUser",
        courseTitle: course.title,
        moduleTitle: modObj.header || modKey,
        subtopic,
        level: course.level || "Beginner",
        timeline: course.timeline || 3,
      }

      try {
        const res = await fetch(`${API_URL}/api/generate-lesson`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        const data = await res.json()
        setLessonContent(data)
      } catch (err) {
        if (err.name !== "AbortError") {
          setLessonContent({
            lesson: {
              title: subtopic,
              objectives: [`Understand the basics of ${subtopic}`, `Apply ${subtopic} in practice`],
              body: `Welcome to ${subtopic}! (AI content unavailable)`,
              summary: `Key takeaways for ${subtopic}`,
            },
            quiz: [],
            project: null,
          })
        }
      } finally {
        setLessonLoading(false)
        setLessonAbortController(null)
      }
    }
    if (course) fetchLesson()
  }, [course, selectedSubtopic, user])

  // Update progress when completedTopics changes
  useEffect(() => {
    if (!course) return
    const modules = Object.entries(course.curriculum || {})
    let totalTopics = 0
    modules.forEach(([_, modObj]) => {
      totalTopics += getSubtopics(modObj).length
    })
    const prog = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0
    setProgress(prog)
    localStorage.setItem(
      `completedTopics_${encodeURIComponent(courseTitle)}`,
      JSON.stringify({ completedTopics, progress: prog }),
    )
  }, [completedTopics, course, courseTitle])

  // Save badge to backend when course is completed
  useEffect(() => {
    if (progress === 100 && course) {
      const saveBadge = async () => {
        try {
          await fetch(`${API_URL}/api/complete-course`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.uid || "demoUser",
              course: {
                title: course.title,
                description: course.description,
                level: course.level,
                timeline: course.timeline,
                completedAt: Date.now(),
              },
            }),
          })
        } catch {
          localStorage.setItem(
            `badge_${encodeURIComponent(course.title)}`,
            JSON.stringify({ ...course, completedAt: Date.now() }),
          )
        }
      }
      saveBadge()
    }
  }, [progress, course, user])

  const handleCancelLessonLoad = () => {
    if (lessonAbortController) lessonAbortController.abort()
    setLessonLoading(false)
    setLessonAbortController(null)
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #fef7f0 0%, #fff5f5 50%, #f0f9ff 100%)",
        }}
      >
        {/* Sidebar skeleton */}
        <aside
          style={{
            width: 340,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "4px 0 20px rgba(255, 107, 107, 0.08)",
            display: "flex",
            flexDirection: "column",
            padding: "2.5rem 1.5rem",
            gap: 20,
            minHeight: "100vh",
            position: "sticky",
            top: 0,
            border: "1px solid rgba(255, 107, 107, 0.1)",
          }}
        >
          <Skeleton height={32} width={200} style={{ marginBottom: 20 }} />
          <Skeleton height={16} width={140} style={{ marginBottom: 20 }} />
          {[...Array(3)].map((_, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <Skeleton height={28} width={220} style={{ marginBottom: 10 }} />
              <Skeleton height={20} width={200} count={2} style={{ marginBottom: 6 }} />
            </div>
          ))}
        </aside>
        {/* Main content skeleton */}
        <main
          style={{
            flex: 1,
            padding: "2.5rem 2.5rem 2.5rem 2rem",
            minHeight: "100vh",
            position: "relative",
          }}
        >
          <Skeleton height={42} width={360} style={{ marginBottom: 28 }} />
          <Skeleton height={28} width={200} style={{ marginBottom: 20 }} />
          <Skeleton height={20} width="85%" count={8} style={{ marginBottom: 12 }} />
        </main>
      </div>
    )

  if (!course)
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          color: "#ff5252",
          background: "linear-gradient(135deg, #fef7f0 0%, #fff5f5 50%, #f0f9ff 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        📚 Course not found.
      </div>
    )

  const modules = Object.entries(course.curriculum || {})

  // Helper: is topic completed?
  const isTopicCompleted = (moduleIdx, subIdx) =>
    completedTopics.some((t) => t.moduleIdx === moduleIdx && t.subIdx === subIdx)
  // Helper: is module completed?
  const isModuleCompleted = (mIdx) => {
    const subtopics = getSubtopics(modules[mIdx][1])
    return subtopics.every((_, sIdx) => isTopicCompleted(mIdx, sIdx))
  }
  // Helper: get current module/week
  const currentModuleIdx = selectedSubtopic.moduleIdx

  // Handler: mark topic as complete and go to next
  const handleCompleteOrNext = () => {
    const { moduleIdx, subIdx } = selectedSubtopic
    if (!isTopicCompleted(moduleIdx, subIdx)) {
      setCompletedTopics((prev) => [...prev, { moduleIdx, subIdx }])
    }
    // Go to next topic if exists
    const subtopics = getSubtopics(modules[moduleIdx][1])
    if (subIdx + 1 < subtopics.length) {
      setSelectedSubtopic({ moduleIdx, subIdx: subIdx + 1 })
    } else if (moduleIdx + 1 < modules.length) {
      setExpandedModule(moduleIdx + 1)
      setSelectedSubtopic({ moduleIdx: moduleIdx + 1, subIdx: 0 })
    }
  }

  const moduleColors = [
    { bg: "linear-gradient(135deg, #ff6b6b15 0%, #ff8a8015 100%)", accent: "#ff6b6b", icon: "🎯" },
    { bg: "linear-gradient(135deg, #ffa72615 0%, #ffcc0215 100%)", accent: "#ffa726", icon: "🚀" },
    { bg: "linear-gradient(135deg, #66bb6a15 0%, #81c78415 100%)", accent: "#66bb6a", icon: "💡" },
    { bg: "linear-gradient(135deg, #42a5f515 0%, #64b5f615 100%)", accent: "#42a5f5", icon: "⭐" },
    { bg: "linear-gradient(135deg, #ab47bc15 0%, #ba68c815 100%)", accent: "#ab47bc", icon: "🎨" },
    { bg: "linear-gradient(135deg, #ef535015 0%, #f48fb115 100%)", accent: "#ef5350", icon: "🔥" },
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fef7f0 0%, #fff5f5 50%, #f0f9ff 100%)",
      }}
    >
      {lessonLoading && <CenteredLoadingBar label="Loading lesson content..." onCancel={handleCancelLessonLoad} />}

      {/* Enhanced Timeline Navigation Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "2.5rem 0 1.5rem 0",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 107, 107, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          boxShadow: "0 4px 20px rgba(255, 107, 107, 0.08)",
        }}
      >
        {modules.map(([modKey, modObj], mIdx) => {
          const completed = isModuleCompleted(mIdx)
          const isCurrent = mIdx === currentModuleIdx
          const moduleDesc = modObj.description || ""
          const colorScheme = moduleColors[mIdx % moduleColors.length]

          return (
            <div
              key={modKey}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: "0.5rem",
                borderRadius: 12,
              }}
              onClick={() => {
                setExpandedModule(mIdx)
                setSelectedSubtopic({ moduleIdx: mIdx, subIdx: 0 })
              }}
              title={moduleDesc ? `Module ${mIdx + 1}: ${moduleDesc}` : `Module ${mIdx + 1}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.background = `${colorScheme.accent}10`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.background = "transparent"
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: completed
                    ? "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)"
                    : isCurrent
                      ? `linear-gradient(135deg, ${colorScheme.accent} 0%, ${colorScheme.accent}80 100%)`
                      : "rgba(255, 255, 255, 0.8)",
                  color: completed || isCurrent ? "#fff" : colorScheme.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  border: isCurrent ? `3px solid ${colorScheme.accent}` : `2px solid ${colorScheme.accent}20`,
                  boxShadow: isCurrent
                    ? `0 0 0 3px ${colorScheme.accent}20`
                    : completed
                      ? "0 4px 15px rgba(102, 187, 106, 0.3)"
                      : "0 2px 8px rgba(255, 107, 107, 0.1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  marginBottom: 8,
                }}
              >
                {completed ? <FaCheck /> : colorScheme.icon}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: isCurrent ? colorScheme.accent : "#666",
                  fontWeight: isCurrent ? 700 : 500,
                  maxWidth: 90,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                Week {mIdx + 1}
              </div>
            </div>
          )
        })}
      </div>

      {/* Main content split: sidebar + lesson */}
      <div style={{ display: "flex" }}>
        {/* Enhanced Sidebar */}
        <aside
          style={{
            width: 360,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "4px 0 20px rgba(255, 107, 107, 0.08)",
            display: "flex",
            flexDirection: "column",
            padding: "2.5rem 1.5rem",
            gap: 20,
            minHeight: "100vh",
            position: "sticky",
            top: 0,
            border: "1px solid rgba(255, 107, 107, 0.1)",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 24,
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 20,
              letterSpacing: 0.5,
              lineHeight: 1.3,
            }}
          >
            {course.title}
          </div>

          {/* Enhanced Progress Bar */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <FaClock style={{ color: "#ffa726", fontSize: 16 }} />
              <div style={{ color: "#666", fontSize: 16, fontWeight: 600 }}>Progress: {progress}%</div>
            </div>
            <div
              style={{
                background: "rgba(255, 107, 107, 0.1)",
                borderRadius: 12,
                height: 16,
                width: "100%",
                overflow: "hidden",
                border: "1px solid rgba(255, 107, 107, 0.2)",
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

          {/* Enhanced Completion Card */}
          {progress === 100 && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(102, 187, 106, 0.15)",
                padding: "1.8rem 2rem",
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                border: "2px solid rgba(102, 187, 106, 0.3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  fontSize: 40,
                  opacity: 0.1,
                }}
              >
                🎉
              </div>
              <FaTrophy style={{ fontSize: 32, color: "#ffa726", marginBottom: 8 }} />
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  background: "linear-gradient(135deg, #66bb6a 0%, #ffa726 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                🎉 Congratulations!
                <br />
                Course Completed!
              </div>
              <div
                style={{
                  color: "#555",
                  fontSize: 15,
                  textAlign: "center",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                You've mastered all lessons and assessments. Time to celebrate your achievement!
              </div>
              <button
                style={{
                  background: "linear-gradient(135deg, #66bb6a 0%, #42a5f5 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0.8rem 1.6rem",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 8,
                  boxShadow: "0 4px 15px rgba(102, 187, 106, 0.3)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => navigate("/dashboard/badges")}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 187, 106, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 4px 15px rgba(102, 187, 106, 0.3)"
                }}
              >
                <FaTrophy style={{ fontSize: 16 }} />
                View Badge
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #ffa726 0%, #ff6b6b 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0.8rem 1.6rem",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 8,
                  boxShadow: "0 4px 15px rgba(255, 167, 38, 0.3)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => navigate(`/dashboard/purchases?course=${encodeURIComponent(course.title)}`)}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 167, 38, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 167, 38, 0.3)"
                }}
              >
                <FaCreditCard style={{ fontSize: 16 }} />
                Purchase Certificate
              </button>
            </div>
          )}

          {/* Enhanced Modules List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {modules.map(([modKey, modObj], mIdx) => {
              const subtopics = getSubtopics(modObj)
              const expanded = expandedModule === mIdx
              const moduleDesc = modObj.description || ""
              const colorScheme = moduleColors[mIdx % moduleColors.length]

              return (
                <div
                  key={modKey}
                  style={{
                    background: expanded ? colorScheme.bg : "rgba(255, 255, 255, 0.6)",
                    borderRadius: 16,
                    border: `2px solid ${expanded ? colorScheme.accent + "30" : "rgba(255, 107, 107, 0.1)"}`,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                >
                  <button
                    style={{
                      background: "none",
                      color: expanded ? colorScheme.accent : "#333",
                      border: "none",
                      borderRadius: 16,
                      padding: "1.2rem 1.5rem",
                      fontWeight: 700,
                      fontSize: 17,
                      textAlign: "left",
                      cursor: "pointer",
                      outline: "none",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setExpandedModule(expanded ? null : mIdx)}
                    onMouseEnter={(e) => {
                      if (!expanded) {
                        e.target.style.background = colorScheme.bg
                        e.target.style.color = colorScheme.accent
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!expanded) {
                        e.target.style.background = "none"
                        e.target.style.color = "#333"
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{colorScheme.icon}</span>
                      <span>
                        Module {mIdx + 1}: {modObj.header || modKey}
                      </span>
                    </div>
                    <span style={{ fontWeight: 400, fontSize: 20, transition: "transform 0.3s ease" }}>
                      {expanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {moduleDesc && (
                    <div
                      style={{
                        color: colorScheme.accent,
                        fontSize: 14,
                        margin: "-8px 1.5rem 8px 1.5rem",
                        fontWeight: 500,
                        opacity: 0.8,
                      }}
                    >
                      {moduleDesc}
                    </div>
                  )}

                  <div
                    style={{
                      color: "#666",
                      fontSize: 13,
                      margin: "0 1.5rem 12px 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaClock style={{ fontSize: 12 }} />
                    Week {mIdx + 1}: 10–15 hours/day × 7 days
                  </div>

                  {expanded && (
                    <div style={{ margin: "0 1rem 1rem 1rem" }}>
                      {subtopics.map((sub, sIdx) => {
                        const isSelected = selectedSubtopic.moduleIdx === mIdx && selectedSubtopic.subIdx === sIdx
                        const isCompleted = isTopicCompleted(mIdx, sIdx)

                        return (
                          <button
                            key={sub}
                            style={{
                              display: "block",
                              width: "100%",
                              background: isSelected
                                ? `linear-gradient(135deg, ${colorScheme.accent} 0%, ${colorScheme.accent}80 100%)`
                                : "rgba(255, 255, 255, 0.8)",
                              color: isSelected ? "#fff" : colorScheme.accent,
                              border: `1px solid ${colorScheme.accent}20`,
                              borderRadius: 12,
                              padding: "1rem 1.3rem",
                              fontWeight: 500,
                              fontSize: 15,
                              textAlign: "left",
                              marginBottom: 8,
                              cursor: "pointer",
                              outline: "none",
                              position: "relative",
                              transition: "all 0.3s ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            onClick={() => {
                              setSelectedSubtopic({ moduleIdx: mIdx, subIdx: sIdx })
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.background = `${colorScheme.accent}15`
                                e.target.style.transform = "translateX(4px)"
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.target.style.background = "rgba(255, 255, 255, 0.8)"
                                e.target.style.transform = "translateX(0)"
                              }
                            }}
                          >
                            <span>{sub}</span>
                            {isCompleted && (
                              <FaCheck
                                style={{
                                  color: "#66bb6a",
                                  fontSize: 16,
                                  background: "rgba(255, 255, 255, 0.9)",
                                  borderRadius: "50%",
                                  padding: 4,
                                  width: 24,
                                  height: 24,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main
          style={{
            flex: 1,
            padding: "2.5rem 2.5rem 2.5rem 2rem",
            minHeight: "100vh",
            position: "relative",
          }}
        >
          {/* Enhanced Back Button */}
          <button
            style={{
              position: "absolute",
              top: 32,
              right: 3,
              background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
              color: "#ff6b6b",
              padding: "0.8rem 1.8rem",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/dashboard")}
            onMouseEnter={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 167, 38, 0.2) 100%)"
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.2)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)"
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "none"
            }}
          >
            <FaArrowLeft style={{ fontSize: 16 }} />
            Back to Dashboard
          </button>

          <div
            style={{
              
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              boxShadow: "0 8px 32px rgba(255, 107, 107, 0.12)",
             
              marginBottom: 32,
              marginTop: 32,
              border: "1px solid rgba(255, 107, 107, 0.1)",
              position: "relative",
              overflow: "hidden",
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
                borderRadius: "20px 20px 0 0",
              }}
            />

            {lessonContent && (
              <LessonView
                lessonId={lessonContent.lesson?.title}
                userId={user?.uid || "demoUser"}
                lessonData={lessonContent.lesson}
                quizData={lessonContent.quiz}
                projectData={lessonContent.project}
              />
            )}

            <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
              <button
                style={{
                  background: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx)
                    ? "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)"
                    : "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "1rem 2rem",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? "default" : "pointer",
                  opacity: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? 0.8 : 1,
                  boxShadow: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx)
                    ? "0 4px 15px rgba(102, 187, 106, 0.3)"
                    : "0 4px 15px rgba(255, 107, 107, 0.3)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                disabled={isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx)}
                onClick={handleCompleteOrNext}
                onMouseEnter={(e) => {
                  if (!isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx)) {
                    e.target.style.transform = "translateY(-2px)"
                    e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx)) {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)"
                  }
                }}
              >
                {isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? (
                  <>
                    <FaCheck style={{ fontSize: 16 }} />
                    Completed
                  </>
                ) : (
                  <>
                    <FaPlay style={{ fontSize: 16 }} />
                    Mark Complete & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
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

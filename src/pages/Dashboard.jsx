"use client"

import { useEffect, useState } from "react"
import { useUser } from "../context/UserContext"
import { Link, useNavigate, useLocation, Routes, Route, useParams } from "react-router-dom"
import Modal from "../components/ui/Modal"
import GeneratedLearningPath from "../components/ui/GeneratedLearningPath"
import LessonView from "../components/Phase4/LessonView"
import {
  FaTrash,
  FaBars,
  FaGraduationCap,
  FaClock,
  FaChartLine,
  FaStar,
  FaRocket,
  FaBookOpen,
  FaAward,
  FaPlay,
  FaCheckCircle,
} from "react-icons/fa"
import styles from "./Dashboard.module.css"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import Assessments from "./Assessments"
import Grades from "./Grades"
import Purchases from "./Purchases"
import CenteredLoadingBar from "../components/ui/CenteredLoadingBar"

const API_URL = process.env.REACT_APP_API_URL || ""

const SIDEBAR_ITEMS = [
  { label: "Home", icon: "🏠", path: "/" },
  { label: "Courses", icon: "📚", path: "/dashboard/courses" },
  { label: "Assessments", icon: "📝", path: "/dashboard/assessments" },
  { label: "Badges", icon: "🎖️", path: "/dashboard/badges" },
  { label: "Purchases", icon: "💳", path: "/dashboard/purchases" },
]

const cardColors = [
  { bg: "linear-gradient(135deg, #ff6b6b20 0%, #ff8a8020 100%)", accent: "#ff6b6b" },
  { bg: "linear-gradient(135deg, #ffa72620 0%, #ffcc0220 100%)", accent: "#ffa726" },
  { bg: "linear-gradient(135deg, #66bb6a20 0%, #81c78420 100%)", accent: "#66bb6a" },
  { bg: "linear-gradient(135deg, #42a5f520 0%, #64b5f620 100%)", accent: "#42a5f5" },
  { bg: "linear-gradient(135deg, #ab47bc20 0%, #ba68c820 100%)", accent: "#ab47bc" },
  { bg: "linear-gradient(135deg, #ef5350a0 0%, #f48fb120 100%)", accent: "#ef5350" },
]

function SpinnerOverlay({ loading }) {
  if (!loading) return null
  return (
    <div
      style={{
        position: "fixed",
      top: 0,
      left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(255, 107, 107, 0.1)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 8px 32px rgba(255, 107, 107, 0.2)",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            border: "4px solid rgba(255, 107, 107, 0.2)",
            borderTop: "4px solid #ff6b6b",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          style={{
            color: "#ff6b6b",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          Loading...
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function CoursesList({ courses, loading, user, refreshCourses, setEnrolling, handleCancelEnroll }) {
  const navigate = useNavigate()
  const [recommended, setRecommended] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [formData, setFormData] = useState({})
  const [deleting, setDeleting] = useState({})
  const [enrollAbortController, setEnrollAbortController] = useState(null)

  useEffect(() => {
    // Load recommended paths from localStorage
    const rec = localStorage.getItem(`recommendedPaths_${user?.uid || "demoUser"}`)
    if (rec) {
      let recArr = JSON.parse(rec)
      // Filter out already enrolled courses by title
      const enrolledTitles = courses.map((c) => c.title)
      recArr = recArr.filter((lp) => !enrolledTitles.includes(lp.title))
      setRecommended(recArr.slice(0, 4)) // Show up to 4 cards
    } else {
      setRecommended([])
    }
  }, [user, courses])

  // Modal enrollment handler
  const handleEnroll = async (learningPath) => {
    const controller = new AbortController()
    setEnrollAbortController(controller)
    try {
      if (setEnrolling) setEnrolling(true)
      await fetch(`${API_URL}/api/enroll-learning-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid || "demoUser", learningPath }),
        signal: controller.signal,
      })
      // Remove from recommendedPaths in localStorage
      const recKey = `recommendedPaths_${user?.uid || "demoUser"}`
      let recArr = JSON.parse(localStorage.getItem(recKey) || "[]")
      recArr = recArr.filter((lp) => lp.title !== learningPath.title)
      localStorage.setItem(recKey, JSON.stringify(recArr))
      setShowModal(false)
      setSelectedCard(null)
      await refreshCourses()
    } catch (err) {
      if (err.name !== "AbortError") {
        alert("Failed to enroll in this learning path.")
      }
    } finally {
      if (setEnrolling) setEnrolling(false)
      setEnrollAbortController(null)
    }
  }

  const handleDelete = async (e, course) => {
    e.stopPropagation()
    setDeleting((prev) => ({ ...prev, [course.title]: true }))
    try {
      await fetch(`${API_URL}/api/delete-enrollment`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid || "demoUser", courseTitle: course.title }),
      })
      refreshCourses()
    } catch (err) {
      alert("Failed to unenroll from this course.")
    } finally {
      setDeleting((prev) => ({ ...prev, [course.title]: false }))
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#66bb6a"
    if (progress >= 50) return "#ffa726"
    return "#ff6b6b"
  }

  const getProgressGradient = (progress) => {
    if (progress >= 80) return "linear-gradient(90deg, #66bb6a 0%, #4caf50 100%)"
    if (progress >= 50) return "linear-gradient(90deg, #ffa726 0%, #ff9800 100%)"
    return "linear-gradient(90deg, #ff6b6b 0%, #ff5252 100%)"
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fef7f0 0%, #fff5f5 50%, #f0f9ff 100%)",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "2rem 2.5rem",
          marginBottom: "2rem",
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
            height: "4px",
            background: "linear-gradient(90deg, #ff6b6b, #ffa726, #66bb6a)",
            borderRadius: "24px 24px 0 0",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <FaGraduationCap
            style={{
              fontSize: "2rem",
              color: "#ff6b6b",
              filter: "drop-shadow(0 2px 4px rgba(255, 107, 107, 0.3))",
            }}
          />
          <h2
            style={{
              fontWeight: 800,
              fontSize: "2rem",
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            My Learning Journey
          </h2>
        </div>
        <p
          style={{
            color: "#666",
            fontSize: "1.1rem",
            margin: 0,
            fontWeight: "500",
          }}
        >
          Continue your learning adventure and explore new opportunities
        </p>
      </div>

      {/* Enrolled Courses Section */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "2rem 2.5rem",
          marginBottom: "2rem",
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
            height: "4px",
            background: "linear-gradient(90deg, #66bb6a, #ffa726, #ff6b6b)",
            borderRadius: "24px 24px 0 0",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <FaBookOpen
            style={{
              fontSize: "1.5rem",
              color: "#66bb6a",
              filter: "drop-shadow(0 2px 4px rgba(102, 187, 106, 0.3))",
            }}
          />
          <h3
            style={{
              fontWeight: 700,
              fontSize: "1.5rem",
              background: "linear-gradient(135deg, #66bb6a 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            Enrolled Courses
          </h3>
        </div>

      {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
          {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(255, 107, 107, 0.12)",
                  padding: "2rem",
                  border: "1px solid rgba(255, 107, 107, 0.1)",
                }}
              >
                <Skeleton height={32} width="80%" style={{ marginBottom: "1rem" }} />
                <Skeleton height={20} width="100%" style={{ marginBottom: "0.5rem" }} />
                <Skeleton height={16} width="60%" style={{ marginBottom: "1rem" }} />
                <Skeleton height={12} width="100%" style={{ marginBottom: "0.5rem" }} />
                <Skeleton height={20} width="40%" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              background: "linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 167, 38, 0.05) 100%)",
              borderRadius: "16px",
              border: "2px dashed rgba(255, 107, 107, 0.2)",
              color: "#666",
              fontSize: "1.1rem",
              fontWeight: "500",
            }}
          >
            <FaBookOpen style={{ fontSize: "3rem", color: "#ff6b6b", marginBottom: "1rem", opacity: 0.5 }} />
            <div>You haven't enrolled in any courses yet.</div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#888" }}>
              Explore our recommendations below to get started!
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
          {courses.map((course, idx) => {
            // Progress and grade sync from localStorage
              let progress = 0
              let completed = false
              let grade = null
              try {
                const saved = localStorage.getItem(`completedTopics_${encodeURIComponent(course.title)}`)
              if (saved) {
                  const { progress: prog } = JSON.parse(saved)
                  progress = prog || 0
                  completed = progress === 100
                }
                const scores = JSON.parse(localStorage.getItem(`scores_${encodeURIComponent(course.title)}`) || "{}")
              if (scores.final !== undefined) {
                  const total = scores.finalTotal || 5
                  grade = `${scores.final} / ${total}`
              } else if (Object.keys(scores).length > 0) {
                  const vals = Object.values(scores).filter((v) => typeof v === "number")
                if (vals.length > 0) {
                    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
                    grade = `Avg: ${avg.toFixed(1)}`
                }
              }
            } catch {}

            return (
              <div
                key={course.title || idx}
                style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    padding: "2rem",
                    boxShadow: "0 8px 32px rgba(255, 107, 107, 0.12)",
                    border: "1px solid rgba(255, 107, 107, 0.1)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                  onClick={(e) => {
                    if (e.target.closest(".delete-btn") || e.target.closest(".purchase-btn")) return
                    navigate(`/lesson?course=${encodeURIComponent(course.title)}`)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(255, 107, 107, 0.15)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none"
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 107, 107, 0.12)"
                  }}
                >
                  {/* Top gradient bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: getProgressGradient(progress),
                      borderRadius: "20px 20px 0 0",
                    }}
                  />

                {/* Delete button */}
                <button
                  className="delete-btn"
                  style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "rgba(255, 107, 107, 0.1)",
                      border: "2px solid rgba(255, 107, 107, 0.2)",
                      borderRadius: "12px",
                      padding: "0.5rem",
                      cursor: deleting[course.title] ? "not-allowed" : "pointer",
                      color: "#ff6b6b",
                      fontSize: "1rem",
                    opacity: deleting[course.title] ? 0.5 : 1,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                  }}
                  title="Unenroll from this course"
                    onClick={(e) => handleDelete(e, course)}
                  disabled={deleting[course.title]}
                    onMouseEnter={(e) => {
                      if (!deleting[course.title]) {
                        e.currentTarget.style.background = "rgba(255, 107, 107, 0.2)"
                        e.currentTarget.style.transform = "scale(1.1)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)"
                      e.currentTarget.style.transform = "scale(1)"
                    }}
                >
                  {deleting[course.title] ? (
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255, 107, 107, 0.3)",
                          borderTop: "2px solid #ff6b6b",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                  ) : (
                    <FaTrash />
                  )}
                </button>

                  {/* Course content */}
                  <div style={{ paddingRight: "3rem" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1.3rem",
                        color: "#333",
                        marginBottom: "0.5rem",
                        lineHeight: "1.3",
                      }}
                    >
                      {course.title}
                  </div>

                    <div
                      style={{
                        color: "#666",
                        fontSize: "1rem",
                        marginBottom: "1.5rem",
                        lineHeight: "1.5",
                      }}
                    >
                      {course.description}
                  </div>

                    {/* Progress section */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <FaChartLine style={{ color: getProgressColor(progress), fontSize: "1rem" }} />
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              color: "#555",
                            }}
                          >
                            Progress: {progress}%
                          </span>
                </div>
                        {completed && (
                          <div
                            style={{
                              background: "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)",
                              color: "#fff",
                              borderRadius: "20px",
                              padding: "0.3rem 0.8rem",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              boxShadow: "0 2px 8px rgba(102, 187, 106, 0.3)",
                            }}
                          >
                            <FaCheckCircle />
                            Completed
                </div>
                        )}
                      </div>

                      <div
                        style={{
                          background: "rgba(255, 107, 107, 0.1)",
                          borderRadius: "12px",
                          height: "8px",
                          width: "100%",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            background: getProgressGradient(progress),
                            height: "100%",
                            borderRadius: "12px",
                            width: `${progress}%`,
                            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                              animation: progress > 0 ? "shimmer 2s infinite" : "none",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grade section */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <FaAward style={{ color: "#ffa726", fontSize: "1rem" }} />
                      <span
                        style={{
                          color: "#555",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {grade ? `Grade: ${grade}` : completed ? "No grade yet" : "In Progress"}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                <button
                  style={{
                          background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          padding: "0.8rem 1.5rem",
                    fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                          flex: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/lesson?course=${encodeURIComponent(course.title)}`)
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)"
                        }}
                      >
                        <FaPlay />
                        Continue Learning
                      </button>

                      <button
                        className="purchase-btn"
                        style={{
                          background: "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          padding: "0.8rem 1.2rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(255, 167, 38, 0.3)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/dashboard/purchases?course=${encodeURIComponent(course.title)}`)
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)"
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 167, 38, 0.4)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 167, 38, 0.3)"
                  }}
                >
                  Purchase
                </button>
              </div>
                  </div>
                </div>
              )
          })}
        </div>
      )}
      </div>

      {/* Recommended Actions Section - Enhanced to match Home page cards */}
      {recommended.length > 0 && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
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
              height: "4px",
              background: "linear-gradient(90deg, #ab47bc, #ffa726, #66bb6a)",
              borderRadius: "24px 24px 0 0",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <FaRocket
              style={{
                fontSize: "1.5rem",
                color: "#ab47bc",
                filter: "drop-shadow(0 2px 4px rgba(171, 71, 188, 0.3))",
              }}
            />
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1.5rem",
                background: "linear-gradient(135deg, #ab47bc 0%, #ffa726 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              Next Recommended Actions
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
              marginTop: "1rem",
            }}
          >
            {recommended.map((card, idx) => (
              <div
                key={card.title || idx}
                style={{
                  background: cardColors[idx % cardColors.length].bg,
                  borderRadius: 24,
                  boxShadow: `0 8px 32px ${cardColors[idx % cardColors.length].accent}15`,
                  padding: "1.8rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: `2px solid ${cardColors[idx % cardColors.length].accent}20`,
                  position: "relative",
                  minHeight: 340,
                  outline: selectedCard === idx ? `3px solid ${cardColors[idx % cardColors.length].accent}` : "none",
                  animationDelay: `${idx * 0.1}s`,
                  overflow: "hidden",
                }}
                onClick={() => {
                  setSelectedCard(idx)
                  setShowModal(true)
                  setFormData({
                    timeline: card.timeline,
                    level: card.level,
                    specializations: card.specializations,
                  })
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-12px) scale(1.02)"
                  e.currentTarget.style.boxShadow = `0 16px 48px ${cardColors[idx % cardColors.length].accent}25`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)"
                  e.currentTarget.style.boxShadow = `0 8px 32px ${cardColors[idx % cardColors.length].accent}15`
                }}
              >
                {/* Decorative corner element */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${cardColors[idx % cardColors.length].accent}40, ${
                      cardColors[idx % cardColors.length].accent
                    }20)`,
                    borderRadius: "50%",
                    opacity: 0.6,
                  }}
                />

                <div
                  style={{
                    width: "100%",
                    height: 120,
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 20,
                    background: `linear-gradient(135deg, ${cardColors[idx % cardColors.length].accent}10, ${
                      cardColors[idx % cardColors.length].accent
                    }05)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${cardColors[idx % cardColors.length].accent}20`,
                  }}
                >
                  <img
                    src={"/logo192.png"}
                    alt={card.title}
                    style={{
                      width: "60%",
                      height: "60%",
                      objectFit: "contain",
                      filter: `hue-rotate(${idx * 60}deg)`,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 22,
                    marginBottom: 12,
                    color: "#333",
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    color: cardColors[idx % cardColors.length].accent,
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {card.description}
                </div>

                {card.specializations && (
                  <div
                    style={{
                      color: "#666",
                      fontSize: 14,
                      marginBottom: 8,
                      padding: "8px 12px",
                      background: "rgba(255, 255, 255, 0.7)",
                      borderRadius: 8,
                      border: `1px solid ${cardColors[idx % cardColors.length].accent}15`,
                    }}
                  >
                    <strong style={{ color: cardColors[idx % cardColors.length].accent }}>Specializations:</strong>{" "}
                    {card.specializations}
                  </div>
                )}

                <div
                  style={{
                    color: "#777",
                    fontSize: 15,
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 0",
                    borderTop: `1px solid ${cardColors[idx % cardColors.length].accent}15`,
                  }}
                >
                  <FaStar style={{ color: cardColors[idx % cardColors.length].accent, fontSize: 14 }} />
                  Timeline: {card.timeline ? card.timeline : "N/A"} months · Level: {card.level ? card.level : "N/A"}
                </div>
              </div>
            ))}
          </div>

          <Modal
            open={showModal}
            onClose={() => {
              setShowModal(false)
              setSelectedCard(null)
            }}
          >
            {recommended.length > 0 && selectedCard !== null && (
              <GeneratedLearningPath
                result={recommended[selectedCard]}
                formData={formData}
                userId={user?.uid || "demoUser"}
                onStartLearning={() => handleEnroll(recommended[selectedCard])}
              />
            )}
          </Modal>
        </div>
      )}

      {setEnrolling && typeof setEnrolling === "function" && enrollAbortController && (
        <CenteredLoadingBar label="Enrolling, please wait..." onCancel={handleCancelEnroll} />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

function RecommendedLearningPathModal({ result, formData, onStartLearning, userId }) {
  return (
    <div style={{ minWidth: 400, padding: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 28, color: "#3576d3", marginBottom: 10 }}>{result.title}</div>
      <div style={{ color: "#444", fontSize: 17, marginBottom: 18 }}>{result.description}</div>
      <button
        style={{
          background: "#4f8cff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.7rem 1.5rem",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 18,
        }}
        onClick={onStartLearning}
      >
        Start Learning
      </button>
    </div>
  )
}

function CourseLessonView({ courses }) {
  const { user } = useUser()
  const { courseId } = useParams()
  const decodedTitle = decodeURIComponent(courseId)
  const course = courses.find((c) => c.title === decodedTitle)
  const [progress, setProgress] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loadingLesson, setLoadingLesson] = useState(false)

  useEffect(() => {
    // Load progress from localStorage (for demo)
    const saved = localStorage.getItem(`progress_${courseId}`)
    if (saved) {
      const { progress, completedLessons } = JSON.parse(saved)
      setProgress(progress)
      setCompletedLessons(completedLessons)
    }
  }, [courseId])

  if (!course) return <div>Course not found.</div>

  // Fix: modules rendering
  const modules = Object.entries(course.curriculum || {})

  // Helper to transform AI content to lesson object for LessonView
  const aiToLessonObject = (weekKey, lessonTitle, aiContent) => {
    const intro = typeof aiContent === "string" ? aiContent : aiContent?.intro || ""
    let points = []
    let advancedTips = []
    if (typeof aiContent === "object" && aiContent) {
      points = aiContent.points || []
      advancedTips = aiContent.advancedTips || []
    } else {
      points = intro.split(". ").map((t, i) => ({ text: t, tooltip: "" }))
    }
    return {
      title: lessonTitle,
      intro,
      points,
      advancedTips,
    }
  }

  const handleViewLesson = async (weekKey, lessonTitle) => {
    setLoadingLesson(true)
    setShowLessonModal(true)
    setSelectedLesson(null)
    try {
      const res = await fetch(`${API_URL}/api/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: course.title,
          timeline: course.timeline,
          level: course.level,
          userId: user?.uid || "demoUser",
        }),
      })
      const data = await res.json()
      const aiContent = data.content[weekKey]
      setSelectedLesson(aiToLessonObject(weekKey, lessonTitle, aiContent))
    } catch (err) {
      setSelectedLesson({
        title: lessonTitle,
        intro: `Welcome to ${lessonTitle}! (AI content unavailable)`,
        points: [
          { text: `Main concept of ${lessonTitle}`, tooltip: `More about ${lessonTitle}` },
          { text: `Practical example for ${lessonTitle}`, tooltip: `Example details for ${lessonTitle}` },
        ],
        advancedTips: [`Advanced tip 1 for ${lessonTitle}`, `Advanced tip 2 for ${lessonTitle}`],
      })
    } finally {
      setLoadingLesson(false)
    }
  }

  const handleCompleteLesson = (weekKey) => {
    if (!completedLessons.includes(weekKey)) {
      const updated = [...completedLessons, weekKey]
      setCompletedLessons(updated)
      const prog = Math.round((updated.length / modules.length) * 100)
      setProgress(prog)
      localStorage.setItem(`progress_${courseId}`, JSON.stringify({ progress: prog, completedLessons: updated }))
    }
  }

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 28, color: "#3576d3", marginBottom: 18 }}>{course.title} - Lessons</h2>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>Progress: {progress}%</div>
        <div
          style={{
            background: "#e0e0e0",
            borderRadius: 8,
            height: 18,
            width: "100%",
            overflow: "hidden",
            marginTop: 6,
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #4f8cff 0%, #6be7ff 100%)",
              height: "100%",
              borderRadius: 8,
              width: `${progress}%`,
              transition: "width 0.5s",
            }}
          />
        </div>
        {/* Congratulatory message when progress is 100% */}
        {progress === 100 && (
          <div
            style={{
              background: "linear-gradient(90deg, #e3eefe 0%, #d1f7c4 100%)",
            borderRadius: 10,
              boxShadow: "0 2px 8px rgba(31,38,135,0.08)",
              padding: "0.9rem 1.2rem",
            marginTop: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            gap: 6,
              border: "2px solid #43a047",
            fontWeight: 600,
              color: "#3576d3",
              fontSize: 16,
            }}
          >
            🎉 Congratulations! You have completed this learning path.
          </div>
        )}
      </div>
      <div>
        {modules.map(([week, module], idx) => {
          // Fix: handle {header, lessons} object, array, or string
          let header = ""
          let lessons = []
          if (typeof module === "object" && module !== null && module.header && Array.isArray(module.lessons)) {
            header = module.header
            lessons = module.lessons
          } else if (Array.isArray(module)) {
            header = `Module: ${module[0]}`
            lessons = module
          } else {
            header = typeof module === "string" ? module : `Module ${idx + 1}`
            lessons = [typeof module === "string" ? module : JSON.stringify(module)]
          }
          return (
            <div
              key={week}
              style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 1px 6px rgba(31,38,135,0.06)",
                marginBottom: 16,
                padding: "1.2rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{header}</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {lessons.map((lesson, tIdx) => (
                    <li key={tIdx} style={{ color: "#222", fontSize: 15, marginBottom: 4 }}>
                      {lesson}
                    </li>
                  ))}
                </ul>
                <div style={{ color: "#888", fontSize: 15 }}>Week {idx + 1}</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  style={{
                    background: "#4f8cff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginRight: 8,
                  }}
                  onClick={() => handleViewLesson(week, lessons[0])}
                >
                  View Lesson
                </button>
                <button
                  style={{
                    background: completedLessons.includes(week) ? "#43a047" : "#4f8cff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    fontWeight: 600,
                    cursor: completedLessons.includes(week) ? "default" : "pointer",
                    opacity: completedLessons.includes(week) ? 0.7 : 1,
                  }}
                  disabled={completedLessons.includes(week)}
                  onClick={() => handleCompleteLesson(week)}
                >
                  {completedLessons.includes(week) ? "Completed" : "Mark as Complete"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <Modal open={showLessonModal} onClose={() => setShowLessonModal(false)}>
        {loadingLesson && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div
              style={{
                width: 50,
                height: 50,
                border: "5px solid #e0e0e0",
                borderTop: "5px solid #3576d3",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        )}
        {selectedLesson && <LessonView lesson={selectedLesson} />}
      </Modal>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useUser()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const refreshCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/my-courses?userId=${user?.uid || "demoUser"}`)
      const data = await res.json()
      setCourses(data.enrollments || [])
    } catch (err) {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) refreshCourses()
    // eslint-disable-next-line
  }, [user])

  const handleCancelEnroll = () => {
    // The actual abort logic is in CoursesList
  }

  return (
    <div className={styles.dashboardContainer}>
      <SpinnerOverlay loading={enrolling} />

      {/* Hamburger menu for small screens */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle sidebar"
        style={{ display: window.innerWidth < 768 ? "block" : "none" }}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={styles.sidebar + (sidebarOpen ? " " + styles.open : " " + styles.closed)}
        tabIndex={-1}
        aria-hidden={!sidebarOpen}
      >
        <div className={styles.sidebarTitle}>Dashboard</div>
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={
              styles.sidebarItem +
              ((item.path === "/" && location.pathname === "/") ||
              (item.path !== "/" && location.pathname.startsWith(item.path))
                ? " " + styles.active
                : "")
            }
            onClick={(e) => {
              if (item.path === "/") {
                e.preventDefault()
                navigate("/")
              }
              if (window.innerWidth < 768) setSidebarOpen(false)
            }}
          >
            <span className={styles.sidebarIcon}>{item.icon}</span> {item.label}
          </Link>
        ))}
      </aside>

      {/* Main Content with nested routes */}
      <main className={styles.mainContent}>
        <Routes>
          <Route
            path="/dashboard/courses"
            element={
              <CoursesList
                courses={courses}
                loading={loading}
                user={user}
                refreshCourses={refreshCourses}
                setEnrolling={setEnrolling}
                handleCancelEnroll={handleCancelEnroll}
              />
            }
          />
          <Route path="/dashboard/courses/:courseId" element={<CourseLessonView courses={courses} />} />
          <Route path="/dashboard/assessments" element={<Assessments />} />
          <Route path="/dashboard/badges" element={<Grades />} />
          <Route path="/dashboard/purchases" element={<Purchases />} />
          <Route
            path="*"
            element={
              <CoursesList
                courses={courses}
                loading={loading}
                user={user}
                refreshCourses={refreshCourses}
                setEnrolling={setEnrolling}
                handleCancelEnroll={handleCancelEnroll}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

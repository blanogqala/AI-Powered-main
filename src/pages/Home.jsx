"use client"

import { useState, useEffect } from "react"
import TopicTimelineForm from "../components/Phase1/TopicTimelineForm"
import Modal from "../components/ui/Modal"
import { useUser } from "../context/UserContext"
import { FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaHeart, FaStar, FaRocket } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import GeneratedLearningPath from "../components/ui/GeneratedLearningPath"
import CenteredLoadingBar from "../components/ui/CenteredLoadingBar"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [result, setResult] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({})
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [floatingElements, setFloatingElements] = useState([])
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const API_URL = process.env.REACT_APP_API_URL || ""
  const [abortController, setAbortController] = useState(null)

  // Create floating background elements
  useEffect(() => {
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 4,
    }))
    setFloatingElements(elements)
  }, [])

  const handleGenerate = async ({ topic, timeline, level, specializations }) => {
    setLoading(true)
    setResult(null)
    setFormData({ topic, timeline, level, specializations })
    const controller = new AbortController()
    setAbortController(controller)
    try {
      const res = await fetch(`${API_URL}/api/generateLearningPath`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          timeline,
          level,
          specializations,
          userId: user?.uid || "demoUser",
        }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error("Failed to generate learning path.")
      const dataRes = await res.json()
      setResult({ learningPaths: dataRes.learningPaths })
      if (Array.isArray(dataRes.learningPaths)) {
        localStorage.setItem(`recommendedPaths_${user?.uid || "demoUser"}`, JSON.stringify(dataRes.learningPaths))
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        alert("Failed to generate learning path.")
      }
    } finally {
      setLoading(false)
      setAbortController(null)
    }
  }

  const handleCancelGenerate = () => {
    if (abortController) abortController.abort()
    setLoading(false)
    setAbortController(null)
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const cards = result && result.learningPaths ? result.learningPaths : []

  const cardColors = [
    { bg: "linear-gradient(135deg, #ff6b6b20 0%, #ff8a8020 100%)", accent: "#ff6b6b" },
    { bg: "linear-gradient(135deg, #ffa72620 0%, #ffcc0220 100%)", accent: "#ffa726" },
    { bg: "linear-gradient(135deg, #66bb6a20 0%, #81c78420 100%)", accent: "#66bb6a" },
    { bg: "linear-gradient(135deg, #42a5f520 0%, #64b5f620 100%)", accent: "#42a5f5" },
    { bg: "linear-gradient(135deg, #ab47bc20 0%, #ba68c820 100%)", accent: "#ab47bc" },
    { bg: "linear-gradient(135deg, #ef5350a0 0%, #f48fb120 100%)", accent: "#ef5350" },
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #fef7f0 0%, #fff5f5 50%, #f0f9ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Background Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          style={{
            position: "absolute",
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            background: `linear-gradient(135deg, ${["#ff6b6b", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#ef5350"][element.id % 6]}15, ${["#ff6b6b", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#ef5350"][element.id % 6]}05)`,
            borderRadius: "50%",
            animation: `float ${element.duration}s ease-in-out infinite`,
            animationDelay: `${element.delay}s`,
            zIndex: 0,
          }}
        />
      ))}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .animate-slide-in {
            animation: slideInUp 0.6s ease-out forwards;
          }
          
          .animate-pulse {
            animation: pulse 2s ease-in-out infinite;
          }
        `}
      </style>

      {(loading || enrolling) && (
        <CenteredLoadingBar
          label={loading ? "Generating learning path..." : "Enrolling, please wait..."}
          onCancel={loading ? handleCancelGenerate : () => setEnrolling(false)}
        />
      )}

      {/* Enhanced Nav Bar */}
      <nav
        style={{
          position: "fixed",
        top: 0,
        left: 0,
          width: "100vw",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 20px rgba(255, 107, 107, 0.08)",
        zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 80,
          borderBottom: "1px solid rgba(255, 107, 107, 0.1)",
        }}
      >
        <div
          style={{
            width: "100%",
          maxWidth: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2.5rem",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 1,
              background: "linear-gradient(90deg, #ff6b6b 0%, #ffa726 50%, #66bb6a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaHeart style={{ color: "#ff6b6b", fontSize: 20 }} />
            AI-POWERED LEARNING PLATFORM
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 28,
                  color: "#ff6b6b",
                  transition: "all 0.3s ease",
                  transform: "scale(1)",
                }}
                onClick={() => setShowProfileDrawer(true)}
                aria-label="Profile"
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                <FaUserCircle />
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #ff6b6b15 0%, #ffa72615 100%)",
                  color: "#ff6b6b",
                  border: "2px solid #ff6b6b20",
                  borderRadius: 12,
                  padding: "0.7rem 1.4rem",
                  fontWeight: 600,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => navigate("/dashboard")}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #ff6b6b25 0%, #ffa72625 100%)"
                  e.target.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #ff6b6b15 0%, #ffa72615 100%)"
                  e.target.style.transform = "translateY(0)"
                }}
              >
                <FaTachometerAlt style={{ fontSize: 18 }} /> Dashboard
              </button>
              <button
                style={{
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0.7rem 1.4rem",
                  fontWeight: 600,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                }}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)"
                }}
              >
                <FaSignOutAlt style={{ fontSize: 18 }} /> Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Profile Drawer */}
      {showProfileDrawer && (
        <div
          style={{
            position: "fixed",
          top: 0,
          right: 0,
          width: 320,
            height: "100vh",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "-4px 0 20px rgba(255, 107, 107, 0.15)",
          zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            padding: "2rem 1.5rem",
            transition: "right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            borderLeft: "1px solid rgba(255, 107, 107, 0.1)",
          }}
        >
          <button
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              fontSize: 28,
              color: "#ff6b6b",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setShowProfileDrawer(false)}
            onMouseEnter={(e) => (e.target.style.transform = "rotate(90deg)")}
            onMouseLeave={(e) => (e.target.style.transform = "rotate(0deg)")}
          >
            &times;
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24 }}>
            <div
              style={{
                position: "relative",
                marginBottom: 12,
              }}
            >
              <FaUserCircle style={{ fontSize: 64, color: "#ff6b6b" }} className="animate-pulse" />
              <FaStar
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  fontSize: 20,
                  color: "#ffa726",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 6,
                background: "linear-gradient(90deg, #ff6b6b 0%, #ffa726 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {user?.displayName || "User"}
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>{user?.email || "user@email.com"}</div>
          </div>
        </div>
      )}

      {/* Enhanced Main Section */}
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "120px 2rem 0 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="animate-slide-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontWeight: 800,
              fontSize: "2.8rem",
              marginTop: 0,
              margin: 0,
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #66bb6a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
          Welcome to Learning Platform
        </h1>
          <FaRocket
            style={{
              fontSize: "2rem",
              color: "#ffa726",
              animation: "float 3s ease-in-out infinite",
            }}
          />
        </div>

        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
            marginBottom: "2rem",
            fontWeight: 400,
            lineHeight: 1.6,
          }}
          className="animate-slide-in"
        >
          Discover personalized learning paths powered by AI ✨
        </p>

        <TopicTimelineForm onGenerate={handleGenerate} loading={loading} />

        {/* Enhanced Card Grid */}
        {cards.length > 0 && (
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 32,
              marginTop: 24,
              marginBottom: 32,
            }}
          >
            {cards.map((card, idx) => (
              <div
                key={card.title || idx}
                className="animate-slide-in"
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
                    background: `linear-gradient(135deg, ${cardColors[idx % cardColors.length].accent}40, ${cardColors[idx % cardColors.length].accent}20)`,
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
                    background: `linear-gradient(135deg, ${cardColors[idx % cardColors.length].accent}10, ${cardColors[idx % cardColors.length].accent}05)`,
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
                  Timeline: {card.timeline || formData.timeline} months · Level: {card.level || formData.level}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for generated learning path */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        {cards.length > 0 && selectedCard !== null && (
          <GeneratedLearningPath
            result={cards[selectedCard]}
            formData={formData}
            userId={user?.uid || "demoUser"}
            setEnrolling={setEnrolling}
            onStartLearning={() => {
              setShowModal(false)
              setEnrolling(true)
              navigate("/dashboard")
            }}
          />
        )}
      </Modal>
    </div>
  )
}

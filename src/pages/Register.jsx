"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { useNavigate, Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import app from "../firebase"
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt } from "react-icons/fa"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useUser()
  const db = getFirestore(app)

  if (user) {
    navigate("/")
    return null
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid
      // Save user profile in Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        firstName,
        lastName,
        username,
        createdAt: Date.now(),
      })
      navigate("/")
    } catch (err) {
      setError("Registration failed. " + (err.message || ""))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fef7f0 0%, #fff5f5 50%, #f0f9ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
    <div className="auth-container">
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            🚀
          </div>
          <h2
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              fontSize: "2rem",
              margin: 0,
            }}
          >
            Join Our Platform
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              margin: "0.5rem 0 0 0",
              fontWeight: 500,
            }}
          >
            Start your learning journey today
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <FaUser
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#ff6b6b",
                  fontSize: "1rem",
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{
                  paddingLeft: "3rem",
                  width: "calc(100% - 3rem)",
                }}
              />
            </div>
            <div style={{ position: "relative", flex: 1 }}>
              <FaUser
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#ffa726",
                  fontSize: "1rem",
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{
                  paddingLeft: "3rem",
                  width: "calc(100% - 3rem)",
                }}
              />
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: "1.2rem" }}>
            <FaUser
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#66bb6a",
                fontSize: "1rem",
                zIndex: 1,
              }}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                paddingLeft: "3rem",
                width: "calc(100% - 3rem)",
              }}
            />
          </div>

          <div style={{ position: "relative", marginBottom: "1.2rem" }}>
            <FaEnvelope
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#42a5f5",
                fontSize: "1rem",
                zIndex: 1,
              }}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                paddingLeft: "3rem",
                width: "calc(100% - 3rem)",
              }}
            />
          </div>

          <div style={{ position: "relative", marginBottom: "1.8rem" }}>
            <FaLock
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#ab47bc",
                fontSize: "1rem",
                zIndex: 1,
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                paddingLeft: "3rem",
                width: "calc(100% - 3rem)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
              fontSize: "1.1rem",
              padding: "1rem 2rem",
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Creating Account...
              </>
            ) : (
              <>
                <FaUserPlus style={{ fontSize: "1.2rem" }} />
                Create Account
              </>
            )}
        </button>

          {error && <div className="error">{error}</div>}

          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(255, 107, 107, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 107, 107, 0.1)",
            }}
          >
            <p style={{ margin: 0, color: "#666", fontSize: "1rem" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#ff6b6b",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ff5252"
                  e.target.style.transform = "translateX(2px)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#ff6b6b"
                  e.target.style.transform = "translateX(0)"
                }}
              >
                <FaSignInAlt style={{ fontSize: "0.9rem" }} />
                Sign In
              </Link>
            </p>
          </div>
      </form>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  )
}

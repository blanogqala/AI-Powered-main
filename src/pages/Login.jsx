"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { useNavigate, Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from "react-icons/fa"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useUser()

  if (user) {
    navigate("/")
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
    } catch (err) {
      setError("Invalid credentials. Please check your email and password.")
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
            👋
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
            Welcome Back
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              margin: "0.5rem 0 0 0",
              fontWeight: 500,
            }}
          >
            Sign in to continue your learning journey
          </p>
        </div>

      <form onSubmit={handleLogin}>
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
                Signing In...
              </>
            ) : (
              <>
                <FaSignInAlt style={{ fontSize: "1.2rem" }} />
                Sign In
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
              Don't have an account?{" "}
              <Link
                to="/register"
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
                <FaUserPlus style={{ fontSize: "0.9rem" }} />
                Create Account
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

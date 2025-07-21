"use client"

export default function Button({ children, variant = "primary", size = "medium", ...props }) {
  const getButtonStyles = () => {
    const baseStyles = {
      border: "none",
      borderRadius: "12px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    }

    const sizeStyles = {
      small: { padding: "0.6rem 1.2rem", fontSize: "0.9rem" },
      medium: { padding: "0.8rem 1.5rem", fontSize: "1rem" },
      large: { padding: "1rem 2rem", fontSize: "1.1rem" },
    }

    const variantStyles = {
      primary: {
        background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
        color: "#fff",
        boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
      },
      secondary: {
        background: "linear-gradient(135deg, #66bb6a 0%, #42a5f5 100%)",
        color: "#fff",
        boxShadow: "0 4px 15px rgba(102, 187, 106, 0.3)",
      },
      outline: {
        background: "transparent",
        color: "#ff6b6b",
        border: "2px solid #ff6b6b",
        boxShadow: "none",
      },
      ghost: {
        background: "rgba(255, 107, 107, 0.1)",
        color: "#ff6b6b",
        boxShadow: "none",
      },
    }

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
    }
  }

  const handleMouseEnter = (e) => {
    if (variant === "primary") {
      e.target.style.background = "linear-gradient(135deg, #ff5252 0%, #ff9800 100%)"
      e.target.style.transform = "translateY(-2px)"
      e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)"
    } else if (variant === "secondary") {
      e.target.style.background = "linear-gradient(135deg, #4caf50 0%, #2196f3 100%)"
      e.target.style.transform = "translateY(-2px)"
      e.target.style.boxShadow = "0 6px 20px rgba(102, 187, 106, 0.4)"
    } else if (variant === "outline") {
      e.target.style.background = "#ff6b6b"
      e.target.style.color = "#fff"
      e.target.style.transform = "translateY(-2px)"
    } else if (variant === "ghost") {
      e.target.style.background = "rgba(255, 107, 107, 0.2)"
      e.target.style.transform = "translateY(-2px)"
    }
  }

  const handleMouseLeave = (e) => {
    const styles = getButtonStyles()
    e.target.style.background = styles.background
    e.target.style.color = styles.color
    e.target.style.transform = "translateY(0)"
    e.target.style.boxShadow = styles.boxShadow || "none"
  }

  return (
    <button style={getButtonStyles()} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <span
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
      {children}
      <style jsx>{`
        button:hover .shimmer {
          left: 100%;
        }
      `}</style>
    </button>
  )
}

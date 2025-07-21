"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { FaPlay, FaEye, FaEyeSlash, FaLightbulb, FaCode } from "react-icons/fa"

// Demo glossary for tooltips (extend with AI or glossary API)
const GLOSSARY = {
  HTML: "HyperText Markup Language, the standard for web pages.",
  CSS: "Cascading Style Sheets, used for styling web pages.",
  JavaScript: "A programming language for web development.",
  DOM: "Document Object Model, the structure of a web page.",
}

// Custom renderer for tooltips and collapsibles
function MarkdownWithFeatures({ children }) {
  const [collapsed, setCollapsed] = useState({})
  const [openBlockquotes, setOpenBlockquotes] = useState({})

  return (
    <ReactMarkdown
      components={{
        // Custom paragraph renderer to avoid <p><div>...</div></p> and <p><pre>...</pre></p>
        p({ node, children, ...props }) {
          // If any child is a block element, don't wrap in <p>
          const hasBlock =
            node.children &&
            node.children.some((child) => {
            return (
                child.type === "element" &&
                (child.tagName === "pre" ||
                  child.tagName === "div" ||
                  child.tagName === "code" ||
                  child.tagName === "ol" ||
                  child.tagName === "ul" ||
                  child.tagName === "table" ||
                  child.tagName === "blockquote" ||
                  child.tagName === "h1" ||
                  child.tagName === "h2" ||
                  child.tagName === "h3" ||
                  child.tagName === "h4" ||
                  child.tagName === "h5" ||
                  child.tagName === "h6")
              )
            })
          if (hasBlock) {
            return <>{children}</>
          }
          return (
            <p {...props} style={{ lineHeight: 1.6, marginBottom: 16, color: "#555" }}>
              {children}
            </p>
          )
        },
        // Enhanced headings
        h1: ({ children }) => (
          <h1
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: 20,
              marginTop: 24,
            }}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            style={{
              color: "#ff6b6b",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: 16,
              marginTop: 20,
              borderBottom: "2px solid rgba(255, 107, 107, 0.2)",
              paddingBottom: 8,
            }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            style={{
              color: "#ffa726",
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: 12,
              marginTop: 16,
            }}
          >
            {children}
          </h3>
        ),
        // Enhanced lists
        ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 16, color: "#555" }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 16, color: "#555" }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: 8, lineHeight: 1.5 }}>{children}</li>,
        // Tooltips for glossary terms (inline only)
        span({ node, children, ...props }) {
          const text = String(children)
          if (GLOSSARY[text]) {
            return (
              <span className="tooltip" title={GLOSSARY[text]} style={{ borderBottom: "1px dotted #ff6b6b" }}>
                {text}
              </span>
            )
          }
          return <span {...props}>{children}</span>
        },
        // Enhanced collapsible code blocks
        code({ node, inline, className, children, ...props }) {
          if (inline) {
            return (
              <code
                className={className}
                {...props}
                style={{
                  background: "rgba(255, 107, 107, 0.1)",
                  color: "#ff6b6b",
                  padding: "0.2rem 0.4rem",
                  borderRadius: 4,
                  fontSize: "0.9em",
                  fontWeight: 600,
                }}
              >
                {children}
              </code>
            )
          }
          // Only render collapsible for block code at root, not inside <p>
          const idx = node.position?.start?.line || Math.random()
          const isCollapsed = collapsed[idx]
          return (
            <div
              style={{
                margin: "1.5rem 0",
                background: "linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 167, 38, 0.05) 100%)",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(255, 107, 107, 0.08)",
                border: "1px solid rgba(255, 107, 107, 0.1)",
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
                  border: "none",
                  color: "#ff6b6b",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "0.8rem 1.2rem",
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.3s ease",
                }}
                onClick={() => setCollapsed((c) => ({ ...c, [idx]: !isCollapsed }))}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 167, 38, 0.15) 100%)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)"
                }}
              >
                <FaCode style={{ fontSize: 16 }} />
                {isCollapsed ? (
                  <>
                    <FaEye style={{ fontSize: 14 }} />
                    Show Code
                  </>
                ) : (
                  <>
                    <FaEyeSlash style={{ fontSize: 14 }} />
                    Hide Code
                  </>
                )}
              </button>
              {!isCollapsed && (
                <pre
                  style={{
                    margin: 0,
                    padding: "1.5rem",
                    background: "#1a1a1a",
                    color: "#f8f8f2",
                    borderRadius: "0 0 12px 12px",
                    overflowX: "auto",
                    fontSize: "0.9em",
                    lineHeight: 1.5,
                  }}
                >
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              )}
            </div>
          )
        },
        // Enhanced collapsible sections for long blockquotes
        blockquote({ node, children }) {
          const idx = node.position?.start?.line || Math.random()
          const isOpen = openBlockquotes[idx]
          return (
            <div
              style={{
                margin: "1.5rem 0",
                background: "linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)",
                borderRadius: 12,
                padding: "1.2rem",
                border: "2px solid rgba(66, 165, 245, 0.2)",
                position: "relative",
              }}
            >
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#42a5f5",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.3s ease",
                }}
                onClick={() => setOpenBlockquotes((o) => ({ ...o, [idx]: !isOpen }))}
                onMouseEnter={(e) => {
                  e.target.style.color = "#1976d2"
                  e.target.style.transform = "translateX(4px)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#42a5f5"
                  e.target.style.transform = "translateX(0)"
                }}
              >
                <FaLightbulb style={{ fontSize: 16 }} />
                {isOpen ? "Hide Details" : "Show More Details"}
              </button>
              {isOpen && <blockquote style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>{children}</blockquote>}
            </div>
          )
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

function getEmbedUrl(url) {
  // Convert YouTube watch URL to embed URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}

export default function LessonContent({ title, objectives, body, summary, videoUrl }) {
  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      {/* Enhanced Title */}
      <h2
        style={{
          background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
          fontSize: 32,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      {/* Enhanced Learning Objectives */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
          borderRadius: 16,
          padding: "1.5rem 2rem",
          marginBottom: 24,
          border: "2px solid rgba(255, 107, 107, 0.2)",
        }}
      >
        <h4
          style={{
            color: "#ff6b6b",
            marginTop: 0,
            marginBottom: 16,
            fontSize: 20,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🎯 Learning Objectives
        </h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {objectives &&
            objectives.map((obj, i) => (
              <li
                key={i}
                style={{
                  color: "#555",
                  fontSize: 16,
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                {obj}
              </li>
            ))}
      </ul>
      </div>

      {/* Enhanced Video Section */}
      {videoUrl && (
        <div
          style={{
            margin: "2rem 0",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)",
            borderRadius: 16,
            padding: "2rem",
            border: "2px solid rgba(66, 165, 245, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
              color: "#42a5f5",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <FaPlay style={{ fontSize: 20 }} />
            Lesson Video
          </div>
          <iframe
            width="100%"
            height="400"
            src={getEmbedUrl(videoUrl)}
            title="Lesson Video"
            frameBorder="0"
            allowFullScreen
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(66, 165, 245, 0.2)",
              maxWidth: 700,
            }}
          />
        </div>
      )}

      {/* Enhanced Lesson Body */}
      <div
        style={{
          margin: "2rem 0",
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: 16,
          padding: "2rem 2.5rem",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          boxShadow: "0 2px 12px rgba(255, 107, 107, 0.05)",
        }}
      >
        <MarkdownWithFeatures>{body}</MarkdownWithFeatures>
      </div>

      {/* Enhanced Summary */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%)",
          borderRadius: 16,
          padding: "1.8rem 2rem",
          fontWeight: 500,
          border: "2px solid rgba(102, 187, 106, 0.2)",
          marginTop: 32,
        }}
      >
        <h4
          style={{
            color: "#66bb6a",
            marginTop: 0,
            marginBottom: 16,
            fontSize: 20,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ✨ Key Takeaways
        </h4>
        <div style={{ color: "#555", fontSize: 16, lineHeight: 1.6 }}>{summary}</div>
      </div>

      {/* Enhanced Tooltip styles */}
      <style>
        {`
        .tooltip {
          cursor: help;
          position: relative;
            transition: all 0.3s ease;
          }
          .tooltip:hover {
            color: #ff6b6b;
        }
        .tooltip[title]:hover:after {
          content: attr(title);
          position: absolute;
          left: 0;
          top: 120%;
            background: #333;
          color: #fff;
            padding: 0.6rem 1rem;
            border-radius: 8px;
          font-size: 13px;
          white-space: pre-line;
          z-index: 10;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            max-width: 250px;
            line-height: 1.4;
          }
          .tooltip[title]:hover:before {
            content: "";
            position: absolute;
            left: 10px;
            top: 110%;
            border: 6px solid transparent;
            border-bottom-color: #333;
            z-index: 11;
        }
        `}
      </style>
    </div>
  )
} 
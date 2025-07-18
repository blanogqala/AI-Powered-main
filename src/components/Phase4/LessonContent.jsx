import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';

/**
 * LessonContent
 * Props:
 * - title: string
 * - objectives: array of strings
 * - body: string (markdown)
 * - summary: string
 * - videoUrl: string (optional)
 *
 * Renders lesson title, objectives, body (markdown), summary, and optional video.
 * Adds tooltips for complex terms and collapsible code/sections.
 *
 * NOTE: Install react-markdown if not present: npm install react-markdown
 */

// Demo glossary for tooltips (extend with AI or glossary API)
const GLOSSARY = {
  "HTML": "HyperText Markup Language, the standard for web pages.",
  "CSS": "Cascading Style Sheets, used for styling web pages.",
  "JavaScript": "A programming language for web development.",
  "DOM": "Document Object Model, the structure of a web page."
};

// Custom renderer for tooltips and collapsibles
function MarkdownWithFeatures({ children }) {
  const [collapsed, setCollapsed] = useState({});

  return (
    <ReactMarkdown
      components={{
        // Custom paragraph renderer to avoid <p><div>...</div></p> and <p><pre>...</pre></p>
        p({ node, children, ...props }) {
          // If any child is a block element, don't wrap in <p>
          const hasBlock = node.children && node.children.some(child => {
            return (
              child.type === 'element' &&
              (child.tagName === 'pre' || child.tagName === 'div' || child.tagName === 'code' || child.tagName === 'ol' || child.tagName === 'ul' || child.tagName === 'table' || child.tagName === 'blockquote' || child.tagName === 'h1' || child.tagName === 'h2' || child.tagName === 'h3' || child.tagName === 'h4' || child.tagName === 'h5' || child.tagName === 'h6')
            );
          });
          if (hasBlock) {
            return <>{children}</>;
          }
          return <p {...props}>{children}</p>;
        },
        // Tooltips for glossary terms (inline only)
        span({ node, children, ...props }) {
          const text = String(children);
          if (GLOSSARY[text]) {
            return (
              <span className="tooltip" title={GLOSSARY[text]}>
                {text}
              </span>
            );
          }
          return <span {...props}>{children}</span>;
        },
        // Collapsible code blocks
        code({ node, inline, className, children, ...props }) {
          if (inline) {
            return <code className={className} {...props}>{children}</code>;
          }
          // Only render collapsible for block code at root, not inside <p>
          const idx = node.position?.start?.line || Math.random();
          const isCollapsed = collapsed[idx];
          return (
            <div style={{ margin: '1rem 0', background: '#f8faff', borderRadius: 8, boxShadow: '0 1px 4px rgba(31,38,135,0.06)' }}>
              <button
                style={{ background: 'none', border: 'none', color: '#3576d3', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 1rem' }}
                onClick={() => setCollapsed(c => ({ ...c, [idx]: !isCollapsed }))}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? 'Show Code' : 'Hide Code'}
              </button>
              {!isCollapsed && (
                <pre style={{ margin: 0, padding: '1rem', background: '#222', color: '#fff', borderRadius: 8, overflowX: 'auto' }}>
                  <code className={className} {...props}>{children}</code>
                </pre>
              )}
            </div>
          );
        },
        // Collapsible sections for long blockquotes
        blockquote({ children }) {
          const idx = Math.random();
          const [open, setOpen] = useState(false);
          return (
            <div style={{ margin: '1rem 0', background: '#e3eefe', borderRadius: 8, padding: '1rem' }}>
              <button
                style={{ background: 'none', border: 'none', color: '#3576d3', fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
              >
                {open ? 'Hide Details' : 'Show More'}
              </button>
              {open && <blockquote style={{ margin: 0 }}>{children}</blockquote>}
            </div>
          );
        }
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function getEmbedUrl(url) {
  // Convert YouTube watch URL to embed URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default function LessonContent({ title, objectives, body, summary, videoUrl }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Title */}
      <h2 style={{ color: '#3576d3', fontWeight: 800, fontSize: 28 }}>{title}</h2>
      {/* Learning Objectives */}
      <h4 style={{ color: '#3576d3', marginTop: 24 }}>Learning Objectives</h4>
      <ul style={{ marginBottom: 18 }}>
        {objectives && objectives.map((obj, i) => <li key={i}>{obj}</li>)}
      </ul>
      {/* Video (optional) */}
      {videoUrl && (
        <div style={{ margin: '1.5rem 0' }}>
          <iframe
            width="560"
            height="315"
            src={getEmbedUrl(videoUrl)}
            title="Lesson Video"
            frameBorder="0"
            allowFullScreen
            style={{ borderRadius: 12 }}
          ></iframe>
        </div>
      )}
      {/* Lesson Body (markdown) */}
      <div style={{ margin: '2rem 0' }}>
        <MarkdownWithFeatures>{body}</MarkdownWithFeatures>
      </div>
      {/* Summary */}
      <h4 style={{ color: '#3576d3', marginTop: 32 }}>Key Takeaways</h4>
      <div style={{ background: '#e3eefe', borderRadius: 8, padding: '1rem 1.5rem', fontWeight: 500 }}>{summary}</div>
      {/* Tooltip styles */}
      <style>{`
        .tooltip {
          border-bottom: 1px dotted #3576d3;
          cursor: help;
          position: relative;
        }
        .tooltip[title]:hover:after {
          content: attr(title);
          position: absolute;
          left: 0;
          top: 120%;
          background: #222;
          color: #fff;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 13px;
          white-space: pre-line;
          z-index: 10;
        }
      `}</style>
    </div>
  );
} 
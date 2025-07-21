"use client"

import { useState, useEffect } from "react"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import app from "../../firebase"
import { FaStickyNote, FaSave, FaCheck, FaExclamationTriangle, FaEdit } from "react-icons/fa"

export default function NotesTab({ lessonId, userId }) {
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const db = getFirestore(app)

  // Load note on mount
  useEffect(() => {
    let isMounted = true
    async function loadNote() {
      setLoading(true)
      setError("")
      try {
        // Try Firestore first
        const noteRef = doc(db, "notes", `${userId}_${lessonId}`)
        const snap = await getDoc(noteRef)
        if (isMounted && snap.exists()) {
          const noteText = snap.data().note || ""
          setNote(noteText)
          setWordCount(noteText.split(/\s+/).filter(Boolean).length)
        } else {
          // Fallback: localStorage
          const key = `lessonNote_${userId}_${lessonId}`
          const savedNote = localStorage.getItem(key)
          if (isMounted && savedNote) {
            setNote(savedNote)
            setWordCount(savedNote.split(/\s+/).filter(Boolean).length)
          }
        }
      } catch (err) {
        // Fallback: localStorage
        const key = `lessonNote_${userId}_${lessonId}`
        const savedNote = localStorage.getItem(key)
        if (isMounted && savedNote) {
          setNote(savedNote)
          setWordCount(savedNote.split(/\s+/).filter(Boolean).length)
        }
        setError("Failed to load note from Firestore. Using local storage.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    if (lessonId && userId) loadNote()
    return () => {
      isMounted = false
    }
  }, [lessonId, userId, db])

  // Update word count when note changes
  useEffect(() => {
    setWordCount(note.split(/\s+/).filter(Boolean).length)
  }, [note])

  // Save note
  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      // Try Firestore first
      const noteRef = doc(db, "notes", `${userId}_${lessonId}`)
      await setDoc(noteRef, {
        note,
        userId,
        lessonId,
        updated: Date.now(),
      })
      setSaved(true)
    } catch (err) {
      // Fallback: localStorage
      const key = `lessonNote_${userId}_${lessonId}`
      localStorage.setItem(key, note)
      setError("Saved to local storage only (Firestore unavailable).")
      setSaved(true)
    } finally {
      setSaving(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          color: "#666",
          fontSize: 16,
          gap: 12,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: "3px solid rgba(255, 167, 38, 0.1)",
            borderTop: "3px solid #ffa726",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        Loading your notes...
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)",
        borderRadius: 16,
        padding: "2rem 2.5rem",
        border: "1px solid rgba(255, 167, 38, 0.1)",
        boxShadow: "0 4px 20px rgba(255, 167, 38, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #ffa726, #66bb6a, #42a5f5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          fontSize: 60,
          opacity: 0.05,
        }}
      >
        📝
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <FaStickyNote style={{ color: "#ffa726", fontSize: 24 }} />
        <h4
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            background: "linear-gradient(135deg, #ffa726 0%, #66bb6a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          My Learning Notes
        </h4>
      </div>

      {/* Note Stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          padding: "0.8rem 1.2rem",
          background: "rgba(255, 167, 38, 0.1)",
          borderRadius: 12,
          border: "1px solid rgba(255, 167, 38, 0.2)",
        }}
      >
        <FaEdit style={{ color: "#ffa726", fontSize: 16 }} />
        <span style={{ color: "#666", fontSize: 14, fontWeight: 500 }}>
          {wordCount} words • {note.length} characters
        </span>
        {note.length > 0 && (
          <span
            style={{
              marginLeft: "auto",
              color: "#66bb6a",
              fontSize: 12,
              fontWeight: 600,
              padding: "0.3rem 0.8rem",
              background: "rgba(102, 187, 106, 0.1)",
              borderRadius: 8,
              border: "1px solid rgba(102, 187, 106, 0.2)",
            }}
          >
            Active
          </span>
        )}
      </div>

      {/* Enhanced Textarea */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="✍️ Write your thoughts, key insights, questions, or important points from this lesson..."
        disabled={saving}
        style={{
          width: "100%",
          minHeight: 200,
          borderRadius: 12,
          border: "2px solid rgba(255, 167, 38, 0.2)",
          padding: "1.2rem 1.5rem",
          fontSize: 16,
          fontFamily: "inherit",
          background: "rgba(255, 255, 255, 0.9)",
          transition: "all 0.3s ease",
          resize: "vertical",
          lineHeight: 1.6,
          color: "#333",
          marginBottom: 20,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#ffa726"
          e.target.style.boxShadow = "0 0 0 3px rgba(255, 167, 38, 0.1)"
          e.target.style.background = "rgba(255, 255, 255, 1)"
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255, 167, 38, 0.2)"
          e.target.style.boxShadow = "none"
          e.target.style.background = "rgba(255, 255, 255, 0.9)"
        }}
      />

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving || note.trim().length === 0}
          style={{
            background: saving
              ? "linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)"
              : "linear-gradient(135deg, #ffa726 0%, #66bb6a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "1rem 2rem",
            fontWeight: 700,
            fontSize: 16,
            cursor: saving || note.trim().length === 0 ? "default" : "pointer",
            opacity: saving || note.trim().length === 0 ? 0.6 : 1,
            boxShadow: saving || note.trim().length === 0 ? "none" : "0 4px 15px rgba(255, 167, 38, 0.3)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (!saving && note.trim().length > 0) {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 6px 20px rgba(255, 167, 38, 0.4)"
            }
          }}
          onMouseLeave={(e) => {
            if (!saving && note.trim().length > 0) {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 4px 15px rgba(255, 167, 38, 0.3)"
            }
          }}
        >
          {saving ? (
            <>
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Saving...
            </>
          ) : (
            <>
              <FaSave style={{ fontSize: 16 }} />
              Save Notes
            </>
          )}
        </button>

        {/* Status Messages */}
        {saved && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.8rem 1.2rem",
              background: "linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)",
              color: "#66bb6a",
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 12,
              border: "2px solid rgba(102, 187, 106, 0.2)",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <FaCheck style={{ fontSize: 16 }} />
            Notes saved successfully!
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.8rem 1.2rem",
              background: "linear-gradient(135deg, rgba(255, 167, 38, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)",
              color: "#ffa726",
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 12,
              border: "2px solid rgba(255, 167, 38, 0.2)",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <FaExclamationTriangle style={{ fontSize: 16 }} />
            {error}
          </div>
        )}
      </div>

      {/* Tips Section */}
      {note.length === 0 && (
        <div
          style={{
            marginTop: 24,
            padding: "1.5rem 2rem",
            background: "linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)",
            borderRadius: 12,
            border: "2px solid rgba(66, 165, 245, 0.2)",
          }}
        >
          <h5
            style={{
              margin: "0 0 12px 0",
              color: "#42a5f5",
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            💡 Note-taking Tips
          </h5>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "#555",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <li>Summarize key concepts in your own words</li>
            <li>Write down questions that come to mind</li>
            <li>Note practical applications or examples</li>
            <li>Record your "aha!" moments and insights</li>
          </ul>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
} 
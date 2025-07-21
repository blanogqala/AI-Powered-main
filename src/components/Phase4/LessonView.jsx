"use client"

import { useState, useEffect } from "react"
import LessonContent from "./LessonContent"
import LessonQuiz from "./LessonQuiz"
import NotesTab from "./NotesTab"
import TranscriptTab from "./TranscriptTab"
import DiscussionTab from "./DiscussionTab"
import ProgressFooter from "./ProgressFooter"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import app from "../../firebase"
import { FaBook, FaStickyNote, FaFileAlt, FaComments, FaQuestionCircle, FaRocket } from "react-icons/fa"

export default function LessonView({ lessonId, userId, lessonData: lessonDataProp, quizData, projectData }) {
  const [tab, setTab] = useState("lesson")
  const [lessonData, setLessonData] = useState(lessonDataProp || null)
  const [loading, setLoading] = useState(!lessonDataProp)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [progressError, setProgressError] = useState("")
  const db = getFirestore(app)

  // Sync lessonData with lessonDataProp when it changes
  useEffect(() => {
    setLessonData(lessonDataProp || null)
  }, [lessonDataProp])

  // Fetch lesson data if not provided
  useEffect(() => {
    if (lessonDataProp) return
    let isMounted = true
    async function fetchLesson() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseTitle: lessonId,
            moduleTitle: "",
            subtopic: "",
            level: "",
            timeline: "",
          }),
        })
        if (!res.ok) throw new Error("Failed to fetch lesson")
        const data = await res.json()
        if (isMounted) setLessonData(data)
      } catch (err) {
        if (isMounted) setError("Could not load lesson. Please try again later.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    if (lessonId && !lessonDataProp) fetchLesson()
    return () => {
      isMounted = false
    }
  }, [lessonId, lessonDataProp])

  // Fetch progress for this lesson
  useEffect(() => {
    let isMounted = true
    async function fetchProgress() {
      setProgressError("")
      try {
        const progressRef = doc(db, "lessonProgress", `${userId}_${lessonId}`)
        const snap = await getDoc(progressRef)
        if (isMounted && snap.exists()) {
          const data = snap.data()
          setProgress(data.progress || 0)
          setIsComplete(!!data.isComplete)
        } else {
          const key = `lessonProgress_${userId}_${lessonId}`
          const saved = localStorage.getItem(key)
          if (isMounted && saved) {
            const data = JSON.parse(saved)
            setProgress(data.progress || 0)
            setIsComplete(!!data.isComplete)
          }
        }
      } catch (err) {
        const key = `lessonProgress_${userId}_${lessonId}`
        const saved = localStorage.getItem(key)
        if (isMounted && saved) {
          const data = JSON.parse(saved)
          setProgress(data.progress || 0)
          setIsComplete(!!data.isComplete)
        }
        setProgressError("Failed to load progress from Firestore. Using local storage.")
      }
    }
    if (lessonId && userId) fetchProgress()
    return () => {
      isMounted = false
    }
  }, [lessonId, userId, db])

  // Handler: Mark as complete
  const handleMarkComplete = async () => {
    setIsComplete(true)
    setProgress(100)
    setProgressError("")
    try {
      const progressRef = doc(db, "lessonProgress", `${userId}_${lessonId}`)
      await setDoc(progressRef, {
        progress: 100,
        isComplete: true,
        userId,
        lessonId,
        updated: Date.now(),
      })
    } catch (err) {
      const key = `lessonProgress_${userId}_${lessonId}`
      localStorage.setItem(key, JSON.stringify({ progress: 100, isComplete: true }))
      setProgressError("Saved to local storage only (Firestore unavailable).")
    }
  }

  // Handler: Next lesson (placeholder)
  const handleNextLesson = () => {
    alert("Next lesson coming soon!")
  }

  // Loading and error states
  if (loading)
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
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
        <div style={{ color: "#ff6b6b", fontSize: 18, fontWeight: 600 }}>Loading lesson...</div>
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

  if (error)
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          color: "#ff5252",
          fontSize: 18,
          fontWeight: 600,
          background: "rgba(255, 82, 82, 0.1)",
          borderRadius: 12,
          border: "2px solid rgba(255, 82, 82, 0.2)",
        }}
      >
        ⚠️ {error}
      </div>
    )

  if (!lessonData)
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          color: "#ff5252",
          fontSize: 18,
          fontWeight: 600,
          background: "rgba(255, 82, 82, 0.1)",
          borderRadius: 12,
          border: "2px solid rgba(255, 82, 82, 0.2)",
        }}
      >
        📚 Lesson not found.
      </div>
    )

  // Enhanced tab navigation with icons
  const tabs = [
    { key: "lesson", label: "Lesson", icon: FaBook, color: "#ff6b6b" },
    { key: "notes", label: "Notes", icon: FaStickyNote, color: "#ffa726" },
    { key: "transcript", label: "Transcript", icon: FaFileAlt, color: "#66bb6a" },
    { key: "discussion", label: "Discussion", icon: FaComments, color: "#42a5f5" },
    { key: "quiz", label: "Quiz & Project", icon: FaQuestionCircle, color: "#ab47bc" },
  ]

  return (
    <div
      style={{
        maxWidth: 950,
        margin: "0 auto",
        minHeight: 600,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(255, 107, 107, 0.12)",
        padding: "2.5rem 2.5rem",
        position: "relative",
        border: "1px solid rgba(255, 107, 107, 0.1)",
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
          height: 4,
          background: "linear-gradient(90deg, #ff6b6b, #ffa726, #66bb6a, #42a5f5, #ab47bc)",
          borderRadius: "20px 20px 0 0",
        }}
      />

      {/* Enhanced Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          background: "rgba(255, 255, 255, 0.6)",
          padding: "0.5rem",
          borderRadius: 16,
          border: "1px solid rgba(255, 107, 107, 0.1)",
        }}
      >
        {tabs.map((t) => {
          const IconComponent = t.icon
          const isActive = tab === t.key
          return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
                background: isActive ? `linear-gradient(135deg, ${t.color} 0%, ${t.color}80 100%)` : "transparent",
              border: "none",
                color: isActive ? "#fff" : t.color,
                fontWeight: isActive ? 700 : 500,
                fontSize: 15,
                padding: "0.8rem 1.2rem",
                cursor: "pointer",
                borderRadius: 12,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = `${t.color}15`
                  e.target.style.transform = "translateY(-2px)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = "transparent"
                  e.target.style.transform = "translateY(0)"
                }
              }}
            >
              <IconComponent style={{ fontSize: 16 }} />
            {t.label}
          </button>
          )
        })}
      </div>

      {/* Enhanced Tab Content */}
      <div
        style={{
          minHeight: 400,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)",
          borderRadius: 16,
          padding: "2rem 2.5rem",
          border: "1px solid rgba(255, 107, 107, 0.1)",
          position: "relative",
        }}
      >
        {tab === "lesson" && (
          <LessonContent
            title={lessonData.title}
            objectives={lessonData.objectives}
            body={lessonData.body}
            summary={lessonData.summary}
            videoUrl={lessonData.videoUrl}
          />
        )}
        {tab === "notes" && <NotesTab lessonId={lessonId} userId={userId} />}
        {tab === "transcript" && <TranscriptTab lessonId={lessonId} />}
        {tab === "discussion" && <DiscussionTab lessonId={lessonId} />}
        {tab === "quiz" && (
          <div>
            <LessonQuiz lessonId={lessonId} userId={userId} quiz={quizData} lessonBody={lessonData?.body} />
            {projectData && (
              <div
                style={{
                  marginTop: 40,
                  background: "linear-gradient(135deg, rgba(171, 71, 188, 0.1) 0%, rgba(255, 167, 38, 0.1) 100%)",
                  borderRadius: 16,
                  padding: "2.5rem 2rem",
                  border: "2px solid rgba(171, 71, 188, 0.2)",
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
                  🚀
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <FaRocket style={{ color: "#ab47bc", fontSize: 24 }} />
                  <h3
                    style={{
                      background: "linear-gradient(135deg, #ab47bc 0%, #ffa726 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 700,
                      fontSize: 24,
                      margin: 0,
                    }}
                  >
                    Project Challenge
                  </h3>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    marginBottom: 12,
                    color: "#333",
                  }}
                >
                  {projectData.title}
                </div>
                <div
                  style={{
                    color: "#555",
                    fontSize: 16,
                    marginBottom: 16,
                    lineHeight: 1.6,
                  }}
                >
                  {projectData.description}
                </div>
                {projectData.instructions && (
                  <div style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#ab47bc", fontSize: 16 }}>Instructions:</strong>
                    <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                      {projectData.instructions.map((inst, idx) => (
                        <li
                          key={idx}
                          style={{
                            marginBottom: 8,
                            color: "#555",
                            lineHeight: 1.5,
                          }}
                        >
                          {inst}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {projectData.rubric && (
                  <div style={{ marginTop: 16 }}>
                    <strong style={{ color: "#ab47bc", fontSize: 16 }}>Grading Rubric:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {projectData.rubric.map((r, idx) => (
                        <li
                          key={idx}
                          style={{
                            marginBottom: 6,
                            color: "#555",
                            lineHeight: 1.5,
                          }}
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <ProjectSubmissionForm
                  userId={userId}
                  lessonId={lessonId}
                  courseTitle={lessonData?.courseTitle}
                  moduleTitle={lessonData?.moduleTitle}
                  subtopic={lessonData?.title}
                  rubric={projectData.rubric}
                  onGraded={({ grade, feedback }) => {
                    setIsComplete(true)
                    setProgress(100)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Progress Footer */}
      <ProgressFooter
        lessonId={lessonId}
        isComplete={isComplete}
        onMarkComplete={handleMarkComplete}
        onNextLesson={handleNextLesson}
        progress={progress}
      />

      {/* Progress error message */}
      {progressError && (
        <div
          style={{
            color: "#ff5252",
            marginTop: 12,
            padding: "0.8rem 1rem",
            background: "rgba(255, 82, 82, 0.1)",
            borderRadius: 8,
            border: "1px solid rgba(255, 82, 82, 0.2)",
            fontSize: 14,
          }}
        >
          ⚠️ {progressError}
        </div>
      )}
    </div>
  )
}

// Enhanced ProjectSubmissionForm component
function ProjectSubmissionForm({ userId, lessonId, courseTitle, moduleTitle, subtopic, rubric, onGraded }) {
  const [submission, setSubmission] = useState("")
  const [loading, setLoading] = useState(false)
  const [grade, setGrade] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setGrade(null)
    setFeedback("")
    try {
      const res = await fetch("/api/submit-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          lessonId,
          courseTitle,
          moduleTitle,
          subtopic,
          projectSubmission: submission,
          rubric,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit project for grading")
      const data = await res.json()
      setGrade(data.grade)
      setFeedback(data.feedback)
      if (onGraded) onGraded({ grade: data.grade, feedback: data.feedback })
    } catch (err) {
      setError(err.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
      <label
        style={{
          fontWeight: 600,
          color: "#ab47bc",
          marginBottom: 12,
          display: "block",
          fontSize: 16,
        }}
      >
        🚀 Submit your project:
      </label>
      <textarea
        value={submission}
        onChange={(e) => setSubmission(e.target.value)}
        placeholder="Paste your project code, link, or description here..."
        style={{
          width: "100%",
          minHeight: 140,
          borderRadius: 12,
          border: "2px solid rgba(171, 71, 188, 0.2)",
          padding: "1rem 1.2rem",
          fontSize: "1em",
          marginBottom: 16,
          fontFamily: "inherit",
          background: "rgba(255, 255, 255, 0.9)",
          transition: "all 0.3s ease",
          resize: "vertical",
        }}
        required
        disabled={loading}
        onFocus={(e) => {
          e.target.style.borderColor = "#ab47bc"
          e.target.style.boxShadow = "0 0 0 3px rgba(171, 71, 188, 0.1)"
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(171, 71, 188, 0.2)"
          e.target.style.boxShadow = "none"
        }}
      />
      <button
        type="submit"
        disabled={loading || !submission}
        style={{
          background: loading
            ? "linear-gradient(135deg, #cccccc 0%, #aaaaaa 100%)"
            : "linear-gradient(135deg, #ab47bc 0%, #ffa726 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "1rem 2rem",
          fontWeight: 700,
          fontSize: 16,
          cursor: loading ? "default" : "pointer",
          opacity: loading || !submission ? 0.7 : 1,
          boxShadow: loading ? "none" : "0 4px 15px rgba(171, 71, 188, 0.3)",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onMouseEnter={(e) => {
          if (!loading && submission) {
            e.target.style.transform = "translateY(-2px)"
            e.target.style.boxShadow = "0 6px 20px rgba(171, 71, 188, 0.4)"
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && submission) {
            e.target.style.transform = "translateY(0)"
            e.target.style.boxShadow = "0 4px 15px rgba(171, 71, 188, 0.3)"
          }
        }}
      >
        {loading ? (
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
            Grading...
          </>
        ) : (
          <>
            <FaRocket style={{ fontSize: 16 }} />
            Submit for AI Grading
          </>
        )}
      </button>

      {grade !== null && (
        <div
          style={{
            marginTop: 20,
            padding: "1.2rem 1.5rem",
            background:
              grade >= 60
                ? "linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)"
                : "linear-gradient(135deg, rgba(255, 82, 82, 0.1) 0%, rgba(244, 67, 54, 0.1) 100%)",
            borderRadius: 12,
            border: `2px solid ${grade >= 60 ? "rgba(102, 187, 106, 0.3)" : "rgba(255, 82, 82, 0.3)"}`,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: grade >= 60 ? "#66bb6a" : "#ff5252",
              fontSize: 20,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {grade >= 60 ? "🎉" : "📝"} Grade: {grade} / 100
          </div>
          {feedback && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: 8,
                padding: "1rem 1.2rem",
                color: "#555",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#ab47bc" }}>AI Feedback:</strong> {feedback}
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#ff5252",
            marginTop: 12,
            padding: "0.8rem 1rem",
            background: "rgba(255, 82, 82, 0.1)",
            borderRadius: 8,
            border: "1px solid rgba(255, 82, 82, 0.2)",
            fontSize: 14,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </form>
  )
}


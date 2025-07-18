import React, { useState, useEffect } from "react";
import LessonContent from "./LessonContent";
import LessonQuiz from "./LessonQuiz";
import NotesTab from "./NotesTab";
import TranscriptTab from "./TranscriptTab";
import DiscussionTab from "./DiscussionTab";
import ProgressFooter from "./ProgressFooter";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "../../firebase";

/**
 * LessonView Orchestrator
 * Props:
 * - lessonId: string
 * - userId: string
 * - lessonData: object (optional, if already loaded)
 *
 * Handles loading, tab state, and passes data to subcomponents.
 * Prepares for future AI assistant/resource sidebar.
 */
export default function LessonView({ lessonId, userId, lessonData: lessonDataProp, quizData, projectData }) {
  const [tab, setTab] = useState("lesson");
  const [lessonData, setLessonData] = useState(lessonDataProp || null);
  // Remove quiz state and fetch logic; use quizData prop only
  const [loading, setLoading] = useState(!lessonDataProp);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0); // 0-100
  const [isComplete, setIsComplete] = useState(false);
  const [progressError, setProgressError] = useState("");
  const db = getFirestore(app);

  // Sync lessonData with lessonDataProp when it changes
  useEffect(() => {
    setLessonData(lessonDataProp || null);
  }, [lessonDataProp]);

  // Fetch lesson data if not provided
  useEffect(() => {
    if (lessonDataProp) return;
    let isMounted = true;
    async function fetchLesson() {
      setLoading(true);
      setError("");
      try {
        // Fetch from backend
        const res = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseTitle: lessonId, moduleTitle: "", subtopic: "", level: "", timeline: "" }) // TODO: Replace with actual props/values
        });
        if (!res.ok) throw new Error("Failed to fetch lesson");
        const data = await res.json();
        if (isMounted) setLessonData(data);
      } catch (err) {
        if (isMounted) setError("Could not load lesson. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (lessonId && !lessonDataProp) fetchLesson();
    return () => { isMounted = false; };
  }, [lessonId, lessonDataProp]);

  // Remove useEffect that fetches quiz from /api/lesson/.../quiz

  // Fetch progress for this lesson
  useEffect(() => {
    let isMounted = true;
    async function fetchProgress() {
      setProgressError("");
      try {
        // Try Firestore first
        const progressRef = doc(db, "lessonProgress", `${userId}_${lessonId}`);
        const snap = await getDoc(progressRef);
        if (isMounted && snap.exists()) {
          const data = snap.data();
          setProgress(data.progress || 0);
          setIsComplete(!!data.isComplete);
        } else {
          // Fallback: localStorage
          const key = `lessonProgress_${userId}_${lessonId}`;
          const saved = localStorage.getItem(key);
          if (isMounted && saved) {
            const data = JSON.parse(saved);
            setProgress(data.progress || 0);
            setIsComplete(!!data.isComplete);
          }
        }
      } catch (err) {
        // Fallback: localStorage
        const key = `lessonProgress_${userId}_${lessonId}`;
        const saved = localStorage.getItem(key);
        if (isMounted && saved) {
          const data = JSON.parse(saved);
          setProgress(data.progress || 0);
          setIsComplete(!!data.isComplete);
        }
        setProgressError("Failed to load progress from Firestore. Using local storage.");
      }
    }
    if (lessonId && userId) fetchProgress();
    return () => { isMounted = false; };
  }, [lessonId, userId, db]);

  // Handler: Mark as complete
  const handleMarkComplete = async () => {
    setIsComplete(true);
    setProgress(100);
    setProgressError("");
    try {
      // Try Firestore first
      const progressRef = doc(db, "lessonProgress", `${userId}_${lessonId}`);
      await setDoc(progressRef, { progress: 100, isComplete: true, userId, lessonId, updated: Date.now() });
    } catch (err) {
      // Fallback: localStorage
      const key = `lessonProgress_${userId}_${lessonId}`;
      localStorage.setItem(key, JSON.stringify({ progress: 100, isComplete: true }));
      setProgressError("Saved to local storage only (Firestore unavailable).");
    }
  };

  // Handler: Next lesson (placeholder)
  const handleNextLesson = () => {
    // TODO: Implement navigation to next lesson
    alert("Next lesson coming soon!");
  };

  // Loading and error states
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading lesson...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f' }}>{error}</div>;
  if (!lessonData) return <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f' }}>Lesson not found.</div>;

  // Tab navigation
  const tabs = [
    { key: "lesson", label: "Lesson" },
    { key: "notes", label: "Notes" },
    { key: "transcript", label: "Transcript" },
    { key: "discussion", label: "Discussion" },
    { key: "quiz", label: "Quiz & Project" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', minHeight: 600, background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)', padding: '2.5rem 2rem', position: 'relative' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1.5px solid #e0e0e0', marginBottom: 18 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t.key ? "2.5px solid #4f8cff" : "none",
              color: tab === t.key ? "#3576d3" : "#888",
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 16,
              padding: "0.5rem 0.7rem",
              cursor: "pointer"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div style={{ minHeight: 350 }}>
        {tab === "lesson" && (
          <LessonContent
            title={lessonData.title}
            objectives={lessonData.objectives}
            body={lessonData.body}
            summary={lessonData.summary}
            videoUrl={lessonData.videoUrl}
          />
        )}
        {tab === "notes" && (
          <NotesTab lessonId={lessonId} userId={userId} />
        )}
        {tab === "transcript" && (
          <TranscriptTab lessonId={lessonId} />
        )}
        {tab === "discussion" && (
          <DiscussionTab lessonId={lessonId} />
        )}
        {tab === "quiz" && (
          <div>
            <LessonQuiz lessonId={lessonId} userId={userId} quiz={quizData} lessonBody={lessonData?.body} />
            {projectData && (
              <div style={{ marginTop: 36, background: '#f8faff', borderRadius: 10, padding: '2rem 1.5rem' }}>
                <h3 style={{ color: '#3576d3', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Project</h3>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{projectData.title}</div>
                <div style={{ color: '#444', fontSize: 16, marginBottom: 12 }}>{projectData.description}</div>
                {projectData.instructions && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Instructions:</strong>
                    <ol style={{ marginTop: 6 }}>
                      {projectData.instructions.map((inst, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {projectData.rubric && (
                  <div style={{ marginTop: 10 }}>
                    <strong>Rubric:</strong>
                    <ul style={{ marginTop: 6 }}>
                      {projectData.rubric.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Project Submission Form */}
                <ProjectSubmissionForm
                  userId={userId}
                  lessonId={lessonId}
                  courseTitle={lessonData?.courseTitle}
                  moduleTitle={lessonData?.moduleTitle}
                  subtopic={lessonData?.title}
                  rubric={projectData.rubric}
                  onGraded={({ grade, feedback }) => {
                    setIsComplete(true);
                    setProgress(100);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {/* Progress Footer */}
      <ProgressFooter
        lessonId={lessonId}
        isComplete={isComplete}
        onMarkComplete={handleMarkComplete}
        onNextLesson={handleNextLesson}
        progress={progress}
      />
      {/* Progress error message */}
      {progressError && <div style={{ color: '#e53935', marginTop: 10 }}>{progressError}</div>}
      {/* Placeholder for future AI assistant/resource sidebar */}
      {/* <AIAssistantSidebar lessonId={lessonId} /> */}
    </div>
  );
}

// Add ProjectSubmissionForm component at the bottom of the file
function ProjectSubmissionForm({ userId, lessonId, courseTitle, moduleTitle, subtopic, rubric, onGraded }) {
  const [submission, setSubmission] = useState("");
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGrade(null);
    setFeedback("");
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
          rubric
        })
      });
      if (!res.ok) throw new Error("Failed to submit project for grading");
      const data = await res.json();
      setGrade(data.grade);
      setFeedback(data.feedback);
      if (onGraded) onGraded({ grade: data.grade, feedback: data.feedback });
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <label style={{ fontWeight: 600, color: '#3576d3', marginBottom: 8, display: 'block' }}>
        Submit your project:
      </label>
      <textarea
        value={submission}
        onChange={e => setSubmission(e.target.value)}
        placeholder="Paste your project code, link, or description here..."
        style={{ width: '100%', minHeight: 120, borderRadius: 8, border: '1.5px solid #e0e0e0', padding: '0.7rem', fontSize: '1em', marginBottom: 10 }}
        required
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !submission}
        style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Grading...' : 'Submit Project for Grading'}
      </button>
      {grade !== null && (
        <div style={{ marginTop: 18, fontWeight: 700, color: grade >= 60 ? '#43a047' : '#e53935', fontSize: 18 }}>
          Grade: {grade} / 100
        </div>
      )}
      {feedback && (
        <div style={{ marginTop: 10, background: '#e3eefe', borderRadius: 8, padding: '1rem 1.5rem', color: '#3576d3', fontWeight: 500 }}>
          <strong>AI Feedback:</strong> {feedback}
        </div>
      )}
      {error && <div style={{ color: '#e53935', marginTop: 10 }}>{error}</div>}
    </form>
  );
}

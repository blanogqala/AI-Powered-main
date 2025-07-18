import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "../../firebase";

/**
 * LessonQuiz
 * Props:
 * - lessonId: string
 * - userId: string
 * - quiz: array of questions [{ id, question, options, correct, explanation }]
 *
 * Renders quiz, handles feedback, and stores attempts in Firestore (or localStorage fallback).
 */
export default function LessonQuiz({ lessonId, userId, quiz, lessonBody }) {
  const [answers, setAnswers] = useState({}); // { [qid]: selectedOption }
  const [feedback, setFeedback] = useState({}); // { [qid]: { correct, explanation } }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // No longer fetches quiz, so not needed
  const db = getFirestore(app);

  // Defensive: ensure quiz is always an array
  const safeQuizData = Array.isArray(quiz) ? quiz : [];

  if (loading) {
    return <div style={{ color: '#888', fontSize: 16 }}>Loading quiz...</div>;
  }
  if (safeQuizData.length === 0) {
    return <div style={{ color: '#888', fontSize: 16 }}>No quiz available for this lesson.</div>;
  }

  // Handle answer selection
  const handleSelect = (qid, option) => {
    setAnswers(a => ({ ...a, [qid]: option }));
  };

  // Handle quiz submission
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // Evaluate answers and build feedback
      const fb = {};
      let totalScore = 0;
      for (const q of safeQuizData) {
        const userAns = answers[q.id];
        if (q.type === "mcq") {
          const isCorrect = userAns === q.correct;
          fb[q.id] = {
            correct: isCorrect,
            explanation: q.explanation || ""
          };
          if (isCorrect) totalScore++;
        } else if (q.type === "short") {
          // AI-based grading for short answer
          let aiResult = { score: 0, feedback: "" };
          try {
            const res = await fetch("/api/grade-short-answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: q.question,
                correct: q.correct,
                userAnswer: userAns
              })
            });
            if (res.ok) {
              aiResult = await res.json();
            } else {
              aiResult = { score: 0, feedback: "AI grading failed." };
            }
          } catch {
            aiResult = { score: 0, feedback: "AI grading failed." };
          }
          fb[q.id] = {
            correct: aiResult.score === 1,
            explanation: q.explanation || "",
            aiFeedback: aiResult.feedback
          };
          if (aiResult.score === 1) totalScore++;
        }
      }
      setFeedback(fb);
      setSubmitted(true);
      // Try Firestore first
      const attempt = {
        answers,
        feedback: fb,
        timestamp: Date.now(),
        userId,
        lessonId
      };
      const attemptRef = doc(db, "quizAttempts", `${userId}_${lessonId}`);
      await setDoc(attemptRef, attempt);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Score calculation
  const score = Object.values(feedback).filter(f => f.correct).length;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: '0 auto' }}>
      <h3 style={{ color: '#3576d3', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Quiz</h3>
      {safeQuizData.map((q, idx) => (
        <div key={q.id} style={{ marginBottom: 28, background: '#f8faff', borderRadius: 8, padding: '1.2rem 1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>{idx + 1}. {q.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options ? q.options.map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: submitted ? 'default' : 'pointer', fontWeight: 500 }}>
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleSelect(q.id, opt)}
                  disabled={submitted}
                  style={{ accentColor: '#4f8cff' }}
                  required={q.type === "mcq"}
                />
                {opt}
                {submitted && feedback[q.id] && (
                  <span style={{ marginLeft: 10, fontWeight: 700, color: feedback[q.id].correct ? '#43a047' : '#e53935' }}>
                    {feedback[q.id].correct ? '✔ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </label>
            )) : (
              <textarea
                value={answers[q.id] || ""}
                onChange={e => handleSelect(q.id, e.target.value)}
                disabled={submitted}
                style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1.5px solid #e0e0e0', padding: '0.5rem', fontSize: '1em' }}
                placeholder="Type your answer here..."
                required={q.type === "short"}
              />
            )}
          </div>
          {/* Show explanation after submit */}
          {submitted && feedback[q.id] && feedback[q.id].explanation && (
            <div style={{ marginTop: 10, color: '#3576d3', fontSize: 15, background: '#e3eefe', borderRadius: 6, padding: '0.7rem 1rem' }}>
              <strong>Explanation:</strong> {feedback[q.id].explanation}
            </div>
          )}
          {/* Show AI feedback for short answer */}
          {submitted && feedback[q.id] && feedback[q.id].aiFeedback && (
            <div style={{ marginTop: 10, color: '#3576d3', fontSize: 15, background: '#e3eefe', borderRadius: 6, padding: '0.7rem 1rem' }}>
              <strong>AI Feedback:</strong> {feedback[q.id].aiFeedback}
            </div>
          )}
        </div>
      ))}
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      {!submitted && (
        <button type="submit" disabled={submitting} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 2rem', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 10 }}>
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      )}
      {submitted && (
        <div style={{ marginTop: 18, fontWeight: 700, color: '#43a047', fontSize: 18 }}>
          Score: {score} / {safeQuizData.length}
        </div>
      )}
    </form>
  );
} 
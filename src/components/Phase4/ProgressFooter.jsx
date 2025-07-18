import React from "react";
/**
 * ProgressFooter
 * Props:
 * - lessonId: string
 * - isComplete: boolean
 * - onMarkComplete: function
 * - onNextLesson: function
 * - progress: number (0-100)
 *
 * Renders Mark as Complete, Next Lesson, and progress UI.
 */
export default function ProgressFooter({ lessonId, isComplete, onMarkComplete, onNextLesson, progress }) {
  async function saveProgress({ userId, courseId, lessonId }) {
    try {
      await fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId, lessonId })
      });
    } catch (err) {
      // Optionally handle error
      console.error('Failed to save progress', err);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 32, borderTop: '1.5px solid #e0e0e0', paddingTop: 18 }}>
      <button
        onClick={onMarkComplete}
        disabled={isComplete}
        style={{
          background: isComplete ? '#43a047' : '#4f8cff',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.7rem 1.5rem',
          fontWeight: 600,
          cursor: isComplete ? 'default' : 'pointer',
          opacity: isComplete ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        aria-label={isComplete ? 'Lesson completed' : 'Mark lesson as complete'}
      >
        {isComplete && <span style={{ fontSize: 20, color: '#fff' }}>✔</span>}
        {isComplete ? 'Completed' : 'Mark as Complete'}
      </button>
      <button
        onClick={onNextLesson}
        style={{
          background: '#e3eefe',
          color: '#3576d3',
          border: 'none',
          borderRadius: 8,
          padding: '0.7rem 1.5rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        aria-label="Go to next lesson"
      >
        Next Lesson
      </button>
      <div style={{ marginLeft: 'auto', color: '#888', fontWeight: 600, fontSize: 15 }}>
        Progress: <span style={{ color: '#3576d3', fontWeight: 700 }}>{progress}%</span>
      </div>
    </div>
  );
} 
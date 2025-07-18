import React, { useState } from "react";
import styles from "./QuizAndProject.module.css";

export default function QuizAndProject({ quiz, rubric }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [review, setReview] = useState(false);
  const [file, setFile] = useState(null);
  const [aiFeedback, setAIFeedback] = useState("");

  const handleQuizChange = (qid, value) => {
    setAnswers(a => ({ ...a, [qid]: value }));
  };

  const handleQuizSubmit = e => {
    e.preventDefault();
    // Dummy scoring logic
    let s = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === q.answer) s++;
    });
    setScore(s);
    setReview(true);
  };

  const handleFileChange = e => setFile(e.target.files[0]);
  const handleProjectSubmit = e => {
    e.preventDefault();
    // Simulate AI feedback
    setAIFeedback("Great job! Your project meets all rubric criteria.");
  };

  // Defensive: ensure quiz.questions is always an array
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const safeRubric = Array.isArray(rubric) ? rubric : [];

  return (
    <div className={styles.quizProject}>
      <div className={styles.quizCard}>
        <h3>Quiz</h3>
        <form onSubmit={handleQuizSubmit}>
          {questions.map(q => (
            <div key={q.id} className={styles.question}>
              <div>{q.text}</div>
              {q.type === "mcq" ? (
                q.options.map(opt => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleQuizChange(q.id, opt)}
                    />
                    {opt}
                  </label>
                ))
              ) : (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={e => handleQuizChange(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
          <button type="submit">Submit Quiz</button>
        </form>
        {review && (
          <div className={styles.score}>
            Score: {score} / {questions.length}
          </div>
        )}
      </div>
      <div className={styles.projectCard}>
        <h3>Project Submission</h3>
        <form onSubmit={handleProjectSubmit}>
          <input type="file" onChange={handleFileChange} />
          <div className={styles.rubric}>
            <h4>Rubric</h4>
            <ul>
              {safeRubric.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <button type="submit">Submit Project</button>
        </form>
        {aiFeedback && (
          <div className={styles.aiFeedback}>
            <h4>AI Feedback</h4>
            <div>{aiFeedback}</div>
          </div>
        )}
      </div>
    </div>
  );
}

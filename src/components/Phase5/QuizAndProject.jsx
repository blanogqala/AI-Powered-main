"use client"

import { useState } from "react"
import styles from "./QuizAndProject.module.css"
import { FaQuestionCircle, FaRocket, FaCheck, FaTimes, FaUpload, FaLightbulb, FaTrophy } from "react-icons/fa"

export default function QuizAndProject({ quiz, rubric }) {
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [review, setReview] = useState(false)
  const [file, setFile] = useState(null)
  const [aiFeedback, setAIFeedback] = useState("")
  const [submittedQuiz, setSubmittedQuiz] = useState(false)
  const [submittedProject, setSubmittedProject] = useState(false)

  const handleQuizChange = (qid, value) => {
    setAnswers((a) => ({ ...a, [qid]: value }))
  }

  const handleQuizSubmit = (e) => {
    e.preventDefault()
    setSubmittedQuiz(true)
    // Dummy scoring logic
    let s = 0
    questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.answer) s++
    })
    setScore(s)
    setReview(true)
  }

  const handleFileChange = (e) => setFile(e.target.files[0])

  const handleProjectSubmit = (e) => {
    e.preventDefault()
    setSubmittedProject(true)
    // Simulate AI feedback
    const feedbacks = [
      "Excellent work! Your project demonstrates a deep understanding of the concepts and exceeds expectations.",
      "Great job! Your project meets all rubric criteria with creative implementation.",
      "Well done! Your solution shows good problem-solving skills and attention to detail.",
      "Outstanding! Your project showcases innovative thinking and technical proficiency.",
    ]
    setAIFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)])
  }

  // Defensive: ensure quiz.questions is always an array
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : []
  const safeRubric = Array.isArray(rubric) ? rubric : []

  const getScoreClass = () => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 80) return styles.excellent
    if (percentage >= 60) return styles.good
    return styles.needsWork
  }

  const getScoreEmoji = () => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 90) return "🎉"
    if (percentage >= 80) return "🌟"
    if (percentage >= 70) return "👍"
    if (percentage >= 60) return "📚"
    return "💪"
  }

  return (
    <div className={styles.quizProject}>
      {/* Enhanced Quiz Card */}
      <div className={styles.quizCard}>
        <h3>
          <FaQuestionCircle />
          Knowledge Quiz
        </h3>

        {questions.length === 0 ? (
          <div className={styles.emptyState}>📝 No quiz questions available for this lesson</div>
        ) : (
          <form onSubmit={handleQuizSubmit}>
            {questions.map((q, index) => (
              <div key={q.id} className={styles.question}>
                <div className={styles.questionNumber}>{index + 1}</div>
                <div className={styles.questionText}>{q.text}</div>
                {q.type === "mcq" ? (
                  <div className={styles.questionOptions}>
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt
                      const isCorrect = review && opt === q.answer
                      const isWrong = review && isSelected && opt !== q.answer

                      let optionClass = styles.optionLabel
                      if (isCorrect) optionClass += ` ${styles.correct}`
                      else if (isWrong) optionClass += ` ${styles.wrong}`
                      else if (isSelected) optionClass += ` ${styles.selected}`

                      return (
                        <label key={opt} className={optionClass}>
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleQuizChange(q.id, opt)}
                            disabled={submittedQuiz}
                          />
                          <span>{opt}</span>
                          {review && isCorrect && <FaCheck />}
                          {review && isWrong && <FaTimes />}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={styles.textInput}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleQuizChange(q.id, e.target.value)}
                    disabled={submittedQuiz}
                    placeholder="Enter your answer..."
                  />
                )}
              </div>
            ))}
            <button type="submit" className={styles.submitButton} disabled={submittedQuiz}>
              {submittedQuiz ? (
                <>
                  <FaCheck />
                  Quiz Submitted
                </>
              ) : (
                <>
                  <FaQuestionCircle />
                  Submit Quiz
                </>
              )}
            </button>
          </form>
        )}

        {review && (
          <div className={`${styles.score} ${getScoreClass()} ${styles.fadeIn}`}>
            <span className={styles.scoreEmoji}>{getScoreEmoji()}</span>
            <div>
              Score: {score} / {questions.length}
            </div>
            <div className={styles.scorePercentage}>{((score / questions.length) * 100).toFixed(0)}% Correct</div>
          </div>
        )}
      </div>

      {/* Enhanced Project Card */}
      <div className={styles.projectCard}>
        <h3>
          <FaRocket />
          Project Submission
        </h3>

        <form onSubmit={handleProjectSubmit}>
          {/* Enhanced File Upload */}
          <div className={styles.fileUpload}>
            <input type="file" onChange={handleFileChange} disabled={submittedProject} />
            <FaUpload className={styles.uploadIcon} />
            <div className={styles.uploadText}>{file ? file.name : "Upload Your Project"}</div>
            <div className={styles.uploadSubtext}>
              {file ? "File selected - ready to submit!" : "Click to browse or drag & drop your files"}
            </div>
          </div>

          {/* Enhanced Rubric */}
          {safeRubric.length > 0 && (
            <div className={styles.rubric}>
              <h4>
                <FaLightbulb />
                Grading Rubric
              </h4>
              <ul>
                {safeRubric.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.submitButton} ${styles.projectSubmitButton}`}
            disabled={submittedProject || !file}
          >
            {submittedProject ? (
              <>
                <FaCheck />
                Project Submitted
              </>
            ) : (
              <>
                <FaRocket />
                Submit Project
              </>
            )}
          </button>
        </form>

        {/* Enhanced AI Feedback */}
        {aiFeedback && (
          <div className={`${styles.aiFeedback} ${styles.fadeIn}`}>
            <h4>
              <FaTrophy />
              AI Feedback
            </h4>
            <div className={styles.feedbackContent}>{aiFeedback}</div>
          </div>
        )}
      </div>
    </div>
  )
}

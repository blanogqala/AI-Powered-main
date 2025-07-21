"use client"

import { useState } from "react"
import styles from "./TopicTimelineForm.module.css"

const timelines = [3, 6, 9, 12]
const levels = ["Beginner", "Intermediate", "Advanced"]

export default function TopicTimelineForm({ onGenerate, loading }) {
  const [topic, setTopic] = useState("")
  const [timeline, setTimeline] = useState(3)
  const [level, setLevel] = useState("Beginner")
  const [specializations, setSpecializations] = useState("")

  return (
    <form
      className={styles.glassCard}
      onSubmit={(e) => {
        e.preventDefault()
        onGenerate({ topic, timeline, level, specializations })
      }}
    >
      <h2>🚀 Start Your Learning Journey</h2>

      <input
        className={styles.input}
        type="text"
        placeholder="What would you like to learn? (e.g., React, Python, Data Science)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        required
        aria-label="Topic or Course"
      />

      <input
        className={styles.input}
        type="text"
        placeholder="Any specific areas of focus? (optional)"
        value={specializations}
        onChange={(e) => setSpecializations(e.target.value)}
        aria-label="Specializations"
      />

      <div className={styles.exampleText}>💡 Example: "Machine Learning, Neural Networks, Computer Vision"</div>

      <div>
        <h3
          style={{
            margin: "1rem 0 0.8rem 0",
            fontSize: "1.1rem",
            color: "#666",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          ⏱️ Choose Your Timeline
        </h3>
        <div className={styles.timelineGroup}>
          {timelines.map((t) => (
            <button
              type="button"
              key={t}
              className={`${styles.timelineBtn} ${timeline === t ? styles.selected : ""}`}
              onClick={() => setTimeline(t)}
            >
              {t} Month{t > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3
          style={{
            margin: "1.5rem 0 1rem 0",
            fontSize: "1.1rem",
            color: "#666",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          📊 Select Your Level
        </h3>
        <div className={styles.levelGroup}>
          {levels.map((l) => (
            <label key={l} className={styles.levelLabel}>
              <input type="radio" name="level" value={l} checked={level === l} onChange={() => setLevel(l)} />
              {l}
            </label>
          ))}
        </div>
      </div>

      <button className={styles.generateBtn} type="submit" disabled={loading}>
        {loading ? "✨ Generating Your Path..." : "🎯 Generate Learning Path"}
      </button>
    </form>
  )
}

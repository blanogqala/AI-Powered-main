import React, { useState } from "react";
import styles from "./TopicTimelineForm.module.css";

const timelines = [3, 6, 9, 12];
const levels = ["Beginner", "Intermediate", "Advanced"];

export default function TopicTimelineForm({ onGenerate, loading }) {
  const [topic, setTopic] = useState("");
  const [timeline, setTimeline] = useState(3);
  const [level, setLevel] = useState("Beginner");
  const [specializations, setSpecializations] = useState("");

  return (
    <form
      className={styles.glassCard}
      onSubmit={e => {
        e.preventDefault();
        onGenerate({ topic, timeline, level, specializations });
      }}
    >
      <h2>Start Your Learning Journey</h2>
      <input
        className={styles.input}
        type="text"
        placeholder="Topic or Course"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        required
        aria-label="Topic or Course"
      />
      <input
        className={styles.input}
        type="text"
        placeholder="Specializations (optional, comma-separated)"
        value={specializations}
        onChange={e => setSpecializations(e.target.value)}
        aria-label="Specializations"
        style={{ marginTop: 8 }}
      />
      <div style={{ color: '#888', fontSize: 13, marginBottom: 8, marginTop: -4 }}>
        Example: "AI, Data Science, Web Development" (optional)
      </div>
      <div className={styles.timelineGroup}>
        {timelines.map(t => (
          <button
            type="button"
            key={t}
            className={`${styles.timelineBtn} ${timeline === t ? styles.selected : ""}`}
            onClick={() => setTimeline(t)}
          >
            {t} Months
          </button>
        ))}
      </div>
      <div className={styles.levelGroup}>
        {levels.map(l => (
          <label key={l} className={styles.levelLabel}>
            <input
              type="radio"
              name="level"
              value={l}
              checked={level === l}
              onChange={() => setLevel(l)}
            />
            {l}
          </label>
        ))}
      </div>
      <button className={styles.generateBtn} type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
    </form>
  );
}

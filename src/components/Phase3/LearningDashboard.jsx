import React from "react";
import styles from "./LearningDashboard.module.css";

export default function LearningDashboard({
  progress = 0,
  currentModule = "Module 1: Introduction",
  currentLesson = "Lesson 1: Getting Started",
  achievements = [],
  onContinue
}) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.progressCard}>
        <div className={styles.progressLabel}>
          Progress: {progress}%
        </div>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className={styles.currentCard}>
        <div>
          <h3>{currentModule}</h3>
          <p>{currentLesson}</p>
        </div>
        <button className={styles.continueBtn} onClick={onContinue}>
          Continue Learning
        </button>
      </div>
      <div className={styles.achievementsCard}>
        <h4>Achievements</h4>
        <div className={styles.badges}>
          {achievements.length === 0 ? (
            <span className={styles.noBadge}>No badges yet</span>
          ) : (
            achievements.map((badge, i) => (
              <span key={i} className={styles.badge}>{badge}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

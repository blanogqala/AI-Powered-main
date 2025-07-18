/**
 * POST  /api/generateLearningPath
 * Body: { topic: string, timeline: number, level: "Beginner" | "Intermediate" | "Advanced" }
 * Returns: learningPaths[] (saved in Firestore under /courses)
 */

const express = require("express");
const { generateCurriculum } = require("../agents/curriculumAgent");
const { saveLearningPaths } = require("../firebase/firestoreService");

const router = express.Router();

router.post("/", async (req, res) => {
  const { topic, timeline, level } = req.body;

  if (!topic || !timeline || !level) {
    return res.status(400).json({ error: "topic, timeline, and level are required" });
  }

  try {
    // 1. Call LangChain curriculum agent
    const learningPaths = await generateCurriculum(topic, timeline, level);

    // 2. Save all generated paths to Firestore
    const savedIds = await saveLearningPaths({ topic, timeline, level, learningPaths });

    // 3. Respond to frontend with both the paths and their Firestore IDs
    return res.status(200).json({ learningPaths, savedIds });
  } catch (err) {
    console.error("generateLearningPath error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

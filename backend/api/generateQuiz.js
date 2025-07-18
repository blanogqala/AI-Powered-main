const express = require('express');
const { generateQuiz } = require('../agents/assessmentAgent');

const router = express.Router();

router.post('/', async (req, res) => {
  const { lessonTitle, lessonBody } = req.body;
  if (!lessonTitle && !lessonBody) {
    return res.status(400).json({ error: 'lessonTitle or lessonBody is required' });
  }
  try {
    const quiz = await generateQuiz({ lessonTitle, lessonBody });
    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
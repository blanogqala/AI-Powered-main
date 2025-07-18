const express = require('express');
const { markLessonAsComplete } = require('../firebase/firestoreService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, courseId, lessonId } = req.body;
  if (!userId || !courseId || !lessonId) {
    return res.status(400).json({ error: 'userId, courseId, and lessonId are required' });
  }
  try {
    await markLessonAsComplete({ userId, courseId, lessonId });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
// backend/api/enroll-learning-path.js

const express = require('express');
const router = express.Router();
const { saveCurriculum } = require('../firebase/firestoreService');

router.post('/', async (req, res) => {
  const { userId, learningPath } = req.body;
  if (!userId || !learningPath) {
    return res.status(400).json({ error: 'Missing userId or learningPath' });
  }
  try {
    await saveCurriculum(userId, learningPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to enroll' });
  }
});

module.exports = router;

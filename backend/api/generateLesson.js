const express = require('express');
const { generateLessonContent } = require('../agents/contentGenerator');
const { generateQuiz, generateProject } = require('../agents/assessmentAgent');
const firestore = require('../firebase/firestoreService');
const admin = require('firebase-admin');

const router = express.Router();

// Helper to sanitize Firestore document IDs
function sanitizeId(str) {
  return String(str).replace(/[.#$/\[\]]/g, '-');
}

router.post('/', async (req, res) => {
  console.log('generate-lesson request body:', req.body); // Add this line
  const { userId, courseTitle, moduleTitle, subtopic, level, timeline } = req.body;
  if (!userId || !courseTitle || !moduleTitle || !subtopic || !level || !timeline) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const lessonDocPath = `users/${userId}/courses/${sanitizeId(courseTitle)}/modules/${sanitizeId(moduleTitle)}/lessons/${sanitizeId(subtopic)}`;
    const lessonDocRef = admin.firestore().doc(lessonDocPath);
    const quizDocPath = `${lessonDocPath}/quiz/quizDoc`;
    const quizDocRef = admin.firestore().doc(quizDocPath);
    const projectDocPath = `${lessonDocPath}/project/projectDoc`;
    const projectDocRef = admin.firestore().doc(projectDocPath);

    // Extra logging for debugging
    console.log('[DEBUG] Firestore lesson path:', lessonDocPath);
    console.log('[DEBUG] Firestore quiz path:', quizDocPath);
    console.log('[DEBUG] Firestore project path:', projectDocPath);
    console.log('[DEBUG] Payload:', { userId, courseTitle, moduleTitle, subtopic, level, timeline });

    // Try to fetch existing lesson, quiz, and project
    const [lessonSnap, quizSnap, projectSnap] = await Promise.all([
      lessonDocRef.get(),
      quizDocRef.get(),
      projectDocRef.get()
    ]);

    let lesson = lessonSnap.exists ? lessonSnap.data() : null;
    let quiz = quizSnap.exists ? quizSnap.data().quiz : null;
    let project = projectSnap.exists ? projectSnap.data().project : null;

    // If any are missing, generate and store them
    if (!lesson) {
      lesson = await generateLessonContent({ courseTitle, moduleTitle, subtopic, level, timeline });
      await lessonDocRef.set(lesson);
    }
    if (!quiz) {
      quiz = await generateQuiz({ lessonTitle: subtopic, lessonBody: lesson.body, courseTitle, moduleTitle });
      await quizDocRef.set({ quiz });
    }
    if (!project) {
      project = await generateProject({ lessonTitle: subtopic, lessonBody: lesson.body, courseTitle, moduleTitle });
      await projectDocRef.set({ project });
    }

    res.status(200).json({ lesson, quiz, project });
  } catch (error) {
    console.error('generate-lesson error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

module.exports = router;

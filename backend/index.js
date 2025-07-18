// Polyfill ReadableStream for langchain compatibility in Node.js
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = require("stream/web").ReadableStream;
}

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { managerAgent } = require('./orchestrator/managerAgent');
const { saveCurriculum, getCurriculum, deleteCurriculum, saveLessonContent, saveUserQuiz } = require('./firebase/firestoreService');
const { generateContent } = require('./agents/contentGenerator');
const { generateAssessment } = require('./agents/assessmentAgent');
const { generateResources } = require('./agents/resourceAgent');
const generateLessonRouter = require('./api/generateLesson');
const generateQuizRouter = require('./api/generateQuiz');
const saveProgressRouter = require('./api/saveProgress');
const generateLearningPath = require("./api/generateLearningPath");
const { generateLessonContent } = require('./agents/contentGenerator');
const { generateQuiz } = require('./agents/assessmentAgent');
const { gradeProjectSubmission } = require('./agents/assessmentAgent');
const { saveUserProjectGrade } = require('./firebase/firestoreService');
const { gradeShortAnswer } = require('./agents/assessmentAgent');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/generateLearningPath", generateLearningPath);

app.post('/api/generate-curriculum', async (req, res) => {
  const { topic, timeline, level, userId } = req.body;
  if (!topic || !timeline || !level || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const result = await managerAgent({ topic, timeline, level, userId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-learning-path', async (req, res) => {
  const { topic, timeline, level, userId } = req.body;
  if (!topic || !timeline || !level || !userId) {
    return res.status(400).json({ error: 'Missing required fields: topic, timeline, level, userId.' });
  }
  try {
    const result = await managerAgent({ topic, timeline, level, userId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate learning path.' });
  }
});

app.post('/api/enroll-learning-path', async (req, res) => {
  const { userId, learningPath } = req.body;
  if (!userId || !learningPath) {
    return res.status(400).json({ error: 'Missing required fields: userId, learningPath.' });
  }
  try {
    await saveCurriculum(userId, learningPath);
    // Generate and store lessons and quizzes for each module/week/lesson
    const courseTitle = learningPath.title;
    const modules = learningPath.curriculum || {};
    const level = learningPath.level;
    const timeline = learningPath.timeline;
    for (const [weekKey, moduleObj] of Object.entries(modules)) {
      const moduleTitle = moduleObj.header || weekKey;
      const lessons = Array.isArray(moduleObj.lessons) ? moduleObj.lessons : [];
      for (const subtopic of lessons) {
        // Check if lesson already exists for this user
        const lessonDocPath = `users/${userId}/courses/${courseTitle}/modules/${moduleTitle}/lessons/${subtopic}`;
        const lessonDocRef = admin.firestore().doc(lessonDocPath);
        const lessonSnap = await lessonDocRef.get();
        if (!lessonSnap.exists) {
          // Generate lesson content
          const lesson = await generateLessonContent({ courseTitle, moduleTitle, subtopic, level, timeline });
          await saveLessonContent({ courseTitle, moduleTitle, subtopic, lesson, userId });
          // Generate quiz for this lesson
          const quiz = await generateQuiz({ lessonTitle: subtopic });
          await saveUserQuiz({ userId, courseTitle, moduleTitle, subtopic, quiz });
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to enroll in learning path.' });
  }
});

app.get('/api/my-courses', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing required field: userId.' });
  }
  try {
    const enrollments = await getCurriculum(userId);
    res.json({ enrollments });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch courses.' });
  }
});

// New endpoint: Generate content for a selected path
app.post('/api/generate-content', async (req, res) => {
  const { topic, timeline, level, userId } = req.body;
  if (!topic || !timeline || !level || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const content = await generateContent(topic, timeline, level);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate content.' });
  }
});

// New endpoint: Generate assessment for a selected path
app.post('/api/generate-assessment', async (req, res) => {
  const { topic, timeline, level, userId } = req.body;
  if (!topic || !timeline || !level || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const assessment = await generateAssessment(topic, timeline, level);
    res.json({ assessment });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate assessment.' });
  }
});

// New endpoint: Generate resources for a selected path
app.post('/api/generate-resources', async (req, res) => {
  const { topic, timeline, level, userId } = req.body;
  if (!topic || !timeline || !level || !userId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const resources = await generateResources(topic, timeline, level);
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate resources.' });
  }
});

// New endpoint: Submit project for AI grading
app.post('/api/submit-project', async (req, res) => {
  const { userId, courseTitle, moduleTitle, subtopic, projectSubmission, rubric } = req.body;
  if (!userId || !courseTitle || !moduleTitle || !subtopic || !projectSubmission) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    // Grade the project with AI
    const grading = await gradeProjectSubmission({
      lessonTitle: subtopic,
      projectSubmission,
      instructions: rubric || [],
      rubric: rubric || []
    });
    // Save grade and feedback in Firestore
    await saveUserProjectGrade({
      userId,
      courseTitle,
      moduleTitle,
      subtopic,
      grade: grading.grade,
      feedback: grading.feedback
    });
    res.json({ grade: grading.grade, feedback: grading.feedback });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to grade project.' });
  }
});

// New endpoint: AI grade a short answer quiz response
app.post('/api/grade-short-answer', async (req, res) => {
  const { question, correct, userAnswer } = req.body;
  if (!question || !correct || !userAnswer) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const result = await gradeShortAnswer({ question, correct, userAnswer });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to grade short answer.' });
  }
});

// New endpoint: Mark course as completed (for badges)
app.post('/api/complete-course', async (req, res) => {
  const { userId, course } = req.body;
  if (!userId || !course || !course.title) {
    return res.status(400).json({ error: 'Missing required fields: userId, course.title.' });
  }
  try {
    // Update the user's curriculum document to set completedAt for the course
    const admin = require('firebase-admin');
    const docRef = admin.firestore().collection('curriculums').doc(userId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'User curriculum not found.' });
    }
    let data = docSnap.data();
    let updated = false;
    data.enrollments = (data.enrollments || []).map(lp => {
      if (lp.title === course.title) {
        updated = true;
        return { ...lp, completedAt: course.completedAt || Date.now() };
      }
      return lp;
    });
    if (!updated) {
      // If not found, optionally add as new completed course
      data.enrollments.push({ ...course, completedAt: course.completedAt || Date.now() });
    }
    await docRef.set(data);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/complete-course:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to mark course as completed.' });
  }
});

app.use('/api/generate-lesson', generateLessonRouter);
app.use('/api/generate-quiz', generateQuizRouter);
app.use('/api/save-progress', saveProgressRouter);

app.delete('/api/delete-enrollment', async (req, res) => {
  const { userId, courseTitle } = req.body;
  if (!userId || !courseTitle) {
    return res.status(400).json({ error: 'Missing required fields: userId, courseTitle.' });
  }
  try {
    const result = await deleteCurriculum(userId, courseTitle);
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: result.message || 'Course not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete enrollment.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

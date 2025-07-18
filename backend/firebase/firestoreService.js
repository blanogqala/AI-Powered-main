const admin = require('firebase-admin');
const serviceAccount = require('./learning-platform-3364f-ee05c72a092a.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}
const db = admin.firestore();

async function saveCurriculum(userId, learningPath) {
  try {
    const docRef = db.collection('curriculums').doc(userId);
    const docSnap = await docRef.get();
    let data = { enrollments: [] };
    if (docSnap.exists) {
      data = docSnap.data();
    }
    // Prevent duplicate enrollments by title
    const exists = data.enrollments.some(lp => lp.title === learningPath.title);
    if (!exists) {
      data.enrollments.push(learningPath);
      await docRef.set(data);
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving curriculum:', error.message);
    throw error;
  }
}

async function getCurriculum(userId) {
  try {
    const docSnap = await db.collection('curriculums').doc(userId).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return data.enrollments || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error retrieving curriculum:', error.message);
    throw error;
  }
}

async function deleteCurriculum(userId, courseTitle) {
  try {
    const docRef = db.collection('curriculums').doc(userId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return { success: false, message: 'No enrollments found.' };
    let data = docSnap.data();
    const before = data.enrollments.length;
    data.enrollments = data.enrollments.filter(lp => lp.title !== courseTitle);
    if (data.enrollments.length === before) {
      return { success: false, message: 'Course not found.' };
    }
    await docRef.set(data);
    return { success: true };
  } catch (error) {
    console.error('Error deleting curriculum:', error.message);
    throw error;
  }
}

// New: Save lesson content in Firestore
async function saveLessonContent({ courseTitle, moduleTitle, subtopic, lesson }) {
  try {
    const docPath = `courses/${courseTitle}/modules/${moduleTitle}/lessons/${subtopic}`;
    const docRef = db.doc(docPath);
    await docRef.set(lesson);
    return { success: true };
  } catch (error) {
    console.error('Error saving lesson content:', error.message);
    throw error;
  }
}

// New: Mark lesson as complete for a user
async function markLessonAsComplete({ userId, courseId, lessonId }) {
  try {
    const userProgressRef = db.collection('progress').doc(userId);
    await userProgressRef.set({
      [courseId]: admin.firestore.FieldValue.arrayUnion(lessonId)
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking lesson as complete:', error.message);
    throw error;
  }
}

// Save multiple learning paths to Firestore (for all users or as templates)
async function saveLearningPaths({ topic, timeline, level, learningPaths }) {
  try {
    const batch = db.batch();
    const courseRefs = [];
    for (const path of learningPaths) {
      const docRef = db.collection('courses').doc(); // auto-generated ID
      batch.set(docRef, {
        ...path,
        topic,
        timeline,
        level,
        created: Date.now()
      });
      courseRefs.push(docRef.id);
    }
    await batch.commit();
    return courseRefs;
  } catch (error) {
    console.error('Error saving learning paths:', error.message);
    throw error;
  }
}

// Save quiz for a user, course, module, and lesson
async function saveUserQuiz({ userId, courseTitle, moduleTitle, subtopic, quiz }) {
  try {
    const docPath = `users/${userId}/courses/${courseTitle}/modules/${moduleTitle}/lessons/${subtopic}/quiz/quizDoc`;
    const docRef = db.doc(docPath);
    await docRef.set({ quiz });
    return { success: true };
  } catch (error) {
    console.error('Error saving user quiz:', error.message);
    throw error;
  }
}

// Save project grade for a user, course, module, and lesson
async function saveUserProjectGrade({ userId, courseTitle, moduleTitle, subtopic, grade, feedback }) {
  try {
    const docPath = `users/${userId}/courses/${courseTitle}/modules/${moduleTitle}/lessons/${subtopic}/project/gradeDoc`;
    const docRef = db.doc(docPath);
    await docRef.set({ grade, feedback });
    return { success: true };
  } catch (error) {
    console.error('Error saving user project grade:', error.message);
    throw error;
  }
}

module.exports = {
  saveCurriculum,
  getCurriculum,
  deleteCurriculum,
  saveLessonContent,
  markLessonAsComplete,
  saveLearningPaths
};
module.exports.saveUserQuiz = saveUserQuiz;
module.exports.saveUserProjectGrade = saveUserProjectGrade;

const { generateJSON, text, requireShape } = require('../services/aiClient');
async function generateLessonContent(params) {
  const lesson = await generateJSON('You write accurate educational lessons focused on the requested topic.', `Write a lesson for ${JSON.stringify(params)}. Return {"title":"...","objectives":["..."],"body":"detailed Markdown explanations with worked examples","summary":"..."}. Include 3–5 objectives. Do not invent video links.`);
  requireShape(text(lesson.title) && Array.isArray(lesson.objectives) && lesson.objectives.length >= 3 && lesson.objectives.every(text) && text(lesson.body) && text(lesson.summary), 'lesson');
  return { title: lesson.title, objectives: lesson.objectives, body: lesson.body, summary: lesson.summary };
}
async function generateContent(topic, timeline, level) {
  return generateLessonContent({ courseTitle: topic, moduleTitle: 'Introduction', subtopic: topic, timeline, level });
}
module.exports = { generateLessonContent, generateContent };

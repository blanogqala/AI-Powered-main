const { generateJSON, AIError, text, requireShape } = require('../services/aiClient');
async function generateCurriculum(topic, timeline, level) {
  const months = Number(timeline);
  if (!text(topic) || topic.length > 200 || !Number.isInteger(months) || months < 1 || months > 12 || !['beginner','intermediate','advanced'].includes(String(level).toLowerCase())) {
    throw new AIError('Enter a topic (up to 200 characters), a timeline of 1–12 months and a valid level.', 400);
  }
  // Three concise paths fit a single quota-conscious call, including a 48-week timeline.
  const data = await generateJSON('You are an expert curriculum designer.', `Create exactly 3 distinct learning paths. Input: ${JSON.stringify({topic,timeline:months,level})}.
Each path must have title, description and curriculum. curriculum must contain exactly ${months * 4} keys: Week 1 through Week ${months * 4}. Each week has header (short module name) and lessons (exactly 2 concise, specific lesson titles; not Lesson 1/2). Keep lesson titles under 6 words and descriptions under 30 words. Return {"learningPaths":[...]} only.`, {maxTokens: months > 6 ? 10000 : 8000});
  requireShape(Array.isArray(data.learningPaths) && data.learningPaths.length === 3, 'learning path list');
  requireShape(new Set(data.learningPaths.map(p=>p.title)).size === 3, 'distinct path list');
  return data.learningPaths.map(path => {
    requireShape(text(path.title) && text(path.description) && path.curriculum && typeof path.curriculum === 'object', 'learning path');
    requireShape(Object.keys(path.curriculum).length === months * 4, 'curriculum length');
    const curriculum = {};
    for (let week = 1; week <= months * 4; week++) {
      const item = path.curriculum[`Week ${week}`];
      requireShape(item && text(item.header) && Array.isArray(item.lessons) && item.lessons.length >= 2 && item.lessons.every(text), 'curriculum week');
      curriculum[`Week ${week}`] = { header: item.header, lessons: item.lessons };
    }
    return { title: path.title, description: path.description, curriculum, topic, timeline: months, level };
  });
}
module.exports = { generateCurriculum };

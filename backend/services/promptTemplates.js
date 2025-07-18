const lessonPromptTemplate = `
You are an AI course writer. Generate a detailed lesson ONLY about "{subtopic}" for the course/module "{courseTitle}", for a "{level}" learner. The lesson must be focused on this specific topic, and must NOT include content about unrelated fields (e.g., do NOT include AI or reinforcement learning unless the subtopic is about that). The lesson should include:
- A clear introduction
- 3-5 learning objectives
- Detailed explanations with examples
- A summary of key takeaways
- (Optional) Markdown formatting for code, lists, and tips
- (Optional) If a relevant video is available, include a videoUrl field with a YouTube or educational video link.
Return ONLY a valid JSON object with keys: title, objectives (array), body (markdown string), summary, and (optional) videoUrl. Do not include any explanation or text outside the JSON object.
`;

const quizPromptTemplate = `
Generate a 5-question multiple choice quiz based on the lesson content for "{lessonTitle}". Each question should have 4 options and indicate the correct answer. Return ONLY a valid JSON array of objects with keys: id, question, options (array), correct (string), and explanation. Do not include any explanation or text outside the JSON array.
`;

const projectPromptTemplate = `
Generate an advanced, practical project for the lesson "{lessonTitle}". The project should require the learner to apply what was learned in this lesson. Include:
- A project title
- A detailed project description
- Step-by-step instructions
- (Optional) Rubric for evaluation
Return ONLY a valid JSON object with keys: title, description, instructions (array), and (optional) rubric (array). Do not include any explanation or text outside the JSON object.
`;

module.exports = { lessonPromptTemplate, quizPromptTemplate, projectPromptTemplate };

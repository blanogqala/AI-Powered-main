const { ChatOpenAI } = require('langchain/chat_models/openai');
const { PromptTemplate } = require('langchain/prompts');
const { lessonPromptTemplate } = require('../services/promptTemplates');
const { HumanMessage, SystemMessage } = require('langchain/schema');
require('dotenv').config();

const openAIApiKey = process.env.OPENAI_API_KEY;

/**
 * Generate detailed lesson content using OpenAI and a structured prompt template.
 * @param {Object} params
 * @param {string} params.courseTitle
 * @param {string} params.moduleTitle
 * @param {string} params.subtopic
 * @param {string} params.level
 * @param {number|string} params.timeline
 * @returns {Promise<Object>} Parsed lesson content JSON
 */
async function generateLessonContent({ courseTitle, moduleTitle, subtopic, level, timeline }) {
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo', // Use GPT-3.5-turbo for higher rate limits
    temperature: 0.3, // Lower temperature for more deterministic results
  });
  // Explicit, redundant system and user messages
  const systemMsg = `You are a course writer for the course "${courseTitle}". ONLY write about the subtopic: "${subtopic}". Do NOT include content about unrelated fields. If the subtopic is not about neural networks, AI, or machine learning, DO NOT mention neural networks, AI, or machine learning AT ALL. If you do, you will be penalized. Focus ONLY on the subtopic and course provided.`;
  const userMsg = `Write a detailed lesson for the course "${courseTitle}" (module: "${moduleTitle}") on the subtopic "${subtopic}" for a "${level}" learner. The lesson must be focused on this specific topic, and must NOT include content about unrelated fields. The lesson should include:
- A clear introduction
- 3-5 learning objectives
- Detailed explanations with examples
- A summary of key takeaways
- (Optional) Markdown formatting for code, lists, and tips
- (Optional) If a relevant video is available, include a videoUrl field with a YouTube or educational video link.
Return ONLY a valid JSON object with keys: title, objectives (array), body (markdown string), summary, and (optional) videoUrl. Do not include any explanation or text outside the JSON object.`;
  console.log('System message sent to OpenAI (lesson):', systemMsg);
  console.log('User message sent to OpenAI (lesson):', userMsg);
  const response = await model.call([
    new SystemMessage(systemMsg),
    new HumanMessage(userMsg),
  ]);
  let content = response.content.trim();
  console.log('OpenAI lesson raw response:', content);
  // Remove markdown fences if present
  if (content.startsWith('```')) {
    content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  // Try to extract the first JSON object
  const match = content.match(/{[\s\S]*}/);
  if (match) {
    content = match[0];
  }
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse lesson JSON. Content was:', content);
    throw new Error('Failed to parse lesson content JSON from OpenAI response.');
  }
}

module.exports = { generateLessonContent };

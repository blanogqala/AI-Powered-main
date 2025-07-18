const { ChatOpenAI } = require('langchain/chat_models/openai');
const { PromptTemplate } = require('langchain/prompts');
const { HumanMessage, SystemMessage } = require('langchain/schema');
require('dotenv').config();

const openAIApiKey = process.env.OPENAI_API_KEY;

const chat = new ChatOpenAI({
  openAIApiKey,
  temperature: 0.3,
  modelName: 'gpt-3.5-turbo',
});

const assessmentPrompt = new PromptTemplate({
  template: `You are an expert curriculum assessment designer. For the topic: {topic}, for a {level} learner, over {timeline} months, generate a curriculum-aligned assessment plan.\n\nSTRICT RULES:\n- For each week (Week 1, Week 2, ...), provide:\n  - A quiz: an array of 3-5 questions (each with id, question, options (for MCQ), correct, explanation, and type (\"mcq\" or \"short\")).\n  - A project: an object with title, description, instructions (array), and (optional) rubric (array).\n- Return ONLY a valid JSON object with week numbers as keys (e.g., \"Week 1\") and values as objects with keys: quiz (array), project (object).\n- Do NOT include any explanation or text outside the JSON object.\n\nOUTPUT FORMAT EXAMPLE:\n{{\n  \"Week 1\": {{\n    \"quiz\": [ ... ],\n    \"project\": {{ ... }}\n  }},\n  \"Week 2\": {{ ... }}\n}}\n\nIf you do not follow this format, your output will be discarded.`,
  inputVariables: ['topic', 'timeline', 'level'],
});

async function generateAssessment(topic, timeline, level) {
  let lastContent = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const systemMsg = `You are an expert assessment generator. STRICTLY follow the output format. Attempt ${attempt} of 3.`;
    const prompt = await assessmentPrompt.format({ topic, timeline, level });
    const response = await chat.call([
      new SystemMessage(systemMsg),
      new HumanMessage(prompt),
    ]);
    let content = response.content.trim();
    if (content.startsWith('{') === false && content.startsWith('```')) {
      content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    }
    lastContent = content;
    try {
      const assessment = JSON.parse(content);
      // Validate structure: must be object with week keys, each with quiz (array) and project (object)
      if (
        assessment &&
        typeof assessment === 'object' &&
        Object.keys(assessment).length > 0 &&
        Object.values(assessment).every(
          week => week && Array.isArray(week.quiz) && typeof week.project === 'object'
        )
      ) {
        return assessment;
      }
    } catch (err) {
      // continue to retry
    }
  }
  console.error('Assessment generation failed or was malformed after 3 attempts. Last content:', lastContent);
  throw new Error('Failed to generate a valid assessment plan.');
}

const extractKeywords = (text) => {
  // Simple keyword extraction: split on non-word, filter stopwords, dedupe
  const stopwords = new Set(['the','and','for','with','that','are','was','were','this','from','have','has','had','not','but','all','can','will','you','your','about','into','only','use','using','used','to','of','in','on','at','by','as','an','be','is','it','or','if','do','does','a','so','we','our','their','they','them','he','she','his','her','which','should','must','may','would','could','also','more','than','such','when','then','these','those','each','any','some','no','yes','one','two','three','four','five','six','seven','eight','nine','ten']);
  return Array.from(new Set(
    text.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopwords.has(w))
  ));
};

// The off-topic filter is now less strict: allows up to 5 new words or up to 40% of keywords not in the lesson, to reduce false positives and allow more flexible quiz/project generation.
// The quiz and project prompts are now less harsh, allowing the model to add directly related context if needed.
const containsOffTopic = (aiText, lessonText) => {
  // If AI mentions words not in lesson, flag as off-topic
  const lessonKeywords = extractKeywords(lessonText);
  const aiKeywords = extractKeywords(JSON.stringify(aiText));
  // Allow if at least 60% of AI keywords are in lesson keywords, and allow up to 5 new words
  const offTopic = aiKeywords.filter(k => !lessonKeywords.includes(k));
  return offTopic.length > Math.max(5, aiKeywords.length * 0.4); // allow more new words and higher ratio
};

// Updated quiz prompt with explicit structure and example
const quizPromptTemplate = new PromptTemplate({
  inputVariables: ['lessonTitle', 'lessonBody'],
  template: `Generate a quiz for the lesson titled: "{lessonTitle}".\n- Base all questions on the lesson content below.\n- Each question must be a JSON object with the following fields:\n  - id: a unique string or number\n  - question: the question text\n  - options: an array of answer choices (for MCQ)\n  - correct: the correct answer (must match one of the options)\n  - explanation: a brief explanation of the correct answer\n  - type: \"mcq\" or \"short\"\nReturn ONLY a valid JSON array of 5-10 such questions.\n\nLesson Title: {lessonTitle}\nLesson Content:\n{lessonBody}\n\nExample:\n[\n  {{\n    "id": 1,\n    "question": "What does CSS stand for?",\n    "options": ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],\n    "correct": "Cascading Style Sheets",\n    "explanation": "CSS stands for Cascading Style Sheets.",\n    "type": "mcq"\n  }}\n]\n`
});

// Updated project prompt with explicit structure and example
const projectPromptTemplate = new PromptTemplate({
  inputVariables: ['lessonTitle', 'lessonBody'],
  template: `Generate a practical project for the lesson titled: "{lessonTitle}".\n- Base the project on the lesson content below.\n- The project must be a JSON object with the following fields:\n  - title: the project title\n  - description: a short description\n  - instructions: an array of step-by-step instructions\n  - rubric: an array of grading criteria (optional)\nReturn ONLY a valid JSON object for the project.\n\nLesson Title: {lessonTitle}\nLesson Content:\n{lessonBody}\n\nExample:\n{{\n  "title": "Styling a Personal Web Page with CSS",\n  "description": "Create a simple personal web page using HTML and enhance it with CSS to demonstrate the separation of content and style.",\n  "instructions": [\n    "Create an HTML file named 'index.html'.",\n    "Set up a basic HTML structure.",\n    "Add a <style> section and use CSS to style the page."\n  ],\n  "rubric": [\n    "Page uses at least three different CSS properties.",\n    "HTML structure is valid.",\n    "CSS is well-organized and commented."\n  ]\n}}\n`
});

// New: generateQuiz using quizPromptTemplate
async function generateQuiz({ lessonTitle, lessonBody, courseTitle, moduleTitle }) {
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
  });
  let lastContent = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const systemMsg = `You are an expert educator. You will be penalized if you include any content not found in the provided lesson. STRICTLY use only the lesson content. Attempt ${attempt} of 3.`;
    const chain = quizPromptTemplate.pipe(model);
    const result = await chain.invoke({ lessonTitle, lessonBody, courseTitle, moduleTitle }, [new SystemMessage(systemMsg)]);
    let content = result.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    }
    try {
      let parsed = JSON.parse(content);
      lastContent = content;
      // Post-process: map to expected format if needed
      parsed = parsed.map((q, idx) => ({
        id: q.id || idx + 1,
        question: q.question,
        options: q.options || [],
        correct: q.correct || q.answer || '',
        explanation: q.explanation || '',
        type: q.type || (q.options ? 'mcq' : 'short')
      }));
      if (Array.isArray(parsed) && !containsOffTopic(parsed, lessonBody)) {
        return parsed;
      }
    } catch (err) {
      // continue to retry
    }
  }
  console.error('Quiz generation failed or was off-topic after 3 attempts. Last content:', lastContent);
  return [];
}

// New: generateProject using projectPromptTemplate
async function generateProject({ lessonTitle, lessonBody, courseTitle, moduleTitle }) {
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
  });
  let lastContent = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const systemMsg = `You are an expert educator. You will be penalized if you include any content not found in the provided lesson. STRICTLY use only the lesson content. Attempt ${attempt} of 3.`;
    const chain = projectPromptTemplate.pipe(model);
    const result = await chain.invoke({ lessonTitle, lessonBody, courseTitle, moduleTitle }, [new SystemMessage(systemMsg)]);
    let content = result.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    }
    // Try to extract the first JSON object
    const match = content.match(/{[\s\S]*}/);
    if (match) {
      content = match[0];
    }
    try {
      let parsed = JSON.parse(content);
      lastContent = content;
      // Post-process: map to expected format if needed
      parsed = {
        title: parsed.title || parsed.projectTitle || '',
        description: parsed.description || parsed.projectDescription || '',
        instructions: parsed.instructions || parsed.projectInstructions || [],
        rubric: parsed.rubric || parsed.projectObjectives || []
      };
      if (typeof parsed === 'object' && parsed !== null && !containsOffTopic(parsed, lessonBody)) {
        return parsed;
      }
    } catch (err) {
      // continue to retry
    }
  }
  console.error('Project generation failed or was off-topic after 3 attempts. Last content:', lastContent);
  return {};
}

// New: gradeProjectSubmission using OpenAI
async function gradeProjectSubmission({ lessonTitle, projectSubmission, instructions, rubric }) {
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
  });
  // Compose a grading prompt
  let promptText = `You are an expert instructor. Grade the following student project submission for the lesson "${lessonTitle}".

Project Instructions:
${Array.isArray(instructions) ? instructions.join('\n') : instructions}

Rubric:
${Array.isArray(rubric) ? rubric.join('\n') : rubric}

Student Submission:
${projectSubmission}

Please:
- Review the submission against the instructions and rubric.
- Give a grade out of 100 (integer only).
- Provide concise, constructive feedback.
Return ONLY a valid JSON object with keys: grade (integer 0-100), feedback (string). Do not include any explanation or text outside the JSON object.`;

  const prompt = new PromptTemplate({
    inputVariables: [],
    template: promptText,
  });
  const chain = prompt.pipe(model);
  const result = await chain.invoke({});
  try {
    return JSON.parse(result.content);
  } catch (err) {
    throw new Error('Failed to parse grading JSON from OpenAI response.');
  }
}

// New: gradeShortAnswer using OpenAI
async function gradeShortAnswer({ question, correct, userAnswer }) {
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
  });
  const prompt = new PromptTemplate({
    inputVariables: ['question', 'correct', 'userAnswer'],
    template: `You are an expert grader. Grade the following short answer quiz response.\n\nQuestion: {question}\nCorrect Answer: {correct}\nUser's Answer: {userAnswer}\n\nIs the user's answer fully correct? Reply with a valid JSON object: { "score": 1 if correct, 0 if not, "feedback": "short feedback" }.\nDo not include any explanation or text outside the JSON object.`
  });
  const chain = prompt.pipe(model);
  const result = await chain.invoke({ question, correct, userAnswer });
  try {
    return JSON.parse(result.content);
  } catch (err) {
    throw new Error('Failed to parse short answer grading JSON from OpenAI response.');
  }
}

module.exports = { generateAssessment, generateQuiz };
module.exports.generateProject = generateProject;
module.exports.gradeProjectSubmission = gradeProjectSubmission;
module.exports.gradeShortAnswer = gradeShortAnswer;

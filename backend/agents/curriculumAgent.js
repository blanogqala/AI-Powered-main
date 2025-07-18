const { ChatOpenAI } = require("langchain/chat_models/openai");
const { PromptTemplate } = require("langchain/prompts");
const { HumanMessage, SystemMessage } = require("langchain/schema");
const dotenv = require("dotenv");
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;

// Prefer GPT‑4 if your account has access, else fall back
const chat = new ChatOpenAI({
  openAIApiKey,
  temperature: 0.6,
  modelName: process.env.OPENAI_MODEL ?? "gpt-4o-mini", // or "gpt-4o" if you have access
});

/* ---------- PROMPT TEMPLATE ---------- */
const curriculumPrompt = new PromptTemplate({
  inputVariables: ["topic", "timeline", "level"],
  template: `
You are an expert curriculum designer.

TASK:
Generate **between 3 and 5** DISTINCT learning paths for the topic **"{topic}"**,
tailored to a **{level}** learner, to be completed in **{timeline} months**.

For each learning path, the curriculum must have exactly **{timeline} × 4 weeks** (e.g., 3 months = 12 weeks). For each week, provide:
- A module header (e.g., "Module: [Module Name]")
- A list of 2-4 **specific, descriptive, and actionable lesson titles** for that week (as an array). **Lesson titles must clearly state the concept or skill to be learned, and must not be generic (e.g., use 'What is CSS?', 'Selectors and Properties', 'Responsive Design Principles', not 'Lesson 1', 'Lesson 2', etc.).**

OUTPUT FORMAT (MUST be valid JSON – do not wrap in markdown):

[
  {{
    "title": "<concise path title>",
    "description": "<1‑4 sentence overview>",
    "curriculum": {{
      "Week 1": {{
        "header": "Module: ...",
        "lessons": ["Lesson 1 title", "Lesson 2 title", ...]
      }},
      "Week 2": {{
        "header": "Module: ...",
        "lessons": ["Lesson 1 title", ...]
      }},
      ...
      "Week N": {{
        "header": "Module: ...",
        "lessons": [ ... ]
      }}
    }}
  }},
  ...
]

RULES:
1. Only return the JSON array.
2. Do NOT add any commentary or markdown fences.
3. Each learning path must have a unique focus or angle.
4. The curriculum must have exactly ({timeline} × 4) weeks, each with a module header and a list of lessons.
5. Make the module headers and lesson titles **descriptive, specific, and relevant** to the topic and level. **Lesson titles must never be generic.**
`,
});

/* ---------- MAIN EXPORT ---------- */
async function generateCurriculum(topic, timeline, level) {
  const formattedPrompt = await curriculumPrompt.format({ topic, timeline, level });

  const response = await chat.call([
    new SystemMessage("You create structured curricula in clean JSON."),
    new HumanMessage(formattedPrompt),
  ]);

  // --- Parse JSON safely ---
  let content = response.content.trim();
  if (content.startsWith("```")) {
    content = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }

  try {
    const learningPaths = JSON.parse(content);
    if (!Array.isArray(learningPaths)) throw new Error("Response is not an array");
    return learningPaths;
  } catch (err) {
    console.error("JSON parse error:", err, "\nAI response was:\n", content);
    throw new Error("Failed to parse learning paths JSON from OpenAI.");
  }
}

module.exports = { generateCurriculum };

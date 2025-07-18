const { ChatOpenAI } = require('langchain/chat_models/openai');
const { PromptTemplate } = require('langchain/prompts');
const { HumanMessage, SystemMessage } = require('langchain/schema');
require('dotenv').config();

const openAIApiKey = process.env.OPENAI_API_KEY;

const chat = new ChatOpenAI({
  openAIApiKey,
  temperature: 0.7,
  modelName: 'gpt-3.5-turbo',
});

const resourcePrompt = new PromptTemplate({
  template: `Generate a list of recommended resources (books, articles, videos, websites) for the topic: {topic}, for a {level} learner, over {timeline} months. Return ONLY the resources as a valid JSON object with weeks as keys and resource lists as values. Do not include any explanation or text outside the JSON object.`,
  inputVariables: ['topic', 'timeline', 'level'],
});

async function generateResources(topic, timeline, level) {
  try {
    const prompt = await resourcePrompt.format({ topic, timeline, level });
    const response = await chat.call([
      new SystemMessage('You are a helpful resource recommender.'),
      new HumanMessage(prompt),
    ]);
    console.log('OpenAI raw response:', response.content);
    if (!response.content.trim().startsWith('{')) {
      throw new Error('OpenAI did not return JSON. Response: ' + response.content);
    }
    let resources;
    try {
      resources = JSON.parse(response.content);
    } catch (err) {
      throw new Error('Failed to parse resources JSON from OpenAI response.');
    }
    return resources;
  } catch (error) {
    console.error('Error in generateResources:', error.message);
    throw error;
  }
}

module.exports = { generateResources };

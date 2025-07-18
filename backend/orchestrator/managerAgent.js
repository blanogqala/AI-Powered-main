const { generateCurriculum } = require('../agents/curriculumAgent');
// const { generateContent } = require('../agents/contentGenerator');
// const { generateAssessment } = require('../agents/assessmentAgent');
// const { generateResources } = require('../agents/resourceAgent');

async function managerAgent({ topic, timeline, level, userId }) {
  try {
    // 1. Generate multiple learning paths (curricula)
    let learningPaths = await generateCurriculum(topic, timeline, level);
    // Only return the learning paths (no content, assessment, or resources yet)
    // The frontend should request details for a selected path separately
    return { learningPaths };
  } catch (error) {
    console.error('Error in managerAgent:', error.message);
    throw error;
  }
}

module.exports = { managerAgent };

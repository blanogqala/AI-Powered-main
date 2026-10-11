const { generateJSON, text, requireShape } = require('../services/aiClient');
async function generateResources(topic, timeline, level) {
  const data = await generateJSON('Recommend reputable educational resources; do not invent URLs.', `Input: ${JSON.stringify({topic,timeline,level})}. Return {"Week 1":[{"title":"...","type":"article/book/video","url":"https://...","description":"..."}],...}. Use public links you know; omit uncertain resources. Prefer a few useful resources over an exhaustive list.`);
  requireShape(data && typeof data==='object' && !Array.isArray(data), 'resources');
  return Object.fromEntries(Object.entries(data).map(([week,items])=>[week,Array.isArray(items)?items.filter(r=>text(r.title)&&text(r.url)&&/^https:\/\//.test(r.url)):[]]));
}
module.exports = { generateResources };

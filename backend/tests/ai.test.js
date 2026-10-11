const {test,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const {generateJSON}=require('../services/aiClient');
const {generateCurriculum}=require('../agents/curriculumAgent');
const {generateLessonContent}=require('../agents/contentGenerator');
const {generateQuiz,gradeShortAnswer,gradeProjectSubmission}=require('../agents/assessmentAgent');
const original=global.fetch;
afterEach(()=>{global.fetch=original;delete process.env.GROQ_API_KEY});
function answer(value,finish='stop'){process.env.GROQ_API_KEY='test-only';global.fetch=async(url,options)=>{assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');assert.equal(JSON.parse(options.body).model,'llama-3.3-70b-versatile');return new Response(JSON.stringify({choices:[{finish_reason:finish,message:{content:JSON.stringify(value)}}]}),{status:200})}}
test('missing key does not call a paid fallback',async()=>{delete process.env.GROQ_API_KEY;await assert.rejects(generateJSON('x','y'),e=>e.status===503)});
test('free quota error is actionable',async()=>{process.env.GROQ_API_KEY='test-only';global.fetch=async()=>new Response('{}',{status:429});await assert.rejects(generateJSON('x','y'),e=>e.status===429)});
test('malformed and truncated responses are not accepted',async()=>{answer({},'length');await assert.rejects(generateJSON('x','y'),/incomplete/);global.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'bad json'}}]}));await assert.rejects(generateJSON('x','y'),/malformed/)});
test('paths retain level/timeline and have all weeks',async()=>{const curriculum=Object.fromEntries(Array.from({length:12},(_,i)=>[`Week ${i+1}`,{header:'Module',lessons:['Variables','Functions']}])) ;answer({learningPaths:[1,2,3].map(n=>({title:'Path '+n,description:'Learn coding',curriculum}))});const paths=await generateCurriculum('JavaScript',3,'Beginner');assert.equal(paths[0].timeline,3);assert.equal(paths[0].level,'Beginner');assert.equal(Object.keys(paths[0].curriculum).length,12)});
test('incomplete curricula are rejected',async()=>{answer({learningPaths:[1,2,3].map(n=>({title:'Path '+n,description:'Learning',curriculum:{}}))});await assert.rejects(generateCurriculum('JS',3,'Beginner'),/curriculum length/)});
test('input bounds prevent costly oversized generation',async()=>{await assert.rejects(generateCurriculum('JS',200,'Beginner'),e=>e.status===400)});
test('lesson shape validated before saving',async()=>{answer({title:'Variables',objectives:['a','b','c'],body:'A variable stores a value.',summary:'Values can change.'});assert.equal((await generateLessonContent({subtopic:'Variables'})).title,'Variables');answer({title:'Variables'});await assert.rejects(generateLessonContent({}),/invalid lesson/)});
test('short answer stays editable and MCQ correct must match options',async()=>{const q={question:'Explain variables',correct:'Named storage',explanation:'Stores a value',type:'short'};answer({quiz:[q,q,q]});const quiz=await generateQuiz({lessonTitle:'Variables',lessonBody:'Variables store values.'});assert.equal(quiz[0].options,undefined);assert.equal(new Set(quiz.map(x=>x.id)).size,3);answer({quiz:[{...q,type:'mcq',options:['a','b']},q,q]});await assert.rejects(generateQuiz({}),/multiple-choice/)});
test('code braces in project submissions are data, not prompt-template variables',async()=>{answer({grade:80,feedback:'Good use of variables'});assert.equal((await gradeProjectSubmission({projectSubmission:'const a = {x:1};'})).grade,80)});
test('invalid grade cannot be recorded',async()=>{answer({score:3,feedback:'Oops'});await assert.rejects(gradeShortAnswer({}),/invalid answer grade/)});

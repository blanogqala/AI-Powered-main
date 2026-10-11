const {test}=require('node:test');const assert=require('node:assert/strict');
const {createAuthMiddleware}=require('../middleware/auth');
async function check({token='test-token',body={},query={},reject=false}={}){
 const req={get:()=>token?`Bearer ${token}`:null,body,query};const res={statusCode:200,status(n){this.statusCode=n;return this},json(data){this.data=data;return this}};let next=false;
 await createAuthMiddleware(async()=>{if(reject)throw Error('expired');return{uid:'real-user'}})(req,res,()=>{next=true});return{req,res,next};
}
test('learning requests require a valid identity',async()=>{assert.equal((await check({token:null})).res.statusCode,401);assert.equal((await check({reject:true})).res.statusCode,401)});
test('learning account identifiers cannot be spoofed',async()=>{assert.equal((await check({body:{userId:'another-user'}})).res.statusCode,403);assert.equal((await check({query:{userId:'another-user'}})).res.statusCode,403)});
test('verified identity is bound to learning operations',async()=>{const r=await check();assert.equal(r.next,true);assert.equal(r.req.body.userId,'real-user')});

const https=require('https');
const {chromium}=require('playwright');
const urls=[process.env.EMOJI_DROPS_URL||'https://ordboybro.github.io/'];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForCurrentProduction(u,attempts=24){
  let last=null;
  for(let i=0;i<attempts;i++){
    last=await get(u);
    const body=String(last.body||'');
    if(last.status>=200&&last.status<400&&body.includes('app-v2.js?v=runtime-336')&&body.includes('emoji-drops-navigation-final.js'))return last;
    await sleep(10000);
  }
  return last;
}
const get=u=>new Promise((res,rej)=>{const x=https.get(u,{headers:{'User-Agent':'EmojiDrops-QA/1.0'}},r=>{let d='';r.setEncoding('utf8');r.on('data',c=>d+=c);r.on('end',()=>res({status:r.statusCode,body:d,headers:r.headers}))});x.setTimeout(12000,()=>x.destroy(Error('timeout')));x.on('error',rej)});
(async()=>{
 const b=await chromium.launch({headless:true});
 try{
  for(const u of urls){
   const r=await waitForCurrentProduction(u);
   if(r.status<200||r.status>=400)throw Error(`${u} HTTP ${r.status}`);
   for(const marker of ['Emoji','Drops','app-v2.js?v=runtime-336','emoji-drops-navigation-final.js'])if(!r.body.includes(marker))throw Error(`${u} missing current production marker: ${marker}`);
   const p=await b.newPage({viewport:{width:390,height:844}});
   const errors=[];p.on('pageerror',e=>errors.push(String(e.message||e)));
   await p.goto(u,{waitUntil:'domcontentloaded',timeout:20000});
   await p.waitForFunction(()=>window.__emojiDropsRuntimeLoader?.complete===true,{timeout:15000});
   await p.waitForSelector('#view-cases.active .ed-case',{state:'visible',timeout:5000});
   const state=await p.evaluate(()=>({active:[...document.querySelectorAll('.ed-view.active')].map(x=>x.id),doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,w:innerWidth}));
   if(state.active.length!==1||state.active[0]!=='view-cases')throw Error(`Production boot active-view contract failed: ${JSON.stringify(state)}`);
   if(state.doc>state.w+1||state.body>state.w+1)throw Error(`Production horizontal overflow: ${JSON.stringify(state)}`);
   for(const name of ['inventory','upgrade','market','profile']){
    const n=p.locator(`[data-view="${name}"]:visible`).first();await n.click();
    await p.waitForFunction(v=>document.querySelector(`#view-${CSS.escape(v)}`)?.classList.contains('active'),name,{timeout:4000});
   }
   if(errors.length)throw Error(`Production page errors: ${errors.join(' | ')}`);
   await p.close();
  }
 }finally{await b.close()}
 console.log('Production smoke OK: public root reachable; browser boot, single active view, mobile overflow, navigation and page-error invariants verified.');
})().catch(e=>{console.error(e);process.exitCode=1});
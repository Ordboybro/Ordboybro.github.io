const { chromium }=require('playwright');
const { spawn }=require('node:child_process');
const path=require('node:path');

const server=spawn(process.execPath,['-e',`require('http').createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');const p=u.pathname==='/'?'index.html':u.pathname.slice(1);const file=require('path').join(${JSON.stringify(path.resolve(__dirname,'..'))},p);require('fs').createReadStream(file).on('open',()=>{res.statusCode=200;res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript; charset=utf-8':p.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream')}).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)}).listen(4178)`],{stdio:'ignore'});

async function waitServer(){for(let i=0;i<50;i++){try{await new Promise((resolve,reject)=>{const r=require('node:http').get('http://127.0.0.1:4178/',x=>{x.resume();x.statusCode===200?resolve():reject(Error('HTTP '+x.statusCode))});r.on('error',reject)});return}catch{await new Promise(r=>setTimeout(r,50))}}throw Error('server timeout')}

const instrument=`(()=>{const L=window.__edLeak={timeouts:new Set(),intervals:new Set(),rafs:new Set(),observers:new Set(),sockets:new Set(),listeners:0};
const st=window.setTimeout.bind(window),ct=window.clearTimeout.bind(window),si=window.setInterval.bind(window),ci=window.clearInterval.bind(window),raf=window.requestAnimationFrame?.bind(window),caf=window.cancelAnimationFrame?.bind(window);
window.setTimeout=(fn,ms,...a)=>{const id=st(()=>{L.timeouts.delete(id);fn(...a)},ms);L.timeouts.add(id);return id};
window.clearTimeout=id=>{L.timeouts.delete(id);return ct(id)};
window.setInterval=(fn,ms,...a)=>{const id=si(fn,ms,...a);L.intervals.add(id);return id};
window.clearInterval=id=>{L.intervals.delete(id);return ci(id)};
if(raf){window.requestAnimationFrame=fn=>{const id=raf(t=>{L.rafs.delete(id);fn(t)});L.rafs.add(id);return id};window.cancelAnimationFrame=id=>{L.rafs.delete(id);return caf(id)}}
const OA=window.MutationObserver;if(OA)window.MutationObserver=class extends OA{constructor(...a){super(...a);L.observers.add(this)}disconnect(){L.observers.delete(this);return super.disconnect()}};
const OWS=window.WebSocket;if(OWS)window.WebSocket=class extends OWS{constructor(...a){super(...a);L.sockets.add(this);this.addEventListener('close',()=>L.sockets.delete(this),{once:true});}};
const ae=EventTarget.prototype.addEventListener,re=EventTarget.prototype.removeEventListener,wrapped=new WeakMap();
EventTarget.prototype.addEventListener=function(t,f,o){L.listeners++;return ae.call(this,t,f,o)};
EventTarget.prototype.removeEventListener=function(t,f,o){L.listeners--;return re.call(this,t,f,o)};
})();`;

(async()=>{let browser,context,page;try{
 await waitServer();
 browser=await chromium.launch({headless:true});
 context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript({content:instrument});
 page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
 await page.goto('http://127.0.0.1:4178/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__emojiDropsRuntimeLoader?.complete===true,{timeout:10000});
 await page.waitForSelector('#view-cases.active .ed-case',{timeout:5000});
 await page.waitForTimeout(300);
 const snap=()=>page.evaluate(()=>{const l=window.__edLeak;return{dom:document.body.querySelectorAll('*').length,timeouts:l.timeouts.size,intervals:l.intervals.size,rafs:l.rafs.size,observers:l.observers.size,sockets:l.sockets.size,listeners:l.listeners,heap:performance.memory?.usedJSHeapSize||null}});
 const base=await snap();
 for(let i=0;i<100;i++){
   await page.evaluate(()=>window.EmojiDropsCaseShowcaseExact.open('smile'));
   await page.waitForSelector('#edExact.show',{timeout:2500});
   await page.evaluate(()=>window.EmojiDropsCaseShowcaseExact.close('long-session'));
   await page.waitForFunction(()=>!document.querySelector('#edExact.show'),{timeout:1500});
   if(i%10===9)await page.waitForTimeout(30);
 }
 for(let i=0;i<25;i++){
   const v=['cases','inventory','upgrade','market','profile'][i%5];
   await page.locator(`[data-view="${v}"]`).first().click();
   await page.waitForFunction(v=>document.querySelector(`#view-${CSS.escape(v)}`)?.classList.contains('active'),v,{timeout:2000});
 }
 await page.locator('[data-view="cases"]').first().click();
 await page.waitForSelector('#view-cases.active .ed-case',{timeout:3000});
 await page.waitForTimeout(300);
 const tail=await snap();
 const delta={dom:tail.dom-base.dom,timeouts:tail.timeouts-base.timeouts,intervals:tail.intervals-base.intervals,rafs:tail.rafs-base.rafs,observers:tail.observers-base.observers,sockets:tail.sockets-base.sockets,listeners:tail.listeners-base.listeners,heapMB:base.heap&&tail.heap?(tail.heap-base.heap)/1048576:null};
 if(delta.dom>40||delta.timeouts>8||delta.intervals>3||delta.rafs>6||delta.observers>3||delta.sockets>2||delta.listeners>20)throw Error('Long-session lifecycle drift: '+JSON.stringify(delta));
 if(errors.length)throw Error('Page errors during long session: '+errors.join(' | '));
 console.log('LONG_SESSION_BASE',JSON.stringify(base));
 console.log('LONG_SESSION_TAIL',JSON.stringify(tail));
 console.log('LONG_SESSION_DELTA',JSON.stringify(delta));
 console.log('Long-session E2E OK: 100 modal cycles + 25 navigation cycles without unbounded DOM/timer/observer/socket/listener growth');
}catch(e){console.error(e);process.exitCode=1}finally{try{await page?.close()}catch{}try{await context?.close()}catch{}try{await browser?.close()}catch{}try{server.kill('SIGTERM')}catch{}}})();

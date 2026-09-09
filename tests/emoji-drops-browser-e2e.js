const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, ['-e', `require('http').createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');const p=u.pathname==='/'?'index.html':u.pathname.slice(1);const file=require('path').join(${JSON.stringify(root)},p);require('fs').createReadStream(file).on('open',()=>{res.statusCode=200;res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript; charset=utf-8':p.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream')}).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)}).listen(4173)`], { stdio: 'ignore' });
const sizes=[[320,844],[340,844],[375,812],[390,844],[430,932]];
async function waitForServer(){for(let i=0;i<40;i++){try{await new Promise((resolve,reject)=>{const req=require('node:http').get('http://127.0.0.1:4173/',r=>{r.resume();r.statusCode===200?resolve():reject(Error('HTTP '+r.statusCode))});req.on('error',reject)});return}catch{await new Promise(r=>setTimeout(r,50))}}throw Error('Local test server did not start')}
async function assertCore(page,width,height){
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__emojiDropsRuntimeLoader?.complete===true || (window.__emojiDropsRuntimeLoader?.failed||[]).length>0,{timeout:10000});
  const loader=await page.evaluate(()=>({loader:window.__emojiDropsRuntimeLoader,hardening:window.__emojiDropsDiagnostics,core:!!window.__emojiDropsCore,transactions:window.__emojiDropsTransactions?window.__emojiDropsTransactions.version:null}));
  if(!loader.loader?.complete)throw Error(`Runtime boot failed at ${width}x${height}: ${JSON.stringify(loader)}`);
  const balance=page.locator('#edBalance');await balance.waitFor({state:'visible',timeout:10000});
  const text=(await balance.textContent()).trim(); const numeric=(text.match(/\d[\d,]*/)||[''])[0].replace(/,/g,'');
  if(Number(numeric)!==250||!(await page.locator('.ed-coin').count()))throw Error(`Fresh Emoji Coin balance failed at ${width}x${height}: ${text}`);
  const openCase=page.locator('[data-open="transport"]').first();
  if(await openCase.count()){
    await openCase.click(); const opener=page.locator('[data-do-open]').first();
    if(await opener.count()){for(let i=0;i<5;i++)await opener.click();}
    const close=page.locator('[data-close]').first(); if(await close.count())await close.click();
  }
  const inv=page.locator('[data-view="inventory"]').first();if(await inv.count())await inv.click();
  const sell=page.locator('[data-sell]').first();if(await sell.count())await sell.waitFor();
  const market=page.locator('[data-view="market"]').first();if(await market.count())await market.click();
  const buy=page.locator('[data-buy]').first();if(await buy.count())await buy.click();
  const daily=page.locator('[data-view="daily"]').first();if(await daily.count())await daily.click();
  const dailyBtn=page.locator('[data-daily]').first();if(await dailyBtn.count())await dailyBtn.click();
  const modal=page.locator('.modal.show,.ed-modal.show').last();if(await modal.count()){await page.keyboard.press('Escape');if(await modal.isVisible())throw Error(`Escape failed at ${width}x${height}`)}
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);if(overflow>2)throw Error(`Horizontal overflow at ${width}x${height}: ${overflow}px`);
  const controls=await page.locator('button,input,select,textarea,a[href]').evaluateAll(xs=>xs.filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}).map(x=>({tag:x.tagName,h:x.getBoundingClientRect().height,label:(x.getAttribute('aria-label')||x.textContent||'').trim()})));
  const tiny=controls.filter(x=>x.h<40);if(tiny.length)throw Error(`Touch targets under 40px at ${width}x${height}: ${tiny.map(x=>`${x.tag}:${x.label}`).join(', ')}`);
  const live=await page.locator('#ed-a11y-live').count();if(!live)throw Error(`A11y live region missing at ${width}x${height}`);
  if(errors.length)throw Error(`Page errors at ${width}x${height}: ${errors.join(' | ')}`);
}
(async()=>{const browser=await chromium.launch({headless:true});try{await waitForServer();for(const [width,height] of sizes){const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await assertCore(page,width,height);await page.close();}const landscape=await browser.newPage({viewport:{width:844,height:390},reducedMotion:'reduce'});await assertCore(landscape,844,390);await landscape.close();console.log('Browser E2E OK: portrait matrix + landscape + rapid taps + modal Escape + Emoji Coin + overflow + touch targets + live region')}finally{await browser.close();server.kill()}})().catch(err=>{console.error(err);server.kill();process.exitCode=1});

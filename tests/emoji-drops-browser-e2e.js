const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, ['-e', `require('http').createServer((req,res)=>require('fs').createReadStream(require('path').join(${JSON.stringify(root)}, req.url==='/'?'index.html':req.url)).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)).listen(4173)`], { stdio: 'ignore' });
const sizes=[[320,844],[340,844],[375,812],[390,844],[430,932]];
async function waitForServer(){for(let i=0;i<40;i++){try{await new Promise((resolve,reject)=>{const req=require('node:http').get('http://127.0.0.1:4173/',r=>{r.resume();r.statusCode===200?resolve():reject(Error('HTTP '+r.statusCode))});req.on('error',reject)});return}catch{await new Promise(r=>setTimeout(r,50))}}throw Error('Local test server did not start')}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    await waitForServer();
    for(const [width,height] of sizes){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
      page.on('pageerror',e=>errors.push(String(e.message||e)));
      await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
      await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'});
      await page.locator('#edBalance').waitFor();
      const balance=(await page.locator('#edBalance').textContent()).trim();
      const numeric=(balance.match(/\d[\d,]*/)||[''])[0].replace(/,/g,'');
      if(Number(numeric)!==250||!(await page.locator('.ed-coin').count()))throw new Error(`Fresh Emoji Coin balance failed at ${width}x${height}: ${balance}`);
      const openCase=page.locator('[data-open="transport"]'); if(await openCase.count()){await openCase.click();const opener=page.locator('[data-do-open]');if(await opener.count()){for(let i=0;i<5;i++)await opener.click();}const close=page.locator('[data-close]').first();if(await close.count())await close.click();}
      const inv=page.locator('[data-view="inventory"]').first();if(await inv.count())await inv.click();
      const sell=page.locator('[data-sell]').first();if(await sell.count())await sell.waitFor();
      const market=page.locator('[data-view="market"]').first();if(await market.count())await market.click();
      const buy=page.locator('[data-buy]').first();if(await buy.count())await buy.click();
      const daily=page.locator('[data-view="daily"]').first();if(await daily.count())await daily.click();
      const dailyBtn=page.locator('[data-daily]').first();if(await dailyBtn.count())await dailyBtn.click();
      const modal=page.locator('.modal.show,.ed-modal.show').last();
      if(await modal.count()){await page.keyboard.press('Escape');if(await modal.isVisible())throw new Error(`Escape failed at ${width}x${height}`)}
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      if(overflow>2)throw new Error(`Horizontal overflow at ${width}x${height}: ${overflow}px`);
      if(errors.length)throw new Error(`Page errors at ${width}x${height}: ${errors.join(' | ')}`);
      await page.close();
    }
    const landscape=await browser.newPage({viewport:{width:844,height:390},reducedMotion:'reduce'});
    await landscape.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await landscape.locator('#edBalance').waitFor();
    const landscapeOverflow=await landscape.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);if(landscapeOverflow>2)throw new Error(`Landscape overflow: ${landscapeOverflow}px`);await landscape.close();
    console.log('Browser E2E OK: 320/340/375/390/430 portrait + landscape + rapid taps + modal Escape + Emoji Coin + overflow');
  }finally{await browser.close();server.kill()}
})().catch(err=>{console.error(err);server.kill();process.exitCode=1});

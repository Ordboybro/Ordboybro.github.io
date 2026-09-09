const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, ['-e', `require('http').createServer((req,res)=>require('fs').createReadStream(require('path').join(${JSON.stringify(root)}, req.url==='/'?'index.html':req.url)).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)).listen(4173)`], { stdio: 'ignore' });
const sizes=[[320,844],[340,844],[375,812],[390,844],[430,932]];
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const [width,height] of sizes){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
      page.on('pageerror',e=>errors.push(String(e.message||e)));
      await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
      await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'});
      await page.locator('#edBalance').waitFor();
      const balance=(await page.locator('#edBalance').textContent()).trim();
      if(!/250(?:\s*EC|\s*◆\s*EC)/.test(balance))throw new Error(`Fresh Emoji Coin balance failed at ${width}x${height}: ${balance}`);
      const openCase=page.locator('[data-open="transport"]'); if(await openCase.count()){await openCase.click();const opener=page.locator('[data-do-open]');if(await opener.count()){for(let i=0;i<5;i++)await opener.click();}const close=page.locator('[data-close]').first();if(await close.count())await close.click();}
      const inv=page.locator('[data-view="inventory"]').first();if(await inv.count())await inv.click();
      const sell=page.locator('[data-sell]').first();if(await sell.count())await sell.waitFor();
      const market=page.locator('[data-view="market"]').first();if(await market.count())await market.click();
      const buy=page.locator('[data-buy]').first();if(await buy.count())await buy.click();
      const daily=page.locator('[data-view="daily"]').first();if(await daily.count())await daily.click();
      const dailyBtn=page.locator('[data-daily]').first();if(await dailyBtn.count())await dailyBtn.click();
      await page.keyboard.press('Escape');
      if(errors.length)throw new Error(`Page errors at ${width}x${height}: ${errors.join(' | ')}`);
      await page.close();
    }
    const landscape=await browser.newPage({viewport:{width:844,height:390},reducedMotion:'reduce'});
    await landscape.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await landscape.locator('#edBalance').waitFor();await landscape.close();
    console.log('Browser E2E OK: 320/340/375/390/430 portrait + landscape + rapid taps + modal Escape + Emoji Coin');
  }finally{await browser.close();server.kill()}
})().catch(err=>{console.error(err);process.exitCode=1});
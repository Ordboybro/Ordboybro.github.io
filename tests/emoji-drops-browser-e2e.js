const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, ['-e', `require('http').createServer((req,res)=>require('fs').createReadStream(require('path').join(${JSON.stringify(root)}, req.url==='/'?'index.html':req.url)).on('error',()=>{res.statusCode=404;res.end()}).pipe(res)).listen(4173)`], { stdio: 'ignore' });

(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  try {
    await page.goto('http://127.0.0.1:4173/', {waitUntil:'networkidle'});
    await page.evaluate(()=>localStorage.clear());
    await page.reload({waitUntil:'networkidle'});

    const balance=page.locator('#edBalance');
    await balance.waitFor();
    if((await balance.textContent()).trim()!=='250 ₽')throw new Error('Fresh balance is not 250 EC');

    await page.locator('[data-open="transport"]').click();
    await page.locator('[data-do-open]').click();
    await page.locator('[data-close]').first().click();
    await page.locator('[data-view="inventory"]').first().click();
    await page.locator('[data-sell]').first().waitFor();

    await page.locator('[data-list-random]').click().catch(()=>{});
    await page.locator('[data-view="market"]').first().click();
    const marketBuy=page.locator('[data-buy]').first();
    if(await marketBuy.count()){
      await marketBuy.click();
      await page.locator('[data-view="inventory"]').first().click();
    }

    await page.locator('[data-view="daily"]').first().click();
    await page.locator('[data-daily]').click();
    await page.reload({waitUntil:'networkidle'});
    if((await balance.textContent()).trim()==='')throw new Error('Balance disappeared after reload');

    if(errors.length)throw new Error(`Runtime page errors: ${errors.join(' | ')}`);
    console.log('Browser E2E OK: fresh state -> open -> inventory -> market -> daily -> reload');
  } finally {
    await browser.close();
    server.kill();
  }
})().catch(err=>{console.error(err);process.exitCode=1});

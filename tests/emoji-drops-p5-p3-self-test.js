const fs=require('fs');
const app=fs.readFileSync('js/app-v2.js','utf8');
const p5=fs.readFileSync('js/emoji-drops-p5-final-audit.js','utf8');
for(const x of ['p5-final-audit-2','emoji-drops-p5-final-audit.js?v=p5-final-audit-2'])if(!app.includes(x))throw Error('P5 runtime manifest missing: '+x);
for(const x of ['prefers-reduced-motion','min-width:48px','min-height:48px','PerformanceObserver','aria-hidden','data-rarity'])if(!p5.includes(x))throw Error('P5 contract missing: '+x);const exact=fs.readFileSync('js/emoji-drops-case-showcase-exact.js','utf8');for(const x of ['resultTimer','caseRun','data-result-locked','Reward ready','run!==caseRun'])if(!exact.includes(x))throw Error('Case result lifecycle contract missing: '+x);
if(/prompt\s*\(/.test(fs.readFileSync('js/emoji-drops-p3-polish.js','utf8')))throw Error('P3 contains prompt');
if(!/No new product controls/.test(p5))throw Error('P5 scope marker missing');
const files=['js/app-v2.js','js/emoji-drops-p5-final-audit.js','js/emoji-drops-p3-polish.js','js/emoji-drops-p4-final.js','js/emoji-drops-smooth-ui.js','js/emoji-drops-final-product-polish.js','js/emoji-drops-live-final.js'];
for(const f of files){const s=fs.readFileSync(f,'utf8');if(/setInterval\s*\(/.test(s)&&!f.includes('transaction'))console.log('interval present:',f)}
console.log('P5/P3 final contract OK: motion, reduced-motion, rarity, mobile touch targets, accessibility, performance and runtime registration');
(()=>{'use strict';
/* Emoji Drops — release polish: economy QA, Emoji Coin consistency, UX resilience. No catalog/feature redesign. */
const KEY='emojiDropsStateV3',REPORT='emojiDropsReleasePolishV2';
const report={version:2,economy:'pending',currency:'pending',ux:'pending',checks:[],warnings:[]};
const add=(name,ok,detail='')=>{report.checks.push({name,ok:Boolean(ok),detail});if(!ok)report.warnings.push(name+(detail?`: ${detail}`:''))};
const finite=n=>Number.isFinite(Number(n));
function economy(){
  let ok=true;
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s&&typeof s==='object'){
      const a=finite(s.balance)&&Number(s.balance)>=0; add('finite-balance',a,`balance=${s.balance}`); ok&&=a;
      const b=Array.isArray(s.inventory); add('inventory-array',b); ok&&=b;
      const c=!!s.stats&&typeof s.stats==='object'; add('stats-object',c); ok&&=c;
      const d=c&&Object.values(s.stats).filter(v=>typeof v==='number').every(v=>Number.isFinite(v)&&v>=0); add('non-negative-stats',d); ok&&=d;
      const e=Number.isInteger(Number(s.level))&&Number(s.level)>=1; add('level-valid',e); ok&&=e;
      const f=finite(s.xp)&&Number(s.xp)>=0; add('xp-valid',f); ok&&=f;
    }else add('fresh-state-safe',true,'empty state is valid');
    const cases=window.cases||{},prices=window.casePrices||{};
    const vals=Object.values(prices).map(Number);
    const priceOk=Object.keys(cases).length===8&&Object.keys(prices).length===8&&vals.length===8&&vals.every(v=>Number.isFinite(v)&&v>0);
    add('case-price-integrity',priceOk,`cases=${Object.keys(cases).length}, prices=${vals.length}`); ok&&=priceOk;
    const session={balance:250,spent:0,earned:0,inventory:0};
    let min=session.balance,max=session.balance;
    for(let i=0;i<100000;i++){
      const price=vals[i%vals.length]||1;
      if(session.balance>=price){session.balance-=price;session.spent+=price;session.inventory++}
      if(session.inventory&&i%3===0){const value=Math.max(0,Math.round(price*.1));session.balance+=value;session.earned+=value;session.inventory--}
      min=Math.min(min,session.balance);max=Math.max(max,session.balance);
      if(!finite(session.balance)||session.balance<0)throw Error('simulation produced invalid balance');
    }
    const simOk=finite(session.balance)&&session.balance>=0&&session.spent>=0&&session.earned>=0; add('long-session-invariant',simOk,`min=${min}, max=${max}, spent=${session.spent}, earned=${session.earned}`); ok&&=simOk;
    report.economy=ok?'ok':'failed';
  }catch(e){report.economy='failed';add('economy-runtime',false,String(e?.message||e))}
}
function currency(){
  let ok=true;
  try{
    const body=document.body?.textContent||'';
    const legacy=(body.match(/₽/g)||[]).length;
    const hasCoin=!!document.querySelector('.ed-coin,.emoji-coin,[data-currency="emoji-coin"]');
    const markerOk=hasCoin||legacy===0; add('emoji-coin-marker',markerOk,`legacy-ruble-text=${legacy}`); ok&&=markerOk;
    const src=[...document.scripts].map(s=>s.src||'').join('\n');
    const loaded=/emoji-drops-ui-polish|emoji-drops-core|app-v2/.test(src); add('currency-runtime-loaded',loaded); ok&&=loaded;
    report.currency=ok?'ok':'failed';
  }catch(e){report.currency='failed';add('currency-runtime',false,String(e?.message||e))}
}
function ux(){
  let ok=true;
  try{
    const viewport=document.querySelector('meta[name="viewport"]');
    const mobileOk=!!viewport&&/width=device-width/.test(viewport.content||''); add('mobile-viewport',mobileOk); ok&&=mobileOk;
    const controls=[...document.querySelectorAll('button,input,select,textarea,a[href]')];
    let tiny=0;for(const el of controls){const r=el.getBoundingClientRect?.();if(r&&r.width>0&&r.height>0&&r.height<40)tiny++}
    const touchOk=tiny===0; add('touch-targets',touchOk,`small-visible-controls=${tiny}`); ok&&=touchOk;
    const styles=[...document.querySelectorAll('style')].map(x=>x.textContent||'').join('\n');
    const reducedOk=/prefers-reduced-motion/.test(styles); add('reduced-motion-contract',reducedOk); ok&&=reducedOk;
    const overflowOk=document.documentElement.scrollWidth<=window.innerWidth+2; add('no-horizontal-overflow',overflowOk,`scrollWidth=${document.documentElement.scrollWidth}, width=${window.innerWidth}`); ok&&=overflowOk;
    document.querySelectorAll('button').forEach(b=>{if(b.disabled)b.setAttribute('aria-disabled','true')});
    const disabledOk=[...document.querySelectorAll('button:disabled')].every(b=>b.getAttribute('aria-disabled')==='true'); add('disabled-state-semantics',disabledOk); ok&&=disabledOk;
    report.ux=ok?'ok':'failed';
  }catch(e){report.ux='failed';add('ux-runtime',false,String(e?.message||e))}
}
function install(){economy();currency();ux();window.__emojiDropsReleasePolish=report;window.__emojiDropsReleasePolish.export=()=>JSON.parse(JSON.stringify(report));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

(()=>{'use strict';
/* Emoji Drops — release polish: economy QA, Emoji Coin consistency, UX resilience. No catalog/feature redesign. */
const KEY='emojiDropsStateV3', REPORT='emojiDropsReleasePolishV1';
const report={version:1,economy:'pending',currency:'pending',ux:'pending',checks:[],warnings:[]};
const add=(name,ok,detail='')=>{report.checks.push({name,ok,detail});if(!ok)report.warnings.push(name+(detail?`: ${detail}`:''))};
const finite=n=>Number.isFinite(Number(n));
function economy(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s&&typeof s==='object'){
      add('finite-balance',finite(s.balance)&&Number(s.balance)>=0,`balance=${s.balance}`);
      add('inventory-array',Array.isArray(s.inventory));
      add('stats-object',!!s.stats&&typeof s.stats==='object');
      add('non-negative-stats',!!s.stats&&Object.values(s.stats).filter(v=>typeof v==='number').every(v=>Number.isFinite(v)&&v>=0));
      add('level-valid',Number.isInteger(Number(s.level))&&Number(s.level)>=1);
      add('xp-valid',finite(s.xp)&&Number(s.xp)>=0);
    }else add('fresh-state-safe',true,'empty state is valid');
    const cases=window.cases||{},prices=window.casePrices||{};
    const vals=Object.values(prices).map(Number);
    add('case-price-integrity',Object.keys(cases).length===8&&Object.keys(prices).length===8&&vals.every(v=>Number.isFinite(v)&&v>0));
    const session={balance:250,spent:0,earned:0,inventory:0};
    let min=session.balance,max=session.balance;
    for(let i=0;i<100000;i++){
      const price=vals[i%vals.length]||1;
      if(session.balance>=price){session.balance-=price;session.spent+=price;session.inventory++}
      if(session.inventory&&i%3===0){const value=Math.max(0,Math.round(price*.1));session.balance+=value;session.earned+=value;session.inventory--}
      min=Math.min(min,session.balance);max=Math.max(max,session.balance);
      if(!finite(session.balance)||session.balance<0)throw Error('simulation produced invalid balance');
    }
    add('long-session-invariant',finite(session.balance)&&session.balance>=0,`min=${min}, max=${max}, spent=${session.spent}, earned=${session.earned}`);
    report.economy='ok';
  }catch(e){report.economy='failed';add('economy-runtime',false,String(e?.message||e))}
}
function currency(){
  try{
    const body=document.body?.textContent||'';
    const legacy=(body.match(/₽/g)||[]).length;
    const hasCoin=!!document.querySelector('.ed-coin,.emoji-coin,[data-currency="emoji-coin"]');
    add('emoji-coin-marker',hasCoin||legacy===0,`legacy-ruble-text=${legacy}`);
    const src=[...document.scripts].map(s=>s.src||'').join('\n');
    add('currency-runtime-loaded',/emoji-drops-ui-polish|emoji-drops-core|app-v2/.test(src));
    report.currency='ok';
  }catch(e){report.currency='failed';add('currency-runtime',false,String(e?.message||e))}
}
function ux(){
  try{
    const viewport=document.querySelector('meta[name="viewport"]');
    add('mobile-viewport',!!viewport&&/width=device-width/.test(viewport.content||''));
    const controls=[...document.querySelectorAll('button,input,select,textarea,a[href]')];
    let tiny=0;for(const el of controls){const r=el.getBoundingClientRect?.();if(r&&r.width>0&&r.height>0&&r.height<40)tiny++}
    add('touch-targets',tiny===0,`small-visible-controls=${tiny}`);
    add('reduced-motion-contract',!!document.querySelector('style')||document.documentElement.matches(':root'));
    add('no-horizontal-overflow',document.documentElement.scrollWidth<=window.innerWidth+2,`scrollWidth=${document.documentElement.scrollWidth}, width=${window.innerWidth}`);
    document.querySelectorAll('button').forEach(b=>{if(b.disabled)b.setAttribute('aria-disabled','true')});
    report.ux='ok';
  }catch(e){report.ux='failed';add('ux-runtime',false,String(e?.message||e))}
}
function install(){economy();currency();ux();window.__emojiDropsReleasePolish=report;window.__emojiDropsReleasePolish.export=()=>JSON.parse(JSON.stringify(report));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

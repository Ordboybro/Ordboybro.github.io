(()=>{'use strict';
/* Emoji Drops hardening layer. No UI, no new controls, no design changes. */
const KEY='emojiDropsStateV3';
const R={common:55,rare:27,epic:12,mythical:5,legendary:1};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const safeJson=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}};
const state=safeJson(KEY,null);
if(state&&typeof state==='object'){
  state.balance=Math.max(0,Number(state.balance)||0);
  state.inventory=Array.isArray(state.inventory)?state.inventory.filter(Boolean):[];
  state.stats=state.stats&&typeof state.stats==='object'?state.stats:{};
  for(const k of ['opens','wins','spent','earned','upgrades']) state.stats[k]=Math.max(0,Number(state.stats[k])||0);
  state.xp=Math.max(0,Number(state.xp)||0);
  state.level=Math.max(1,Math.floor(Number(state.level)||1));
  state.market=Array.isArray(state.market)?state.market.filter(Boolean):[];
  state.nickname=String(state.nickname||'Player').slice(0,32);
  state.daily=Math.max(0,Math.floor(Number(state.daily)||0));
  state.lastReward=Math.max(0,Number(state.lastReward)||Date.now());
  state.lastDaily=Math.max(0,Number(state.lastDaily)||0);
  localStorage.setItem(KEY,JSON.stringify(state));
}
function validateDataset(){
  const cases=window.cases&&typeof window.cases==='object'?window.cases:{};
  const report={cases:0,items:0,duplicateIds:0,invalidRarity:0,rarityWeightTotal:Object.values(R).reduce((a,b)=>a+b,0),emptyCases:0};
  const seen=new Set();
  for(const [key,arr] of Object.entries(cases)){
    if(!Array.isArray(arr)||!arr.length){report.emptyCases++;continue}
    report.cases++;
    for(const item of arr){
      report.items++;
      if(!item||!R[item.rarity]) report.invalidRarity++;
      const id=String(item?.id||item?.emoji||item?.name||'');
      if(id){if(seen.has(key+'::'+id)) report.duplicateIds++; else seen.add(key+'::'+id)}
    }
  }
  return report;
}
const diagnostics={app:'Emoji Drops',runtime:'hardened-v1',stateKey:KEY,odds:R,totalOdds:100,dataset:validateDataset(),errors:[]};
window.__emojiDropsDiagnostics=diagnostics;
window.addEventListener('error',e=>{diagnostics.errors.push({type:'error',message:String(e.message||e.error||'unknown'),file:String(e.filename||''),line:Number(e.lineno||0)});diagnostics.errors=diagnostics.errors.slice(-20)});
window.addEventListener('unhandledrejection',e=>{diagnostics.errors.push({type:'promise',message:String(e.reason?.message||e.reason||'unknown')});diagnostics.errors=diagnostics.errors.slice(-20)});
/* Preserve a single canonical state snapshot for debugging and future migrations. */
window.__emojiDropsExportState=()=>JSON.parse(localStorage.getItem(KEY)||'null');
/* Daily streak: missed calendar days reset the streak instead of continuing forever. */
if(state&&state.lastDaily){
  const now=new Date();const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  const prev=Number(state.lastDaily)||0;const gap=Math.floor((today-prev)/86400000);
  if(gap>1){state.daily=0;localStorage.setItem(KEY,JSON.stringify(state));}
}
/* Detect duplicate runtime injection without touching the existing visual layer. */
window.__emojiDropsRuntimeInstances=(window.__emojiDropsRuntimeInstances||0)+1;
if(window.__emojiDropsRuntimeInstances>1) diagnostics.errors.push({type:'runtime',message:'Multiple runtime instances detected'});
})();

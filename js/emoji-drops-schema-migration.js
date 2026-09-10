(()=>{'use strict';
/* Emoji Drops schema migration v1: forward-only, local-only save normalization before core boot. */
const KEY='emojiDropsStateV3',VERSION=1;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const validInventory=x=>Array.isArray(x)?x.filter(v=>v&&typeof v==='object'):[];
function base(){return {balance:250,inventory:[],stats:{opens:0,wins:0,spent:0,earned:0,upgrades:0},xp:0,level:1,lastReward:Date.now()+100*365*24*60*60*1000,daily:0,lastDaily:0,market:[],nickname:'Player',bonusDay:'',bonusClaims:0,schemaVersion:VERSION}}
function normalize(s){const n={...base(),...(s&&typeof s==='object'?s:{})};n.balance=Number.isFinite(Number(n.balance))?Math.max(0,Math.min(Number(n.balance),Number.MAX_SAFE_INTEGER)):250;n.inventory=validInventory(n.inventory);n.market=Array.isArray(n.market)?n.market.filter(Boolean):[];n.stats={...base().stats,...(n.stats||{})};for(const k of Object.keys(base().stats))n.stats[k]=Number.isFinite(Number(n.stats[k]))?Math.max(0,Number(n.stats[k])):0;n.xp=Number.isFinite(Number(n.xp))?Math.max(0,Number(n.xp)):0;n.level=Number.isFinite(Number(n.level))?Math.max(1,Math.floor(Number(n.level))):1;n.schemaVersion=VERSION;return n}
function migrate(){const current=read(KEY);if(current&&Number(current.schemaVersion||0)>=VERSION){window.__emojiDropsSchema={version:VERSION,migrated:false};return}
 const legacy=read('users'),userEmail=localStorage.getItem('currentUser');let source=current;
 if(!source&&Array.isArray(legacy)&&userEmail){const u=legacy.find(x=>x&&x.email===userEmail);if(u)source={...u,stats:u.stats||{}}}
 const next=normalize(source||base());if(write(KEY,next)){window.__emojiDropsSchema={version:VERSION,migrated:true};}else window.__emojiDropsSchema={version:VERSION,migrated:false,error:'storage_write_failed'};
}
migrate();
})();
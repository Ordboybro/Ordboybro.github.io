(()=>{'use strict';
/* Emoji Drops — single authoritative runtime. Local fictional game economy only. */
const APP='emoji-drops-core-v1';
const R={common:{label:'COMMON',color:'#9ca3af',w:55},rare:{label:'RARE',color:'#3b82f6',w:27},epic:{label:'EPIC',color:'#a855f7',w:12},mythical:{label:'MYTHICAL',color:'#ef4444',w:5},legendary:{label:'LEGENDARY',color:'#ff8a00',w:1}};
const CASES=window.cases||{};
const PRICES=window.casePrices||{smile:100,moves:80,nature:60,food:40,animals:20,transport:10,sport:250,games:500};
const NAMES={smile:'Smile',moves:'Moves',nature:'Nature',food:'Food',animals:'Animals',transport:'Transport',sport:'Sport',games:'Games'};
const ICONS={smile:'😀',moves:'🕺',nature:'🌿',food:'🍔',animals:'🐶',transport:'🚗',sport:'⚽',games:'🎮'};
const KEY='emojiDropsStateV3';
const legacyUsers=()=>{try{const a=JSON.parse(localStorage.getItem('users')||'[]');return Array.isArray(a)?a:[]}catch{return[]}};
const email=()=>localStorage.getItem('currentUser')||'';
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')return s}catch{}return {balance:250,inventory:[],stats:{opens:0,wins:0,spent:0,earned:0,upgrades:0},xp:0,level:1,lastReward:Date.now()+100*365*24*60*60*1000,daily:0,lastDaily:0,market:[],nickname:'Player',bonusDay:'',bonusClaims:0}}
let S=load(); let busy=false; let selectedCase='smile',openQty=1,upgradeFrom=null,upgradeTo=null,mult=2;
function save(){localStorage.setItem(KEY,JSON.stringify(S));syncLegacy()}
function syncLegacy(){const e=email();if(!e)return;const a=legacyUsers();const i=a.findIndex(x=>x&&x.email===e);if(i>=0){a[i].balance=S.balance;a[i].inventory=S.inventory;a[i].stats=S.stats;a[i].xp=S.xp;a[i].level=S.level;a[i].nickname=S.nickname;a[i].lastReward=S.lastReward;localStorage.setItem('users',JSON.stringify(a))}}
function money(n){return `${Math.round(Number(n)||0)} ₽`}
function esc(x){return String(x).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#92;'}[m]))}
function items(key){return Array.isArray(CASES[key])?CASES[key]:[]}
function pickWeighted(arr){let total=arr.reduce((a,x)=>a+x.w,0),r=Math.random()*total;for(const x of arr){r-=x.w;if(r<=0)return x}return arr[arr.length-1]}
function pickItem(key){const a=items(key);if(!a.length)return {emoji:ICONS[key]||'🎁',rarity:'common',price:'1₽'};const by={};a.forEach(x=>(by[x.rarity]??=[]).push(x));const rar=pickWeighted(Object.entries(R).map(([k,v])=>({key:k,w:v.w})));const pool=by[rar.key]&&by[rar.key].length?by[rar.key]:a;return pool[Math.floor(Math.random()*pool.length)]}
function rarity(x){return R[x?.rarity]||R.common}
function xpNeed(){return 100+(S.level-1)*75}
function addXP(n){S.xp+=n;while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++}}
function grantReward(){return 0}
function claimDaily(){const now=new Date(),day=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());if(S.lastDaily===day)return 0;S.lastDaily=day;S.daily=(S.daily||0)+1;const streak=(S.daily-1)%7+1, reward=streak===7?500:50+streak*25;S.balance+=reward;S.stats.earned+=reward;addXP(30);save();return reward}

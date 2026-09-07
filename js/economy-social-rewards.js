(()=>{'use strict';
/* Emoji Drops — friendly starter economy for playing with friends. */
const START_BALANCE=1000,REWARD=250,COOLDOWN=15*60*1000,KEY='emojiDrops.socialReward.v1',INIT='emojiDrops.economyInitialized.v1';
const $=(s,r=document)=>r.querySelector(s);
function readUsers(){try{const x=JSON.parse(localStorage.getItem('users')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function writeUsers(x){localStorage.setItem('users',JSON.stringify(x))}
function email(){return localStorage.getItem('currentUser')}
function user(){const e=email();return e?readUsers().find(x=>x?.email===e)||null:null}
function key(){return`${KEY}:${email()||'guest'}`}
function state(){try{return JSON.parse(localStorage.getItem(key())||'{}')}catch{return{}}}
function saveState(x){localStorage.setItem(key(),JSON.stringify(x))}
function format(ms){const s=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(s/60),q=s%60;return`${String(m).padStart(2,'0')}:${String(q).padStart(2,'0')}`}
function normalizeNewAccount(){const e=email();if(!e)return;const u=user();if(!u)return;let marks={};try{marks=JSON.parse(localStorage.getItem(INIT)||'{}')}catch{}if(marks[e])return;/* First seen account gets the same clean starter economy. */u.balance=START_BALANCE;u.stats=u.stats||{opened:0,upgrades:0,spent:0,received:0};u.stats.received=Number(u.stats.received)||0;const a=readUsers(),i=a.findIndex(x=>x?.email===e);if(i>=0){a[i]=u;writeUsers(a)}marks[e]=1;localStorage.setItem(INIT,JSON.stringify(marks))}
function updateHeader(){const b=$('#balance'),r=$('#rewardHeader');const u=user();if(b&&u)b.textContent=Math.round(Number(u.balance)||0);if(!r)return;const st=state(),left=Math.max(0,Number(st.nextAt||0)-Date.now());r.disabled=left>0;r.textContent=left?`Награда · ${format(left)}`:`Получить ${REWARD}₽`}
function claim(e){const r=e.target?.closest?.('#rewardHeader');if(!r)return;e.preventDefault();e.stopImmediatePropagation();const u=user();if(!u)return;const st=state(),now=Date.now();if(Number(st.nextAt||0)>now){updateHeader();return}u.balance=Math.max(0,Number(u.balance)||0)+REWARD;u.stats=u.stats||{opened:0,upgrades:0,spent:0,received:0};u.stats.received=(Number(u.stats.received)||0)+REWARD;const a=readUsers(),i=a.findIndex(x=>x?.email===u.email);if(i>=0){a[i]=u;writeUsers(a)}saveState({lastAt:now,nextAt:now+COOLDOWN});updateHeader()}
function start(){normalizeNewAccount();updateHeader();document.addEventListener('click',claim,true);setInterval(updateHeader,1000);new MutationObserver(()=>{normalizeNewAccount();updateHeader()}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.__emojiDropsSocialEconomy={version:1,startBalance:START_BALANCE,reward:REWARD,cooldownMs:COOLDOWN};
})();

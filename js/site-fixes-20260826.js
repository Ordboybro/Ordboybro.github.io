/* EmojiDrops final functional/UI fixes — 2026-08-26 */
(() => {
  'use strict';
  const money = value => { const n=Number(String(value??0).replace(/[^0-9.-]/g,'')); return Number.isFinite(n)?Math.round(n):0; };
  const state=()=>window.state;
  function normalizeMoney(){const s=state();if(!s)return 0;if(s.currentUser){s.currentUser.balance=money(s.currentUser.balance);s.balance=s.currentUser.balance}else s.balance=money(s.balance);return s.balance;}
  function patchBalanceUI(){const original=window.updateBalanceUI;if(typeof original!=='function'||original.__edMoneyPatch)return false;const wrapped=function(){const b=normalizeMoney();const top=document.getElementById('balance'),profile=document.getElementById('profileBalance');if(top)top.textContent=String(b);if(profile)profile.textContent=String(b);};wrapped.__edMoneyPatch=true;window.updateBalanceUI=wrapped;wrapped();return true;}
  function patchLiveDrop(){const original=window.addLiveDrop;if(typeof original!=='function'||original.__edOwnLivePatch)return false;const wrapped=function(username,item){original.apply(this,arguments);const c=document.getElementById('liveContainer');const card=c?.firstElementChild;if(card){card.classList.add('ed-real-drop');if(state()?.currentUser?.nickname===username)card.classList.add('own');}};wrapped.__edOwnLivePatch=true;window.addLiveDrop=wrapped;return true;}
  function markOwn(){const username=state()?.currentUser?.nickname;if(!username)return;document.querySelectorAll('#liveContainer > *').forEach(card=>{const user=card.querySelector('.live-user,.drop-user')?.textContent?.trim()||'';if(user===username||user.startsWith(username+' '))card.classList.add('live-drop','own');});}
  function refresh(){window.renderPersistedBestDrop?.();window.updateStatsUI?.();}
  function init(){patchBalanceUI();patchLiveDrop();normalizeMoney();const b=money(state()?.balance),top=document.getElementById('balance'),profile=document.getElementById('profileBalance');if(top)top.textContent=String(b);if(profile)profile.textContent=String(b);markOwn();refresh();}
  const timer=setInterval(()=>{init();if(state()?.currentUser&&typeof window.addLiveDrop==='function')clearInterval(timer);},250);setTimeout(()=>clearInterval(timer),8000);
  document.addEventListener('click',()=>setTimeout(()=>{markOwn();refresh();},0));
})();
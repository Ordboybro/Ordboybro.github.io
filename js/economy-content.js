(()=>{'use strict';
/* Emoji Drops — canonical economy data. This layer intentionally runs after gameplay layers. */
const PRICE={transport:25,animals:40,food:60,nature:85,moves:110,smile:140,sport:180,games:230,space:290,ocean:360,flags:420};
const NAME={transport:'Транспорт',animals:'Животные',food:'Еда',nature:'Природа',moves:'Движения',smile:'Улыбки',sport:'Спорт',games:'Игры',space:'Космос',ocean:'Океан',flags:'Флаги'};
const ICON={transport:'🚗',animals:'🐶',food:'🍔',nature:'🌿',moves:'🕺',smile:'😀',sport:'⚽',games:'🎮',space:'🌌',ocean:'🌊',flags:'🌍'};
const RANK=['common','common','common','common','common','common','common','common','common','common','common','common','common','common','rare','rare','rare','rare','rare','rare','rare','rare','rare','epic','epic','epic','epic','epic','epic','mythical','mythical','mythical','mythical','legendary','legendary'];
const MULT={common:.28,rare:.62,epic:1.18,mythical:2.35,legendary:4.8};
const POOL={
transport:['🚲','🛴','🏍️','🚕','🚓','🚑','🚒','🚌','🚚','🚛','🚜','🚁','✈️','🚀','⛵','🚤','🚇','🚆','🚄','🚅','🚝','🚞','🚃','🚋','🚊','🚉','🛵','🚙','🚘','🚖','🚍','🚔','🚂'],
animals:['🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦆','🦅','🦉','🐺','🐗','🐴','🦄','🐝','🦋','🐞','🐢','🐍','🦎','🐊','🐘','🦒','🦓','🦍'],
food:['🥐','🥨','🥯','🥞','🧇','🍳','🥓','🌮','🌯','🥗','🍜','🍝','🍛','🍲','🍱','🥟','🍙','🍚','🍥','🍡','🍧','🍨','🍦','🥧','🥖','🧀','🥩','🍗','🍖','🍣','🥘','🍮','🍯','🧁','🍰'],
nature:['🌳','🌲','🌴','🌵','🌱','🌿','🍀','🍁','🍂','🍃','🌸','🌺','🌻','🌹','🌷','🌼','🌾','🍄','🌊','🌋','🌈','☀️','🌤️','⛅','🌧️','⛈️','🌩️','❄️','☃️','🌙','⭐','🌍','🪨','🪻'],
moves:['🤸','🏋️','🤾','🚴','🧘','🤺','🤼','🤽','🤹','🦸','🦹','🕴️','💃','🕺','🏃','🚶','🧎','🙋','🙆','🙅','🤷','👏','🙌','🤝','✌️','🤞','🤟','👋','👍','👎','🙏','💪','🫶','🧗','🏄'],
smile:['🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😎','🤓','🥳','😏','🤗','🤭','🤔','😌','😐','😑','😒','😞','😓','😩','😱','😭','😖','🤯','🤢','🤧','🥵','🥶','😈','👻','🤖'],
sport:['🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🏑','🥍','🏏','⛳','🏹','🥊','🥋','⛸️','🎿','🛷','🥌','🏋️','🤼','🤸','🏊','🤽','🚣','🧗','🚵','🚴','🏇'],
games:['🕹️','🎲','♟️','🎯','🎮','🧩','🃏','🎴','🎰','👾','🪀','🪁','🎳','🎸','🎧','🖥️','⌨️','🖱️','💾','📀','🏆','💎'],
space:['🌌','🪐','🌙','⭐','🌠','☄️','🛰️','🔭','🚀','🛸','👾','🌟','✨','💫','🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌖','🌗','🌘','🌕','👽'],
ocean:['🌊','🐚','🪸','🐠','🐟','🦀','🦐','🐡','🐬','🦑','🪼','🐙','🦞','🐢','🦈','🐳','🐋','⚓','🏝️','🤿','🔱','🧜','🧜‍♂️','🧜‍♀️','🫧'],
flags:['🇷🇺','🇺🇸','🇬🇧','🇩🇪','🇫🇷','🇮🇹','🇪🇸','🇯🇵','🇨🇦','🇦🇺','🇧🇷','🇰🇷','🇮🇳','🇳🇴','🇨🇭','🇸🇪','🇦🇷','🇮🇸','🇳🇿','🇬🇷','🇵🇹','🇳🇱','🇫🇮','🇩🇰','🇵🇱','🇨🇿','🇹🇷','🇲🇽','🇿🇦','🇪🇬','🇹🇭','🇸🇬','🇦🇪','🇵🇭','🇻🇳','🇺🇦']};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function money(n){return `${Math.round(Number(n)||0)}₽`}
function build(key){if(typeof cases==='undefined')return;const pool=POOL[key]||POOL.space;const arr=cases[key]||[];for(let i=arr.length;i<35;i++)arr.push({emoji:pool[i%pool.length],rarity:RANK[i]||'common',caseId:key});cases[key]=arr.slice(0,35);cases[key].forEach((x,i)=>{x.caseId=key;x.rarity=RANK[i]||x.rarity||'common';x.emoji=x.emoji||pool[i%pool.length]})}
function apply(){if(typeof cases==='undefined'||typeof casePrices==='undefined')return;for(const key of Object.keys(PRICE)){build(key);casePrices[key]=PRICE[key];for(const [i,item] of cases[key].entries()){const rarity=item.rarity||'common';const m=MULT[rarity]||MULT.common;const spread=.92+(Math.min(i,34)/34)*.16;item.value=Math.max(1,Math.round(PRICE[key]*m*spread));item.price=money(item.value);item.caseId=key}}
const g=$('#cases');if(g)$$('.case-card',g).forEach(b=>{const k=b.dataset.case;if(!PRICE[k])return;const n=$('.case-name',b),m=$('.case-meta',b),p=$('.case-price span',b),a=$('.case-art',b);if(n)n.textContent=NAME[k];if(m)m.textContent=`${cases[k].length} предметов`;if(p)p.textContent=money(PRICE[k]);if(a)a.textContent=ICON[k]||a.textContent});document.documentElement.dataset.economy='canonical-v3'}
function normalizeUser(u){if(!u)return;u.balance=Number.isFinite(Number(u.balance))?Math.max(0,Math.round(Number(u.balance))):250;u.inventory=Array.isArray(u.inventory)?u.inventory:[];u.stats=u.stats||{};for(const k of ['opened','upgrades','spent','received'])u.stats[k]=Math.max(0,Number(u.stats[k])||0);u.rewardState=u.rewardState||{uses:0,resetAt:0};u.bestDrop=u.bestDrop||null}
function guardUpgrade(){const root=document;root.addEventListener('click',e=>{const target=e.target.closest('.upgrade-submit');if(!target)return;const selected=($('.upgrade-item.selected')||$('.upgrade-item[data-selected="true"]'));const targetItem=($('.upgrade-target.selected')||$('.upgrade-target[data-selected="true"]'));if(!selected||!targetItem)return;const sv=Number(selected.dataset.value||selected.querySelector('[data-value]')?.dataset.value||0);const tv=Number(targetItem.dataset.value||targetItem.querySelector('[data-value]')?.dataset.value||0);if(!(sv>0&&tv>0)||tv<=sv){e.preventDefault();e.stopImmediatePropagation();target.disabled=true;setTimeout(()=>target.disabled=false,500);return}const mult=Number(document.querySelector('.upgrade-mult.active')?.dataset.mult||2);const chance=Math.min(0.95,Math.max(.01,(sv*mult)/tv));const out=$('.upgrade-chance');if(out)out.textContent=`Шанс: ${Math.round(chance*100)}%`},{capture:true})}
function boot(){apply();guardUpgrade();setTimeout(apply,500);setTimeout(apply,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

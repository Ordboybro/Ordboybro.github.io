(()=>{'use strict';
/* Canonical content/economy + motion polish. Does not replace the gameplay runtime. */
const ED_ECONOMY={smile:35,moves:50,nature:65,food:80,animals:95,transport:120,sport:165,games:225,space:145,ocean:190};
const ED_SPACE=['🌌','🪐','🌙','⭐','🌠','☄️','🛰️','🔭','🚀','🛸','👾','🌟','✨','💫','🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌖','🌗','🌘','🌕','👽','🛰️','☄️','🚀','🌌','💫','🌟','🪐','🌠','👾'];
const ED_OCEAN=['🐚','🪸','🐠','🐟','🦀','🦐','🐡','🐬','🦑','🪼','🐙','🦞','🐢','🌴','🦈','🐳','🐋','🌊','⚓','🏝️','🤿','🔱','🧜','🧜‍♂️','🧜‍♀️','🫧','🐠','🐬','🦑','🐙','🦈','🐳','🔱','🌊','🪼'];
const ED_R=['common','common','common','common','common','common','common','rare','rare','rare','rare','rare','rare','rare','epic','epic','epic','epic','epic','epic','epic','mythical','mythical','mythical','mythical','mythical','mythical','rare','rare','epic','epic','mythical','mythical','legendary','legendary'];
function edBuild(pool){return pool.map((emoji,i)=>({emoji,rarity:ED_R[i]||'common',price:'0₽'}))}
try{if(typeof cases==='object'&&typeof casePrices==='object'){Object.assign(casePrices,ED_ECONOMY);cases.space=edBuild(ED_SPACE);cases.ocean=edBuild(ED_OCEAN)}}catch(e){console.warn('Emoji Drops content extension:',e)}
setTimeout(()=>{try{if(typeof casePrices==='object')Object.assign(casePrices,ED_ECONOMY)}catch(e){}},0);
const style=document.createElement('style');style.id='ed-final-runtime';style.textContent=`
:root{--ed-ease:cubic-bezier(.22,1,.36,1);--ed-fast:180ms;--ed-med:280ms;--ed-slow:420ms}
.logo{display:flex!important;align-items:center!important;gap:11px!important;white-space:nowrap}.logo>span{display:inline-flex!important;align-items:center!important}
.ed-dot{background:#ff3b30!important;color:#ff3b30!important;animation:edPulse 1.15s ease-in-out infinite}
.case-card{transition:transform var(--ed-med) var(--ed-ease),border-color var(--ed-med) ease,box-shadow var(--ed-med) ease}
.case-card:hover{transform:translateY(-4px)}
.primary,.secondary,.profile-btn,.reel-fast,.amount,.upgrade-mult,.inventory-item button,.close,.profile-top{transition:transform var(--ed-fast) var(--ed-ease),background-color var(--ed-fast) ease,border-color var(--ed-fast) ease,box-shadow var(--ed-fast) ease}
.primary:hover,.secondary:hover,.profile-btn:hover,.reel-fast:hover,.amount:hover,.upgrade-mult:hover,.inventory-item button:hover{transform:translateY(-2px)}
.primary:active,.secondary:active,.profile-btn:active,.reel-fast:active,.amount:active,.upgrade-mult:active,.inventory-item button:active{transform:scale(.98)}
.panel{animation:edPanelIn var(--ed-med) var(--ed-ease)}
.live-drop{animation:edLiveIn .42s var(--ed-ease) both}
.inventory-item{transition:transform var(--ed-med) var(--ed-ease),border-color var(--ed-med) ease,box-shadow var(--ed-med) ease}.inventory-item:hover{transform:translateY(-3px)}
.best{transition:transform var(--ed-med) var(--ed-ease),box-shadow var(--ed-med) ease}.best:hover{transform:translateY(-2px);box-shadow:0 12px 30px #0006}
.case-reel{contain:layout paint}.case-reel-track{will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.upgrade-wheel{will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden}
@keyframes edPulse{0%,100%{opacity:.45;transform:scale(.86)}50%{opacity:1;transform:scale(1);box-shadow:0 0 16px #ff3b30}}
@keyframes edPanelIn{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@keyframes edLiveIn{from{opacity:0;transform:translateX(-24px) scale(.97)}to{opacity:1;transform:none}}
@media(min-width:1200px){main{max-width:min(1720px,calc(100vw - 80px))!important}.cases{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:24px!important}}
@media(min-width:1900px){main{max-width:min(2200px,calc(100vw - 120px))!important}.cases{gap:28px!important}.case-tile .case-card{height:350px!important;min-height:350px!important}}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}.case-tile .case-card{height:290px!important;min-height:290px!important}}
@media(max-width:600px){.cases{grid-template-columns:1fr!important;gap:14px!important}.case-tile .case-card{height:245px!important;min-height:245px!important}.panel{width:100%!important;max-width:100%!important}.reel-actions{display:grid!important;grid-template-columns:1fr 1fr!important}.reel-actions button{width:100%!important;min-width:0!important}.profile-layout>.profile-side:last-child{transform:none!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;document.head.appendChild(style);
window.ED_CASE_META=Object.assign(window.ED_CASE_META||{},{space:{name:'Космос',icon:'🌌'},ocean:{name:'Океан',icon:'🌊'}});
})();
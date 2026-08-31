(()=>{'use strict';
/* Canonical content/economy + motion polish. Does not replace the gameplay runtime. */
const ED_ECONOMY={smile:35,moves:50,nature:65,food:80,animals:95,transport:120,sport:165,games:225,space:145,ocean:190};
const ED_SPACE=['🌌','🪐','🌙','⭐','🌠','☄️','🛰️','🔭','🚀','🛸','👾','🌟','✨','💫','🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌖','🌗','🌘','🌕','👽','🛰️','☄️','🚀','🌌','💫','🌟','🪐','🌠','👾'];
const ED_OCEAN=['🐚','🪸','🐠','🐟','🦀','🦐','🐡','🐬','🦑','🪼','🐙','🦞','🐢','🌴','🦈','🐳','🐋','🌊','⚓','🏝️','🤿','🔱','🧜','🧜‍♂️','🧜‍♀️','🫧','🐠','🐬','🦑','🐙','🦈','🐳','🔱','🌊','🪼'];
const ED_R=['common','common','common','common','common','common','common','rare','rare','rare','rare','rare','rare','rare','epic','epic','epic','epic','epic','epic','epic','mythical','mythical','mythical','mythical','mythical','mythical','rare','rare','epic','epic','mythical','mythical','legendary','legendary'];
function edBuild(pool){return pool.map((emoji,i)=>({emoji,rarity:ED_R[i]||'common',price:'0₽'}))}
function edRemoveUkraineFlag(){
 try{
  if(typeof cases==='object')Object.keys(cases).forEach(k=>{if(Array.isArray(cases[k]))cases[k]=cases[k].filter(i=>i?.emoji!=='🇺🇦')});
 }catch(e){}
 const clean=root=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes)if(n.nodeValue?.includes('🇺🇦'))n.nodeValue=n.nodeValue.replaceAll('🇺🇦','');};
 clean(document.body);
}
try{if(typeof cases==='object'&&typeof casePrices==='object'){Object.assign(casePrices,ED_ECONOMY);cases.space=edBuild(ED_SPACE);cases.ocean=edBuild(ED_OCEAN)}}catch(e){console.warn('Emoji Drops content extension:',e)}
setTimeout(()=>{try{if(typeof casePrices==='object')Object.assign(casePrices,ED_ECONOMY)}catch(e){};edRemoveUkraineFlag()},0);
const style=document.createElement('style');style.id='ed-final-runtime';style.textContent=`
:root{--ed-ease:cubic-bezier(.22,1,.36,1);--ed-fast:180ms;--ed-med:280ms;--ed-slow:420ms}
html{min-width:320px;scroll-behavior:smooth}body{min-width:320px;-webkit-text-size-adjust:100%;text-rendering:optimizeLegibility}
button,.primary,.secondary,.profile-btn,.reel-fast,.amount,.upgrade-mult,.inventory-item button,.close,.profile-top{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.logo{display:flex!important;align-items:center!important;gap:11px!important;white-space:nowrap}.logo>span{display:inline-flex!important;align-items:center!important}
.ed-dot{background:#ff3b30!important;color:#ff3b30!important;animation:edPulse 1.15s ease-in-out infinite}
.case-card{transition:transform var(--ed-med) var(--ed-ease),border-color var(--ed-med) ease,box-shadow var(--ed-med) ease}
.case-card:hover{transform:translateY(-4px)}
.primary,.secondary,.profile-btn,.reel-fast,.amount,.upgrade-mult,.inventory-item button,.close,.profile-top{transition:transform var(--ed-fast) var(--ed-ease),background-color var(--ed-fast) ease,border-color var(--ed-fast) ease,box-shadow var(--ed-fast) ease}
.primary:hover,.secondary:hover,.profile-btn:hover,.reel-fast:hover,.amount:hover,.upgrade-mult:hover,.inventory-item button:hover,.profile-top:hover,.close:hover{transform:translateY(-2px)}
.primary:active,.secondary:active,.profile-btn:active,.reel-fast:active,.amount:active,.upgrade-mult:active,.inventory-item button:active,.profile-top:active,.close:active{transform:scale(.98)}
.panel{animation:edPanelIn var(--ed-med) var(--ed-ease);overscroll-behavior:contain}
.live-drop{animation:edLiveIn .42s var(--ed-ease) both}
.inventory-item{transition:transform var(--ed-med) var(--ed-ease),border-color var(--ed-med) ease,box-shadow var(--ed-med) ease}.inventory-item:hover{transform:translateY(-3px)}
.best{transition:transform var(--ed-med) var(--ed-ease),box-shadow var(--ed-med) ease}.best:hover{transform:translateY(-2px);box-shadow:0 12px 30px #0006}
.case-reel{contain:layout paint}.case-reel-track{will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.upgrade-wheel{will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.profile-layout{min-width:0}.profile-center,.profile-side,.profile-dashboard,.profile-stat,.best-wrap,.inventory{min-width:0}.profile-name{overflow-wrap:anywhere}
.stats,.profile-dashboard{min-width:0}.stat,.profile-stat{overflow:hidden}
@keyframes edPulse{0%,100%{opacity:.45;transform:scale(.86)}50%{opacity:1;transform:scale(1);box-shadow:0 0 16px #ff3b30}}
@keyframes edPanelIn{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
@keyframes edLiveIn{from{opacity:0;transform:translateX(-24px) scale(.97)}to{opacity:1;transform:none}}
@media(min-width:1200px){main{width:100%;max-width:min(1720px,calc(100vw - 80px))!important}.cases{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:24px!important}.case-tile .case-card{height:320px!important;min-height:320px!important}}
@media(min-width:1600px){main{max-width:min(1880px,calc(100vw - 96px))!important}.cases{gap:26px!important}.case-tile .case-card{height:340px!important;min-height:340px!important}}
@media(min-width:2200px){main{max-width:min(2200px,calc(100vw - 140px))!important}.cases{gap:30px!important}.case-tile .case-card{height:360px!important;min-height:360px!important}.case-art{font-size:94px!important}}
@media(max-width:1199px) and (min-width:701px){main{width:100%;max-width:1100px!important;padding-left:24px!important;padding-right:24px!important}.cases{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:18px!important}.case-tile .case-card{height:285px!important;min-height:285px!important}.case-art{font-size:72px!important}.profile-layout{grid-template-columns:1fr 1.2fr 1fr!important}}
@media(max-width:700px){
 html,body{width:100%;max-width:100%;overflow-x:hidden}
 header{height:68px!important;padding:0 max(12px,env(safe-area-inset-left)) 0 max(12px,env(safe-area-inset-right))!important;gap:8px}
 .top-right{gap:7px!important;min-width:0}.top-pill{display:none}.balance-menu .top-pill{display:flex!important;padding:9px 10px!important}.balance-pill{min-width:76px!important}
 .profile-top{display:block!important;padding:9px 10px!important;max-width:min(150px,34vw);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .logo{gap:7px!important;font-size:20px!important;min-width:0}.logo>span{min-width:0}.ed-logo{width:32px!important;height:32px!important;flex-basis:32px!important}.logo b{font-size:inherit}
 main{width:100%!important;max-width:none!important;margin:0!important;padding:18px 14px max(60px,env(safe-area-inset-bottom))!important}
 .hero{display:block!important;margin-bottom:12px!important}.hero h1{font-size:clamp(27px,8vw,34px)!important;line-height:1.08!important}
 .cases{grid-template-columns:1fr!important;gap:14px!important}.case-tile{min-width:0!important}.case-tile .case-card{height:auto!important;min-height:235px!important;width:100%!important;border-radius:20px!important;padding:16px 14px!important}.case-art{height:118px!important;font-size:70px!important}.case-name{font-size:21px!important}.case-meta{font-size:13px!important}.case-price span{font-size:20px!important}
 .live-section{margin-top:20px!important}.live-container{overflow-x:auto!important;scrollbar-width:none!important;padding-bottom:8px}.live-container::-webkit-scrollbar{display:none}.live-drop{flex-basis:155px!important;min-width:155px!important}
 .modal{padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom))!important}.panel{width:100%!important;max-width:100%!important;max-height:calc(100dvh - 20px)!important;border-radius:22px!important}.panel-head{padding:16px 17px!important}.panel-body{padding:17px!important}
 .amounts{gap:7px!important;margin:13px 0!important}.amount{width:40px!important;height:40px!important}.reel-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}.reel-actions button{width:100%!important;min-width:0!important;min-height:50px!important}.case-reel{height:108px!important}.reel-item{flex-basis:78px!important;height:80px!important}
 .profile-layout{grid-template-columns:1fr!important;gap:10px!important}.profile-center{padding:21px 16px!important;order:1}.profile-layout>.profile-side:first-child{order:2}.profile-layout>.profile-side:last-child{order:3}.profile-side{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}.profile-btn{min-height:50px!important;padding:0 9px!important}.profile-dashboard{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin-top:16px!important}.profile-stat{padding:11px 6px!important;text-align:center!important}.profile-stat small{font-size:9px!important;line-height:1.15!important}.profile-stat b{font-size:17px!important}.best-wrap{margin-top:22px!important}.best{width:100%!important;min-height:72px!important}.inventory{margin-top:25px!important}.inventory .section-title{font-size:17px!important}.inventory-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.inventory-item{padding:11px!important}.inv-emoji{font-size:43px!important}
 .upgrade-runtime{grid-template-columns:1fr!important;gap:12px!important}.upgrade-wheel-col{order:2!important;padding-top:8px!important}.upgrade-runtime .source{order:1!important}.upgrade-runtime .target{order:3!important}.upgrade-submit{order:4!important}.upgrade-wheel-wrap{width:174px!important;height:174px!important}.upgrade-wheel{width:164px!important;height:164px!important}.wheel-label{font-size:14px!important}.upgrade-items{max-height:200px!important}
 .settings-list .setting{flex-direction:column!important;align-items:stretch!important;gap:8px!important}.settings-list .setting input{width:100%!important}.stats{grid-template-columns:1fr 1fr!important}.stat{padding:15px!important}.stat b{font-size:23px!important}
}
@media(max-width:380px){header{padding-left:9px!important;padding-right:9px!important}.logo{font-size:18px!important;gap:5px!important}.ed-logo{width:29px!important;height:29px!important;flex-basis:29px!important}.profile-top{max-width:116px!important}.profile-dashboard{gap:5px!important}.profile-stat{padding:10px 4px!important}.profile-stat b{font-size:15px!important}.profile-stat small{font-size:8px!important}.profile-btn{font-size:13px!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;document.head.appendChild(style);
window.ED_CASE_META=Object.assign(window.ED_CASE_META||{},{space:{name:'Космос',icon:'🌌'},ocean:{name:'Океан',icon:'🌊'}});
if(typeof MutationObserver!=='undefined')new MutationObserver(()=>edRemoveUkraineFlag()).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
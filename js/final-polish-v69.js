(()=>{'use strict';
const V='20260902-69';
if(window.__ed69)return;window.__ed69=true;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const style=document.createElement('style');style.id='ed69-style';style.textContent=`
/* v69: final visual/runtime layer */
html.ed69,html.ed69 body{overflow-x:hidden!important}body.ed-runtime{overscroll-behavior-x:none}
/* Do not let legacy iOS rules win over the current mobile layout. */
@media(max-width:700px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}.case-tile .case-card{height:245px!important;min-height:245px!important}.case-art{font-size:64px!important}}
@media(max-width:380px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.case-tile .case-card{height:225px!important;min-height:225px!important}.case-art{font-size:56px!important}}
/* Smooth but bounded motion; transforms stay on the compositor. */
.case-card,.profile-btn,.profile-top,.primary,.secondary,.amount,.close,.inventory-item,.live-drop,.upgrade-item,.ed67-item,.ed67-go,.ed67-mults button,.ed67-sellall{transition:transform .18s cubic-bezier(.22,1,.36,1),filter .18s ease,box-shadow .18s ease,border-color .18s ease,background-color .18s ease!important;touch-action:manipulation}
.case-card{contain:layout paint;transform:translateZ(0)}
.case-card:active,.profile-btn:active,.profile-top:active,.primary:active,.secondary:active,.amount:active,.close:active,.inventory-item:active,.ed67-item:active,.ed67-go:active,.ed67-mults button:active,.ed67-sellall:active{transform:scale(.975)!important}
.case-reel-track,.ed67-wheel,.upgrade-wheel{backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform;transform:translateZ(0)}
.case-reel{contain:layout paint;overflow:hidden!important}.case-reel-track{overflow:visible!important}
/* Results from 10 openings remain inside the modal instead of expanding the page. */
.win-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(82px,1fr))!important;gap:9px!important;max-height:min(48vh,420px)!important;overflow:auto!important;padding:2px!important;overscroll-behavior:contain}
.win-item{min-width:0!important;overflow:hidden!important;border-radius:14px!important;padding:10px 6px!important;text-align:center!important;background:#171717!important;border:1px solid #303030!important;contain:content}
.win-item strong{display:block!important;font-size:36px!important;line-height:1.1!important}.win-item b,.win-item small{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis}
/* Current build proof, intentionally tiny and non-interactive. */
.ed69-build{position:fixed!important;right:7px!important;bottom:7px!important;z-index:2147483000!important;pointer-events:none!important;opacity:.18!important;font:700 8px/1 system-ui!important;color:#aaa!important}
@media(prefers-reduced-motion:reduce){.case-card,.profile-btn,.profile-top,.primary,.secondary,.amount,.close,.inventory-item,.live-drop,.upgrade-item,.ed67-item,.ed67-go,.ed67-mults button,.ed67-sellall{transition:none!important}.ed69-build{display:none!important}}
`;
document.head.appendChild(style);document.documentElement.classList.add('ed69');
function cleanup(){
 document.documentElement.classList.remove('ed-ios');
 $$('.upgrade-v2-wheel,.upgrade-wheel-shell,.ed-upgrade-stage').forEach(x=>x.remove());
 const g=$('#cases,.cases');if(g){g.style.display='grid';g.style.gridTemplateColumns=innerWidth<=700?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))';g.style.gap=innerWidth<=700?'12px':'18px'}
 const live=$('.live-section');if(live){live.style.position='relative';live.style.inset='auto';live.style.width='100%';live.style.overflow='hidden'}
 let badge=$('.ed69-build');if(!badge){badge=document.createElement('div');badge.className='ed69-build';badge.textContent=V;document.body.appendChild(badge)}
}
function guardButtons(){if(window.__ed69ButtonGuard)return;window.__ed69ButtonGuard=true;document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.disabled){e.preventDefault();e.stopPropagation();return}},true)}
function boot(){cleanup();guardButtons();let t=0;const rerun=()=>{clearTimeout(t);t=setTimeout(cleanup,120)};new MutationObserver(m=>{if(m.some(x=>x.type==='childList'))rerun()}).observe(document.body,{childList:true,subtree:true});addEventListener('resize',rerun,{passive:true});addEventListener('pageshow',rerun,{passive:true});console.info('[Emoji Drops]',V,'ACTIVE — final layer')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

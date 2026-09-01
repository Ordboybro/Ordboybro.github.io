(()=>{'use strict';
/* Emoji Drops — final cleanup layer. Removes legacy UI conflicts instead of stacking another renderer. */
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const css=document.createElement('style');css.id='ed-final-v3-style';css.textContent=`
html,body{width:100%;max-width:100%;overflow-x:hidden}
main{width:100%!important;max-width:none!important;box-sizing:border-box!important}
.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.3vw,24px)!important;margin-left:0!important;margin-right:0!important}
.case-tile{min-width:0!important;width:auto!important}.case-tile .case-card{width:100%!important;min-width:0!important;box-sizing:border-box!important}
.ed-ios .cases{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.3vw,24px)!important}.ed-ios main{width:100%!important;max-width:none!important;padding-left:clamp(12px,2vw,36px)!important;padding-right:clamp(12px,2vw,36px)!important}
.live-section{left:clamp(12px,2vw,36px)!important;right:0!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important}.live-section .live-container,.live-section .live-track{width:100%!important;max-width:none!important;margin-right:0!important}
.home-divider,.ed-home-divider{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;top:-4px!important;height:2px!important;width:100%!important;background:#ff7b00!important;box-shadow:0 0 14px rgba(255,123,0,.2)!important}
.best-wrap .best button,.best-wrap .best .remove-all,.best-wrap .best [data-action*=remove],.best-wrap .best [data-action*=clear]{display:none!important}.best-wrap .best{overflow:visible!important}
/* exactly one upgrade wheel: the v2 wheel wins; legacy wheel is hidden only when v2 exists */
.upgrade-v2-wheel~.upgrade-v2-wheel{display:none!important}.upgrade-runtime>.upgrade-wheel-col>.upgrade-wheel:has(+.upgrade-v2-wheel){display:none!important}
.case-reel-track,.reel-track{backface-visibility:hidden;-webkit-backface-visibility:hidden;will-change:transform}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:600px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.case-tile .case-card{min-height:220px!important}.live-section{left:12px!important;right:0!important}.upgrade-v2-wheel{width:min(310px,86vw)!important}.upgrade-v2-face{width:100%!important;height:100%!important}.upgrade-v2-pointer{transform-origin:50% 88%!important}}
@media(max-width:360px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}.case-tile .case-card{min-height:205px!important}}
@media(prefers-reduced-motion:reduce){.case-card,.upgrade-v2-pointer{animation:none!important;transition-duration:.001ms!important}}
`;
document.head.appendChild(css);
function cleanup(){
 // If old and new wheels coexist, keep the first v2 wheel and remove all later duplicates.
 const wheels=qa('.upgrade-v2-wheel');wheels.slice(1).forEach(x=>x.remove());
 if(wheels.length){qa('.upgrade-runtime .upgrade-wheel').forEach(x=>x.remove());}
 // Never allow the legacy iOS one-column rule to win.
 qa('.ed-ios .cases').forEach(x=>x.style.setProperty('grid-template-columns','repeat(4,minmax(0,1fr))','important'));
 // Keep best-drop controls clean.
 qa('.best-wrap .best button,.best-wrap .best .remove-all').forEach(x=>x.remove());
}
function bind(){cleanup();window.addEventListener('resize',cleanup,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)cleanup()},{passive:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
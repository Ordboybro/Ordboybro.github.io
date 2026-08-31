(()=>{'use strict';
const STYLE_ID='emoji-drops-master-polish';
function apply(){let s=document.getElementById(STYLE_ID);if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}s.textContent=`
/* SINGLE AUTHORITATIVE HOME LAYOUT */
html,body{width:100%!important;min-width:0!important;overflow-x:hidden!important}
main{width:100%!important;max-width:none!important;margin:0!important;padding:16px clamp(10px,2.4vw,40px) 132px!important}
.hero{display:none!important}
.home-divider{display:block!important;width:100%!important;height:2px!important;margin:0 0 18px!important;background:linear-gradient(90deg,transparent,#ff7b00 8%,#ff9a2e 50%,#ff7b00 92%,transparent)!important;box-shadow:0 0 14px #ff7b0040!important}
#cases,.cases{width:100%!important;max-width:none!important;margin:0!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.25vw,20px)!important}
#cases .case-tile{width:100%!important;min-width:0!important;margin:0!important}
#cases .case-card{width:100%!important;min-width:0!important;height:clamp(220px,16vw,300px)!important;min-height:220px!important;padding:clamp(12px,1.4vw,20px)!important;border-radius:clamp(16px,1.4vw,24px)!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;transform:translateZ(0);contain:layout paint style;backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease!important}
#cases .case-card:hover{transform:translate3d(0,-4px,0)!important}
#cases .case-art{width:100%!important;height:clamp(76px,7vw,105px)!important;min-height:76px!important;flex:0 0 clamp(76px,7vw,105px)!important;font-size:clamp(54px,5.2vw,82px)!important;display:grid!important;place-items:center!important}
#cases .case-info{width:100%!important;min-width:0!important;flex:1!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important}
#cases .case-name{font-size:clamp(15px,1.35vw,22px)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:100%!important}
#cases .case-meta{font-size:clamp(10px,1vw,15px)!important}
#cases .case-price span{font-size:clamp(16px,1.3vw,21px)!important}
.live-section{position:fixed!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;max-width:none!important;margin:0!important;padding:7px clamp(10px,2.4vw,40px) calc(7px + env(safe-area-inset-bottom))!important;z-index:9999!important}
.live-title,.live-container{width:100%!important;max-width:none!important}
.live-container{display:flex!important;gap:10px!important;overflow-x:auto!important;scrollbar-width:none!important}
.live-container::-webkit-scrollbar{display:none}
/* cheap motion: transform/opacity only */
.case-card,.primary,.secondary,.profile-btn,.upgrade-item,.upgrade-target,.amount,.live-drop{transition:transform .18s ease,opacity .18s ease,border-color .18s ease,box-shadow .18s ease!important}
.case-card:active,.primary:active,.secondary:active,.profile-btn:active,.upgrade-item:active,.upgrade-target:active{transform:scale(.985)!important}
@media(max-width:1100px){#cases,.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:600px){main{padding-left:8px!important;padding-right:8px!important;padding-bottom:122px!important}#cases,.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}#cases .case-card{height:clamp(185px,48vw,225px)!important;min-height:185px!important;padding:9px!important;border-radius:16px!important}#cases .case-art{height:clamp(58px,17vw,78px)!important;min-height:58px!important;flex-basis:clamp(58px,17vw,78px)!important;font-size:clamp(42px,13vw,58px)!important}#cases .case-name{font-size:clamp(13px,4vw,17px)!important}#cases .case-meta{font-size:10px!important}#cases .case-price span{font-size:16px!important}.live-section{padding-left:8px!important;padding-right:8px!important}}
@media(max-width:380px){main{padding-left:5px!important;padding-right:5px!important}#cases,.cases{gap:6px!important}#cases .case-card{height:185px!important;min-height:185px!important}.home-divider{margin-bottom:12px!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}}
@media(max-width:700px){@media(pointer:coarse){.case-card:hover,.profile-btn:hover{transform:none!important;box-shadow:none!important}}}
`}
function boot(){apply();requestAnimationFrame(apply);window.addEventListener('load',()=>{apply();requestAnimationFrame(apply)},{once:true});const observer=new MutationObserver(()=>{if(!document.getElementById(STYLE_ID))apply()});observer.observe(document.head,{childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
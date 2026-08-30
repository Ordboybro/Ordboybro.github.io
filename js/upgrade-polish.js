(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function style(){if($('#ed-upgrade-polish-v2'))return;const s=document.createElement('style');s.id='ed-upgrade-polish-v2';s.textContent=`
.upgrade-wheel.spinning{animation-duration:2.8s!important;animation-timing-function:cubic-bezier(.08,.72,.08,1)!important;filter:brightness(1.12);box-shadow:0 0 55px #ff7b0055,0 0 0 2px #ff9d3d88!important}
.upgrade-arrow.spinning{animation-duration:2.8s!important;animation-timing-function:cubic-bezier(.08,.72,.08,1)!important}
.case-reel-track{will-change:transform!important}
@media(max-width:520px){.upgrade-wheel{width:128px!important;height:128px!important}.case-reel{height:104px!important}}
@media(prefers-reduced-motion:reduce){.upgrade-wheel.spinning,.upgrade-arrow.spinning{animation-duration:.01ms!important}.case-reel-track{transition-duration:.01ms!important}}
`;document.head.appendChild(s)}
function pace(){for(const track of $$('.case-reel-track')){const t=track.style.transition||'';if(t.includes('3300ms'))track.style.transition=t.replace('3300ms','4200ms')}}
function hook(){const btn=$('#upgradeSubmit')||$('#upgradeDo');if(btn&&!btn.dataset.edAnimHook){btn.dataset.edAnimHook='1';btn.addEventListener('click',()=>{const wheel=$('.upgrade-wheel')||$('.upgrade-arrow');if(!wheel)return;wheel.style.animationDuration='2.8s';wheel.style.animationTimingFunction='cubic-bezier(.08,.72,.08,1)';wheel.classList.remove('spinning');void wheel.offsetWidth;wheel.classList.add('spinning');window.setTimeout(()=>{wheel.classList.remove('spinning');wheel.style.removeProperty('animation-duration');wheel.style.removeProperty('animation-timing-function')},2850)},true)}}
function init(){style();hook();pace();new MutationObserver(()=>{hook();pace()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
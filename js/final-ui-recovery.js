(()=>{'use strict';
/* Emoji Drops — final UI scope fix. Keeps canonical transaction handlers untouched. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function css(){if($('#ed-final-ui-recovery-css'))return;const s=document.createElement('style');s.id='ed-final-ui-recovery-css';s.textContent=`
/* Live Drops belong to the home screen only. */
.live-section{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:0!important;transform:translateX(-50%)!important;width:100%!important;margin:0!important;padding:18px 0 max(10px,env(safe-area-inset-bottom))!important;z-index:35!important;background:linear-gradient(180deg,transparent 0%,rgba(9,9,9,.78) 32%,rgba(9,9,9,.97) 100%)!important;border:0!important;box-shadow:none!important}
.live-section:before{display:none!important}
.live-container{width:min(1240px,calc(100vw - 20px))!important;margin:0 auto!important;background:linear-gradient(180deg,rgba(20,20,20,.92),rgba(10,10,10,.96))!important;border:1px solid #252525!important;border-radius:18px!important;box-shadow:0 12px 35px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.035)!important}
/* Never show Live Drops over a game modal. */
body:has(.modal.show) .live-section{display:none!important}
body:has(.modal.show)::after{display:none!important}
/* Main-page case cards stay clean: name only. */
.case-card .case-price{display:none!important}
.case-card .case-name{display:block!important}
.case-card .case-name::after{content:none!important}
/* The total selected case price is shown in the modal title, not on the card. */
#edOpenModal .panel-head h2{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:700px){.live-section{width:100%!important;padding:14px 0 max(8px,env(safe-area-inset-bottom))!important}.live-container{width:calc(100vw - 12px)!important}.live-drop{flex-basis:150px!important;height:58px!important}}
`;
document.head.appendChild(s)}
function titleForSelectedAmount(){const modal=$('#edOpenModal');const amounts=$('#edAmounts');const title=modal?.querySelector('.panel-head h2');if(!modal||!amounts||!title)return;const active=amounts.querySelector('.amount.active');if(!active)return;const m=title.textContent.match(/^(.+?)\s*·\s*([\d\s]+)₽/);if(!m)return;const base=Number(m[2].replace(/\s/g,''))||0;const amount=Math.max(1,Number(active.textContent)||1);const name=m[1].trim();title.textContent=`${name} · ${base*amount}₽`}
function bind(){css();document.addEventListener('click',e=>{const amount=e.target?.closest?.('#edAmounts .amount');if(amount)setTimeout(titleForSelectedAmount,0)},false);window.__emojiDropsFinalUI={version:3,caseRecovery:false,homeOnlyLive:true,qa:()=>({caseButtons:$$('.case-card[data-ed-case]').length,openButton:!!$('#edOpen'),live:!!$('.live-section'),modalLiveHidden:!!document.querySelector('body:has(.modal.show) .live-section'),online:!!document.querySelector('.online-dot')})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

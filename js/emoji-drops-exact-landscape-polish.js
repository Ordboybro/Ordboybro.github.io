(()=>{'use strict';
/* Emoji Drops — exact modal landscape fit. Keeps the canonical renderer intact while guaranteeing a usable CTA in short viewports. */
const ID='emoji-drops-exact-landscape-polish-v1';
if(window.__emojiDropsExactLandscapePolish===ID)return;
window.__emojiDropsExactLandscapePolish=ID;
const css=`
@media (orientation:landscape) and (max-height:500px){
  #edExact{padding:0;align-items:stretch}
  #edExactBox{width:100vw;height:100dvh;max-height:100dvh;border-radius:0}
  .edx-head{height:56px;min-height:56px}
  .edx-logo{font-size:22px}
  .edx-close{width:40px;height:40px;right:9px;top:8px;font-size:24px}
  .edx-main{padding:0 22px 12px}
  .edx-art{height:132px}
  .edx-art:after{width:280px;height:70px;bottom:8px;filter:blur(22px)}
  .edx-case{width:210px;height:124px;border-width:3px;border-radius:22px 22px 27px 27px}
  .edx-case:before{top:-19px;height:31px;left:18px;right:18px;border-width:3px;border-radius:12px 12px 5px 5px}
  .edx-case:after{top:27px;height:5px}
  .edx-face{width:78px;height:62px;border-width:4px;border-radius:17px;font-size:43px}
  .edx-b{width:21px;height:21px;border-width:3px;border-radius:6px}
  .edx-tl{left:6px;top:14px}.edx-tr{right:6px;top:14px}.edx-bl{left:6px;bottom:7px}.edx-br{right:6px;bottom:7px}
  .edx-lock{width:42px;height:27px;bottom:-12px;border-width:2px;border-radius:7px}
  .edx-lock:after{top:5px;width:8px;height:8px;border-width:2px;box-shadow:0 6px 0 -2px #ffbe53}
  .edx-name{gap:5px;margin-bottom:7px}.edx-name .e{font-size:24px}.edx-name .t{font-size:22px}
  .edx-price{font-size:14px;padding:6px 10px;margin-bottom:8px;border-radius:10px}
  .edx-odds{gap:4px;margin-bottom:8px}.edx-odd{padding:5px 2px;font-size:7px;border-radius:8px}.edx-odd b{font-size:11px;margin-top:1px}
  .edx-reel{height:70px;margin-bottom:8px;border-radius:12px}.edx-reel-card{flex-basis:58px;height:54px;font-size:27px;border-radius:9px}.edx-track{gap:5px;padding:0 7px}
  .edx-open{position:sticky;bottom:0;z-index:15;padding:7px 0 9px;background:linear-gradient(180deg,transparent,#0a0a0a 22% 100%);backdrop-filter:blur(8px)}
  .edx-open button{height:48px;min-height:48px!important;font-size:16px;border-radius:13px}.ed-case>.ed-btn{height:48px;min-height:48px!important}
  .edx-items{padding:10px}.edx-items-title{font-size:14px}.edx-hint{font-size:9px;margin:3px 0 7px}.edx-grid{gap:5px}.edx-item{min-height:72px;padding:6px;border-radius:10px}.edx-item .emoji{font-size:25px}.edx-item .rar,.edx-item .chance,.edx-item .cost{font-size:8px}
}
`;
const install=()=>{if(document.getElementById('ed-exact-landscape-polish'))return;const s=document.createElement('style');s.id='ed-exact-landscape-polish';s.textContent=css;document.head.appendChild(s)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

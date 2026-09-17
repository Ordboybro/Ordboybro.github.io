(()=>{'use strict';
/* Emoji Drops — final Market authority bridge. Removes legacy/demo Market DOM before the v26 owner paints. */
const root=()=>document.getElementById('view-market');
let armed=false;
function clean(){const r=root();if(!r)return;const owner=r.querySelector(':scope > .v26-market');if(owner){[...r.children].forEach(x=>{if(x!==owner)x.remove()});return}if(r.classList.contains('active'))r.replaceChildren()}
function arm(){if(armed)return;armed=true;document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="market"]'))clean()},true);const mo=new MutationObserver(()=>{const r=root();if(!r||!r.classList.contains('active'))return;const owner=r.querySelector(':scope > .v26-market');if(owner)[...r.children].forEach(x=>{if(x!==owner)x.remove()});else if(r.querySelector('[data-buy],.ed-market-card,.ed-shared-market-head'))r.replaceChildren()});mo.observe(document.body,{childList:true,subtree:true});clean()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arm,{once:true});else arm();
window.__emojiDropsMarketAuthorityFinal={version:1};
})();

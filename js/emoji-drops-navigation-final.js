(()=>{'use strict';
const V=['cases','upgrade','market'];
function selector(v){return v==='cases'?'.ed-case':v==='upgrade'?'.ed-upgrade-grid':'.ed-market-card'}
function force(v){const root=document.getElementById('view-'+v),core=window.__emojiDropsCore;if(!root||!core||typeof core.render!=='function')return;try{core.render();document.querySelectorAll('.ed-view').forEach(x=>x.classList.toggle('active',x===root));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.getAttribute('data-view')===v))}catch(err){console.error('Emoji Drops navigation recovery failed',err)}}
function ensure(v){const root=document.getElementById('view-'+v);if(!root||root.querySelector(selector(v)))return;force(v)}
function install(){document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');if(!V.includes(v))return;setTimeout(()=>ensure(v),0);setTimeout(()=>ensure(v),140)},false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.__emojiDropsNavigationFinal={version:3,ready:true,force,ensure};
})();

(()=>{'use strict';
const V=['cases','upgrade','market','inventory','collections','daily','profile'];
function selector(v){return v==='cases'?'.ed-case':v==='upgrade'?'.ed-upgrade-grid':v==='market'?'.ed-market-card':v==='inventory'?'.ed-inventory':v==='profile'?'.ed-profile':'.ed-panel'}
function activate(v){const root=document.getElementById('view-'+v),core=window.__emojiDropsCore;if(!root)return false;try{if(core?.render)core.render();document.querySelectorAll('.ed-view').forEach(x=>x.classList.toggle('active',x===root));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.getAttribute('data-view')===v));return true}catch(err){console.error('Emoji Drops navigation activation failed',err);return false}}
function force(v){if(!activate(v))return;setTimeout(()=>ensure(v),0)}
function ensure(v){const root=document.getElementById('view-'+v);if(!root||root.querySelector(selector(v)))return;activate(v)}
let lastTouch=0,lastView='';
function handle(e){const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');if(!b||!V.includes(v))return;const now=Date.now();if(e.type==='click'&&now-lastTouch<650&&lastView===v)return;if(e.type==='pointerdown'&&e.pointerType==='touch'){e.preventDefault();lastTouch=now;lastView=v;activate(v);setTimeout(()=>ensure(v),0);setTimeout(()=>ensure(v),140);return}if(e.type==='pointerup'){lastTouch=now;lastView=v}activate(v);setTimeout(()=>ensure(v),0);setTimeout(()=>ensure(v),140)}
function install(){document.addEventListener('pointerdown',handle,{capture:true,passive:false});document.addEventListener('pointerup',handle,{capture:true,passive:true});document.addEventListener('click',handle,{capture:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.__emojiDropsNavigationFinal={version:4,ready:true,force,ensure,activate};
})();
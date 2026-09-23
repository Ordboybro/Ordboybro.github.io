(()=>{'use strict';
const V=['cases','upgrade','market','inventory','collections','daily','profile'];
function selector(v){return v==='cases'?'.ed-case':v==='upgrade'?'.ed-upgrade-grid':v==='market'?'.ed-market-card':v==='inventory'?'.ed-inventory':v==='profile'?'.ed-profile':'.ed-panel'}
function activate(v){const root=document.getElementById('view-'+v),core=window.__emojiDropsCore;if(!root)return false;try{document.querySelectorAll('.ed-view').forEach(x=>x.classList.toggle('active',x===root));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.getAttribute('data-view')===v));return true}catch(err){console.error('Emoji Drops navigation activation failed',err);return false}}
function ensure(v,token){if(token!==undefined&&token!==generation)return false;if(v!==lastView)return false;const root=document.getElementById('view-'+v);if(!root||root.querySelector(selector(v)))return false;return activate(v)}
function schedule(v,token,delay){setTimeout(()=>ensure(v,token),delay)}
function force(v){if(!activate(v))return;lastView=v;generation++;const token=generation;schedule(v,token,0)}
let lastTouch=0,lastTouchTarget=null,lastView='',generation=0;
function commit(v){lastView=v;generation++;const token=generation;activate(v);schedule(v,token,0);schedule(v,token,140)}
function handle(e){const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');if(!b||!V.includes(v))return;const now=Date.now();if(e.type==='pointerdown'&&e.pointerType==='touch'){lastTouch=now;lastTouchTarget=b;commit(v);setTimeout(()=>{if(lastTouchTarget===b&&Date.now()-lastTouch>=700)lastTouchTarget=null},720);return}if(e.type==='click'){const syntheticTouch=now-lastTouch<700&&lastTouchTarget&&b===lastTouchTarget;if(syntheticTouch)return;commit(v)}}
function install(){if(!document.getElementById('emoji-drops-navigation-touch-guard')){const s=document.createElement('style');s.id='emoji-drops-navigation-touch-guard';s.textContent='@media (orientation:landscape) and (max-height:500px){.ed-case>.ed-btn{min-height:48px!important}}';document.head.appendChild(s)}document.addEventListener('pointerdown',handle,{capture:true,passive:false});document.addEventListener('click',handle,{capture:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.__emojiDropsNavigationFinal={version:7,ready:true,force,ensure,activate};
})();
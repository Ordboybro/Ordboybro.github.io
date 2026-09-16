(()=>{'use strict';
const V=['cases','upgrade','market'];
function force(v){const root=document.getElementById('view-'+v),core=window.__emojiDropsCore;if(!root||!core||typeof core.render!=='function')return;try{core.render();document.querySelectorAll('.ed-view').forEach(x=>x.classList.toggle('active',x===root));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.getAttribute('data-view')===v));if(v==='cases'&&!root.querySelector('.ed-case'))core.render();}catch(err){console.error('Emoji Drops navigation recovery failed',err)}}
function install(){document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');if(!V.includes(v))return;setTimeout(()=>force(v),0)},false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.__emojiDropsNavigationFinal={version:2,ready:true,force};
})();

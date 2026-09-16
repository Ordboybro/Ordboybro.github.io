(()=>{'use strict';
/* Small UX copy/accessibility polish; does not render or replace component structure. */
const R=()=>{const u=document.getElementById('view-upgrade');if(u){u.querySelectorAll('*').forEach(e=>{if(e.children.length)return;const t=(e.textContent||'').trim();if(t==='0.0% шанс')e.textContent='Выберите цель';if(t==='Цель')e.textContent='Выберите цель'});u.querySelectorAll('button').forEach(b=>{if((b.textContent||'').trim()==='Open')b.textContent='Upgrade'})}
const c=document.getElementById('edExactBox');if(c){c.querySelectorAll('*').forEach(e=>{if(e.children.length)return;const t=(e.textContent||'').trim();if(t==='Case items')e.textContent='Предметы кейса';if(t==='Scroll down to see every item...')e.textContent='Все предметы и их редкость';if(t==='Open case')e.textContent='Открыть кейс'})}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',R,{once:true});else R();
new MutationObserver(R).observe(document.body,{childList:true,subtree:true});
})();

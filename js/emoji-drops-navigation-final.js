(()=>{'use strict';
/* Canonical navigation event owner. Rendering/state lives in emoji-drops-core.view(). */
const V=['cases','upgrade','market','inventory','collections','daily','profile'];
function activate(v){
  if(!V.includes(v))return false;
  const core=window.__emojiDropsCore;
  const root=document.getElementById('view-'+v);
  if(!root||typeof core?.view!=='function')return false;
  try{
    core.view(v);
    return root.classList.contains('active')&&document.querySelector('[data-view="'+v+'"]')?.classList.contains('active');
  }catch(err){console.error('Emoji Drops navigation activation failed',err);return false}
}
let lastPointerTime=0,lastPointerView='',generation=0;
function commit(v,source){
  generation++;
  lastPointerTime=source==='pointer'?Date.now():lastPointerTime;
  lastPointerView=v;
  return activate(v);
}
function handlePointerDown(e){
  if((e.pointerType!=='touch'&&e.pointerType!=='pen'))return;
  const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');
  if(!b||!V.includes(v))return;
  try{if(Number.isFinite(e.pointerId)&&typeof b.setPointerCapture==='function')b.setPointerCapture(e.pointerId)}catch{}
  lastPointerTime=Date.now();
  lastPointerView=v;
}
function handlePointerUp(e){
  if((e.pointerType!=='touch'&&e.pointerType!=='pen'))return;
  const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');
  if(!b||!V.includes(v))return;
  /* Do not activate here: the native click must be allowed to fire on the same stable button. */
}
function handleClick(e){
  const b=e.target?.closest?.('[data-view]'),v=b?.getAttribute('data-view');
  if(!b||!V.includes(v))return;
  const now=Date.now();
  if(lastPointerView===v&&now-lastPointerTime<700)return;
  e.preventDefault();e.stopPropagation();
  commit(v,'click');
}
function force(v){return commit(v,'force')}
function install(){
  document.addEventListener('pointerdown',handlePointerDown,{capture:true,passive:false});
  document.addEventListener('pointerup',handlePointerUp,{capture:true,passive:true});
  document.addEventListener('click',handleClick,{capture:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.__emojiDropsNavigationFinal={version:6,ready:true,force,activate,generation:()=>generation};
})();
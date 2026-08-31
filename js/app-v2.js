(()=>{'use strict';
/* Emoji Drops — single bootstrap. Keep one authoritative gameplay runtime. */
const VERSION='20260831-22';
const scripts=[
  `js/app-v2-core.js?v=${VERSION}`,
  `js/economy-content.js?v=${VERSION}`
];
const load=(src)=>new Promise((resolve,reject)=>{
  const s=document.createElement('script');
  s.src=src;
  s.async=false;
  s.onload=resolve;
  s.onerror=()=>reject(new Error(`Failed to load ${src}`));
  document.head.appendChild(s);
});
const css=(href)=>{
  if(document.querySelector(`link[href="${href}"]`))return;
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href=href;
  l.onerror=()=>console.warn('Emoji Drops: stylesheet failed',href);
  document.head.appendChild(l);
};
async function boot(){
  /* Do not block HTML parsing with document.write. */
  css(`css/polish-final.css?v=${VERSION}`);
  try{
    for(const src of scripts)await load(src);
    await load(`js/final-system.js?v=${VERSION}`);
  }catch(error){
    console.error('Emoji Drops boot error:',error);
    document.documentElement.dataset.bootError='1';
  }finally{
    /* The home layout is intentionally last in the cascade. */
    css(`css/compact-layout-final.css?v=${VERSION}`);
    window.dispatchEvent(new CustomEvent('emoji-drops-ready'));
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();

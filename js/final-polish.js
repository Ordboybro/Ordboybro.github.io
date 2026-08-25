(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const money=v=>Number(String(v??0).replace(/[^0-9.,-]/g,'').replace(',','.'))||0;

  const memory=Object.create(null);
  try{const p=Storage.prototype,g=p.getItem,s=p.setItem,r=p.removeItem;p.getItem=function(k){try{return g.call(this,k)}catch{return Object.prototype.hasOwnProperty.call(memory,k)?memory[k]:null}};p.setItem=function(k,v){try{s.call(this,k,v)}catch{memory[k]=String(v)}};p.removeItem=function(k){try{r.call(this,k)}catch{delete memory[k]}}}catch{}

  function hardenForms(){
    const search=$('#searchInput');
    if(search){search.type='search';search.name='case_search_query';search.autocomplete='off';search.setAttribute('autocorrect','off');search.setAttribute('autocapitalize','off');search.setAttribute('spellcheck','false');search.setAttribute('data-form-type','other')}
    const email=$('#authEmail'); if(email){email.type='email';email.name='auth_email';email.autocomplete='username';inputFix(email)}
    const pass=$('#authPassword'); if(pass){pass.type='password';pass.name='auth_password';pass.autocomplete='current-password';inputFix(pass)}
  }
  function inputFix(el){el.addEventListener('input',()=>{if(el.type==='email')el.value=el.value.trim().toLowerCase()})}

  function liveDrop(name,item){
    const c=$('#liveContainer'); if(!c||!item)return;
    const before=new Map([...c.children].map(el=>[el,el.getBoundingClientRect()]));
    const d=document.createElement('div'); d.className=`live-drop ${item.rarity||''}`; d.style.setProperty('--rarity',window.rarities?.[item.rarity]?.color||'#ff7b00');
    d.innerHTML=`<div class="live-emoji">${item.emoji||'❔'}</div><div class="live-info"><div class="live-user">${name||'Игрок'}</div><div class="live-rarity">${String(item.rarity||'common').toUpperCase()}</div></div>`;
    c.prepend(d); while(c.children.length>25)c.lastElementChild?.remove();
    d.style.transform='translate3d(-46px,0,0) scale(.96)';d.style.opacity='0';
    requestAnimationFrame(()=>{d.style.transition='transform .68s cubic-bezier(.22,1,.36,1),opacity .42s ease';d.style.transform='translate3d(0,0,0) scale(1)';d.style.opacity='1';for(const el of c.children){const old=before.get(el);if(!old||el===d)continue;const now=el.getBoundingClientRect(),dx=old.left-now.left,dy=old.top-now.top;el.style.transition='none';el.style.transform=`translate3d(${dx}px,${dy}px,0)`;requestAnimationFrame(()=>{el.style.transition='transform .72s cubic-bezier(.22,1,.36,1)';el.style.transform='translate3d(0,0,0)'})}})
  }
  function randomLive(){const names=['Shadow','Blaze','Ghost','Venom','Orion','Razor','Hunter','Skylix','Toxic','Storm','Krypton','Night','Falcon','Inferno','Vortex','Alpha','Reaper','Nova','Flame','Matrix','Ordboy','Sniper','Dragon','Pixel','Cyber'];const all=[];Object.values(window.cases||{}).forEach(items=>(items||[]).forEach(i=>all.push(i)));if(!all.length)return;const i=all[Math.floor(Math.random()*all.length)];liveDrop(names[Math.floor(Math.random()*names.length)],i)}
  window.createLiveDrop=liveDrop;window.randomLiveDrop=randomLive;window.addLiveDrop=liveDrop;

  const rarityWeights={common:56,rare:28,epic:11,mythical:4,legendary:1};window.emojiDropRarityWeights=rarityWeights;
  window.getRandomByChance=function(items){if(!Array.isArray(items)||!items.length)return null;const roll=Math.random()*100;let acc=0,rarity='common';for(const[r,w]of Object.entries(rarityWeights)){acc+=w;if(roll<acc){rarity=r;break}}const pool=items.filter(i=>i?.rarity===rarity);return(pool.length?pool:items)[Math.floor(Math.random()*(pool.length?pool.length:items.length))]};

  const caseEconomy={smile:89,moves:69,nature:49,food:39,animals:24,transport:14,sport:199,games:399};if(window.casePrices)Object.assign(window.casePrices,caseEconomy);
  const rarityBase={common:.18,rare:.48,epic:1.15,mythical:2.65,legendary:6.9};
  function rebalanceCases(){for(const[key,items]of Object.entries(window.cases||{})){if(!Array.isArray(items)||!items.length)continue;const price=caseEconomy[key]||window.casePrices?.[key]||50,groups={};items.forEach(i=>(groups[i.rarity]??=[]).push(i));for(const[r,group]of Object.entries(groups)){const w=rarityWeights[r]||1,count=group.length||1;group.forEach((i,idx)=>{const rank=count===1?1:idx/(count-1),value=price*(rarityBase[r]||.25)*(.72+rank*.56);i.price=`${Math.max(1,Math.round(value*100)/100)}₽`;i.chance=Math.round(w/count*100)/100})}}}
  rebalanceCases();

  function updateCasePrices(){
    const map=caseEconomy;
    $$('.case[onclick]').forEach(card=>{const m=card.getAttribute('onclick')?.match(/openCasePage\(['"]([^'"]+)/);if(!m)return;const price=map[m[1]];const el=$('.new-price',card);if(el&&price!=null)el.textContent=`${price}₽`;const old=$('.old-price',card);if(old&&price!=null)old.style.display='none'});
    const selected=window.state?.selectedCase, p=map[selected];const amount=Number(window.state?.openAmount||1);const sub=$('.open-buttons .main-btn .btn-subtext');if(sub&&p!=null)sub.textContent=`${p*amount}₽`;
  }

  function showOdds(){
    const original=window.renderCaseItems;
    if(typeof original!=='function'||original.__oddsWrapped)return;
    const wrapped=function(){original();const box=$('#caseItemsList');const items=window.state?.currentCase||[];if(!box)return;const cards=$$('.case-item-card',box);cards.forEach((card,i)=>{if(card.querySelector('.case-item-chance'))return;const item=items[i];if(!item)return;const el=document.createElement('div');el.className='case-item-chance';el.textContent=`${Number(item.chance||0).toFixed(2)}%`;card.appendChild(el)})};wrapped.__oddsWrapped=true;window.renderCaseItems=wrapped;
  }

  function moveRewardIntoCase(){const reward=$('#winPopup'),page=$('#openPage');if(reward&&page&&reward.parentElement!==page)page.appendChild(reward)}
  function fixCaseLayout(){const page=$('#openPage');if(!page)return;moveRewardIntoCase();page.style.position='relative';page.style.overflowY='auto';page.style.overflowX='hidden';const roulette=$('.roulette',page);if(roulette)roulette.style.overflow='visible';$$('.multi-roulette',page).forEach(l=>{l.style.overflow='hidden';l.style.overflowX='hidden';l.style.overflowY='hidden'});[$('#openAmounts',page),$('.open-buttons',page),$('#caseItemsList',page)].forEach(el=>{if(el){el.style.position='relative';el.style.top='auto';el.style.bottom='auto';el.style.marginBottom='0'}})}
  function installCaseControls(){const page=$('#openPage');if(!page)return;const header=$('.open-header',page),back=$('.back-btn',page);if(header&&back&&back.parentElement!==header)header.appendChild(back);$$('.roulette-marker,.blue-arrow,.roulette-arrow-blue,.old-pointer').forEach(e=>e.remove());const fast=$('.fast-btn',page);if(fast&&!fast.dataset.bound){fast.dataset.bound='1';fast.addEventListener('click',e=>{e.preventDefault();if(window.fastOpenCase)window.fastOpenCase()})}}
  function install(){hardenForms();fixCaseLayout();installCaseControls();updateCasePrices();showOdds();document.documentElement.style.overflowY='auto';document.body.style.overflowX='hidden'}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();setTimeout(install,250);setTimeout(install,900);setInterval(()=>{updateCasePrices();fixCaseLayout();},1200);
})();

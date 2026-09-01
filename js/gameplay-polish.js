(()=>{'use strict';
/* Final gameplay polish + optional Supabase Auth/Realtime bridge. */
const $=(s,r=document)=>r.querySelector(s);
const n=v=>Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.'))||0;
function css(){if($('#ed-gameplay-polish'))return;const s=document.createElement('style');s.id='ed-gameplay-polish';s.textContent=`
html,body{overflow-x:hidden;width:100%;min-width:0}
.cases{display:grid!important;width:100%!important;max-width:none!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(10px,1.35vw,22px)!important}
.home-divider{display:block!important;height:2px!important;width:100%!important;opacity:1!important;position:relative!important;top:-2px!important;margin-bottom:22px!important;background:linear-gradient(90deg,transparent 0,#ff7b00 7%,#ff7b00 93%,transparent 100%)!important;box-shadow:0 0 14px #ff7b0033!important}
.live-section{position:fixed!important;left:clamp(12px,2vw,36px)!important;right:0!important;bottom:0!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;box-sizing:border-box!important}
.live-container{width:100%!important;max-width:none!important}
.case-reel-track,.reel-track{transition-duration:7.2s!important;transition-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.upgrade-wheel{transition-duration:6.8s!important;transition-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.8s!important;animation-timing-function:cubic-bezier(.08,.78,.08,1)!important}
.case-reel,.upgrade-wheel,.ed-upgrade-stage{contain:layout paint;transform:translateZ(0);backface-visibility:hidden}
.case-reel-track,.reel-track,.ed-upgrade-pointer{will-change:transform}
.auth-modal{position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:16px;background:#000c;backdrop-filter:blur(14px)}
.auth-card{width:min(430px,96vw);padding:24px;border:1px solid #333;border-radius:24px;background:linear-gradient(180deg,#171717,#0f0f0f);box-shadow:0 30px 100px #000}
.auth-card h2{margin:0 0 7px}.auth-sub{color:#888;font-size:13px;margin-bottom:18px}.auth-field{width:100%;padding:13px 14px;margin:0 0 10px;border:1px solid #333;border-radius:12px;background:#0a0a0a;color:#fff;outline:none}.auth-field:focus{border-color:#ff7b00;box-shadow:0 0 0 3px #ff7b0018}.auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.auth-actions button{min-height:46px;border-radius:12px;font-weight:900;border:1px solid #333;background:#171717;color:#fff}.auth-actions .primary{border-color:#ff7b00;background:linear-gradient(135deg,#ff7b00,#ff9a2e)}.auth-error{min-height:20px;color:#ff6b6b;font-size:12px;margin:10px 0}.auth-note{color:#777;font-size:11px;margin-top:12px;line-height:1.45}
@media(max-width:1100px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:600px){.cases{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.case-tile .case-card{height:245px!important;min-height:245px!important}.live-section{left:12px!important;right:0!important;width:auto!important}.case-reel-track,.reel-track{transition-duration:6.4s!important}.upgrade-wheel{transition-duration:6.2s!important}.ed-upgrade-stage.spin .ed-upgrade-pointer{animation-duration:6.2s!important}}
@media(max-width:360px){.cases{gap:7px!important}.case-tile .case-card{height:225px!important;min-height:225px!important}}
@media(prefers-reduced-motion:reduce){.case-reel-track,.reel-track,.upgrade-wheel,.ed-upgrade-stage.spin .ed-upgrade-pointer{transition-duration:.001ms!important;animation-duration:.001ms!important}}
`;
document.head.appendChild(s)}
function normalizeTargets(){
 const root=$('#upgradeModal')||$('.upgrade-runtime')?.closest('.panel')||$('.upgrade-modal');if(!root)return;
 const source=root.querySelector('[data-upgrade-source-price],.source .u-value,.source .upgrade-value,.upgrade-slot:first-child .u-value');
 const sourcePrice=n(source?.dataset?.upgradeSourcePrice||source?.dataset?.price||source?.textContent);
 const active=root.querySelector('.upgrade-mult.active,[data-multiplier].active');
 const mult=n(active?.dataset?.multiplier||active?.textContent)||2;
 if(sourcePrice<=0)return;
 root.dataset.sourcePrice=String(sourcePrice);root.dataset.multiplier=String(mult);
 root.querySelectorAll('.upgrade-target,.upgrade-item.target').forEach(item=>{
   const price=n(item.dataset.price||item.dataset.value||item.querySelector('.item-value,.u-value,small')?.textContent);
   const valid=price>sourcePrice&&price<=sourcePrice*mult+0.000001;
   item.classList.toggle('is-invalid',!valid);item.setAttribute('aria-disabled',String(!valid));if(!valid)item.classList.remove('selected','active');
 });
 const selected=root.querySelector('.upgrade-target.selected,.upgrade-target.active,.upgrade-item.target.selected');
 const targetPrice=n(selected?.dataset?.price||selected?.dataset?.value||selected?.querySelector('.item-value,.u-value,small')?.textContent);
 const chance=targetPrice>sourcePrice?Math.min(100,(sourcePrice/targetPrice)*95):0;
 root.dataset.chance=String(chance);const label=root.querySelector('.upgrade-chance');if(label)label.textContent=`Шанс: ${chance.toFixed(chance<10?2:1)}%`;
 const stage=root.querySelector('.ed-upgrade-stage');if(stage){stage.style.setProperty('--chance',chance+'%');const c=$('.ed-upgrade-center',stage);if(c)c.textContent=chance.toFixed(chance<10?1:0)+'%'}
}
function guard(e){const target=e.target.closest('.upgrade-target,.upgrade-item.target');if(target?.classList.contains('is-invalid')){e.preventDefault();e.stopImmediatePropagation();return}if(e.target.closest('.upgrade-mult,[data-multiplier]'))setTimeout(normalizeTargets,0);if(target)setTimeout(normalizeTargets,0)}
function presence(){const A=window.EmojiDropsAuth;if(!A?.configured||!A.onlineChannel)return;try{const ch=A.onlineChannel();ch.on('presence',{event:'sync'},()=>{const state=ch.presenceState();const count=Object.values(state).reduce((sum,arr)=>sum+arr.length,0);const el=$('#onlineCount');if(el)el.textContent=String(count)});ch.subscribe(async status=>{if(status==='SUBSCRIBED'){const session=await A.getSession();await ch.track({user_id:session?.user?.id||null,page:location.pathname,at:Date.now()})}});window.addEventListener('beforeunload',()=>{try{ch.untrack()}catch{}})}catch(err){console.warn('[Emoji Drops] Presence unavailable',err)}}
function liveDrops(){const A=window.EmojiDropsAuth;if(!A?.configured||!A.liveDropsChannel)return;try{const ch=A.liveDropsChannel();ch.on('postgres_changes',{event:'INSERT',schema:'public',table:'live_drops'},payload=>window.dispatchEvent(new CustomEvent('emoji-drops-live-drop',{detail:payload.new}))).subscribe()}catch(err){console.warn('[Emoji Drops] Live Drops realtime unavailable',err)}}
function authModal(){const A=window.EmojiDropsAuth;if(!A?.configured||$('#ed-auth-modal'))return;const m=document.createElement('div');m.id='ed-auth-modal';m.className='auth-modal hidden';m.innerHTML=`<div class="auth-card"><button type="button" data-auth-close style="float:right;border:0;background:none;color:#aaa;font-size:22px">×</button><h2>Emoji Drops</h2><div class="auth-sub">Вход с любого устройства через один аккаунт</div><input class="auth-field" data-auth-email type="email" autocomplete="email" placeholder="Email"><input class="auth-field" data-auth-password type="password" autocomplete="current-password" placeholder="Пароль"><input class="auth-field" data-auth-nickname type="text" autocomplete="nickname" placeholder="Никнейм — только при регистрации"><div class="auth-error" data-auth-error></div><div class="auth-actions"><button class="primary" data-auth-login>Войти</button><button data-auth-register>Регистрация</button></div><button data-auth-reset style="width:100%;margin-top:9px;min-height:42px;border:0;background:none;color:#ff9a2e">Восстановить пароль</button><div class="auth-note">После регистрации Supabase может потребовать подтверждение email. Пароль хранится не в GitHub, а в Auth.</div></div>`;document.body.appendChild(m);const show=()=>m.classList.remove('hidden'),hide=()=>m.classList.add('hidden');document.addEventListener('click',e=>{if(e.target.closest('.profile-top')){A.getSession().then(s=>{if(!s)show()})}if(e.target.closest('[data-auth-close]'))hide()});const email=()=>$("[data-auth-email]",m).value.trim(),pass=()=>$("[data-auth-password]",m).value,nick=()=>$("[data-auth-nickname]",m).value.trim();const err=x=>$("[data-auth-error]",m).textContent=x?.message||String(x||'');$("[data-auth-login]",m).onclick=async()=>{try{err('');await A.signIn(email(),pass());hide()}catch(e){err(e)}};$("[data-auth-register]",m).onclick=async()=>{try{err('');const d=await A.signUp(email(),pass(),nick()||'Игрок');err(d.user&&!d.session?'Проверьте почту для подтверждения аккаунта.':'');}catch(e){err(e)}};$("[data-auth-reset]",m).onclick=async()=>{try{err('');await A.resetPassword(email());err('Письмо для восстановления отправлено.')}catch(e){err(e)}}}
css();document.addEventListener('click',guard,true);window.addEventListener('emoji-drops-auth-change',()=>{presence();liveDrops()});setTimeout(()=>{normalizeTargets();presence();liveDrops();authModal()},500);setInterval(()=>{if(!document.hidden)normalizeTargets()},1000);
})();

(()=>{'use strict';
/* Emoji Drops — focused case/upgrade presentation polish. Does not touch catalog/homepage visuals. */
const STYLE_ID='ed-case-upgrade-polish';
function inject(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
/* Case opening */
#edOpenModal .panel{overflow:hidden}
#edOpenModal .panel-head{background:linear-gradient(180deg,rgba(255,123,0,.055),rgba(255,255,255,.012))}
#edReels{position:relative;padding:4px 2px 12px}
#edReels:before{content:'OPENING';display:block;text-align:center;font-size:9px;font-weight:1000;letter-spacing:.22em;color:#777;margin:0 0 8px}
.ed-final-reel{border-color:rgba(255,123,0,.18)!important;background:radial-gradient(circle at 50% 50%,rgba(255,123,0,.065),transparent 48%),#0b0b0b!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 14px 35px rgba(0,0,0,.35);}
.ed-final-reel:after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,#0b0b0b 0%,transparent 13%,transparent 87%,#0b0b0b 100%);z-index:1}
.ed-final-marker{width:4px!important;background:linear-gradient(180deg,#fff,#ff7b00 30%,#ff7b00 70%,#fff)!important;box-shadow:0 0 10px #ff7b00,0 0 28px rgba(255,123,0,.75)!important}
.ed-final-item{box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 8px 18px rgba(0,0,0,.25);transition:transform .18s ease,box-shadow .18s ease}
.ed-final-item strong{filter:drop-shadow(0 5px 10px rgba(0,0,0,.55))}
#edOpenModal .open-cost{font-size:13px;font-weight:800;padding:9px 12px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:#101010}
#edOpenModal #edOpenCost{color:#ff9a2e;font-weight:1000}
#edOpenModal .amount.active{box-shadow:0 0 0 1px #ff7b00,0 7px 18px rgba(255,123,0,.18)}

/* Result */
#edWinModal .panel{box-shadow:0 35px 120px rgba(0,0,0,.78),0 0 45px rgba(255,123,0,.07)}
.ed-final-win{position:relative;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 30px rgba(0,0,0,.32)!important}
.ed-final-win:after{content:'';position:absolute;inset:-60%;background:radial-gradient(circle,rgba(255,255,255,.045),transparent 55%);transform:rotate(20deg);pointer-events:none}

/* Upgrade */
#edUpgradeModal .panel{overflow:hidden}
#edUpgradeModal .panel-head{background:linear-gradient(180deg,rgba(255,123,0,.065),rgba(255,255,255,.012))}
.ed-final-upgrade{position:relative}
.ed-final-box{box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 15px 38px rgba(0,0,0,.3)!important;background:linear-gradient(180deg,#171717,#101010)!important}
.ed-final-box>b{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#999;margin-bottom:9px}
.ed-final-box.source{border-color:rgba(255,255,255,.09)}
.ed-final-box.target{border-color:rgba(255,123,0,.18)}
.ed-final-wheel{position:relative}
.ed-final-wheel:before{content:'';position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,123,0,.12),transparent 67%);filter:blur(5px);pointer-events:none}
.ed-final-wheel-circle{position:relative;z-index:1;width:154px!important;height:154px!important;border-width:4px!important;background:radial-gradient(circle at 35% 30%,#252525,#0b0b0b 65%)!important;box-shadow:0 0 22px rgba(255,123,0,.2),inset 0 0 28px rgba(255,123,0,.06)!important;transition:transform .25s ease,box-shadow .25s ease}
.ed-final-wheel-circle.ed-upgrade-spin{animation:edUpgradeSpin .8s cubic-bezier(.2,.85,.25,1)}
.ed-final-wheel-circle.ed-upgrade-win{box-shadow:0 0 35px rgba(68,255,145,.42),inset 0 0 30px rgba(68,255,145,.12)!important;border-color:#4dff91!important}
.ed-final-wheel-circle.ed-upgrade-lose{box-shadow:0 0 35px rgba(255,65,65,.32),inset 0 0 30px rgba(255,65,65,.1)!important;border-color:#ff4d4d!important}
@keyframes edUpgradeSpin{0%{transform:rotate(0) scale(.96)}45%{transform:rotate(140deg) scale(1.04)}100%{transform:rotate(360deg) scale(1)}}
.ed-final-chance{padding:7px 12px;border-radius:999px;background:#0e0e0e;border:1px solid rgba(255,123,0,.15);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.ed-final-item-btn{transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease,background .14s ease!important}
.ed-final-item-btn:hover{transform:translateY(-2px);border-color:#555}
.ed-final-item-btn.selected{box-shadow:0 0 0 1px #ff7b00,0 8px 18px rgba(255,123,0,.13)!important}
.ed-final-mults button{font-weight:900;transition:transform .14s ease,box-shadow .14s ease}
.ed-final-mults button:hover{transform:translateY(-1px)}
.ed-final-mults button.active{box-shadow:0 0 0 1px rgba(255,123,0,.3),0 6px 16px rgba(255,123,0,.12)}
#edDoUpgrade{min-height:44px;font-weight:1000;letter-spacing:.02em}
@media(max-width:900px){.ed-final-wheel-circle{width:138px!important;height:138px!important}.ed-final-wheel:before{width:165px;height:165px}}
@media(prefers-reduced-motion:reduce){.ed-final-wheel-circle.ed-upgrade-spin{animation:none!important}.ed-final-item-btn,.ed-final-mults button{transition:none!important}}
`;document.head.appendChild(s)}
function watchUpgrade(){const root=document.getElementById('edUpgradeModal');if(!root)return;const wheel=root.querySelector('.ed-final-wheel-circle');const chance=root.querySelector('#edChance');const action=root.querySelector('#edDoUpgrade');if(!wheel||!action)return;if(action.dataset.edPolished==='1')return;action.dataset.edPolished='1';action.addEventListener('click',()=>{wheel.classList.remove('ed-upgrade-win','ed-upgrade-lose');void wheel.offsetWidth;wheel.classList.add('ed-upgrade-spin');setTimeout(()=>{const text=(chance?.textContent||'').toLowerCase();const lose=/неуда|lose|fail|0%/.test(text);wheel.classList.add(lose?'ed-upgrade-lose':'ed-upgrade-win')},820)},{capture:true})}
function observe(){const obs=new MutationObserver(()=>{inject();watchUpgrade()});obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});inject();watchUpgrade()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
})();

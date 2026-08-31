(()=>{'use strict';
/* Canonical content extension: expanded case pools and tuned case economy. */
try{
 if(typeof cases==='object'&&typeof casePrices==='object'){
  Object.assign(casePrices,{smile:35,moves:50,nature:65,food:80,animals:95,transport:120,sport:165,games:225,space:145,ocean:190});
  cases.space=[
   {emoji:'🌌',rarity:'common',price:'6₽'},{emoji:'🪐',rarity:'common',price:'7₽'},{emoji:'🌙',rarity:'common',price:'7₽'},{emoji:'⭐',rarity:'common',price:'8₽'},{emoji:'🌠',rarity:'common',price:'9₽'},{emoji:'☄️',rarity:'common',price:'10₽'},
   {emoji:'🛰️',rarity:'rare',price:'18₽'},{emoji:'🔭',rarity:'rare',price:'20₽'},{emoji:'🌕',rarity:'rare',price:'22₽'},{emoji:'🚀',rarity:'rare',price:'24₽'},{emoji:'🛸',rarity:'rare',price:'26₽'},
   {emoji:'👾',rarity:'epic',price:'38₽'},{emoji:'🌟',rarity:'epic',price:'42₽'},{emoji:'✨',rarity:'epic',price:'46₽'},{emoji:'💫',rarity:'epic',price:'50₽'},
   {emoji:'🌠',rarity:'mythical',price:'72₽'},{emoji:'☄️',rarity:'mythical',price:'80₽'},{emoji:'🛰️',rarity:'mythical',price:'88₽'},{emoji:'🚀',rarity:'mythical',price:'96₽'},
   {emoji:'🌌',rarity:'legendary',price:'135₽'},{emoji:'🌍',rarity:'legendary',price:'150₽'},{emoji:'🌎',rarity:'legendary',price:'165₽'},
   {emoji:'🌏',rarity:'common',price:'8₽'},{emoji:'🌑',rarity:'common',price:'9₽'},{emoji:'🌒',rarity:'common',price:'9₽'},{emoji:'🌓',rarity:'common',price:'10₽'},{emoji:'🌔',rarity:'common',price:'10₽'},
   {emoji:'🌖',rarity:'rare',price:'20₽'},{emoji:'🌗',rarity:'rare',price:'21₽'},{emoji:'🌘',rarity:'rare',price:'22₽'},{emoji:'🌙',rarity:'rare',price:'23₽'},
   {emoji:'⭐',rarity:'epic',price:'40₽'},{emoji:'💫',rarity:'epic',price:'44₽'},{emoji:'🌟',rarity:'epic',price:'48₽'},
   {emoji:'🌌',rarity:'mythical',price:'92₽'},{emoji:'🪐',rarity:'legendary',price:'175₽'}
  ];
  cases.ocean=[
   {emoji:'🐚',rarity:'common',price:'5₽'},{emoji:'🪸',rarity:'common',price:'6₽'},{emoji:'🐠',rarity:'common',price:'7₽'},{emoji:'🐟',rarity:'common',price:'7₽'},{emoji:'🦀',rarity:'common',price:'8₽'},{emoji:'🦐',rarity:'common',price:'9₽'},
   {emoji:'🐬',rarity:'rare',price:'17₽'},{emoji:'🐡',rarity:'rare',price:'19₽'},{emoji:'🦑',rarity:'rare',price:'21₽'},{emoji:'🐙',rarity:'rare',price:'23₽'},{emoji:'🦞',rarity:'rare',price:'25₽'},
   {emoji:'🌊',rarity:'epic',price:'36₽'},{emoji:'🐳',rarity:'epic',price:'40₽'},{emoji:'🧜‍♂️',rarity:'epic',price:'44₽'},{emoji:'🧜‍♀️',rarity:'epic',price:'48₽'},
   {emoji:'🦈',rarity:'mythical',price:'70₽'},{emoji:'🐋',rarity:'mythical',price:'78₽'},{emoji:'🐙',rarity:'mythical',price:'86₽'},{emoji:'🔱',rarity:'mythical',price:'94₽'},
   {emoji:'🌊',rarity:'legendary',price:'125₽'},{emoji:'🐳',rarity:'legendary',price:'145₽'},{emoji:'🔱',rarity:'legendary',price:'165₽'},
   {emoji:'🫧',rarity:'common',price:'6₽'},{emoji:'🌊',rarity:'common',price:'7₽'},{emoji:'🪼',rarity:'common',price:'8₽'},{emoji:'🐟',rarity:'common',price:'8₽'},{emoji:'🐬',rarity:'common',price:'9₽'},
   {emoji:'🐚',rarity:'rare',price:'18₽'},{emoji:'🪸',rarity:'rare',price:'19₽'},{emoji:'🪼',rarity:'rare',price:'20₽'},{emoji:'🐠',rarity:'rare',price:'22₽'},
   {emoji:'🌊',rarity:'epic',price:'38₽'},{emoji:'🦑',rarity:'epic',price:'42₽'},{emoji:'🐙',rarity:'epic',price:'46₽'},
   {emoji:'🌊',rarity:'mythical',price:'90₽'},{emoji:'🌌',rarity:'legendary',price:'180₽'}
  ];
 }
}catch(e){console.warn('Emoji Drops content extension:',e)}
const style=document.createElement('style');style.id='ed-final-runtime';style.textContent=`.logo{display:flex!important;align-items:center!important;gap:11px!important}.logo>span{display:inline-flex!important;align-items:center!important}.live-title .ed-dot,.top-pill .ed-dot{background:#ff3b30!important;color:#ff3b30!important}.top-pill:first-child{font-size:0}.top-pill:first-child #onlineCount{font-size:inherit}.case-card,.case-tile .case-card{width:100%!important}.actions.reel-actions{justify-content:center!important;align-items:center!important}.reel-actions .primary,.reel-actions .reel-fast{min-height:48px!important}.profile-layout>.profile-side:last-child{transform:translateY(-10px)}.best-wrap .section-title{margin-bottom:10px}.inventory .section-title{letter-spacing:.12em}.upgrade-wheel-col{position:relative}.upgrade-wheel-col:after{content:'▼';position:absolute;top:calc(50% - 108px);left:50%;transform:translateX(-50%);z-index:20;color:#ffb35c;font-size:25px;text-shadow:0 0 14px #ff7b00}.upgrade-wheel-col:before{content:none!important}.upgrade-chance{font-size:18px!important}.upgrade-wheel.spinning{animation-duration:3.9s!important}@media(max-width:600px){.profile-layout>.profile-side:last-child{transform:none}.upgrade-wheel-col:after{top:calc(50% - 105px)}}`;document.head.appendChild(style);
window.ED_CASE_META=Object.assign(window.ED_CASE_META||{},{space:{name:'Космос',icon:'🌌'},ocean:{name:'Океан',icon:'🌊'}});
})();
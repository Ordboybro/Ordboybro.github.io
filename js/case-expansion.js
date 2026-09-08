(()=>{'use strict';
/* Four restored/expanded collections. Virtual/local-only game content. */
if(typeof casePrices==='object'&&typeof cases==='object'){
  Object.assign(casePrices,{space:120,ocean:160,flags:220,tech:300});
  Object.assign(cases,{
    space:[
      {emoji:'🌌',rarity:'common',price:'5₽'},{emoji:'🌙',rarity:'common',price:'6₽'},{emoji:'⭐',rarity:'common',price:'6₽'},{emoji:'🌠',rarity:'common',price:'7₽'},
      {emoji:'🛰️',rarity:'rare',price:'14₽'},{emoji:'🚀',rarity:'rare',price:'16₽'},{emoji:'🛸',rarity:'rare',price:'18₽'},
      {emoji:'☄️',rarity:'epic',price:'30₽'},{emoji:'🪐',rarity:'epic',price:'34₽'},{emoji:'🌑',rarity:'mythical',price:'65₽'},{emoji:'🌞',rarity:'mythical',price:'75₽'},{emoji:'🌍',rarity:'legendary',price:'170₽'}
    ],
    ocean:[
      {emoji:'💧',rarity:'common',price:'5₽'},{emoji:'🐚',rarity:'common',price:'6₽'},{emoji:'🪸',rarity:'common',price:'7₽'},{emoji:'🐟',rarity:'common',price:'7₽'},
      {emoji:'🐠',rarity:'rare',price:'13₽'},{emoji:'🐬',rarity:'rare',price:'16₽'},{emoji:'🦀',rarity:'rare',price:'18₽'},
      {emoji:'🐙',rarity:'epic',price:'30₽'},{emoji:'🦈',rarity:'epic',price:'38₽'},{emoji:'🐋',rarity:'mythical',price:'65₽'},{emoji:'🌊',rarity:'mythical',price:'78₽'},{emoji:'🧜',rarity:'legendary',price:'180₽'}
    ],
    flags:[
      {emoji:'🏳️',rarity:'common',price:'6₽'},{emoji:'🏴',rarity:'common',price:'6₽'},{emoji:'🏁',rarity:'common',price:'7₽'},{emoji:'🚩',rarity:'common',price:'8₽'},
      {emoji:'🇷🇺',rarity:'rare',price:'15₽'},{emoji:'🇺🇸',rarity:'rare',price:'16₽'},{emoji:'🇯🇵',rarity:'rare',price:'18₽'},
      {emoji:'🇫🇷',rarity:'epic',price:'32₽'},{emoji:'🇬🇧',rarity:'epic',price:'36₽'},{emoji:'🇩🇪',rarity:'mythical',price:'70₽'},{emoji:'🇮🇹',rarity:'mythical',price:'82₽'},{emoji:'🌐',rarity:'legendary',price:'200₽'}
    ],
    tech:[
      {emoji:'💻',rarity:'common',price:'8₽'},{emoji:'⌨️',rarity:'common',price:'9₽'},{emoji:'🖱️',rarity:'common',price:'10₽'},{emoji:'📱',rarity:'common',price:'11₽'},
      {emoji:'🎧',rarity:'rare',price:'20₽'},{emoji:'📷',rarity:'rare',price:'24₽'},{emoji:'🕹️',rarity:'rare',price:'28₽'},
      {emoji:'🤖',rarity:'epic',price:'45₽'},{emoji:'🧠',rarity:'epic',price:'52₽'},{emoji:'⚡',rarity:'mythical',price:'90₽'},{emoji:'🔬',rarity:'mythical',price:'110₽'},{emoji:'🧬',rarity:'legendary',price:'260₽'}
    ]
  });
}
})();

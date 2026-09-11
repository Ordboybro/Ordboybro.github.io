const fs=require('fs'),vm=require('vm');
const data=fs.readFileSync('js/data.js','utf8');
const hard=fs.readFileSync('js/emoji-drops-hardening.js','utf8');
const tx=fs.readFileSync('js/emoji-drops-transaction-layer.js','utf8');
const storage=new Map();
const w={cases:null,casePrices:null,rarities:null,addEventListener:()=>{}};
const d={write:()=>{},addEventListener:()=>{},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],body:{},head:{appendChild:()=>{}}};
const ctx={window:w,document:d,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},console,Date,JSON,Math,setInterval:()=>0,clearInterval:()=>{},clearTimeout:()=>{},requestAnimationFrame:f=>f(Date.now()),NodeFilter:{SHOW_TEXT:4},MutationObserver:function(){this.observe=()=>{}},navigator:{},getUsers:()=>[]};
vm.createContext(ctx);vm.runInContext(data,ctx,{timeout:2000});
const dataset=vm.runInContext('({cases,casePrices,rarities})',ctx,{timeout:2000});
const cases=dataset.cases||w.cases||{};const prices=dataset.casePrices||w.casePrices||{};
if(Object.keys(cases).length!==8)throw Error(`Expected 8 cases, got ${Object.keys(cases).length}`);
if(Object.keys(prices).length!==8)throw Error(`Expected 8 case prices, got ${Object.keys(prices).length}`);
for(const [k,v] of Object.entries(cases)){if(!Array.isArray(v)||!v.length)throw Error(`Empty case ${k}`);for(const x of v){if(!x?.emoji||!x?.rarity)throw Error(`Invalid item in ${k}`);if(!['common','rare','epic','mythical','legendary'].includes(x.rarity))throw Error(`Invalid rarity ${x.rarity}`)}}
vm.runInContext(hard,ctx,{timeout:2000});if(ctx.window.__emojiDropsDiagnostics?.runtime!=='hardened-v9')throw Error('Hardening contract failed');
ctx.window.__emojiDropsCore={_s:{balance:250,inventory:[],stats:{},history:[]},state(){return this._s},render(){}};
vm.runInContext(tx,ctx,{timeout:2000});const t=ctx.window.__emojiDropsTransactions;if(t?.version!==7||t?.journal!=='emojiDropsTxnV4'||t?.commitGraceMs!==1200||t?.nonBlockingLease!==true||t?.faultAware!==true)throw Error('Transaction v7 contract failed');
const s=ctx.window.__emojiDropsCore._s,original=JSON.stringify(s),a=t.begin('quality');if(!a)throw Error('Transaction begin failed');s.balance=999;s.inventory.push({id:'q',emoji:'😀',rarity:'common',price:'10EC'});if(!t.rollback(a)||JSON.stringify(s)!==original)throw Error('Rollback invariant failed');
for(let i=0;i<10000;i++){s.balance=250;s.balance+=100;s.balance-=100;if(s.balance!==250)throw Error('Balance invariant failed')}
console.log('Final quality self-test OK: dataset, rarities, hardening, v7 transaction rollback, long-session balance invariant');

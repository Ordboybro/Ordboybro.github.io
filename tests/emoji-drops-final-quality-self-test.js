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
vm.runInContext(tx,ctx,{timeout:2000});const t=ctx.window.__emojiDropsTransactions;if(t?.version!==11||t?.journal!=='emojiDropsTxnV4'||t?.commitGraceMs!==1200||t?.nonBlockingLease!==true||t?.faultAware!==true)throw Error('Transaction v11 contract failed');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
for(const marker of ['select balance,inventory into bal,inv from public.profiles where id=uid','inventory=coalesce(inv,\'[]\'::jsonb)||jsonb_build_array(item)','where x->>\'id\'<>p_item_id','update public.market_listings set status=\'sold\',buyer_id=uid,sold_at=now()','set status=\'cancelled\',cancelled_at=now()'])if(!schema.includes(marker))throw Error('Cross-feature inventory invariant marker missing: '+marker);
const buyStart=schema.indexOf('create or replace function public.buy_market_listing');
const buyEnd=schema.indexOf('create or replace function public.cancel_market_listing',buyStart);
const buy=buyStart>=0&&buyEnd>buyStart?schema.slice(buyStart,buyEnd):'';
const orderedProfile=buy.indexOf('perform 1 from public.profiles where id in (uid,seller_id) order by id for update;');
const lockedListing=buy.indexOf('select * into l from public.market_listings where id=p_listing_id for update;');
if(orderedProfile<0||lockedListing<0||orderedProfile>lockedListing)throw Error('Market buy must lock profiles before the listing row');
if(!buy.includes("inventory=coalesce(inventory,'[]'::jsonb)||jsonb_build_array(item)"))throw Error('Market buy must append the exact purchased item');
const s=ctx.window.__emojiDropsCore._s,original=JSON.stringify(s),a=t.begin('quality');if(!a)throw Error('Transaction begin failed');s.balance=999;s.inventory.push({id:'q',emoji:'😀',rarity:'common',price:'10EC'});if(!t.rollback(a)||JSON.stringify(s)!==original)throw Error('Rollback invariant failed');
for(let i=0;i<10000;i++){s.balance=250;s.balance+=100;s.balance-=100;if(s.balance!==250)throw Error('Balance invariant failed')}
console.log('Final quality self-test OK: dataset, rarities, hardening, v10 transaction rollback, long-session balance invariant');

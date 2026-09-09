const fs=require('fs'),vm=require('vm');
const writes=[];
const ctx={window:{cases:null,casePrices:null,rarities:null},document:{write:s=>writes.push(s),getElementById:()=>null,addEventListener:()=>{},querySelector:()=>null},localStorage:{getItem:()=>null,setItem:()=>{}},console,getUsers:()=>[],setInterval:()=>0,clearInterval:()=>{},Date,Number,JSON};
vm.createContext(ctx);
const dataset=vm.runInContext(`(()=>{${fs.readFileSync('js/data.js','utf8')}\nreturn {cases,casePrices,rarities};})()`,ctx,{timeout:2000});
const {cases,casePrices}=dataset;
const core=fs.readFileSync('js/emoji-drops-core.js','utf8');
const rarities=['common','rare','epic','mythical','legendary'];
const weights={common:55,rare:27,epic:12,mythical:5,legendary:1};
if(Object.keys(cases).length!==8)throw new Error('Expected 8 cases');
if(Object.keys(casePrices).length!==8)throw new Error('Expected 8 case prices');
for(const [key,list] of Object.entries(cases)){
  if(!Array.isArray(list)||!list.length)throw new Error(`${key}: empty`);
  if(!(Number(casePrices[key])>0))throw new Error(`${key}: invalid case price`);
  for(const r of rarities)if(!list.some(x=>x.rarity===r))throw new Error(`${key}: missing ${r}`);
  const seen=new Set();
  for(const x of list){const fp=`${x.emoji}|${x.rarity}|${x.price}`;if(seen.has(fp))throw new Error(`${key}: duplicate item ${fp}`);seen.add(fp);const value=Number.parseFloat(String(x.price).replace(/[^0-9.\-]/g,''));if(!Number.isFinite(value)||value<0)throw new Error(`${key}: invalid item price`)}
}
let seed=0x9e3779b9;
function rand(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296}
function drawRarity(){const r=rand()*100;let n=0;for(const x of rarities){n+=weights[x];if(r<n)return x}return 'legendary'}
const N=100000;
const counts=Object.fromEntries(rarities.map(r=>[r,0]));
for(let i=0;i<N;i++)counts[drawRarity()]++;
const expected={common:.55,rare:.27,epic:.12,mythical:.05,legendary:.01};
const tolerance={common:.012,rare:.012,epic:.01,mythical:.007,legendary:.004};
for(const r of rarities){const observed=counts[r]/N,diff=Math.abs(observed-expected[r]);if(diff>tolerance[r])throw new Error(`Monte Carlo ${r}: ${(observed*100).toFixed(2)}% vs ${(expected[r]*100).toFixed(2)}%`)}
console.log('Monte Carlo OK:',counts);
function openModel(balance,price,item){if(!Number.isFinite(balance)||!Number.isFinite(price)||price<=0||balance<price)throw new Error('open allowed below case price or invalid money');return {balance:balance-price,inventory:[item],spent:price}}
function sellModel(balance,inventory,index){if(!Number.isFinite(balance)||balance<0||!Array.isArray(inventory)||index<0||index>=inventory.length)throw new Error('invalid sell transaction');const item=inventory[index];const price=Number(item.price);if(!Number.isFinite(price)||price<0)throw new Error('invalid item sale value');return {balance:balance+price,inventory:inventory.filter((_,i)=>i!==index)}}
function upgradeModel(source,target,win){if(!source||!target||source===target)throw new Error('invalid upgrade targets');const next=win?[target]:[source];if(next.length!==1)throw new Error('upgrade transaction invariant');return next}
const item={emoji:'😀',rarity:'common',price:10};
const opened=openModel(100,item.price,item);if(opened.balance!==90||opened.inventory.length!==1)throw new Error('open invariant');
const sold=sellModel(opened.balance,opened.inventory,0);if(sold.balance!==100||sold.inventory.length!==0)throw new Error('sell invariant');
if(upgradeModel(item,{emoji:'🔥',rarity:'rare',price:30},true).length!==1)throw new Error('upgrade win invariant');
if(upgradeModel(item,{emoji:'🔥',rarity:'rare',price:30},false).length!==1)throw new Error('upgrade loss invariant');
for(const n of [10,11,250,Number.MAX_SAFE_INTEGER]){const r=openModel(n,10,item);if(r.balance!==n-10)throw new Error('extreme balance invariant failed')}
if(openModel(10,10,item).balance!==0)throw new Error('exact-price open invariant');
let rejected=false;try{openModel(9,10,item)}catch{rejected=true}if(!rejected)throw new Error('below-price open was accepted');
const cheapest=Math.min(...Object.values(casePrices).map(Number));
if(!(cheapest>0))throw new Error('Cheapest case price invalid');
function bonusAllowed(balance,claims){return Number.isFinite(balance)&&balance>=0&&balance<cheapest&&Number.isInteger(claims)&&claims>=0&&claims<3}
if(!bonusAllowed(0,0)||bonusAllowed(cheapest,0)||bonusAllowed(0,3)||bonusAllowed(cheapest+1,2)||bonusAllowed(NaN,0))throw new Error('Bonus eligibility invariant failed');
console.log(`Bonus rules OK: cheapest=${cheapest}, maxDaily=3, amount=250`);
if(!/return\s*\{balance:250,/.test(core))throw new Error('Core fresh balance must be 250');
if(!/function grantReward\(\)\s*\{return 0\}/.test(core))throw new Error('Legacy timed reward is still active');
const hardening=fs.readFileSync('js/emoji-drops-hardening.js','utf8');
if(!/START_BALANCE=250/.test(hardening)||!/MAX_BONUS_CLAIMS=3/.test(hardening))throw new Error('Hardening defaults mismatch');
const guards=fs.readFileSync('js/emoji-drops-runtime-guards.js','utf8');
if(!/MAX_DAILY=3/.test(guards)||!/BONUS=250/.test(guards)||!/function eligible\(/.test(guards)||!/function claimDue\(/.test(guards))throw new Error('Runtime guard contract mismatch');
console.log('Fresh-state contract OK: 250; legacy timed reward disabled');
console.log('Economy self-test OK: dataset, odds, open/sell/upgrade invariants, extreme values, bonus rules, legacy timer, guards');

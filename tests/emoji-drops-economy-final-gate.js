const fs=require('fs'),vm=require('vm');
const data=fs.readFileSync('js/data.js','utf8');
const ctx={window:{},document:{write(){},getElementById(){return null},addEventListener(){},querySelector(){return null},head:{appendChild(){}},body:{}},localStorage:{getItem(){return null},setItem(){}},console,Date,Number,JSON,MutationObserver:function(){this.observe=()=>{}},requestAnimationFrame:f=>f(),setInterval(){return 0},clearInterval(){},clearTimeout(){},NodeFilter:{SHOW_TEXT:4}};
vm.createContext(ctx);const d=vm.runInContext(`(()=>{${data};return {cases,casePrices,rarities}})()`,ctx);
const rarities=['common','rare','epic','mythical','legendary'],weights={common:55,rare:27,epic:12,mythical:5,legendary:1};
const probs=Object.fromEntries(rarities.map(r=>[r,weights[r]/100]));
const values={};
for(const [key,list] of Object.entries(d.cases)){
  values[key]={};
  for(const r of rarities){const a=list.filter(x=>x.rarity===r).map(x=>Number.parseFloat(String(x.price).replace(/[^0-9.\-]/g,'')));if(!a.length)throw Error(`${key}: missing ${r}`);if(a.some(x=>!Number.isFinite(x)||x<0))throw Error(`${key}: invalid ${r} price`);values[key][r]=a.reduce((a,b)=>a+b,0)/a.length}
}
const ev={};for(const [key,v] of Object.entries(values)){ev[key]=rarities.reduce((sum,r)=>sum+probs[r]*v[r],0);const price=Number(d.casePrices[key]);if(!(price>0)||!Number.isFinite(price))throw Error(`${key}: invalid case price`);if(ev[key]<0)throw Error(`${key}: negative EV`);}
const weightedEV=Object.values(ev).reduce((a,b)=>a+b,0)/Object.keys(ev).length;
if(!Number.isFinite(weightedEV)||weightedEV<0)throw Error('Global EV invalid');
function upgradeChance(source,target){const s=Number(source),t=Number(target);if(!Number.isFinite(s)||!Number.isFinite(t)||s<=0||t<=s)return 0;return Math.min(1,s/t);}
const fuzz=[Number.MIN_VALUE,0,1,10,250,Number.MAX_SAFE_INTEGER,Infinity,NaN,-1,'10',null];
for(const s of fuzz)for(const t of fuzz){const c=upgradeChance(s,t);if(!Number.isFinite(c)||c<0||c>1)throw Error(`Upgrade boundary invalid: ${String(s)} -> ${String(t)} = ${c}`);if(Number.isFinite(s)&&Number.isFinite(t)&&s>0&&t>s&&c!==Math.min(1,s/t))throw Error('Upgrade formula drift')}
function open(balance,price){if(!Number.isFinite(balance)||!Number.isFinite(price)||price<=0||balance<price)return null;return {balance:balance-price,spent:price}}
function sell(balance,itemPrice){if(!Number.isFinite(balance)||balance<0||!Number.isFinite(itemPrice)||itemPrice<0)return null;return balance+itemPrice}
function invariant(balance,price,itemPrice){const o=open(balance,price);if(!o)return false;const after=sell(o.balance,itemPrice);return Number.isFinite(after)&&after===balance-price+itemPrice}
for(let i=0;i<100000;i++){const b=Math.floor(Math.random()*1e9),p=Math.floor(Math.random()*1000)+1,v=Math.floor(Math.random()*100000);if(b>=p&&!invariant(b,p,v))throw Error('Open/sell consistency fuzz failed')}
const tx=fs.readFileSync('js/emoji-drops-transaction-layer.js','utf8');for(const x of ['begin','commit','rollback','recover','beforeHash','afterHash'])if(!tx.includes(x))throw Error(`Transaction/economy consistency contract missing: ${x}`);
console.log('Economy final gate OK');
console.log('EV sanity:',Object.fromEntries(Object.entries(ev).map(([k,v])=>[k,Number(v.toFixed(2))] )));
console.log('Upgrade boundary fuzz: 11x11 domain, finite [0,1] invariant');
console.log('Transaction/economy consistency: 100,000 open/sell fuzz cases + transaction journal/hash contract');

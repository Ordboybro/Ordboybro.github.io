'use strict';
const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
const prices={smile:100,moves:80,nature:60,food:40,animals:20,transport:20,sport:250,games:500};
const weights={common:.55,rare:.27,epic:.12,mythical:.05,legendary:.01};
const rows=[...schema.matchAll(/\('([^']+)',\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\)/g)].map(m=>({caseId:m[1],rarity:m[3],price:Number(m[4])}));
if(rows.length<300)throw new Error('Canonical catalog unexpectedly small: '+rows.length);
if(!rows.every(x=>Number.isFinite(x.price)&&x.price>=0))throw new Error('Canonical catalog contains an invalid item price');
if(Math.abs(Object.values(weights).reduce((a,b)=>a+b,0)-1)>1e-9)throw new Error('Server rarity probabilities must sum to 1');
const report=[];
for(const [caseId,cost] of Object.entries(prices)){
  const a=rows.filter(x=>x.caseId===caseId);
  if(!a.length)throw new Error('Missing case: '+caseId);
  const by={};
  for(const rarity of Object.keys(weights)){
    const xs=a.filter(x=>x.rarity===rarity);
    if(!xs.length)throw new Error('Missing rarity '+rarity+' in '+caseId);
    by[rarity]=xs.reduce((s,x)=>s+x.price,0)/xs.length;
  }
  const ev=Object.entries(weights).reduce((s,[rarity,w])=>s+w*by[rarity],0);
  const min=Math.min(...a.map(x=>x.price)),max=Math.max(...a.map(x=>x.price));
  report.push({
    caseId,
    cost,
    items:a.length,
    ev:Number(ev.toFixed(2)),
    evRatio:Number((ev/cost).toFixed(4)),
    min,
    max,
    grossHouseEdge:Number((1-ev/cost).toFixed(4)),
    rarityAverage:Object.fromEntries(Object.entries(by).map(([r,v])=>[r,Number(v.toFixed(2))]))
  });
}
const dailyRewards=[75,100,125,150,175,200,500],dailyWeekTotal=dailyRewards.reduce((a,b)=>a+b,0),dailyAvg=Number((dailyWeekTotal/7).toFixed(2));
const infiniteFarmingWarning=report.some(x=>x.evRatio>=1);
if(infiniteFarmingWarning)console.warn('ECONOMY REVIEW: one or more cases have EV >= price; this is not changed automatically.');
console.log(JSON.stringify({
  weights,
  cases:report,
  dailyRewards,
  dailyWeekTotal,
  dailyAvg,
  checks:{
    evFormula:'sum(probability * rarity-average-item-value)',
    probabilitiesSum:Number(Object.values(weights).reduce((a,b)=>a+b,0).toFixed(4)),
    allCostsPositive:Object.values(prices).every(x=>x>0),
    allCatalogItemsPriced:rows.every(x=>Number.isFinite(x.price)&&x.price>=0),
    noAutomaticRebalance:true
  },
  notes:[
    'Case EV uses the server rarity probabilities and the arithmetic mean of item values inside each rarity because the RPC chooses uniformly within the selected rarity.',
    'Daily is an authenticated server-side faucet; values are audited separately from case EV.',
    'A new seven-day daily cycle repeats after day 7.',
    'EV is descriptive evidence only; canonical prices are not altered by this report.'
  ]
},null,2));

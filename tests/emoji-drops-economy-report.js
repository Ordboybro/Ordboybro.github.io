'use strict';
const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
const prices={smile:100,moves:80,nature:60,food:40,animals:20,transport:20,sport:250,games:500};
const weights={common:.55,rare:.27,epic:.12,mythical:.05,legendary:.01};
const rows=[...schema.matchAll(/\('([^']+)',\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\)/g)].map(m=>({caseId:m[1],rarity:m[3],price:Number(m[4])}));
if(rows.length<300)throw new Error('Canonical catalog unexpectedly small: '+rows.length);
const report=[];
for(const [caseId,cost] of Object.entries(prices)){
 const a=rows.filter(x=>x.caseId===caseId);
 if(!a.length)throw new Error('Missing case: '+caseId);
 const by={}; for(const r of Object.keys(weights)){const xs=a.filter(x=>x.rarity===r);if(!xs.length)throw new Error('Missing rarity '+r+' in '+caseId);by[r]=xs.reduce((s,x)=>s+x.price,0)/xs.length;}
 const ev=Object.entries(weights).reduce((s,[r,w])=>s+w*by[r],0);
 report.push({caseId,cost,items:a.length,ev:Number(ev.toFixed(2)),evRatio:Number((ev/cost).toFixed(4)),rarityAverage:Object.fromEntries(Object.entries(by).map(([r,v])=>[r,Number(v.toFixed(2))]))});
}
console.log(JSON.stringify({weights,cases:report},null,2));

const fs=require('fs'),vm=require('vm');
const schema=fs.readFileSync('supabase/schema.sql','utf8');
const data=fs.readFileSync('js/data.js','utf8');
const ctx={window:{},document:{write(){},getElementById(){return null},addEventListener(){},querySelector(){return null},head:{appendChild(){}},body:{}},getUsers(){return []},localStorage:{getItem(){return null},setItem(){}},console,Date,Number,JSON,MutationObserver:function(){this.observe=()=>{}},requestAnimationFrame:f=>f(),setInterval(){return 0},clearInterval(){},clearTimeout(){},NodeFilter:{SHOW_TEXT:4}};
vm.createContext(ctx);
const d=vm.runInContext(`(()=>{${data};return {cases,casePrices,rarities}})()`,ctx);
const rarityWeights={common:.55,rare:.27,epic:.12,mythical:.05,legendary:.01};
const rarityOrder=Object.keys(rarityWeights);
const rows=[...schema.matchAll(/\('([^']+)',\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\)/g)].map(m=>({caseId:m[1],emoji:m[2],rarity:m[3],price:Number(m[4])}));
if(rows.length<300)throw Error('Server catalog unexpectedly small: '+rows.length);
const report={};
for(const [caseId,items] of Object.entries(d.cases)){
  const server=rows.filter(x=>x.caseId===caseId);
  const price=Number(d.casePrices[caseId]);
  const byRarity={};
  for(const rarity of rarityOrder){
    const front=items.filter(x=>x.rarity===rarity).map(x=>Number(String(x.price).replace(/[^0-9.-]/g,'')));
    const back=server.filter(x=>x.rarity===rarity).map(x=>x.price);
    if(!front.length||!back.length)throw Error(`${caseId}: missing ${rarity}`);
    const avgFront=front.reduce((a,b)=>a+b,0)/front.length;
    const avgBack=back.reduce((a,b)=>a+b,0)/back.length;
    if(Math.abs(avgFront-avgBack)>1e-9)throw Error(`${caseId}/${rarity}: frontend/server EV source drift`);
    byRarity[rarity]={count:back.length,avg:Number(avgBack.toFixed(4)),weight:rarityWeights[rarity]};
  }
  const ev=rarityOrder.reduce((sum,r)=>sum+byRarity[r].avg*rarityWeights[r],0);
  const all=server.map(x=>x.price);
  const min=Math.min(...all),max=Math.max(...all),rtp=ev/price;
  report[caseId]={price,ev:Number(ev.toFixed(4)),rtp:Number(rtp.toFixed(4)),houseEdge:Number((1-rtp).toFixed(4)),min,max,rarity:byRarity};
}
const rtpValues=Object.fromEntries(Object.entries(report).map(([k,v])=>[k,v.rtp]));
console.log('Economy source-of-truth audit OK');
console.log(JSON.stringify({catalogItems:rows.length,rarityWeights,casePrices:d.casePrices,cases:report},null,2));
console.log('RTP values:',JSON.stringify(rtpValues));

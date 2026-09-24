const fs=require('node:fs');
const vm=require('node:vm');
const data=fs.readFileSync(require('node:path').join(__dirname,'..','js','data.js'),'utf8');
const schema=fs.readFileSync(require('node:path').join(__dirname,'..','supabase','schema.sql'),'utf8');
const ctx={console,localStorage:{getItem(){return null}}};
vm.createContext(ctx);vm.runInContext(data+';globalThis.__cases=cases;globalThis.__prices=casePrices;',ctx);
const weights={common:.55,rare:.27,epic:.12,mythical:.05,legendary:.01};
if(Math.abs(Object.values(weights).reduce((a,b)=>a+b,0)-1)>1e-12)throw new Error('Rarity probabilities do not sum to 100%');
if(!/create or replace function public\.case_cost\(p_case_id text\)/.test(schema))throw new Error('Server case_cost function missing');
for(const [key,price] of Object.entries({smile:100,moves:80,nature:60,food:40,animals:20,transport:20,sport:250,games:500}))if(!new RegExp("when ['\\\"]"+key+"['\\\"] then "+price+"\\b","i").test(schema))throw new Error('Server case price drift: '+key);
if(!/roll numeric:=random\(\)/.test(schema)||!/roll<\.01/.test(schema)||!/roll<\.06/.test(schema)||!/roll<\.18/.test(schema)||!/roll<\.45/.test(schema))throw new Error('Server rarity roll thresholds drifted');
const expected={
  smile:{cost:100,ev:16.29},moves:{cost:80,ev:12.99},nature:{cost:60,ev:13.43},food:{cost:40,ev:11.13},
  animals:{cost:20,ev:16.76},transport:{cost:20,ev:14.52},sport:{cost:250,ev:19.25},games:{cost:500,ev:29.25}
};
const rows=Object.entries(ctx.__cases).map(([key,items])=>{
  const av={};
  for(const rarity of Object.keys(weights)){
    const values=items.filter(x=>x.rarity===rarity).map(x=>Number(String(x.price).replace(/[^0-9.-]/g,'')));
    if(!values.length)throw new Error(key+' has no '+rarity+' items');
    av[rarity]=values.reduce((a,b)=>a+b,0)/values.length;
  }
  const ev=Object.entries(weights).reduce((sum,[rarity,p])=>sum+p*av[rarity],0);
  return {key,cost:Number(ctx.__prices[key]),ev:Number(ev.toFixed(2)),ratio:Number((ev/ctx.__prices[key]).toFixed(3)),count:items.length};
});
const serverRows=[...schema.matchAll(/\\('([^']+)',\\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\\)/g)].map(m=>({case_id:m[1],rarity:m[3],price:Number(m[4])}));
if(serverRows.length<300)throw new Error('Server catalog unexpectedly small: '+serverRows.length);
for(const row of rows){
  const exp=expected[row.key];
  if(!exp||row.cost!==exp.cost||row.ev!==exp.ev)throw new Error('Economy drift for '+row.key+': '+JSON.stringify(row)+' expected '+JSON.stringify(exp));
  const server=serverRows.filter(x=>x.case_id===row.key);if(server.length<10)throw new Error('Server catalog incomplete for '+row.key);
  const sev=Object.entries(weights).reduce((sum,[rarity,p])=>{const a=server.filter(x=>x.rarity===rarity).map(x=>x.price);return sum+p*a.reduce((u,v)=>u+v,0)/a.length},0);
  if(Math.abs(sev-row.ev)>.01)throw new Error('Server/frontend EV drift for '+row.key+': '+sev+' vs '+row.ev);
}
console.table(rows);const ratios=rows.map(x=>x.ratio);console.log('EV/COST RANGE',Math.min(...ratios).toFixed(3),'to',Math.max(...ratios).toFixed(3));
console.log('ECONOMY AUDIT OK: rarity weights are 55/27/12/5/1 and EV is calculated from mean item value within each rarity. This test audits canonical data; it intentionally does not change prices.');

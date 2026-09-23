const fs=require('node:fs');
const vm=require('node:vm');
const data=fs.readFileSync(require('node:path').join(__dirname,'..','js','data.js'),'utf8');
const ctx={console,localStorage:{getItem(){return null}}};
vm.createContext(ctx);vm.runInContext(data+';globalThis.__cases=cases;globalThis.__prices=casePrices;',ctx);
const weights={common:.55,rare:.27,epic:.12,mythical:.05,legendary:.01};
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
for(const row of rows){
  const exp=expected[row.key];
  if(!exp||row.cost!==exp.cost||row.ev!==exp.ev)throw new Error('Economy drift for '+row.key+': '+JSON.stringify(row)+' expected '+JSON.stringify(exp));
}
console.table(rows);
console.log('ECONOMY AUDIT OK: rarity weights are 55/27/12/5/1 and EV is calculated from mean item value within each rarity. This test audits canonical data; it intentionally does not change prices.');

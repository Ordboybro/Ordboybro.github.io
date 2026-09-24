'use strict';
const fs=require('fs'),vm=require('vm');
const front=fs.readFileSync('js/data.js','utf8');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

const cases=['smile','moves','nature','food','animals','transport','sport','games'];
const prices={smile:100,moves:80,nature:60,food:40,animals:20,transport:20,sport:250,games:500};

const sandbox={
  document:{getElementById(){return null}},
  window:{},
  console,
  JSON,
  Number,
  String,
  Math,
  Date
};
vm.createContext(sandbox);
vm.runInContext(front+'\n;globalThis.__emojiDropsCases=cases;globalThis.__emojiDropsCasePrices=casePrices;',sandbox);
const frontend=sandbox.__emojiDropsCases;
const frontendPrices=sandbox.__emojiDropsCasePrices;
if(!frontend||!frontendPrices)throw Error('Frontend catalog did not initialize');

const server={};
const sr=/\('([^']+)',\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\)/g;
let m;
while((m=sr.exec(schema)))(server[m[1]]??=[]).push([m[2],m[3],Number(m[4])]);

for(const c of cases){
  if(Number(frontendPrices[c])!==prices[c])throw Error('Frontend case price drift '+c+': '+frontendPrices[c]+' != '+prices[c]);
  const a=server[c]||[],b=Array.isArray(frontend[c])?frontend[c]:[];
  if(a.length!==b.length)throw Error('Catalog count drift '+c+': server='+a.length+' frontend='+b.length);
  for(let i=0;i<a.length;i++){
    const x=[b[i].emoji,b[i].rarity,Number(String(b[i].price).replace(/[^0-9.-]/g,''))];
    if(JSON.stringify(a[i])!==JSON.stringify(x))throw Error('Catalog drift '+c+'['+i+']: server='+JSON.stringify(a[i])+' frontend='+JSON.stringify(x));
  }
  for(const r of ['common','rare','epic','mythical','legendary'])if(!a.some(x=>x[1]===r))throw Error('Missing rarity '+c+': '+r);
}
console.log('Catalog consistency OK: server case_items exactly matches frontend cases (emoji, rarity, value, order) for all 8 cases.');

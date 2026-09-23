'use strict';
const fs=require('fs');
const front=fs.readFileSync('js/data.js','utf8');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

const cases=['smile','moves','nature','food','animals','transport','sport','games'];
const prices={smile:100,moves:80,nature:60,food:40,animals:20,transport:20,sport:250,games:500};
const server={};
const sr=/\('([^']+)',\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\)/g;
let m;
while((m=sr.exec(schema)))(server[m[1]]??=[]).push([m[2],m[3],Number(m[4])]);

const frontend={};
for(const c of cases){
  const start=front.search(new RegExp('(?:^|\\n)\\s*(?:"?'+c+'"?)\\s*:\\s*\\[','m'));
  if(start<0)throw Error('Frontend case missing: '+c);
  const tail=front.slice(start); const nextCase=tail.search(/\\n\\s*,?\\s*(?:[\"']?[a-z]+[\"']?)\\s*:\\s*\\[/i); const end=nextCase>0?nextCase:tail.search(/\\n};/); const block=end>0?tail.slice(0,end):tail;
  const arr=[];const fr=/\{emoji:"([^"]*)",rarity:"(common|rare|epic|mythical|legendary)",price:"([0-9.]+)₽"\}/g;
  let x;while((x=fr.exec(block)))arr.push([x[1],x[2],Number(x[3])]);
  frontend[c]=arr;
}
for(const c of cases){
  if(Number(prices[c])<=0)throw Error('Invalid canonical case price: '+c);
  const a=server[c]||[],b=frontend[c]||[];
  if(a.length!==b.length)throw Error('Catalog count drift '+c+': server='+a.length+' frontend='+b.length);
  for(let i=0;i<a.length;i++)if(JSON.stringify(a[i])!==JSON.stringify(b[i]))throw Error('Catalog drift '+c+'['+i+']: server='+JSON.stringify(a[i])+' frontend='+JSON.stringify(b[i]));
  const rarities=new Set(a.map(x=>x[1]));
  for(const r of ['common','rare','epic','mythical','legendary'])if(!rarities.has(r))throw Error('Missing rarity '+c+': '+r);
}
if(!/when 'smile' then 100/i.test(schema)||!/when 'games' then 500/i.test(schema))throw Error('Server case price contract missing');
console.log('Catalog consistency OK: server case_items exactly matches frontend cases (emoji, rarity, value, order) for all 8 cases.');

'use strict';
const fs=require('fs');
const data=fs.readFileSync('js/data.js','utf8');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

const prices={smile:100,moves:80,nature:60,food:40,animals:20,transport:20,sport:250,games:500};
for(const [k,p] of Object.entries(prices)){
  if(!new RegExp('(?m)^\\s*["\\\\\']?'+k+'["\\\\\']?\\s*:\\s*\\[').test(data)){
    throw new Error('Missing frontend case: '+k);
  }
  if(!new RegExp('when ["\\\\\']?'+k+'["\\\\\']? then '+p+'\\b','i').test(schema)){
    throw new Error('Case price drift: '+k);
  }
}
const rows=[...schema.matchAll(/\\('([^']+)',\\d+,'([^']*)','(common|rare|epic|mythical|legendary)',([0-9.]+)\\)/g)];
if(rows.length<300)throw new Error('Server catalog unexpectedly small: '+rows.length);
for(const k of Object.keys(prices)){
  if(!schema.includes("('"+k+"',"))throw new Error('Server catalog incomplete: '+k);
}
if((schema.match(/create or replace function public\\.open_case_server\\(/g)||[]).length!==1)throw new Error('Multiple open_case_server definitions');
if((schema.match(/create or replace function public\\.upgrade_server\\(/g)||[]).length!==1)throw new Error('Multiple upgrade_server definitions');
for(const marker of ['for update','SELF_PURCHASE_FORBIDDEN','claim_daily_server','INVALID_TARGET','case_items_lookup_idx','alter publication supabase_realtime add table public.live_drops','secure_uniform_roll','roll numeric:=public.secure_uniform_roll()']){
  if(!schema.includes(marker))throw new Error('Economy/realtime contract missing: '+marker);
}
console.log('Canonical economy consistency OK');

'use strict';
const fs=require('fs');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

const required=[
  'market_listings_active_item_unique_idx',
  'select * into l from public.market_listings where id=p_listing_id for update',
  "l.status<>'active'",
  'seller_id=uid',
  'perform 1 from public.profiles where id in (uid,l.seller_id) order by id for update',
  "update public.market_listings set status='sold'",
  "update public.market_listings set status='cancelled'",
  'grant execute on function public.buy_market_listing(uuid) to authenticated',
  'grant execute on function public.cancel_market_listing(uuid) to authenticated',
  'revoke execute on function public.buy_market_listing(uuid) from public,anon',
  'revoke execute on function public.cancel_market_listing(uuid) from public,anon'
];
for(const marker of required)if(!schema.includes(marker))throw new Error('Market race/atomicity contract missing: '+marker);

const buy=schema.match(/create or replace function public\.buy_market_listing\([^)]*\)[\s\S]*?end; \$\$/i)?.[0]||'';
const cancel=schema.match(/create or replace function public\.cancel_market_listing\([^)]*\)[\s\S]*?end; \$\$/i)?.[0]||'';
if(!buy||!cancel)throw new Error('Canonical market RPC definitions missing');
if(!/where id=p_listing_id for update/i.test(buy))throw new Error('Buy must lock listing before mutation');
if(!/where id=p_listing_id for update/i.test(cancel))throw new Error('Cancel must lock listing before mutation');
if(!/where id=uid;\s*update public\.profiles set balance=balance\+l\.listing_price/i.test(buy))throw new Error('Buy must debit buyer before crediting seller');
if(!/status='sold',buyer_id=uid,sold_at=now\(\)/i.test(buy))throw new Error('Buy must finalize the same locked listing');
if(!/status='cancelled',cancelled_at=now\(\)/i.test(cancel))throw new Error('Cancel must finalize the same locked listing');
if(!/where seller_id=uid and status='active' and item->>'id'=p_item_id/i.test(schema))throw new Error('Duplicate active listing guard missing');
console.log('Market race contract OK: listing lock + ordered profile lock + atomic status transition + unique active item constraint');

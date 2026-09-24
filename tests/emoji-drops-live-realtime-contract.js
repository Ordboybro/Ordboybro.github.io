'use strict';
const fs=require('fs');
const live=fs.readFileSync('js/emoji-drops-live-final.js','utf8');
const auth=fs.readFileSync('js/supabase-auth.js','utf8');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

for(const marker of [
  "select('nickname,item,case_id,item_price,created_at')",
  "on('broadcast'",
  "schema:'public'",
  "event:'live_drop'",
  "SUBSCRIBED",
  "CHANNEL_ERROR",
  "TIMED_OUT",
  "ch.unsubscribe?.()",
  "removeChannel?.(ch)",
  "document.addEventListener('visibilitychange'",
  "window.addEventListener('pagehide'",
  "window.addEventListener('pageshow'",
  "window.addEventListener('emoji-drops-auth-change'",
  "observer?.disconnect()",
  "version:21"
])if(!live.includes(marker))throw Error('Live Drops lifecycle/security contract missing: '+marker);

if(/on\(['"]postgres_changes['"]/i.test(live))throw Error('Live Drops must not use Postgres Changes for the public feed');
if(!/on\(['"]broadcast['"]/.test(live))throw Error('Live Drops Broadcast subscription missing');
if(/select\([^)]*\bid\b/i.test(live))throw Error('Live Drops client payload must not request row IDs');
if(/select\([^)]*\buser_id\b/i.test(live))throw Error('Live Drops client payload must not request private user IDs');
if(/select\([^)]*\btransaction_id\b/i.test(live))throw Error('Live Drops client payload must not request transaction IDs');
if(!/grant select \(nickname,item,case_id,item_price,created_at\) on public\.live_drops to authenticated,anon/i.test(schema))throw Error('Live Drops DB grant does not match the public payload');
if(!auth.includes('const publicRow=r=>'))throw Error('Realtime adapter must sanitize Live Drops records before app delivery');
if(!/live_drops_broadcast_insert/.test(schema)||!/realtime\.send\(/.test(schema))throw Error('Live Drops Broadcast trigger contract missing');
if(/alter publication supabase_realtime add table public\.live_drops/.test(schema))throw Error('Live Drops must not remain on Postgres Changes publication');
if(auth.includes('handler.cb({eventType:p?.type||\'INSERT\',new:p?.record'))throw Error('Realtime adapter still forwards raw Postgres records');

console.log('Live Drops realtime contract OK: narrow public payload, reconnect/fallback, visibility/page lifecycle cleanup and observer cleanup are enforced.');

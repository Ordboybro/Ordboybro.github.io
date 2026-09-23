'use strict';
const fs=require('fs');
const live=fs.readFileSync('js/emoji-drops-live-final.js','utf8');
const auth=fs.readFileSync('js/supabase-auth.js','utf8');
const schema=fs.readFileSync('supabase/schema.sql','utf8');

for(const marker of [
  "select('nickname,item,case_id,item_price,created_at')",
  "on('postgres_changes'",
  "schema:'public'",
  "table:'live_drops'",
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
  "version:20"
])if(!live.includes(marker))throw Error('Live Drops lifecycle/security contract missing: '+marker);

if(/select\([^)]*\bid\b/i.test(live))throw Error('Live Drops client payload must not request row IDs');
if(/select\([^)]*\buser_id\b/i.test(live))throw Error('Live Drops client payload must not request private user IDs');
if(/select\([^)]*\btransaction_id\b/i.test(live))throw Error('Live Drops client payload must not request transaction IDs');
if(!/grant select \(nickname,item,case_id,item_price,created_at\) on public\.live_drops to authenticated,anon/i.test(schema))throw Error('Live Drops DB grant does not match the public payload');
const auth=fs.readFileSync('js/supabase-auth.js','utf8');
if(!auth.includes('const publicRow=r=>'))throw Error('Realtime adapter must sanitize Live Drops records before app delivery');
if(auth.includes('handler.cb({eventType:p?.type||\'INSERT\',new:p?.record'))throw Error('Realtime adapter still forwards raw Postgres records');

console.log('Live Drops realtime contract OK: narrow public payload, reconnect/fallback, visibility/page lifecycle cleanup and observer cleanup are enforced.');

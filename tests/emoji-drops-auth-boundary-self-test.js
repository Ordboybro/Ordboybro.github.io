'use strict';
const fs=require('fs');
const core=fs.readFileSync('js/emoji-drops-core.js','utf8');
const auth=fs.readFileSync('js/supabase-auth.js','utf8');

const need=(ok,msg)=>{if(!ok)throw new Error(msg)};
need(core.includes("window.EmojiDropsAuth.rpc('profile_snapshot',{})"),'Authenticated state must hydrate from server profile_snapshot');
need(/if\(session\)\{S=normalize\(base\(\)\);authStateReady=false;renderAll\(\);void syncRemoteProfile\(\);return\}/.test(core),'Login must reset local state before remote hydration');
need(/if\(e\?\.detail\?\.refreshFailed\|\|e\?\.detail\?\.session===null\)\{authStateReady=true;S=normalize\(base\(\)\);persist\(\);/.test(core),'Logout/session failure must discard stale authenticated state');
need(!/S\.inventory=.*localStorage/.test(core),'Authenticated hydration must not merge anonymous inventory into the server snapshot');
need(auth.includes('publishableKey')&&!auth.includes('anonKey'),'Auth bridge must use publishable-key naming');
need(auth.includes('refreshSession')&&auth.includes('scheduleRefresh'),'Auth bridge must keep sessions refreshed');
console.log('Auth boundary contract OK: anonymous local state is isolated, authenticated state resets then hydrates from server, and logout does not merge stale local inventory.');

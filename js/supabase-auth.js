(()=>{'use strict';
/*
 * Emoji Drops — free Supabase Auth + Realtime bridge.
 * Requires js/supabase-config.js. Uses only the browser-safe anon key.
 * Server-side game economy must still be enforced with Supabase RLS/functions.
 */
const cfg=window.EMOJI_DROPS_SUPABASE||{};
if(!cfg.url||!cfg.anonKey){
  console.info('[Emoji Drops] Supabase is not configured yet. See docs/SUPABASE-SETUP.md');
  window.EmojiDropsAuth={configured:false};
  return;
}
const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2').then(()=>{
  const client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.EmojiDropsAuth={configured:true,client};
  const sync=async(session)=>{
    if(session?.user){localStorage.setItem('currentUser',session.user.email||session.user.id);window.dispatchEvent(new CustomEvent('emoji-drops-auth-change',{detail:{session}}));}
    else {localStorage.removeItem('currentUser');window.dispatchEvent(new CustomEvent('emoji-drops-auth-change',{detail:{session:null}}));}
  };
  client.auth.getSession().then(({data})=>sync(data.session));
  client.auth.onAuthStateChange((_event,session)=>sync(session));
  window.EmojiDropsAuth.signUp=async(email,password,nickname='')=>{
    const {data,error}=await client.auth.signUp({email,password,options:{data:{nickname}}});
    if(error)throw error;
    return data;
  };
  window.EmojiDropsAuth.signIn=async(email,password)=>{
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error)throw error;
    return data;
  };
  window.EmojiDropsAuth.signOut=async()=>{const {error}=await client.auth.signOut();if(error)throw error;};
  window.EmojiDropsAuth.resetPassword=async(email)=>{const {data,error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;return data;};
  window.EmojiDropsAuth.getSession=async()=>{const {data,error}=await client.auth.getSession();if(error)throw error;return data.session;};
  window.EmojiDropsAuth.onlineChannel=()=>client.channel('emoji-drops-online',{config:{presence:{key:crypto.randomUUID()}}});
  window.EmojiDropsAuth.liveDropsChannel=()=>client.channel('emoji-drops-live-drops');
}).catch(error=>console.error('[Emoji Drops] Supabase client failed to load',error));
})();

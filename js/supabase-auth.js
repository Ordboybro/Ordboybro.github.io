(()=>{'use strict';
/* Emoji Drops — browser-safe Supabase Auth/Realtime bridge. Requires js/supabase-config.js. */
if(window.EmojiDropsAuth?.__v2)return;
const cfg=window.EMOJI_DROPS_SUPABASE||{};
window.EmojiDropsAuth={configured:Boolean(cfg.url&&cfg.anonKey),client:null,userId:null,__v2:true};
if(!window.EmojiDropsAuth.configured){window.dispatchEvent(new CustomEvent('emoji-drops-auth-ready',{detail:{configured:false}}));return;}
const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2').then(async()=>{
 const client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const A=window.EmojiDropsAuth;A.client=client;
 const sync=session=>{A.userId=session?.user?.id||null;window.dispatchEvent(new CustomEvent('emoji-drops-auth-change',{detail:{session}}));};
 const {data}=await client.auth.getSession();sync(data?.session||null);
 client.auth.onAuthStateChange((_event,session)=>sync(session));
 A.signUp=async(email,password,nickname='')=>{const r=await client.auth.signUp({email,password,options:{data:{nickname}}});if(r.error)throw r.error;return r.data};
 A.signIn=async(email,password)=>{const r=await client.auth.signInWithPassword({email,password});if(r.error)throw r.error;return r.data};
 A.signOut=async()=>{const r=await client.auth.signOut();if(r.error)throw r.error};
 A.getSession=async()=>{const r=await client.auth.getSession();if(r.error)throw r.error;return r.data.session};
 window.dispatchEvent(new CustomEvent('emoji-drops-auth-ready',{detail:{configured:true}}));
}).catch(error=>{console.error('[Emoji Drops] Supabase client failed',error);window.EmojiDropsAuth.error=String(error?.message||error);window.dispatchEvent(new CustomEvent('emoji-drops-auth-ready',{detail:{configured:true,error}}));});
})();

(()=>{'use strict';
/* Emoji Drops — browser-safe Supabase REST bridge. No third-party script loading. */
if(window.EmojiDropsAuth?.__v3)return;
const cfg=window.EMOJI_DROPS_SUPABASE||{};
const A=window.EmojiDropsAuth={configured:Boolean(cfg.url&&cfg.anonKey),client:null,userId:null,__v3:true};
const read=()=>{try{return JSON.parse(localStorage.getItem('emojiDropsSupabaseSession')||'null')}catch{return null}};
const write=s=>{try{if(s)localStorage.setItem('emojiDropsSupabaseSession',JSON.stringify(s));else localStorage.removeItem('emojiDropsSupabaseSession')}catch{}};
function headers(token){return {'apikey':cfg.anonKey,'Authorization':`Bearer ${token||cfg.anonKey}`,'Content-Type':'application/json','Accept':'application/json'}}
async function request(path,opts={},token=null){const r=await fetch(`${String(cfg.url||'').replace(/\/$/,'')}${path}`,{...opts,headers:{...headers(token),...(opts.headers||{})}});let data=null;try{data=await r.json()}catch{}if(!r.ok)throw new Error(String(data?.msg||data?.message||data?.error_description||data?.error||`Supabase ${r.status}`));return data}
if(A.configured){
 const session=read();A.userId=session?.user?.id||null;
 const client={
  auth:{
   getSession:async()=>({data:{session:read()},error:null}),
   signUp:async(email,password,nickname='')=>{const data=await request('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{nickname}})});write(data);A.userId=data?.user?.id||null;return data},
   signInWithPassword:async({email,password})=>{const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});write(data);A.userId=data?.user?.id||null;window.dispatchEvent(new CustomEvent('emoji-drops-auth-change',{detail:{session:data}}));return {data,error:null}},
   signOut:async()=>{const s=read();if(s?.access_token){try{await request('/auth/v1/logout',{method:'POST'},s.access_token)}catch{}}write(null);A.userId=null;window.dispatchEvent(new CustomEvent('emoji-drops-auth-change',{detail:{session:null}}))}
  },
  rpc:async(name,args={})=>{try{return {data:await request(`/rest/v1/rpc/${encodeURIComponent(name)}`,{method:'POST',body:JSON.stringify(args)},read()?.access_token),error:null}}catch(error){return {data:null,error}}},
  from:(table)=>{const q={table,select:'*',order:null,limit:null};const run=async()=>{try{const params=new URLSearchParams({select:q.select});if(q.order)params.set('order',q.order);if(q.limit)params.set('limit',String(q.limit));return {data:await request(`/rest/v1/${encodeURIComponent(q.table)}?${params.toString()}`,{method:'GET'},read()?.access_token),error:null}}catch(error){return {data:null,error}}};return {select:(columns='*')=>{q.select=columns;return {order:(column,{ascending=true}={})=>{q.order=`${column}.${ascending?'asc':'desc'}`;return {limit:n=>{q.limit=n;return run()}}},limit:n=>{q.limit=n;return run()}}}}},
  channel:()=>({on(){return this},subscribe:async()=>{},unsubscribe:async()=>{}})
 };
 A.client=client;
 const s=read();if(s)window.dispatchEvent(new CustomEvent('emoji-drops-auth-change',{detail:{session:s}}));
 A.signUp=async(email,password,nickname='')=>client.auth.signUp(email,password,nickname);
 A.signIn=async(email,password)=>client.auth.signInWithPassword({email,password});
 A.signOut=async()=>client.auth.signOut();
 A.getSession=async()=>read();
}
window.dispatchEvent(new CustomEvent('emoji-drops-auth-ready',{detail:{configured:A.configured}}));
})();

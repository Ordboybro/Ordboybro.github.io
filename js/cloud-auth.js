(() => {
  'use strict';
  const getCfg=()=>window.EMOJI_DROPS_SUPABASE||{url:'',publishableKey:''};
  const boot=()=>{
    const cfg=getCfg();
    if(!cfg.url||!cfg.publishableKey){window.EmojiDropsCloudAuth={configured:false};return;}
    if(!window.supabase?.createClient)return;
    const client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
    window.EmojiDropsSupabase=client;window.EmojiDropsCloudAuth={configured:true,client};
    const applyProfile=async user=>{
      if(!user||!window.state)return;
      const {data}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();
      if(!data)return;
      window.state.currentUser={id:user.id,email:user.email,nickname:data.nickname||user.email?.split('@')[0]||'Player',balance:Number(data.balance??1000),inventory:Array.isArray(data.inventory)?data.inventory:[],stats:data.stats||{},bestDrop:data.best_drop||null};
      window.state.balance=window.state.currentUser.balance;window.state.bestDrop=window.state.currentUser.bestDrop;window.updateBalanceUI?.();window.updateProfileUI?.(true);
    };
    client.auth.onAuthStateChange((event,session)=>{if(session?.user)applyProfile(session.user);if(event==='SIGNED_OUT'&&window.state){window.state.currentUser=null;window.updateProfileUI?.(false);}});
    client.auth.getSession().then(({data})=>data.session?.user&&applyProfile(data.session.user));
    window.cloudAuthSubmit=async()=>{
      const email=document.getElementById('authEmail')?.value.trim(),password=document.getElementById('authPassword')?.value;
      if(!email||!password)return alert('Введите почту и пароль');
      const mode=window.state?.authMode||'login';
      const result=mode==='register'?await client.auth.signUp({email,password,options:{data:{nickname:email.split('@')[0]}}}):await client.auth.signInWithPassword({email,password});
      if(result.error)return alert(result.error.message);
      if(result.data.user)await applyProfile(result.data.user);
      window.closeAuth?.();window.EmojiDropsRouter?.navigate('/profile');
    };
    window.cloudSignOut=()=>client.auth.signOut({scope:'local'});
    const originalLogout=window.logout;window.logout=async()=>{await window.cloudSignOut();if(typeof originalLogout==='function')originalLogout();};
  };
  const load=()=>{if(window.supabase?.createClient){boot();return;}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=boot;document.head.appendChild(s);};
  load();
  document.addEventListener('click',e=>{const submit=e.target.closest('#authPopup .auth-btn:not(.close-auth)');if(!submit||!window.EmojiDropsCloudAuth?.configured)return;e.preventDefault();e.stopImmediatePropagation();window.cloudAuthSubmit();},true);
})();

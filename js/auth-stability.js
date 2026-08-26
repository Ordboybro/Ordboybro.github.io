(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const normalize=v=>String(v||'').trim().toLowerCase();
  const read=()=>{try{const v=JSON.parse(localStorage.getItem('users')||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const write=v=>localStorage.setItem('users',JSON.stringify(v));
  window.submitAuth=function(){
    const email=normalize($('authEmail')?.value),password=String($('authPassword')?.value||''),s=window.state;
    if(!s)return alert('Приложение ещё загружается.');
    if(!email||!password)return alert('Заполните почту и пароль');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return alert('Введите корректную почту');
    if(password.length<6)return alert('Пароль должен содержать минимум 6 символов');
    const list=read();
    if(s.authMode==='login'){
      const u=list.find(x=>normalize(x.email)===email&&x.password===password);
      if(!u)return alert('Неверная почта или пароль');
      window.loginUser?.(u);window.closeAuth?.();return;
    }
    if(list.some(x=>normalize(x.email)===email))return alert('Аккаунт уже существует');
    const u={id:'local_'+Date.now(),twofa:false,email,password,nickname:'user'+Math.floor(1000+Math.random()*9000),balance:1000,inventory:[],stats:{opened:0,upgrades:0,deposited:0,withdrawn:0,withdrawnItems:0,spent:0,received:0},history:[]};
    list.push(u);write(list);window.loginUser?.(u);window.closeAuth?.();
  };
  window.resetLocalAccount=function(){['currentUser','emojiDropsSession','current_user','authUser','users'].forEach(k=>localStorage.removeItem(k));if(window.state){window.state.currentUser=null;window.state.pendingUser=null;window.state.balance=1000}window.updateProfileUI?.(false);window.updateBalanceUI?.();window.closeAuth?.()};
  window.addEventListener('load',()=>{const s=window.state;if(!s||s.currentUser)return;const raw=localStorage.getItem('currentUser')||localStorage.getItem('emojiDropsSession');if(!raw)return;let email=raw;try{const p=JSON.parse(raw);email=p.email||p.user?.email||raw}catch{}const u=read().find(x=>normalize(x.email)===normalize(email));if(u)window.loginUser?.(u)},{once:true});
})();

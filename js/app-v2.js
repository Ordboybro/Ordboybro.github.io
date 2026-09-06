(()=>{'use strict';
/* Single runtime entrypoint. Functional runtime loads first; economy balancing restores the full case catalog and values before integrity/transactions, then focused case/upgrade polish and read-only QA. */
const runtime=document.createElement('script');
runtime.src='js/functional-final.js?v=stable-functional-3';
runtime.async=false;
runtime.onload=()=>{
  const economy=document.createElement('script');
  economy.src='js/economy-balance.js?v=1';
  economy.async=false;
  economy.onload=()=>{
    const hardening=document.createElement('script');
    hardening.src='js/runtime-hardening.js?v=4';
    hardening.async=false;
    hardening.onload=()=>{
      const tx=document.createElement('script');
      tx.src='js/transaction-guard.js?v=1';
      tx.async=false;
      tx.onload=()=>{
        const polish=document.createElement('script');
        polish.src='js/case-upgrade-polish.js?v=2';
        polish.async=false;
        polish.onload=()=>{
          const qa=document.createElement('script');
          qa.src='js/runtime-qa.js?v=2';
          qa.async=false;
          qa.onerror=()=>console.error('Emoji Drops runtime QA failed to load');
          document.body.appendChild(qa);
        };
        polish.onerror=()=>console.error('Emoji Drops case/upgrade polish failed to load');
        document.body.appendChild(polish);
      };
      tx.onerror=()=>console.error('Emoji Drops transaction guard failed to load');
      document.body.appendChild(tx);
    };
    hardening.onerror=()=>console.error('Emoji Drops hardening failed to load');
    document.body.appendChild(hardening);
  };
  economy.onerror=()=>console.error('Emoji Drops economy balancer failed to load');
  document.body.appendChild(economy);
};
runtime.onerror=()=>console.error('Emoji Drops runtime failed to load');
document.body.appendChild(runtime);
})();
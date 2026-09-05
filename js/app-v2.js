(()=>{'use strict';
/* Single runtime entrypoint. Functional runtime loads first; hardening, focused case/upgrade polish, then read-only QA load after it. */
const runtime=document.createElement('script');
runtime.src='js/functional-final.js?v=stable-functional-2';
runtime.async=false;
runtime.onload=()=>{
  const hardening=document.createElement('script');
  hardening.src='js/runtime-hardening.js?v=3';
  hardening.async=false;
  hardening.onload=()=>{
    const polish=document.createElement('script');
    polish.src='js/case-upgrade-polish.js?v=2';
    polish.async=false;
    polish.onload=()=>{
      const qa=document.createElement('script');
      qa.src='js/runtime-qa.js?v=1';
      qa.async=false;
      qa.onerror=()=>console.error('Emoji Drops runtime QA failed to load');
      document.body.appendChild(qa);
    };
    polish.onerror=()=>console.error('Emoji Drops case/upgrade polish failed to load');
    document.body.appendChild(polish);
  };
  hardening.onerror=()=>console.error('Emoji Drops hardening failed to load');
  document.body.appendChild(hardening);
};
runtime.onerror=()=>console.error('Emoji Drops runtime failed to load');
document.body.appendChild(runtime);
})();
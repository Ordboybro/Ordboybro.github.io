(()=>{'use strict';
/* Emoji Drops — final non-invasive smoke/integrity checks. Read-only; never mutates player state. */
const run=()=>{
  const checks=[];const pass=(name,ok,detail='')=>checks.push({name,ok:!!ok,detail});
  const s=window.__emojiDropsSerialization;
  pass('transaction serialization loaded',!!s?.version,s?`v${s.version}`:'missing');
  pass('transaction serialization mode safe',s?.mode==='web-locks'||s?.mode==='engine-fallback',s?.mode||'missing');
  pass('Web Locks enhancement detected or fallback active',s?.webLocks===true||s?.mode==='engine-fallback',s?.webLocks?'web-locks':'engine-fallback');
  pass('transaction lock name stable',s?.lockName==='emoji-drops-transaction',s?.lockName||'missing');
  const engine=window.__emojiDropsEngine;
  pass('engine callable after serialization',typeof engine?.openCase==='function'&&typeof engine?.upgrade==='function');
  pass('engine idle before user action',engine?.state?.busy===false,`busy=${engine?.state?.busy}`);
  pass('authoritative action bridge active',window.__emojiDropsActionBridge?.authoritative===true,window.__emojiDropsActionBridge?`v${window.__emojiDropsActionBridge.version}`:'missing');
  const perf=window.__emojiDropsPerf;
  pass('performance profile valid',!!perf&&perf.reelItems>=18&&perf.reelItems<=56&&perf.reelTarget<perf.reelItems&&perf.reelDuration>=0&&perf.upgradeDuration>=0&&perf.liveLimit>=1&&perf.liveLimit<=10);
  const quality=window.__emojiDropsQualityQA;
  pass('quality guard reported',!!quality?.version,quality?`frame=${quality.frameSampleMs??'?'}ms; adaptive=${quality.adaptive}`:'pending');
  const runtime=window.__emojiDropsQA;
  pass('runtime QA completed',!!runtime?.ranAt, runtime?`checks=${runtime.checks?.length??'?'}; failed=${runtime.failedCount??'?'}`:'pending');
  const failed=checks.filter(x=>!x.ok);window.__emojiDropsFinalQA={version:3,ok:failed.length===0,checks,failedCount:failed.length,ranAt:new Date().toISOString()};
  console.groupCollapsed(`Emoji Drops Final QA: ${failed.length?'FAIL':'PASS'} (${checks.length} checks)`);checks.forEach(x=>console[x.ok?'log':'error'](`${x.ok?'✓':'✗'} ${x.name}`,x.detail));console.groupEnd();
};
const boot=()=>setTimeout(run,0);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

(()=>{'use strict';
/* Emoji Drops — final adaptive quality guard. Keeps animation smooth without touching the visual baseline. */
const run=()=>{
  const p=window.__emojiDropsPerf;
  if(!p||p.reduced||typeof requestAnimationFrame!=='function'){
    window.__emojiDropsQualityQA={version:1,adaptive:false,reason:p?.reduced?'reduced-motion':'unavailable'};
    return;
  }
  let frames=0,last=0,total=0,raf=0;
  const sample=t=>{
    if(last) total+=t-last;
    last=t;
    if(++frames<14){raf=requestAnimationFrame(sample);return;}
    const avg=total/Math.max(1,frames-1);
    const adjusted=avg>20;
    if(adjusted){
      p.lowEnd=true;
      p.reelItems=Math.min(Number(p.reelItems)||56,24);
      p.reelTarget=Math.min(Number(p.reelTarget)||46,18);
      p.reelDuration=Math.min(Number(p.reelDuration)||2800,1250);
      p.upgradeDuration=Math.min(Number(p.upgradeDuration)||850,600);
      p.liveLimit=Math.min(Number(p.liveLimit)||10,6);
    }
    p.frameSampleMs=Math.round(avg*10)/10;
    p.adaptiveQuality=adjusted;
    window.__emojiDropsQualityQA={version:1,adaptive:adjusted,frameSampleMs:p.frameSampleMs};
    if(raf)cancelAnimationFrame(raf);
  };
  requestAnimationFrame(sample);
};
const start=()=>{try{run()}catch(err){console.warn('Emoji Drops quality guard failed',err)}};
if('requestIdleCallback' in window) requestIdleCallback(start,{timeout:1800});
else setTimeout(start,900);
})();

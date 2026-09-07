(()=>{'use strict';
/* Emoji Drops — final adaptive quality guard. Samples real frame pacing without breaking the requested animation timing. */
const run=()=>{
  const p=window.__emojiDropsPerf;
  if(!p||p.reduced||typeof requestAnimationFrame!=='function'){
    window.__emojiDropsQualityQA={version:3,adaptive:false,reason:p?.reduced?'reduced-motion':'unavailable'};
    return;
  }
  let frames=0,last=0,total=0,max=0,raf=0;
  const sample=t=>{
    if(last){const dt=t-last;total+=dt;if(dt>max)max=dt}
    last=t;
    if(++frames<30){raf=requestAnimationFrame(sample);return;}
    const count=Math.max(1,frames-1),avg=total/count,adjusted=avg>20||max>45;
    if(adjusted){
      p.lowEnd=true;
      p.reelItems=Math.min(Number(p.reelItems)||56,24);
      p.reelTarget=Math.min(Number(p.reelTarget)||46,18);
      /* Preserve the product timing: quality is reduced by reel density, never by shortening the animation. */
      p.reelDuration=Math.max(5000,Math.min(Number(p.reelDuration)||5500,5500));
      p.upgradeDuration=Math.max(4500,Math.min(Number(p.upgradeDuration)||5000,5000));
      p.liveLimit=Math.min(Number(p.liveLimit)||10,6);
    }
    p.frameSampleMs=Math.round(avg*10)/10;
    p.frameMaxMs=Math.round(max*10)/10;
    p.adaptiveQuality=adjusted;
    window.__emojiDropsQualityQA={version:3,adaptive:adjusted,frameSampleMs:p.frameSampleMs,frameMaxMs:p.frameMaxMs,samples:count};
    if(raf)cancelAnimationFrame(raf);
  };
  const start=()=>{try{run()}catch(err){console.warn('Emoji Drops quality guard failed',err)}};
  requestAnimationFrame(start);
};
setTimeout(run,0);
})();

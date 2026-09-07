(()=>{'use strict';
/* Emoji Drops — final adaptive quality guard. Samples real frame pacing without touching the visual baseline. */
const run=()=>{
  const p=window.__emojiDropsPerf;
  if(!p||p.reduced||typeof requestAnimationFrame!=='function'){
    window.__emojiDropsQualityQA={version:2,adaptive:false,reason:p?.reduced?'reduced-motion':'unavailable'};
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
      p.reelDuration=Math.min(Number(p.reelDuration)||2800,1250);
      p.upgradeDuration=Math.min(Number(p.upgradeDuration)||850,600);
      p.liveLimit=Math.min(Number(p.liveLimit)||10,6);
    }
    p.frameSampleMs=Math.round(avg*10)/10;
    p.frameMaxMs=Math.round(max*10)/10;
    p.adaptiveQuality=adjusted;
    window.__emojiDropsQualityQA={version:2,adaptive:adjusted,frameSampleMs:p.frameSampleMs,frameMaxMs:p.frameMaxMs,samples:count};
    if(raf)cancelAnimationFrame(raf);
  };
  requestAnimationFrame(sample);
};
const start=()=>{try{run()}catch(err){console.warn('Emoji Drops quality guard failed',err)}};
setTimeout(start,0);
})();

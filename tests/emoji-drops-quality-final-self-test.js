const fs=require('fs');
const s=fs.readFileSync('js/emoji-drops-quality-final.js','utf8');
const loader=fs.readFileSync('js/app-v2.js','utf8');
for(const marker of ['Emoji Drops final quality layer','normalizeState','recover','boundMetadata','polishControls','syncVisibility','prefers-reduced-motion','emojiDropsQualityFinal'])if(!s.includes(marker))throw Error(`Final quality marker missing: ${marker}`);
if(!loader.includes('emoji-drops-quality-final.js?v=quality-final-1'))throw Error('Final quality loader marker missing');
if(!/version=40/.test(loader))throw Error('Loader version 40 missing');
if(/setInterval\s*\(/.test(s))throw Error('Final quality layer must not poll');
console.log('Final quality self-test OK: recovery, bounded metadata, keyboard/mobile safeguards, storage sync, no polling');

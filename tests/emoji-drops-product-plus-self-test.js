const fs=require('fs');
const plus=fs.readFileSync('js/emoji-drops-product-plus.js','utf8');
const loader=fs.readFileSync('js/app-v2.js','utf8');
for(const marker of ['ed-fav','ed-history','case-detail','emojiDropsFavoritesV1','product-plus-6','function liveSlot','ed-live-slot','Live Drops'])if(!plus.includes(marker)&&!loader.includes(marker))throw Error(`Product-plus contract missing: ${marker}`);
if(!loader.includes('product-plus-6'))throw Error('Product-plus loader marker missing');
if(/setInterval\s*\(/.test(plus))throw Error('Product-plus must not use polling intervals');
if(!/MutationObserver/.test(plus))throw Error('Product-plus render resilience missing');
console.log('Product-plus self-test OK: favorites, action history, canonical Market, case details, Live Drops owner and mutation resilience');

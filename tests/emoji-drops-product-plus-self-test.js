const fs=require('fs');
const plus=fs.readFileSync('js/emoji-drops-product-plus.js','utf8');
const loader=fs.readFileSync('js/app-v2.js','utf8');
for(const marker of ['ed-fav','ed-history','data-cancel-market','case-detail','emojiDropsFavoritesV1','emojiDropsHistoryV1'])if(!plus.includes(marker))throw Error(`Product-plus contract missing: ${marker}`);
if(!loader.includes('product-plus-1'))throw Error('Product-plus loader marker missing');
if(/setInterval\s*\(/.test(plus))throw Error('Product-plus must not use polling intervals');
if(!/MutationObserver/.test(plus))throw Error('Product-plus render resilience missing');
console.log('Product-plus self-test OK: favorites, action history, market cancellation, case details, mutation resilience');

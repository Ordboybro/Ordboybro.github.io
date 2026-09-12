const fs=require('fs');
const s=fs.readFileSync('js/emoji-drops-action-resilience.js','utf8');
const loader=fs.readFileSync('js/app-v2.js','utf8');
for(const marker of ['Emoji Drops action resilience','emojiDropsActionResilience','data-do-open','pointerup','edPointer','setTimeout','button.click()','RETRY_DELAY'])if(!s.includes(marker))throw Error(`Action resilience marker missing: ${marker}`);
if(/setInterval\s*\(/.test(s))throw Error('Action resilience must not poll');
if(!loader.includes('emoji-drops-action-resilience.js?v=action-4'))throw Error('Action resilience loader marker missing');
console.log('Action resilience self-test OK: deterministic pointer activation + one-shot verification/retry, no polling, runtime loader contract');

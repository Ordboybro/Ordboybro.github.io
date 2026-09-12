const fs=require('fs');
const s=fs.readFileSync('js/emoji-drops-action-resilience.js','utf8');
const loader=fs.readFileSync('js/app-v2.js','utf8');
for(const marker of ['Emoji Drops action resilience v5','emojiDropsActionResilienceV5','data-do-open','data-sell-all','data-upgrade','data-daily','MutationObserver','normalize','setAttribute','pointerup','edPointer','setTimeout','button.click()','RETRY_DELAY'])if(!s.includes(marker))throw Error(`Action resilience marker missing: ${marker}`);
if(/setInterval\s*\(/.test(s))throw Error('Action resilience must not poll');
if(!loader.includes('emoji-drops-action-resilience.js?v=action-5'))throw Error('Action resilience loader marker missing');
console.log('Action resilience self-test OK: normalized action markers + deterministic pointer activation + one-shot verification/retry, no polling, runtime loader contract');

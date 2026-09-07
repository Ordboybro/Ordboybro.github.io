(()=>{'use strict';
/* Emoji Drops — browser-level transaction serialization. Web Locks closes the cross-tab race window; the engine's localStorage journal/lock remains the recovery fallback. */
const engine=window.__emojiDropsEngine;
if(!engine?.openCase||!engine?.upgrade){console.warn('Emoji Drops transaction serialization: engine unavailable');return}
const nativeOpen=engine.openCase,nativeUpgrade=engine.upgrade;
const supported=!!navigator.locks?.request;
const run=(name,fn)=>supported?navigator.locks.request(name,{mode:'exclusive'},fn):fn();
engine.openCase=()=>run('emoji-drops-transaction',nativeOpen);
engine.upgrade=()=>run('emoji-drops-transaction',nativeUpgrade);
window.__emojiDropsSerialization={version:1,webLocks:supported,mode:supported?'web-locks':'engine-fallback',lockName:'emoji-drops-transaction'};
})();

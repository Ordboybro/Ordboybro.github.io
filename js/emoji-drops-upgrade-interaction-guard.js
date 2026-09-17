(()=>{'use strict';
/* Final Upgrade interaction owner: capture-phase selection + spin dispatch. Legacy document handlers must never swallow the Upgrade transaction. */
if(window.__emojiDropsUpgradeInteractionGuard)return;window.__emojiDropsUpgradeInteractionGuard=true;
const snapshot=()=>{try{const s=JSON.parse(localStorage.getItem('emojiDropsStateV3')||'null');return{s:s?.stats?.upgrades||0,i:Array.isArray(s?.inventory)?s.inventory.length:0}}catch{return null}};
window.addEventListener('click',e=>{const root=document.getElementById('view-upgrade');if(!root?.classList.contains('active'))return;const from=e.target.closest?.('[data-up-from]'),to=e.target.closest?.('[data-up-to]'),spin=e.target.closest?.('[data-upgrade]');if(!from&&!to&&!spin)return;e.preventDefault();e.stopImmediatePropagation();
if(from){root.dataset.upgradeWager=from.dataset.upFrom||'';root.dataset.upgradeGoal='';window.EmojiDropsUpgradeFinal?.build?.();return}
if(to){root.dataset.upgradeGoal=to.dataset.upTo||'';window.EmojiDropsUpgradeFinal?.build?.();return}
/* The final Upgrade owner installs the transaction handler as the button's onclick property. Invoke that owner directly from capture so older document-level handlers cannot replace/rerender the control before the transaction starts. */
const handler=spin.onclick;if(typeof handler!=='function')return;const before=snapshot();try{handler.call(spin,e)}catch(err){console.error('Emoji Drops Upgrade interaction failed',err);return}
/* Local/offline fallback commits after its wheel animation. If the first owner call was swallowed before scheduling its commit, retry the same owner once after that window. Server-authoritative calls are never retried. */
if(!window.EmojiDropsAuth?.userId&&before){setTimeout(()=>{const now=snapshot();if(!spin.isConnected||!now||now.s!==before.s||now.i!==before.i)return;try{handler.call(spin,e)}catch(err){console.error('Emoji Drops Upgrade guarded retry failed',err)}},2800)}
},true);
})();

(()=>{'use strict';
/* Final Upgrade interaction owner: capture-phase selection + spin dispatch. Legacy document handlers must never swallow the Upgrade transaction. */
if(window.__emojiDropsUpgradeInteractionGuard)return;window.__emojiDropsUpgradeInteractionGuard=true;
window.addEventListener('click',e=>{const root=document.getElementById('view-upgrade');if(!root?.classList.contains('active'))return;const from=e.target.closest?.('[data-up-from]'),to=e.target.closest?.('[data-up-to]'),spin=e.target.closest?.('[data-upgrade]');if(!from&&!to&&!spin)return;e.preventDefault();e.stopImmediatePropagation();
if(from){root.dataset.upgradeWager=from.dataset.upFrom||'';root.dataset.upgradeGoal='';window.EmojiDropsUpgradeFinal?.build?.();return}
if(to){root.dataset.upgradeGoal=to.dataset.upTo||'';window.EmojiDropsUpgradeFinal?.build?.();return}
/* The final Upgrade owner installs the transaction handler as the button's onclick property. Invoke that owner directly from capture so older document-level handlers cannot replace/rerender the control before the transaction starts. */
const handler=spin.onclick;if(typeof handler==='function'){try{handler.call(spin,e)}catch(err){console.error('Emoji Drops Upgrade interaction failed',err)}}},true);
})();

(()=>{'use strict';
/* Final Upgrade interaction owner: window-capture runs before legacy document handlers. */
if(window.__emojiDropsUpgradeInteractionGuard)return;window.__emojiDropsUpgradeInteractionGuard=true;
window.addEventListener('click',e=>{const root=document.getElementById('view-upgrade');if(!root?.classList.contains('active'))return;const from=e.target.closest?.('[data-up-from]'),to=e.target.closest?.('[data-up-to]');if(!from&&!to)return;e.preventDefault();e.stopImmediatePropagation();if(from){root.dataset.upgradeWager=from.dataset.upFrom||'';root.dataset.upgradeGoal='';}else{root.dataset.upgradeGoal=to.dataset.upTo||'';}window.EmojiDropsUpgradeFinal?.build?.()},true);
})();

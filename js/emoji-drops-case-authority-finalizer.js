(()=>{'use strict';
/* Final case-authority handoff: v24 is a visual shell, never the owner of the canonical case API. */
const api=window.__emojiDropsExactAuthoritativeApi;
if(api&&typeof api.open==='function'){
  window.EmojiDropsCaseShowcaseExact=api;
  window.__emojiDropsCaseCanonicalApi=api;
}
})();

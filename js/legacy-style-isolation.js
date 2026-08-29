/* Emoji Drops — isolate obsolete visual patch generations.
 * index.html is the preserved design base. layout-sanitizer.css is the
 * single consolidated visual authority for the main site.
 */
(() => {
  'use strict';

  const KEEP = /\/layout-sanitizer\.css$/i;
  const MOBILE = /\/mobile\.css$/i;
  const ROUTER = /\/router\.css$/i;
  const DISABLED = /\/(?:style|polish|premium|quality-pass|quality-v2|runtime-quality|final-layout|final-polish|final-stability|finish|last-polish|site-fixes-20260826|stable-polish|ultimate-ui|unified|updates|motion-system|component-layout)\.css$/i;

  function isolate() {
    const isMobileSite = document.body?.classList.contains('mobile-app');

    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const path = (() => {
        try { return new URL(link.href, location.href).pathname; }
        catch { return link.getAttribute('href') || ''; }
      })();

      if (KEEP.test(path)) {
        link.disabled = false;
        return;
      }

      // mobile.css belongs to the dedicated mobile.html surface; router.css
      // is harmless and contains only route-specific classes.
      if (MOBILE.test(path)) {
        link.disabled = !isMobileSite;
        return;
      }
      if (ROUTER.test(path)) return;

      if (DISABLED.test(path)) {
        link.disabled = true;
        link.dataset.legacyDisabled = '1';
      }
    });
  }

  isolate();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', isolate, { once: true });
  }
  window.addEventListener('load', isolate, { once: true });
  window.EmojiDropsStyleIsolation = Object.freeze({ isolate });
})();

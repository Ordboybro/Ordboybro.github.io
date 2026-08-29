/* Emoji Drops — isolate legacy visual patch layers.
 * The preserved old design lives in index.html; patch generations must not
 * compete with the consolidated layout/motion authority.
 */
(() => {
  'use strict';

  const LEGACY_RE = /(?:polish|premium|quality|final-layout|final-polish|final-stability|finish|last-polish|site-fixes|runtime-quality|motion-system|component-layout)/i;

  function isolate() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const path = (() => {
        try { return new URL(link.href, location.href).pathname; }
        catch { return link.getAttribute('href') || ''; }
      })();
      if (LEGACY_RE.test(path) && !/layout-sanitizer\.css$/i.test(path)) {
        link.disabled = true;
        link.dataset.legacyDisabled = '1';
      }
    });
  }

  // Run after parsing so all declarative styles are present, then again after
  // the other runtime loaders have had a chance to append their styles.
  isolate();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', isolate, { once: true });
  }
  window.addEventListener('load', isolate, { once: true });
  window.EmojiDropsStyleIsolation = Object.freeze({ isolate });
})();

/* Emoji Drops — isolate obsolete visual patch generations. */
(() => {
  'use strict';

  const KEEP = /\/layout-sanitizer\.css$/i;
  const MOBILE = /\/mobile\.css$/i;
  const ROUTER = /\/router\.css$/i;
  const DISABLED = /\/(?:style|polish|premium|quality-pass|quality-v2|runtime-quality|final-layout|final-polish|final-stability|finish|last-polish|site-fixes-20260826|stable-polish|ultimate-ui|unified|updates|motion-system|component-layout)\.css$/i;

  const pathOf = node => {
    try { return new URL(node.href || node.getAttribute?.('href') || '', location.href).pathname; }
    catch { return node.getAttribute?.('href') || ''; }
  };

  function isolateLink(link) {
    if (!(link instanceof HTMLLinkElement) || link.rel !== 'stylesheet') return;
    const path = pathOf(link);
    const isMobileSite = document.body?.classList.contains('mobile-app');

    if (KEEP.test(path)) {
      link.disabled = false;
      return;
    }
    if (MOBILE.test(path)) {
      link.disabled = !isMobileSite;
      return;
    }
    if (ROUTER.test(path)) return;

    if (DISABLED.test(path)) {
      link.disabled = true;
      link.dataset.legacyDisabled = '1';
    }
  }

  function isolate() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(isolateLink);
  }

  isolate();

  // Old scripts can dynamically inject their styles after bootstrap. Catch
  // those additions immediately instead of allowing one frame of bad layout.
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.('link[rel="stylesheet"]')) isolateLink(node);
        node.querySelectorAll?.('link[rel="stylesheet"]').forEach(isolateLink);
      }
    }
  });
  observer.observe(document.head, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', isolate, { once: true });
  }
  window.addEventListener('load', isolate, { once: true });
  window.EmojiDropsStyleIsolation = Object.freeze({ isolate });
})();

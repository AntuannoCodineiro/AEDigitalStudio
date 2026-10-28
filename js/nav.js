(() => {
  // Section links scroll in place and leave the address clean (no #fragment).
  // From other pages, "/#section" goes home and then scrolls, again without a fragment in the address.
  const KEY = 'ae-scroll-to';
  const onHome = !!document.getElementById('start');

  const target = (id) => (id === 'start' ? document.documentElement : document.getElementById(id));
  const go = (id) => {
    const el = target(id);
    if (!el) return false;
    if (id === 'start') {
      window.scrollTo({ top: 0 });
    } else {
      el.scrollIntoView({ block: 'start' }); // smooth or not, as the stylesheet and reduced-motion decide
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
    return true;
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    const m = /^(\/?)#([\w-]+)$/.exec(a.getAttribute('href'));
    if (!m) return;
    const [, slash, id] = m;
    if (!slash || onHome) {
      if (go(id)) e.preventDefault();
      return;
    }
    // another page, link to a section of the home page
    e.preventDefault();
    try { sessionStorage.setItem(KEY, id); location.assign('/'); } catch { location.assign('/#' + id); }
  });

  if (!onHome) return;

  // arriving from another page, or from an old link that still carries a #fragment
  const arrive = () => {
    let id = null;
    try { id = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
    if (id) requestAnimationFrame(() => go(id));
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  };
  if (document.readyState === 'complete') arrive(); else addEventListener('load', arrive, { once: true });
})();

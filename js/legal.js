(() => {
  // marks the section being read in the table of contents
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (!links.length) return;
  const pairs = links
    .map((a) => ({ a, s: document.getElementById(a.getAttribute('href').slice(1)) }))
    .filter((x) => x.s);
  if (!pairs.length) return;

  let current = null;
  const update = () => {
    // the last section whose top has passed the upper third of the screen is the one being read
    const line = innerHeight * 0.3;
    let next = pairs[0];
    for (const p of pairs) if (p.s.getBoundingClientRect().top <= line) next = p;
    if (next === current) return;
    current = next;
    pairs.forEach((p) => (p === next ? p.a.setAttribute('aria-current', 'true') : p.a.removeAttribute('aria-current')));
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();

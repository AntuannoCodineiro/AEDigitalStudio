(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // entrances: each part rises once as its section arrives
  const items = document.querySelectorAll('.r');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
  } else {
    // the first screen performs on load, not on intersection
    requestAnimationFrame(() => document.querySelectorAll('.hero .r').forEach((el) => el.classList.add('in')));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  // phone menu
  const menu = document.getElementById('menu');
  const menuBtn = document.querySelector('.menu-btn');
  if (menu && menuBtn) {
    const closeBtn = menu.querySelector('.menu-close');
    const focusable = () => [...menu.querySelectorAll('a[href], button')];
    const setOpen = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        void menu.offsetWidth; // render the transparent state once, so the fade can run
        menu.classList.add('open');
        menu.focus();
      } else {
        menu.classList.remove('open');
        menuBtn.focus({ preventScroll: true });
        const done = () => { if (!menu.classList.contains('open')) menu.hidden = true; };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) done();
        else {
          menu.addEventListener('transitionend', (e) => { if (e.target === menu && e.propertyName === 'opacity') done(); });
          setTimeout(done, 600);
        }
      }
    };
    menuBtn.addEventListener('click', () => setOpen(true));
    closeBtn.addEventListener('click', () => setOpen(false));
    menu.addEventListener('click', (e) => { if (e.target.closest('[data-menu-close]')) setOpen(false); });
    addEventListener('keydown', (e) => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      const f = focusable();
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches && menu.classList.contains('open')) setOpen(false); });
  }

  // the brief: a sentence the visitor completes, sent straight from the page
  const $ = (id) => document.getElementById(id);
  const form = $('briefForm');
  const who = $('q-who'), goal = $('q-goal'), budget = $('q-budget'), when = $('q-when'), have = $('q-have');
  const extras = [...document.querySelectorAll('input[name="extra"]')];
  const mail = $('q-mail'), tel = $('q-tel'), send = $('sendBrief'), match = $('match'), note = $('formNote');
  if (!form || !who || !goal || !budget || !when || !have || !extras.length || !send || !mail) return;

  const TO = 'kontakt@aedigitalstudio.pl';
  const closest = {
    'who-uslugi': ['alex', 'alex ochrona', 'strona firmowa z kalkulatorem oszczędności'],
    'who-b2b': ['alex', 'alex ochrona', 'strona firmy dla firm, która liczy oszczędność klienta'],
    'who-sklep': ['cherry', 'oh cherry', 'sklep internetowy z modą'],
    'who-klub': ['sunday', 'sunday swimming club', 'zapisy na zajęcia w kilku krokach'],
    'who-salon': ['sunday', 'sunday swimming club', 'rezerwacje i zapisy online'],
    'who-gastro': ['sunday', 'sunday swimming club', 'formularz rezerwacji w kilku krokach'],
    'who-inne': ['alex', 'alex ochrona', 'zacznij od przykładu, resztę ustalimy w rozmowie'],
  };
  // what the page should do can point to a closer example than who it is for
  const byGoal = {
    'sprzedaje online': ['cherry', 'oh cherry', 'sklep z płatnościami, InPostem i odzyskiwaniem koszyków'],
    'przyjmuje zapisy': ['sunday', 'sunday swimming club', 'zapisy na zajęcia w kilku krokach'],
    'przyjmuje rezerwacje': ['sunday', 'sunday swimming club', 'rezerwacje i zapisy online'],
    'pomaga policzyć ofertę': ['alex', 'alex ochrona', 'kalkulator oszczędności na stronie firmowej'],
  };
  const text = (sel) => sel.options[sel.selectedIndex].textContent.trim();
  const brief = () => [
    `Potrzebuję strony dla ${text(who)}, która ${text(goal)}, w budżecie ${text(budget)}.`,
    `Chcę ją mieć ${text(when)}. Mam już: ${text(have)}.`,
    `Do tego: ${extras.filter((x) => x.checked).map((x) => x.value).join(', ') || 'nic więcej'}.`,
    mail.value ? `E-mail: ${mail.value}` : '',
    tel && tel.value.trim() ? `Telefon: ${tel.value.trim()}` : '',
  ].filter(Boolean).join('\n');
  const mailto = () => `mailto:${TO}?subject=${encodeURIComponent('Brief na stronę: ' + text(who))}&body=${encodeURIComponent('Dzień dobry,\n\n' + brief() + '\n\nPozdrawiam')}`;

  const update = () => {
    const c = byGoal[text(goal)] || closest[who.value];
    match.replaceChildren(
      document.createTextNode('Najbliżej tego tematu: '),
      Object.assign(document.createElement('a'), { href: '#' + c[0], textContent: c[1] }),
      document.createTextNode(', ' + c[2] + '.')
    );
  };
  [who, goal, budget, when, have, ...extras].forEach((el) => el.addEventListener('input', update));
  update();

  const say = (...parts) => { note.hidden = false; note.replaceChildren(...parts); };
  const fallback = () => [
    document.createTextNode('Nie udało się wysłać. Spróbuj jeszcze raz albo napisz na '),
    Object.assign(document.createElement('a'), { href: mailto(), textContent: TO }),
    document.createTextNode('.'),
  ];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const key = (form.dataset.accessKey || '').trim();
    if (!key) { location.href = mailto(); return; } // until a form key is set, fall back to the visitor's mail app
    send.disabled = true;
    send.textContent = 'Wysyłam…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: 'Brief na stronę: ' + text(who),
          from_name: 'Formularz na aedigitalstudio.pl',
          email: mail.value,
          phone: tel ? tel.value.trim() : '',
          message: brief(),
          botcheck: form.elements.botcheck.checked,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || res.status);
      say(document.createTextNode('Dziękuję, brief poszedł. Odpowiem na podany adres w ciągu jednego dnia roboczego.'));
      send.textContent = 'Wysłano';
      if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form: 'brief' }); // only exists after consent
    } catch (err) {
      send.disabled = false;
      send.textContent = 'Wyślij brief →';
      say(...fallback());
    }
  });
})();

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

  // the brief: a sentence the visitor completes, and the closest piece of work
  const $ = (id) => document.getElementById(id);
  const who = $('q-who'), goal = $('q-goal'), budget = $('q-budget'), when = $('q-when'), have = $('q-have');
  const extras = [...document.querySelectorAll('input[name="extra"]')];
  const mail = $('q-mail'), send = $('sendBrief'), match = $('match');
  if (!who || !goal || !budget || !when || !have || !extras.length || !send) return;

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
  const update = () => {
    const c = byGoal[text(goal)] || closest[who.value];
    match.replaceChildren(
      document.createTextNode('Najbliżej tego tematu: '),
      Object.assign(document.createElement('a'), { href: '#' + c[0], textContent: c[1] }),
      document.createTextNode(', ' + c[2] + '.')
    );
    const body = [
      'Dzień dobry,',
      '',
      `potrzebuję strony dla ${text(who)}, która ${text(goal)}, w budżecie ${text(budget)}.`,
      `Chcę ją mieć ${text(when)}. Mam już: ${text(have)}.`,
      `Do tego: ${extras.filter((x) => x.checked).map((x) => x.value).join(', ') || 'nic więcej'}.`,
      mail && mail.value ? `Mój e-mail: ${mail.value}` : '',
      '',
      'Pozdrawiam',
    ].join('\n');
    send.href = 'mailto:kontakt@aedigitalstudio.pl?subject=' + encodeURIComponent('Brief na stronę: ' + text(who)) + '&body=' + encodeURIComponent(body);
  };
  [who, goal, budget, when, have, mail, ...extras].forEach((el) => el && el.addEventListener('input', update));
  update();
})();

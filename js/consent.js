(() => {
  // Google Analytics loads only after the visitor clicks "Akceptuję".
  // Put the measurement ID (e.g. 'G-XXXXXXXXXX') below; while it is empty nothing is shown or loaded.
  const DEFAULT_GA_ID = 'G-3VH45GX74Z';
  const GA_ID = (window.AE_GA_ID || DEFAULT_GA_ID).trim();

  const KEY = 'ae-cookie-consent';
  const YEAR = 365 * 24 * 60 * 60 * 1000;
  const read = () => {
    try { const v = JSON.parse(localStorage.getItem(KEY)); return v && Date.now() - v.t < YEAR ? v.v : null; } catch { return null; }
  };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify({ v, t: Date.now() })); } catch { /* private mode: the choice just is not remembered */ } };

  const settings = document.querySelectorAll('[data-cookie-settings]');
  if (!GA_ID) { settings.forEach((el) => el.remove()); return; }

  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  };

  // withdrawing consent stops further hits and removes the analytics cookies
  const clear = () => {
    window['ga-disable-' + GA_ID] = true;
    const host = location.hostname.replace(/^www\./, '');
    for (const part of document.cookie.split(';')) {
      const name = part.split('=')[0].trim();
      if (!/^(_ga(_.*)?|_gid|_gat.*)$/.test(name)) continue;
      for (const domain of ['', host, '.' + host, 'www.' + host]) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
      }
    }
  };

  let bar = null;
  const close = () => { if (bar) { bar.remove(); bar = null; } };
  const choose = (value) => {
    write(value);
    close();
    if (value === 'granted') load(); else clear();
  };
  const open = () => {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Zgoda na cookies');
    bar.innerHTML = '<p>Używam Google Analytics, żeby zobaczyć, ile osób odwiedza stronę. Włączę go tylko, jeśli się zgodzisz. Szczegóły w <a href="/polityka-prywatnosci">polityce prywatności</a>.</p>'
      + '<div class="actions"><button type="button" data-choice="granted">Akceptuję</button><button type="button" data-choice="denied">Odrzucam</button></div>';
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-choice]');
      if (b) choose(b.dataset.choice);
    });
    document.body.appendChild(bar);
  };

  settings.forEach((el) => el.addEventListener('click', (e) => { if (e.target.closest('button')) open(); }));

  const saved = read();
  if (saved === 'granted') load();
  else if (saved !== 'denied') open();
})();

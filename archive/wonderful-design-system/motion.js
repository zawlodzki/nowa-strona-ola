/* Reference motion R, with measured phase durations O. See MOTION.md. */
(() => {
  const root = document.documentElement;
  const systemPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const reduceToggle = document.querySelector('#reduce-motion');
  const pauseButton = document.querySelector('#pause-motion');
  const status = document.querySelector('#motion-status');
  const groups = new Map();
  let paused = false;
  let reduced = systemPreference.matches;
  let countFrame = 0;
  const colors = [
    ['White', '#FFFFFF', 'color.white'], ['Paper', '#FAFAFA', 'color.paper'],
    ['Surface', '#F5F5F5', 'color.surface'], ['Line', '#E6E6E6', 'color.line'],
    ['Ink', '#171719', 'color.ink'], ['Body', '#393939', 'color.body'],
    ['Muted', '#6B6B6B', 'color.muted'], ['Black', '#080808', 'color.black'],
    ['Deep', '#050505', 'color.deep'], ['Activity', '#FC762F', 'color.accent']
  ];
  const swatches = document.querySelector('#swatches');
  for (const [name, color, token] of colors) {
    const card = document.createElement('div'); card.className = 'swatch';
    const paint = document.createElement('div'); paint.className = 'swatch-color'; paint.style.background = color;
    const meta = document.createElement('div'); meta.className = 'swatch-meta';
    const title = document.createElement('strong'); title.textContent = name;
    const value = document.createElement('code'); value.textContent = color;
    const label = document.createElement('code'); label.textContent = token;
    meta.append(title, value, label); card.append(paint, meta); swatches.append(card);
  }
  const dots = document.querySelector('#dot-grid');
  for (let i = 0; i < 45; i++) {
    const dot = document.createElement('i');
    // Adapted radial delay; not a claim about the original algorithm.
    const distance = Math.hypot(i % 9 - 4, Math.floor(i / 9) - 2);
    dot.style.setProperty('--delay', `${Math.round(distance * 150)}ms`); dots.append(dot);
  }
  const stageOf = key => document.getElementById(`${key}-stage`);
  function cancelGroup(key) {
    (groups.get(key) || []).forEach(a => a.cancel()); groups.delete(key);
    if (key === 'count') { cancelAnimationFrame(countFrame); document.querySelector('#metric').textContent = '32'; }
  }
  function applyPause() {
    root.classList.toggle('is-paused', paused || document.hidden);
    for (const [key, animations] of groups) {
      const stop = paused || document.hidden || stageOf(key)?.classList.contains('offscreen');
      for (const a of animations) {
        if (a.playState === 'finished' || a.playState === 'idle') continue;
        if (stop) a.pause(); else a.play();
      }
    }
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Wznów ruch' : 'Wstrzymaj ruch';
  }
  function setPreference() {
    reduced = systemPreference.matches || reduceToggle.checked;
    root.classList.toggle('reduced', reduced);
    reduceToggle.disabled = systemPreference.matches;
    if (systemPreference.matches) reduceToggle.checked = true;
    if (reduced) for (const key of [...groups.keys()]) cancelGroup(key);
    status.textContent = systemPreference.matches ? 'System: ograniczony ruch. Statyczna prezentacja.' : reduced ? 'Statyczna prezentacja.' : paused ? 'Animacje wstrzymane.' : 'Animacje aktywne tylko w widocznych sekcjach.';
    applyPause();
  }
  reduceToggle.checked = systemPreference.matches;
  systemPreference.addEventListener('change', () => { reduceToggle.checked = systemPreference.matches; setPreference(); });
  reduceToggle.addEventListener('change', setPreference);
  pauseButton.addEventListener('click', () => { paused = !paused; setPreference(); });
  document.addEventListener('visibilitychange', applyPause);
  const stageObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('offscreen', !entry.isIntersecting);
    applyPause();
  }, { threshold: .01 });
  document.querySelectorAll('.motion-stage').forEach(el => stageObserver.observe(el));
  const expo = 'cubic-bezier(.16,1,.3,1)';
  const quint = 'cubic-bezier(.22,1,.36,1)';
  const frame = (time, properties, easing = 'linear') => ({ offset: time / 2808, easing, ...properties });
  function playTag() {
    cancelGroup('tag'); if (reduced) return;
    const stage = stageOf('tag');
    const options = { duration: 2808, fill: 'forwards' };
    const box = stage.querySelector('.tag-box').animate([
      frame(0, { opacity: 0, transform: 'scale(.2354)' }, quint),
      frame(220, { opacity: 1, transform: 'scale(1)' }),
      frame(2632, { opacity: 1, transform: 'scale(1)' }, quint),
      frame(2808, { opacity: 0, transform: 'scale(.2354)' })
    ], options);
    const panel = stage.querySelector('.tag-panel').animate([
      frame(0, { transform: 'scaleX(0)' }), frame(220, { transform: 'scaleX(0)' }, expo),
      frame(560, { transform: 'scaleX(1)' }), frame(2360, { transform: 'scaleX(1)' }, expo),
      frame(2632, { transform: 'scaleX(0)' }), frame(2808, { transform: 'scaleX(0)' })
    ], options);
    const type = stage.querySelector('.type-text').animate([
      frame(0, { clipPath: 'inset(0 100% 0 0)' }),
      frame(560, { clipPath: 'inset(0 100% 0 0)' }, 'steps(10,end)'),
      frame(1110, { clipPath: 'inset(0 0% 0 0)' }),
      frame(2010, { clipPath: 'inset(0 0% 0 0)' }, 'steps(10,end)'),
      frame(2360, { clipPath: 'inset(0 100% 0 0)' }), frame(2808, { clipPath: 'inset(0 100% 0 0)' })
    ], options);
    groups.set('tag', [box, panel, type]); applyPause();
  }
  function playReveal() {
    cancelGroup('reveal'); if (reduced) return;
    const animations = [...stageOf('reveal').querySelectorAll('i')].map((el, i) => el.animate([
      { opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 600, delay: i * 70, easing: quint, fill: 'both' }));
    groups.set('reveal', animations); applyPause();
  }
  function playCount() {
    cancelGroup('count'); if (reduced) return;
    const element = document.querySelector('#metric');
    const clock = element.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1000 });
    groups.set('count', [clock]); applyPause();
    function tick() {
      const progress = Math.max(0, Math.min(1, Number(clock.currentTime || 0) / 1000));
      element.textContent = String(Math.round(32 * (1 - Math.pow(1 - progress, 5))));
      if (clock.playState !== 'finished' && clock.playState !== 'idle') countFrame = requestAnimationFrame(tick);
      else element.textContent = '32';
    }
    tick();
  }
  const players = { tag: playTag, reveal: playReveal, count: playCount };
  document.querySelectorAll('[data-replay]').forEach(button => button.addEventListener('click', () => players[button.dataset.replay]()));

  // Accessible tabs: the demo uses short text; source uses photographic panels.
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function selectTab(tab, focus = false) {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !active;
      if (active && !reduced) panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
    });
  });
  const form = document.getElementById('demo-form');
  const email = document.getElementById('demo-email');
  const error = document.getElementById('email-error');
  const formStatus = document.getElementById('form-status');
  let attempted = false;
  function validate() {
    const valid = email.validity.valid;
    email.setAttribute('aria-invalid', String(!valid)); error.hidden = valid;
    error.textContent = valid ? '' : 'Podaj poprawny adres e-mail, np. imie@firma.pl.';
    return valid;
  }
  email.addEventListener('blur', () => { if (email.value || attempted) validate(); });
  email.addEventListener('input', () => { if (attempted) validate(); formStatus.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault(); attempted = true; formStatus.textContent = '';
    if (!validate()) { email.focus(); return; }
    const submit = document.getElementById('form-submit');
    submit.disabled = true; submit.textContent = 'Sprawdzanie…'; form.setAttribute('aria-busy', 'true');
    setTimeout(() => {
      submit.disabled = false; submit.textContent = 'Sprawdź demo'; form.removeAttribute('aria-busy');
      formStatus.textContent = 'Poprawnie. To demonstracja — żadne dane nie zostały wysłane.';
    }, 700);
  });
  setPreference();
})();

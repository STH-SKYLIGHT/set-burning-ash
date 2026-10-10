(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const storage = {
    get(key, session = false) {
      try { return (session ? sessionStorage : localStorage).getItem(key); } catch { return null; }
    },
    set(key, value, session = false) {
      try { (session ? sessionStorage : localStorage).setItem(key, value); } catch { /* Storage may be unavailable. */ }
    }
  };

  function animateIn(element, distance = 24) {
    if (reduceMotion.matches) return;
    element.getAnimations().forEach((animation) => animation.cancel());
    element.animate([
      { opacity: .15, transform: `translateY(${distance}px)`, clipPath: 'inset(0 0 12% 0)' },
      { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0)' }
    ], { duration: 580, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  }

  const intro = document.querySelector('.site-intro');
  let introTimer;
  function finishIntro() {
    clearTimeout(introTimer);
    intro.hidden = true;
    document.body.classList.add('hero-enter');
    document.removeEventListener('keydown', finishIntro);
  }
  if (!reduceMotion.matches && !location.hash && !storage.get('burningash-intro', true)) {
    const mark = document.querySelector('#hero-title').cloneNode(true);
    mark.removeAttribute('id');
    intro.querySelector('.intro-mark').append(mark);
    intro.hidden = false;
    storage.set('burningash-intro', '1', true);
    introTimer = setTimeout(finishIntro, 1950);
    intro.querySelector('button').addEventListener('click', finishIntro);
    document.addEventListener('keydown', finishIntro);
  }

  const music = document.querySelector('#site-music');
  const musicButtons = [...document.querySelectorAll('.music-toggle')];
  let musicWanted = storage.get('burningash-music') !== 'off';
  let playPending = false;
  music.volume = .28;

  function updateMusic() {
    musicButtons.forEach((button) => button.setAttribute('aria-pressed', String(!music.paused && !music.error)));
  }
  async function playMusic() {
    if (!musicWanted || document.hidden || playPending || !music.paused) return;
    playPending = true;
    try {
      await music.play();
      if (!musicWanted || document.hidden) music.pause();
    } catch { /* Playback may require a user gesture; the switch can retry. */ }
    finally { playPending = false; updateMusic(); }
  }
  musicButtons.forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      musicWanted = music.paused || !musicWanted;
      storage.set('burningash-music', musicWanted ? 'on' : 'off');
      if (musicWanted) playMusic();
      else music.pause();
      updateMusic();
    });
  });
  ['play', 'pause', 'error'].forEach((event) => music.addEventListener(event, updateMusic));
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.music-toggle')) playMusic();
  }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (['Enter', ' '].includes(event.key) && !event.target.closest('.music-toggle')) playMusic();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) music.pause();
    else playMusic();
  });
  playMusic();

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const mobile = window.matchMedia('(max-width: 760px)');

  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('span').textContent = '＋';
    if (returnFocus) menu.focus();
  }

  function updateMenu() {
    menu.hidden = !mobile.matches;
    closeMenu();
  }

  document.querySelector('.site-header').classList.add('nav-ready');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('span').textContent = open ? '−' : '＋';
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  mobile.addEventListener('change', updateMenu);
  updateMenu();

  const choices = [...document.querySelectorAll('.system-choice')];
  const panels = [...document.querySelectorAll('.system-panel')];

  function selectSystem(choice, animate = true) {
    choices.forEach((button) => {
      const active = button === choice;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== choice.getAttribute('aria-controls');
      if (!panel.hidden && animate) animateIn(panel);
    });
  }

  choices.forEach((button) => button.addEventListener('click', () => selectSystem(button)));
  document.querySelector('.systems').classList.add('systems-ready');
  selectSystem(choices[0], false);

  const dialog = document.querySelector('.archive-dialog');
  const archiveContent = dialog.querySelector('.archive-content');
  const archiveCaption = dialog.querySelector('.archive-caption');
  const entries = [
    ...panels.map((panel, index) => ({
      key: `system-${choices[index].dataset.system}`, source: panel,
      label: panel.querySelector('.module-number').textContent,
      title: panel.querySelector('h3').textContent, home: '#systems'
    })),
    ...[...document.querySelectorAll('.world-frame')].map((frame, index) => ({
      key: `archive-${index + 1}`, source: frame,
      label: frame.querySelector('figcaption > .mono').textContent,
      title: frame.querySelector('strong').firstChild.textContent, home: '#world'
    }))
  ];
  let activeEntry = -1;
  let archiveTrigger = null;
  let homeScroll = 0;

  function setHash(hash, replace = false, state = history.state) {
    history[replace ? 'replaceState' : 'pushState'](state, '', hash);
  }

  function showArchive(index) {
    const entry = entries[index];
    activeEntry = index;
    const content = entry.source.cloneNode(true);
    content.hidden = false;
    content.classList.remove('reveal', 'is-visible');
    [content, ...content.querySelectorAll('[id], [aria-labelledby]')].forEach((element) => {
      element.removeAttribute('id');
      element.removeAttribute('aria-labelledby');
    });
    content.querySelectorAll('.detail-open').forEach((button) => button.remove());
    content.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    archiveCaption.textContent = entry.label;
    dialog.setAttribute('aria-label', entry.title);
    archiveContent.replaceChildren(content);
    if (!dialog.open) {
      homeScroll = window.scrollY;
      document.body.classList.add('archive-open');
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    animateIn(archiveContent, 40);
  }

  function hideArchive() {
    if (!dialog.open) return;
    dialog.close();
    document.body.classList.remove('archive-open');
    window.scrollTo({ top: homeScroll, behavior: 'instant' });
    archiveTrigger?.focus({ preventScroll: true });
    activeEntry = -1;
  }

  function syncRoute() {
    const index = entries.findIndex((entry) => `#${entry.key}` === location.hash);
    if (index >= 0) showArchive(index);
    else hideArchive();
  }

  function closeArchive() {
    if (history.state?.burningashArchive) history.back();
    else {
      const home = entries[activeEntry]?.home || '#systems';
      setHash(home, true);
      hideArchive();
      document.querySelector(home).scrollIntoView({ behavior: 'instant' });
    }
  }

  entries.forEach((entry, index) => {
    const button = document.createElement('button');
    button.className = 'detail-open icon-button';
    button.type = 'button';
    button.setAttribute('aria-label', '展开');
    button.setAttribute('aria-haspopup', 'dialog');
    button.innerHTML = '<span aria-hidden="true">↗</span>';
    (entry.source.querySelector('.module-copy') || entry.source).append(button);
    button.addEventListener('click', () => {
      archiveTrigger = button;
      setHash(`#${entry.key}`, false, { burningashArchive: true });
      showArchive(index);
    });
  });
  function stepArchive(direction) {
    const index = (activeEntry + direction + entries.length) % entries.length;
    setHash(`#${entries[index].key}`, true);
    showArchive(index);
  }
  dialog.querySelector('.archive-close').addEventListener('click', closeArchive);
  dialog.querySelector('.archive-prev').addEventListener('click', () => stepArchive(-1));
  dialog.querySelector('.archive-next').addEventListener('click', () => stepArchive(1));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeArchive(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      stepArchive(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  window.addEventListener('popstate', syncRoute);
  // Hash links work on GitHub Pages without a server-side router.
  window.addEventListener('hashchange', () => {
    const index = entries.findIndex((entry) => `#${entry.key}` === location.hash);
    if (index !== activeEntry) syncRoute();
  });
  syncRoute();

  const chapters = [...document.querySelectorAll('main > section[id]')];
  const rail = document.createElement('nav');
  rail.className = 'chapter-rail';
  rail.setAttribute('aria-label', '章节');
  chapters.forEach((chapter) => {
    const link = document.createElement('a');
    link.href = `#${chapter.id}`;
    link.setAttribute('aria-label', chapter.querySelector('h1, h2').textContent);
    rail.append(link);
  });
  document.body.append(rail);
  const chapterLinks = [...document.querySelectorAll('.chapter-rail a, #navigation a[href^="#"]')];
  const progress = document.querySelector('.reading-progress');
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
    let current = chapters[0];
    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top <= window.innerHeight * .4) current = chapter;
    }
    chapterLinks.forEach((link) => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  updateScroll();

  const wipe = document.querySelector('.page-wipe');
  let navigating = false;
  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target || dialog.open) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    closeMenu();
    try {
      const motion = !reduceMotion.matches;
      if (motion) {
        wipe.style.transformOrigin = 'top';
        await wipe.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
          { duration: 210, easing: 'cubic-bezier(.7, 0, .3, 1)', fill: 'forwards' }).finished;
      }
      setHash(link.hash);
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (motion) {
        wipe.getAnimations().forEach((animation) => animation.cancel());
        wipe.style.transformOrigin = 'bottom';
        await wipe.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
          { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' }).finished;
      }
    } finally {
      wipe.getAnimations().forEach((animation) => animation.cancel());
      navigating = false;
    }
  });

  const reticle = document.querySelector('.pointer-reticle');
  const heroArt = document.querySelector('.hero-art');
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerTarget = null;
  function drawPointer() {
    pointerFrame = 0;
    reticle.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    if (pointerTarget?.closest('.hero-art')) {
      const bounds = heroArt.getBoundingClientRect();
      heroArt.style.setProperty('--pointer-x', `${(pointerX - bounds.left) / bounds.width * 100}%`);
      heroArt.style.setProperty('--pointer-y', `${(pointerY - bounds.top) / bounds.height * 100}%`);
    }
  }
  document.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reduceMotion.matches || event.pointerType === 'touch' || dialog.open) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerTarget = event.target;
    reticle.classList.add('is-on');
    reticle.classList.toggle('is-hot', Boolean(event.target.closest('a, button')));
    if (!pointerFrame) pointerFrame = requestAnimationFrame(drawPointer);
  }, { passive: true });
  document.addEventListener('pointerdown', () => reticle.classList.add('is-down'), { passive: true });
  document.addEventListener('pointerup', () => reticle.classList.remove('is-down'), { passive: true });
  document.documentElement.addEventListener('pointerleave', () => reticle.classList.remove('is-on'));
  window.addEventListener('blur', () => reticle.classList.remove('is-on', 'is-down'));

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }
})();

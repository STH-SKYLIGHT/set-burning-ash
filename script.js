(() => {
  'use strict';

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

  function selectSystem(choice) {
    choices.forEach((button) => {
      const active = button === choice;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== choice.getAttribute('aria-controls');
    });
  }

  choices.forEach((button) => button.addEventListener('click', () => selectSystem(button)));
  document.querySelector('.systems').classList.add('systems-ready');
  selectSystem(choices[0]);

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

/* ============================================================
   CONEX Landing — main.js
   MB Capital © 2026
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav: opacidad al hacer scroll ─────────────────────── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const updateNav = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ── FAQ: acordeón expandible (accesible) ───────────────── */
  document.querySelectorAll('.faq-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const panel  = item.querySelector('.faq-item-panel');
      const isOpen = item.classList.contains('is-open');

      // cerrar todos
      document.querySelectorAll('.faq-item.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.faq-item-panel').style.maxHeight = '0';
        el.querySelector('.faq-item-btn').setAttribute('aria-expanded', 'false');
      });

      // abrir el clickeado si estaba cerrado
      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Intersection Observer: animaciones de entrada ──────── */
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

});

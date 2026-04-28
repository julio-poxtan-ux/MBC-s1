/* ── Scroll Reveal ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => observer.observe(el));

/* ── Navbar ── */
const nav = document.querySelector('.nav-mb');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ── Hero parallax ── */
const hero = document.getElementById('hero');
const heroGrad = document.querySelector('.hero-grad');
window.addEventListener('scroll', () => {
  if (hero && heroGrad && window.scrollY < hero.offsetHeight) {
    heroGrad.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }
}, { passive: true });

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── Membership card nav ── */
const plans = [
  {
    price: '500 USDT - Permanente',
    features: [
      'Mentorías semanales de creación de portafolio',
      'Biblioteca de mentorías grabadas',
      'Curso FID – Fundamentos en Inversiones Digitales',
      'Comunidad privada de miembros',
      'Acceso a tecnología CONEX',
    ],
    bonus: '(bono de pre-lanzamiento): 500 Maks se valorizarán conforme crezca Maktub, pudiendo venderlos o mantenerlos según tus intereses. Válido hasta final de prelanzamiento.',
    label: 'ELITE',
  },
];
let currentPlan = 0;

function renderPlan(idx) {
  const p = plans[idx];
  const priceEl = document.getElementById('memb-price');
  const featEl  = document.getElementById('memb-features');
  const bonusEl = document.getElementById('memb-bonus');
  const eliteEl = document.getElementById('memb-elite');
  if (!priceEl) return;

  priceEl.textContent = p.price;
  featEl.innerHTML = p.features.map(f => `
    <li><span class="arrow-icon" aria-hidden="true"></span>${f}</li>
  `).join('');
  bonusEl.textContent = p.bonus;
  eliteEl.textContent = p.label;
}

document.getElementById('memb-prev')?.addEventListener('click', () => {
  currentPlan = (currentPlan - 1 + plans.length) % plans.length;
  renderPlan(currentPlan);
});
document.getElementById('memb-next')?.addEventListener('click', () => {
  currentPlan = (currentPlan + 1) % plans.length;
  renderPlan(currentPlan);
});

/* ── Mobile nav toggle ── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
burger?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});

/* ── Number counter animation ── */
function countUp(el, to, duration = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(p * to).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* init on page load */
document.addEventListener('DOMContentLoaded', () => {
  renderPlan(0);
});

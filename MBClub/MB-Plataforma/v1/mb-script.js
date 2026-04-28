/* =========================================================
   MB Platform - UI Interactions (Vanilla JS)
   - Autocomplete en buscador
   - Scroll arrows para filas horizontales
   - Navegación simulada (modal) al hacer click en tarjetas
   ========================================================= */

(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const courses = [
    { title: 'Análisis Técnico Polygon', section: '#recomendados' },
    { title: 'Fundamentos Crypto', section: '#recomendados' },
    { title: 'Inversión en Criptoactivos', section: '#recomendados' },
    { title: 'Gestión de Riesgo', section: '#recomendados' },
    { title: 'Análisis de Mercado Semanal', section: '#en-vivo' },
    { title: 'Expertos DeFi', section: '#en-vivo' },
    { title: 'Estrategias de Inversión', section: '#biblioteca' },
    { title: 'Masterclass de DeFi', section: '#biblioteca' },
    { title: 'Fondos de Inversión Alternativos', section: '#biblioteca' },
    { title: 'Análisis de Volatilidad', section: '#biblioteca' },
    { title: 'Configurando tu primera Wallet', section: '#tutoriales' },
    { title: 'Seguridad básica en exchanges', section: '#tutoriales' },
    { title: 'Alertas y listas de seguimiento', section: '#tutoriales' },
    { title: 'Introducción a DeFi', section: '#tutoriales' },
    { title: 'Inversión en Bienes Raíces', section: '#top' },
    { title: 'Finanzas Personales', section: '#top' },
    { title: 'Emprendimiento Digital', section: '#top' },
  ];

  // Search autocomplete
  const input = document.getElementById('courseSearch');
  const dropdown = document.getElementById('searchDropdown');

  function closeDropdown(){
    if (!dropdown) return;
    dropdown.classList.add('d-none');
    dropdown.innerHTML = '';
  }

  function highlightCard(title){
    const card = document.querySelector(`[data-course="${CSS.escape(title)}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    card.classList.add('mb-flash');
    setTimeout(() => card.classList.remove('mb-flash'), 900);
  }

  function renderSuggestions(query){
    if (!dropdown) return;
    const q = query.trim().toLowerCase();
    if (!q){
      closeDropdown();
      return;
    }

    const matches = courses
      .filter(c => c.title.toLowerCase().includes(q))
      .slice(0, 6);

    if (!matches.length){
      dropdown.innerHTML = `<div class="mb-search-item" role="option" aria-selected="false"><span>Sin coincidencias</span><small>Intenta otro término</small></div>`;
      dropdown.classList.remove('d-none');
      return;
    }

    dropdown.innerHTML = matches.map((m, idx) => {
      const safe = m.title.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<div class="mb-search-item" role="option" data-title="${safe}" tabindex="0">
                <span>${safe}</span>
                <small>Ver</small>
              </div>`;
    }).join('');

    dropdown.classList.remove('d-none');
  }

  if (input && dropdown){
    input.addEventListener('input', (e) => renderSuggestions(e.target.value));
    input.addEventListener('focus', (e) => renderSuggestions(e.target.value));

    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.mb-search-item');
      const title = item?.getAttribute('data-title');
      if (!title) return;
      input.value = title;
      closeDropdown();
      highlightCard(title);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mb-search')) closeDropdown();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });
  }

  // Horizontal row arrows
  document.querySelectorAll('[data-scroll-left]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.getAttribute('data-scroll-left'));
      if (!target) return;
      target.scrollBy({ left: -420, behavior: 'smooth' });
    });
  });
  document.querySelectorAll('[data-scroll-right]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.getAttribute('data-scroll-right'));
      if (!target) return;
      target.scrollBy({ left: 420, behavior: 'smooth' });
    });
  });

  // Card click -> modal (simulated navigation)
  const modalEl = document.getElementById('courseModal');
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
  const modalTitle = document.getElementById('courseModalTitle');
  const modalCta = document.getElementById('courseModalCta');

  function openCourse(title){
    if (!modal || !modalTitle) return;
    modalTitle.textContent = title;
    if (modalCta) modalCta.setAttribute('href', '#');
    modal.show();
  }

  document.querySelectorAll('.course-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-course') || 'Curso';
      openCourse(title);
    });
  });
})();

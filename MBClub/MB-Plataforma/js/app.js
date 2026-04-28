/* MB eLearning - Vanilla JS interactions
   Contract: keep selectors stable for QA and future scaling.
*/
(function () {
  'use strict';

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ----- Utilities -----
  function setActiveCard(card) {
    const group = card?.closest('[data-active-group]');
    if (!group) return;
    qsa('.mb-card.is-active', group).forEach(el => el.classList.remove('is-active'));
    card.classList.add('is-active');
  }

  function navigateIfHref(el) {
    const href = el.getAttribute('data-href');
    if (href) window.location.href = href;
  }

  function setProgressRing(ring) {
    const textValue = ring?.textContent || '';
    const labelValue = ring?.getAttribute('aria-label') || '';
    const match = `${textValue} ${labelValue}`.match(/(\d+(?:[.,]\d+)?)/);
    if (!match) return;
    const raw = parseFloat(match[1].replace(',', '.'));
    if (Number.isNaN(raw)) return;
    const value = Math.min(Math.max(raw, 0), 100);
    ring.style.setProperty('--progress', value);
  }

  // ----- Search (Homepage) -----
  const searchInput = qs('#mbSearch');
  const searchPanel = qs('#mbSearchResults');
  const searchList = qs('[data-search-list]');
  const searchEmpty = qs('[data-search-empty]');
  const searchCount = qs('[data-search-count]');
  const searchWrap = searchInput?.closest('.mb-search');
  const searchScope = qs('[data-search-scope]') || qs('main') || document.body;

  const normalizeText = (value) => (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanText = (value) => (value || '').replace(/\s+/g, ' ').trim();

  function getSectionLabel(el) {
    const section = el?.closest('section');
    if (!section) return '';
    const heading = qs('.mb-section-title h2', section);
    return cleanText(heading?.textContent);
  }

  function buildSearchIndex(scope) {
    const items = [];
    const seen = new Set();

    const addItem = (element, info) => {
      const title = cleanText(info.title);
      const description = cleanText(info.description);
      const meta = cleanText(info.meta);
      if (!title && !description) return;

      const key = `${title}|${description}|${meta}`;
      if (seen.has(key)) return;

      const searchText = normalizeText([title, description, meta].filter(Boolean).join(' '));
      if (!searchText) return;

      items.push({
        element,
        title,
        description,
        meta,
        searchText,
        titleText: normalizeText(title),
        type: info.type || 'item'
      });
      seen.add(key);
    };

    qsa('[data-card]', scope).forEach((card) => {
      const titleEl = qs('.mb-title', card) || qs('h3', card);
      const descEl = qs('.mb-desc', card);
      const metaEl = qs('.mb-meta-kicker', card);
      const section = getSectionLabel(card);
      const meta = [cleanText(metaEl?.textContent), section].filter(Boolean).join(' | ');
      addItem(card, {
        title: titleEl?.textContent || card.getAttribute('aria-label'),
        description: descEl?.textContent,
        meta,
        type: 'card'
      });
    });

    qsa('.mb-mini', scope).forEach((mini) => {
      const titleEl = qs('.fw-semibold', mini) || qs('.body', mini);
      const tagEl = qs('.tag', mini);
      const timeEl = qs('.text-muted', mini);
      const section = getSectionLabel(mini);
      const meta = [cleanText(tagEl?.textContent), cleanText(timeEl?.textContent)].filter(Boolean).join(' | ');
      addItem(mini, {
        title: titleEl?.textContent,
        description: section,
        meta,
        type: 'mini'
      });
    });

    qsa('.mb-section-title h2', scope).forEach((heading) => {
      const section = heading.closest('.mb-section-title');
      const subtitle = qs('.mb-subtitle', section);
      addItem(heading, {
        title: heading.textContent,
        description: subtitle?.textContent,
        type: 'section'
      });
    });

  const heroTitle = qs('.mb-hero h1', scope);
  if (heroTitle) {
    const heroDesc = qs('.mb-hero p', scope);
    addItem(heroTitle, {
      title: heroTitle.textContent,
        description: heroDesc?.textContent,
        type: 'hero'
      });
    }

    return items;
  }

  if (searchInput && searchPanel && searchList && searchEmpty && searchCount && searchScope) {
    const items = buildSearchIndex(searchScope);
    const maxResults = 12;

    const openPanel = () => {
      searchPanel.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
    };

    const closePanel = () => {
      searchPanel.hidden = true;
      searchInput.setAttribute('aria-expanded', 'false');
    };

    const clearHighlight = () => {
      qsa('.mb-search-hit', searchScope).forEach((el) => el.classList.remove('mb-search-hit'));
    };

    const highlightTarget = (el) => {
      if (!el) return;
      clearHighlight();
      el.classList.add('mb-search-hit');
      setTimeout(() => el.classList.remove('mb-search-hit'), 1400);
    };

    const renderResults = (raw) => {
      const query = cleanText(raw);
      const normalized = normalizeText(query);

      searchList.innerHTML = '';

      if (!query) {
        searchCount.hidden = true;
        searchEmpty.hidden = false;
        searchEmpty.textContent = 'Escribe para buscar en la pagina.';
        return;
      }

      const tokens = normalized.split(' ').filter(Boolean);
      const matches = items
        .map((item, index) => {
          let score = 0;
          if (item.titleText && item.titleText.startsWith(normalized)) score += 3;
          if (item.titleText && item.titleText.includes(normalized)) score += 2;
          if (item.searchText.includes(normalized)) score += 1;
          const hasAllTokens = tokens.every((token) => item.searchText.includes(token));
          return hasAllTokens ? { item, index, score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      const total = matches.length;
      searchCount.hidden = false;
      searchCount.textContent = total === 1 ? '1 resultado' : `${total} resultados`;

      if (!total) {
        searchEmpty.hidden = false;
        searchEmpty.textContent = 'Sin resultados. Prueba otro termino.';
        return;
      }

      searchEmpty.hidden = true;

      matches.slice(0, maxResults).forEach(({ item, index }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mb-search-item';
        button.setAttribute('role', 'option');
        button.dataset.searchIndex = String(index);

        if (item.meta) {
          const meta = document.createElement('div');
          meta.className = 'mb-search-meta';
          meta.textContent = item.meta;
          button.appendChild(meta);
        }

        if (item.title) {
          const title = document.createElement('div');
          title.className = 'mb-search-title';
          title.textContent = item.title;
          button.appendChild(title);
        }

        if (item.description) {
          const desc = document.createElement('div');
          desc.className = 'mb-search-desc';
          desc.textContent = item.description;
          button.appendChild(desc);
        }

        searchList.appendChild(button);
      });
    };

    searchInput.addEventListener('input', () => {
      openPanel();
      renderResults(searchInput.value);
    });

    searchInput.addEventListener('focus', () => {
      openPanel();
      renderResults(searchInput.value);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePanel();
        searchInput.blur();
      }
    });

    document.addEventListener('click', (event) => {
      if (searchWrap && !searchWrap.contains(event.target)) {
        closePanel();
      }
    });

    searchPanel.addEventListener('click', (event) => {
      const target = event.target.closest('[data-search-index]');
      if (!target) return;
      const idx = Number(target.dataset.searchIndex);
      const match = items[idx];
      if (!match) return;

      if (match.type === 'card') {
        setActiveCard(match.element);
      }

      match.element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightTarget(match.element);
      closePanel();
    });
  }

  qsa('.mb-progress-ring').forEach(setProgressRing);

  // ----- Scroll rows -----
  qsa('[data-scroll-row]').forEach((row) => {
    const prevBtn = qs('[data-scroll-prev]', row.parentElement);
    const nextBtn = qs('[data-scroll-next]', row.parentElement);

    const scrollBy = () => Math.max(260, Math.floor(row.clientWidth * 0.9));
    prevBtn?.addEventListener('click', () => row.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
    nextBtn?.addEventListener('click', () => row.scrollBy({ left: scrollBy(), behavior: 'smooth' }));
  });

  // ----- Card clicks -----
  qsa('[data-card]').forEach((card) => {
    card.addEventListener('click', (e) => {
      // Don't hijack native links/buttons
      const isInteractive = (e.target.closest('a, button, input, label, .dropdown-menu'));
      if (isInteractive) return;

      setActiveCard(card);
      navigateIfHref(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveCard(card);
        navigateIfHref(card);
      }
    });
  });

  // ----- Switches (Profile page) -----
  qsa('[data-switch]').forEach((sw) => {
    sw.addEventListener('click', () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));
    });
    sw.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const next = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', String(next));
      }
    });
  });

  // ----- Profile: photo preview -----
  const photoInput = qs('#mbPhotoInput');
  const photoImg = qs('#mbPhotoPreview');
  const photoBtn = qs('[data-photo-pick]');
  if (photoInput && photoBtn) {
    photoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', () => {
      const file = photoInput.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (photoImg) photoImg.src = url;
    });
  }

  // ----- Form validation (Bootstrap) -----
  qsa('.needs-validation').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // ----- Course page interactions -----
  const lessonEls = qsa('[data-lesson]');
  const progressBar = qs('[data-progress-bar]');
  const progressText = qs('[data-progress-text]');
  const lessonCountText = qs('[data-lesson-count]');
  const prevLessonBtn = qs('[data-prev-lesson]');
  const nextLessonBtn = qs('[data-next-lesson]');

  function setLessonActive(idx) {
    if (!lessonEls.length) return;

    const max = lessonEls.length;
    const clamped = Math.min(Math.max(idx, 0), max - 1);

    lessonEls.forEach((el, i) => el.classList.toggle('is-active', i === clamped));
    const pct = Math.round(((clamped + 1) / max) * 100);

    if (progressBar) progressBar.style.width = pct + '%';
    if (progressText) progressText.textContent = pct + '% Completado';
    if (lessonCountText) lessonCountText.textContent = `${clamped + 1} de ${max} lecciones`;

    prevLessonBtn?.toggleAttribute('disabled', clamped === 0);
    nextLessonBtn?.toggleAttribute('disabled', clamped === max - 1);

    // Update the top "Tema" pill text if present
    const currentLessonTitle = lessonEls[clamped]?.getAttribute('data-lesson-title');
    const currentLessonTime = lessonEls[clamped]?.getAttribute('data-lesson-time');
    const heroTitle = qs('[data-course-hero-title]');
    const heroMeta = qs('[data-course-hero-meta]');
    if (heroTitle && currentLessonTitle) heroTitle.textContent = currentLessonTitle;
    if (heroMeta && currentLessonTime) heroMeta.textContent = currentLessonTime;
  }

  if (lessonEls.length) {
    let activeIdx = Math.max(0, lessonEls.findIndex(el => el.classList.contains('is-active')));
    if (activeIdx === -1) activeIdx = 0;

    setLessonActive(activeIdx);

    lessonEls.forEach((el, i) => {
      el.addEventListener('click', () => {
        activeIdx = i;
        setLessonActive(activeIdx);
      });
    });

    prevLessonBtn?.addEventListener('click', () => {
      activeIdx = Math.max(0, activeIdx - 1);
      setLessonActive(activeIdx);
    });

    nextLessonBtn?.addEventListener('click', () => {
      activeIdx = Math.min(lessonEls.length - 1, activeIdx + 1);
      setLessonActive(activeIdx);
    });
  }

})();

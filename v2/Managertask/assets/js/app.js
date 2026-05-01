/* =============================================
   BITÁCORA — MB Capital
   app.js — Native JS + Firebase
   ============================================= */

/* =============================================
   FIREBASE CONFIG
   Reemplazá con los valores de tu proyecto Firebase.
   En Firebase Console → Configuración del proyecto → Tus apps → SDK snippet
   ============================================= */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDqxzLS224pLq4wOOoN1wfFIO02Ag_cZ2A",
  authDomain:        "askmanager-dc3b4.firebaseapp.com",
  projectId:         "taskmanager-dc3b4",
  storageBucket:     "taskmanager-dc3b4.firebasestorage.app",
  messagingSenderId: "857252268371",
  appId:             "1:857252268371:web:0e000e30c805a78fe7f9a6"
};

/* =============================================
   STATE
   ============================================= */
const state = {
  user: null,
  incidencias: [],           // All docs from Firestore (not archived)
  archivedCount: 0,
  currentView: 'activas',    // 'activas' | 'solucionadas'
  currentPlatform: '',
  searchQuery: '',
  sortDir: 'desc',
  editingId: null,
  imageActualFile: null,
  imageEsperadaFile: null,
  imageActualUrl: null,
  imageEsperadaUrl: null,
  unsubscribe: null,
};

/* =============================================
   FIREBASE INIT
   ============================================= */
let db, auth, storage;

try {
  firebase.initializeApp(FIREBASE_CONFIG);
  db      = firebase.firestore();
  auth    = firebase.auth();
  storage = firebase.storage();
} catch (e) {
  console.warn('Firebase no inicializado. Revisá FIREBASE_CONFIG en app.js.');
}

/* =============================================
   HELPERS
   ============================================= */
const $ = id => document.getElementById(id);

function show(el)  { el.classList.remove('hidden'); }
function hide(el)  { el.classList.add('hidden'); }

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function formatDateKey(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateHeader(key) {
  const [y,m,d] = key.split('-').map(Number);
  const date = new Date(y, m-1, d);
  return {
    date: `${d} de ${MONTHS_ES[m-1]} de ${y}`,
    weekday: DAYS_ES[date.getDay()],
  };
}

function formatTime(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function sanitize(str = '') {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function urlHostname(url = '') {
  try { return new URL(url).hostname; } catch { return url; }
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* =============================================
   SVG ICONS (inline)
   ============================================= */
const ICON = {
  check: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pencil: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  archive: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1.5" width="12" height="3" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M2 4.5V12.5H12V4.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7.5H8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  globe: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/><ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 7H12.5" stroke="currentColor" stroke-width="1.5"/></svg>`,
  github: `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7 .5C3.41.5.5 3.41.5 7c0 2.87 1.86 5.31 4.45 6.17.33.06.45-.14.45-.31V11.8c-1.81.39-2.19-.87-2.19-.87-.3-.75-.72-.95-.72-.95-.59-.4.04-.4.04-.4.65.05 1 .67 1 .67.58 1 1.52.71 1.9.54.06-.42.23-.71.42-.87-1.44-.16-2.96-.72-2.96-3.21 0-.71.26-1.29.67-1.74-.07-.17-.29-.82.07-1.72 0 0 .54-.17 1.78.66A6.2 6.2 0 0 1 7 5.98c.6.003 1.2.08 1.77.24 1.23-.83 1.77-.66 1.77-.66.36.9.13 1.55.06 1.72.42.45.67 1.03.67 1.74 0 2.5-1.52 3.05-2.97 3.21.23.2.44.6.44 1.21v1.79c0 .18.12.37.45.31A7.5 7.5 0 0 0 13.5 7C13.5 3.41 10.59.5 7 .5Z" clip-rule="evenodd"/></svg>`,
  layers: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L7 1.5L13 4.5L7 7.5L1 4.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M1 8L7 11L13 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clock: `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 3V5.5L7 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* =============================================
   AUTH
   ============================================= */
function initAuth() {
  if (!auth) { showDemoMode(); return; }

  auth.onAuthStateChanged(user => {
    if (user) {
      state.user = user;
      show($('app'));
      hide($('auth-screen'));
      subscribeIncidencias();
    } else {
      state.user = null;
      hide($('app'));
      show($('auth-screen'));
      if (state.unsubscribe) { state.unsubscribe(); state.unsubscribe = null; }
    }
  });

  $('btn-google-login').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => alert('Error al iniciar sesión: ' + err.message));
  });

  $('btn-signout').addEventListener('click', () => auth.signOut());
}

function showDemoMode() {
  console.info('Modo demo: Firebase no configurado. Mostrá datos de ejemplo.');
  hide($('auth-screen'));
  show($('app'));
  state.incidencias = [];
  renderAll();
}

/* =============================================
   FIRESTORE — SUBSCRIBE
   ============================================= */
function subscribeIncidencias() {
  if (!db) return;

  // Real-time listener for non-archived incidencias
  state.unsubscribe = db.collection('incidencias')
    .where('archivada', '==', false)
    .orderBy('creadoEn', 'desc')
    .onSnapshot(snapshot => {
      state.incidencias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchArchivedCount();
      updatePlatformFilter();
      renderAll();
    }, err => console.error('Firestore error:', err));
}

function fetchArchivedCount() {
  if (!db) return;
  db.collection('incidencias')
    .where('archivada', '==', true)
    .get()
    .then(snap => {
      state.archivedCount = snap.size;
      $('stat-archived').textContent = snap.size;
    });
}

/* =============================================
   CRUD
   ============================================= */
async function saveIncidencia(data) {
  if (!db) return;

  if (state.editingId) {
    await db.collection('incidencias').doc(state.editingId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await db.collection('incidencias').add({
      ...data,
      archivada: false,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      usuarioId: state.user?.uid || 'anon',
      usuarioEmail: state.user?.email || '',
    });
  }
}

async function toggleRevisada(id, current) {
  if (!db) return;
  await db.collection('incidencias').doc(id).update({ revisada: !current });
}

async function archivarIncidencia(id) {
  if (!db) return;
  if (!confirm('¿Archivás esta incidencia? Ya no aparecerá en la lista activa.')) return;
  await db.collection('incidencias').doc(id).update({ archivada: true });
}

/* =============================================
   IMAGE UPLOAD
   ============================================= */
async function uploadImage(file, fieldName, incidenciaId) {
  if (!storage || !file) return null;

  const ext  = file.name.split('.').pop();
  const date = new Date().toISOString().slice(0,10);
  const path = `assets/img/${date}/${incidenciaId}_${fieldName}.${ext}`;
  const ref  = storage.ref().child(path);

  await ref.put(file);
  return await ref.getDownloadURL();
}

/* =============================================
   RENDER — ALL
   ============================================= */
function renderAll() {
  updateStats();
  updateViewBadges();
  renderTimeline();
}

function updateStats() {
  const all      = state.incidencias;
  const pending  = all.filter(i => !i.revisada);
  const reviewed = all.filter(i => i.revisada);

  $('stat-total').textContent    = all.length;
  $('stat-pending').textContent  = pending.length;
  $('stat-reviewed').textContent = reviewed.length;
  // archived count updated by fetchArchivedCount
}

function updateViewBadges() {
  const activas     = state.incidencias.filter(i => !i.revisada);
  const solucionadas = state.incidencias.filter(i => i.revisada);
  $('badge-activas').textContent      = activas.length;
  $('badge-solucionadas').textContent = solucionadas.length;
}

function updatePlatformFilter() {
  const sel = $('select-platform');
  const current = sel.value;

  const platforms = [...new Set(
    state.incidencias.map(i => i.plataforma).filter(Boolean)
  )].sort();

  // Rebuild options
  sel.innerHTML = '<option value="">Todas las plataformas</option>' +
    platforms.map(p => `<option value="${sanitize(p)}"${p === current ? ' selected' : ''}>${sanitize(p)}</option>`).join('');
}

/* =============================================
   RENDER — TIMELINE
   ============================================= */
function getFilteredIncidencias() {
  let list = [...state.incidencias];

  // View filter
  if (state.currentView === 'activas') {
    list = list.filter(i => !i.revisada);
  } else {
    list = list.filter(i => i.revisada);
  }

  // Platform filter
  if (state.currentPlatform) {
    list = list.filter(i => i.plataforma === state.currentPlatform);
  }

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(i => {
      return (i.titulo || '').toLowerCase().includes(q)
          || (i.comentario || '').toLowerCase().includes(q)
          || (i.urlSitio || '').toLowerCase().includes(q)
          || (i.urlGithub || '').toLowerCase().includes(q)
          || (i.plataforma || '').toLowerCase().includes(q);
    });
  }

  // Sort
  list.sort((a, b) => {
    const ta = a.creadoEn?.seconds || 0;
    const tb = b.creadoEn?.seconds || 0;
    return state.sortDir === 'desc' ? tb - ta : ta - tb;
  });

  return list;
}

function renderTimeline() {
  const timeline  = $('timeline');
  const emptyEl   = $('empty-state');
  const filtered  = getFilteredIncidencias();

  if (filtered.length === 0) {
    hide(timeline);
    show(emptyEl);
    return;
  }

  hide(emptyEl);
  show(timeline);

  // Group by date
  const groups = {};
  filtered.forEach(inc => {
    const key = formatDateKey(inc.creadoEn);
    if (!groups[key]) groups[key] = [];
    groups[key].push(inc);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) =>
    state.sortDir === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
  );

  timeline.innerHTML = sortedKeys.map(key => {
    const { date, weekday } = formatDateHeader(key);
    const items = groups[key];
    const count = items.length;

    const cards = items.map(renderCard).join('');

    return `
      <div class="date-group">
        <div class="date-header">
          <div class="date-header-left">
            <span class="date-heading">${date}</span>
            <span class="date-weekday">${weekday}</span>
          </div>
          <span class="date-count">${count} ${count === 1 ? 'incidencia' : 'incidencias'}</span>
        </div>
        <div class="cards-grid">${cards}</div>
      </div>
    `;
  }).join('');

  // Bind card action events
  timeline.querySelectorAll('.action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id     = btn.dataset.id;
      const rev    = btn.dataset.revisada === 'true';
      if (action === 'toggle-revisada') toggleRevisada(id, rev);
      if (action === 'edit')            openModal(id);
      if (action === 'archive')         archivarIncidencia(id);
    });
  });
}

function renderCard(inc) {
  const isReviewed = !!inc.revisada;

  // Status badge
  const badge = isReviewed
    ? `<span class="badge-status reviewed">${ICON.check} Revisada</span>`
    : `<span class="badge-status pending">${ICON.clock} Pendiente</span>`;

  // Image area
  let imageHTML = '';
  if (inc.capturaActual && inc.capturaEsperada) {
    imageHTML = `
      <div class="card-img-area">
        <div class="card-images-split">
          <div class="card-img-half">
            <img src="${sanitize(inc.capturaActual)}" alt="Actual" loading="lazy" />
            <span class="img-label-tag">Actual</span>
          </div>
          <div class="img-split-divider"></div>
          <div class="card-img-half">
            <img src="${sanitize(inc.capturaEsperada)}" alt="Esperada" loading="lazy" />
            <span class="img-label-tag">Esperada</span>
          </div>
        </div>
        ${badge}
      </div>`;
  } else if (inc.capturaActual || inc.capturaEsperada) {
    const url = inc.capturaActual || inc.capturaEsperada;
    const lbl = inc.capturaActual ? 'Actual' : 'Esperada';
    imageHTML = `
      <div class="card-img-area">
        <img class="card-img-single" src="${sanitize(url)}" alt="${lbl}" loading="lazy" />
        ${badge}
      </div>`;
  } else {
    imageHTML = `
      <div class="card-img-area">
        <div class="card-no-img">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="13" cy="17" r="3" stroke="currentColor" stroke-width="2"/><path d="M4 27l8-7 6 6 7-5 11 9" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </div>
        ${badge}
      </div>`;
  }

  // Platform badge
  const platformHTML = inc.plataforma
    ? `<span class="badge-platform">${ICON.layers} ${sanitize(inc.plataforma)}</span>`
    : '';

  // Comment
  const commentHTML = inc.comentario
    ? `<p class="card-comment">${sanitize(inc.comentario)}</p>`
    : '';

  // URL pills
  const urlsHTML = [
    inc.urlSitio   ? `<a href="${sanitize(inc.urlSitio)}" class="url-pill" target="_blank" rel="noopener" title="${sanitize(inc.urlSitio)}">${ICON.globe} ${sanitize(urlHostname(inc.urlSitio))}</a>` : '',
    inc.urlGithub  ? `<a href="${sanitize(inc.urlGithub)}" class="url-pill" target="_blank" rel="noopener" title="${sanitize(inc.urlGithub)}">${ICON.github} ${sanitize(urlHostname(inc.urlGithub))}</a>` : '',
  ].filter(Boolean).join('');

  const urlsSection = urlsHTML
    ? `<div class="card-urls">${urlsHTML}</div>`
    : '';

  // Revisada button class
  const checkClass = isReviewed ? 'action-btn reviewed-active' : 'action-btn';
  const checkTitle = isReviewed ? 'Marcar como pendiente' : 'Marcar como revisada';

  return `
    <div class="card" data-id="${inc.id}">
      ${imageHTML}
      <div class="card-body">
        <h3 class="card-title">${sanitize(inc.titulo)}</h3>
        ${platformHTML}
        ${commentHTML}
        ${urlsSection}
      </div>
      <div class="card-footer">
        <span class="card-time">${formatTime(inc.creadoEn)}</span>
        <div class="card-actions">
          <button class="${checkClass}" data-action="toggle-revisada" data-id="${inc.id}" data-revisada="${isReviewed}" title="${checkTitle}">
            ${ICON.check}
          </button>
          <button class="action-btn" data-action="edit" data-id="${inc.id}" title="Editar">
            ${ICON.pencil}
          </button>
          <button class="action-btn" data-action="archive" data-id="${inc.id}" title="Archivar">
            ${ICON.archive}
          </button>
        </div>
      </div>
    </div>
  `;
}

/* =============================================
   MODAL
   ============================================= */
function openModal(id = null) {
  state.editingId    = id;
  state.imageActualFile   = null;
  state.imageEsperadaFile = null;
  state.imageActualUrl    = null;
  state.imageEsperadaUrl  = null;

  // Reset form
  $('form-incidencia').reset();
  resetUploadZone('actual');
  resetUploadZone('esperada');

  if (id) {
    const inc = state.incidencias.find(i => i.id === id);
    if (!inc) return;
    $('modal-title').textContent   = 'Editar incidencia';
    $('field-id').value            = id;
    $('field-titulo').value        = inc.titulo || '';
    $('field-plataforma').value    = inc.plataforma || '';
    $('field-comentario').value    = inc.comentario || '';
    $('field-url-sitio').value     = inc.urlSitio || '';
    $('field-url-github').value    = inc.urlGithub || '';
    $('field-revisada').checked    = !!inc.revisada;

    if (inc.capturaActual)   showUploadPreview('actual', inc.capturaActual);
    if (inc.capturaEsperada) showUploadPreview('esperada', inc.capturaEsperada);

    state.imageActualUrl   = inc.capturaActual || null;
    state.imageEsperadaUrl = inc.capturaEsperada || null;
  } else {
    $('modal-title').textContent = 'Nueva incidencia';
    $('field-id').value = '';
  }

  show($('modal-overlay'));
  $('field-titulo').focus();
}

function closeModal() {
  hide($('modal-overlay'));
  state.editingId = null;
  state.imageActualFile = null;
  state.imageEsperadaFile = null;
  $('form-incidencia').reset();
  resetUploadZone('actual');
  resetUploadZone('esperada');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const titulo = $('field-titulo').value.trim();
  if (!titulo) { $('field-titulo').focus(); return; }

  const btn = $('btn-guardar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    // Upload images if new files selected
    const tempId = state.editingId || db?.collection('incidencias').doc().id || Date.now().toString();

    if (state.imageActualFile) {
      state.imageActualUrl = await uploadImage(state.imageActualFile, 'actual', tempId);
    }
    if (state.imageEsperadaFile) {
      state.imageEsperadaUrl = await uploadImage(state.imageEsperadaFile, 'esperada', tempId);
    }

    const data = {
      titulo:         titulo,
      plataforma:     $('field-plataforma').value.trim(),
      comentario:     $('field-comentario').value.trim(),
      urlSitio:       $('field-url-sitio').value.trim(),
      urlGithub:      $('field-url-github').value.trim(),
      revisada:       $('field-revisada').checked,
      capturaActual:  state.imageActualUrl  || '',
      capturaEsperada: state.imageEsperadaUrl || '',
    };

    await saveIncidencia(data);
    closeModal();
  } catch (err) {
    console.error('Error al guardar:', err);
    alert('Error al guardar: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Guardar`;
  }
}

/* =============================================
   UPLOAD ZONES
   ============================================= */
const MAX_MB = 5;

function initUploadZone(name) {
  const zone    = $(`zone-${name}`);
  const fileInp = $(`file-${name}`);

  fileInp.addEventListener('change', e => handleImageFile(e.target.files[0], name));

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleImageFile(e.dataTransfer.files[0], name);
  });
}

function handleImageFile(file, name) {
  if (!file) return;
  if (file.size > MAX_MB * 1024 * 1024) {
    alert(`El archivo supera los ${MAX_MB} MB.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    showUploadPreview(name, e.target.result);
    if (name === 'actual')   state.imageActualFile   = file;
    if (name === 'esperada') state.imageEsperadaFile = file;
  };
  reader.readAsDataURL(file);
}

function showUploadPreview(name, src) {
  const wrapper = $(`upload-${name}-wrapper`);
  wrapper.innerHTML = `
    <div class="upload-preview">
      <img src="${sanitize(src)}" alt="Preview ${name}" />
      <button type="button" class="upload-preview-remove" data-name="${name}" title="Quitar imagen">×</button>
    </div>
  `;
  wrapper.querySelector('.upload-preview-remove').addEventListener('click', () => {
    resetUploadZone(name);
    if (name === 'actual')   { state.imageActualFile = null;   state.imageActualUrl = null; }
    if (name === 'esperada') { state.imageEsperadaFile = null; state.imageEsperadaUrl = null; }
  });
}

function resetUploadZone(name) {
  const wrapper = $(`upload-${name}-wrapper`);
  const icon = name === 'actual'
    ? `<svg class="upload-zone-icon" width="29" height="29" viewBox="0 0 29 29" fill="none"><rect x="1.5" y="5.5" width="26" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="11.5" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 19.5L8 14L13 18.5L18.5 14L27.5 21" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`
    : `<svg class="upload-zone-icon" width="29" height="29" viewBox="0 0 29 29" fill="none"><rect x="1.5" y="5.5" width="26" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="11.5" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 19.5L8 14L13 18.5L18.5 14L27.5 21" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

  wrapper.innerHTML = `
    <div class="upload-zone" id="zone-${name}">
      <input type="file" class="upload-zone-input" id="file-${name}" accept="image/png,image/jpeg,image/webp" />
      ${icon}
      <p class="upload-zone-title">Subir <span>o arrastrá aquí</span></p>
      <p class="upload-zone-hint">PNG, JPG, WEBP · 5 MB</p>
    </div>
  `;
  initUploadZone(name);
}

/* =============================================
   IMPORT / EXPORT JSON
   ============================================= */
function triggerImport() {
  $('import-json-file').click();
}

async function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const arr  = JSON.parse(text);

    if (!Array.isArray(arr)) throw new Error('El archivo no contiene un array válido.');
    if (!confirm(`¿Importás ${arr.length} incidencias?`)) return;

    const batch = db.batch();
    arr.forEach(item => {
      const ref = db.collection('incidencias').doc();
      batch.set(ref, {
        titulo:          item.titulo || '',
        plataforma:      item.plataforma || '',
        comentario:      item.comentario || '',
        urlSitio:        item.urlSitio || item.url_sitio || '',
        urlGithub:       item.urlGithub || item.url_github || '',
        capturaActual:   item.capturaActual || '',
        capturaEsperada: item.capturaEsperada || '',
        revisada:        !!item.revisada,
        archivada:       !!item.archivada,
        creadoEn:        firebase.firestore.Timestamp.fromDate(
                           item.creadoEn ? new Date(item.creadoEn) : new Date()
                         ),
        usuarioId:       state.user?.uid || 'import',
        usuarioEmail:    state.user?.email || '',
      });
    });

    await batch.commit();
    alert(`${arr.length} incidencias importadas.`);
  } catch (err) {
    alert('Error al importar: ' + err.message);
  }

  e.target.value = '';
}

function exportJSON() {
  const data = state.incidencias.map(i => ({
    titulo:          i.titulo,
    plataforma:      i.plataforma,
    comentario:      i.comentario,
    urlSitio:        i.urlSitio,
    urlGithub:       i.urlGithub,
    capturaActual:   i.capturaActual,
    capturaEsperada: i.capturaEsperada,
    revisada:        i.revisada,
    archivada:       i.archivada,
    creadoEn:        i.creadoEn?.toDate?.().toISOString() || new Date().toISOString(),
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bitacora-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* =============================================
   EVENT LISTENERS
   ============================================= */
function initEventListeners() {
  // Nueva incidencia
  $('btn-nueva').addEventListener('click', () => openModal());
  $('btn-nueva-empty').addEventListener('click', () => openModal());

  // Importar
  $('btn-importar').addEventListener('click', triggerImport);
  $('btn-importar-empty').addEventListener('click', triggerImport);
  $('import-json-file').addEventListener('change', importJSON);

  // Modal
  $('btn-close-modal').addEventListener('click', closeModal);
  $('btn-cancelar').addEventListener('click', closeModal);
  $('btn-guardar').addEventListener('click', handleFormSubmit);
  $('form-incidencia').addEventListener('submit', handleFormSubmit);

  // Close on overlay click
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentView = btn.dataset.view;
      renderTimeline();
    });
  });

  // Platform filter
  $('select-platform').addEventListener('change', e => {
    state.currentPlatform = e.target.value;
    renderTimeline();
  });

  // Search
  $('search-input').addEventListener('input', debounce(e => {
    state.searchQuery = e.target.value.trim();
    renderTimeline();
  }, 200));

  // Sort
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.sortDir = btn.dataset.sort;
      renderTimeline();
    });
  });

  // Upload zones
  initUploadZone('actual');
  initUploadZone('esperada');

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initAuth();
});

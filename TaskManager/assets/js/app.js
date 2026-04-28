/* ========================================================================
   BITÁCORA — app.js
   Lógica frontend · persistencia en localStorage + export JSON/ZIP
   ======================================================================== */

(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // Estado y constantes
  // ---------------------------------------------------------------------
  const STORAGE_KEY = 'bitacora.v1';
  const MAX_IMAGE_MB = 5;

  /** @typedef {{
   *   id:string, titulo:string, comentario:string,
   *   imagen:string|null, imagenNombre:string|null,
   *   imagenEsperada:string|null, imagenEsperadaNombre:string|null,
   *   urlSitio:string, urlGithub:string,
   *   plataforma:string,
   *   revisado:boolean, archivado:boolean,
   *   creadoEn:string, actualizadoEn:string
   * }} Incidencia
   */

  const state = {
    /** @type {Incidencia[]} */
    incidencias: [],
    vista: 'activas',          // 'activas' | 'archivadas'
    orden: 'desc',             // 'desc' | 'asc'
    busqueda: '',
    plataformaFiltro: '',      // '' = todas
    editandoId: null,
    /**
     * Imágenes seleccionadas en el formulario:
     * - Nueva sin guardar:  { file: File, nombre, blobUrl }
     * - Existente en disco: { file: null, nombre, blobUrl, path }
     */
    imagenActual: null,
    imagenEsperada: null,
  };

  // ---------------------------------------------------------------------
  // Persistencia — localStorage
  // ---------------------------------------------------------------------
  function cargar() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data?.incidencias)) state.incidencias = data.incidencias;
    } catch (e) {
      console.warn('No se pudo leer localStorage:', e);
    }
  }

  function guardar() {
    const payload = {
      version: '1.0',
      actualizadoEn: new Date().toISOString(),
      incidencias: state.incidencias,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      toast('No se pudo guardar localmente (el almacenamiento puede estar lleno).');
    }
    // Escribir al archivo JSON si hay una carpeta conectada
    guardarEnArchivo();
  }

  // ---------------------------------------------------------------------
  // Persistencia — File System Access API + IndexedDB
  // ---------------------------------------------------------------------
  const FS_DB   = 'bitacora.fs';
  const FS_STORE = 'handles';

  /** Abre la base IndexedDB que guarda los FileSystemHandle */
  function abrirDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(FS_DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(FS_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror  = () => reject(req.error);
    });
  }
  async function dbGet(key) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(FS_STORE, 'readonly').objectStore(FS_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror  = () => reject(req.error);
    });
  }
  async function dbPut(key, value) {
    const db = await abrirDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(FS_STORE, 'readwrite').objectStore(FS_STORE).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror  = () => reject(req.error);
    });
  }

  const fsState = {
    /** @type {FileSystemDirectoryHandle|null} */
    dirHandle: null,
    disponible: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
    /** @type {Map<string, string>} incidenciaId → blob URL de la imagen */
    imageCache: new Map(),
  };

  /** Verifica (y solicita si hace falta) permiso readwrite sobre el handle */
  async function verificarPermiso(handle) {
    const opts = { mode: 'readwrite' };
    if (await handle.queryPermission(opts) === 'granted') return true;
    return (await handle.requestPermission(opts)) === 'granted';
  }

  /**
   * Escribe state.incidencias en data/incidencias.json (sin base64 de imágenes).
   * Las imágenes se almacenan como rutas relativas: assets/img/YYYY-MM-DD/archivo.ext
   */
  async function guardarEnArchivo() {
    if (!fsState.dirHandle) return;
    try {
      const ok = await verificarPermiso(fsState.dirHandle);
      if (!ok) { fsState.dirHandle = null; actualizarIndicadorCarpeta(); return; }

      const dataDir = await fsState.dirHandle.getDirectoryHandle('data', { create: true });
      const payload = {
        version: '1.0',
        actualizadoEn: new Date().toISOString(),
        totalIncidencias: state.incidencias.length,
        // Guardar sin data URLs — solo rutas relativas o null
        incidencias: state.incidencias.map(i => ({
          ...i,
          imagen:         (i.imagen         && i.imagen.startsWith('data:'))         ? null : (i.imagen         || null),
          imagenEsperada: (i.imagenEsperada && i.imagenEsperada.startsWith('data:')) ? null : (i.imagenEsperada || null),
        })),
      };
      const fh       = await dataDir.getFileHandle('incidencias.json', { create: true });
      const writable = await fh.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();
    } catch (e) {
      console.warn('No se pudo escribir incidencias.json:', e);
      toast('No se pudo guardar el archivo JSON. Verificá los permisos.');
    }
  }

  /** Lee data/incidencias.json y carga imágenes en cache de blob URLs */
  async function cargarDesdeArchivo() {
    if (!fsState.dirHandle) return;
    try {
      const dataDir = await fsState.dirHandle.getDirectoryHandle('data');
      const fh      = await dataDir.getFileHandle('incidencias.json');
      const file    = await fh.getFile();
      const data    = JSON.parse(await file.text());
      if (Array.isArray(data?.incidencias)) {
        state.incidencias = data.incidencias;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
      }
    } catch (e) {
      if (e.name !== 'NotFoundError') console.warn('No se pudo leer incidencias.json:', e);
    }
    // Cargar imágenes desde sus archivos en la carpeta
    await cargarImagenesEnCache();
  }

  /**
   * Para cada incidencia con imagen (ruta relativa), lee el archivo del disco
   * y genera un blob URL temporal para mostrar en la UI.
   * Carga tanto la captura actual (cache[id]) como la esperada (cache[id+':esp']).
   */
  async function cargarImagenesEnCache() {
    if (!fsState.dirHandle) return;

    async function leerEnCache(ruta, cacheKey) {
      if (!ruta || ruta.startsWith('data:')) return;
      if (fsState.imageCache.has(cacheKey)) return;
      try {
        const partes = ruta.split('/');
        let handle = fsState.dirHandle;
        for (let i = 0; i < partes.length - 1; i++) {
          handle = await handle.getDirectoryHandle(partes[i]);
        }
        const fh  = await handle.getFileHandle(partes[partes.length - 1]);
        const img = await fh.getFile();
        fsState.imageCache.set(cacheKey, URL.createObjectURL(img));
      } catch (_) { /* archivo no encontrado → placeholder */ }
    }

    for (const inc of state.incidencias) {
      await leerEnCache(inc.imagen,         inc.id);
      await leerEnCache(inc.imagenEsperada, inc.id + ':esp');
    }
  }

  /**
   * Guarda una imagen (File) en assets/img/YYYY-MM-DD/ y devuelve la ruta relativa.
   * @param {string} id       - id de la incidencia
   * @param {string} titulo
   * @param {string} creadoEn - ISO date string
   * @param {File}   file
   * @param {'actual'|'esperada'} tipo - sufijo del nombre de archivo
   * @returns {Promise<string|null>}
   */
  async function guardarImagenEnDisco(id, titulo, creadoEn, file, tipo = 'actual') {
    if (!fsState.dirHandle) return null;
    try {
      const fecha     = claveDia(creadoEn);
      const assetsDir = await fsState.dirHandle.getDirectoryHandle('assets', { create: true });
      const imgDir    = await assetsDir.getDirectoryHandle('img',   { create: true });
      const fechaDir  = await imgDir.getDirectoryHandle(fecha,      { create: true });

      const ext      = (file.name.split('.').pop() || 'png').toLowerCase();
      const nombre   = `${id}_${sanitizar(titulo) || 'captura'}_${tipo}.${ext}`;
      const fh       = await fechaDir.getFileHandle(nombre, { create: true });
      const writable = await fh.createWritable();
      await writable.write(file);
      await writable.close();

      return `assets/img/${fecha}/${nombre}`;
    } catch (e) {
      console.warn(`No se pudo guardar la imagen (${tipo}) en disco:`, e);
      toast('No se pudo guardar la imagen. Verificá los permisos.');
      return null;
    }
  }

  /** src para la captura actual (blob URL del cache, data URL legado, o null) */
  function srcImagen(inc) {
    if (!inc.imagen) return null;
    if (inc.imagen.startsWith('data:')) return inc.imagen;
    return fsState.imageCache.get(inc.id) ?? null;
  }

  /** src para la captura esperada */
  function srcImagenEsperada(inc) {
    if (!inc.imagenEsperada) return null;
    if (inc.imagenEsperada.startsWith('data:')) return inc.imagenEsperada;
    return fsState.imageCache.get(inc.id + ':esp') ?? null;
  }

  /** Al abrir la app, intenta restaurar el handle guardado en IndexedDB */
  async function iniciarCarpeta() {
    if (!fsState.disponible) return;
    try {
      const handle = await dbGet('dataDir');
      if (!handle) return;
      const ok = await verificarPermiso(handle);
      if (ok) {
        fsState.dirHandle = handle;
        await cargarDesdeArchivo();
      }
      actualizarIndicadorCarpeta();
    } catch (e) {
      console.warn('No se pudo restaurar la carpeta:', e);
    }
  }

  /** Pide al usuario que elija la carpeta de datos */
  async function conectarCarpeta() {
    if (!fsState.disponible) {
      toast('Tu navegador no soporta escritura de archivos. Usá Chrome o Edge.');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      fsState.dirHandle = handle;
      await dbPut('dataDir', handle);
      actualizarIndicadorCarpeta();
      await guardarEnArchivo();
      toast(`Carpeta "${handle.name}" conectada. Los cambios se guardarán automáticamente.`);
    } catch (e) {
      if (e.name !== 'AbortError') toast('No se pudo conectar la carpeta.');
    }
  }

  /** Actualiza el botón topbar y el hint del file-drop según el estado de conexión */
  function actualizarIndicadorCarpeta() {
    const btn  = document.getElementById('btnCarpeta');
    const hint = document.getElementById('fileDropFolderHint');
    const conectado = !!fsState.dirHandle;

    if (btn) {
      if (conectado) {
        btn.innerHTML = `<i class="bi bi-folder-check"></i><span class="d-none d-lg-inline ms-2">${escHTML(fsState.dirHandle.name)}</span>`;
        btn.title = `Carpeta conectada: ${fsState.dirHandle.name} — clic para cambiar`;
        btn.classList.add('is-connected');
      } else {
        btn.innerHTML = `<i class="bi bi-folder-plus"></i><span class="d-none d-lg-inline ms-2">Conectar carpeta</span>`;
        btn.title = 'Conectar la carpeta raíz del proyecto para guardar imágenes y JSON automáticamente';
        btn.classList.remove('is-connected');
      }
    }

    // Mostrar/ocultar aviso en el área de drop de imagen
    if (hint) hint.style.display = conectado ? 'none' : '';
  }

  // ---------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------
  const uid = () => 'i_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function fmtDia(iso) {
    const d = new Date(iso);
    const opts = { day: '2-digit', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('es-ES', opts);
  }
  function fmtDiaSemana(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { weekday: 'long' });
  }
  function fmtHora(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  function claveDia(iso) {
    // YYYY-MM-DD en zona local
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function sanitizar(str) {
    return String(str ?? '')
      .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ.-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
  }
  function extDeDataUrl(dataUrl) {
    const m = /^data:image\/(\w+);base64,/.exec(dataUrl || '');
    return m ? m[1].replace('jpeg', 'jpg') : 'png';
  }
  function dataUrlABlob(dataUrl) {
    const [meta, b64] = dataUrl.split(',');
    const mime = /:(.*?);/.exec(meta)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  function escHTML(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function hostDe(url) {
    try { return new URL(url).host.replace(/^www\./,''); } catch { return url; }
  }

  // ---------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------
  let toastInstance;
  function toast(msg) {
    const el = document.getElementById('appToast');
    document.getElementById('toastBody').textContent = msg;
    toastInstance ??= new bootstrap.Toast(el, { delay: 2800 });
    toastInstance.show();
  }

  // ---------------------------------------------------------------------
  // Renderizado
  // ---------------------------------------------------------------------
  function render() {
    renderStats();
    actualizarFiltroPlataformas();
    renderTimeline();
  }

  function renderStats() {
    const total = state.incidencias.length;
    const pendientes = state.incidencias.filter(i => !i.revisado && !i.archivado).length;
    const revisadas = state.incidencias.filter(i => i.revisado && !i.archivado).length;
    const archivadas = state.incidencias.filter(i => i.archivado).length;
    const activas = state.incidencias.filter(i => !i.archivado).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPendientes').textContent = pendientes;
    document.getElementById('statRevisadas').textContent = revisadas;
    document.getElementById('statArchivadas').textContent = archivadas;
    document.getElementById('countActivas').textContent = activas;
    document.getElementById('countArchivadas').textContent = archivadas;
  }

  function filtrar() {
    const q = state.busqueda.toLowerCase().trim();
    return state.incidencias
      .filter(i => state.vista === 'archivadas' ? i.archivado : !i.archivado)
      .filter(i => {
        if (!state.plataformaFiltro) return true;
        return (i.plataforma || '').toLowerCase() === state.plataformaFiltro.toLowerCase();
      })
      .filter(i => {
        if (!q) return true;
        return (
          i.titulo.toLowerCase().includes(q) ||
          i.comentario.toLowerCase().includes(q) ||
          i.urlSitio.toLowerCase().includes(q) ||
          i.urlGithub.toLowerCase().includes(q) ||
          (i.plataforma || '').toLowerCase().includes(q)
        );
      });
  }

  function actualizarFiltroPlataformas() {
    const select = document.getElementById('selectPlataforma');
    const datalist = document.getElementById('plataformasLista');

    // Plataformas únicas de las incidencias guardadas
    const usadas = [...new Set(
      state.incidencias
        .map(i => (i.plataforma || '').trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'es'));

    // Datalist del formulario: combinar sugerencias estáticas + usadas
    const estaticas = ['Android', 'Desktop', 'Email', 'iOS', 'Web'];
    const todasOpciones = [...new Set([...estaticas, ...usadas])].sort((a, b) => a.localeCompare(b, 'es'));
    datalist.innerHTML = todasOpciones.map(p => `<option value="${escHTML(p)}">`).join('');

    // Select del filtro: solo las plataformas que existen en incidencias
    const valorActual = state.plataformaFiltro;
    select.innerHTML = '<option value="">Todas las plataformas</option>' +
      usadas.map(p =>
        `<option value="${escHTML(p)}"${p === valorActual ? ' selected' : ''}>${escHTML(p)}</option>`
      ).join('');

    // Si la plataforma filtrada ya no existe, resetear
    if (valorActual && !usadas.includes(valorActual)) {
      state.plataformaFiltro = '';
    }
  }

  function agruparPorDia(lista) {
    const grupos = new Map();
    for (const inc of lista) {
      const k = claveDia(inc.creadoEn);
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(inc);
    }
    const entries = Array.from(grupos.entries());
    entries.sort((a, b) => state.orden === 'desc' ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]));
    for (const [, arr] of entries) {
      arr.sort((a, b) => state.orden === 'desc'
        ? b.creadoEn.localeCompare(a.creadoEn)
        : a.creadoEn.localeCompare(b.creadoEn));
    }
    return entries;
  }

  function renderTimeline() {
    const cont = document.getElementById('timeline');
    const empty = document.getElementById('emptyState');
    const lista = filtrar();

    if (lista.length === 0) {
      cont.innerHTML = '';
      empty.classList.remove('d-none');
      // mensaje del estado vacío según contexto
      const h = empty.querySelector('.empty-title');
      const p = empty.querySelector('.empty-text');
      if (state.busqueda) {
        h.textContent = 'Sin resultados';
        p.innerHTML = `No encontramos incidencias que coincidan con <em>“${escHTML(state.busqueda)}”</em>.`;
      } else if (state.vista === 'archivadas') {
        h.textContent = 'Nada archivado';
        p.textContent = 'Las incidencias que archivés aparecerán aquí.';
      } else {
        h.textContent = 'Sin registros todavía';
        p.innerHTML = 'Creá tu primera incidencia con el botón <em>Nueva incidencia</em> o importá un archivo JSON existente.';
      }
      return;
    }

    empty.classList.add('d-none');
    const grupos = agruparPorDia(lista);

    cont.innerHTML = grupos.map(([clave, items]) => {
      const ref = items[0].creadoEn;
      return `
        <section class="day-group" aria-labelledby="d-${clave}">
          <header class="day-header">
            <span class="day-date" id="d-${clave}">${fmtDia(ref)}</span>
            <span class="day-weekday">${fmtDiaSemana(ref)}</span>
            <span class="day-count">${items.length} ${items.length === 1 ? 'incidencia' : 'incidencias'}</span>
          </header>
          <div class="incident-grid">
            ${items.map(cardHTML).join('')}
          </div>
        </section>
      `;
    }).join('');

    // Eventos de cada card
    cont.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', ev => {
        ev.stopPropagation();
        const action = el.dataset.action;
        const id = el.closest('[data-id]').dataset.id;
        if (action === 'abrir') abrirDetalle(id);
        else if (action === 'editar') abrirEditar(id);
        else if (action === 'archivar') toggleArchivar(id);
        else if (action === 'revisar') toggleRevisado(id);
        else if (action === 'eliminar') eliminar(id);
      });
    });
  }

  function cardHTML(i) {
    const estado = i.archivado ? 'archived' : (i.revisado ? 'reviewed' : 'pending');
    const estadoTxt = i.archivado ? 'Archivada' : (i.revisado ? 'Revisada' : 'Pendiente');
    const estadoIcono = i.archivado ? 'bi-archive' : (i.revisado ? 'bi-check2-circle' : 'bi-hourglass-split');

    const imgSrc = srcImagen(i);
    const espSrc = srcImagenEsperada(i);
    let mediaHTML;
    if (imgSrc && espSrc) {
      mediaHTML = `
        <div class="incident-media is-split" data-action="abrir">
          <div class="split-half">
            <img src="${imgSrc}" alt="Actual" loading="lazy">
            <span class="split-label">Actual</span>
          </div>
          <div class="split-divider"></div>
          <div class="split-half">
            <img src="${espSrc}" alt="Esperada" loading="lazy">
            <span class="split-label">Esperada</span>
          </div>
        </div>`;
    } else if (imgSrc || espSrc) {
      const src   = imgSrc || espSrc;
      const label = imgSrc ? 'Actual' : 'Esperada';
      mediaHTML = `
        <div class="incident-media" data-action="abrir">
          <img src="${src}" alt="${label}" loading="lazy">
          <span class="split-label">${label}</span>
        </div>`;
    } else {
      mediaHTML = `
        <div class="incident-media placeholder" data-action="abrir">
          <i class="bi bi-image-alt"></i>
        </div>`;
    }

    const links = [];
    if (i.urlSitio)  links.push(`<a class="incident-link" href="${escHTML(i.urlSitio)}" target="_blank" rel="noopener"><i class="bi bi-globe"></i>${escHTML(hostDe(i.urlSitio))}</a>`);
    if (i.urlGithub) links.push(`<a class="incident-link" href="${escHTML(i.urlGithub)}" target="_blank" rel="noopener"><i class="bi bi-github"></i>${escHTML(hostDe(i.urlGithub))}</a>`);

    const plataformaHTML = i.plataforma
      ? `<span class="platform-tag"><i class="bi bi-layers"></i> ${escHTML(i.plataforma)}</span>`
      : '';

    return `
      <article class="incident ${i.revisado ? 'is-reviewed' : ''}" data-id="${i.id}">
        <span class="status-tag ${estado}"><i class="bi ${estadoIcono}"></i> ${estadoTxt}</span>
        ${mediaHTML}
        <div class="incident-body">
          <h3 class="incident-title" data-action="abrir">${escHTML(i.titulo)}</h3>
          ${plataformaHTML}
          ${i.comentario ? `<p class="incident-comment">${escHTML(i.comentario)}</p>` : ''}
          ${links.length ? `<div class="incident-links">${links.join('')}</div>` : ''}
        </div>
        <footer class="incident-foot">
          <span class="incident-time">${fmtHora(i.creadoEn)}</span>
          <div class="incident-actions">
            <button class="btn btn-ghost-sm" data-action="revisar" title="${i.revisado ? 'Marcar como pendiente' : 'Marcar como revisada'}">
              <i class="bi ${i.revisado ? 'bi-arrow-counterclockwise' : 'bi-check2'}"></i>
            </button>
            <button class="btn btn-ghost-sm" data-action="editar" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-ghost-sm" data-action="archivar" title="${i.archivado ? 'Desarchivar' : 'Archivar'}">
              <i class="bi ${i.archivado ? 'bi-box-arrow-up' : 'bi-archive'}"></i>
            </button>
          </div>
        </footer>
      </article>
    `;
  }

  // ---------------------------------------------------------------------
  // Detalle
  // ---------------------------------------------------------------------
  const modalDetalle = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));

  function abrirDetalle(id) {
    const i = state.incidencias.find(x => x.id === id);
    if (!i) return;
    const estado = i.archivado ? 'archived' : (i.revisado ? 'reviewed' : 'pending');
    const estadoTxt = i.archivado ? 'Archivada' : (i.revisado ? 'Revisada' : 'Pendiente');

    const linksHTML = [
      i.urlSitio  ? `<a class="detail-link-row" href="${escHTML(i.urlSitio)}" target="_blank" rel="noopener"><i class="bi bi-globe"></i><span>${escHTML(i.urlSitio)}</span><i class="bi bi-arrow-up-right ms-auto"></i></a>` : '',
      i.urlGithub ? `<a class="detail-link-row" href="${escHTML(i.urlGithub)}" target="_blank" rel="noopener"><i class="bi bi-github"></i><span>${escHTML(i.urlGithub)}</span><i class="bi bi-arrow-up-right ms-auto"></i></a>` : '',
    ].join('');

    const detalleSrc = srcImagen(i);
    const detalleEsp = srcImagenEsperada(i);
    let mediaHTML;
    if (detalleSrc && detalleEsp) {
      mediaHTML = `
        <div class="detail-hero is-split">
          <div class="split-half">
            <img src="${detalleSrc}" alt="Estado actual">
            <span class="split-label-lg">Estado actual</span>
          </div>
          <div class="split-divider"></div>
          <div class="split-half">
            <img src="${detalleEsp}" alt="Estado esperado">
            <span class="split-label-lg">Estado esperado</span>
          </div>
        </div>`;
    } else if (detalleSrc || detalleEsp) {
      const src   = detalleSrc || detalleEsp;
      const label = detalleSrc ? 'Estado actual' : 'Estado esperado';
      mediaHTML = `
        <div class="detail-hero">
          <img src="${src}" alt="${label}">
          <span class="split-label-lg">${label}</span>
        </div>`;
    } else {
      mediaHTML = `<div class="detail-hero placeholder"><i class="bi bi-image-alt"></i></div>`;
    }

    document.getElementById('detalleContent').innerHTML = `
      ${mediaHTML}
      <div class="modal-header border-0 pb-0">
        <div>
          <p class="modal-eyebrow mb-1">Incidencia</p>
          <h2 class="detail-title">${escHTML(i.titulo)}</h2>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="detail-body pt-2">
        <div class="detail-meta">
          <span><i class="bi bi-calendar3"></i> ${fmtDia(i.creadoEn)}</span>
          <span><i class="bi bi-clock"></i> ${fmtHora(i.creadoEn)}</span>
          ${i.plataforma ? `<span><i class="bi bi-layers"></i> ${escHTML(i.plataforma)}</span>` : ''}
          <span><i class="bi bi-tag"></i> <span class="status-tag ${estado}" style="position:static">${estadoTxt}</span></span>
        </div>

        ${i.comentario ? `
          <div class="detail-section">
            <div class="detail-section-title">Comentario</div>
            <p class="detail-comment">${escHTML(i.comentario)}</p>
          </div>` : ''}

        ${linksHTML ? `
          <div class="detail-section">
            <div class="detail-section-title">Enlaces</div>
            ${linksHTML}
          </div>` : ''}

        <div class="detail-section d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div class="form-check form-switch form-check-lg m-0">
            <input class="form-check-input" type="checkbox" id="d-revisado" ${i.revisado ? 'checked':''}>
            <label class="form-check-label" for="d-revisado">Marcada como <strong>revisada</strong></label>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-ghost" data-detalle="editar"><i class="bi bi-pencil me-1"></i> Editar</button>
            <button class="btn btn-ghost" data-detalle="archivar">
              <i class="bi ${i.archivado ? 'bi-box-arrow-up' : 'bi-archive'} me-1"></i>
              ${i.archivado ? 'Desarchivar' : 'Archivar'}
            </button>
            <button class="btn btn-danger-soft" data-detalle="eliminar"><i class="bi bi-trash3 me-1"></i> Eliminar</button>
          </div>
        </div>
      </div>
    `;

    // Handlers del detalle
    const content = document.getElementById('detalleContent');
    content.querySelector('#d-revisado').addEventListener('change', () => {
      toggleRevisado(id); abrirDetalle(id);
    });
    content.querySelectorAll('[data-detalle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.detalle;
        if (a === 'editar') { modalDetalle().hide(); abrirEditar(id); }
        else if (a === 'archivar') { toggleArchivar(id); abrirDetalle(id); }
        else if (a === 'eliminar') {
          if (confirm('¿Eliminar definitivamente esta incidencia? Esta acción no se puede deshacer.')) {
            eliminar(id); modalDetalle().hide();
          }
        }
      });
    });

    modalDetalle().show();
  }

  // ---------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------
  function toggleRevisado(id) {
    const i = state.incidencias.find(x => x.id === id);
    if (!i) return;
    i.revisado = !i.revisado;
    i.actualizadoEn = new Date().toISOString();
    guardar(); render();
    toast(i.revisado ? 'Marcada como revisada.' : 'Marcada como pendiente.');
  }
  function toggleArchivar(id) {
    const i = state.incidencias.find(x => x.id === id);
    if (!i) return;
    i.archivado = !i.archivado;
    i.actualizadoEn = new Date().toISOString();
    guardar(); render();
    toast(i.archivado ? 'Incidencia archivada.' : 'Incidencia restaurada.');
  }
  function eliminar(id) {
    state.incidencias = state.incidencias.filter(x => x.id !== id);
    guardar(); render();
    toast('Incidencia eliminada.');
  }

  // ---------------------------------------------------------------------
  // Formulario (crear / editar)
  // ---------------------------------------------------------------------
  const modalForm = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('modalIncidencia'));

  function resetForm() {
    state.editandoId = null;
    state.imagenActual = null;
    document.getElementById('formIncidencia').reset();
    document.getElementById('formIncidencia').classList.remove('was-validated');
    document.getElementById('f-titulo').classList.remove('is-invalid');
    document.getElementById('f-id').value = '';
    document.getElementById('f-plataforma').value = '';
    document.getElementById('modalIncidenciaLabel').textContent = 'Nueva incidencia';
    document.getElementById('modalEyebrow').textContent = 'Registro';
    cerrarPreview();
    cerrarPreviewEsp();
  }

  function abrirEditar(id) {
    const i = state.incidencias.find(x => x.id === id);
    if (!i) return;
    resetForm();
    state.editandoId = id;

    document.getElementById('f-id').value = i.id;
    document.getElementById('f-titulo').value = i.titulo;
    document.getElementById('f-plataforma').value = i.plataforma || '';
    document.getElementById('f-comentario').value = i.comentario;
    document.getElementById('f-sitio').value = i.urlSitio;
    document.getElementById('f-github').value = i.urlGithub;
    document.getElementById('f-revisado').checked = i.revisado;

    if (i.imagen) {
      const src = srcImagen(i);
      if (src) {
        state.imagenActual = { file: null, nombre: i.imagenNombre || 'captura', blobUrl: src, path: i.imagen };
        mostrarPreview(src, i.imagenNombre || 'captura');
      }
    }
    if (i.imagenEsperada) {
      const srcEsp = srcImagenEsperada(i);
      if (srcEsp) {
        state.imagenEsperada = { file: null, nombre: i.imagenEsperadaNombre || 'esperada', blobUrl: srcEsp, path: i.imagenEsperada };
        mostrarPreviewEsp(srcEsp, i.imagenEsperadaNombre || 'esperada');
      }
    }

    document.getElementById('modalIncidenciaLabel').textContent = 'Editar incidencia';
    document.getElementById('modalEyebrow').textContent = 'Edición';
    modalForm().show();
  }

  async function guardarFormulario() {
    const form   = document.getElementById('formIncidencia');
    const titulo = document.getElementById('f-titulo').value.trim();
    if (!titulo) {
      document.getElementById('f-titulo').classList.add('is-invalid');
      form.classList.add('was-validated');
      return;
    }

    const ahora = new Date().toISOString();
    // Generar el id antes de guardar la imagen (necesario para el nombre del archivo)
    const id = state.editandoId || uid();

    const creadoEn = state.editandoId
      ? (state.incidencias.find(x => x.id === id)?.creadoEn ?? ahora)
      : ahora;

    // --- Resolver captura actual ---
    let rutaImagen   = null;
    let imagenNombre = null;
    if (state.imagenActual) {
      if (state.imagenActual.file) {
        rutaImagen = await guardarImagenEnDisco(id, titulo, creadoEn, state.imagenActual.file, 'actual');
        imagenNombre = state.imagenActual.nombre;
        if (rutaImagen) fsState.imageCache.set(id, state.imagenActual.blobUrl);
      } else if (state.imagenActual.path) {
        rutaImagen   = state.imagenActual.path;
        imagenNombre = state.imagenActual.nombre;
      }
    }

    // --- Resolver captura esperada ---
    let rutaEsperada        = null;
    let imagenEsperadaNombre = null;
    if (state.imagenEsperada) {
      if (state.imagenEsperada.file) {
        rutaEsperada = await guardarImagenEnDisco(id, titulo, creadoEn, state.imagenEsperada.file, 'esperada');
        imagenEsperadaNombre = state.imagenEsperada.nombre;
        if (rutaEsperada) fsState.imageCache.set(id + ':esp', state.imagenEsperada.blobUrl);
      } else if (state.imagenEsperada.path) {
        rutaEsperada         = state.imagenEsperada.path;
        imagenEsperadaNombre = state.imagenEsperada.nombre;
      }
    }

    const datos = {
      titulo,
      plataforma:           document.getElementById('f-plataforma').value.trim(),
      comentario:           document.getElementById('f-comentario').value.trim(),
      imagen:               rutaImagen,
      imagenNombre,
      imagenEsperada:       rutaEsperada,
      imagenEsperadaNombre,
      urlSitio:             document.getElementById('f-sitio').value.trim(),
      urlGithub:            document.getElementById('f-github').value.trim(),
      revisado:             document.getElementById('f-revisado').checked,
    };

    if (state.editandoId) {
      const idx = state.incidencias.findIndex(x => x.id === id);
      if (idx > -1) {
        state.incidencias[idx] = { ...state.incidencias[idx], ...datos, actualizadoEn: ahora };
      }
      toast('Incidencia actualizada.');
    } else {
      state.incidencias.unshift({ id, ...datos, archivado: false, creadoEn: ahora, actualizadoEn: ahora });
      toast('Incidencia creada.');
    }

    guardar();
    render();
    modalForm().hide();
  }

  // ---------------------------------------------------------------------
  // Imagen — file input y drag & drop
  // ---------------------------------------------------------------------
  // ---- Captura actual ----
  function mostrarPreview(src, nombre) {
    document.getElementById('fileDropInner').classList.add('d-none');
    document.getElementById('filePreview').classList.remove('d-none');
    document.getElementById('previewImg').src = src;
    document.getElementById('previewName').textContent = nombre;
  }
  function cerrarPreview() {
    if (state.imagenActual?.file && state.imagenActual?.blobUrl) {
      URL.revokeObjectURL(state.imagenActual.blobUrl);
    }
    document.getElementById('fileDropInner').classList.remove('d-none');
    document.getElementById('filePreview').classList.add('d-none');
    document.getElementById('previewImg').src = '';
    document.getElementById('f-imagen').value = '';
    state.imagenActual = null;
  }
  function procesarArchivo(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('El archivo debe ser una imagen.'); return; }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) { toast(`La imagen supera ${MAX_IMAGE_MB} MB.`); return; }
    if (!fsState.dirHandle) { toast('Conectá una carpeta de datos antes de adjuntar imágenes.'); return; }
    if (state.imagenActual?.file && state.imagenActual?.blobUrl) {
      URL.revokeObjectURL(state.imagenActual.blobUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    state.imagenActual = { file, nombre: file.name, blobUrl };
    mostrarPreview(blobUrl, file.name);
  }

  // ---- Captura esperada ----
  function mostrarPreviewEsp(src, nombre) {
    document.getElementById('fileDropInnerEsp').classList.add('d-none');
    document.getElementById('filePreviewEsp').classList.remove('d-none');
    document.getElementById('previewImgEsp').src = src;
    document.getElementById('previewNameEsp').textContent = nombre;
  }
  function cerrarPreviewEsp() {
    if (state.imagenEsperada?.file && state.imagenEsperada?.blobUrl) {
      URL.revokeObjectURL(state.imagenEsperada.blobUrl);
    }
    document.getElementById('fileDropInnerEsp').classList.remove('d-none');
    document.getElementById('filePreviewEsp').classList.add('d-none');
    document.getElementById('previewImgEsp').src = '';
    document.getElementById('f-imagen-esp').value = '';
    state.imagenEsperada = null;
  }
  function procesarArchivoEsp(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('El archivo debe ser una imagen.'); return; }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) { toast(`La imagen supera ${MAX_IMAGE_MB} MB.`); return; }
    if (!fsState.dirHandle) { toast('Conectá una carpeta de datos antes de adjuntar imágenes.'); return; }
    if (state.imagenEsperada?.file && state.imagenEsperada?.blobUrl) {
      URL.revokeObjectURL(state.imagenEsperada.blobUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    state.imagenEsperada = { file, nombre: file.name, blobUrl };
    mostrarPreviewEsp(blobUrl, file.name);
  }

  // ---------------------------------------------------------------------
  // Exportación: ZIP con JSON + carpeta capturas/
  // ---------------------------------------------------------------------
  async function exportarZIP() {
    if (state.incidencias.length === 0) {
      toast('No hay incidencias para exportar.');
      return;
    }
    if (typeof JSZip === 'undefined') {
      toast('JSZip no está disponible — revisá tu conexión.');
      return;
    }

    const zip = new JSZip();
    const carpetaCapturas = zip.folder('capturas');

    // Helper: saca la imagen del cache/base64 y la agrega al ZIP
    async function resolverImagenExport(inc, ruta, cacheKey, sufijo) {
      if (!ruta) return null;
      if (ruta.startsWith('data:')) {
        const ext    = extDeDataUrl(ruta);
        const nombre = `${inc.id}_${sanitizar(inc.titulo) || 'captura'}_${sufijo}.${ext}`;
        carpetaCapturas.file(nombre, dataUrlABlob(ruta));
        return `capturas/${nombre}`;
      }
      const blobUrl = fsState.imageCache.get(cacheKey);
      if (blobUrl) {
        try {
          const blob   = await (await fetch(blobUrl)).blob();
          const ext    = ruta.split('.').pop() || 'png';
          const nombre = `${inc.id}_${sanitizar(inc.titulo) || 'captura'}_${sufijo}.${ext}`;
          carpetaCapturas.file(nombre, blob);
          return `capturas/${nombre}`;
        } catch (_) {}
      }
      return ruta; // fallback: ruta original
    }

    // Construir exportData con imágenes en carpeta capturas/
    const exportData = await Promise.all(state.incidencias.map(async i => {
      const rutaExport    = await resolverImagenExport(i, i.imagen,         i.id,          'actual');
      const rutaEspExport = await resolverImagenExport(i, i.imagenEsperada, i.id + ':esp', 'esperada');
      return {
        id: i.id,
        titulo: i.titulo,
        plataforma: i.plataforma || '',
        comentario: i.comentario,
        imagen:               rutaExport    ?? null,
        imagenEsperada:       rutaEspExport ?? null,
        imagenEsperadaNombre: i.imagenEsperadaNombre ?? null,
        urlSitio: i.urlSitio,
        urlGithub: i.urlGithub,
        revisado: i.revisado,
        archivado: i.archivado,
        creadoEn: i.creadoEn,
        actualizadoEn: i.actualizadoEn,
      };
    }));

    const payload = {
      version: '1.0',
      exportadoEn: new Date().toISOString(),
      totalIncidencias: exportData.length,
      incidencias: exportData,
    };

    zip.file('incidencias.json', JSON.stringify(payload, null, 2));
    zip.file('README.txt',
`Bitácora — Exportación
------------------------
Fecha: ${new Date().toLocaleString('es-ES')}
Total: ${exportData.length} incidencia(s)

Contenido:
  incidencias.json   → datos estructurados
  capturas/          → imágenes de cada incidencia

Podés volver a importar este archivo (JSON o ZIP completo) desde la aplicación.
`);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `bitacora-incidencias-${ts}.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);

    toast('Exportación lista. Descargando ZIP…');
  }

  // ---------------------------------------------------------------------
  // Importación (acepta JSON plano; si las imágenes son rutas relativas,
  // quedan sin imagen hasta re-subirlas).
  // ---------------------------------------------------------------------
  function importarJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const lista = Array.isArray(data) ? data : data.incidencias;
        if (!Array.isArray(lista)) throw new Error('Formato inválido');

        const ahora = new Date().toISOString();
        const nuevas = lista.map(x => ({
          id: x.id || uid(),
          titulo: String(x.titulo || 'Sin título'),
          plataforma: String(x.plataforma || ''),
          comentario: String(x.comentario || ''),
          imagen:               (typeof x.imagen         === 'string' && x.imagen.startsWith('data:'))         ? x.imagen         : null,
          imagenNombre:         x.imagenNombre || null,
          imagenEsperada:       (typeof x.imagenEsperada === 'string' && x.imagenEsperada.startsWith('data:')) ? x.imagenEsperada : null,
          imagenEsperadaNombre: x.imagenEsperadaNombre || null,
          urlSitio: String(x.urlSitio || ''),
          urlGithub: String(x.urlGithub || ''),
          revisado: !!x.revisado,
          archivado: !!x.archivado,
          creadoEn: x.creadoEn || ahora,
          actualizadoEn: x.actualizadoEn || ahora,
        }));

        const reemplazar = confirm(
          `Se van a importar ${nuevas.length} incidencia(s).\n\n` +
          `Aceptar = reemplazar todo lo actual\nCancelar = combinar con las existentes`
        );

        if (reemplazar) {
          state.incidencias = nuevas;
        } else {
          const ids = new Set(state.incidencias.map(i => i.id));
          nuevas.forEach(n => { if (!ids.has(n.id)) state.incidencias.push(n); });
        }
        guardar();
        render();
        toast(`Importadas ${nuevas.length} incidencia(s).`);
      } catch (e) {
        console.error(e);
        toast('No se pudo leer el JSON.');
      }
    };
    reader.readAsText(file);
  }

  // ---------------------------------------------------------------------
  // Bindings
  // ---------------------------------------------------------------------
  function bind() {
    // Nueva incidencia
    document.getElementById('btnNueva').addEventListener('click', resetForm);
    document.getElementById('btnGuardar').addEventListener('click', guardarFormulario);
    document.getElementById('formIncidencia').addEventListener('submit', ev => {
      ev.preventDefault(); guardarFormulario();
    });
    document.getElementById('modalIncidencia').addEventListener('hidden.bs.modal', resetForm);

    // Quitar validación al tipear
    document.getElementById('f-titulo').addEventListener('input', e => {
      if (e.target.value.trim()) e.target.classList.remove('is-invalid');
    });

    // File input
    const drop = document.getElementById('fileDrop');
    const input = document.getElementById('f-imagen');
    drop.addEventListener('click', e => {
      if (e.target.closest('#btnQuitarImagen')) return;
      input.click();
    });
    input.addEventListener('change', e => procesarArchivo(e.target.files[0]));
    ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => {
      e.preventDefault(); drop.classList.add('is-dragover');
    }));
    ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => {
      e.preventDefault(); drop.classList.remove('is-dragover');
    }));
    drop.addEventListener('drop', e => {
      const f = e.dataTransfer.files?.[0];
      if (f) procesarArchivo(f);
    });
    document.getElementById('btnQuitarImagen').addEventListener('click', cerrarPreview);

    // Drop zone — captura esperada
    const dropEsp   = document.getElementById('fileDropEsp');
    const inputEsp  = document.getElementById('f-imagen-esp');
    dropEsp.addEventListener('click', e => {
      if (e.target.closest('#btnQuitarImagenEsp')) return;
      inputEsp.click();
    });
    inputEsp.addEventListener('change', e => procesarArchivoEsp(e.target.files[0]));
    ['dragenter','dragover'].forEach(ev => dropEsp.addEventListener(ev, e => {
      e.preventDefault(); dropEsp.classList.add('is-dragover');
    }));
    ['dragleave','drop'].forEach(ev => dropEsp.addEventListener(ev, e => {
      e.preventDefault(); dropEsp.classList.remove('is-dragover');
    }));
    dropEsp.addEventListener('drop', e => {
      const f = e.dataTransfer.files?.[0];
      if (f) procesarArchivoEsp(f);
    });
    document.getElementById('btnQuitarImagenEsp').addEventListener('click', cerrarPreviewEsp);

    // Filtros
    document.querySelectorAll('input[name="vista"]').forEach(r => {
      r.addEventListener('change', e => { state.vista = e.target.value; render(); });
    });
    document.getElementById('selectPlataforma').addEventListener('change', e => {
      state.plataformaFiltro = e.target.value; render();
    });
    document.getElementById('inputBuscar').addEventListener('input', e => {
      state.busqueda = e.target.value; render();
    });
    document.querySelectorAll('[data-sort]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.orden = btn.dataset.sort;
        document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });

    // Carpeta de datos
    const btnCarpeta = document.getElementById('btnCarpeta');
    if (btnCarpeta) btnCarpeta.addEventListener('click', conectarCarpeta);
    actualizarIndicadorCarpeta();

    // Import / Export
    document.getElementById('btnExport').addEventListener('click', exportarZIP);
    document.getElementById('btnImport').addEventListener('click', () => document.getElementById('inputImport').click());
    document.getElementById('btnImportEmpty').addEventListener('click', () => document.getElementById('inputImport').click());
    document.getElementById('inputImport').addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) importarJSON(f);
      e.target.value = '';
    });

    // Atajo de teclado: "N" para nueva
    document.addEventListener('keydown', e => {
      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        resetForm();
        modalForm().show();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Arranque
  // ---------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', async () => {
    cargar();          // carga desde localStorage primero
    bind();
    await iniciarCarpeta(); // intenta restaurar carpeta y leer JSON (puede sobreescribir estado)
    render();
  });
})();

(function () {
  const API_BASE =
    (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ||
    new URLSearchParams(window.location.search).get('api') ||
    localStorage.getItem('API_BASE_URL') ||
    'http://localhost:8000';

  const qs = new URLSearchParams(window.location.search);

  const state = {
    noticiaId: qs.get('id'),
    quill: null,
  };

  const el = {
    modeLabel: document.getElementById('modeLabel'),
    status: document.getElementById('status'),
    titulo: document.getElementById('titulo'),
    resumen: document.getElementById('resumen'),
    categoria: document.getElementById('categoria'),
    autor: document.getElementById('autor'),
    imagenUrl: document.getElementById('imagen_url'),
    imagenAlt: document.getElementById('imagen_alt'),
    publicada: document.getElementById('publicada'),
    fechaProgramada: document.getElementById('fecha_programada'),
    btnDraft: document.getElementById('btnDraft'),
    btnUploadNews: document.getElementById('btnUploadNews'),
    btnSchedule: document.getElementById('btnSchedule'),
    btnUpdate: document.getElementById('btnUpdate'),
    btnInsertImageUrl: document.getElementById('btnInsertImageUrl'),
    btnInsertEmbed: document.getElementById('btnInsertEmbed'),
    previewFrame: document.getElementById('previewFrame'),
    openPreviewWindow: document.getElementById('openPreviewWindow'),
  };

  function ensureAdminAccess() {
    const token = localStorage.getItem('access_token');
    const rawUser = localStorage.getItem('user_data');

    if (!token || !rawUser) {
      window.location.href = '../../auth/login.html';
      return false;
    }

    try {
      const user = JSON.parse(rawUser);
      if (!user || user.role !== 'admin') {
        window.location.href = '../dashboard.html';
        return false;
      }
    } catch (_e) {
      window.location.href = '../../auth/login.html';
      return false;
    }

    return true;
  }

  function getToken() {
    return localStorage.getItem('access_token') || '';
  }

  function setStatus(message, isError) {
    el.status.textContent = message || '';
    el.status.classList.toggle('error', Boolean(isError));
  }

  function apiRequest(path, options) {
    const headers = Object.assign({}, options && options.headers ? options.headers : {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    return fetch(API_BASE + path, Object.assign({}, options, { headers })).then(async (response) => {
      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const body = await response.json();
          detail = body.detail || JSON.stringify(body);
        } catch (_) {}
        throw new Error(detail);
      }

      if (response.status === 204) return null;
      const ct = response.headers.get('content-type') || '';
      return ct.includes('application/json') ? response.json() : null;
    });
  }

  function getPayload(overrides) {
    return Object.assign(
      {
        titulo: el.titulo.value.trim(),
        resumen: el.resumen.value.trim() || null,
        categoria: el.categoria.value || null,
        autor: el.autor.value.trim() || null,
        imagen_url: el.imagenUrl.value.trim() || null,
        imagen_alt: el.imagenAlt.value.trim() || null,
        publicada: Boolean(el.publicada.checked),
        contenido: state.quill.root.innerHTML,
      },
      overrides || {}
    );
  }

  function normalizeHttpUrl(input) {
    const raw = (input || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }

  function youtubeEmbedUrl(input) {
    const raw = (input || '').trim();
    if (!raw) return '';

    if (raw.includes('<iframe')) {
      const srcMatch = raw.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) return youtubeEmbedUrl(srcMatch[1]);
    }

    if (/youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/i.test(raw)) {
      return raw;
    }

    const watch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch && watch[1]) return `https://www.youtube.com/embed/${watch[1]}`;

    const short = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short && short[1]) return `https://www.youtube.com/embed/${short[1]}`;

    return '';
  }

  function currentSelectionIndex() {
    const range = state.quill.getSelection(true);
    return range ? range.index : state.quill.getLength();
  }

  function buildPreviewPayload() {
    const fecha = el.fechaProgramada.value
      ? new Date(el.fechaProgramada.value).toISOString()
      : new Date().toISOString();

    const categoria = (el.categoria.value || '').trim();

    return {
      id: state.noticiaId || null,
      titulo: el.titulo.value.trim() || 'Nueva noticia',
      resumen: el.resumen.value.trim() || '',
      contenido: state.quill ? state.quill.root.innerHTML : '',
      imagen: el.imagenUrl.value.trim() || null,
      imagen_url: el.imagenUrl.value.trim() || null,
      imagen_alt: el.imagenAlt.value.trim() || '',
      autor: el.autor.value.trim() || 'IPSM',
      categoria: categoria || null,
      categorias: categoria ? [categoria] : [],
      fecha: fecha,
      fecha_publicacion: fecha,
      publicada: Boolean(el.publicada.checked),
      preview: true,
    };
  }

  function syncPreviewFrame() {
    if (!state.quill) return;

    const payload = buildPreviewPayload();
    localStorage.setItem('news_preview_payload', JSON.stringify(payload));

    if (el.previewFrame && el.previewFrame.contentWindow) {
      el.previewFrame.contentWindow.postMessage(
        { type: 'NEWS_PREVIEW_UPDATE', payload: payload },
        '*'
      );
    }
  }

  async function uploadEditorImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_BASE + '/api/v1/admin/noticias/upload-image', {
      method: 'POST',
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload fallo (${response.status})`);
    }

    const body = await response.json();
    if (!body || !body.url) throw new Error('Respuesta de upload invalida');
    return body.url;
  }

  function openImagePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = async function () {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      try {
        setStatus('Subiendo imagen...');
        const url = await uploadEditorImage(file);
        state.quill.insertEmbed(currentSelectionIndex(), 'image', url, 'user');
        setStatus('Imagen subida correctamente.');
        syncPreviewFrame();
      } catch (err) {
        setStatus(`No se pudo subir imagen: ${err.message}`, true);
      }
    };
  }

  function insertImageByUrl() {
    const input = window.prompt('Pega URL directa de imagen (https://...)');
    if (!input) return;

    const url = normalizeHttpUrl(input);
    if (!/^https?:\/\//i.test(url)) {
      setStatus('URL de imagen invalida.', true);
      return;
    }

    state.quill.insertEmbed(currentSelectionIndex(), 'image', url, 'user');
    syncPreviewFrame();
    setStatus('Imagen insertada por URL.');
  }

  function insertYoutubeEmbed() {
    const input = window.prompt('Pega URL de YouTube o iframe de YouTube');
    if (!input) return;

    const embed = youtubeEmbedUrl(input);
    if (!embed) {
      setStatus('Solo se aceptan embeds de YouTube.', true);
      return;
    }

    state.quill.insertEmbed(currentSelectionIndex(), 'video', embed, 'user');
    syncPreviewFrame();
    setStatus('Embed de video insertado.');
  }

  function initQuill() {
    if (typeof Quill === 'undefined') {
      setStatus('Quill no cargo correctamente.', true);
      return;
    }

    state.quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      },
      placeholder: 'Escribi el contenido de la noticia...',
    });

    const toolbar = state.quill.getModule('toolbar');
    toolbar.addHandler('image', openImagePicker);
    toolbar.addHandler('video', insertYoutubeEmbed);

    state.quill.on('text-change', syncPreviewFrame);
  }

  async function loadNoticia(id) {
    const data = await apiRequest(`/api/v1/admin/noticias/${encodeURIComponent(id)}`, { method: 'GET' });

    el.titulo.value = data.titulo || '';
    el.resumen.value = data.resumen || '';
    el.categoria.value = data.categoria || '';
    el.autor.value = data.autor || '';
    el.imagenUrl.value = data.imagen_url || '';
    el.imagenAlt.value = data.imagen_alt || '';
    el.publicada.checked = Boolean(data.publicada);

    if (data.fecha_publicacion) {
      const d = new Date(data.fecha_publicacion);
      if (!Number.isNaN(d.getTime())) {
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        el.fechaProgramada.value = local.toISOString().slice(0, 16);
      }
    }

    state.quill.root.innerHTML = data.contenido || '<p><br></p>';
    syncPreviewFrame();
  }

  function createNoticia(payload) {
    return apiRequest('/api/v1/admin/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  function updateNoticia(id, payload) {
    return apiRequest(`/api/v1/admin/noticias/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function ensureNewsId() {
    if (state.noticiaId) return state.noticiaId;

    const created = await createNoticia(getPayload({ publicada: false }));
    if (!created || !created.id) throw new Error('No se pudo crear borrador base');

    state.noticiaId = created.id;
    window.history.replaceState({}, '', `?id=${encodeURIComponent(state.noticiaId)}`);
    el.modeLabel.textContent = 'Modo: Editar noticia';
    el.btnUpdate.disabled = false;
    syncPreviewFrame();
    return state.noticiaId;
  }

  async function submitDraft() {
    if (!el.titulo.value.trim()) {
      setStatus('El titulo es obligatorio.', true);
      return;
    }

    setStatus('Guardando borrador...');
    try {
      if (state.noticiaId) {
        await updateNoticia(state.noticiaId, getPayload({ publicada: false }));
      } else {
        await ensureNewsId();
      }
      setStatus('Borrador guardado correctamente.');
    } catch (err) {
      setStatus(`Error al guardar borrador: ${err.message}`, true);
    }
  }

  async function submitUpload() {
    if (!el.titulo.value.trim()) {
      setStatus('El titulo es obligatorio.', true);
      return;
    }

    setStatus('Subiendo noticia...');
    try {
      const payload = getPayload({ publicada: true, fecha_publicacion: new Date().toISOString() });
      if (state.noticiaId) {
        await updateNoticia(state.noticiaId, payload);
      } else {
        const created = await createNoticia(payload);
        state.noticiaId = created.id;
        window.history.replaceState({}, '', `?id=${encodeURIComponent(state.noticiaId)}`);
      }

      el.publicada.checked = true;
      el.btnUpdate.disabled = false;
      el.modeLabel.textContent = 'Modo: Editar noticia';
      syncPreviewFrame();
      setStatus('Noticia subida/publicada correctamente.');
    } catch (err) {
      setStatus(`Error al subir noticia: ${err.message}`, true);
    }
  }

  async function submitSchedule() {
    if (!el.titulo.value.trim()) {
      setStatus('El titulo es obligatorio.', true);
      return;
    }

    if (!el.fechaProgramada.value) {
      setStatus('Selecciona fecha y hora para programar.', true);
      return;
    }

    setStatus('Programando publicacion...');
    try {
      const id = await ensureNewsId();
      const scheduledIso = new Date(el.fechaProgramada.value).toISOString();

      await updateNoticia(id, getPayload({ publicada: true, fecha_publicacion: scheduledIso }));

      try {
        await apiRequest(`/api/v1/admin/noticias/${encodeURIComponent(id)}/programar-publicacion`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fecha_publicacion: scheduledIso }),
        });
      } catch (_) {}

      el.publicada.checked = true;
      syncPreviewFrame();
      setStatus('Publicacion programada correctamente.');
    } catch (err) {
      setStatus(`Error al programar: ${err.message}`, true);
    }
  }

  async function submitUpdate() {
    if (!state.noticiaId) {
      setStatus('Primero guarda o sube la noticia.', true);
      return;
    }

    setStatus('Actualizando noticia...');
    try {
      await updateNoticia(state.noticiaId, getPayload());
      syncPreviewFrame();
      setStatus('Noticia actualizada correctamente.');
    } catch (err) {
      setStatus(`Error al actualizar: ${err.message}`, true);
    }
  }

  function bindEvents() {
    ['input', 'change'].forEach((evt) => {
      el.titulo.addEventListener(evt, syncPreviewFrame);
      el.resumen.addEventListener(evt, syncPreviewFrame);
      el.categoria.addEventListener(evt, syncPreviewFrame);
      el.autor.addEventListener(evt, syncPreviewFrame);
      el.imagenUrl.addEventListener(evt, syncPreviewFrame);
      el.imagenAlt.addEventListener(evt, syncPreviewFrame);
      el.publicada.addEventListener(evt, syncPreviewFrame);
      el.fechaProgramada.addEventListener(evt, syncPreviewFrame);
    });

    el.btnDraft.addEventListener('click', submitDraft);
    el.btnUploadNews.addEventListener('click', submitUpload);
    el.btnSchedule.addEventListener('click', submitSchedule);
    el.btnUpdate.addEventListener('click', submitUpdate);

    el.btnInsertImageUrl.addEventListener('click', insertImageByUrl);
    el.btnInsertEmbed.addEventListener('click', insertYoutubeEmbed);

    if (el.previewFrame) {
      el.previewFrame.addEventListener('load', syncPreviewFrame);
    }
  }

  async function init() {
    if (!ensureAdminAccess()) return;

    initQuill();
    if (!state.quill) return;

    bindEvents();

    if (state.noticiaId) {
      el.modeLabel.textContent = 'Modo: Editar noticia';
      el.btnUpdate.disabled = false;
      try {
        setStatus('Cargando noticia...');
        await loadNoticia(state.noticiaId);
        setStatus('Noticia cargada.');
      } catch (err) {
        setStatus(`No se pudo cargar: ${err.message}`, true);
      }
    } else {
      el.modeLabel.textContent = 'Modo: Crear noticia';
      el.btnUpdate.disabled = true;
      syncPreviewFrame();
      setStatus('Listo para crear noticia.');
    }
  }

  init();
})();

(function () {
  const API_BASE =
    new URLSearchParams(window.location.search).get("api") ||
    localStorage.getItem("API_BASE_URL") ||
    "http://localhost:8000";

  const qs = new URLSearchParams(window.location.search);

  const state = {
    noticiaId: qs.get("id"),
    quill: null,
  };

  const el = {
    modeLabel: document.getElementById("modeLabel"),
    status: document.getElementById("status"),
    titulo: document.getElementById("titulo"),
    resumen: document.getElementById("resumen"),
    categoria: document.getElementById("categoria"),
    autor: document.getElementById("autor"),
    imagenUrl: document.getElementById("imagen_url"),
    imagenAlt: document.getElementById("imagen_alt"),
    publicada: document.getElementById("publicada"),
    fechaProgramada: document.getElementById("fecha_programada"),
    btnDraft: document.getElementById("btnDraft"),
    btnPublishNow: document.getElementById("btnPublishNow"),
    btnSchedule: document.getElementById("btnSchedule"),
    btnUpdate: document.getElementById("btnUpdate"),
    previewFrame: document.getElementById("previewFrame"),
    btnOpenPreview: document.getElementById("btnOpenPreview"),
  };

  function ensureAdminAccess() {
    const token = localStorage.getItem("access_token");
    const rawUser = localStorage.getItem("user_data");

    if (!token || !rawUser) {
      window.location.href = "../../auth/login.html";
      return false;
    }

    try {
      const user = JSON.parse(rawUser);
      if (!user || user.role !== "admin") {
        window.location.href = "../dashboard.html";
        return false;
      }
    } catch (e) {
      window.location.href = "../../auth/login.html";
      return false;
    }

    return true;
  }

  function getToken() {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("access_token") ||
      ""
    );
  }

  function setStatus(message, isError) {
    el.status.textContent = message || "";
    el.status.classList.toggle("error", Boolean(isError));
  }

  function apiRequest(path, options) {
    const headers = Object.assign({}, options && options.headers ? options.headers : {});
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    return fetch(API_BASE + path, Object.assign({}, options, { headers })).then(async (response) => {
      if (!response.ok) {
        let detail = "Error de servidor";
        try {
          const body = await response.json();
          detail = body.detail || JSON.stringify(body);
        } catch (e) {}
        throw new Error(detail);
      }

      if (response.status === 204) return null;
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) return response.json();
      return null;
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

  function getPreviewPayload() {
    const categoria = el.categoria.value || "";
    return {
      id: state.noticiaId || "preview",
      titulo: el.titulo.value.trim() || "Nueva noticia",
      resumen: el.resumen.value.trim() || "",
      contenido: state.quill ? state.quill.root.innerHTML : "<p><br></p>",
      imagen_url: el.imagenUrl.value.trim() || null,
      imagen_alt: el.imagenAlt.value.trim() || "",
      categoria: categoria,
      categorias: categoria ? [categoria] : [],
      autor: el.autor.value.trim() || "Instituto San Marino",
      fecha_publicacion: el.fechaProgramada.value ? new Date(el.fechaProgramada.value).toISOString() : new Date().toISOString(),
      fecha: el.fechaProgramada.value ? new Date(el.fechaProgramada.value).toISOString() : new Date().toISOString(),
      publicada: Boolean(el.publicada.checked),
    };
  }

  function syncPreview() {
    const payload = getPreviewPayload();
    localStorage.setItem("news_preview_payload", JSON.stringify(payload));

    if (el.previewFrame && el.previewFrame.contentWindow) {
      el.previewFrame.contentWindow.postMessage({
        type: "NEWS_PREVIEW_UPDATE",
        payload,
      }, "*");
    }

    if (el.btnOpenPreview) {
      el.btnOpenPreview.href = "../../noticia-detalle.html?preview=1";
    }
  }

  function initQuill() {
    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ];

    state.quill = new Quill("#editor", {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
      placeholder: "Escribí el contenido de la noticia...",
    });

    const toolbar = state.quill.getModule("toolbar");
    toolbar.addHandler("image", function () {
      const fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("accept", "image/*");
      fileInput.click();

      fileInput.onchange = async function () {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;

        try {
          setStatus("Subiendo imagen...");
          const formData = new FormData();
          formData.append("file", file);

          const token = getToken();
          const response = await fetch(API_BASE + "/api/v1/admin/noticias/upload-image", {
            method: "POST",
            headers: token ? { Authorization: "Bearer " + token } : {},
            body: formData,
          });

          if (!response.ok) {
            throw new Error("No se pudo subir la imagen");
          }

          const body = await response.json();
          if (!body || !body.url) throw new Error("Upload inválido");

          const range = state.quill.getSelection(true);
          state.quill.insertEmbed(range ? range.index : 0, "image", body.url, "user");
          setStatus("Imagen subida.");
          syncPreview();
        } catch (err) {
          setStatus("Error al subir imagen. Podés pegar URL manual.", true);
          const manual = window.prompt("Pegá la URL de la imagen:");
          if (manual) {
            const range = state.quill.getSelection(true);
            state.quill.insertEmbed(range ? range.index : 0, "image", manual, "user");
            syncPreview();
          }
        }
      };
    });

    state.quill.on("text-change", syncPreview);
  }

  function bindEvents() {
    ["input", "change"].forEach(function (evt) {
      el.titulo.addEventListener(evt, syncPreview);
      el.resumen.addEventListener(evt, syncPreview);
      el.categoria.addEventListener(evt, syncPreview);
      el.autor.addEventListener(evt, syncPreview);
      el.imagenUrl.addEventListener(evt, syncPreview);
      el.imagenAlt.addEventListener(evt, syncPreview);
      el.publicada.addEventListener(evt, syncPreview);
      el.fechaProgramada.addEventListener(evt, syncPreview);
    });

    el.previewFrame.addEventListener("load", syncPreview);

    el.btnDraft.addEventListener("click", submitAsDraft);
    el.btnPublishNow.addEventListener("click", submitAsPublishNow);
    el.btnSchedule.addEventListener("click", submitSchedulePublication);
    el.btnUpdate.addEventListener("click", submitUpdate);
  }

  async function loadNoticia(id) {
    const data = await apiRequest("/api/v1/admin/noticias/" + encodeURIComponent(id), { method: "GET" });

    el.titulo.value = data.titulo || "";
    el.resumen.value = data.resumen || "";
    el.categoria.value = data.categoria || "";
    el.autor.value = data.autor || "";
    el.imagenUrl.value = data.imagen_url || "";
    el.imagenAlt.value = data.imagen_alt || "";
    el.publicada.checked = Boolean(data.publicada);

    if (data.fecha_publicacion) {
      const d = new Date(data.fecha_publicacion);
      if (!Number.isNaN(d.getTime())) {
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        el.fechaProgramada.value = local.toISOString().slice(0, 16);
      }
    }

    state.quill.root.innerHTML = data.contenido || "<p><br></p>";
    syncPreview();
  }

  async function createNoticia(payload) {
    return apiRequest("/api/v1/admin/noticias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function updateNoticia(id, payload) {
    return apiRequest("/api/v1/admin/noticias/" + encodeURIComponent(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function ensureNewsIdForActions() {
    if (state.noticiaId) return state.noticiaId;

    const created = await createNoticia(getPayload({ publicada: false }));
    if (!created || !created.id) throw new Error("No se pudo crear borrador base");

    state.noticiaId = created.id;
    window.history.replaceState({}, "", "?id=" + encodeURIComponent(state.noticiaId));
    el.modeLabel.textContent = "Modo: Editar noticia";
    el.btnUpdate.disabled = false;
    return state.noticiaId;
  }

  async function submitAsDraft() {
    if (!el.titulo.value.trim()) {
      setStatus("El título es obligatorio.", true);
      return;
    }

    setStatus("Guardando borrador...");
    try {
      if (state.noticiaId) {
        await updateNoticia(state.noticiaId, getPayload({ publicada: false }));
      } else {
        const created = await createNoticia(getPayload({ publicada: false }));
        state.noticiaId = created.id;
        window.history.replaceState({}, "", "?id=" + encodeURIComponent(state.noticiaId));
        el.modeLabel.textContent = "Modo: Editar noticia";
        el.btnUpdate.disabled = false;
      }
      setStatus("Borrador guardado correctamente.");
      syncPreview();
    } catch (err) {
      setStatus("No se pudo guardar borrador: " + err.message, true);
    }
  }

  async function submitAsPublishNow() {
    if (!el.titulo.value.trim()) {
      setStatus("El título es obligatorio.", true);
      return;
    }

    setStatus("Publicando noticia...");
    try {
      const payload = getPayload({
        publicada: true,
        fecha_publicacion: new Date().toISOString(),
      });

      if (state.noticiaId) {
        await updateNoticia(state.noticiaId, payload);
      } else {
        const created = await createNoticia(payload);
        state.noticiaId = created.id;
        window.history.replaceState({}, "", "?id=" + encodeURIComponent(state.noticiaId));
        el.modeLabel.textContent = "Modo: Editar noticia";
        el.btnUpdate.disabled = false;
      }

      el.publicada.checked = true;
      setStatus("Noticia publicada correctamente.");
      syncPreview();
    } catch (err) {
      setStatus("No se pudo publicar: " + err.message, true);
    }
  }

  async function submitSchedulePublication() {
    if (!el.titulo.value.trim()) {
      setStatus("El título es obligatorio.", true);
      return;
    }

    if (!el.fechaProgramada.value) {
      setStatus("Seleccioná fecha y hora para programar.", true);
      return;
    }

    setStatus("Programando publicación...");
    try {
      const id = await ensureNewsIdForActions();

      await updateNoticia(id, getPayload({ publicada: true }));
      await apiRequest("/api/v1/admin/noticias/" + encodeURIComponent(id) + "/programar-publicacion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha_publicacion: new Date(el.fechaProgramada.value).toISOString() }),
      });

      el.publicada.checked = true;
      setStatus("Publicación programada correctamente.");
      syncPreview();
    } catch (err) {
      setStatus("No se pudo programar: " + err.message, true);
    }
  }

  async function submitUpdate() {
    if (!state.noticiaId) {
      setStatus("Primero creá la noticia para poder actualizarla.", true);
      return;
    }

    if (!el.titulo.value.trim()) {
      setStatus("El título es obligatorio.", true);
      return;
    }

    setStatus("Actualizando noticia...");
    try {
      await updateNoticia(state.noticiaId, getPayload());
      setStatus("Noticia actualizada correctamente.");
      syncPreview();
    } catch (err) {
      setStatus("No se pudo actualizar: " + err.message, true);
    }
  }

  async function init() {
    if (!ensureAdminAccess()) return;

    initQuill();
    bindEvents();
    syncPreview();

    if (state.noticiaId) {
      el.modeLabel.textContent = "Modo: Editar noticia";
      el.btnUpdate.disabled = false;
      try {
        setStatus("Cargando noticia...");
        await loadNoticia(state.noticiaId);
        setStatus("Noticia cargada.");
      } catch (err) {
        setStatus("No se pudo cargar la noticia: " + err.message, true);
      }
    } else {
      el.modeLabel.textContent = "Modo: Crear noticia";
      el.btnUpdate.disabled = true;
      setStatus("Listo para crear noticia.");
    }
  }

  init();
})();

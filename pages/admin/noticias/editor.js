(function () {
  const API_BASE =
    new URLSearchParams(window.location.search).get("api") ||
    localStorage.getItem("API_BASE_URL") ||
    "http://localhost:8000";

  const qs = new URLSearchParams(window.location.search);
  const noticiaId = qs.get("id");

  const state = {
    editing: Boolean(noticiaId),
    quill: null,
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
    btnDraft: document.getElementById("btnDraft"),
    btnPublish: document.getElementById("btnPublish"),
    btnUpdate: document.getElementById("btnUpdate"),
    previewCategoria: document.getElementById("previewCategoria"),
    previewTitulo: document.getElementById("previewTitulo"),
    previewResumen: document.getElementById("previewResumen"),
    previewImagen: document.getElementById("previewImagen"),
    previewContenido: document.getElementById("previewContenido"),
  };

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

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updatePreview() {
    el.previewCategoria.textContent = (el.categoria.value || "").trim();
    el.previewTitulo.textContent = (el.titulo.value || "").trim() || "TÃ­tulo de la noticia";
    el.previewResumen.textContent = (el.resumen.value || "").trim();
    el.previewContenido.innerHTML = state.quill.root.innerHTML;

    const imageSrc = (el.imagenUrl.value || "").trim();
    if (imageSrc) {
      el.previewImagen.src = imageSrc;
      el.previewImagen.alt = (el.imagenAlt.value || "").trim();
      el.previewImagen.hidden = false;
    } else {
      el.previewImagen.hidden = true;
      el.previewImagen.removeAttribute("src");
      el.previewImagen.removeAttribute("alt");
    }
  }

  function getPayload(overrides) {
    return Object.assign(
      {
        titulo: el.titulo.value.trim(),
        resumen: el.resumen.value.trim() || null,
        categoria: el.categoria.value.trim() || null,
        autor: el.autor.value.trim() || null,
        imagen_url: el.imagenUrl.value.trim() || null,
        imagen_alt: el.imagenAlt.value.trim() || null,
        publicada: Boolean(el.publicada.checked),
        contenido: state.quill.root.innerHTML,
      },
      overrides || {}
    );
  }

  async function apiRequest(path, options) {
    const headers = Object.assign({}, options && options.headers ? options.headers : {});
    const token = getToken();
    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
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
  }

  async function loadNoticia(id) {
    const data = await apiRequest("/api/v1/admin/noticias/" + encodeURIComponent(id), {
      method: "GET",
    });

    el.titulo.value = data.titulo || "";
    el.resumen.value = data.resumen || "";
    el.categoria.value = data.categoria || "";
    el.autor.value = data.autor || "";
    el.imagenUrl.value = data.imagen_url || "";
    el.imagenAlt.value = data.imagen_alt || "";
    el.publicada.checked = Boolean(data.publicada);
    state.quill.root.innerHTML = data.contenido || "<p><br></p>";
    updatePreview();
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

  async function submitAsDraft() {
    if (!el.titulo.value.trim()) {
      setStatus("El tÃ­tulo es obligatorio.", true);
      return;
    }
    setStatus("Guardando borrador...");
    try {
      const payload = getPayload({ publicada: false });
      const result = state.editing
        ? await updateNoticia(noticiaId, payload)
        : await createNoticia(payload);

      if (!state.editing && result && result.id) {
        window.history.replaceState({}, "", "?id=" + encodeURIComponent(result.id));
      }
      setStatus("Borrador guardado correctamente.");
    } catch (err) {
      setStatus("No se pudo guardar borrador: " + err.message, true);
    }
  }

  async function submitAsPublish() {
    if (!el.titulo.value.trim()) {
      setStatus("El tÃ­tulo es obligatorio.", true);
      return;
    }
    setStatus("Publicando noticia...");
    try {
      const payload = getPayload({ publicada: true });
      const result = state.editing
        ? await updateNoticia(noticiaId, payload)
        : await createNoticia(payload);

      if (!state.editing && result && result.id) {
        window.history.replaceState({}, "", "?id=" + encodeURIComponent(result.id));
      }
      el.publicada.checked = true;
      setStatus("Noticia publicada correctamente.");
    } catch (err) {
      setStatus("No se pudo publicar: " + err.message, true);
    }
  }

  async function submitUpdate() {
    if (!state.editing) {
      setStatus("Primero crea la noticia para poder actualizarla.", true);
      return;
    }
    if (!el.titulo.value.trim()) {
      setStatus("El tÃ­tulo es obligatorio.", true);
      return;
    }
    setStatus("Actualizando noticia...");
    try {
      const payload = getPayload();
      await updateNoticia(noticiaId, payload);
      setStatus("Noticia actualizada correctamente.");
    } catch (err) {
      setStatus("No se pudo actualizar: " + err.message, true);
    }
  }

  async function uploadImage(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_BASE + "/api/v1/admin/noticias/upload-image", {
      method: "POST",
      headers: token ? { Authorization: "Bearer " + token } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error("No se pudo subir la imagen");
    }

    const body = await response.json();
    if (!body || !body.url) {
      throw new Error("Respuesta invÃ¡lida del upload");
    }
    return body.url;
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
      placeholder: "EscribÃ­ el contenido de la noticia...",
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
          const url = await uploadImage(file);
          const range = state.quill.getSelection(true);
          state.quill.insertEmbed(range ? range.index : 0, "image", url, "user");
          setStatus("Imagen subida.");
          updatePreview();
        } catch (err) {
          setStatus("Error al subir imagen. PodÃ©s pegar una URL manual.", true);
          const manual = window.prompt("PegÃ¡ la URL de la imagen:");
          if (manual) {
            const range = state.quill.getSelection(true);
            state.quill.insertEmbed(range ? range.index : 0, "image", manual, "user");
            updatePreview();
          }
        }
      };
    });

    state.quill.on("text-change", updatePreview);
  }

  function bindEvents() {
    ["input", "change"].forEach(function (evt) {
      el.titulo.addEventListener(evt, updatePreview);
      el.resumen.addEventListener(evt, updatePreview);
      el.categoria.addEventListener(evt, updatePreview);
      el.imagenUrl.addEventListener(evt, updatePreview);
      el.imagenAlt.addEventListener(evt, updatePreview);
    });

    el.btnDraft.addEventListener("click", submitAsDraft);
    el.btnPublish.addEventListener("click", submitAsPublish);
    el.btnUpdate.addEventListener("click", submitUpdate);
  }

  async function init() {
    if (!ensureAdminAccess()) return;
    initQuill();
    bindEvents();
    updatePreview();

    if (state.editing) {
      el.modeLabel.textContent = "Modo: Editar noticia";
      el.btnUpdate.disabled = false;
      try {
        setStatus("Cargando noticia...");
        await loadNoticia(noticiaId);
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



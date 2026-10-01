/* Cliente API, conecta el sitio con el backend real de SAVE.
   Todas las funciones devuelven una Promise, el backend corre en el mismo
   origen que el sitio (mismo dominio/puerto), así que no hace falta
   configurar una URL aparte. */
const API_BASE = "/api";
const API_TIMEOUT_MS = 12000; // si el backend no responde en 12s, mostramos error en vez de quedar cargando para siempre

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(API_BASE + path, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === "AbortError") {
      throw new Error("El servidor está tardando demasiado en responder. Verifica tu conexión o que el backend esté corriendo.");
    }
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
  }
  clearTimeout(timeoutId);
  let data = null;
  try { data = await res.json(); } catch (e) { /* respuesta sin cuerpo JSON */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Error de red (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const Api = {
  // Paraderos y estaciones (geolocalización), el sitio público solo pide activos
  paraderosCercanos: (lat, lng, radio = 2, limite = 12, tipo) => {
    const p = new URLSearchParams({ lat, lng, radio, limite });
    if (tipo) p.set("tipo", tipo);
    return apiFetch(`/paraderos/cercanos?${p.toString()}`);
  },
  paraderos: (params = {}) => apiFetch(`/paraderos?${new URLSearchParams({ activo: "1", ...params }).toString()}`),
  comunas: () => apiFetch(`/paraderos/meta/comunas`),

  // Nodos SAVE — el sitio público solo pide activos
  nodos: (tipo) => {
    const p = new URLSearchParams({ activo: "1" });
    if (tipo && tipo !== "Todos") p.set("tipo", tipo);
    return apiFetch(`/nodos?${p.toString()}`);
  },
  nodo: (id) => apiFetch(`/nodos/${id}`),
  nodosCercanos: (lat, lng, radio = 5) => apiFetch(`/nodos/cercanos?lat=${lat}&lng=${lng}&radio=${radio}`),
  crearNodo: (data) => apiFetch(`/nodos`, { method: "POST", body: JSON.stringify(data) }),
  actualizarNodo: (id, data) => apiFetch(`/nodos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarNodo: (id) => apiFetch(`/nodos/${id}`, { method: "DELETE" }),

  // Empresas
  empresas: (categoria) => apiFetch(`/empresas${categoria && categoria !== "Todas" ? `?categoria=${encodeURIComponent(categoria)}` : ""}`),

  // Noticias
  noticias: (categoria) => apiFetch(`/noticias${categoria && categoria !== "Todas" ? `?categoria=${encodeURIComponent(categoria)}` : ""}`),
  noticia: (slug) => apiFetch(`/noticias/${slug}`),
  noticiasDestacadas: () => apiFetch(`/noticias/destacadas`),

  // Lanzamientos
  lanzamientos: () => apiFetch(`/lanzamientos`),
  equipo: () => apiFetch(`/equipo`),

  // Casos
  casos: (tipo) => apiFetch(`/casos${tipo && tipo !== "Todos" ? `?tipo=${encodeURIComponent(tipo)}` : ""}`),

  // Producto (imágenes home: pulsera, app, nodo móvil)
  producto: (producto) => apiFetch(`/producto${producto ? `?producto=${encodeURIComponent(producto)}` : ""}`),

  // Formularios públicos
  enviarSolicitud: (data) => apiFetch(`/solicitudes`, { method: "POST", body: JSON.stringify(data) }),
  enviarCotizacion: (data) => apiFetch(`/cotizaciones`, { method: "POST", body: JSON.stringify(data) }),
  enviarContacto: (data) => apiFetch(`/contacto`, { method: "POST", body: JSON.stringify(data) }),
  suscribirNewsletter: (data) => apiFetch(`/newsletter`, { method: "POST", body: JSON.stringify(data) }),
};

/* Geolocalización del navegador */
function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este navegador no soporta geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

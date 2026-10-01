const API_BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const err = new Error((data && data.error) || `Error (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function apiUpload(file) {
  const fd = new FormData();
  fd.append("imagen", file);
  const res = await fetch(API_BASE + "/uploads", { method: "POST", credentials: "include", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al subir la imagen.");
  return data.url;
}

const Api = {
  login: (email, password) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  me: () => apiFetch("/auth/me"),

  solicitudes: (params = {}) => apiFetch(`/solicitudes?${new URLSearchParams(params).toString()}`),
  actualizarSolicitud: (id, data) => apiFetch(`/solicitudes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarSolicitud: (id) => apiFetch(`/solicitudes/${id}`, { method: "DELETE" }),

  cotizaciones: (params = {}) => apiFetch(`/cotizaciones?${new URLSearchParams(params).toString()}`),
  actualizarCotizacion: (id, data) => apiFetch(`/cotizaciones/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarCotizacion: (id) => apiFetch(`/cotizaciones/${id}`, { method: "DELETE" }),

  contactos: () => apiFetch(`/contacto`),
  actualizarContacto: (id, data) => apiFetch(`/contacto/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarContacto: (id) => apiFetch(`/contacto/${id}`, { method: "DELETE" }),

  nodos: () => apiFetch(`/nodos`),
  crearNodo: (data) => apiFetch(`/nodos`, { method: "POST", body: JSON.stringify(data) }),
  actualizarNodo: (id, data) => apiFetch(`/nodos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  activarNodo: (id, activo) => apiFetch(`/nodos/${id}/activo`, { method: "PATCH", body: JSON.stringify({ activo }) }),
  geocodificarNodo: (data) => apiFetch(`/nodos/geocodificar`, { method: "POST", body: JSON.stringify(data) }),
  eliminarNodo: (id) => apiFetch(`/nodos/${id}`, { method: "DELETE" }),

  paraderos: (params = {}) => apiFetch(`/paraderos?${new URLSearchParams(params).toString()}`),
  paraderosAdmin: (params = {}) => apiFetch(`/paraderos?${new URLSearchParams(params).toString()}`),
  paraderosResumen: () => apiFetch(`/paraderos/meta/resumen`),
  comunas: () => apiFetch(`/paraderos/meta/comunas`),
  crearParadero: (data) => apiFetch(`/paraderos`, { method: "POST", body: JSON.stringify(data) }),
  actualizarParadero: (id, data) => apiFetch(`/paraderos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  activarParadero: (id, activo) => apiFetch(`/paraderos/${id}/activo`, { method: "PATCH", body: JSON.stringify({ activo }) }),
  activarLoteParaderos: (ids, activo) => apiFetch(`/paraderos/activar-lote`, { method: "PATCH", body: JSON.stringify({ ids, activo }) }),
  eliminarParadero: (id) => apiFetch(`/paraderos/${id}`, { method: "DELETE" }),

  empresas: () => apiFetch(`/empresas`),
  crearEmpresa: (data) => apiFetch(`/empresas`, { method: "POST", body: JSON.stringify(data) }),
  actualizarEmpresa: (id, data) => apiFetch(`/empresas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarEmpresa: (id) => apiFetch(`/empresas/${id}`, { method: "DELETE" }),

  noticias: () => apiFetch(`/noticias?all=1`),
  crearNoticia: (data) => apiFetch(`/noticias`, { method: "POST", body: JSON.stringify(data) }),
  actualizarNoticia: (id, data) => apiFetch(`/noticias/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarNoticia: (id) => apiFetch(`/noticias/${id}`, { method: "DELETE" }),

  lanzamientos: () => apiFetch(`/lanzamientos`),
  crearLanzamiento: (data) => apiFetch(`/lanzamientos`, { method: "POST", body: JSON.stringify(data) }),
  actualizarLanzamiento: (id, data) => apiFetch(`/lanzamientos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarLanzamiento: (id) => apiFetch(`/lanzamientos/${id}`, { method: "DELETE" }),

  producto: () => apiFetch(`/producto`),
  crearProducto: (data) => apiFetch(`/producto`, { method: "POST", body: JSON.stringify(data) }),
  actualizarProducto: (id, data) => apiFetch(`/producto/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarProducto: (id) => apiFetch(`/producto/${id}`, { method: "DELETE" }),

  casos: () => apiFetch(`/casos`),
  crearCaso: (data) => apiFetch(`/casos`, { method: "POST", body: JSON.stringify(data) }),
  actualizarCaso: (id, data) => apiFetch(`/casos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarCaso: (id) => apiFetch(`/casos/${id}`, { method: "DELETE" }),

  newsletter: () => apiFetch(`/newsletter`),
  eliminarNewsletter: (id) => apiFetch(`/newsletter/${id}`, { method: "DELETE" }),

  equipo: () => apiFetch(`/equipo`),
  crearEquipo: (data) => apiFetch(`/equipo`, { method: "POST", body: JSON.stringify(data) }),
  actualizarEquipo: (id, data) => apiFetch(`/equipo/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarEquipo: (id) => apiFetch(`/equipo/${id}`, { method: "DELETE" }),

  admins: () => apiFetch(`/admins`),
  crearAdmin: (data) => apiFetch(`/admins`, { method: "POST", body: JSON.stringify(data) }),
  eliminarAdmin: (id) => apiFetch(`/admins/${id}`, { method: "DELETE" }),
  cambiarPassword: (data) => apiFetch(`/admins/cambiar-password`, { method: "POST", body: JSON.stringify(data) }),
};

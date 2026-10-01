/* Mapa real con Leaflet + OpenStreetMap.
   No requiere API key ni tarjeta de crédito, el día que se cuente con una API Key de Google Maps propia, basta con reemplazar las llamadas a
   L.map / L.tileLayer de este archivo por el SDK de Google Maps, el resto del sitio (geolocalización, distancias, paraderos) sigue igual porque
   toda esa lógica vive en el backend, no en el proveedor del mapa. */

const SANTIAGO_CENTER = [-33.4489, -70.6693];

function crearIconoMapa(color){
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function crearIconoUsuario(){
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/**
 * Inicializa un mapa Leaflet en el contenedor dado, centrado en Santiago (o en la ubicación del usuario si ya se conoce), y devuelve la instancia.
 */

function initLeafletMap(containerId, opts = {}){
  const el = document.getElementById(containerId);
  if(!el || typeof L === "undefined") return null;
  // Evita reinicializar si ya existe un mapa en este contenedor (por ejemplo
  // al volver a una misma vista sin recargar la página).
  if(el._leaflet_id){ return el.__saveMapInstance || null; }

  const map = L.map(containerId, { scrollWheelZoom: false }).setView(
    opts.center || SANTIAGO_CENTER, opts.zoom || 12
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Leaflet calcula su tamaño en el momento en que se crea el mapa; si el contenedor todavía no tiene 
  // su ancho/alto final en ese instante (por una animación de la página, una fuente cargando, 
  // o el panel lateral que cambia de tamaño), el mapa queda descuadrado o a medio cargar. Un
  // ResizeObserver lo mantiene siempre bien encuadrado y centrado, sin depender de adivinar un tiempo de espera fijo.

  if(typeof ResizeObserver !== "undefined"){
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    el.__saveMapResizeObserver = ro;
  }
  [80, 250, 600].forEach(ms => setTimeout(() => map.invalidateSize(), ms));

  el.__saveMapInstance = map;
  return map;
}

/**
 * Home: mini-mapa mostrando los nodos SAVE ya cargados (NODES).
 */

function initHomeMiniMap(){
  const map = initLeafletMap("homeMiniMap", { zoom: 11 });
  if(!map) return;
  const conCoords = NODES.filter(n => n.lat && n.lng);
  const puntos = conCoords.length ? conCoords : [];
  puntos.slice(0, 30).forEach(n => {
    const color = NODE_TYPE_COLOR[n.tipo] || "#E8804A";
    L.marker([n.lat, n.lng], { icon: crearIconoMapa(color) })
      .addTo(map)
      .bindPopup(`<b>${esc(n.nombre)}</b><br>${esc(n.tipo)}`);
  });
  if(puntos.length){
    const bounds = L.latLngBounds(puntos.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [24,24], maxZoom: 13 });
  }
  setTimeout(() => map.invalidateSize(), 200);
}

/**
 * Red de nodos: mapa completo con nodos SAVE + paraderos/estaciones reales cercanos a la ubicación del usuario (si la comparte).
 */

let __saveNodesMap = null;
let __saveUserMarker = null;
let __saveNearbyLayer = null;
let __saveParaderosBaseLayer = null;

function initNodesMap(){
  __saveNodesMap = initLeafletMap("nodesMap", { zoom: 12 });
  if(!__saveNodesMap) return;
  __saveNearbyLayer = L.layerGroup().addTo(__saveNodesMap);
  __saveParaderosBaseLayer = L.layerGroup().addTo(__saveNodesMap);
  __nodeMarkers.clear();

  const conCoords = NODES.filter(n => n.lat && n.lng);
  conCoords.forEach(n => {
    const color = NODE_TYPE_COLOR[n.tipo] || "#E8804A";
    const marcador = L.marker([n.lat, n.lng], { icon: crearIconoMapa(color) })
      .addTo(__saveNodesMap)
      .bindPopup(`<b>${esc(n.nombre)}</b><br>${esc(n.tipo)}${n.comuna ? " · " + esc(n.comuna) : ""}`);
    __nodeMarkers.set(String(n.id), marcador);
  });
  if(conCoords.length){
    const bounds = L.latLngBounds(conCoords.map(p => [p.lat, p.lng]));
    __saveNodesMap.fitBounds(bounds, { padding: [30,30], maxZoom: 13 });
  }
  setTimeout(() => __saveNodesMap.invalidateSize(), 200);

  // Los paraderos/estaciones activados desde el admin se muestran siempre en el mapa (no solo tras pedir la ubicación del usuario).

  cargarParaderosActivosEnMapa();
}

/**
 * Carga y dibuja en el mapa TODOS los paraderos/estaciones marcados como activos en el panel de administración. 
 * Se llama al iniciar el mapa y puede volver a llamarse para refrescar tras activar/desactivar puntos.
 * - Pide los datos por páginas (la API entrega máx. 500 por página), así que activar más de 500 puntos en lote 
 * ya no deja puntos fuera del mapa.
 * - Encuadra el mapa para que los puntos activados siempre queden a la vista.
 * - Muestra el resultado (o el error) bajo el mapa en vez de fallar en silencio.
 */

const MAX_PARADEROS_EN_MAPA = 2000;
const RADIO_AMPLIADO_KM = 60; // si no hay activos cerca, se busca en toda la ciudad

// Paraderos/estaciones activos ya cargados (los usa el mapa y el listado).

let PARADEROS_ACTIVOS = [];
const __paraderoMarkers = new Map(); // id -> marcador del mapa
let __paraderosMsg = "";             // mensaje para la lista de la red (cargando / error)
const __nodeMarkers = new Map();     // id de nodo -> marcador del mapa

function etiquetaParadero(p){ return p.tipo === "metro" ? "Estación de Metro" : "Paradero"; }

/** Repinta la lista de la red (chips + lista + ficha) si la página está abierta. */
function refrescarListaRed(){
  if(typeof refreshNodesPanel === "function") refreshNodesPanel();
}

/**
 * Centra el mapa en un elemento de la lista (nodo SAVE o paradero/estación) y abre su globo de información.
 */

function enfocarItemEnMapa(item, desplazarPantalla = false){
  if(!item || !__saveNodesMap || !item.lat || !item.lng) return;
  const marcador = item.esParadero ? __paraderoMarkers.get(item.paraderoId) : __nodeMarkers.get(String(item.id));
  const mapEl = document.getElementById("nodesMap");
  if(desplazarPantalla && mapEl) mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
  __saveNodesMap.setView([item.lat, item.lng], Math.max(__saveNodesMap.getZoom(), 15));
  if(marcador) marcador.openPopup();
}

async function cargarParaderosActivosEnMapa(){
  if(!__saveNodesMap || !__saveParaderosBaseLayer) return;
  const mapa = __saveNodesMap;
  const capa = __saveParaderosBaseLayer;
  const statusEl = document.getElementById("paraderosMapStatus");
  const setStatus = (txt) => { if(statusEl) statusEl.textContent = txt; };
  setStatus("Cargando paraderos y estaciones activos…");
  PARADEROS_ACTIVOS = [];
  __paraderoMarkers.clear();
  __paraderosMsg = "Cargando paraderos y estaciones activos…";
  refrescarListaRed();
  try{
    capa.clearLayers();
    const puntos = [];
    let total = 0;
    for(let page = 1; puntos.length < MAX_PARADEROS_EN_MAPA; page++){
      const res = await Api.paraderos({ pageSize: 500, page });
      total = res.total || 0;
      const filas = res.resultados || [];
      filas.forEach(p => {
        if(typeof p.lat !== "number" || typeof p.lng !== "number") return;
        const color = p.tipo === "metro" ? "#175457" : "#C1502E";
        const marcador = L.circleMarker([p.lat, p.lng], { radius: 5, color: "#fff", weight: 1.5, fillColor: color, fillOpacity: 0.9 })
          .addTo(capa)
          .bindPopup(`<b>${esc(p.nombre)}</b><br>${etiquetaParadero(p)}${p.comuna ? " · " + esc(p.comuna) : ""}`);
        __paraderoMarkers.set(p.id, marcador);
        PARADEROS_ACTIVOS.push(p);
        puntos.push([p.lat, p.lng]);
      });
      if(!filas.length || page * 500 >= total) break;
    }

    __paraderosMsg = "";
    refrescarListaRed();
    if(!puntos.length){
      setStatus("Aún no hay paraderos ni estaciones activos para mostrar en el mapa.");
      return;
    }

    // Encuadre: nodos SAVE + paraderos activos, para que ninguno quede fuera de vista.
    const todos = puntos.concat(NODES.filter(n => n.lat && n.lng).map(n => [n.lat, n.lng]));
    mapa.fitBounds(L.latLngBounds(todos), { padding: [30, 30], maxZoom: 15 });

    const nMetro = capa.getLayers().filter(l => l.options.fillColor === "#175457").length;
    const nParad = puntos.length - nMetro;
    setStatus(
      `Mostrando ${puntos.length.toLocaleString("es-CL")} punto(s) activos: ${nParad.toLocaleString("es-CL")} paradero(s) y ${nMetro.toLocaleString("es-CL")} estación(es) de Metro.` +
      (total > puntos.length ? ` (Hay ${total.toLocaleString("es-CL")} activos en total; el mapa muestra los primeros ${MAX_PARADEROS_EN_MAPA.toLocaleString("es-CL")}.)` : "")
    );

    // Los paraderos suelen estar muy juntos frente a nodos lejanos: este botón acerca el mapa directamente a ellos.

    if(statusEl){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "zoomParaderosBtn";
      btn.textContent = "Acercar a los paraderos activos";
      btn.style.cssText = "margin-left:10px; background:none; border:none; padding:0; color:var(--copper-deep); font:inherit; font-weight:600; text-decoration:underline; cursor:pointer;";
      btn.addEventListener("click", () => mapa.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 16 }));
      statusEl.appendChild(btn);
    }
  }catch(err){
    console.warn("No se pudieron cargar los paraderos activos:", err);
    __paraderosMsg = "No se pudieron cargar los paraderos y estaciones. Recarga la página para reintentar.";
    refrescarListaRed();
    setStatus("No se pudieron cargar los paraderos y estaciones: " + (err && err.message ? err.message : "error desconocido") + " Recarga la página para reintentar.");
  }
}

/**
 * Solicita la ubicación del navegador y muestra en el mapa + en una lista los paraderos y estaciones reales más cercanos, 
 * con su distancia exacta calculada por el backend (fórmula de Haversine sobre las coordenadas
 * reales del sistema RED de Santiago).
 */

async function localizarYMostrarCercanos(btnEl, listEl, radioKm = 1.2){
  if(!__saveNodesMap) return;
  const originalText = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = "Obteniendo tu ubicación…";
  listEl.innerHTML = "";

  try{
    const { lat, lng } = await obtenerUbicacion();

    __saveNearbyLayer.clearLayers();
    if(__saveUserMarker) __saveNodesMap.removeLayer(__saveUserMarker);
    __saveUserMarker = L.marker([lat, lng], { icon: crearIconoUsuario() })
      .addTo(__saveNodesMap)
      .bindPopup("Estás aquí").openPopup();

    const [paraderosRes0, nodosRes] = await Promise.all([
      Api.paraderosCercanos(lat, lng, radioKm, 15),
      Api.nodosCercanos(lat, lng, radioKm * 2).catch(() => ({ resultados: [] })),
    ]);

    // Si no hay ninguno activo dentro del radio, buscamos en toda la ciudad para
    // mostrar al menos los activos más cercanos (con su distancia real).

    let paraderosRes = paraderosRes0;
    let ampliado = false;
    if(!paraderosRes.resultados.length){
      paraderosRes = await Api.paraderosCercanos(lat, lng, RADIO_AMPLIADO_KM, 10);
      ampliado = true;
    }

    const cercanos = paraderosRes.resultados;
    cercanos.forEach(p => {
      const color = p.tipo === "metro" ? "#175457" : "#C1502E";
      L.circleMarker([p.lat, p.lng], { radius: 7, color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 })
        .addTo(__saveNearbyLayer)
        .bindPopup(`<b>${esc(p.nombre)}</b><br>${etiquetaParadero(p)} · ${p.distancia_km} km`);
    });

    if(ampliado && cercanos.length){
      __saveNodesMap.fitBounds(L.latLngBounds([[lat, lng], ...cercanos.map(p => [p.lat, p.lng])]), { padding: [40, 40], maxZoom: 15 });
    } else {
      __saveNodesMap.setView([lat, lng], 15);
    }

    const fmtDist = (km) => km < 1 ? Math.round(km*1000) + " m" : km.toFixed(2) + " km";
    if(!cercanos.length){
      listEl.innerHTML = PARADEROS_ACTIVOS.length
        ? `<p style="color:var(--ink-soft); font-size:.88rem;">Los paraderos y estaciones activos están a más de ${RADIO_AMPLIADO_KM} km de tu ubicación. Puedes verlos en el mapa y en el listado de más abajo.</p>`
        : `<p style="color:var(--ink-soft); font-size:.88rem;">Todavía no hay paraderos ni estaciones activos en el sitio. Se habilitan desde el panel de administración → Paraderos y estaciones.</p>`;
    } else {
      const aviso = ampliado
        ? `<p style="color:var(--ink-soft); font-size:.84rem; margin-bottom:10px;">No hay paraderos ni estaciones activos a menos de ${radioKm} km de ti. Los activos más cercanos son:</p>`
        : "";
      listEl.innerHTML = aviso + cercanos.map(p => `
        <div class="nearby-item">
          <div>
            <b>${esc(p.nombre)}</b><br>
            <span style="color:var(--ink-soft); font-size:.78rem;">${etiquetaParadero(p)}${p.comuna ? " · " + esc(p.comuna) : ""}</span>
          </div>
          <span class="dist">${fmtDist(p.distancia_km)}</span>
        </div>
      `).join("");
      if(nodosRes.resultados && nodosRes.resultados.length){
        listEl.innerHTML += `<div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--line); font-size:.78rem; color:var(--ink-soft);">
          ${nodosRes.resultados.length} nodo(s) SAVE dentro de ${(radioKm*2)} km.
        </div>`;
      }
    }
  }catch(err){
    listEl.innerHTML = `<p style="color:var(--alert); font-size:.88rem;">No pudimos obtener tu ubicación (${esc(err.message || "permiso denegado")}). Puedes habilitar la geolocalización en tu navegador e intentar de nuevo.</p>`;
  }finally{
    btnEl.disabled = false;
    btnEl.textContent = originalText;
  }
}

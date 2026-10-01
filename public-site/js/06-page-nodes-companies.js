let nodeFilter = "Todos";
let selectedNodeId = NODES.length ? NODES[0].id : null;
const MAX_FILAS_LISTA_RED = 300;

/* Los paraderos y estaciones de Metro que se activan en el panel de
   administración (Paraderos y estaciones) se listan junto a los nodos SAVE,
   cada uno bajo su tipo: "Paradero" o "Metro". Aquí se convierten al mismo
   formato que un nodo para poder usar la misma lista, filtros y ficha. */

function paraderosComoItems(){
  return PARADEROS_ACTIVOS.map(p => ({
    id: "p" + p.id, paraderoId: p.id, esParadero: true,
    nombre: p.nombre, tipo: p.tipo === "metro" ? "Metro" : "Paradero",
    estado: "Activo", comuna: p.comuna, direccion: p.eje,
    lat: p.lat, lng: p.lng, codigo: p.codigo, zona_paga: !!p.zona_paga,
  }));
}
function itemsDeLaRed(){ return NODES.concat(paraderosComoItems()); }
function itemsFiltradosRed(){ return itemsDeLaRed().filter(n => nodeFilter==="Todos" || n.tipo===nodeFilter); }
function itemSeleccionadoRed(){ return itemsDeLaRed().find(n => String(n.id) === String(selectedNodeId)); }

function nodeDetailHTML(n){
  if(!n) return `<div class="empty-state">Selecciona un elemento de la lista para ver su información. Si aún no hay nodos cargados, agrégalos desde el panel de administración.</div>`;
  const verMapa = (n.lat && n.lng) ? `<button type="button" class="btn btn-outline btn-sm" data-ver-mapa style="margin-top:16px;">${icon("ic-pin")} Ver en el mapa</button>` : "";
  if(n.esParadero){
    return `
    <span class="tag" style="background:${NODE_TYPE_COLOR[n.tipo]}22; color:${NODE_TYPE_COLOR[n.tipo]};">${esc(n.tipo)}</span>
    <h3 style="margin-top:14px;">${esc(n.nombre)}</h3>
    <table class="data-table" style="margin-top:10px;">
      <tr><th>Código</th><td>${esc(n.codigo || "—")}</td></tr>
      <tr><th>Dirección</th><td>${esc(n.direccion || "—")}</td></tr>
      <tr><th>Comuna</th><td>${esc(n.comuna || "—")}</td></tr>
      <tr><th>Zona paga</th><td>${n.zona_paga ? "Sí" : "No"}</td></tr>
      <tr><th>Coordenadas</th><td>${n.lat}, ${n.lng}</td></tr>
    </table>
    <p style="font-size:.88rem; color:var(--ink-soft); margin-top:14px;">Punto del registro oficial de paradas del sistema de transporte de Santiago, habilitado en la red SAVE.</p>
    ${verMapa}
  `;
  }
  return `
    ${n.imagen_url ? `<img src="${esc(n.imagen_url)}" alt="${esc(n.nombre)}" style="width:100%; max-height:220px; object-fit:cover; border-radius:12px; margin-bottom:14px;">` : ""}
    <span class="tag" style="background:${NODE_TYPE_COLOR[n.tipo]}22; color:${NODE_TYPE_COLOR[n.tipo]};">${esc(n.tipo)}</span>
    ${n.demo ? '<span class="badge demo" style="margin-left:6px;">Dato demostrativo</span>' : ''}
    <h3 style="margin-top:14px;">${esc(n.nombre)}</h3>
    <table class="data-table" style="margin-top:10px;">
      <tr><th>Dirección</th><td>${esc(n.direccion || "—")}</td></tr>
      <tr><th>Comuna</th><td>${esc(n.comuna || "—")}</td></tr>
      <tr><th>Organización</th><td>${esc(n.organizacion || "—")}</td></tr>
      <tr><th>Estado</th><td>${esc(n.estado)}</td></tr>
      <tr><th>Incorporación</th><td>${esc(n.fecha || "—")}</td></tr>
      <tr><th>Coordenadas</th><td>${n.lat ? n.lat+", "+n.lng : "Sin coordenadas asignadas"}</td></tr>
    </table>
    <p style="font-size:.88rem; color:var(--ink-soft); margin-top:14px;">${esc(n.descripcion || "")}</p>
    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
      ${(n.servicios||[]).map(s => `<span class="tag alt">${esc(s)}</span>`).join("")}
    </div>
    ${verMapa}
  `;
}

function nodeFilterRowHTML(){
  return NODE_TYPES.map(t => `<button class="filter-chip ${t===nodeFilter?'active':''}" data-node-filter="${esc(t)}">${t!=="Todos"?icon(NODE_TYPE_ICON[t]||"ic-pin"):""} ${esc(t)}</button>`).join("");
}

function nodeListHTML(){
  const filtered = itemsFiltradosRed();
  const aviso = __paraderosMsg ? `<div style="padding:8px 12px; font-size:.8rem; color:var(--ink-soft);">${esc(__paraderosMsg)}</div>` : "";
  if(!filtered.length){
    return aviso + `<div class="empty-state">Aún no hay elementos de este tipo. Se agregan desde el panel de administración.</div>`;
  }
  const filas = filtered.slice(0, MAX_FILAS_LISTA_RED).map(n => `
    <div class="node-list-item ${String(n.id)===String(selectedNodeId)?'active':''}" data-node="${esc(String(n.id))}">
      <span class="node-dot" style="background:${NODE_TYPE_COLOR[n.tipo]||'#C1502E'}"></span>
      <div>
        <div style="font-weight:600; font-size:.88rem;">${esc(n.nombre)}</div>
        <div style="font-size:.76rem; color:var(--ink-soft);">${esc(n.tipo)} · ${esc(n.estado)}${n.esParadero && n.comuna ? " · " + esc(n.comuna) : ""}</div>
      </div>
    </div>`).join("");
  const nota = filtered.length > MAX_FILAS_LISTA_RED
    ? `<div style="padding:10px 12px; font-size:.78rem; color:var(--ink-soft);">Mostrando ${MAX_FILAS_LISTA_RED} de ${filtered.length.toLocaleString("es-CL")}. Elige un tipo arriba para acotar la lista.</div>` : "";
  return aviso + filas + nota;
}

/** Repinta botones, lista y ficha sin recargar el mapa, se llama al cambiar de
    filtro y cuando terminan de cargar los paraderos/estaciones activos. */

function refreshNodesPanel(){
  const fila = document.getElementById("nodeFilterRow");
  const lista = document.getElementById("nodeListPanel");
  const ficha = document.getElementById("nodeDetailPanel");
  if(!fila || !lista || !ficha) return; // la página de la red de nodos no está abierta
  const visibles = itemsFiltradosRed();
  if(!visibles.find(n => String(n.id) === String(selectedNodeId))){
    selectedNodeId = visibles.length ? visibles[0].id : null;
  }
  fila.innerHTML = nodeFilterRowHTML();
  lista.innerHTML = nodeListHTML();
  ficha.innerHTML = nodeDetailHTML(itemSeleccionadoRed());
}

function renderNodesPage(){
  const selected = itemSeleccionadoRed();
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Red de nodos</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">La red de alerta SAVE</h1>
      <p class="lede">Paraderos, estaciones de Metro, empresas e instituciones, cada uno con un nodo de alerta. Este mapa de coordenadas, estaciones y paraderos reales, para orientación de sus futuras habilitaciones.</p>
      <p class="lede" style="margin-top:10px; font-weight:600; color:var(--copper-deep);">Ya estamos organizados.</p>
    </div>
  </section>

  <section style="padding-top:24px;">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Busca a tu alrededor</div>
        <h2>¿Qué tan cerca estás de un paradero o estación?</h2>
        <p style="color:var(--ink-soft);">Comparte tu ubicación para ver, con distancia real, los paraderos y estaciones de Metro más cercanos a ti.</p>
      </div>
      <div class="node-layout">
        <div class="map-wrap">
          <div id="nodesMap" class="leaflet-map"></div>
          <div id="paraderosMapStatus" style="font-size:.8rem; color:var(--ink-soft); margin-top:10px;" aria-live="polite"></div>
        </div>
        <div>
          <button class="map-locate-btn" id="locateBtn">${icon("ic-pin")} Usar mi ubicación</button>
          <div id="nearbyList" class="nearby-list"></div>
        </div>
      </div>
    </div>
  </section>

  <section style="padding-top:8px;">
    <div class="container">
      <div class="filter-row" id="nodeFilterRow">${nodeFilterRowHTML()}</div>
      <div class="node-layout">
        <div>
          <div class="node-detail" id="nodeDetailPanel">${nodeDetailHTML(selected)}</div>
        </div>
        <div>
          <div style="max-height:420px; overflow-y:auto;" id="nodeListPanel">${nodeListHTML()}</div>
        </div>
      </div>
    </div>
  </section>
  `;
}
defineRoute("red-nodos", renderNodesPage);

function initNodesPage(){
  initNodesMap();

  $("#locateBtn").addEventListener("click", () => {
    localizarYMostrarCercanos($("#locateBtn"), $("#nearbyList"), 1.5);
  });

  // Botones de tipo (Todos, Nodo LED, Paradero, Metro…)
  $("#nodeFilterRow").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-node-filter]");
    if(!btn) return;
    nodeFilter = btn.dataset.nodeFilter;
    refreshNodesPanel();
  });

  // Elegir un elemento de la lista: se muestra su ficha y el mapa se centra en él.
  $("#nodeListPanel").addEventListener("click", (e) => {
    const el = e.target.closest("[data-node]");
    if(!el) return;
    selectedNodeId = el.dataset.node;
    $$("#nodeListPanel .node-list-item").forEach(x => x.classList.toggle("active", x === el));
    const item = itemSeleccionadoRed();
    $("#nodeDetailPanel").innerHTML = nodeDetailHTML(item);
    enfocarItemEnMapa(item);
  });

  // Botón "Ver en el mapa" de la ficha
  $("#nodeDetailPanel").addEventListener("click", (e) => {
    if(e.target.closest("[data-ver-mapa]")) enfocarItemEnMapa(itemSeleccionadoRed(), true);
  });
}

/* Empresas afiliadas + Apoyo institucional / convenios */

let companyFilter = "Todas";

function companyFullCardHTML(c){
  return `<div class="card card-boxed ${c.demo?"secondary":""}">
    ${c.logo_url
      ? `<div class="company-logo"><img src="${esc(c.logo_url)}" alt="${esc(c.nombre)}"></div>`
      : `<div class="card-icon" style="background:${c.demo?"var(--sand-2)":"var(--copper)"}; color:${c.demo?"var(--ink-soft)":"#fff"};">${icon("ic-building")}</div>`}
    ${c.demo ? '<span class="badge demo" style="margin-bottom:10px;">Plantilla — a la espera de datos reales</span>' : ''}
    <h3>${esc(c.nombre)}</h3>
    <p style="color:var(--ink-soft); font-size:.87rem;">${esc(c.descripcion || "")}</p>
    <table class="data-table" style="margin-top:10px; font-size:.8rem;">
      <tr><th>Categoría</th><td>${esc(c.categoria || "—")}</td></tr>
      <tr><th>Ubicación</th><td>${esc(c.ubicacion || "—")}</td></tr>
      <tr><th>Nodos</th><td>${esc(c.nodos || "—")}</td></tr>
      <tr><th>Afiliación</th><td>${esc(c.fecha || "—")}</td></tr>
    </table>
    ${c.sitio_web ? `<a href="${esc(c.sitio_web)}" target="_blank" rel="noopener" class="tag alt" style="margin-top:10px; display:inline-block;">Sitio web →</a>` : ""}
  </div>`;
}

function convenioCardHTML(c){
  return `<div class="card card-boxed" style="border-color:var(--copper);">
    ${c.logo_url
      ? `<div class="company-logo"><img src="${esc(c.logo_url)}" alt="${esc(c.nombre)}"></div>`
      : `<div class="card-icon" style="background:var(--copper); color:#fff;">${icon("ic-shield")||icon("ic-building")}</div>`}
    <span class="tag" style="background:var(--copper)22; color:var(--copper-deep); margin-bottom:8px;">Apoyo institucional</span>
    <h3>${esc(c.nombre)}</h3>
    <p style="color:var(--ink-soft); font-size:.87rem;">${esc(c.descripcion || "")}</p>
    ${c.fecha ? `<p style="font-size:.78rem; color:var(--ink-soft); margin-top:8px;">Convenio desde ${esc(c.fecha)}</p>` : ""}
    ${c.sitio_web ? `<a href="${esc(c.sitio_web)}" target="_blank" rel="noopener" class="tag alt" style="margin-top:10px; display:inline-block;">Sitio web →</a>` : ""}
  </div>`;
}

function renderCompaniesPage(){
  const implementadoras = COMPANIES.filter(c => (c.tipo_relacion || "implementadora") === "implementadora");
  const convenios = COMPANIES.filter(c => c.tipo_relacion === "convenio");
  const filtered = implementadoras.filter(c => companyFilter==="Todas" || c.categoria===companyFilter);
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Empresas afiliadas</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">Organizaciones que suman su espacio</h1>
      <p class="lede">Estas tarjetas se administran desde el panel de administración de SAVE y muestran cómo se presenta cada organización afiliada a la red.</p>
    </div>
  </section>

  ${convenios.length ? `
  <section style="padding-top:24px; padding-bottom:8px;">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Apoyo institucional</div>
        <h2>Quiénes financian y respaldan el desarrollo de SAVE</h2>
        <p style="color:var(--ink-soft);">Instituciones y organizaciones con las que SAVE ha formado convenios de apoyo para el desarrollo del proyecto, más allá de las empresas que instalan nodos.</p>
      </div>
      <div class="grid grid-4">
        ${convenios.map(convenioCardHTML).join("")}
      </div>
    </div>
  </section>` : ""}

  <section style="padding-top:24px;">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Red de implementación</div>
        <h2>Espacios donde ya opera o se instalará un nodo SAVE</h2>
      </div>
      <div class="filter-row">
        ${COMPANY_CATEGORIES.map(t => `<button class="filter-chip ${t===companyFilter?'active':''}" data-company-filter="${esc(t)}">${esc(t)}</button>`).join("")}
      </div>
      <div class="grid grid-4" id="companyGrid">
        ${filtered.length ? filtered.map(companyFullCardHTML).join("") : `<div class="empty-state">No hay empresas en esta categoría todavía.</div>`}
      </div>
      <div class="card" style="margin-top:36px; text-align:center; background:var(--copper); color:#fff; border:none;">
        <h3 style="color:#fff;">¿Quieres incorporar SAVE a tu organización?</h3>
        <p style="color:rgba(255,255,255,.85); max-width:52ch; margin:0 auto 20px;">Súmate a la red de alerta y ayuda a que tu espacio esté preparado para reconocer una emergencia médica a tiempo.</p>
        <a href="#/solicitar" data-link class="btn" style="background:#fff; color:var(--copper-deep);">Solicitar el servicio</a>
      </div>
    </div>
  </section>
  `;
}
defineRoute("empresas", renderCompaniesPage);

function initCompaniesPage(){
  $$("[data-company-filter]").forEach(btn => btn.addEventListener("click", () => {
    companyFilter = btn.dataset.companyFilter;
    $("#view").innerHTML = renderCompaniesPage();
    initCompaniesPage();
  }));
}

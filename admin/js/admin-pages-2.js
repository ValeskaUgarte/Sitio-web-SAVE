/* NODOS SAVE */

const NODE_TYPES_ADMIN = ["Nodo LED","Paradero","Metro","Empresa","Institución","Espacio público","Otro"];
const CATEGORIAS_INSTALACION = [
  { value: "publico", label: "Espacio público (automática / masiva)" },
  { value: "hogar", label: "Hogar (manual)" },
  { value: "empresa", label: "Empresa (manual)" },
  { value: "comunidad", label: "Comunidad / junta de vecinos (manual)" },
];

async function pageNodos(){
  const { resultados } = await Api.nodos();
  const activos = resultados.filter(n => n.activo).length;
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Nodos SAVE</h1><p>Nodos de alerta (paneles LED) instalados o planificados en la red. ${activos} de ${resultados.length} visibles en el sitio.</p></div>
      <button class="btn btn-primary" id="newNodoBtn">+ Nuevo nodo</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Visible</th><th>Nombre</th><th>Tipo</th><th>Instalación</th><th>Comuna</th><th>Código</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(n => `<tr>
          <td><label class="switch"><input type="checkbox" data-toggle-nodo="${n.id}" ${n.activo?"checked":""}><span class="switch-track"></span></label></td>
          <td style="display:flex; align-items:center; gap:8px;">
            ${n.imagen_url ? `<img class="img-preview" src="${esc(n.imagen_url)}" style="width:36px; height:36px;">` : ""}
            <b>${esc(n.nombre)}</b>${n.demo?' <span class="badge neutral">Demo</span>':''}
          </td>
          <td>${esc(n.tipo)}</td>
          <td>${esc(CATEGORIA_INSTALACION_LABEL_ADMIN[n.categoria_instalacion] || n.categoria_instalacion || "—")}</td>
          <td>${esc(n.comuna||"—")}</td>
          <td class="mono" style="font-size:.72rem;">${esc(n.codigo_trazabilidad||"—")}</td>
          <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit-nodo="${n.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del-nodo="${n.id}">Eliminar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="7">Sin nodos registrados.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $("#newNodoBtn").addEventListener("click", () => openNodoModal(null));
  $$("[data-edit-nodo]").forEach(b => b.addEventListener("click", () => openNodoModal(resultados.find(n => n.id == b.dataset.editNodo))));
  $$("[data-del-nodo]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar este nodo?")) return;
    await Api.eliminarNodo(b.dataset.delNodo); toast("Nodo eliminado."); pageNodos();
  }));
  $$("[data-toggle-nodo]").forEach(cb => cb.addEventListener("change", async () => {
    try{
      await Api.activarNodo(cb.dataset.toggleNodo, cb.checked);
      toast(cb.checked ? "Nodo ahora visible en el sitio." : "Nodo oculto del sitio.");
    }catch(e){ cb.checked = !cb.checked; toast(e.message, true); }
  }));
}
defineAdminRoute("nodos", pageNodos);
const CATEGORIA_INSTALACION_LABEL_ADMIN = { publico:"Espacio público", hogar:"Hogar", empresa:"Empresa", comunidad:"Comunidad" };

function openNodoModal(n){
  const isNew = !n;
  n = n || { nombre:"", tipo:"Nodo LED", categoria_instalacion:"publico", direccion:"", comuna:"", region:"Región Metropolitana", lat:"", lng:"", organizacion:"", estado:"Planificado", activo:false, fecha:"", descripcion:"", servicios:[], imagen_url:"" };
  const overlay = openModal(`
    <h2>${isNew ? "Nuevo nodo" : "Editar nodo"}</h2>
    ${!isNew && n.codigo_trazabilidad ? `<p style="font-size:.78rem; color:var(--ink-soft);">Código de trazabilidad (para la futura app móvil / monitoreo): <b class="mono">${esc(n.codigo_trazabilidad)}</b></p>` : ""}
    <div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="fNombre" value="${esc(n.nombre)}"></div>
      <div class="field"><label>Tipo</label><select id="fTipo">${NODE_TYPES_ADMIN.map(t => `<option ${t===n.tipo?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="field"><label>Categoría de instalación</label><select id="fCategoriaInst">${CATEGORIAS_INSTALACION.map(c => `<option value="${c.value}" ${c.value===n.categoria_instalacion?"selected":""}>${c.label}</option>`).join("")}</select></div>
      <div class="field"><label>Estado</label><select id="fEstado">${["Planificado","Instalado","Activo","Inactivo"].map(t => `<option ${t===n.estado?"selected":""}>${t}</option>`).join("")}</select></div>
      <div class="field"><label><input type="checkbox" id="fActivo" ${n.activo?"checked":""} style="width:auto; margin-right:6px;">Visible en el sitio</label></div>
      <div class="field full"><label>Dirección</label><input id="fDireccion" value="${esc(n.direccion||"")}" placeholder="Ej: Av. Providencia 1234, depto 5B"></div>
      <div class="field"><label>Comuna</label><input id="fComuna" value="${esc(n.comuna||"")}"></div>
      <div class="field"><label>Región</label><input id="fRegion" value="${esc(n.region||"Región Metropolitana")}"></div>
      <div class="field full" style="display:flex; align-items:flex-end; gap:10px;">
        <button type="button" class="btn btn-outline btn-sm" id="geocodBtn">📍 Buscar coordenadas desde la dirección</button>
        <span id="geocodStatus" style="font-size:.78rem; color:var(--ink-soft);"></span>
      </div>
      <div class="field"><label>Latitud</label><input id="fLat" type="number" step="any" value="${n.lat ?? ""}"></div>
      <div class="field"><label>Longitud</label><input id="fLng" type="number" step="any" value="${n.lng ?? ""}"></div>
      <div class="field"><label>Organización</label><input id="fOrganizacion" value="${esc(n.organizacion||"")}"></div>
      <div class="field full"><label>Descripción</label><textarea id="fDescripcion">${esc(n.descripcion||"")}</textarea></div>
      <div class="field full"><label>Servicios (separados por coma)</label><input id="fServicios" value="${esc((n.servicios||[]).join(", "))}" placeholder="Panel LED, Alerta sonora, Instrucciones básicas al entorno"></div>
      <div class="field full">
        <label>Foto del nodo instalado</label>
        <div class="upload-row">
          <img class="img-preview" id="nodoImgPreview" src="${n.imagen_url||''}" style="display:${n.imagen_url?'block':'none'};">
          <input type="file" id="nodoImgFile" accept="image/*">
          <input type="hidden" id="fImagenUrl" value="${esc(n.imagen_url||'')}">
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveNodo">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#geocodBtn", overlay).addEventListener("click", async () => {
    const direccion = $("#fDireccion", overlay).value.trim();
    const comuna = $("#fComuna", overlay).value.trim();
    const region = $("#fRegion", overlay).value.trim();
    const statusEl = $("#geocodStatus", overlay);
    if(!direccion){ statusEl.textContent = "Escribe primero una dirección."; statusEl.style.color = "var(--alert)"; return; }
    statusEl.textContent = "Buscando…"; statusEl.style.color = "var(--ink-soft)";
    try{
      const res = await Api.geocodificarNodo({ direccion, comuna, region });
      if(res.encontrado){
        $("#fLat", overlay).value = res.lat;
        $("#fLng", overlay).value = res.lng;
        statusEl.textContent = "Encontrado: " + res.direccion_normalizada;
        statusEl.style.color = "var(--ok)";
      } else {
        statusEl.textContent = res.mensaje || "No se encontró. Ingresa las coordenadas manualmente.";
        statusEl.style.color = "var(--alert)";
      }
    }catch(e){
      statusEl.textContent = e.message || "Error al buscar la dirección.";
      statusEl.style.color = "var(--alert)";
    }
  });
  $("#nodoImgFile", overlay).addEventListener("change", () => handleImageUpload($("#nodoImgFile",overlay), $("#nodoImgPreview",overlay), $("#fImagenUrl",overlay)));
  $("#saveNodo", overlay).addEventListener("click", async () => {
    const data = {
      nombre: $("#fNombre",overlay).value.trim(), tipo: $("#fTipo",overlay).value,
      categoria_instalacion: $("#fCategoriaInst",overlay).value,
      direccion: $("#fDireccion",overlay).value, comuna: $("#fComuna",overlay).value,
      organizacion: $("#fOrganizacion",overlay).value, estado: $("#fEstado",overlay).value,
      activo: $("#fActivo",overlay).checked,
      lat: $("#fLat",overlay).value ? parseFloat($("#fLat",overlay).value) : null,
      lng: $("#fLng",overlay).value ? parseFloat($("#fLng",overlay).value) : null,
      descripcion: $("#fDescripcion",overlay).value,
      servicios: $("#fServicios",overlay).value.split(",").map(s=>s.trim()).filter(Boolean),
      imagen_url: $("#fImagenUrl",overlay).value,
    };
    if(!data.nombre){ toast("El nombre es obligatorio.", true); return; }
    try{
      if(isNew) await Api.crearNodo(data); else await Api.actualizarNodo(n.id, data);
      toast(isNew ? "Nodo creado." : "Nodo actualizado."); closeModal(); pageNodos();
    }catch(e){ toast(e.message, true); }
  });
}

/* PARADEROS Y ESTACIONES */

let paraderosState = { page: 1, q: "", comuna: "", tipo: "paradero", activo: "", seleccionados: new Set() };

async function pageParaderos(){
  const [comunasRes, resumenRes] = await Promise.all([Api.comunas(), Api.paraderosResumen()]);
  await renderParaderosTable();

  async function renderParaderosTable(){
    const params = { page: paraderosState.page, pageSize: 30, q: paraderosState.q, comuna: paraderosState.comuna, tipo: paraderosState.tipo };
    if(paraderosState.activo !== "") params.activo = paraderosState.activo;
    const { total, resultados, pageSize } = await Api.paraderosAdmin(params);
    const tipoInfo = resumenRes.porTipo.find(t => t.tipo === paraderosState.tipo) || { n: 0, activos: 0 };

    $("#mainArea").innerHTML = `
      <div class="page-head"><div><h1>Paraderos y estaciones</h1><p>${resumenRes.total.toLocaleString("es-CL")} puntos del registro oficial · ${resumenRes.activos.toLocaleString("es-CL")} visibles en el sitio.</p></div>
        <button class="btn btn-primary" id="newParadBtn">+ Agregar punto manual</button></div>

      <div class="tabs">
        <button class="tab-btn ${paraderosState.tipo==='paradero'?'active':''}" data-tab-tipo="paradero">🚌 Paraderos de buses (${resumenRes.porTipo.find(t=>t.tipo==='paradero')?.n.toLocaleString('es-CL')||0})</button>
        <button class="tab-btn ${paraderosState.tipo==='metro'?'active':''}" data-tab-tipo="metro">🚇 Estaciones de Metro (${resumenRes.porTipo.find(t=>t.tipo==='metro')?.n.toLocaleString('es-CL')||0})</button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; align-items:center;">
        <input id="paraderoSearch" placeholder="Buscar por nombre o código…" style="max-width:260px;" value="${esc(paraderosState.q)}">
        <select id="paraderoComuna" style="max-width:200px;">
          <option value="">Todas las comunas</option>
          ${comunasRes.comunas.map(c => `<option ${c===paraderosState.comuna?"selected":""}>${esc(c)}</option>`).join("")}
        </select>
        <select id="paraderoActivo" style="max-width:180px;">
          <option value="" ${paraderosState.activo===""?"selected":""}>Todos los estados</option>
          <option value="1" ${paraderosState.activo==="1"?"selected":""}>Solo visibles</option>
          <option value="0" ${paraderosState.activo==="0"?"selected":""}>Solo no visibles</option>
        </select>
        <span style="font-size:.78rem; color:var(--ink-soft); margin-left:auto;">${tipoInfo.n} en esta categoría, ${tipoInfo.activos||0} visibles</span>
      </div>

      <div id="bulkBar" style="display:none; align-items:center; gap:10px; margin-bottom:12px; background:var(--sand-2); padding:10px 14px; border-radius:10px;">
        <span id="bulkCount" style="font-size:.82rem; font-weight:600;"></span>
        <button class="btn btn-primary btn-sm" id="bulkActivar">Marcar visibles</button>
        <button class="btn btn-outline btn-sm" id="bulkDesactivar">Marcar no visibles</button>
        <button class="btn btn-ghost btn-sm" id="bulkClear">Deseleccionar</button>
      </div>

      <div class="table-card"><table>
        <thead><tr><th><input type="checkbox" id="selectAllParad"></th><th>Visible</th><th>Código</th><th>Nombre</th><th>Comuna</th><th>Coordenadas</th><th></th></tr></thead>
        <tbody>
          ${resultados.map(p => `<tr>
            <td><input type="checkbox" class="parad-check" value="${p.id}" ${paraderosState.seleccionados.has(p.id)?"checked":""}></td>
            <td><label class="switch"><input type="checkbox" data-toggle-parad="${p.id}" ${p.activo?"checked":""}><span class="switch-track"></span></label></td>
            <td class="mono">${esc(p.codigo)}</td><td>${esc(p.nombre)}</td><td>${esc(p.comuna||"—")}</td>
            <td style="font-size:.78rem;">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</td>
            <td><button class="btn btn-danger btn-sm" data-del-parad="${p.id}">Eliminar</button></td>
          </tr>`).join("") || `<tr class="empty-row"><td colspan="7">Sin resultados.</td></tr>`}
        </tbody>
      </table></div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
        <span style="font-size:.8rem; color:var(--ink-soft);">Página ${paraderosState.page} de ${Math.max(1, Math.ceil(total/pageSize))} (${total.toLocaleString("es-CL")} resultados con este filtro)</span>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" id="paradPrev" ${paraderosState.page<=1?"disabled":""}>← Anterior</button>
          <button class="btn btn-outline btn-sm" id="paradNext" ${paraderosState.page*pageSize>=total?"disabled":""}>Siguiente →</button>
        </div>
      </div>
    `;

    $$("[data-tab-tipo]").forEach(b => b.addEventListener("click", () => {
      paraderosState.tipo = b.dataset.tabTipo; paraderosState.page = 1; paraderosState.seleccionados.clear();
      renderParaderosTable();
    }));
    $("#newParadBtn").addEventListener("click", () => openParaderoModal(null, renderParaderosTable));
    $("#paraderoSearch").addEventListener("change", (e) => { paraderosState.q = e.target.value; paraderosState.page = 1; renderParaderosTable(); });
    $("#paraderoComuna").addEventListener("change", (e) => { paraderosState.comuna = e.target.value; paraderosState.page = 1; renderParaderosTable(); });
    $("#paraderoActivo").addEventListener("change", (e) => { paraderosState.activo = e.target.value; paraderosState.page = 1; renderParaderosTable(); });
    $("#paradPrev")?.addEventListener("click", () => { paraderosState.page--; renderParaderosTable(); });
    $("#paradNext")?.addEventListener("click", () => { paraderosState.page++; renderParaderosTable(); });

    $$("[data-del-parad]").forEach(b => b.addEventListener("click", async () => {
      if(!confirm("¿Eliminar este paradero de la base de datos?")) return;
      await Api.eliminarParadero(b.dataset.delParad); toast("Eliminado."); renderParaderosTable();
    }));

    $$("[data-toggle-parad]").forEach(cb => cb.addEventListener("change", async () => {
      try{
        await Api.activarParadero(cb.dataset.toggleParad, cb.checked);
        toast(cb.checked ? "Ahora visible en el sitio." : "Ocultado del sitio.");
      }catch(e){ cb.checked = !cb.checked; toast(e.message, true); }
    }));

    // Selección para activación en lote

    function updateBulkBar(){
      const bar = $("#bulkBar"); const n = paraderosState.seleccionados.size;
      bar.style.display = n ? "flex" : "none";
      if(n) $("#bulkCount").textContent = `${n} seleccionado(s)`;
    }
    $$(".parad-check").forEach(cb => cb.addEventListener("change", () => {
      const id = parseInt(cb.value, 10);
      if(cb.checked) paraderosState.seleccionados.add(id); else paraderosState.seleccionados.delete(id);
      updateBulkBar();
    }));
    $("#selectAllParad").addEventListener("change", (e) => {
      $$(".parad-check").forEach(cb => {
        cb.checked = e.target.checked;
        const id = parseInt(cb.value, 10);
        if(e.target.checked) paraderosState.seleccionados.add(id); else paraderosState.seleccionados.delete(id);
      });
      updateBulkBar();
    });
    $("#bulkClear")?.addEventListener("click", () => { paraderosState.seleccionados.clear(); renderParaderosTable(); });
    $("#bulkActivar")?.addEventListener("click", async () => {
      await Api.activarLoteParaderos([...paraderosState.seleccionados], true);
      toast("Puntos marcados como visibles."); paraderosState.seleccionados.clear(); renderParaderosTable();
    });
    $("#bulkDesactivar")?.addEventListener("click", async () => {
      await Api.activarLoteParaderos([...paraderosState.seleccionados], false);
      toast("Puntos ocultados del sitio."); paraderosState.seleccionados.clear(); renderParaderosTable();
    });
    updateBulkBar();
  }
}
defineAdminRoute("paraderos", pageParaderos);

function openParaderoModal(p, onSaved){
  const isNew = !p;
  p = p || { codigo:"", nombre:"", comuna:"", eje:"", lat:"", lng:"", tipo: paraderosState.tipo || "paradero", activo:true };
  const overlay = openModal(`
    <h2>${isNew ? "Agregar punto manual" : "Editar punto"}</h2>
    <p style="font-size:.8rem; color:var(--ink-soft);">Usa esto para puntos nuevos del Ministerio de Transportes que aún no estén en el registro cargado.</p>
    <div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="fNombre" value="${esc(p.nombre)}"></div>
      <div class="field"><label>Código (opcional, se genera uno si lo dejas vacío)</label><input id="fCodigo" value="${esc(p.codigo||"")}"></div>
      <div class="field"><label>Tipo</label><select id="fTipo"><option value="paradero" ${p.tipo==='paradero'?'selected':''}>Paradero de bus</option><option value="metro" ${p.tipo==='metro'?'selected':''}>Estación de Metro</option></select></div>
      <div class="field"><label>Comuna</label><input id="fComuna" value="${esc(p.comuna||"")}"></div>
      <div class="field full"><label>Eje / calle</label><input id="fEje" value="${esc(p.eje||"")}"></div>
      <div class="field"><label>Latitud *</label><input id="fLat" type="number" step="any" value="${p.lat ?? ""}"></div>
      <div class="field"><label>Longitud *</label><input id="fLng" type="number" step="any" value="${p.lng ?? ""}"></div>
      <div class="field"><label><input type="checkbox" id="fActivo" ${p.activo?"checked":""} style="width:auto; margin-right:6px;">Visible en el sitio</label></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveParad">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#saveParad", overlay).addEventListener("click", async () => {
    const data = {
      nombre: $("#fNombre",overlay).value.trim(), codigo: $("#fCodigo",overlay).value.trim(),
      tipo: $("#fTipo",overlay).value, comuna: $("#fComuna",overlay).value, eje: $("#fEje",overlay).value,
      lat: $("#fLat",overlay).value ? parseFloat($("#fLat",overlay).value) : undefined,
      lng: $("#fLng",overlay).value ? parseFloat($("#fLng",overlay).value) : undefined,
      activo: $("#fActivo",overlay).checked,
    };
    if(!data.nombre || data.lat === undefined || data.lng === undefined){ toast("Nombre, latitud y longitud son obligatorios.", true); return; }
    try{
      if(isNew) await Api.crearParadero(data); else await Api.actualizarParadero(p.id, data);
      toast(isNew ? "Punto creado." : "Punto actualizado."); closeModal(); onSaved && onSaved();
    }catch(e){ toast(e.message, true); }
  });
}

/* EMPRESAS */

async function pageEmpresas(){
  const { resultados } = await Api.empresas();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Empresas afiliadas</h1><p>Organizaciones que se muestran en la página pública de empresas.</p></div>
      <button class="btn btn-primary" id="newEmpBtn">+ Nueva empresa</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Nombre</th><th>Tipo</th><th>Categoría</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(e => `<tr>
          <td><b>${esc(e.nombre)}</b>${e.demo?' <span class="badge neutral">Plantilla</span>':''}</td>
          <td>${e.tipo_relacion==='convenio' ? '<span class="badge" style="background:var(--copper); color:#fff;">Convenio</span>' : 'Implementadora'}</td>
          <td>${esc(e.categoria||"—")}</td><td>${esc(e.estado)}</td>
          <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit-emp="${e.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del-emp="${e.id}">Eliminar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="5">Sin empresas registradas.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $("#newEmpBtn").addEventListener("click", () => openEmpresaModal(null));
  $$("[data-edit-emp]").forEach(b => b.addEventListener("click", () => openEmpresaModal(resultados.find(e => e.id == b.dataset.editEmp))));
  $$("[data-del-emp]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar esta empresa?")) return;
    await Api.eliminarEmpresa(b.dataset.delEmp); toast("Empresa eliminada."); pageEmpresas();
  }));
}
defineAdminRoute("empresas", pageEmpresas);

function openEmpresaModal(e){
  const isNew = !e;
  e = e || { nombre:"", categoria:"Transporte", descripcion:"", ubicacion:"", nodos:"", fecha:"", estado:"Activa", logo_url:"", sitio_web:"", tipo_relacion:"implementadora" };
  const overlay = openModal(`
    <h2>${isNew ? "Nueva empresa" : "Editar empresa"}</h2>
    <div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="fNombre" value="${esc(e.nombre)}"></div>
      <div class="field">
        <label>Tipo de relación *</label>
        <select id="fTipoRelacion">
          <option value="implementadora" ${e.tipo_relacion!=='convenio'?"selected":""}>Implementadora (instala nodos en sus espacios)</option>
          <option value="convenio" ${e.tipo_relacion==='convenio'?"selected":""}>Convenio / apoyo institucional (financia o respalda el proyecto)</option>
        </select>
      </div>
      <div class="field"><label>Categoría</label><input id="fCategoria" value="${esc(e.categoria||"")}" list="empCategorias"><datalist id="empCategorias">${["Transporte","Salud","Educación","Oficinas y empresas","Educación superior"].map(c=>`<option value="${c}">`).join("")}</datalist></div>
      <div class="field"><label>Estado</label><select id="fEstado">${["Activa","Plantilla","Pausada"].map(c=>`<option ${c===e.estado?"selected":""}>${c}</option>`).join("")}</select></div>
      <div class="field"><label>Ubicación</label><input id="fUbicacion" value="${esc(e.ubicacion||"")}"></div>
      <div class="field"><label>Nodos asociados</label><input id="fNodos" value="${esc(e.nodos||"")}"></div>
      <div class="field"><label>Fecha de afiliación / convenio</label><input id="fFecha" value="${esc(e.fecha||"")}"></div>
      <div class="field"><label>Sitio web</label><input id="fSitio" value="${esc(e.sitio_web||"")}"></div>
      <div class="field full"><label>Descripción</label><textarea id="fDescripcion">${esc(e.descripcion||"")}</textarea></div>
      <div class="field full">
        <label>Logo</label>
        <div class="upload-row">
          <img class="img-preview" id="logoPreview" src="${e.logo_url||''}" style="display:${e.logo_url?'block':'none'};">
          <input type="file" id="logoFile" accept="image/*">
          <input type="hidden" id="fLogoUrl" value="${esc(e.logo_url||'')}">
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveEmp">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#logoFile", overlay).addEventListener("change", () => handleImageUpload($("#logoFile",overlay), $("#logoPreview",overlay), $("#fLogoUrl",overlay)));
  $("#saveEmp", overlay).addEventListener("click", async () => {
    const data = {
      nombre: $("#fNombre",overlay).value.trim(), categoria: $("#fCategoria",overlay).value,
      tipo_relacion: $("#fTipoRelacion",overlay).value,
      estado: $("#fEstado",overlay).value, ubicacion: $("#fUbicacion",overlay).value,
      nodos: $("#fNodos",overlay).value, fecha: $("#fFecha",overlay).value,
      sitio_web: $("#fSitio",overlay).value, descripcion: $("#fDescripcion",overlay).value,
      logo_url: $("#fLogoUrl",overlay).value, demo: false,
    };
    if(!data.nombre){ toast("El nombre es obligatorio.", true); return; }
    try{
      if(isNew) await Api.crearEmpresa(data); else await Api.actualizarEmpresa(e.id, data);
      toast(isNew ? "Empresa creada." : "Empresa actualizada."); closeModal(); pageEmpresas();
    }catch(err){ toast(err.message, true); }
  });
}

/* NOTICIAS */

async function pageNoticias(){
  const { resultados } = await Api.noticias();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Noticias</h1><p>Actualizaciones del proyecto visibles en el sitio.</p></div>
      <button class="btn btn-primary" id="newNoticiaBtn">+ Nueva noticia</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Título</th><th>Categoría</th><th>Publicada</th><th>Destacada</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(n => `<tr>
          <td><b>${esc(n.titulo)}</b></td><td>${esc(n.categoria||"—")}</td>
          <td><span class="badge ${n.publicado?'ok':'neutral'}">${n.publicado?'Sí':'Borrador'}</span></td>
          <td>${n.destacado?'★':'—'}</td>
          <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit-not="${n.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del-not="${n.id}">Eliminar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="5">Sin noticias todavía.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $("#newNoticiaBtn").addEventListener("click", () => openNoticiaModal(null));
  $$("[data-edit-not]").forEach(b => b.addEventListener("click", () => openNoticiaModal(resultados.find(n => n.id == b.dataset.editNot))));
  $$("[data-del-not]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar esta noticia?")) return;
    await Api.eliminarNoticia(b.dataset.delNot); toast("Noticia eliminada."); pageNoticias();
  }));
}
defineAdminRoute("noticias", pageNoticias);

function openNoticiaModal(n){
  const isNew = !n;
  n = n || { titulo:"", fecha:new Date().toISOString().slice(0,10), autor:"Equipo SAVE", categoria:"Actualización", resumen:"", contenido:"", imagen_url:"", tags:[], publicado:true, destacado:false };
  const overlay = openModal(`
    <h2>${isNew ? "Nueva noticia" : "Editar noticia"}</h2>
    <div class="form-grid">
      <div class="field full"><label>Título *</label><input id="fTitulo" value="${esc(n.titulo)}"></div>
      <div class="field"><label>Fecha</label><input id="fFecha" value="${esc(n.fecha||"")}"></div>
      <div class="field"><label>Autor</label><input id="fAutor" value="${esc(n.autor||"")}"></div>
      <div class="field"><label>Categoría</label><input id="fCategoria" value="${esc(n.categoria||"")}"></div>
      <div class="field"><label>Tags (separados por coma)</label><input id="fTags" value="${esc((n.tags||[]).join(", "))}"></div>
      <div class="field full"><label>Resumen</label><textarea id="fResumen">${esc(n.resumen||"")}</textarea></div>
      <div class="field full"><label>Contenido</label><textarea id="fContenido" style="min-height:140px;">${esc(n.contenido||"")}</textarea></div>
      <div class="field full">
        <label>Imagen</label>
        <div class="upload-row">
          <img class="img-preview" id="notImgPreview" src="${n.imagen_url||''}" style="display:${n.imagen_url?'block':'none'};">
          <input type="file" id="notImgFile" accept="image/*">
          <input type="hidden" id="fImagenUrl" value="${esc(n.imagen_url||'')}">
        </div>
      </div>
      <div class="field"><label><input type="checkbox" id="fPublicado" ${n.publicado?"checked":""} style="width:auto; margin-right:6px;">Publicada</label></div>
      <div class="field"><label><input type="checkbox" id="fDestacado" ${n.destacado?"checked":""} style="width:auto; margin-right:6px;">Destacada</label></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveNot">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#notImgFile", overlay).addEventListener("change", () => handleImageUpload($("#notImgFile",overlay), $("#notImgPreview",overlay), $("#fImagenUrl",overlay)));
  $("#saveNot", overlay).addEventListener("click", async () => {
    const data = {
      titulo: $("#fTitulo",overlay).value.trim(), fecha: $("#fFecha",overlay).value, autor: $("#fAutor",overlay).value,
      categoria: $("#fCategoria",overlay).value, resumen: $("#fResumen",overlay).value, contenido: $("#fContenido",overlay).value,
      tags: $("#fTags",overlay).value.split(",").map(s=>s.trim()).filter(Boolean),
      imagen_url: $("#fImagenUrl",overlay).value,
      publicado: $("#fPublicado",overlay).checked, destacado: $("#fDestacado",overlay).checked,
    };
    if(!data.titulo){ toast("El título es obligatorio.", true); return; }
    try{
      if(isNew) await Api.crearNoticia(data); else await Api.actualizarNoticia(n.id, data);
      toast(isNew ? "Noticia creada." : "Noticia actualizada."); closeModal(); pageNoticias();
    }catch(err){ toast(err.message, true); }
  });
}

/* LANZAMIENTOS */

async function pageLanzamientos(){
  const { resultados } = await Api.lanzamientos();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Lanzamientos</h1><p>Etapas del roadmap, mostradas de forma destacada en el inicio y en la página de lanzamientos.</p></div>
      <button class="btn btn-primary" id="newLanzBtn">+ Nueva etapa</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Imagen</th><th>Orden</th><th>Título</th><th>Estado</th><th>Destacado en inicio</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(l => `<tr>
          <td>${l.imagen_url ? `<img class="img-preview" src="${esc(l.imagen_url)}">` : "—"}</td>
          <td class="mono">${l.orden}</td><td><b>${esc(l.titulo)}</b></td><td>${esc(estadoLabel(l.estado))}</td>
          <td>${l.destacado_home?'Sí':'No'}</td>
          <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit-lanz="${l.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del-lanz="${l.id}">Eliminar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="6">Sin etapas registradas.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $("#newLanzBtn").addEventListener("click", () => openLanzModal(null));
  $$("[data-edit-lanz]").forEach(b => b.addEventListener("click", () => openLanzModal(resultados.find(l => l.id == b.dataset.editLanz))));
  $$("[data-del-lanz]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar esta etapa?")) return;
    await Api.eliminarLanzamiento(b.dataset.delLanz); toast("Etapa eliminada."); pageLanzamientos();
  }));
}
defineAdminRoute("lanzamientos", pageLanzamientos);
function estadoLabel(e){ return { proximamente:"Próximamente", en_desarrollo:"En desarrollo", disponible:"Disponible" }[e] || e; }

function openLanzModal(l){
  const isNew = !l;
  l = l || { titulo:"", descripcion:"", fecha_estimada:"", estado:"proximamente", orden:0, imagen_url:"", destacado_home:true };
  const overlay = openModal(`
    <h2>${isNew ? "Nueva etapa" : "Editar etapa"}</h2>
    <div class="form-grid">
      <div class="field full"><label>Título *</label><input id="fTitulo" value="${esc(l.titulo)}"></div>
      <div class="field full"><label>Descripción</label><textarea id="fDescripcion">${esc(l.descripcion||"")}</textarea></div>
      <div class="field"><label>Estado</label><select id="fEstado">
        <option value="proximamente" ${l.estado==='proximamente'?'selected':''}>Próximamente</option>
        <option value="en_desarrollo" ${l.estado==='en_desarrollo'?'selected':''}>En desarrollo</option>
        <option value="disponible" ${l.estado==='disponible'?'selected':''}>Disponible</option>
      </select></div>
      <div class="field"><label>Orden</label><input id="fOrden" type="number" value="${l.orden}"></div>
      <div class="field"><label>Fecha estimada</label><input id="fFechaEst" value="${esc(l.fecha_estimada||"")}"></div>
      <div class="field full">
        <label>Imagen</label>
        <div class="upload-row">
          <img class="img-preview" id="lanzImgPreview" src="${l.imagen_url||''}" style="display:${l.imagen_url?'block':'none'};">
          <input type="file" id="lanzImgFile" accept="image/*">
          <input type="hidden" id="fImagenUrl" value="${esc(l.imagen_url||'')}">
        </div>
      </div>
      <div class="field"><label><input type="checkbox" id="fDestacado" ${l.destacado_home?"checked":""} style="width:auto; margin-right:6px;">Destacar en inicio</label></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveLanz">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#lanzImgFile", overlay).addEventListener("change", () => handleImageUpload($("#lanzImgFile",overlay), $("#lanzImgPreview",overlay), $("#fImagenUrl",overlay)));
  $("#saveLanz", overlay).addEventListener("click", async () => {
    const data = {
      titulo: $("#fTitulo",overlay).value.trim(), descripcion: $("#fDescripcion",overlay).value,
      estado: $("#fEstado",overlay).value, orden: parseInt($("#fOrden",overlay).value)||0,
      fecha_estimada: $("#fFechaEst",overlay).value, imagen_url: $("#fImagenUrl",overlay).value,
      destacado_home: $("#fDestacado",overlay).checked,
    };
    if(!data.titulo){ toast("El título es obligatorio.", true); return; }
    try{
      if(isNew) await Api.crearLanzamiento(data); else await Api.actualizarLanzamiento(l.id, data);
      toast(isNew ? "Etapa creada." : "Etapa actualizada."); closeModal(); pageLanzamientos();
    }catch(err){ toast(err.message, true); }
  });
}

/* PRODUCTO (home) */

// OJO: estas claves y (para "componentes") estos nombres deben coincidir exactamente con PRODUCT_META y TECH_COMPONENTS en 
// public-site/js/01-data.js y 03-page-home.js — así el sitio público sabe qué imagen mostrar en cada tarjeta. 
// Si agregas un producto nuevo en el sitio, agrégalo también aquí.

const PRODUCTOS_KEYS = {
  nodo_led: "Nodo SAVE (panel LED de aviso)",
  pulsera: "Pulsera SAVE",
  app: "App de monitoreo personal",
  nodo_movil: "Nodo móvil (celular)",
};

// Nombres exactos de "Los componentes principales del sistema" (página Quiénes somos / Cómo funciona). No son libres: 
// si el nombre no calza exacto con el del sitio, la imagen no se va a asociar.

const COMPONENTES_NOMBRES = [
  "Nodo SAVE (panel LED)", "Pulsera wearable", "Sensores", "ESP32-C3",
  "Comunicación BLE", "Backend", "Sistema de notificaciones",
];

// Nombres exactos de las fotos del recorrido de una alerta, usadas tanto en la franja de fotos como en las 4 fases de la página "Cómo funciona".

const RECORRIDO_NOMBRES = [
  "La persona", "La pulsera detecta", "El nodo se activa", "Panel de monitoreo",
  "Aviso al entorno", "Centro de salud", "Llega la ayuda",
];
function slotGroupHTML(titulo, ayuda, key, nombres, resultados){
  const items = resultados.filter(r => r.producto === key);
  return `<h3 style="margin-top:34px;">${titulo}</h3>
    <p style="font-size:.82rem; color:var(--ink-soft, #777); margin:-6px 0 10px;">${ayuda}</p>
    <div class="table-card" style="margin-bottom:10px;"><table>
      <thead><tr><th>Imagen</th><th>Nombre</th><th>Descripción (opcional)</th><th></th></tr></thead>
      <tbody>
        ${nombres.map(nombre => {
          const i = items.find(c => c.nombre === nombre);
          return `<tr>
            <td>${i && i.imagen_url ? `<img class="img-preview" src="${esc(i.imagen_url)}">` : "—"}</td>
            <td>${esc(nombre)}</td><td style="font-size:.82rem;">${esc((i && i.descripcion) || "—")}</td>
            <td class="row-actions">${i
              ? `<button class="btn btn-outline btn-sm" data-edit-prod="${i.id}">Editar</button>`
              : `<button class="btn btn-primary btn-sm" data-new-slot="${key}::${esc(nombre)}">+ Agregar imagen</button>`}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table></div>`;
}
async function pageProducto(){
  const { resultados } = await Api.producto();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Producto (página de inicio)</h1><p>Imágenes y descripciones del Nodo SAVE, la pulsera, la app y el nodo móvil que se muestran en el inicio del sitio.</p></div></div>
    ${Object.keys(PRODUCTOS_KEYS).map(key => {
      const items = resultados.filter(r => r.producto === key);
      return `<h3 style="margin-top:26px;">${PRODUCTOS_KEYS[key]}</h3>
      <div class="table-card" style="margin-bottom:10px;"><table>
        <thead><tr><th>Imagen</th><th>Nombre</th><th>Descripción</th><th></th></tr></thead>
        <tbody>
          ${items.map(i => `<tr>
            <td>${i.imagen_url ? `<img class="img-preview" src="${esc(i.imagen_url)}">` : "—"}</td>
            <td>${esc(i.nombre)}</td><td style="font-size:.82rem;">${esc(i.descripcion||"—")}</td>
            <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit-prod="${i.id}">Editar</button></td>
          </tr>`).join("") || `<tr class="empty-row"><td colspan="4">Sin ítems. <button class="btn btn-primary btn-sm" data-new-prod="${key}">+ Agregar</button></td></tr>`}
        </tbody>
      </table></div>`;
    }).join("")}

    ${slotGroupHTML(
      'Componentes del sistema (página "Quiénes somos" / "Cómo funciona")',
      "Sube una foto o esquema para cada componente. Si un componente queda sin imagen, el sitio sigue mostrando su ícono como respaldo.",
      "componentes", COMPONENTES_NOMBRES, resultados
    )}

    ${slotGroupHTML(
      'Recorrido de una alerta (página "Cómo funciona")',
      "Estas 7 fotos alimentan tanto la franja de fotos como las 4 fases explicadas de la página Cómo funciona. Si una queda sin imagen, el sitio usa una foto de referencia por defecto.",
      "recorrido", RECORRIDO_NOMBRES, resultados
    )}
  `;
  $$("[data-edit-prod]").forEach(b => b.addEventListener("click", () => openProductoModal(resultados.find(r => r.id == b.dataset.editProd))));
  $$("[data-new-prod]").forEach(b => b.addEventListener("click", () => openProductoModal(null, b.dataset.newProd)));
  $$("[data-new-slot]").forEach(b => b.addEventListener("click", () => {
    const [key, nombre] = b.dataset.newSlot.split("::");
    openProductoModal({ producto: key, nombre, descripcion: "", imagen_url: "", orden: 0 }, key);
  }));
}
defineAdminRoute("producto", pageProducto);

function openProductoModal(item, producto){
  const isNew = !item || !item.id;
  item = item || { producto: producto, nombre: PRODUCTOS_KEYS[producto]||"", descripcion:"", imagen_url:"", orden:0 };
  const overlay = openModal(`
    <h2>${isNew ? "Nuevo ítem de producto" : "Editar " + esc(item.nombre)}</h2>
    <div class="form-grid">
      <div class="field full"><label>Nombre</label><input id="fNombre" value="${esc(item.nombre)}"></div>
      <div class="field full"><label>Descripción</label><textarea id="fDescripcion">${esc(item.descripcion||"")}</textarea></div>
      <div class="field full">
        <label>Imagen</label>
        <div class="upload-row">
          <img class="img-preview" id="prodImgPreview" src="${item.imagen_url||''}" style="display:${item.imagen_url?'block':'none'};">
          <input type="file" id="prodImgFile" accept="image/*">
          <input type="hidden" id="fImagenUrl" value="${esc(item.imagen_url||'')}">
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveProd">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#prodImgFile", overlay).addEventListener("change", () => handleImageUpload($("#prodImgFile",overlay), $("#prodImgPreview",overlay), $("#fImagenUrl",overlay)));
  $("#saveProd", overlay).addEventListener("click", async () => {
    const data = { producto: item.producto, nombre: $("#fNombre",overlay).value.trim(), descripcion: $("#fDescripcion",overlay).value, imagen_url: $("#fImagenUrl",overlay).value };
    try{
      if(isNew) await Api.crearProducto(data); else await Api.actualizarProducto(item.id, data);
      toast("Guardado."); closeModal(); pageProducto();
    }catch(err){ toast(err.message, true); }
  });
}

/* CASOS */

async function pageCasos(){
  const { resultados } = await Api.casos();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Casos documentados</h1><p>Evidencia con fuente citada, mostrada en la página de casos.</p></div>
      <button class="btn btn-primary" id="newCasoBtn">+ Nuevo caso</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Imagen</th><th>Título</th><th>Tipo</th><th>Fuente</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(c => `<tr>
          <td>${c.imagen_url ? `<img class="img-preview" src="${esc(c.imagen_url)}">` : "—"}</td>
          <td><b>${esc(c.titulo)}</b></td><td style="font-size:.8rem;">${esc(c.tipo||"—")}</td><td style="font-size:.8rem;">${esc(c.fuente||"—")}</td>
          <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit-caso="${c.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del-caso="${c.id}">Eliminar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="5">Sin casos registrados.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $("#newCasoBtn").addEventListener("click", () => openCasoModal(null));
  $$("[data-edit-caso]").forEach(b => b.addEventListener("click", () => openCasoModal(resultados.find(c => c.id == b.dataset.editCaso))));
  $$("[data-del-caso]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar este caso?")) return;
    await Api.eliminarCaso(b.dataset.delCaso); toast("Caso eliminado."); pageCasos();
  }));
}
defineAdminRoute("casos", pageCasos);

function openCasoModal(c){
  const isNew = !c;
  c = c || { titulo:"", fecha:"", lugar:"", tipo:"", fact_type:"Hecho documentado", hecho:"", problema:"", fuente:"", fuente_doi:"", url:"", fecha_publicacion:"", imagen_url:"" };
  const overlay = openModal(`
    <h2>${isNew ? "Nuevo caso" : "Editar caso"}</h2>
    <div class="form-grid">
      <div class="field full"><label>Título *</label><input id="fTitulo" value="${esc(c.titulo)}"></div>
      <div class="field"><label>Fecha</label><input id="fFecha" value="${esc(c.fecha||"")}"></div>
      <div class="field"><label>Lugar</label><input id="fLugar" value="${esc(c.lugar||"")}"></div>
      <div class="field"><label>Tipo</label><input id="fTipo" value="${esc(c.tipo||"")}"></div>
      <div class="field"><label>Tipo de dato</label><input id="fFactType" value="${esc(c.fact_type||"")}"></div>
      <div class="field full"><label>Hecho documentado</label><textarea id="fHecho">${esc(c.hecho||"")}</textarea></div>
      <div class="field full"><label>Análisis / relación con SAVE</label><textarea id="fProblema">${esc(c.problema||"")}</textarea></div>
      <div class="field"><label>Fuente</label><input id="fFuente" value="${esc(c.fuente||"")}"></div>
      <div class="field"><label>DOI</label><input id="fDoi" value="${esc(c.fuente_doi||"")}"></div>
      <div class="field full"><label>URL</label><input id="fUrl" value="${esc(c.url||"")}"></div>
      <div class="field"><label>Fecha de publicación</label><input id="fFechaPub" value="${esc(c.fecha_publicacion||"")}"></div>
      <div class="field full">
        <label>Imagen</label>
        <div class="upload-row">
          <img class="img-preview" id="casoImgPreview" src="${c.imagen_url||''}" style="display:${c.imagen_url?'block':'none'};">
          <input type="file" id="casoImgFile" accept="image/*">
          <input type="hidden" id="fImagenUrl" value="${esc(c.imagen_url||'')}">
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveCaso">${isNew ? "Crear" : "Guardar"}</button>
    </div>
  `);
  $("#casoImgFile", overlay).addEventListener("change", () => handleImageUpload($("#casoImgFile",overlay), $("#casoImgPreview",overlay), $("#fImagenUrl",overlay)));
  $("#saveCaso", overlay).addEventListener("click", async () => {
    const data = {
      titulo: $("#fTitulo",overlay).value.trim(), fecha: $("#fFecha",overlay).value, lugar: $("#fLugar",overlay).value,
      tipo: $("#fTipo",overlay).value, fact_type: $("#fFactType",overlay).value, hecho: $("#fHecho",overlay).value,
      problema: $("#fProblema",overlay).value, fuente: $("#fFuente",overlay).value, fuente_doi: $("#fDoi",overlay).value,
      url: $("#fUrl",overlay).value, fecha_publicacion: $("#fFechaPub",overlay).value, imagen_url: $("#fImagenUrl",overlay).value,
    };
    if(!data.titulo){ toast("El título es obligatorio.", true); return; }
    try{
      if(isNew) await Api.crearCaso(data); else await Api.actualizarCaso(c.id, data);
      toast(isNew ? "Caso creado." : "Caso actualizado."); closeModal(); pageCasos();
    }catch(err){ toast(err.message, true); }
  });
}

/* NEWSLETTER */

async function pageNewsletter(){
  const { resultados } = await Api.newsletter();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Newsletter</h1><p>Personas suscritas para recibir novedades del lanzamiento.</p></div></div>
    <div class="table-card"><table>
      <thead><tr><th>Nombre</th><th>Correo</th><th>Fecha</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(s => `<tr>
          <td>${esc(s.nombre||"—")}</td><td>${esc(s.correo)}</td><td style="font-size:.78rem;">${fmtDate(s.creado_en)}</td>
          <td><button class="btn btn-danger btn-sm" data-del-sub="${s.id}">Eliminar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="4">Sin suscriptores todavía.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $$("[data-del-sub]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar este suscriptor?")) return;
    await Api.eliminarNewsletter(b.dataset.delSub); toast("Eliminado."); pageNewsletter();
  }));
}
defineAdminRoute("newsletter", pageNewsletter);

/* EQUIPO */

async function pageEquipo(){
  const { resultados } = await Api.equipo();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Equipo</h1><p>Personas que aparecen en "Quiénes somos → Las personas detrás de SAVE".</p></div>
      <button class="btn btn-primary" id="newEquipoBtn">+ Agregar integrante</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Foto</th><th>Nombre</th><th>Rol</th><th>Orden</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(p => `<tr>
          <td>${p.foto_url ? `<img class="img-preview" src="${esc(p.foto_url)}">` : "—"}</td>
          <td>${esc(p.nombre)}</td><td>${esc(p.rol||"—")}</td><td>${p.orden}</td>
          <td class="row-actions">
            <button class="btn btn-outline btn-sm" data-edit-equipo="${p.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-del-equipo="${p.id}">Eliminar</button>
          </td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="5">Sin integrantes todavía.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $("#newEquipoBtn").addEventListener("click", () => openEquipoModal(null));
  $$("[data-edit-equipo]").forEach(b => b.addEventListener("click", () => openEquipoModal(resultados.find(p => p.id == b.dataset.editEquipo))));
  $$("[data-del-equipo]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar a este integrante del equipo?")) return;
    await Api.eliminarEquipo(b.dataset.delEquipo); toast("Integrante eliminado."); pageEquipo();
  }));
}
defineAdminRoute("equipo", pageEquipo);

function openEquipoModal(p){
  const isNew = !p;
  p = p || { nombre:"", rol:"", foto_url:"", orden:0 };
  const overlay = openModal(`
    <h2>${isNew ? "Agregar integrante" : "Editar integrante"}</h2>
    <div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="fEqNombre" value="${esc(p.nombre)}"></div>
      <div class="field full"><label>Rol / cargo</label><input id="fEqRol" value="${esc(p.rol||"")}" placeholder="Ej: Fundadora y directora del proyecto"></div>
      <div class="field"><label>Orden (menor = aparece primero)</label><input id="fEqOrden" type="number" value="${p.orden||0}"></div>
      <div class="field full">
        <label>Foto</label>
        <div class="upload-row">
          <img class="img-preview" id="eqFotoPreview" src="${p.foto_url||''}" style="display:${p.foto_url?'block':'none'};">
          <input type="file" id="eqFotoFile" accept="image/*">
          <input type="hidden" id="fEqFotoUrl" value="${esc(p.foto_url||'')}">
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveEquipo">${isNew ? "Agregar" : "Guardar"}</button>
    </div>
  `);
  $("#eqFotoFile", overlay).addEventListener("change", () => handleImageUpload($("#eqFotoFile",overlay), $("#eqFotoPreview",overlay), $("#fEqFotoUrl",overlay)));
  $("#saveEquipo", overlay).addEventListener("click", async () => {
    const data = {
      nombre: $("#fEqNombre",overlay).value.trim(), rol: $("#fEqRol",overlay).value.trim(),
      orden: parseInt($("#fEqOrden",overlay).value, 10) || 0,
      foto_url: $("#fEqFotoUrl",overlay).value,
    };
    if(!data.nombre){ toast("El nombre es obligatorio.", true); return; }
    try{
      if(isNew) await Api.crearEquipo(data); else await Api.actualizarEquipo(p.id, data);
      toast(isNew ? "Integrante agregado." : "Integrante actualizado."); closeModal(); pageEquipo();
    }catch(err){ toast(err.message, true); }
  });
}

/* ADMINISTRADORES */

async function pageAdmins(){
  const { resultados, miId } = await Api.admins();
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Administradores</h1><p>Quiénes pueden entrar a este panel y gestionar el sitio.</p></div>
      <button class="btn btn-primary" id="newAdminBtn">+ Nuevo administrador</button></div>
    <div class="table-card"><table>
      <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Creado</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(a => `<tr>
          <td>${esc(a.nombre)} ${a.id === miId ? '<span class="badge ok">Tú</span>' : ''}</td>
          <td>${esc(a.email)}</td><td>${esc(a.rol)}</td><td style="font-size:.78rem;">${fmtDate(a.creado_en)}</td>
          <td class="row-actions">${a.id !== miId ? `<button class="btn btn-danger btn-sm" data-del-admin="${a.id}">Eliminar</button>` : ""}</td>
        </tr>`).join("")}
      </tbody>
    </table></div>

    <h3 style="margin-top:34px;">Cambiar mi contraseña</h3>
    <div class="table-card" style="padding:20px; max-width:420px;">
      <div class="field"><label>Contraseña actual</label><input id="pwActual" type="password"></div>
      <div class="field"><label>Nueva contraseña (mínimo 8 caracteres)</label><input id="pwNueva" type="password"></div>
      <button class="btn btn-primary btn-sm" id="savePw">Actualizar contraseña</button>
    </div>
  `;
  $("#newAdminBtn").addEventListener("click", () => openAdminModal());
  $$("[data-del-admin]").forEach(b => b.addEventListener("click", async () => {
    if(!confirm("¿Eliminar a este administrador? Ya no podrá entrar al panel.")) return;
    try{ await Api.eliminarAdmin(b.dataset.delAdmin); toast("Administrador eliminado."); pageAdmins(); }
    catch(err){ toast(err.message, true); }
  }));
  $("#savePw").addEventListener("click", async () => {
    const actual = $("#pwActual").value, nueva = $("#pwNueva").value;
    if(!actual || !nueva){ toast("Completa ambos campos.", true); return; }
    try{ await Api.cambiarPassword({ actual, nueva }); toast("Contraseña actualizada."); $("#pwActual").value=""; $("#pwNueva").value=""; }
    catch(err){ toast(err.message, true); }
  });
}
defineAdminRoute("administradores", pageAdmins);

function openAdminModal(){
  const overlay = openModal(`
    <h2>Nuevo administrador</h2>
    <div class="form-grid">
      <div class="field full"><label>Nombre *</label><input id="fAdNombre"></div>
      <div class="field full"><label>Correo *</label><input id="fAdEmail" type="email"></div>
      <div class="field full"><label>Contraseña * (mínimo 8 caracteres)</label><input id="fAdPass" type="password"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="saveAdmin">Crear</button>
    </div>
  `);
  $("#saveAdmin", overlay).addEventListener("click", async () => {
    const data = {
      nombre: $("#fAdNombre",overlay).value.trim(), email: $("#fAdEmail",overlay).value.trim(),
      password: $("#fAdPass",overlay).value,
    };
    if(!data.nombre || !data.email || !data.password){ toast("Completa todos los campos.", true); return; }
    try{
      await Api.crearAdmin(data);
      toast("Administrador creado."); closeModal(); pageAdmins();
    }catch(err){ toast(err.message, true); }
  });
}

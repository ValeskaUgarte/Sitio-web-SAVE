/* RESUMEN */

async function pageResumen(){
  const [sol, cot, con, nod, emp, not] = await Promise.all([
    Api.solicitudes(), Api.cotizaciones(), Api.contactos(), Api.nodos(), Api.empresas(), Api.noticias(),
  ]);
  updateSidebarCounts(sol.resultados, cot.resultados, con.resultados);
  const pendSol = sol.resultados.filter(s => s.estado === "Recibida").length;
  const pendCot = cot.resultados.filter(c => c.estado === "Nueva").length;
  const pendCon = con.resultados.filter(c => c.estado === "Nuevo").length;

  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Resumen</h1><p>Estado general del sistema SAVE.</p></div></div>
    <div class="stat-cards">
      <div class="stat-card"><b>${sol.resultados.length}</b><span>Solicitudes (${pendSol} nuevas)</span></div>
      <div class="stat-card"><b>${cot.resultados.length}</b><span>Cotizaciones (${pendCot} nuevas)</span></div>
      <div class="stat-card"><b>${con.resultados.length}</b><span>Mensajes de contacto (${pendCon} nuevos)</span></div>
      <div class="stat-card"><b>${nod.resultados.length}</b><span>Nodos SAVE registrados</span></div>
      <div class="stat-card"><b>${emp.resultados.length}</b><span>Empresas afiliadas</span></div>
      <div class="stat-card"><b>${not.resultados.length}</b><span>Noticias publicadas</span></div>
    </div>
    <div class="table-card">
      <table>
        <thead><tr><th>Últimas solicitudes</th><th>Tipo</th><th>Estado</th><th>Fecha</th></tr></thead>
        <tbody>
          ${sol.resultados.slice(0,6).map(s => `
            <tr><td>${esc(s.nombre)}</td><td>${s.tipo_solicitante === "persona" ? "Persona natural" : "Organización"}</td>
            <td><span class="badge ${s.estado==='Recibida'?'pending':'neutral'}">${esc(s.estado)}</span></td><td>${fmtDate(s.creado_en)}</td></tr>
          `).join("") || `<tr class="empty-row"><td colspan="4">Sin solicitudes todavía.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}
defineAdminRoute("resumen", pageResumen);

function updateSidebarCounts(sol, cot, con){
  const nsol = sol.filter(s => s.estado === "Recibida").length;
  const ncot = cot.filter(c => c.estado === "Nueva").length;
  const ncon = con.filter(c => c.estado === "Nuevo").length;
  const set = (id, n) => { const el = $(id); if(n>0){ el.textContent = n; el.style.display="inline-block"; } else { el.style.display="none"; } };
  set("#countSolicitudes", nsol); set("#countCotizaciones", ncot); set("#countContactos", ncon);
}

/* SOLICITUDES */

async function pageSolicitudes(){
  const { resultados } = await Api.solicitudes();
  updateSidebarCounts(resultados, [], []);
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Solicitudes</h1><p>Organizaciones y personas naturales que han pedido el servicio.</p></div></div>
    <div class="table-card"><table>
      <thead><tr><th>Nombre</th><th>Tipo</th><th>Servicio</th><th>Contacto</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
      <tbody id="solTbody">
        ${resultados.map(solRowHTML).join("") || `<tr class="empty-row"><td colspan="7">Sin solicitudes todavía.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $$("[data-view-sol]").forEach(b => b.addEventListener("click", () => openSolicitudModal(resultados.find(s => s.id == b.dataset.viewSol))));
}
defineAdminRoute("solicitudes", pageSolicitudes);

function solRowHTML(s){
  return `<tr>
    <td><b>${esc(s.nombre)}</b>${s.organizacion ? `<br><span style="color:var(--ink-soft); font-size:.78rem;">${esc(s.organizacion)}</span>` : ""}</td>
    <td>${s.tipo_solicitante === "persona" ? "Persona natural" : esc(s.tipo_organizacion || "Organización")}</td>
    <td style="font-size:.8rem;">${esc(s.tipo_servicio || "—")}</td>
    <td style="font-size:.8rem;">${esc(s.correo)}${s.telefono ? "<br>"+esc(s.telefono) : ""}</td>
    <td><span class="badge ${s.estado==='Recibida'?'pending':(s.estado==='Cerrada'?'neutral':'ok')}">${esc(s.estado)}</span></td>
    <td style="font-size:.78rem;">${fmtDate(s.creado_en)}</td>
    <td><button class="btn btn-outline btn-sm" data-view-sol="${s.id}">Ver / gestionar</button></td>
  </tr>`;
}

function openSolicitudModal(s){
  if(!s) return;
  const overlay = openModal(`
    <h2>${esc(s.nombre)}</h2>
    <p style="color:var(--ink-soft); font-size:.85rem;">Código: <b>${esc(s.codigo)}</b> · ${fmtDate(s.creado_en)}</p>
    <table style="width:100%; font-size:.85rem; margin:14px 0;">
      <tr><td style="color:var(--ink-soft); padding:4px 0;">Tipo</td><td>${s.tipo_solicitante === "persona" ? "Persona natural" : esc(s.tipo_organizacion || "Organización")}</td></tr>
      ${s.organizacion ? `<tr><td style="color:var(--ink-soft);">Organización</td><td>${esc(s.organizacion)}</td></tr>` : ""}
      ${s.cargo ? `<tr><td style="color:var(--ink-soft);">Cargo</td><td>${esc(s.cargo)}</td></tr>` : ""}
      <tr><td style="color:var(--ink-soft);">Correo</td><td>${esc(s.correo)}</td></tr>
      <tr><td style="color:var(--ink-soft);">Teléfono</td><td>${esc(s.telefono || "—")}</td></tr>
      <tr><td style="color:var(--ink-soft);">Ubicación</td><td>${esc([s.direccion,s.comuna,s.region].filter(Boolean).join(", ") || "—")}</td></tr>
      <tr><td style="color:var(--ink-soft);">Servicio pedido</td><td>${esc(s.tipo_servicio || "—")}</td></tr>
      <tr><td style="color:var(--ink-soft);">Personas / nodos</td><td>${esc(s.cantidad_personas || "—")} / ${esc(s.cantidad_nodos || "—")}</td></tr>
    </table>
    <p style="font-size:.85rem;"><b>Necesidad:</b><br>${esc(s.descripcion_necesidad || "—")}</p>
    <div class="field" style="margin-top:16px;"><label>Estado</label>
      <select id="solEstado">
        ${["Recibida","En evaluación","Contactado","Cerrada"].map(o => `<option ${o===s.estado?"selected":""}>${o}</option>`).join("")}
      </select>
    </div>
    <div class="field"><label>Notas internas</label><textarea id="solNotas">${esc(s.notas_internas || "")}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-danger btn-sm" id="solDelete">Eliminar</button>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary btn-sm" id="solSave">Guardar cambios</button>
    </div>
  `);
  $("#solSave", overlay).addEventListener("click", async () => {
    try{
      await Api.actualizarSolicitud(s.id, { estado: $("#solEstado", overlay).value, notas_internas: $("#solNotas", overlay).value });
      toast("Solicitud actualizada."); closeModal(); pageSolicitudes();
    }catch(e){ toast(e.message, true); }
  });
  $("#solDelete", overlay).addEventListener("click", async () => {
    if(!confirm("¿Eliminar esta solicitud? Esta acción no se puede deshacer.")) return;
    await Api.eliminarSolicitud(s.id); toast("Solicitud eliminada."); closeModal(); pageSolicitudes();
  });
}

/* COTIZACIONES */

async function pageCotizaciones(){
  const { resultados } = await Api.cotizaciones();
  updateSidebarCounts([], resultados, []);
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Cotizaciones</h1><p>Cotizaciones rápidas de pulsera, app y nodo móvil.</p></div></div>
    <div class="table-card"><table>
      <thead><tr><th>Nombre</th><th>Producto</th><th>Cantidad</th><th>Contacto</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(c => `<tr>
          <td><b>${esc(c.nombre)}</b></td><td>${esc(c.producto)}</td><td>${esc(c.cantidad)}</td>
          <td style="font-size:.8rem;">${esc(c.correo)}${c.telefono?"<br>"+esc(c.telefono):""}</td>
          <td><span class="badge ${c.estado==='Nueva'?'pending':'ok'}">${esc(c.estado)}</span></td>
          <td style="font-size:.78rem;">${fmtDate(c.creado_en)}</td>
          <td><button class="btn btn-outline btn-sm" data-view-cot="${c.id}">Gestionar</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="7">Sin cotizaciones todavía.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $$("[data-view-cot]").forEach(b => b.addEventListener("click", () => openCotizacionModal(resultados.find(c => c.id == b.dataset.viewCot))));
}
defineAdminRoute("cotizaciones", pageCotizaciones);

function openCotizacionModal(c){
  const overlay = openModal(`
    <h2>${esc(c.nombre)}</h2>
    <p style="color:var(--ink-soft); font-size:.85rem;">Código: <b>${esc(c.codigo)}</b> · ${fmtDate(c.creado_en)}</p>
    <table style="width:100%; font-size:.85rem; margin:14px 0;">
      <tr><td style="color:var(--ink-soft); padding:4px 0;">Correo</td><td>${esc(c.correo)}</td></tr>
      <tr><td style="color:var(--ink-soft);">Teléfono</td><td>${esc(c.telefono || "—")}</td></tr>
      <tr><td style="color:var(--ink-soft);">Producto</td><td>${esc(c.producto)} × ${esc(c.cantidad)}</td></tr>
      <tr><td style="color:var(--ink-soft);">Comuna</td><td>${esc(c.comuna || "—")}</td></tr>
    </table>
    <p style="font-size:.85rem;"><b>Comentario:</b><br>${esc(c.comentario || "—")}</p>
    <div class="field" style="margin-top:16px;"><label>Estado</label>
      <select id="cotEstado">${["Nueva","Cotizada","Cerrada"].map(o => `<option ${o===c.estado?"selected":""}>${o}</option>`).join("")}</select>
    </div>
    <div class="field"><label>Notas internas</label><textarea id="cotNotas">${esc(c.notas_internas || "")}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-danger btn-sm" id="cotDelete">Eliminar</button>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary btn-sm" id="cotSave">Guardar cambios</button>
    </div>
  `);
  $("#cotSave", overlay).addEventListener("click", async () => {
    try{
      await Api.actualizarCotizacion(c.id, { estado: $("#cotEstado", overlay).value, notas_internas: $("#cotNotas", overlay).value });
      toast("Cotización actualizada."); closeModal(); pageCotizaciones();
    }catch(e){ toast(e.message, true); }
  });
  $("#cotDelete", overlay).addEventListener("click", async () => {
    if(!confirm("¿Eliminar esta cotización?")) return;
    await Api.eliminarCotizacion(c.id); toast("Cotización eliminada."); closeModal(); pageCotizaciones();
  });
}

/* CONTACTOS  */

async function pageContactos(){
  const { resultados } = await Api.contactos();
  updateSidebarCounts([], [], resultados);
  $("#mainArea").innerHTML = `
    <div class="page-head"><div><h1>Mensajes de contacto</h1><p>Mensajes enviados desde el formulario de contacto del sitio.</p></div></div>
    <div class="table-card"><table>
      <thead><tr><th>Nombre</th><th>Asunto</th><th>Correo</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
      <tbody>
        ${resultados.map(c => `<tr>
          <td><b>${esc(c.nombre)}</b></td><td>${esc(c.asunto || "—")}</td><td style="font-size:.8rem;">${esc(c.correo)}</td>
          <td><span class="badge ${c.estado==='Nuevo'?'pending':'ok'}">${esc(c.estado)}</span></td>
          <td style="font-size:.78rem;">${fmtDate(c.creado_en)}</td>
          <td><button class="btn btn-outline btn-sm" data-view-con="${c.id}">Ver</button></td>
        </tr>`).join("") || `<tr class="empty-row"><td colspan="6">Sin mensajes todavía.</td></tr>`}
      </tbody>
    </table></div>
  `;
  $$("[data-view-con]").forEach(b => b.addEventListener("click", () => openContactoModal(resultados.find(c => c.id == b.dataset.viewCon))));
}
defineAdminRoute("contactos", pageContactos);

function openContactoModal(c){
  const overlay = openModal(`
    <h2>${esc(c.asunto || "Sin asunto")}</h2>
    <p style="color:var(--ink-soft); font-size:.85rem;">${esc(c.nombre)} · ${esc(c.correo)} · ${fmtDate(c.creado_en)}</p>
    <p style="font-size:.78rem; color:var(--ink-soft);">Motivo: ${esc(c.motivo || "—")}</p>
    <p style="font-size:.9rem; margin-top:14px; white-space:pre-wrap;">${esc(c.mensaje)}</p>
    <div class="field" style="margin-top:16px;"><label>Estado</label>
      <select id="conEstado">${["Nuevo","Respondido","Archivado"].map(o => `<option ${o===c.estado?"selected":""}>${o}</option>`).join("")}</select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-danger btn-sm" id="conDelete">Eliminar</button>
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
      <a class="btn btn-primary btn-sm" href="mailto:${esc(c.correo)}">Responder por correo</a>
      <button class="btn btn-primary btn-sm" id="conSave">Guardar</button>
    </div>
  `);
  $("#conSave", overlay).addEventListener("click", async () => {
    await Api.actualizarContacto(c.id, { estado: $("#conEstado", overlay).value });
    toast("Mensaje actualizado."); closeModal(); pageContactos();
  });
  $("#conDelete", overlay).addEventListener("click", async () => {
    if(!confirm("¿Eliminar este mensaje?")) return;
    await Api.eliminarContacto(c.id); toast("Mensaje eliminado."); closeModal(); pageContactos();
  });
}

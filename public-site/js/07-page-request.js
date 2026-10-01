let solicitanteTipo = "organizacion"; // "organizacion" | "persona"

const TIPOS_ORGANIZACION = ["Junta de vecinos","Condominio","Empresa","Colegio o institución educacional","Centro de salud","Municipalidad","Espacio público","Otro"];
const TIPOS_SERVICIO_ORG = ["Nodo de entorno (instalación fija)","Pulseras para la comunidad","Nodo móvil (app)","Evaluación general / no estoy seguro"];
const TIPOS_SERVICIO_PERSONA = ["Pulsera SAVE para mí","Pulsera SAVE para un familiar","App de monitoreo personal","Nodo móvil (quiero ser parte de la red con mi celular)"];

function renderRequestPage(){
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Solicitar el servicio</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">Solicita SAVE para tu organización o para ti</h1>
      <p class="lede">SAVE está disponible tanto para organizaciones y comunidades que quieran instalar nodos de entorno, como para personas naturales interesadas en la pulsera, la app de monitoreo o en sumarse a la red desde su propio teléfono.</p>
    </div>
  </section>
  <section style="padding-top:24px;">
    <div class="container" style="max-width:820px;">
      <div class="solicitante-toggle">
        <button type="button" data-solicitante="organizacion" class="${solicitanteTipo==='organizacion'?'active':''}">
          <span class="st-title">${icon("ic-building")} Organización o comunidad</span>
          <span class="st-desc">Junta de vecinos, condominio, empresa, colegio, municipalidad u otro espacio.</span>
        </button>
        <button type="button" data-solicitante="persona" class="${solicitanteTipo==='persona'?'active':''}">
          <span class="st-title">${icon("ic-users")} Persona natural</span>
          <span class="st-desc">Quiero la pulsera, la app de monitoreo, o sumarme con mi celular como nodo móvil.</span>
        </button>
      </div>

      <div class="form-card" id="requestFormWrap">
        ${solicitanteTipo === "organizacion" ? renderOrgForm() : renderPersonaForm()}
      </div>

      <div class="card" style="margin-top:32px;">
        <h3 style="font-size:1rem;">¿Solo quieres cotizar rápido?</h3>
        <p style="color:var(--ink-soft); font-size:.87rem; margin-bottom:16px;">Si aún no quieres completar el formulario completo, puedes dejar una cotización rápida de la pulsera SAVE, la app o el nodo móvil.</p>
        <button type="button" class="btn btn-outline" id="openQuickQuote">Cotización rápida</button>
        <div id="quickQuoteWrap" style="display:none; margin-top:20px;">${renderQuickQuoteForm()}</div>
      </div>
    </div>
  </section>
  `;
}
defineRoute("solicitar", renderRequestPage);

function renderOrgForm(){
  return `
  <form id="requestForm" novalidate>
    <input type="hidden" name="tipo_solicitante" value="organizacion">
    <div class="form-section-title">Datos de la organización</div>
    <div class="field"><label>Tipo de organización *</label>
      <select name="tipo_organizacion" required>
        <option value="">Selecciona…</option>
        ${TIPOS_ORGANIZACION.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}
      </select>
      <span class="err-msg"></span>
    </div>
    <div class="field"><label>Nombre de la organización *</label><input type="text" name="nombre_organizacion" required><span class="err-msg"></span></div>
    <div class="field"><label>Sitio web (opcional)</label><input type="url" name="sitio_web" placeholder="https://"></div>

    <div class="form-section-title">Datos de contacto</div>
    <div class="field"><label>Nombre de quien solicita *</label><input type="text" name="nombre" required><span class="err-msg"></span></div>
    <div class="field"><label>Cargo</label><input type="text" name="cargo" placeholder="Ej: presidente/a, administrador/a, encargado/a"></div>
    <div class="field"><label>Correo *</label><input type="email" name="correo" required><span class="err-msg"></span></div>
    <div class="field"><label>Teléfono</label><input type="tel" name="telefono"></div>

    <div class="form-section-title">Ubicación</div>
    <div class="field"><label>Dirección</label><input type="text" name="direccion"></div>
    <div class="field"><label>Comuna</label><input type="text" name="comuna"></div>
    <div class="field"><label>Región</label><input type="text" name="region" value="Región Metropolitana"></div>

    <div class="form-section-title">Sobre la solicitud</div>
    <div class="field"><label>¿Qué necesitas? *</label>
      <select name="tipo_servicio" required>
        <option value="">Selecciona…</option>
        ${TIPOS_SERVICIO_ORG.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}
      </select>
      <span class="err-msg"></span>
    </div>
    <div class="field"><label>Cantidad aproximada de personas</label><input type="number" name="cantidad_personas" min="1"></div>
    <div class="field"><label>Cantidad aproximada de nodos que necesitas</label><input type="number" name="cantidad_nodos" min="1"></div>
    <div class="field"><label>Cuéntanos tu necesidad</label><textarea name="descripcion_necesidad" placeholder="Ej: queremos instalar un nodo en la sede social de la junta de vecinos."></textarea></div>

    <button type="submit" class="btn btn-primary" style="width:100%;">Enviar solicitud</button>
    <div id="requestError" style="display:none; margin-top:10px; color:var(--alert); font-size:.85rem;"></div>
  </form>`;
}

function renderPersonaForm(){
  return `
  <form id="requestForm" novalidate>
    <input type="hidden" name="tipo_solicitante" value="persona">
    <div class="form-section-title">Tus datos</div>
    <div class="field"><label>Nombre completo *</label><input type="text" name="nombre" required><span class="err-msg"></span></div>
    <div class="field"><label>Correo *</label><input type="email" name="correo" required><span class="err-msg"></span></div>
    <div class="field"><label>Teléfono</label><input type="tel" name="telefono"></div>
    <div class="field"><label>Comuna</label><input type="text" name="comuna"></div>
    <div class="field"><label>Región</label><input type="text" name="region" value="Región Metropolitana"></div>

    <div class="form-section-title">Qué necesitas</div>
    <div class="field"><label>Producto o servicio *</label>
      <select name="tipo_servicio" required>
        <option value="">Selecciona…</option>
        ${TIPOS_SERVICIO_PERSONA.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}
      </select>
      <span class="err-msg"></span>
    </div>
    <div class="field"><label>Cuéntanos tu necesidad</label><textarea name="descripcion_necesidad" placeholder="Ej: quiero una pulsera para mi papá, que tiene antecedentes cardíacos."></textarea></div>

    <button type="submit" class="btn btn-primary" style="width:100%;">Enviar solicitud</button>
    <div id="requestError" style="display:none; margin-top:10px; color:var(--alert); font-size:.85rem;"></div>
  </form>`;
}

function renderQuickQuoteForm(){
  return `
  <form id="quoteForm" novalidate>
    <div class="field"><label>Nombre *</label><input type="text" name="nombre" required><span class="err-msg"></span></div>
    <div class="field"><label>Correo *</label><input type="email" name="correo" required><span class="err-msg"></span></div>
    <div class="field"><label>¿Qué quieres cotizar? *</label>
      <select name="producto" required>
        <option value="">Selecciona…</option>
        <option value="Pulsera SAVE">Pulsera SAVE</option>
        <option value="App de monitoreo personal">App de monitoreo personal</option>
        <option value="Nodo móvil">Nodo móvil</option>
        <option value="Nodo de entorno">Nodo de entorno (para instalar)</option>
      </select>
      <span class="err-msg"></span>
    </div>
    <button type="submit" class="btn btn-primary" style="width:100%;">Enviar cotización</button>
    <div id="quoteError" style="display:none; margin-top:10px; color:var(--alert); font-size:.85rem;"></div>
  </form>`;
}

function initRequestPage(){
  $$("[data-solicitante]").forEach(btn => btn.addEventListener("click", () => {
    solicitanteTipo = btn.dataset.solicitante;
    $("#view").innerHTML = renderRequestPage();
    initRequestPage();
  }));

  const form = $("#requestForm");
  if(form){
    const schema = solicitanteTipo === "organizacion" ? [
      ['[name="tipo_organizacion"]', {required:true}],
      ['[name="nombre_organizacion"]', {required:true}],
      ['[name="nombre"]', {required:true}],
      ['[name="correo"]', {required:true, email:true}],
      ['[name="tipo_servicio"]', {required:true}],
    ] : [
      ['[name="nombre"]', {required:true}],
      ['[name="correo"]', {required:true, email:true}],
      ['[name="tipo_servicio"]', {required:true}],
    ];
    setupFormValidation(form, schema);
    form.addEventListener("validsubmit", async () => {
      const data = Object.fromEntries(new FormData(form).entries());
      const errBox = $("#requestError");
      errBox.style.display = "none";
      try{
        const res = await Api.enviarSolicitud(data);
        $("#requestFormWrap").innerHTML = `
          <div class="success-box">
            <div class="card-icon" style="margin:0 auto 20px;">${icon("ic-check")}</div>
            <h2>Solicitud enviada</h2>
            <p style="color:var(--ink-soft);">Tu código de seguimiento es <b>${esc(res.codigo)}</b>. El equipo de SAVE revisará tu solicitud y se pondrá en contacto contigo.</p>
          </div>`;
      }catch(e){
        errBox.textContent = e.message || "No pudimos enviar tu solicitud. Intenta nuevamente.";
        errBox.style.display = "block";
      }
    });
  }

  const openBtn = $("#openQuickQuote");
  if(openBtn){
    openBtn.addEventListener("click", () => {
      const wrap = $("#quickQuoteWrap");
      wrap.style.display = wrap.style.display === "none" ? "block" : "none";
      if(wrap.style.display === "block") initQuoteForm();
    });
  }
}

function initQuoteForm(){
  const form = $("#quoteForm");
  if(!form) return;
  setupFormValidation(form, [
    ['[name="nombre"]', {required:true}],
    ['[name="correo"]', {required:true, email:true}],
    ['[name="producto"]', {required:true}],
  ]);
  form.addEventListener("validsubmit", async () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const errBox = $("#quoteError");
    errBox.style.display = "none";
    try{
      const res = await Api.enviarCotizacion(data);
      $("#quickQuoteWrap").innerHTML = `
        <div class="success-box">
          <div class="card-icon" style="margin:0 auto 16px;">${icon("ic-check")}</div>
          <h3>Cotización enviada</h3>
          <p style="color:var(--ink-soft); font-size:.88rem;">Código: <b>${esc(res.codigo)}</b>. Te contactaremos pronto.</p>
        </div>`;
    }catch(e){
      errBox.textContent = e.message || "No pudimos enviar tu cotización. Intenta nuevamente.";
      errBox.style.display = "block";
    }
  });
}

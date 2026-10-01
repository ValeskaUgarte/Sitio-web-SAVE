function renderLaunchPage(){
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">${icon("ic-rocket")} Próximos lanzamientos</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">La escalabilidad de SAVE</h1>
      <p class="lede">Más allá del sistema que ya está en prototipado (pulsera, nodo, app y panel), estos son los próximos sensores que ampliarán lo que SAVE puede detectar. Ninguno ha comenzado su desarrollo todavía: aquí se irán documentando sus avances.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container grid grid-2" style="gap:32px; align-items:start;">
      <div class="card">
        <span class="tag">${esc(LAUNCH_STATUS)}</span>
        <h3 style="margin-top:16px;">Cuenta regresiva</h3>
        <div id="launchCountdown" style="margin:16px 0;"></div>
        <p style="font-size:.85rem; color:var(--ink-soft);">La fecha de lanzamiento se actualizará en este mismo espacio en cuanto esté confirmada.</p>
        <div class="form-section-title" style="margin-top:24px;">Quiero recibir novedades</div>
        <form id="newsletterForm">
          <div class="field"><label>Nombre *</label><input type="text" name="nombre" required><span class="err-msg"></span></div>
          <div class="field"><label>Correo *</label><input type="email" name="correo" required><span class="err-msg"></span></div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Quiero recibir novedades</button>
        </form>
        <div id="newsletterSuccess" style="display:none;" class="callout" style="margin-top:14px;">¡Listo! Te avisaremos apenas haya novedades del lanzamiento.</div>
        <div id="newsletterError" style="display:none; margin-top:10px; color:var(--alert); font-size:.85rem;"></div>
      </div>
      <div>
        <h3>Próximos sensores</h3>
        <div class="steps">
          ${LANZAMIENTOS.map((l,i) => `
          <div class="step">
            ${l.imagen_url ? `<img src="${esc(l.imagen_url)}" alt="${esc(l.titulo)}" style="width:100%; max-height:160px; object-fit:cover; border-radius:10px; margin-bottom:10px;">` : ""}
            <div class="step-dot" style="background:${l.estado==='disponible' ? 'var(--copper)' : 'var(--sand-2)'}; color:${l.estado==='disponible'?'#fff':'var(--ink-soft)'};">${l.estado==='disponible' ? icon("ic-check") : i+1}</div>
            <h4>${esc(l.titulo)} <span class="tag alt" style="margin-left:8px; font-size:.65rem;">${esc(estadoLanzamientoLabel(l.estado))}</span></h4>
            <p style="color:var(--ink-soft); margin:0; font-size:.9rem;">${esc(l.descripcion || "")}</p>
            ${l.fecha_estimada ? `<p class="mono" style="font-size:.72rem; color:var(--ink-soft); margin-top:4px;">Estimado: ${esc(l.fecha_estimada)}</p>` : ""}
          </div>`).join("")}
        </div>
      </div>
    </div>
  </section>
  `;
}
defineRoute("lanzamiento", renderLaunchPage);

function renderCountdown(targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  if(!window.LAUNCH_DATE){
    el.innerHTML = `<div class="badge demo" style="font-size:.78rem; padding:10px 16px;">Fecha de lanzamiento por confirmar</div>`;
    return;
  }
  const target = new Date(window.LAUNCH_DATE).getTime();
  function tick(){
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    el.innerHTML = `<div class="countdown">
      <div class="cd-box"><b>${d}</b><span>Días</span></div>
      <div class="cd-box"><b>${h}</b><span>Horas</span></div>
      <div class="cd-box"><b>${m}</b><span>Min</span></div>
      <div class="cd-box"><b>${s}</b><span>Seg</span></div>
    </div>`;
  }
  tick();
  clearInterval(window.__saveCountdownInterval);
  window.__saveCountdownInterval = setInterval(tick, 1000);
}

function initLaunchPage(){
  renderCountdown("launchCountdown");
  const form = $("#newsletterForm");
  if(!form) return;
  setupFormValidation(form, [['[name="nombre"]',{required:true}], ['[name="correo"]',{required:true,email:true}]]);
  form.addEventListener("validsubmit", async () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const errBox = $("#newsletterError");
    errBox.style.display = "none";
    try{
      await Api.suscribirNewsletter(data);
      form.style.display = "none";
      $("#newsletterSuccess").style.display = "block";
    }catch(e){
      errBox.textContent = e.message || "No pudimos guardar tu suscripción. Intenta nuevamente.";
      errBox.style.display = "block";
    }
  });
}

/* Contacto  */

function renderContactPage(){
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Contacto</div>
      <h1 style="font-size:clamp(2rem,4vw,2.6rem);">Hablemos</h1>
      <p class="lede">Escríbenos si tienes preguntas sobre el proyecto, quieres afiliar tu organización o necesitas soporte.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container grid grid-2" style="gap:32px; align-items:start;">
      <div class="form-card" id="contactFormWrap">
        <form id="contactForm" novalidate>
          <div class="field"><label>Nombre *</label><input type="text" name="nombre" required><span class="err-msg"></span></div>
          <div class="field"><label>Correo *</label><input type="email" name="correo" required><span class="err-msg"></span></div>
          <div class="field"><label>Asunto *</label><input type="text" name="asunto" required><span class="err-msg"></span></div>
          <div class="field"><label>Motivo</label>
            <select name="motivo"><option>Consulta general</option><option>Afiliar mi organización</option><option>Prensa</option><option>Soporte técnico</option><option>Otro</option></select>
          </div>
          <div class="field"><label>Mensaje *</label><textarea name="mensaje" required></textarea><span class="err-msg"></span></div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Enviar mensaje</button>
          <div id="contactError" style="display:none; margin-top:10px; color:var(--alert); font-size:.85rem;"></div>
        </form>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-icon">${icon("ic-mail")}</div>
          <h3 style="font-size:1rem;">Correo institucional</h3>
          <p style="color:var(--ink-soft); font-size:.88rem;">contacto@proyecto-save.cl <span class="reveal-note">(canal por habilitar)</span></p>
        </div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-icon">${icon("ic-phone")}</div>
          <h3 style="font-size:1rem;">Teléfono</h3>
          <p style="color:var(--ink-soft); font-size:.88rem;">Por definir</p>
        </div>
        <div class="card">
          <div class="card-icon">${icon("ic-pin")}</div>
          <h3 style="font-size:1rem;">Ubicación institucional</h3>
          <p style="color:var(--ink-soft); font-size:.88rem;">Santiago, Chile</p>
        </div>
      </div>
    </div>
  </section>`;
}
defineRoute("contacto", renderContactPage);

function initContactPage(){
  const form = $("#contactForm");
  if(!form) return;
  setupFormValidation(form, [
    ['[name="nombre"]', {required:true}],
    ['[name="correo"]', {required:true, email:true}],
    ['[name="asunto"]', {required:true}],
    ['[name="mensaje"]', {required:true}],
  ]);
  form.addEventListener("validsubmit", async () => {
    const data = Object.fromEntries(new FormData(form).entries());
    const errBox = $("#contactError");
    errBox.style.display = "none";
    try{
      await Api.enviarContacto(data);
      $("#contactFormWrap").innerHTML = `
        <div class="success-box">
          <div class="card-icon" style="margin:0 auto 20px;">${icon("ic-check")}</div>
          <h2>Mensaje enviado</h2>
          <p style="color:var(--ink-soft);">Gracias por escribirnos. Te responderemos a la brevedad.</p>
        </div>`;
    }catch(e){
      errBox.textContent = e.message || "No pudimos enviar tu mensaje. Intenta nuevamente.";
      errBox.style.display = "block";
    }
  });
}

/* Privacidad / Términos */

function renderLegalPage(title, note){
  return `
  <section class="container" style="padding-top:60px; max-width:760px;">
    <div class="eyebrow">${esc(title)}</div>
    <h1>${esc(title)}</h1>
    <div class="callout" style="margin:20px 0;">${esc(note)}</div>
    <p style="color:var(--ink-soft);">Este documento se completará con el detalle legal definitivo del proyecto SAVE. Mientras tanto, el sistema no publica información personal sensible y todos los formularios de este sitio solicitan únicamente los datos necesarios para dar curso a la solicitud correspondiente.</p>
  </section>`;
}
defineRoute("privacidad", () => renderLegalPage("Política de privacidad", "Documento pendiente de redacción legal final."));
defineRoute("terminos", () => renderLegalPage("Términos de uso", "Documento pendiente de redacción legal final."));

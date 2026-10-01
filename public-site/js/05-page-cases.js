let casesFilter = "Todos";

function caseCardHTML(c){
  return `<a href="#/caso/${c.id}" data-link class="card case-card" style="text-decoration:none; color:inherit; display:block;">
    ${c.imagenUrl ? `<img src="${esc(c.imagenUrl)}" alt="${esc(c.titulo)}" style="width:100%; height:150px; object-fit:cover; border-radius:10px; margin-bottom:12px;">` : ""}
    <div class="case-meta">
      <span class="tag ${c.factType.includes('Hecho') ? '' : 'alt'}">${esc(c.factType)}</span>
      <span class="tag alt">${esc(c.tipo)}</span>
    </div>
    <h3 style="font-size:1.05rem;">${esc(c.titulo)}</h3>
    <p style="color:var(--ink-soft); font-size:.85rem; display:flex; gap:14px; flex-wrap:wrap;">
      <span>${esc(c.fecha)}</span><span>·</span><span>${esc(c.lugar)}</span>
    </p>
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px; align-items:flex-start;">
      <span class="badge source">${esc(c.fuente)}</span>
      <span style="color:var(--copper-deep); font-weight:600; font-size:.85rem; display:inline-flex; align-items:center; gap:4px;">Ver detalle ${icon("ic-arrow")}</span>
    </div>
  </a>`;
}

function renderCasesList(){
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Casos documentados</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">Evidencia real, con fuente</h1>
      <p class="lede">Cada caso citado en este sitio proviene de una fuente pública verificable. Distinguimos siempre el hecho documentado del análisis o relación que hacemos con el problema que aborda SAVE — el análisis nunca se presenta como un hecho.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container">
      <div class="filter-row" id="caseFilters">
        ${CASE_TYPES.map(t => `<button class="filter-chip ${t===casesFilter?'active':''}" data-case-filter="${esc(t)}">${esc(t)}</button>`).join("")}
      </div>
      <div class="grid grid-3" id="caseGrid">
        ${CASES.filter(c => casesFilter==="Todos" || c.tipo===casesFilter).map(caseCardHTML).join("")}
      </div>
      <p class="reveal-note" style="margin-top:24px;">Este listado se irá ampliando a medida que se documenten nuevos casos con fuente verificable. No se incluyen relatos sin una fuente pública citable.</p>
    </div>
  </section>
  `;
}
defineRoute("casos", renderCasesList);

function renderCaseDetail(id){
  const c = CASES.find(x => String(x.id) === String(id));
  if(!c) return render404();
  return `
  <section class="container" style="padding-top:44px;">
    <div class="breadcrumb"><a href="#/casos" data-link>Casos documentados</a> / ${esc(c.titulo)}</div>
    ${c.imagenUrl ? `<img src="${esc(c.imagenUrl)}" alt="${esc(c.titulo)}" style="width:100%; max-height:340px; object-fit:cover; border-radius:14px; margin:16px 0;">` : ""}
    <div class="case-meta">
      <span class="tag ${c.factType.includes('Hecho') ? '' : 'alt'}">${esc(c.factType)}</span>
      <span class="tag alt">${esc(c.tipo)}</span>
    </div>
    <h1 style="font-size:clamp(1.6rem,3.5vw,2.3rem); max-width:820px;">${esc(c.titulo)}</h1>
    <div style="display:flex; gap:20px; flex-wrap:wrap; color:var(--ink-soft); font-size:.9rem; margin-bottom:32px;">
      <span>📅 ${esc(c.fecha)}</span>
      <span>📍 ${esc(c.lugar)}</span>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="container grid grid-2" style="gap:28px; align-items:start;">
      <div class="card">
        <h3 style="font-size:.95rem; text-transform:uppercase; letter-spacing:.03em; font-family:var(--mono); color:var(--ink-soft);">Hecho documentado</h3>
        <p style="font-size:.96rem;">${esc(c.hecho)}</p>
      </div>
      <div class="card" style="border-color:var(--copper-light);">
        <h3 style="font-size:.95rem; text-transform:uppercase; letter-spacing:.03em; font-family:var(--mono); color:var(--copper-deep);">Análisis — relación con SAVE</h3>
        <p style="font-size:.96rem; color:var(--ink-soft);">${esc(c.problema)}</p>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:20px; max-width:720px;">
        <h3 style="font-size:.95rem;">Fuente</h3>
        <p style="font-size:.9rem; color:var(--ink-soft); margin-bottom:8px;">${esc(c.fuente)}${c.fuenteDoi ? ' · DOI: '+esc(c.fuenteDoi) : ''}</p>
        <p style="font-size:.82rem; color:var(--ink-soft);">Fecha de publicación: ${esc(c.fechaPublicacion)}</p>
        ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-top:10px;">Ver fuente original ${icon("ic-arrow")}</a>` : `<p class="reveal-note">Enlace directo no disponible en esta fuente; cita completa arriba.</p>`}
      </div>
      <div style="margin-top:28px;"><a href="#/casos" data-link class="btn btn-ghost">← Volver a casos documentados</a></div>
    </div>
  </section>
  `;
}
defineRoute("caso", renderCaseDetail);

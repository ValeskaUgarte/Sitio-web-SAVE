let newsFilter = "Todas";

function newsFullCardHTML(n){
  return `<a href="#/noticia/${n.id}" data-link class="card card-boxed" style="text-decoration:none; color:inherit; display:block;">
    <span class="tag">${esc(n.categoria)}</span>
    <h3 style="margin-top:14px;">${esc(n.titulo)}</h3>
    <p style="color:var(--ink-soft); font-size:.88rem;">${esc(n.resumen)}</p>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; font-size:.78rem; color:var(--ink-soft);">
      <span>${esc(n.autor)} · ${esc(n.fecha)}</span>
      <span style="color:var(--copper-deep); font-weight:600; display:flex; align-items:center; gap:4px;">Leer más ${icon("ic-arrow")}</span>
    </div>
  </a>`;
}

function renderNewsList(){
  const cats = ["Todas", ...NEWS_CATEGORIES];
  const filtered = NEWS.filter(n => newsFilter==="Todas" || n.categoria===newsFilter);
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Noticias y actualizaciones</div>
      <h1 style="font-size:clamp(2rem,4vw,2.6rem);">Novedades del proyecto</h1>
      <p class="lede">Avances reales del desarrollo de SAVE, documentados a partir del informe de proyecto.</p>
    </div>
  </section>
  <section style="padding-top:24px;">
    <div class="container">
      <div class="filter-row">${cats.map(c => `<button class="filter-chip ${c===newsFilter?'active':''}" data-news-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="grid grid-3">${filtered.length ? filtered.map(newsFullCardHTML).join("") : '<div class="empty-state">Aún no hay noticias en esta categoría.</div>'}</div>
    </div>
  </section>`;
}
defineRoute("noticias", renderNewsList);

function initNewsPage(){
  $$("[data-news-filter]").forEach(btn => btn.addEventListener("click", () => {
    newsFilter = btn.dataset.newsFilter;
    $("#view").innerHTML = renderNewsList();
    initNewsPage();
  }));
}

function renderNewsDetail(id){
  const n = NEWS.find(x => x.id === id);
  if(!n) return render404();
  return `
  <section class="container" style="padding-top:44px; max-width:760px;">
    <div class="breadcrumb"><a href="#/noticias" data-link>Noticias</a> / ${esc(n.titulo)}</div>
    <span class="tag">${esc(n.categoria)}</span>
    <h1 style="margin-top:16px;">${esc(n.titulo)}</h1>
    <p style="color:var(--ink-soft); font-size:.88rem; margin-bottom:32px;">${esc(n.autor)} · ${esc(n.fecha)}</p>
    <p style="font-size:1.02rem;">${esc(n.contenido)}</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:24px;">
      ${n.tags.map(t => `<span class="tag alt">#${esc(t)}</span>`).join("")}
    </div>
    <div style="margin-top:32px;"><a href="#/noticias" data-link class="btn btn-ghost">← Volver a noticias</a></div>
  </section>`;
}
defineRoute("noticia", renderNewsDetail);

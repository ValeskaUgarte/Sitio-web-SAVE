let faqSearchTerm = "";

function faqItemHTML(f, i){
  return `<div class="faq-item" data-faq-index="${i}">
    <div class="faq-q" data-faq-toggle="${i}">
      <span>${esc(f.q)}</span>
      <span class="chev" style="font-family:var(--display); font-size:1.3rem; font-weight:400; line-height:1;">+</span>
    </div>
    <div class="faq-a"><div class="faq-a-inner">${esc(f.a)}</div></div>
  </div>`;
}

function renderHelpPage(){
  const term = faqSearchTerm.toLowerCase();
  const filtered = FAQ.filter(f => !term || f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term));
  const cats = ["Usuarios","Personas cercanas a un nodo","Empresas y personas","Tecnología"];
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Ayuda</div>
      <h1 style="font-size:clamp(2rem,4vw,2.6rem);">Preguntas frecuentes</h1>
      <p class="lede">Resuelve tus dudas sobre cómo funciona SAVE, qué hacer frente a una alerta y cómo afiliar tu organización.</p>
      <div style="position:relative; max-width:420px; margin-top:20px;">
        <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--ink-soft);">${icon("ic-search")}</span>
        <input type="text" id="faqSearch" placeholder="Buscar una pregunta..." value="${esc(faqSearchTerm)}"
          style="width:100%; padding:12px 14px 12px 40px; border-radius:999px; border:1.5px solid var(--line); background:var(--sand); font-family:var(--body);">
      </div>
    </div>
  </section>
  <section style="padding-top:24px;">
    <div class="container">
      ${term ? `
        <div id="faqList">${filtered.length ? filtered.map(faqItemHTML).join("") : '<div class="empty-state">No encontramos preguntas que coincidan con tu búsqueda.</div>'}</div>
      ` : cats.map(cat => `
        <h3 style="margin-top:36px;">${esc(cat)}</h3>
        <div>${FAQ.filter(f=>f.cat===cat).map((f) => faqItemHTML(f, FAQ.indexOf(f))).join("")}</div>
      `).join("")}
    </div>
  </section>
  `;
}
defineRoute("ayuda", renderHelpPage);

function initHelpPage(){
  const search = $("#faqSearch");
  if(search){
    search.addEventListener("input", (e) => {
      faqSearchTerm = e.target.value;
      const pos = search.selectionStart;
      $("#view").innerHTML = renderHelpPage();
      initHelpPage();
      const s2 = $("#faqSearch");
      if(s2){ s2.focus(); s2.setSelectionRange(pos,pos); }
    });
  }
  $$("[data-faq-toggle]").forEach(el => el.addEventListener("click", () => {
    el.closest(".faq-item").classList.toggle("open");
  }));
}

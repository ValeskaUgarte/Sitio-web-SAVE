/* Helpers */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const icon = (name, cls="") => `<svg class="icon ${cls}"><use href="#${name}"/></svg>`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function ls_get(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function ls_set(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch(e){ console.error("storage error", e); return false; }
}
function genId(prefix){
  const n = Math.floor(100000 + Math.random()*900000);
  const y = new Date().getFullYear();
  return `${prefix}-${y}-${n}`;
}
function scrollTop(){ window.scrollTo({top:0, behavior:"instant"}); }

function validateField(input, rules){
  const wrap = input.closest(".field");
  let ok = true, msg = "";
  const v = input.value.trim();
  if(rules.required && !v){ ok=false; msg="Este campo es obligatorio."; }
  else if(rules.email && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ ok=false; msg="Ingresa un correo válido."; }
  else if(rules.phone && v && !/^[+\d][\d\s-]{6,}$/.test(v)){ ok=false; msg="Ingresa un teléfono válido."; }
  if(wrap){
    wrap.classList.toggle("error", !ok);
    const em = wrap.querySelector(".err-msg");
    if(em) em.textContent = msg;
  }
  return ok;
}

function setupFormValidation(formEl, schema){
  formEl.addEventListener("submit", function(e){
    e.preventDefault();
    let allOk = true;
    schema.forEach(([selector, rules]) => {
      const input = formEl.querySelector(selector);
      if(!input) return;
      if(input.type === "checkbox"){
        const wrap = input.closest(".checkbox-row") || input.closest(".field");
        const ok = !rules.required || input.checked;
        if(wrap) wrap.style.outline = ok ? "none" : "1.5px solid var(--alert)";
        if(!ok) allOk = false;
        return;
      }
      if(!validateField(input, rules)) allOk = false;
    });
    if(allOk) formEl.dispatchEvent(new CustomEvent("validsubmit"));
  });
}

/* Router */

const routes = {};
function defineRoute(path, renderFn){ routes[path] = renderFn; }

function currentRoute(){
  const hash = location.hash.replace(/^#\/?/, "");
  return hash || "inicio";
}

function router(){
  const full = currentRoute();
  const [base, ...rest] = full.split("/");
  const param = rest.join("/");
  const view = $("#view");
  try{
    const html = routes[base] ? routes[base](param) : render404();
    view.innerHTML = html;
    scrollTop();
    highlightNav(base);
    closeMobileMenu();
    afterRender(base, param);
  }catch(err){
    
    console.error("Error al mostrar la página:", err);
    view.innerHTML = `
      <div style="padding:100px 20px; text-align:center;">
        <h2>Esta página no se pudo mostrar</h2>
        <p style="color:var(--ink-soft); max-width:52ch; margin:12px auto 24px;">
          Ocurrió un error inesperado. Prueba recargar la página; si el problema sigue, revisa la consola del navegador (clic derecho → Inspeccionar → Console) para ver el detalle.
        </p>
        <button class="btn btn-primary" onclick="location.reload()">Recargar</button>
      </div>`;
  }
}

function highlightNav(base){
  $$("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === base));
  $$("#mobileMenu a").forEach(a => {
    const r = a.getAttribute("href").replace("#/","");
    a.classList.toggle("active", r === base);
  });
}

function closeMobileMenu(){
  $("#mobileMenu").classList.remove("open");
}

function render404(){
  return `<section class="container" style="padding:120px 0; text-align:center;">
    <div class="eyebrow">Página no encontrada</div>
    <h1>Esta página no existe</h1>
    <p style="color:var(--ink-soft)">Puede que el enlace esté mal escrito o la sección aún no esté disponible.</p>
    <a href="#/inicio" data-link class="btn btn-primary">Volver al inicio</a>
  </section>`;
}

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

let CURRENT_ADMIN = null;

function toast(msg, isError=false){
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " error" : "");
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function openModal(html){
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "activeModal";
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener("click", (e) => { if(e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  return overlay;
}
function closeModal(){
  const el = document.getElementById("activeModal");
  if(el) el.remove();
}

function fmtDate(s){
  if(!s) return "—";
  try{
    const d = new Date(s.replace(" ", "T"));
    return d.toLocaleString("es-CL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
  }catch(e){ return s; }
}

async function handleImageUpload(inputEl, previewImgEl, hiddenInputEl){
  const file = inputEl.files[0];
  if(!file) return;
  try{
    const url = await apiUpload(file);
    hiddenInputEl.value = url;
    previewImgEl.src = url;
    previewImgEl.style.display = "block";
    toast("Imagen subida correctamente.");
  }catch(e){
    toast(e.message || "Error al subir la imagen.", true);
  }
}

/* Router */

const adminRoutes = {};
function defineAdminRoute(path, fn){ adminRoutes[path] = fn; }

function adminRouter(){
  const hash = location.hash.replace(/^#\/?/, "") || "resumen";
  const [base] = hash.split("/");
  $$("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === base));
  const main = $("#mainArea");
  if(adminRoutes[base]){
    Promise.resolve(adminRoutes[base]()).catch(err => {
      main.innerHTML = `<div class="page-head"><h1>Error</h1><p>${esc(err.message || "Ocurrió un error al cargar esta sección.")}</p></div>`;
    });
  } else {
    main.innerHTML = `<div class="page-head"><h1>Sección no encontrada</h1></div>`;
  }
}

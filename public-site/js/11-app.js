function initCasesPage(){
  $$("[data-case-filter]").forEach(btn => btn.addEventListener("click", () => {
    casesFilter = btn.dataset.caseFilter;
    $("#view").innerHTML = renderCasesList();
    initCasesPage();
  }));
}

function afterRender(base, param){
  if(base === "inicio"){ renderCountdown("homeCountdown"); initHomeMiniMap(); initSolucionPitch(); }
  if(base === "red-nodos") initNodesPage();
  if(base === "empresas") initCompaniesPage();
  if(base === "casos") initCasesPage();
  if(base === "ayuda") initHelpPage();
  if(base === "noticias") initNewsPage();
  if(base === "lanzamiento") initLaunchPage();
  if(base === "contacto") initContactPage();
  if(base === "solicitar") initRequestPage();
}

/* App bootstrap */

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if(link){
    // let the browser handle hash navigation normally; just ensure menu closes
    closeMobileMenu();
  }
});

$("#burgerBtn").addEventListener("click", () => {
  $("#mobileMenu").classList.toggle("open");
});

$("#themeToggle").addEventListener("click", toggleTheme);

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  const logoSrc = "img/logo-save-transparent.png";
  $("#logoImg").src = logoSrc;
  $("#footerLogo").src = logoSrc;
  $("#copyrightYear").textContent = `SAVE — Sistema de Alerta Vital Por Entornos © ${new Date().getFullYear()}`;

  // Si por cualquier motivo la carga inicial nunca termina (backend caído, problema de red, error inesperado), no dejamos el spinner girando para
  // siempre: mostramos un mensaje claro con un botón para reintentar.

  let yaArranco = false;
  const failSafeTimer = setTimeout(() => {
    if (yaArranco) return;
    const view = $("#view");
    if (view) {
      view.innerHTML = `
        <div style="padding:100px 20px; text-align:center;">
          <h2>El sitio está tardando más de lo normal en cargar</h2>
          <p style="color:var(--ink-soft); max-width:48ch; margin:12px auto 24px;">
            Puede ser un problema de conexión con el servidor. Intenta recargar la página; si el problema sigue, verifica que el backend esté corriendo.
          </p>
          <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
        </div>`;
    }
  }, 15000);

  // Los datos reales (nodos, empresas, noticias, casos, lanzamientos, producto) se cargan desde el backend antes de dibujar cualquier ruta, 
  // para que las páginas no se rendericen vacías mientras llega la respuesta.

  cargarDatosIniciales().finally(() => {
    yaArranco = true;
    clearTimeout(failSafeTimer);
    router();
  });
});

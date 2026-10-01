/* Página de inicio. La figura del encabezado ("La solución", recorrido de
   una alerta) está en 03b-solucion-pitch.js: solHomeHTML() la dibuja y
   initSolucionPitch() la anima (se llama desde 11-app.js). */

function heroOrbitChip(key, label, posClass){
  const items = PRODUCTO_ITEMS[key] || [];
  const withImg = items.find(i => i.imagen_url);
  const meta = PRODUCT_META[key] || {};
  return `<div class="hero-orbit-item ${posClass}">
    <div class="hoi-photo">
      ${withImg ? `<img src="${esc(withImg.imagen_url)}" alt="${esc(label)}">` : `<span class="placeholder-icon">${icon(meta.icon||"ic-node")}</span>`}
    </div>
    <span>${esc(label)}</span>
  </div>`;
}

// Logo grande al centro, y las tres piezas del sistema orbitando alrededor,
// como el propio ícono de SAVE, cada foto se difumina en los bordes (sin
// recorte duro de círculo ni caja) para que se vea integrada, no pegada.

function heroOrbitHTML(){
  return `<div class="hero-orbit">
    <img class="hero-orbit-logo" src="img/logo-save-transparent.png" alt="SAVE">
    ${heroOrbitChip("nodo_led", "Nodo SAVE", "hoi-1")}
    ${heroOrbitChip("pulsera", "Pulsera SAVE", "hoi-2")}
    ${heroOrbitChip("app", "App móvil", "hoi-3")}
  </div>`;
}

function statStripHTML(){
  const stats = [
    { n:"13,5", u:"min", label:"mediana de respuesta del SAMU en Santiago", src:"Mayanz et al., 2009" },
    { n:"&lt;10%", u:"", label:"sobrevivencia al alta por PCR extrahospitalario", src:"SciELO, 2022" },
    { n:"57%", u:"", label:"llegó al servicio de urgencia por sus propios medios", src:"SciELO, 2022" },
    { n:"~10s", u:"", label:"tiempo de activación automática que busca SAVE", src:"Meta de diseño del proyecto" },
  ];
  return `<section class="stat-strip">
    <div class="container stat-strip-grid">
      ${stats.map(s => `<div class="stat-strip-item">
        <b>${s.n}${s.u ? `<i>${s.u}</i>` : ""}</b>
        <span class="ssi-label">${s.label}</span>
        <span class="ssi-src">${s.src}</span>
      </div>`).join("")}
    </div>
  </section>`;
}

function renderHome(){
  return `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="eyebrow">SAVE — Sistema de Alerta Vital Por Entornos</div>
        <h1>SAVE</h1>
        <p class="lede">Una solución tecnológica orientada a detectar situaciones de emergencia médica y facilitar que quienes se encuentran alrededor puedan reconocerlas y actuar, incluso cuando la persona afectada no puede pedir ayuda por sí misma.</p>
        <div class="hero-ctas">
          <a href="#/solicitar" data-link class="btn btn-primary">Solicitar el servicio</a>
          <a href="#/como-funciona" data-link class="btn btn-outline">Conocer cómo funciona</a>
        </div>
      </div>
      <div class="hero-art">
        ${heroOrbitHTML()}
      </div>
    </div>
  </section>

  <section class="sol-home-section">
    <div class="container">
      ${solHomeHTML()}
    </div>
  </section>

  <section class="pitch-video-section">
    <div class="container">
      <div class="section-head center">
        <div class="eyebrow">Nuestro pitch</div>
        <h2>Conoce SAVE</h2>
      </div>
      <div class="pitch-video-frame">
        <iframe src="https://www.youtube.com/embed/zaWf2RaqufU" title="Pitch de SAVE — Sistema de Alerta Vital Por Entornos" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
    </div>
  </section>

  ${statStripHTML()}

  <section id="productoHome">
    <div class="container">
      <div class="section-head center">
        <div class="eyebrow">Nuestro producto</div>
        <h2>La pulsera SAVE, la app de monitoreo y el nodo móvil</h2>
        <p style="color:var(--ink-soft)">Tres piezas del mismo sistema, pensadas para funcionar juntas: un dispositivo que monitorea, una aplicación que muestra el estado en tiempo real, y una forma de que cualquier persona amplíe la red de apoyo desde su propio teléfono.</p>
      </div>
      ${productShowcaseHTML()}
      <div style="margin-top:32px; display:flex; gap:14px; flex-wrap:wrap; justify-content:center;">
        <a href="#/solicitar" data-link class="btn btn-primary">Cotizar la pulsera SAVE</a>
        <a href="#/como-funciona" data-link class="btn btn-outline">Ver cómo funciona el sistema completo</a>
      </div>
    </div>
  </section>

  <section style="background:var(--sand); border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">El problema</div>
        <h2>El entorno no sabe que algo está pasando</h2>
        <p style="color:var(--ink-soft)">En una emergencia médica, la persona afectada suele no estar en condiciones de pedir ayuda. Mientras tanto, quienes están presentes pueden no reconocer que se trata de una emergencia, o interpretarla de forma equivocada, y los minutos que se pierden son los más determinantes para la sobrevivencia.</p>
      </div>
      <div class="grid grid-4">
        <div class="card"><div class="card-icon">${icon("ic-search")}</div><h3>Falta de reconocimiento</h3><p style="color:var(--ink-soft); font-size:.9rem;">Sin señales claras, una emergencia puede pasar inadvertida entre el ruido y el flujo de un espacio público.</p></div>
        <div class="card"><div class="card-icon">${icon("ic-users")}</div><h3>Mala interpretación</h3><p style="color:var(--ink-soft); font-size:.9rem;">El efecto espectador dificulta que alguien se decida a actuar cuando nadie más lo hace.</p></div>
        <div class="card"><div class="card-icon">${icon("ic-alert")}</div><h3>Ausencia de ayuda</h3><p style="color:var(--ink-soft); font-size:.9rem;">Cuando la persona está sola, no hay quien inicie ni siquiera la ayuda más básica.</p></div>
        <div class="card"><div class="card-icon">${icon("ic-clock")}</div><h3>Demora en la respuesta</h3><p style="color:var(--ink-soft); font-size:.9rem;">El tiempo de traslado se suma a la espera de contacto telefónico con la línea de emergencia.</p></div>
      </div>
      <div style="margin-top:36px;"><a href="#/casos" data-link class="btn btn-ghost">Ver casos documentados</a></div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="grid grid-2" style="align-items:center; gap:56px;">
        <div>
          <div class="eyebrow">¿Qué es SAVE?</div>
          <h2>Tecnología wearable y de entorno, conectadas</h2>
          <p style="color:var(--ink-soft)">SAVE combina un dispositivo wearable, sensores fisiológicos, procesamiento de datos local, un sistema de alerta en el entorno físico, una red de nodos distribuidos y comunicación con infraestructura de salud, para reducir el tiempo entre el inicio de una emergencia y la primera acción de ayuda.</p>
        </div>
        <div class="grid" style="gap:12px;">
          ${["Dispositivo wearable","Sensores fisiológicos","Procesamiento de datos local","Sistema de alerta local","Nodos distribuidos","Comunicación con infraestructura","Notificación al centro de salud"].map(t => `
          <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; background:var(--sand); border:1px solid var(--line); border-radius:10px;">
            <span style="color:var(--copper);">${icon("ic-check")}</span><span style="font-size:.92rem; font-weight:500;">${t}</span>
          </div>`).join("")}
        </div>
      </div>
    </div>
  </section>

  <section style="background:var(--sand); border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
    <div class="container">
      <div class="section-head center">
        <div class="eyebrow">¿Cómo funciona?</div>
        <h2>Del monitoreo continuo a la respuesta del entorno</h2>
      </div>
      <div class="steps" style="max-width:760px; margin:0 auto;">
        ${[
          ["El dispositivo monitorea","La pulsera registra continuamente los signos vitales de la persona."],
          ["El sistema identifica una condición de riesgo","El algoritmo, ejecutado localmente, detecta una anomalía sostenida."],
          ["Se inicia una ventana de cancelación","La persona puede cancelar la alerta si se trata de una falsa alarma."],
          ["Si la alerta continúa, se activa el nodo","Sin cancelación, el nodo SAVE del entorno se activa automáticamente."],
          ["El nodo genera señales visuales y sonoras","Paneles LED y alertas de audio con instrucciones básicas para el entorno."],
          ["Las personas cercanas identifican la emergencia","Las señales del nodo hacen explícito que existe una emergencia real."],
          ["La información se envía al centro de salud","La notificación se envía en paralelo, sin intervención humana."],
          ["Se facilita la respuesta ante la emergencia","El entorno y el centro de salud actúan con la información ya disponible."],
        ].map((s,i) => `
        <div class="step">
          <div class="step-dot">${i+1}</div>
          <h4>${s[0]}</h4>
          <p style="color:var(--ink-soft); font-size:.92rem; margin:0;">${s[1]}</p>
        </div>`).join("")}
      </div>
      <div style="text-align:center; margin-top:20px;"><a href="#/como-funciona" data-link class="btn btn-outline">Ver el flujo completo</a></div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Emergencias contempladas</div>
        <h2>Tres focos principales, un caso secundario</h2>
      </div>
      <div class="grid grid-4">
        <div class="card"><div class="card-icon">${icon("ic-heart")}</div><h3>Ataque cardíaco</h3><p style="color:var(--ink-soft); font-size:.88rem;">Detección de anomalías cardíacas compatibles con un posible infarto agudo al miocardio.</p></div>
        <div class="card"><div class="card-icon">${icon("ic-brain")}</div><h3>ACV</h3><p style="color:var(--ink-soft); font-size:.88rem;">Emergencia tiempo-dependiente: la rapidez de reconocimiento incide directamente en la sobrevivencia.</p></div>
        <div class="card"><div class="card-icon">${icon("ic-pulse")}</div><h3>Crisis epiléptica</h3><p style="color:var(--ink-soft); font-size:.88rem;">Detección de patrones fisiológicos compatibles con una crisis convulsiva.</p></div>
        <div class="card secondary"><span class="tag alt" style="margin-bottom:12px;">Categoría secundaria</span><h3>Arritmia</h3><p style="color:var(--ink-soft); font-size:.88rem;">Contemplada como caso secundario dentro de la detección cardíaca del sistema.</p></div>
      </div>
    </div>
  </section>

  <section style="background:var(--sand); border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
    <div class="container">
      <div class="grid grid-2" style="align-items:center; gap:48px;">
        <div>
          <div class="eyebrow">Red SAVE</div>
          <h2>Una red de nodos en paraderos, Metro, empresas e instituciones</h2>
          <p style="color:var(--ink-soft)">La red SAVE está pensada para instalarse en puntos estratégicos de alta afluencia: paraderos, estaciones de Metro, empresas afiliadas, instituciones y otros espacios públicos. El mapa de la red se irá completando con datos reales de ubicación.</p>
          <a href="#/red-nodos" data-link class="btn btn-primary">Explorar la red</a>
        </div>
        <div class="map-wrap">
          <div id="homeMiniMap" class="leaflet-map short"></div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Empresas afiliadas</div>
        <h2>Organizaciones que suman su espacio a la red SAVE</h2>
      </div>
      <div class="grid grid-4">
        ${COMPANIES.slice(0,4).map(companyCardHTML).join("")}
      </div>
      <div style="margin-top:32px; display:flex; gap:14px; flex-wrap:wrap;">
        <a href="#/empresas" data-link class="btn btn-ghost">Ver empresas afiliadas</a>
        <a href="#/solicitar" data-link class="btn btn-outline">¿Quieres incorporar SAVE a tu organización?</a>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="launch-showcase">
        <div class="launch-showcase-inner">
          <div class="eyebrow">${icon("ic-rocket")} Próximos lanzamientos</div>
          <h2>La escalabilidad de SAVE</h2>
          <p style="color:rgba(255,255,255,.85); max-width:60ch;">${esc(LAUNCH_STATUS)}. Estos son los próximos sensores que ampliarán el sistema, aún sin desarrollo iniciado.</p>
          <div id="homeCountdown" style="margin-top:8px;"></div>
          <div class="launch-grid">
            ${LANZAMIENTOS.filter(l => l.destacado_home).slice(0,4).map(l => `
              <div class="launch-chip">
                ${l.imagen_url ? `<img src="${esc(l.imagen_url)}" alt="${esc(l.titulo)}" style="width:100%; height:90px; object-fit:cover; border-radius:8px; margin-bottom:8px;">` : ""}
                <span class="launch-status">${esc(estadoLanzamientoLabel(l.estado))}</span>
                <h4>${esc(l.titulo)}</h4>
                <p>${esc(l.descripcion || "")}</p>
              </div>
            `).join("")}
          </div>
          <div style="margin-top:28px;">
            <a href="#/lanzamiento" data-link class="btn" style="background:#fff; color:var(--copper-deep); border:none;">Ver todos los próximos lanzamientos</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Noticias y actualizaciones</div>
        <h2>Últimas novedades del proyecto</h2>
      </div>
      <div class="grid grid-3">
        ${NEWS.slice(0,3).map(newsCardHTML).join("")}
      </div>
    </div>
  </section>
  `;
}

function estadoLanzamientoLabel(estado){
  const map = { proximamente: "Próximamente", en_desarrollo: "En desarrollo", disponible: "Disponible" };
  return map[estado] || estado || "Próximamente";
}

const PRODUCT_META = {
  nodo_led: { titulo: "Nodo SAVE (panel LED de aviso)", icon: "ic-alert", destacado: true,
    features: ["Recibe la alerta y avisa al entorno con luz y sonido", "Muestra instrucciones básicas para ayudar a la persona", "El corazón del sistema: une a las personas alrededor"] },
  pulsera: { titulo: "Pulsera SAVE", icon: "ic-watch",
    features: ["Frecuencia cardíaca, SpO₂, temperatura y ECG", "Botón de cancelación en la propia muñeca", "Comunicación por Bluetooth de baja energía"] },
  app: { titulo: "App de monitoreo personal", icon: "ic-pulse",
    features: ["Signos vitales en tiempo real desde el celular", "Historial de alertas y estado del dispositivo", "Notificación directa al contacto de emergencia"] },
  nodo_movil: { titulo: "Nodo móvil (celular)", icon: "ic-node",
    features: ["Convierte cualquier teléfono en un nodo de la red", "No requiere instalar hardware físico", "Ideal para juntas de vecinos, condominios y comunidades"] },
};

function productShowcaseHTML(){
  return `<div class="product-showcase">
    ${Object.keys(PRODUCT_META).map(key => {
      const meta = PRODUCT_META[key];
      const items = (PRODUCTO_ITEMS[key] || []);
      const img = items.find(i => i.imagen_url);
      return `<div class="product-card${meta.destacado ? ' product-card-featured' : ''}">
        ${meta.destacado ? `<span class="product-featured-badge">${icon("ic-heart")} Lo más importante del sistema</span>` : ""}
        <div class="product-media">
          ${img ? `<img src="${esc(img.imagen_url)}" alt="${esc(meta.titulo)}">`
                : `<span class="placeholder-icon">${icon(meta.icon)}</span>`}
        </div>
        <div class="product-card-body">
          <h3>${esc(meta.titulo)}</h3>
          <p style="color:var(--ink-soft); font-size:.88rem; margin:0;">${esc((items[0] && items[0].descripcion) || "")}</p>
          <ul class="product-feature-list">
            ${meta.features.map(f => `<li>${icon("ic-check")}${esc(f)}</li>`).join("")}
          </ul>
        </div>
      </div>`;
    }).join("")}
  </div>`;
}

function companyCardHTML(c){
  return `<div class="card ${c.demo?"secondary":""}">
    <div class="card-icon" style="background:${c.demo?"var(--sand-2)":"var(--copper)"}; color:${c.demo?"var(--ink-soft)":"#fff"};">${icon("ic-building")}</div>
    ${c.demo ? '<span class="badge demo" style="margin-bottom:10px;">Plantilla</span>' : ""}
    <h3>${esc(c.nombre)}</h3>
    <p style="color:var(--ink-soft); font-size:.85rem;">${esc(c.descripcion)}</p>
    <span class="tag alt">${esc(c.categoria)}</span>
  </div>`;
}

function newsCardHTML(n){
  return `<a href="#/noticia/${n.id}" data-link class="card" style="text-decoration:none; color:inherit; display:block;">
    <span class="tag">${esc(n.categoria)}</span>
    <h3 style="margin-top:14px;">${esc(n.titulo)}</h3>
    <p style="color:var(--ink-soft); font-size:.88rem;">${esc(n.resumen)}</p>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
      <span class="mono" style="font-size:.72rem; color:var(--ink-soft);">${esc(n.fecha)}</span>
      <span style="color:var(--copper-deep); font-weight:600; font-size:.85rem; display:flex; align-items:center; gap:4px;">Leer más ${icon("ic-arrow")}</span>
    </div>
  </a>`;
}
defineRoute("inicio", renderHome);
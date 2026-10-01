function renderAbout(){
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Quiénes somos</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">Conectamos tecnología, alertas y entorno</h1>
      <p class="lede">SAVE nace para cerrar la brecha entre el inicio de una emergencia médica y el momento en que alguien, a metros de distancia, se da cuenta de lo que está pasando.</p>
    </div>
  </section>

  <section>
    <div class="container grid grid-2" style="gap:48px;">
      <div class="card card-boxed">
        <div class="eyebrow">Sobre SAVE</div>
        <h3>Origen y propósito</h3>
        <p style="color:var(--ink-soft); font-size:.94rem;">SAVE es un proyecto tecnológico dirigido por Valeska Ugarte, orientado a la detección automática y temprana de emergencias médicas en espacios cotidianos. Nace de una premisa central: el recurso más valioso en una emergencia no es el equipo médico que llega minutos después, sino la persona que ya está a pocos metros de distancia. El propósito de SAVE no es reemplazar la respuesta médica profesional, sino organizar y acelerar la respuesta humana que ya existe en el entorno.</p>
      </div>
      <div class="card card-boxed">
        <div class="eyebrow">Nuestra misión</div>
        <h3>Reducir el tiempo de reconocimiento</h3>
        <p style="color:var(--ink-soft); font-size:.94rem;">Reducir el tiempo que transcurre entre una emergencia médica y su reconocimiento por parte del entorno, activando de forma automática las señales necesarias para que quienes están cerca puedan actuar, mientras el centro de salud ya fue notificado.</p>
      </div>
      <div class="card card-boxed">
        <div class="eyebrow">Nuestra visión</div>
        <h3>Una red de espacios preparados</h3>
        <p style="color:var(--ink-soft); font-size:.94rem;">Proyectamos una red de espacios —hogares, paraderos, estaciones de Metro, empresas e instituciones— equipados para reconocer y responder ante situaciones médicas críticas, sin depender de que la persona afectada pueda pedir ayuda por sí misma.</p>
      </div>
      <div class="card card-boxed">
        <div class="eyebrow">El problema</div>
        <h3>Reconocimiento, interpretación y demora</h3>
        <p style="color:var(--ink-soft); font-size:.94rem;">La persona afectada suele no poder pedir ayuda, los familiares están lejos, y quienes están físicamente presentes muchas veces no intervienen porque no saben que hay una emergencia real. A esto se suma el tiempo de traslado y de contacto con los servicios de emergencia. <a href="#/casos" data-link style="color:var(--copper-deep); font-weight:600;">Ver la evidencia documentada →</a></p>
      </div>
    </div>
  </section>

  <section style="background:var(--sand); border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Tecnología</div>
        <h2>Los componentes principales del sistema</h2>
        <p style="color:var(--ink-soft)">Sin inventar funcionalidades adicionales: estos son los componentes ya definidos en la arquitectura técnica del proyecto.</p>
      </div>
      <div class="grid grid-4">
        ${TECH_COMPONENTS.map(t => {
          const img = componentImageUrl(t.nombre);
          return `
        <div class="card">
          ${img
            ? `<div class="component-photo"><img src="${esc(img)}" alt="${esc(t.nombre)}"></div>`
            : `<div class="card-icon">${icon(t.icon)}</div>`}
          <h3 style="font-size:1rem;">${esc(t.nombre)}</h3>
          <p style="color:var(--ink-soft); font-size:.85rem;">${esc(t.desc)}</p>
        </div>`;
        }).join("")}
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Equipo</div>
        <h2>Las personas detrás de SAVE</h2>
      </div>
      <div class="grid grid-4">
        ${TEAM.length ? TEAM.map(p => `
        <div class="card card-boxed" style="text-align:center;">
          ${p.foto_url
            ? `<div style="width:72px; height:72px; border-radius:50%; overflow:hidden; margin:0 auto 16px;"><img src="${esc(p.foto_url)}" alt="${esc(p.nombre)}" style="width:100%; height:100%; object-fit:cover;"></div>`
            : `<div style="width:72px; height:72px; border-radius:50%; background:var(--copper); color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-family:var(--display); font-size:1.4rem; font-weight:700;">${esc((p.nombre||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase())}</div>`}
          <h3 style="font-size:1rem;">${esc(p.nombre)}</h3>
          <p style="color:var(--ink-soft); font-size:.85rem;">${esc(p.rol||"")}</p>
        </div>`).join("") : `
        <div class="card card-boxed secondary" style="text-align:center; grid-column:1/-1;">
          <div style="width:72px; height:72px; border-radius:50%; background:var(--sand-2); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--ink-soft);">${icon("ic-users")}</div>
          <h3 style="font-size:1rem; color:var(--ink-soft);">Equipo por cargar</h3>
          <p style="color:var(--ink-soft); font-size:.85rem;">Se agrega desde el panel de administración → Equipo.</p>
        </div>`}
      </div>
    </div>
  </section>
  `;
}
defineRoute("quienes-somos", renderAbout);

function renderHowItWorks(){
  const phases = [
    { fase:"Fase 1 — Monitoreo continuo", tiempo:"Continuo", nombre:"La pulsera detecta", fallback:"img/flujo-2-pulsera.jpg",
      desc:"La pulsera registra continuamente la frecuencia cardíaca y la saturación de oxígeno. El algoritmo corre localmente en el ESP32, sin necesidad de conectividad permanente." },
    { fase:"Fase 2 — Detección y pre-alerta", tiempo:"0–15 segundos", nombre:"La persona", fallback:"img/flujo-1-persona.jpg",
      desc:"Al detectar una anomalía confirmada durante 15 segundos, la pulsera activa una vibración. La persona tiene esos 15 segundos para cancelar la alerta si se trata de una falsa alarma." },
    { fase:"Fase 3 — Activación multicanal", tiempo:"Segundo 15", nombre:"El nodo se activa", fallback:"img/flujo-3-nodo.jpg",
      desc:"Sin cancelación, el nodo del entorno activa paneles LED. La alerta queda contenida al entorno físico inmediato, con instrucciones de voz y en pantalla para que las personas presentes puedan prestar ayuda." },
    { fase:"Fase 4 — Orientación activa", tiempo:"Hasta la resolución", nombre:"Aviso al entorno", fallback:"img/flujo-4-contacto.jpg",
      desc:"El sistema entrega instrucciones adaptadas al tipo de evento y permanece activo hasta la cancelación manual o la llegada del servicio de emergencia. El centro de salud ya fue notificado desde el segundo 15, en paralelo." },
  ];
  return `
  <section class="hero" style="padding-bottom:0;">
    <div class="container">
      <div class="eyebrow">Cómo funciona</div>
      <h1 style="font-size:clamp(2rem,4vw,2.8rem);">De la muñeca al entorno, en segundos</h1>
      <p class="lede">SAVE fue diseñado para que ninguna de sus cuatro acciones dependa de que otra ocurra primero: el aviso al entorno y la notificación al centro de salud se activan en paralelo.</p>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="phase-list">
        ${phases.map((p,i) => `
        <div class="phase-item">
          <div class="phase-photo"><img src="${esc(recorridoImageUrl(p.nombre, p.fallback))}" alt="${esc(p.fase)}"></div>
          <div class="phase-text">
            <div class="phase-num">${i+1}</div>
            <span class="time">${esc(p.tiempo)}</span>
            <h4>${esc(p.fase)}</h4>
            <p style="color:var(--ink-soft); margin:0;">${esc(p.desc)}</p>
          </div>
        </div>`).join("")}
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">El recorrido de una alerta</div>
        <h2>Así se ve el proceso, paso a paso</h2>
      </div>
      <div class="flow-strip">
        ${FLOW_PHOTOS.map((f,i) => `
        <div class="flow-strip-item">
          <div class="flow-photo"><span class="flow-step-num">${i+1}</span><img src="${esc(recorridoImageUrl(f.title, f.img))}" alt="${esc(f.title)}"></div>
          <div class="flow-caption"><b>${esc(f.title)}</b><span>${esc(f.desc)}</span></div>
        </div>`).join("")}
      </div>
    </div>
  </section>

  <section style="background:var(--sand); border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Diagrama técnico</div>
        <h2>Persona → wearable → nodo → entorno → centro de salud</h2>
      </div>
      <div class="card" style="overflow-x:auto;">
        ${flowDiagramSVG()}
      </div>
      <div class="callout" style="margin-top:24px;">
        <b>Lo que SAVE no es:</b> SAVE no es un sistema de diagnóstico médico y no certifica que una persona esté sufriendo un evento determinado. Detecta señales compatibles con una emergencia y activa una respuesta de precaución; la decisión clínica sigue siendo humana, bajo atención médica profesional.
      </div>
    </div>
  </section>
  `;
}
defineRoute("como-funciona", renderHowItWorks);

/* Fotos/ilustraciones ya cargadas en public-site/img/, en el orden del
   recorrido de una alerta. Si más adelante alguna se reemplaza, basta con
   subir el archivo nuevo con el mismo nombre. */
   
const FLOW_PHOTOS = [
  { img:"img/flujo-1-persona.jpg", title:"La persona", desc:"Sufre una emergencia en un espacio cotidiano." },
  { img:"img/flujo-2-pulsera.jpg", title:"La pulsera detecta", desc:"Mide BPM, SpO₂ y detecta la anomalía." },
  { img:"img/flujo-3-nodo.jpg", title:"El nodo se activa", desc:"Recibe la alerta y enciende el panel LED." },
  { img:"img/flujo-3b-monitor.jpg", title:"Panel de monitoreo", desc:"Muestra la ubicación y las mediciones en vivo." },
  { img:"img/flujo-4-contacto.jpg", title:"Aviso al entorno", desc:"Las personas cercanas se enteran y se acercan a ayudar." },
  { img:"img/flujo-5-hospital.jpg", title:"Centro de salud", desc:"Recibe la notificación en paralelo, sin llamadas." },
  { img:"img/flujo-6-ambulancia.png", title:"Llega la ayuda", desc:"La ambulancia llega y los paramédicos asisten." },
];

function flowDiagramSVG(){
  const nodes = ["Persona","Wearable","Sensado","Procesamiento","Condición de riesgo","Ventana de cancelación","Nodo SAVE","Alerta al entorno","Comunicación","Centro de salud"];
  const w = Math.max(900, nodes.length*140), h = 160;
  const gap = (w-80)/(nodes.length-1);
  let items = "";
  nodes.forEach((label,i) => {
    const x = 40 + gap*i;
    items += `
    <g>
      <rect x="${x-55}" y="60" width="110" height="46" rx="10" fill="${i%2===0?'var(--sand-2)':'var(--copper)'}" stroke="var(--line)" />
      <text x="${x}" y="88" text-anchor="middle" font-family="var(--body)" font-size="12.5" font-weight="600" fill="${i%2===0?'var(--ink)':'#fff'}">${label}</text>
    </g>`;
    if(i < nodes.length-1){
      items += `<path d="M ${x+56} 83 L ${x+gap-56} 83" stroke="var(--copper)" stroke-width="2" marker-end="url(#arrowhead)"/>`;
    }
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="min-width:${w}px;">
    <defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--copper)"/></marker></defs>
    ${items}
  </svg>`;
}

/* =========================================================================
   "La solución", lámina del pitch de SAVE, adaptada a la página de inicio.

   Reemplaza la figura del "ecosistema" del encabezado del inicio. Es la misma
   escena del pitch (persona → pulsera → nodo → monitoreo / contacto → centro
   de salud → ambulancia) pero funciona sola:

     · avanza etapa por etapa y vuelve a empezar (bucle),
     · las imágenes cambian solas (escena de la persona, las 20 pantallas del
       monitor), las señales viajan por las líneas y la ambulancia recorre
       su ruta,
     · se pausa sola cuando no está a la vista, y respeta "reducir
       movimiento" del sistema,
     · en pantallas angostas (celular) una "cámara" se acerca a cada etapa.

   Las imágenes están en public-site/img/solucion/.

   Uso: renderHome() (03-page-home.js) inserta solHomeHTML(); 11-app.js llama
   a initSolucionPitch() después de dibujar el inicio.
   ========================================================================= */

const SOL_IMG_DIR = "img/solucion/";
const SOL_VIEW = [0, 0, 1700, 745];   // encuadre completo de la escena

const SOL_STEPS = [
  { title: "Persona sufre un episodio",
    desc: "Una persona sufre una emergencia en un espacio público. Este punto se mantiene como referencia durante todo el recorrido." },
  { title: "La pulsera detecta y se activa",
    desc: "La pulsera detecta la anomalía en los signos vitales y comienza a transmitir." },
  { title: "El nodo recibe la alerta",
    desc: "La señal llega al nodo SAVE más cercano, que se enciende y muestra las mediciones (BPM, SpO₂) junto con indicaciones básicas." },
  { title: "El nodo transmite la alerta",
    desc: "El nodo reenvía la alerta: primero al panel de monitoreo, luego al nodo móvil y luego avisa a quienes están cerca, que empiezan a informarse." },
  { title: "Envío al centro de salud",
    desc: "El panel de monitoreo transmite los datos biométricos y la ubicación hacia el centro de salud, mientras las personas del lugar ya están ayudando." },
  { title: "El centro de salud recibe la alerta",
    desc: "El centro de salud recibe las mediciones, la ubicación y el estado actual de la persona." },
  { title: "Llega la ayuda",
    desc: "La ambulancia llega al lugar y los paramédicos asisten a la persona." },
];

// Cuánto dura cada etapa (ms) antes de pasar a la siguiente.

const SOL_DURATIONS = [2500, 2500, 2500, 2500, 2500, 2500, 6500];

const SOL_SCENE_IDS  = ["sol-sceneAfectada", "sol-sceneInformandose", "sol-sceneAyudando", "sol-sceneParamedicos"];
const SOL_SCENE_CAPS = ["Persona sufre un episodio", "Personas cercanas se informan", "Personas cercanas ayudan", "Paramédicos asisten en el lugar"];

// En pantallas angostas la escena no cabe legible, una "cámara" (viewBox)
// se acerca a la zona activa de cada etapa. Todas con proporción 4:3.

const SOL_CAMERA = [
  [0,   225,  780, 585],   // 0 persona
  [0,    50,  880, 660],   // 1 pulsera
  [40,   10,  940, 705],   // 2 nodo
  [380,   0,  960, 720],   // 3 nodo transmite (monitor, teléfono)
  [0,     0, 1060, 795],   // 4 aviso a quienes están cerca
  [880,  40,  820, 615],   // 5 centro de salud
  [50,  130,  820, 615],   // 6 llegada de la ayuda (posición final; en el camino la cámara sigue a la ambulancia)
];
const SOL_FOLLOW = [820, 615];   // tamaño de la ventana que sigue a la ambulancia

/* Caja en la que cabe una imagen de tamaño natural (nw × nh) dentro de
   (x,y,w,h), centrada. Sirve para que el marco quede pegado a la imagen. */

function solFit(box, nat){
  const [x, y, w, h] = box, [nw, nh] = nat;
  const s = Math.min(w / nw, h / nh);
  const dw = nw * s, dh = nh * s;
  return [x + (w - dw) / 2, y + (h - dh) / 2, dw, dh];
}
const solN = (n) => Math.round(n * 10) / 10;

function solSceneMarkup(){
  const img = (name) => SOL_IMG_DIR + name + ".webp";

  const pulsera = solFit([100, 95, 200, 152], [602, 431]);
  const nodo    = solFit([449, 20, 250, 310], [316, 583]);
  const monitor = solFit([890, 50, 320, 250], [774, 520]);
  const telef   = solFit([740, 338, 120, 170], [251, 564]);
  const hosp    = solFit([1276, 301, 270, 230], [594, 485]);
  const persona = [60, 330, 360, 330];

  const frame = (b) => `<rect class="sol-frame" x="${solN(b[0])}" y="${solN(b[1])}" width="${solN(b[2])}" height="${solN(b[3])}" rx="12"/>`;
  const photo = (b, name, extra = "", fit = "xMidYMid meet") =>
    `<image class="sol-img-frame" ${extra} x="${solN(b[0])}" y="${solN(b[1])}" width="${solN(b[2])}" height="${solN(b[3])}" clip-path="url(#sol-clipRound)" preserveAspectRatio="${fit}" href="${img(name)}"/>`;
  const label = (x, y, text, id = "") =>
    `<g class="sol-label"><rect class="sol-label-bg" rx="6"/><text ${id ? `id="${id}"` : ""} class="sol-label-text" x="${x}" y="${y}">${text}</text></g>`;

  let monitorImgs = "";
  for(let n = 1; n <= 20; n++){
    const nn = String(n).padStart(2, "0");
    monitorImgs += photo(monitor, "monitor-" + nn, `id="sol-monImg${n}" style="opacity:${n === 1 ? 1 : 0}"`);
  }

  return `
  <svg id="sol-scene" viewBox="${SOL_VIEW.join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img"
       aria-label="Recorrido de una alerta SAVE: una persona sufre un episodio, la pulsera detecta y transmite, el nodo SAVE cercano recibe la alerta y la reenvía al panel de monitoreo, al nodo móvil y a quienes están cerca, el centro de salud recibe los datos y llega la ambulancia.">
    <defs>
      <clipPath id="sol-clipRound" clipPathUnits="objectBoundingBox"><rect width="1" height="1" rx="0.045" ry="0.045"/></clipPath>
    </defs>

    <path id="sol-pathPersonBracelet" class="sol-signal-path" d="M 70,390 A 450,220 0 0,1 285,175"/>
    <path id="sol-pathBraceletNode" class="sol-signal-path" d="M 370,160 A 450,220 0 0,1 509,165"/>
    <path id="sol-pathNodeMonitor" class="sol-signal-path" d="M 709,180 A 450,220 0 0,1 890,180"/>
    <path id="sol-pathNodePhone" class="sol-signal-path sol-phone-path" d="M 1160,200 A 450,220 0 0,1 1340,315"/>
    <path id="sol-pathNodeHelpers" class="sol-signal-path" d="M 609,310 A 450,220 0 0,1 800,423"/>
    <path id="sol-pathMonitorHospital" class="sol-signal-path" d="M 509,250 A 450,220 0 0,0 380,440"/>

    <path id="sol-ambRoutePath" class="sol-appear"
          d="M 1365,350 C 1330,430 1260,520 1160,600 C 1040,690 880,715 720,700 C 610,690 525,640 475,575 C 460,555 455,540 460,530"
          fill="none" stroke="var(--line)" stroke-width="2.5" stroke-dasharray="4 8"/>
    <path id="sol-ambTrailPath"
          d="M 1365,350 C 1330,430 1260,520 1160,600 C 1040,690 880,715 720,700 C 610,690 525,640 475,575 C 460,555 455,540 460,530"
          fill="none" stroke="#e8a355" stroke-width="5" stroke-linecap="round" stroke-dasharray="0.1 12"
          style="visibility:hidden; opacity:.9;"/>

    <g id="sol-gPerson" class="sol-appear">
      ${frame(persona)}
      ${photo(persona, "persona-1-afectada", 'id="sol-sceneAfectada"', "xMidYMid slice")}
      ${photo(persona, "persona-2-informandose", 'id="sol-sceneInformandose" style="opacity:0"', "xMidYMid slice")}
      ${photo(persona, "persona-3-ayudando", 'id="sol-sceneAyudando" style="opacity:0"', "xMidYMid slice")}
      ${photo(persona, "persona-4-paramedicos", 'id="sol-sceneParamedicos" style="opacity:0"', "xMidYMid slice")}
      <g transform="translate(230,470) rotate(10.6) scale(1.8)"><path id="sol-personGlow" class="sol-pulse-ring" d="M -10,8 L 0,-10 L 10,8" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g transform="translate(230,470) rotate(10.6) scale(1.8)"><path id="sol-personGlow2" class="sol-pulse-ring" d="M -10,8 L 0,-10 L 10,8" stroke-linecap="round" stroke-linejoin="round" style="animation-delay:.5s"/></g>
      ${label(68, 692, "Persona sufre un episodio", "sol-sceneCaption")}
    </g>

    <g id="sol-gBracelet" class="sol-appear">
      ${frame(pulsera)}
      ${photo(pulsera, "pulsera")}
      <circle id="sol-braceletLed" class="sol-led" cx="387" cy="131" r="7.5" fill="#d8cabb" stroke="var(--cream)" stroke-width="1.6"/>
      ${label(108, 264, "Pulsera inteligente")}
      <g id="sol-gCountdown" transform="translate(363,88) scale(1.35)">
        <circle r="17" fill="var(--alert)" stroke="#fff" stroke-width="2"/>
        <text id="sol-countdownText" x="0" y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">15</text>
      </g>
    </g>

    <g id="sol-gNode" class="sol-appear">
      ${frame(nodo)}
      ${photo(nodo, "nodo-led-real")}
      <circle id="sol-nodeLed" class="sol-led" cx="647" cy="62" r="9" fill="#d8cabb" stroke="var(--cream)" stroke-width="1.8"/>
      ${label(457, 318, "Nodo de alerta")}
    </g>

    <g id="sol-gMonitor" class="sol-appear">
      ${frame(monitor)}
      ${monitorImgs}
      ${label(898, 314, "Monitoreo en tiempo real")}
    </g>

    <g id="sol-gPhone" class="sol-appear">
      ${frame(telef)}
      ${photo(telef, "nodo-movil-real")}
      ${label(748, 536, "Nodo móvil")}
    </g>

    <g id="sol-gHospital" class="sol-appear">
      ${frame(hosp)}
      ${photo(hosp, "centro-salud")}
      ${label(1284, 554, "Centro de salud")}
    </g>

    <g id="sol-gHospitalCard" class="sol-appear" transform="translate(1350,62) scale(1.7)">
      <rect class="sol-card" x="0" y="0" width="200" height="126" rx="10"/>
      <rect x="10" y="10" width="180" height="18" rx="5" fill="var(--alert)" opacity=".92"/>
      <text x="16" y="23" font-size="9.5" font-weight="700" fill="#fff">ALERTA DE EMERGENCIA</text>
      <text x="12" y="46" class="sol-card-text">Sospecha: <tspan fill="var(--alert)" font-weight="700">Arritmia</tspan></text>
      <text x="12" y="60" class="sol-card-text">BPM 132 · SpO₂ 89%</text>
      <text x="12" y="74" class="sol-card-text">Ubicación: Plaza Italia</text>
      <text x="12" y="88" class="sol-card-text">Estado: consciente / crítico</text>
      <text x="12" y="108" class="sol-card-text" fill="var(--copper-2)" font-weight="700" style="fill:var(--copper)">Despachando unidad ▸</text>
    </g>

    <g id="sol-gAmbulance" class="sol-appear" transform="translate(1365,350)">
      <image x="-85" y="-70" width="170" height="141" preserveAspectRatio="xMidYMid meet" href="${img("ambulancia")}"/>
    </g>
  </svg>`;
}

/* HTML completo del widget (lo llama renderHome() en lugar de la figura
   del ecosistema). */

function solHomeHTML(){
  const dots = SOL_STEPS.map((s, i) =>
    `<button type="button" class="sol-dot" data-sol-stage="${i}" aria-label="Etapa ${i + 1}: ${s.title}"></button>`).join("");
  return `
  <div class="sol-home" id="solHome">
    <div class="sol-home-head">
      <span class="sol-home-eyebrow">La solución</span>
      <span class="sol-home-sub">El recorrido completo de una alerta, etapa por etapa.</span>
    </div>
    <div class="sol-scene-wrap" id="solSceneWrap">${solSceneMarkup()}</div>
    <div class="sol-footer">
      <div class="sol-caption" aria-live="polite">
        <div class="sol-cap-tag" id="solCapTag"></div>
        <h4 id="solCapTitle"></h4>
        <p id="solCapDesc"></p>
      </div>
      <div class="sol-controls">
        <button type="button" class="sol-play" id="solPlay" aria-label="Pausar animación" title="Pausar / reanudar"></button>
        <div class="sol-dots" id="solDots">${dots}</div>
      </div>
    </div>
  </div>`;
}

const SOL_ICON_PAUSE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;
const SOL_ICON_PLAY  = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;

class SolucionPitch {
  constructor(root){
    this.root = root;
    this.svg = root.querySelector("#sol-scene");
    this.wrap = root.querySelector("#solSceneWrap");
    this.stage = -1;
    this.userPaused = false;
    this.inView = true;
    this.narrow = false;
    this.timer = null;
    this.camReq = null;
    this.vb = SOL_VIEW.slice();
    this.reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // estado de las animaciones
    this.ambReq = null; this.ambDone = false;
    this.monInterval = null;
    this.cdStarted = false; this.cdInterval = null;
    this.flows = {};

    this.$ = (id) => this.svg.querySelector("#" + id);

    root.querySelector("#solDots").addEventListener("click", (e) => {
      const b = e.target.closest("[data-sol-stage]");
      if(b) this.go(parseInt(b.dataset.solStage, 10));
    });
    this.playBtn = root.querySelector("#solPlay");
    this.playBtn.addEventListener("click", () => {
      this.userPaused = !this.userPaused;
      this.updatePlayBtn();
      this.schedule();
    });

    this.onVis = () => this.schedule();
    document.addEventListener("visibilitychange", this.onVis);

    if("IntersectionObserver" in window){
      this.io = new IntersectionObserver((entries) => {
        this.inView = entries[0].isIntersecting;
        this.schedule();
      }, { threshold: 0.15 });
      this.io.observe(root);
    }
    if("ResizeObserver" in window){
      this.ro = new ResizeObserver(() => this.onResize());
      this.ro.observe(this.wrap);
    }
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.layoutLabels());

    this.userPaused = this.reduce;   // con "reducir movimiento" no avanza sola
    this.updatePlayBtn();
    this.onResize(true);
    this.go(this.reduce ? SOL_STEPS.length - 1 : 0);
  }

  /* ciclo de vida */
  destroy(){
    clearTimeout(this.timer);
    cancelAnimationFrame(this.camReq);
    cancelAnimationFrame(this.ambReq);
    this.stopMonitor();
    if(this.cdInterval) clearInterval(this.cdInterval);
    Object.keys(this.flows).forEach(id => this.cancelFlow(id));
    if(this.io) this.io.disconnect();
    if(this.ro) this.ro.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.dead = true;
  }

  get active(){ return !this.userPaused && this.inView && !document.hidden; }

  schedule(){
    clearTimeout(this.timer);
    if(this.dead) return;
    if(!this.root.isConnected){ this.destroy(); return; }   // se cambió de página
    if(!this.active) return;
    this.timer = setTimeout(() => {
      this.go((this.stage + 1) % SOL_STEPS.length);
    }, SOL_DURATIONS[this.stage] || 4500);
  }

  updatePlayBtn(){
    this.playBtn.innerHTML = this.userPaused ? SOL_ICON_PLAY : SOL_ICON_PAUSE;
    this.playBtn.setAttribute("aria-label", this.userPaused ? "Reanudar animación" : "Pausar animación");
  }

  /* etapas */

  go(i){
    if(this.dead) return;
    const prev = this.stage;
    this.stage = i;
    this.applyStage(i, prev);
    this.updateCaption();
    this.moveCamera(i);
    this.schedule();
  }

  updateCaption(){
    const i = this.stage, s = SOL_STEPS[i];
    const tag = this.root.querySelector("#solCapTag");
    const title = this.root.querySelector("#solCapTitle");
    const desc = this.root.querySelector("#solCapDesc");
    const cap = this.root.querySelector(".sol-caption");
    cap.classList.remove("in"); void cap.offsetWidth;   // reinicia el fundido
    tag.textContent = `Etapa ${i + 1} / ${SOL_STEPS.length}`;
    title.textContent = s.title;
    desc.textContent = s.desc;
    cap.classList.add("in");
    this.root.querySelectorAll(".sol-dot").forEach((d, k) => {
      d.classList.toggle("active", k === i);
      d.classList.toggle("done", k < i);
      d.setAttribute("aria-current", k === i ? "step" : "false");
    });
  }

  applyStage(i){
    this.show("sol-gPerson", true);
    this.pulse("sol-personGlow", i === 0); this.pulse("sol-personGlow2", i === 0);

    this.show("sol-pathPersonBracelet", i >= 1);
    this.show("sol-gBracelet", i >= 1);
    this.led("sol-braceletLed", i >= 1);
    if(i >= 1) this.startCountdown(); else this.resetCountdown();

    this.show("sol-pathBraceletNode", i >= 2);
    this.show("sol-gNode", i >= 2);
    this.led("sol-nodeLed", i >= 2);

    this.show("sol-gMonitor", i >= 3);
    this.show("sol-gPhone", i >= 3);
    this.show("sol-pathNodeMonitor", i >= 3);
    this.show("sol-pathNodePhone", i >= 3);
    this.show("sol-pathNodeHelpers", i >= 3);
    if(i >= 3 && !this.reduce) this.startMonitor(); else this.stopMonitor();

    this.show("sol-pathMonitorHospital", i >= 4);
    this.show("sol-gHospital", i >= 5);
    this.show("sol-gHospitalCard", i >= 5);
    this.show("sol-ambRoutePath", i >= 6);
    this.show("sol-gAmbulance", i >= 6);

    if(i >= 6) this.animateAmbulance(); else this.resetAmbulance();

    // Escena de la persona: los paramédicos aparecen cuando la ambulancia llega.
    let scene = 0;
    if(i >= 6) scene = this.ambDone ? 3 : 2;
    else if(i >= 4) scene = 2;
    else if(i >= 3) scene = 1;
    this.setScene(scene);
  }

  /* helpers de animación (portados de la lámina del pitch) */

  pulse(id, on){ const el = this.$(id); if(el) el.classList.toggle("on", on && !this.reduce); }
  led(id, on){
    const el = this.$(id); if(!el) return;
    el.classList.toggle("sol-blink", on && !this.reduce);
    if(!on) el.setAttribute("fill", "#d8cabb");
    else if(this.reduce) el.setAttribute("fill", "var(--alert)");
  }

  setScene(idx){
    SOL_SCENE_IDS.forEach((id, k) => { const el = this.$(id); if(el) el.style.opacity = (k === idx) ? 1 : 0; });
    const cap = this.$("sol-sceneCaption");
    if(cap){ cap.textContent = SOL_SCENE_CAPS[idx]; this.layoutLabels(); }
  }

  show(id, on){
    const el = this.$(id); if(!el) return;
    const isPath = el.tagName.toLowerCase() === "path" && el.classList.contains("sol-signal-path");
    if(!on){
      el.classList.remove("sol-show");
      el.style.visibility = isPath ? "hidden" : "";   // los grupos quedan como "plano" tenue
      if(isPath) this.cancelFlow(id);
      return;
    }
    if(isPath){
      if(el.classList.contains("sol-show") || this.flows[id]){
        el.style.visibility = "visible";
        this.ensureFlowLight(id);
        return;
      }
      el.style.visibility = "visible";
      this.startFlow(id);
      return;
    }
    el.classList.add("sol-show");
    el.style.visibility = "visible";
  }

  cancelFlow(id){
    const st = this.flows[id]; if(!st) return;
    if(st.frame) cancelAnimationFrame(st.frame);
    if(st.loopFrame) cancelAnimationFrame(st.loopFrame);
    if(st.drawPath) st.drawPath.remove();
    if(st.arrow) st.arrow.remove();
    if(st.flowLight) st.flowLight.remove();
    delete this.flows[id];
  }

  ensureFlowLight(id){
    const st = this.flows[id];
    if(st && st.flowLight) return;
    this.startFlowLight(id);
  }

  // Puntito luminoso que recorre la línea una vez dibujada.

  startFlowLight(id){
    const source = this.$(id); if(!source) return;
    const length = source.getTotalLength();
    const light = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    light.setAttribute("r", "5");
    light.setAttribute("fill", "#e8a355");
    light.style.pointerEvents = "none";
    light.style.filter = "drop-shadow(0 0 3px rgba(232,163,85,.9))";
    this.svg.insertBefore(light, this.$("sol-pathPersonBracelet"));
    const state = this.flows[id] || (this.flows[id] = {});
    state.flowLight = light;
    const loopDuration = 1400, loopStart = performance.now();
    const loop = (now) => {
      const st = this.flows[id];
      if(!st || !st.flowLight) return;
      const t = ((now - loopStart) % loopDuration) / loopDuration;
      const pt = source.getPointAtLength(length * t);
      light.setAttribute("cx", pt.x); light.setAttribute("cy", pt.y);
      st.loopFrame = requestAnimationFrame(loop);
    };
    state.loopFrame = requestAnimationFrame(loop);
  }

  // La línea se "dibuja" con una punta de flecha y luego queda con el puntito viajando.

  startFlow(id){
    this.cancelFlow(id);
    const source = this.$(id); if(!source) return;
    const length = source.getTotalLength();
    const ref = this.$("sol-pathPersonBracelet");

    const drawPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    drawPath.setAttribute("d", source.getAttribute("d"));
    drawPath.setAttribute("fill", "none");
    drawPath.setAttribute("stroke", "#e8a355");
    drawPath.setAttribute("stroke-width", "4.5");
    drawPath.setAttribute("stroke-linecap", "round");
    drawPath.setAttribute("stroke-dasharray", length);
    drawPath.setAttribute("stroke-dashoffset", length);
    drawPath.style.opacity = ".95"; drawPath.style.pointerEvents = "none";
    this.svg.insertBefore(drawPath, ref);

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrow.setAttribute("points", "0,-6 11,0 0,6");
    arrow.setAttribute("fill", "#e8a355");
    arrow.style.pointerEvents = "none";
    this.svg.insertBefore(arrow, ref);

    const state = this.flows[id] = { frame: null, drawPath, arrow };
    const duration = this.reduce ? 1 : 2000, t0 = performance.now();
    const animate = (now) => {
      const st = this.flows[id]; if(!st) return;
      const progress = Math.min(1, (now - t0) / duration);
      const dist = length * progress;
      drawPath.style.strokeDashoffset = length - dist;
      const p = source.getPointAtLength(dist);
      const q = source.getPointAtLength(Math.min(length, dist + 1));
      arrow.setAttribute("transform", `translate(${p.x},${p.y}) rotate(${Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI})`);
      if(progress < 1){
        st.frame = requestAnimationFrame(animate);
      } else {
        drawPath.remove(); arrow.remove();
        source.style.visibility = "visible";
        source.classList.add("sol-show");
        st.frame = null; st.drawPath = null; st.arrow = null;
        if(!this.reduce) this.startFlowLight(id);
      }
    };
    state.frame = requestAnimationFrame(animate);
  }

  // Las 20 pantallas del monitor se van alternando solas.
  startMonitor(){
    if(this.monInterval) return;
    let idx = 0;
    this.monInterval = setInterval(() => {
      if(!this.root.isConnected){ this.stopMonitor(); return; }
      idx = (idx + 1) % 20;
      for(let n = 1; n <= 20; n++){
        const el = this.$("sol-monImg" + n);
        if(el) el.style.opacity = (n - 1 === idx) ? 1 : 0;
      }
    }, 350);
  }
  stopMonitor(){
    if(this.monInterval){ clearInterval(this.monInterval); this.monInterval = null; }
    for(let n = 1; n <= 20; n++){ const el = this.$("sol-monImg" + n); if(el) el.style.opacity = (n === 1) ? 1 : 0; }
  }

  // Cuenta regresiva de la ventana de 15 segundos de la pulsera.

  startCountdown(){
    if(this.cdStarted) return;
    this.cdStarted = true;
    let secs = 15;
    const el = this.$("sol-countdownText"); if(!el) return;
    el.textContent = secs;
    this.cdInterval = setInterval(() => {
      secs -= 1;
      if(secs <= 0){ secs = 0; el.textContent = 0; clearInterval(this.cdInterval); this.cdInterval = null; return; }
      el.textContent = secs;
    }, 1000);
  }
  resetCountdown(){
    this.cdStarted = false;
    if(this.cdInterval){ clearInterval(this.cdInterval); this.cdInterval = null; }
    const el = this.$("sol-countdownText"); if(el) el.textContent = "15";
  }

  // La ambulancia recorre su ruta dejando una estela hasta llegar a la persona.

  animateAmbulance(){
    if(this.ambDone) return;
    const g = this.$("sol-gAmbulance"), path = this.$("sol-ambRoutePath"), trail = this.$("sol-ambTrailPath");
    if(!g || !path || this.ambRunning) return;
    const len = path.getTotalLength();
    if(trail){
      trail.style.visibility = "visible";
      trail.setAttribute("stroke-dasharray", len);
      trail.setAttribute("stroke-dashoffset", len);
    }
    const dur = this.reduce ? 1 : 2800, t0 = performance.now();
    this.ambRunning = true;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const pt = path.getPointAtLength(len * k);
      g.setAttribute("transform", `translate(${pt.x},${pt.y})`);
      if(trail) trail.setAttribute("stroke-dashoffset", len - len * k);
      if(this.narrow && !this.reduce){
        // la cámara acompaña a la ambulancia
        const cx = Math.max(0, Math.min(SOL_VIEW[2] - SOL_FOLLOW[0], pt.x - SOL_FOLLOW[0] / 2));
        const cy = Math.max(0, Math.min(SOL_VIEW[3] - SOL_FOLLOW[1], pt.y - SOL_FOLLOW[1] / 2));
        this.setViewBox([cx, cy, SOL_FOLLOW[0], SOL_FOLLOW[1]]);
      }
      if(k < 1){ this.ambReq = requestAnimationFrame(step); }
      else {
        this.ambDone = true; this.ambRunning = false;
        if(this.stage >= 6) this.setScene(3);    // llegan los paramédicos
      }
    };
    this.ambReq = requestAnimationFrame(step);
  }
  resetAmbulance(){
    cancelAnimationFrame(this.ambReq);
    this.ambDone = false; this.ambRunning = false;
    const g = this.$("sol-gAmbulance");
    if(g) g.setAttribute("transform", "translate(1365,350)");
    const trail = this.$("sol-ambTrailPath"), route = this.$("sol-ambRoutePath");
    if(trail && route){
      trail.setAttribute("stroke-dashoffset", route.getTotalLength());
      trail.style.visibility = "hidden";
    }
  }

  /* tamaño, etiquetas y cámara */

  onResize(first){
    const w = this.wrap.clientWidth || 1;
    const narrow = w < 720;
    if(narrow !== this.narrow || first){
      this.narrow = narrow;
      this.root.classList.toggle("is-narrow", narrow);
      this.setViewBox(narrow && this.stage >= 0 ? SOL_CAMERA[this.stage] : (narrow ? SOL_CAMERA[0] : SOL_VIEW));
    }
    this.layoutLabels();
  }

  setViewBox(vb){
    this.vb = vb.slice();
    this.svg.setAttribute("viewBox", vb.join(" "));
    this.layoutLabels();
  }

  moveCamera(i){
    if(!this.narrow){ if(this.vb.join() !== SOL_VIEW.join()) this.setViewBox(SOL_VIEW); return; }
    // Etapa final: mientras la ambulancia va en camino, la cámara la sigue (ver animateAmbulance).
    if(i >= 6 && !this.ambDone && !this.reduce) return;
    const from = this.vb.slice(), to = SOL_CAMERA[i];
    cancelAnimationFrame(this.camReq);
    if(this.reduce){ this.setViewBox(to); return; }
    const dur = 900, t0 = performance.now();
    const ease = (k) => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = ease(k);
      this.setViewBox(from.map((v, n) => v + (to[n] - v) * e));
      if(k < 1) this.camReq = requestAnimationFrame(step);
    };
    this.camReq = requestAnimationFrame(step);
  }

  // Tamaño de las etiquetas (en unidades del dibujo) para que midan ~13 px
  // en pantalla sin importar cuánto esté reducida la escena.

  layoutLabels(){
    const w = this.wrap.clientWidth || 1;
    const scale = w / this.vb[2];
    const size = Math.max(16, Math.min(34, 13 / scale));
    this.svg.style.setProperty("--sol-label-size", size.toFixed(1) + "px");
    this.svg.querySelectorAll(".sol-label").forEach(g => {
      const t = g.querySelector("text"), r = g.querySelector("rect");
      try{
        const b = t.getBBox();
        if(!b.width) return;
        r.setAttribute("x", b.x - 8); r.setAttribute("y", b.y - 4);
        r.setAttribute("width", b.width + 16); r.setAttribute("height", b.height + 8);
      }catch(e){ /* el navegador aún no puede medir el texto */ }
    });
  }
}

let __solucionPitch = null;

/* Arranca la lámina (y detiene la anterior si se vuelve al inicio). */

function initSolucionPitch(){
  if(__solucionPitch){ __solucionPitch.destroy(); __solucionPitch = null; }
  const root = document.getElementById("solHome");
  if(!root) return;
  // Con la lámina, el encabezado pasa a una sola columna: texto arriba y
  // la escena a todo el ancho (es panorámica y no cabe legible en media columna).
  const grid = root.closest(".hero-grid");
  if(grid) grid.classList.add("hero-grid--solucion");
  __solucionPitch = new SolucionPitch(root);
}

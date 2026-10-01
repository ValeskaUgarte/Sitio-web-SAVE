// Carga el contenido real ya existente en el sitio SAVE (casos documentados,
// noticias de avance del proyecto, etapas del roadmap y empresas plantilla)
// hacia la base de datos, para que el panel de administración parta con
// el mismo contenido que ya tenías, listo para editar.
//
// Ejecutar con: npm run seed:demo

const db = require("../db/db");
const { slugify } = require("../utils");

function seedCasos() {
  const count = db.prepare("SELECT COUNT(*) as n FROM casos").get().n;
  if (count > 0) { console.log("casos: ya existen registros, se omite."); return; }

  const casos = [
    {
      titulo: "Primer caso real documentado de detección automática de un paro cardiorrespiratorio por wearable",
      fecha: "Enero de 2026", lugar: "Países Bajos", tipo: "Paro cardiorrespiratorio (PCR)",
      fact_type: "Hecho documentado",
      hecho: "Investigadores del Radboud University Medical Center publicaron el primer caso real documentado de detección de un paro cardiorrespiratorio extrahospitalario mediante una pulsera wearable. Un modelo basado en fotopletismografía (PPG) detectó la ausencia de pulso en segundos mientras la persona afectada se encontraba andando en bicicleta, sin testigos presentes.",
      problema: "El caso confirma que la detección automática por wearable puede habilitar la activación de servicios de emergencia en paros no presenciados, un escenario donde la sobrevivencia actual es menor al 5%. Es la evidencia clínica más directa que valida el núcleo tecnológico de SAVE: detectar la emergencia incluso cuando no hay nadie alrededor para notarla.",
      fuente: "Resuscitation Plus (2026)", fuente_doi: "10.1016/j.resplu.2026.101245",
      url: "https://doi.org/10.1016/j.resplu.2026.101245", fecha_publicacion: "Enero de 2026",
    },
    {
      titulo: "Menos del 10% de sobrevivencia al alta hospitalaria por paro cardíaco extrahospitalario en Santiago",
      fecha: "2022 (publicación)", lugar: "Santiago, Chile", tipo: "Paro cardiorrespiratorio (PCR-EH)",
      fact_type: "Evidencia estadística con fuente",
      hecho: "Un registro prospectivo conducido en Santiago (Pontificia Universidad Católica de Chile) encontró que la tasa de sobrevivencia al alta hospitalaria por paro cardiorrespiratorio extrahospitalario es menor al 10%. Más del 57% de los pacientes llegó al servicio de urgencia por sus propios medios o llevado por testigos, y no por personal prehospitalario; solo el 34% fue asistido por equipos del SAMU.",
      problema: "El dato muestra que, en la gran mayoría de los casos, la diferencia entre la vida y la muerte se juega en los minutos en que solo el entorno inmediato —no un servicio de emergencia— puede intervenir. SAVE busca acortar exactamente esa ventana, avisando al entorno físico apenas se detecta la anomalía.",
      fuente: "SciELO — Revista Médica de Chile (2022)", fuente_doi: null, url: null, fecha_publicacion: "2022",
    },
    {
      titulo: "Mediana de 13,5 minutos de respuesta del SAMU Metropolitano ante un paro cardíaco",
      fecha: "2009 (estudio de referencia)", lugar: "Santiago, Chile", tipo: "Paro cardiorrespiratorio (PCR-EH)",
      fact_type: "Evidencia estadística con fuente",
      hecho: "El estudio de Mayanz et al. (2009) midió una mediana de 13,5 minutos de respuesta del SAMU Metropolitano para paros cardiorrespiratorios de causa cardíaca en Santiago. A ese tiempo de traslado se suma la espera para establecer contacto telefónico con la línea 131, que va de 1–3 minutos en horario valle a 10–20 minutos en horario punta o contingencia.",
      problema: "La probabilidad de sobrevivencia disminuye entre un 7% y un 10% por cada minuto sin atención (Boston Scientific). Con 13,5 minutos de mediana de traslado, gran parte de la ventana de acción crítica ya se perdió antes de que llegue cualquier ayuda profesional: el momento decisivo ocurre antes, con quienes ya están en el lugar.",
      fuente: "Mayanz et al. (2009)", fuente_doi: null, url: null, fecha_publicacion: "2009",
    },
    {
      titulo: "El efecto espectador: por qué el entorno no siempre reconoce una emergencia",
      fecha: "1968 (estudio fundacional)", lugar: "Estudio internacional (psicología social)", tipo: "Reconocimiento del entorno",
      fact_type: "Evidencia académica con fuente",
      hecho: 'El estudio clásico de Darley y Latané (1968), publicado en el Journal of Personality and Social Psychology, documentó el fenómeno conocido como "efecto espectador": ante una emergencia presenciada por varias personas, la responsabilidad percibida de intervenir se difunde entre los presentes, reduciendo la probabilidad de que alguien actúe.',
      problema: "Este fenómeno psicosocial ayuda a explicar por qué, incluso cuando hay personas cerca, una emergencia médica puede pasar sin ser atendida por minutos: nadie está seguro de que se trate realmente de una emergencia. SAVE ataca directamente esta brecha al hacer explícita, mediante señales visuales y sonoras, la existencia de una emergencia real.",
      fuente: "Darley, J.M. & Latané, B. (1968), Journal of Personality and Social Psychology, 8(4), 377–383",
      fuente_doi: null, url: null, fecha_publicacion: "1968",
    },
    {
      titulo: "SUDEP: muerte súbita e inesperada en epilepsia, con o sin testigos",
      fecha: "Literatura clínica vigente", lugar: "Evidencia internacional", tipo: "Crisis epiléptica",
      fact_type: "Evidencia estadística con fuente",
      hecho: "La literatura clínica reporta una incidencia de SUDEP (muerte súbita e inesperada en epilepsia) de entre 1 de cada 500 y 1 de cada 1.000 pacientes al año, representando entre el 2% y el 18% de las causas de muerte en personas con epilepsia. El riesgo de muerte súbita en esta población es entre 20 y 25 veces mayor que en la población general.",
      problema: "La literatura señala explícitamente que el SUDEP puede ocurrir con o sin testigos presentes, y reconoce un subregistro del fenómeno por falta de autopsias sistemáticas. Un sistema que detecte la crisis convulsiva y active el entorno de forma automática atiende directamente a la población que hoy queda fuera de cualquier posibilidad de ayuda oportuna.",
      fuente: "Literatura clínica sobre epilepsia y SUDEP (ver bibliografía del informe de proyecto)", fuente_doi: null, url: null, fecha_publicacion: "Vigente",
    },
  ];

  const insert = db.prepare(`
    INSERT INTO casos (titulo, fecha, lugar, tipo, fact_type, hecho, problema, fuente, fuente_doi, url, fecha_publicacion)
    VALUES (@titulo, @fecha, @lugar, @tipo, @fact_type, @hecho, @problema, @fuente, @fuente_doi, @url, @fecha_publicacion)
  `);
  casos.forEach((c) => insert.run(c));
  console.log(`casos: ${casos.length} registros creados.`);
}

function seedNoticias() {
  const count = db.prepare("SELECT COUNT(*) as n FROM noticias").get().n;
  if (count > 0) { console.log("noticias: ya existen registros, se omite."); return; }

  const noticias = [
    {
      titulo: "SAVE define su arquitectura técnica de cuatro capas",
      fecha: "2026", autor: "Equipo SAVE", categoria: "Tecnología",
      resumen: "El proyecto avanzó desde el descubrimiento del problema hacia el modelamiento de casos de uso y la arquitectura técnica completa: pulsera, nodo de entorno, backend y panel de administración.",
      contenido: "Durante los primeros sprints del proyecto (Sprint 0 y Sprint 1) el equipo se concentró en cuantificar la brecha entre el traslado del SAMU y la espera de contacto con la línea 131, revisar el estado del arte en detección de emergencias por wearables, y levantar los requerimientos del sistema mediante análisis de tareas y una encuesta de conocimiento público. Con esa base se definió la arquitectura de cuatro capas de SAVE: la pulsera wearable (ESP32-C3, sensores de pulso, oxígeno, temperatura y ECG), el nodo de entorno (alerta visual y sonora local), el backend en tiempo real y el panel de administración. Cada capa quedó documentada con su propio modelo de datos y casos de uso.",
      tags: ["arquitectura", "ESP32", "hardware"], destacado: 0,
    },
    {
      titulo: "Resultados preliminares de la encuesta piloto de conocimiento público",
      fecha: "2026-08-16", autor: "Equipo SAVE", categoria: "Investigación",
      resumen: "Una muestra piloto de 14 personas ayudó a validar supuestos de diseño sobre qué tan bien reconoce la población general los síntomas de un ACV, un ataque cardíaco o una crisis epiléptica.",
      contenido: "Como parte del levantamiento de requerimientos, el equipo aplicó un instrumento breve de conocimiento público sobre reconocimiento de emergencias médicas a una muestra piloto de 14 personas (16 de agosto de 2026). Los resultados preliminares se usaron para trazar decisiones de diseño de las instrucciones que el nodo SAVE entrega al entorno durante una alerta: qué observar, cómo acompañar a la persona y qué evitar hacer. El equipo documentó también las limitaciones de esta muestra —principalmente su tamaño reducido y su cercanía con el equipo del proyecto— y los próximos pasos para ampliarla.",
      tags: ["encuesta", "investigación", "UX"], destacado: 0,
    },
    {
      titulo: "Se valida la comunidad de apoyo como red de nodos voluntarios",
      fecha: "2026", autor: "Equipo SAVE", categoria: "Proyecto",
      resumen: "El proyecto incorporó el concepto de comunidad de apoyo: cualquier persona podrá convertir su teléfono en un nodo móvil adicional de la red SAVE, sin necesidad de instalar hardware físico.",
      contenido: "A sugerencia de la dirección del proyecto, SAVE extendió el concepto de nodo más allá de la infraestructura física instalada en espacios públicos y hogares. Bajo este nuevo enfoque, cualquier persona interesada en aportar podrá registrarse en la futura aplicación móvil y convertir su propio teléfono en un nodo adicional de la red, ampliando la cobertura sin depender exclusivamente de la instalación de hardware. Juntas de vecinos, condominios, empresas o colegios podrán así generar su propia red de apoyo local.",
      tags: ["comunidad", "app móvil", "cobertura"], destacado: 0,
    },
    {
      titulo: "Avanza el prototipado del núcleo del sistema: nodo, backend, app y panel",
      fecha: "2026", autor: "Equipo SAVE", categoria: "Tecnología",
      resumen: "El equipo se encuentra prototipando en paralelo los cinco componentes centrales de SAVE: el Nodo SAVE con paneles LED, el backend con notificaciones en tiempo real, la app móvil de comunidad de apoyo, el panel de administración y la integración completa del sistema.",
      contenido: "Con la arquitectura técnica ya definida, el equipo entró en la etapa de prototipado activo de los componentes centrales del sistema. El Nodo SAVE —paneles LED y señal sonora que avisan al entorno y guían con instrucciones básicas durante la ventana de cancelación de la pulsera— ya tiene su primer prototipo funcional. En paralelo avanza el backend con registro de usuarios y notificación automática en tiempo real a centros de salud y contactos de emergencia, la app móvil que permitirá a cualquier persona sumarse como nodo de apoyo comunitario, y el panel de administración con historial de alertas y gestión de la red de nodos. La siguiente etapa es la integración completa del sistema y las primeras pruebas de campo con usuarios reales antes del lanzamiento formal.",
      tags: ["prototipado", "nodo SAVE", "backend", "app móvil"], destacado: 1,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO noticias (titulo, slug, fecha, autor, categoria, resumen, contenido, tags, publicado, destacado)
    VALUES (@titulo, @slug, @fecha, @autor, @categoria, @resumen, @contenido, @tags, 1, @destacado)
  `);
  noticias.forEach((n) => insert.run({ ...n, slug: slugify(n.titulo), tags: JSON.stringify(n.tags) }));
  console.log(`noticias: ${noticias.length} registros creados.`);
}

// Los "lanzamientos" representan la ESCALABILIDAD FUTURA de SAVE: sensores
// médicos adicionales que aún no se han comenzado a desarrollar y que
// amplían el sistema más allá del prototipo actual (pulsera + nodo + app +
// panel). Lo que ya está en prototipado vive en "noticias".
function seedLanzamientos() {
  const count = db.prepare("SELECT COUNT(*) as n FROM lanzamientos").get().n;
  if (count > 0) { console.log("lanzamientos: ya existen registros, se omite."); return; }

  const items = [
    {
      titulo: "Banda ECG con electrodos",
      descripcion: "Banda torácica con electrodos de electrocardiograma para personas con antecedentes cardíacos. Permite un monitoreo de la actividad eléctrica del corazón más preciso que la fotopletismografía de la pulsera, detectando arritmias y anomalías específicas con mayor anticipación.",
      estado: "proximamente", orden: 1,
    },
    {
      titulo: "Electrodos EEG para monitoreo cerebral",
      descripcion: "Sensor de electroencefalograma orientado a personas con antecedentes de epilepsia u otras condiciones neurológicas, para detectar actividad cerebral anómala asociada a crisis convulsivas antes o durante su desarrollo, ampliando la ventana de reacción del entorno.",
      estado: "proximamente", orden: 2,
    },
    {
      titulo: "Sensor de temperatura para golpes de calor",
      descripcion: "Sensor enfocado en la prevención de golpes de calor: monitorea temperatura corporal y condiciones de exposición en jornadas laborales de alta exigencia física o en días de altas temperaturas, alertando antes de que la situación se vuelva crítica.",
      estado: "proximamente", orden: 3,
    },
  ];
  const insert = db.prepare(`
    INSERT INTO lanzamientos (titulo, descripcion, estado, orden, destacado_home)
    VALUES (@titulo, @descripcion, @estado, @orden, 1)
  `);
  items.forEach((i) => insert.run(i));
  console.log(`lanzamientos: ${items.length} registros creados.`);
}

function seedEmpresas() {
  const count = db.prepare("SELECT COUNT(*) as n FROM empresas").get().n;
  if (count > 0) { console.log("empresas: ya existen registros, se omite."); return; }

  const items = [
    { nombre: "Espacio disponible", categoria: "Transporte", descripcion: "Reservado para una empresa de transporte afiliada a la red SAVE.", estado: "Plantilla", tipo_relacion: "implementadora", demo: 1 },
    { nombre: "Espacio disponible", categoria: "Salud", descripcion: "Reservado para una institución de salud afiliada a la red SAVE.", estado: "Plantilla", tipo_relacion: "implementadora", demo: 1 },
    { nombre: "Espacio disponible", categoria: "Educación", descripcion: "Reservado para un establecimiento educacional afiliado a la red SAVE.", estado: "Plantilla", tipo_relacion: "implementadora", demo: 1 },
    { nombre: "Espacio disponible", categoria: "Oficinas y empresas", descripcion: "Reservado para una empresa afiliada que instale nodos en sus espacios de trabajo.", estado: "Plantilla", tipo_relacion: "implementadora", demo: 1 },
    {
      nombre: "INACAP", categoria: "Educación superior",
      descripcion: "Instituto Nacional de Capacitación Profesional. Primera institución que apoya el desarrollo del proyecto SAVE, respaldando su prototipado desde el ámbito académico.",
      estado: "Activa", tipo_relacion: "convenio", sitio_web: "https://www.inacap.cl", demo: 0,
    },
  ];
  const insert = db.prepare(`
    INSERT INTO empresas (nombre, categoria, descripcion, estado, tipo_relacion, sitio_web, demo)
    VALUES (@nombre, @categoria, @descripcion, @estado, @tipo_relacion, @sitio_web, @demo)
  `);
  items.forEach((i) => insert.run({ sitio_web: null, ...i }));
  console.log(`empresas: ${items.length} registros creados.`);
}

function seedProducto() {
  const count = db.prepare("SELECT COUNT(*) as n FROM producto_items").get().n;
  if (count > 0) { console.log("producto_items: ya existen registros, se omite."); return; }

  const items = [
    { producto: "nodo_led", nombre: "Nodo SAVE (panel LED de aviso)", descripcion: "El corazón físico del sistema: paneles LED y alerta sonora que avisan al entorno, muestran instrucciones básicas y guían a las personas presentes para ayudar de inmediato a quien está sufriendo la emergencia.", orden: 1 },
    { producto: "pulsera", nombre: "Pulsera SAVE", descripcion: "Wearable con sensores de pulso, oxígeno, temperatura y ECG (ESP32-C3).", orden: 1 },
    { producto: "app", nombre: "App de monitoreo personal", descripcion: "Aplicación móvil que muestra en tiempo real los signos vitales y el estado de la pulsera.", orden: 1 },
    { producto: "nodo_movil", nombre: "Nodo móvil (celular)", descripcion: "Convierte cualquier teléfono en un nodo adicional de la red SAVE, sin hardware físico.", orden: 1 },
  ];
  const insert = db.prepare(`
    INSERT INTO producto_items (producto, nombre, descripcion, orden)
    VALUES (@producto, @nombre, @descripcion, @orden)
  `);
  items.forEach((i) => insert.run(i));
  console.log(`producto_items: ${items.length} registros creados (sin imagen — súbelas desde el panel admin).`);
}

seedCasos();
seedNoticias();
seedLanzamientos();
seedEmpresas();
seedProducto();
console.log("\nDatos iniciales cargados. Ejecuta 'npm run create:admin' si aún no tienes un usuario administrador.");

/* SAVE, Estado de datos del sitio, Se cargan
   desde el backend real (SQLite + Express) la primera vez que se necesitan,
   y se guardan en estas mismas variables para que el resto del código de
   renderizado, siga funcionando sin cambios grandes. */

let LAUNCH_STATUS = "En desarrollo — prototipo en pruebas de campo";

let NODES = [];
const NODE_TYPES = ["Todos","Nodo LED","Paradero","Metro","Empresa","Institución","Espacio público","Otro"];
const NODE_TYPE_ICON = { "Nodo LED":"ic-alert", "Paradero":"ic-bus", "Metro":"ic-metro", "Empresa":"ic-building",
  "Institución":"ic-cross", "Espacio público":"ic-map", "Otro":"ic-pin" };
const NODE_TYPE_COLOR = { "Nodo LED":"#D6331B", "Paradero":"#C1502E", "Metro":"#175457", "Empresa":"#8C3A20",
  "Institución":"#D6331B", "Espacio público":"#E8804A", "Otro":"#5B4E42" };

const CATEGORIA_INSTALACION_LABEL = { publico:"Espacio público", hogar:"Hogar", empresa:"Empresa", comunidad:"Comunidad / junta de vecinos" };

let COMPANIES = [];
const COMPANY_CATEGORIES = ["Todas","Transporte","Salud","Educación","Oficinas y empresas"];

let CASES = [];
const CASE_TYPES = ["Todos","Paro cardiorrespiratorio (PCR)","Paro cardiorrespiratorio (PCR-EH)","Crisis epiléptica","Reconocimiento del entorno"];

let NEWS = [];
const NEWS_CATEGORIES = ["Actualización","Tecnología","Lanzamiento","Nuevos nodos","Empresas afiliadas","Proyecto","Investigación"];

let LANZAMIENTOS = [];
let TEAM = [];

let PRODUCTO_ITEMS = { nodo_led: [], pulsera: [], app: [], nodo_movil: [], componentes: [], recorrido: [] };

/* Devuelve la URL de imagen subida desde el administrador para un componente
   de TECH_COMPONENTS (por nombre exacto), o null si todavía no tiene una. */

function componentImageUrl(nombre){
  const items = PRODUCTO_ITEMS.componentes || [];
  const match = items.find(i => i.nombre === nombre && i.imagen_url);
  return match ? match.imagen_url : null;
}

/* Igual que componentImageUrl, pero para las fotos del recorrido de una
   alerta (página Cómo funciona), si el administrador aún no subió esa foto,
   cae en el archivo estático de referencia (fallback) para no dejar un
   espacio vacío. */

function recorridoImageUrl(nombre, fallback){
  const items = PRODUCTO_ITEMS.recorrido || [];
  const match = items.find(i => i.nombre === nombre && i.imagen_url);
  return match ? match.imagen_url : fallback;
}

/* Preguntas frecuentes (contenido estático institucional)  */

const FAQ = [
  { cat:"Usuarios", q:"¿Qué es SAVE?", a:"SAVE (Sistema de Alerta Vital Por Entornos) es un sistema tecnológico que detecta señales compatibles con una emergencia médica —ataque cardíaco, ACV, crisis epiléptica o, como caso secundario, arritmia— y activa una alerta en el entorno físico inmediato para que las personas presentes puedan reconocerla y actuar." },
  { cat:"Usuarios", q:"¿Cómo funciona?", a:"Una pulsera wearable monitorea continuamente signos vitales. Si detecta una condición de riesgo sostenida, se abre una ventana de cancelación para descartar falsas alarmas. Si la persona no cancela, se activa el nodo SAVE más cercano, que emite señales visuales y sonoras, mientras el sistema notifica en paralelo al centro de salud correspondiente." },
  { cat:"Usuarios", q:"¿Qué ocurre cuando se genera una alerta?", a:"El nodo SAVE del entorno activa paneles LED y una alerta sonora con instrucciones básicas para las personas presentes, orientadas al tipo de emergencia detectada. En paralelo, se envía la notificación hacia el centro de salud, sin que nadie tenga que llamar por teléfono." },
  { cat:"Usuarios", q:"¿Cómo se cancela una alerta accidental?", a:"Durante la ventana de pre-alerta (los primeros segundos tras la detección), la persona puede cancelar la alarma directamente desde la pulsera mediante un botón de cancelación, antes de que se active el nodo del entorno." },
  { cat:"Usuarios", q:"¿Qué información registra el sistema?", a:"El sistema registra las variables fisiológicas necesarias para la detección (frecuencia cardíaca, oxigenación, temperatura y actividad eléctrica del corazón) y el historial de alertas del dispositivo. El detalle del tratamiento de datos se rige por la política de privacidad del proyecto." },
  { cat:"Personas cercanas a un nodo", q:"¿Qué significa una alerta?", a:"Una alerta activa en un nodo SAVE significa que el sistema detectó, en una persona cercana, señales compatibles con una emergencia médica y que esa persona no canceló la pre-alerta. No es una alarma de incendio ni de seguridad: es una alerta médica." },
  { cat:"Personas cercanas a un nodo", q:"¿Qué debo hacer si veo una alerta?", a:"Acércate a la persona indicada por el nodo, sigue las instrucciones básicas que el sistema entrega en pantalla o por voz, y mantén la calma: el centro de salud ya fue notificado automáticamente en paralelo, no es necesario que tú llames." },
  { cat:"Personas cercanas a un nodo", q:"¿Cómo puedo identificar un nodo SAVE?", a:"Los nodos SAVE cuentan con paneles LED y una identidad visual reconocible, mostrados de forma consistente en la página de Red de nodos. En una emergencia, el nodo pasa de estado inactivo a un estado de alerta claramente distinguible." },
  { cat:"Empresas y personas", q:"¿Cómo puedo solicitar el servicio?", a:"A través de la página Solicitar el servicio, ya sea como organización o como persona natural, indicando el tipo de producto o instalación que necesitas y tu ubicación. El equipo de SAVE se pondrá en contacto para evaluar la solicitud." },
  { cat:"Empresas y personas", q:"¿Qué infraestructura necesito?", a:"Un nodo de entorno requiere alimentación eléctrica y, según el modelo, conectividad WiFi o 4G. La pulsera y la app de monitoreo personal no requieren infraestructura adicional, solo un teléfono con Bluetooth. El equipo de SAVE evalúa cada caso durante el proceso de solicitud." },
  { cat:"Empresas y personas", q:"¿Puedo cotizar sin comprometerme a instalar nodos?", a:"Sí. La página Solicitar el servicio incluye un formulario de cotización rápida para personas naturales interesadas en la pulsera, la app de monitoreo o el nodo móvil, sin necesidad de representar a una organización." },
  { cat:"Tecnología", q:"¿Cómo se comunican los dispositivos?", a:"La pulsera se comunica con el nodo mediante Bluetooth de baja energía (BLE), y el nodo se comunica con el backend mediante HTTPS/REST mediante conexión WiFi o 4G, según el entorno de instalación." },
  { cat:"Tecnología", q:"¿Qué ocurre con la información?", a:"La información fisiológica y de alertas se transmite de forma cifrada hacia el backend del sistema, que centraliza el registro para permitir el seguimiento del estado de cada alerta y su comunicación con el centro de salud correspondiente." },
  { cat:"Tecnología", q:"¿Qué medidas de seguridad contempla el sistema?", a:"Las alertas solo son aceptadas de pulseras autorizadas mediante un identificador único (UUID), la comunicación BLE utiliza cifrado nativo, y la comunicación con el backend utiliza TLS. El sistema está diseñado para prevenir activaciones no autorizadas de los nodos." },
];

/* Tecnología (Quiénes somos) */

const TECH_COMPONENTS = [
  { icon:"ic-alert", nombre:"Nodo SAVE (panel LED)", desc:"El corazón del sistema: recibe la alerta, avisa al entorno con luz y sonido, y muestra instrucciones básicas para que las personas presentes puedan ayudar de inmediato, sin cometer errores." },
  { icon:"ic-watch", nombre:"Pulsera wearable", desc:"Dispositivo de uso preventivo que mide continuamente frecuencia cardíaca, oxigenación, temperatura y actividad eléctrica del corazón." },
  { icon:"ic-pulse", nombre:"Sensores", desc:"MAX30102 (pulso y SpO₂), DS18B20 (temperatura) y AD8232 (electrocardiograma de un canal), integrados en la pulsera." },
  { icon:"ic-node", nombre:"ESP32-C3", desc:"Microcontrolador de bajo consumo con WiFi y Bluetooth integrados, que ejecuta localmente la lógica de detección y cancelación." },
  { icon:"ic-building", nombre:"Comunicación BLE", desc:"La pulsera y el Nodo SAVE se comunican por Bluetooth de baja energía, con cifrado nativo y sin depender de infraestructura adicional." },
  { icon:"ic-shield", nombre:"Backend", desc:"Plataforma en tiempo real que centraliza el registro de alertas y habilita la comunicación automática con el centro de salud correspondiente." },
  { icon:"ic-mail", nombre:"Sistema de notificaciones", desc:"Envío automático de la alerta hacia el centro de salud y, como canal secundario, un aviso al contacto de emergencia registrado." },
];

/* Carga inicial desde el backend */

let DATA_READY = null; // Promise que resuelve cuando ya cargaron los datos base

function cargarDatosIniciales() {
  if (DATA_READY) return DATA_READY;
  DATA_READY = Promise.all([
    Api.nodos().then(r => { NODES = r.resultados; }).catch(() => { NODES = []; }),
    Api.empresas().then(r => { COMPANIES = r.resultados; }).catch(() => { COMPANIES = []; }),
    Api.casos().then(r => {
      CASES = r.resultados.map(c => ({
        id: c.id, titulo: c.titulo, fecha: c.fecha, lugar: c.lugar, tipo: c.tipo,
        factType: c.fact_type, hecho: c.hecho, problema: c.problema, fuente: c.fuente,
        fuenteDoi: c.fuente_doi, url: c.url, fechaPublicacion: c.fecha_publicacion,
        imagenUrl: c.imagen_url,
      }));
    }).catch(() => { CASES = []; }),
    Api.noticias().then(r => {
      NEWS = r.resultados.map(n => ({ ...n, id: n.slug }));
    }).catch(() => { NEWS = []; }),
    Api.lanzamientos().then(r => { LANZAMIENTOS = r.resultados; }).catch(() => { LANZAMIENTOS = []; }),
    Api.equipo().then(r => { TEAM = r.resultados; }).catch(() => { TEAM = []; }),
    Api.producto().then(r => {
      PRODUCTO_ITEMS = { nodo_led: [], pulsera: [], app: [], nodo_movil: [], componentes: [], recorrido: [] };
      r.resultados.forEach(item => {
        if (!PRODUCTO_ITEMS[item.producto]) PRODUCTO_ITEMS[item.producto] = [];
        PRODUCTO_ITEMS[item.producto].push(item);
      });
    }).catch(() => {}),
  ]);
  return DATA_READY;
}

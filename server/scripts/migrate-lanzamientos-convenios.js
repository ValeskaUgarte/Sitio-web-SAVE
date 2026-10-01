// Migración puntual (2026): actualiza datos de un sitio SAVE ya en uso para
// reflejar el nuevo criterio de "lanzamientos" (= escalabilidad futura del
// sistema, no lo que ya se está prototipando) y agrega la categoría de
// empresas/instituciones en convenio, con INACAP como primer registro.
//
// Es seguro ejecutarlo más de una vez: no duplica datos.
// Ejecutar con: node server/scripts/migrate-lanzamientos-convenios.js

const db = require("../db/db");
const { slugify } = require("../utils");

function moverLanzamientosViejosANoticias() {
  const viejos = db.prepare(`
    SELECT * FROM lanzamientos
    WHERE titulo IN (
      'Nodo SAVE (paneles LED) y pre-alerta',
      'Backend y notificaciones en tiempo real',
      'App móvil — comunidad de apoyo',
      'Panel de administración y validación',
      'Integración y pruebas de campo'
    )
  `).all();

  if (!viejos.length) {
    console.log("lanzamientos: no hay registros antiguos de prototipado que migrar.");
    return;
  }

  const yaExiste = db.prepare("SELECT id FROM noticias WHERE slug = ?").get("avanza-el-prototipado-del-nucleo-del-sistema-nodo-backend-app-y-panel");
  if (!yaExiste) {
    const titulo = "Avanza el prototipado del núcleo del sistema: nodo, backend, app y panel";
    db.prepare(`
      INSERT INTO noticias (titulo, slug, fecha, autor, categoria, resumen, contenido, tags, publicado, destacado)
      VALUES (@titulo, @slug, @fecha, @autor, @categoria, @resumen, @contenido, @tags, 1, 1)
    `).run({
      titulo, slug: slugify(titulo), fecha: "2026", autor: "Equipo SAVE", categoria: "Tecnología",
      resumen: "El equipo se encuentra prototipando en paralelo los cinco componentes centrales de SAVE: el Nodo SAVE con paneles LED, el backend con notificaciones en tiempo real, la app móvil de comunidad de apoyo, el panel de administración y la integración completa del sistema.",
      contenido: "Con la arquitectura técnica ya definida, el equipo entró en la etapa de prototipado activo de los componentes centrales del sistema. El Nodo SAVE —paneles LED y señal sonora que avisan al entorno y guían con instrucciones básicas durante la ventana de cancelación de la pulsera— ya tiene su primer prototipo funcional. En paralelo avanza el backend con registro de usuarios y notificación automática en tiempo real a centros de salud y contactos de emergencia, la app móvil que permitirá a cualquier persona sumarse como nodo de apoyo comunitario, y el panel de administración con historial de alertas y gestión de la red de nodos. La siguiente etapa es la integración completa del sistema y las primeras pruebas de campo con usuarios reales antes del lanzamiento formal.",
      tags: JSON.stringify(["prototipado", "nodo SAVE", "backend", "app móvil"]),
    });
    console.log("noticias: se creó la noticia de resumen del prototipado actual.");
  } else {
    console.log("noticias: la noticia de resumen del prototipado ya existía, se omite.");
  }

  const ids = viejos.map((v) => v.id);
  db.prepare(`DELETE FROM lanzamientos WHERE id IN (${ids.map(() => "?").join(",")})`).run(...ids);
  console.log(`lanzamientos: ${ids.length} registros antiguos de prototipado eliminados (ya migrados a noticias).`);
}

function crearLanzamientosEscalabilidad() {
  const nuevos = [
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
  let creados = 0;
  nuevos.forEach((n) => {
    const existe = db.prepare("SELECT id FROM lanzamientos WHERE titulo = ?").get(n.titulo);
    if (!existe) { insert.run(n); creados++; }
  });
  console.log(`lanzamientos: ${creados} registros de escalabilidad futura creados (de ${nuevos.length}).`);
}

function crearConvenioInacap() {
  const existe = db.prepare("SELECT id FROM empresas WHERE nombre = ?").get("INACAP");
  if (existe) { console.log("empresas: INACAP ya está registrado, se omite."); return; }
  db.prepare(`
    INSERT INTO empresas (nombre, categoria, descripcion, estado, tipo_relacion, sitio_web, demo)
    VALUES (@nombre, @categoria, @descripcion, @estado, @tipo_relacion, @sitio_web, 0)
  `).run({
    nombre: "INACAP", categoria: "Educación superior",
    descripcion: "Instituto Nacional de Capacitación Profesional. Primera institución que apoya el desarrollo del proyecto SAVE, respaldando su prototipado desde el ámbito académico.",
    estado: "Activa", tipo_relacion: "convenio", sitio_web: "https://www.inacap.cl",
  });
  console.log("empresas: INACAP creado como primer convenio de apoyo institucional.");
}

function marcarEmpresasExistentesComoImplementadoras() {
  const info = db.prepare(`
    UPDATE empresas SET tipo_relacion = 'implementadora'
    WHERE tipo_relacion IS NULL OR tipo_relacion = ''
  `).run();
  if (info.changes) console.log(`empresas: ${info.changes} registros existentes marcados como 'implementadora' por defecto.`);
}

moverLanzamientosViejosANoticias();
crearLanzamientosEscalabilidad();
marcarEmpresasExistentesComoImplementadoras();
crearConvenioInacap();
console.log("\nMigración completa.");

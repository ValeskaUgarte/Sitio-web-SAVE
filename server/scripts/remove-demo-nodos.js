// Elimina de la base de datos los nodos de demostración (los marcados como
// "Demo" en el panel de administración → Nodos SAVE). Sirven solo para que
// el sitio no se vea vacío mientras no hay nodos reales; no corresponden a
// instalaciones existentes.
//
// No toca los paraderos/estaciones (tabla "paraderos") ni los nodos que tú
// hayas creado (los que no están marcados como Demo).
//
// Ejecutar con: npm run remove:demo-nodos

const db = require("../db/db");

const demos = db.prepare("SELECT id, nombre FROM nodos WHERE demo = 1").all();

if (!demos.length) {
  console.log("No hay nodos de demostración en la base de datos. No se eliminó nada.");
  process.exit(0);
}

console.log(`Se eliminarán ${demos.length} nodo(s) de demostración:`);
demos.forEach((n) => console.log(`  - [${n.id}] ${n.nombre}`));

const info = db.prepare("DELETE FROM nodos WHERE demo = 1").run();
const restantes = db.prepare("SELECT COUNT(*) AS n FROM nodos").get().n;
console.log(`\nListo. Eliminados: ${info.changes}. Nodos que quedan: ${restantes}.`);
console.log("Recarga la página del sitio (F5) para ver el cambio.");

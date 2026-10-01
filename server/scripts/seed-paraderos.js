// Carga a la base de datos los paraderos y estaciones reales extraídos del
// consolidado anual de Registro de Paradas del sistema RED (Transantiago),
// entregado por el usuario en formato Excel. Las coordenadas originales
// venían en UTM huso 19S y ya fueron convertidas a lat/lng (WGS84).
//
// Ejecutar con: npm run seed:paraderos

const fs = require("fs");
const path = require("path");
const db = require("../db/db");

const RAW_PATH = path.join(__dirname, "paraderos-raw.json");

function detectarTipo(nombre) {
  // Los nombres de paradero del sistema RED marcan las combinaciones con
  // Metro usando el prefijo "(M)", ej: "Parada 7 / (M) Macul".
  if (/\(M\)/i.test(nombre)) return "metro";
  return "paradero";
}

function run() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error("No se encontró paraderos-raw.json. Coloca el archivo exportado en server/scripts/.");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf-8"));
  console.log(`Leyendo ${raw.length} paraderos desde el archivo...`);

  const insert = db.prepare(`
    INSERT INTO paraderos (codigo, codigo_ts, nombre, comuna, eje, entre1, entre2, lat, lng, tipo, zona_paga)
    VALUES (@codigo, @codigo_ts, @nombre, @comuna, @eje, @entre1, @entre2, @lat, @lng, @tipo, @zona_paga)
    ON CONFLICT(codigo) DO UPDATE SET
      codigo_ts=excluded.codigo_ts, nombre=excluded.nombre, comuna=excluded.comuna,
      eje=excluded.eje, entre1=excluded.entre1, entre2=excluded.entre2,
      lat=excluded.lat, lng=excluded.lng, tipo=excluded.tipo, zona_paga=excluded.zona_paga
  `);

  const insertMany = db.transaction((rows) => {
    let count = 0;
    for (const r of rows) {
      if (!r.codigo || typeof r.lat !== "number" || typeof r.lng !== "number") continue;
      // Filtro de sanidad: coordenadas deben caer dentro de un rango razonable
      // de la Región Metropolitana de Santiago, Chile.
      if (r.lat > -32.5 || r.lat < -34.3 || r.lng > -69.9 || r.lng < -71.3) continue;
      insert.run({
        codigo: r.codigo,
        codigo_ts: r.codigo_ts || null,
        nombre: r.nombre || r.codigo,
        comuna: r.comuna || null,
        eje: r.eje || null,
        entre1: r.entre1 || null,
        entre2: r.entre2 || null,
        lat: r.lat,
        lng: r.lng,
        tipo: detectarTipo(r.nombre || ""),
        zona_paga: r.zona_paga ? 1 : 0,
      });
      count++;
    }
    return count;
  });

  const inserted = insertMany(raw);
  console.log(`Listo. ${inserted} paraderos/estaciones cargados en la base de datos.`);
  console.log(`Por defecto quedan INACTIVOS (no visibles en el sitio) hasta que los actives uno por uno o en lote desde el panel de administración → Paraderos y estaciones.`);

  const totals = db.prepare("SELECT tipo, COUNT(*) as n, SUM(activo) as activos FROM paraderos GROUP BY tipo").all();
  totals.forEach(t => console.log(`  - ${t.tipo}: ${t.n} totales, ${t.activos || 0} activos`));
}

run();

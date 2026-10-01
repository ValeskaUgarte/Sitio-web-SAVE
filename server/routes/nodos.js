const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");
const { haversineKm, genNodeTraceCode } = require("../utils");
const { geocodificarDireccion } = require("../services/geocoding");

const router = express.Router();

function parseRow(n) {
  return { ...n, servicios: n.servicios ? JSON.parse(n.servicios) : [], demo: !!n.demo, activo: !!n.activo };
}

// GET /api/nodos?tipo=..&activo=1&categoria_instalacion=..
// El sitio público debe pedir siempre activo=1: solo nodos validados por el
// administrador aparecen en la web oficial.
router.get("/", (req, res) => {
  const { tipo, activo, categoria_instalacion } = req.query;
  let sql = "SELECT * FROM nodos WHERE 1=1";
  const params = [];
  if (tipo && tipo !== "Todos") { sql += " AND tipo = ?"; params.push(tipo); }
  if (categoria_instalacion && categoria_instalacion !== "Todas") { sql += " AND categoria_instalacion = ?"; params.push(categoria_instalacion); }
  if (activo === "1" || activo === "0") { sql += " AND activo = ?"; params.push(activo === "1" ? 1 : 0); }
  sql += " ORDER BY creado_en DESC";
  const rows = db.prepare(sql).all(...params).map(parseRow);
  res.json({ resultados: rows });
});

router.get("/cercanos", (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "Parámetros lat y lng son obligatorios." });
  }
  const radioKm = req.query.radio ? parseFloat(req.query.radio) : 5;
  const incluirInactivos = req.query.incluirInactivos === "1";
  let sql = "SELECT * FROM nodos WHERE lat IS NOT NULL AND lng IS NOT NULL";
  if (!incluirInactivos) sql += " AND activo = 1";
  const rows = db.prepare(sql).all().map(parseRow);
  const withDistance = rows
    .map((n) => ({ ...n, distancia_km: Math.round(haversineKm(lat, lng, n.lat, n.lng) * 1000) / 1000 }))
    .filter((n) => n.distancia_km <= radioKm)
    .sort((a, b) => a.distancia_km - b.distancia_km);
  res.json({ resultados: withDistance });
});

// GET /api/nodos/meta/resumen — conteos para el panel de administración
router.get("/meta/resumen", requireAdmin, (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as n FROM nodos").get().n;
  const activos = db.prepare("SELECT COUNT(*) as n FROM nodos WHERE activo = 1").get().n;
  const porCategoria = db.prepare("SELECT categoria_instalacion, COUNT(*) as n FROM nodos GROUP BY categoria_instalacion").all();
  res.json({ total, activos, inactivos: total - activos, porCategoria });
});

// POST /api/nodos/geocodificar  { direccion, comuna, region }
// Convierte una dirección en coordenadas para instalaciones futuras
// (hogares, empresas, comunidades) sin que el administrador deba buscar
// las coordenadas a mano.
router.post("/geocodificar", requireAdmin, async (req, res) => {
  const { direccion, comuna, region } = req.body || {};
  if (!direccion) return res.status(400).json({ error: "Debes indicar una dirección." });
  const resultado = await geocodificarDireccion(direccion, comuna, region);
  res.json(resultado);
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM nodos WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Nodo no encontrado." });
  res.json(parseRow(row));
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.nombre || !b.tipo) return res.status(400).json({ error: "nombre y tipo son obligatorios." });
  const codigo_trazabilidad = genNodeTraceCode(b.tipo);
  const info = db.prepare(`
    INSERT INTO nodos (codigo_trazabilidad, nombre, tipo, categoria_instalacion, direccion, comuna, lat, lng, organizacion, estado, activo, fecha, descripcion, servicios, paradero_id, imagen_url, demo)
    VALUES (@codigo_trazabilidad, @nombre, @tipo, @categoria_instalacion, @direccion, @comuna, @lat, @lng, @organizacion, @estado, @activo, @fecha, @descripcion, @servicios, @paradero_id, @imagen_url, @demo)
  `).run({
    codigo_trazabilidad,
    nombre: b.nombre, tipo: b.tipo, categoria_instalacion: b.categoria_instalacion || "publico",
    direccion: b.direccion || null, comuna: b.comuna || null,
    lat: b.lat ?? null, lng: b.lng ?? null, organizacion: b.organizacion || null,
    estado: b.estado || "Planificado", activo: b.activo ? 1 : 0, fecha: b.fecha || null,
    descripcion: b.descripcion || null, servicios: JSON.stringify(b.servicios || []),
    paradero_id: b.paradero_id || null, imagen_url: b.imagen_url || null, demo: b.demo ? 1 : 0,
  });
  res.status(201).json({ id: info.lastInsertRowid, codigo_trazabilidad });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM nodos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Nodo no encontrado." });
  const b = req.body || {};
  db.prepare(`
    UPDATE nodos SET nombre=?, tipo=?, categoria_instalacion=?, direccion=?, comuna=?, lat=?, lng=?, organizacion=?, estado=?, activo=?, fecha=?, descripcion=?, servicios=?, paradero_id=?, imagen_url=?, demo=?, actualizado_en=datetime('now')
    WHERE id=?
  `).run(
    b.nombre ?? existing.nombre, b.tipo ?? existing.tipo,
    b.categoria_instalacion ?? existing.categoria_instalacion,
    b.direccion ?? existing.direccion,
    b.comuna ?? existing.comuna, b.lat ?? existing.lat, b.lng ?? existing.lng,
    b.organizacion ?? existing.organizacion, b.estado ?? existing.estado,
    b.activo !== undefined ? (b.activo ? 1 : 0) : existing.activo,
    b.fecha ?? existing.fecha,
    b.descripcion ?? existing.descripcion, JSON.stringify(b.servicios ?? JSON.parse(existing.servicios || "[]")),
    b.paradero_id ?? existing.paradero_id, b.imagen_url ?? existing.imagen_url,
    b.demo !== undefined ? (b.demo ? 1 : 0) : existing.demo,
    req.params.id
  );
  res.json({ ok: true });
});

// PATCH /api/nodos/:id/activo  { activo: true|false }
router.patch("/:id/activo", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT id FROM nodos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Nodo no encontrado." });
  const activo = req.body && req.body.activo ? 1 : 0;
  db.prepare("UPDATE nodos SET activo = ?, actualizado_en=datetime('now') WHERE id = ?").run(activo, req.params.id);
  res.json({ ok: true, activo: !!activo });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM nodos WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

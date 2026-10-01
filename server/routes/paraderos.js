const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");
const { haversineKm } = require("../utils");

const router = express.Router();

// GET /api/paraderos/cercanos?lat=..&lng=..&radio=1.5&limite=20&tipo=metro|paradero
// Por defecto solo devuelve paraderos ACTIVOS (validados desde el panel de
// administración): son los únicos que debe ver el público en el sitio. Pasa
// incluirInactivos=1 solo para vistas de administración.
router.get("/cercanos", (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radioKm = req.query.radio ? parseFloat(req.query.radio) : 2;
  const limite = req.query.limite ? Math.min(parseInt(req.query.limite, 10), 100) : 20;
  const tipo = req.query.tipo;
  const incluirInactivos = req.query.incluirInactivos === "1";

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "Parámetros lat y lng son obligatorios y deben ser números." });
  }

  const deltaLat = radioKm / 111;
  const deltaLng = radioKm / (111 * Math.cos((lat * Math.PI) / 180));

  let sql = `
    SELECT id, codigo, nombre, comuna, eje, lat, lng, tipo, zona_paga, activo, linea_metro, combinaciones
    FROM paraderos
    WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
  `;
  const params = [lat - deltaLat, lat + deltaLat, lng - deltaLng, lng + deltaLng];
  if (!incluirInactivos) sql += " AND activo = 1";
  if (tipo) { sql += " AND tipo = ?"; params.push(tipo); }

  const rows = db.prepare(sql).all(...params);

  const withDistance = rows
    .map((r) => ({ ...r, distancia_km: Math.round(haversineKm(lat, lng, r.lat, r.lng) * 1000) / 1000 }))
    .filter((r) => r.distancia_km <= radioKm)
    .sort((a, b) => a.distancia_km - b.distancia_km)
    .slice(0, limite);

  res.json({ origen: { lat, lng }, radio_km: radioKm, total: withDistance.length, resultados: withDistance });
});

// GET /api/paraderos?comuna=..&tipo=..&q=..&activo=0|1&page=1&pageSize=50
router.get("/", (req, res) => {
  const { comuna, tipo, q, activo } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 50, 500);

  let where = "WHERE 1=1";
  const params = [];
  if (comuna) { where += " AND comuna = ?"; params.push(comuna); }
  if (tipo) { where += " AND tipo = ?"; params.push(tipo); }
  if (activo === "1" || activo === "0") { where += " AND activo = ?"; params.push(activo === "1" ? 1 : 0); }
  if (q) { where += " AND (nombre LIKE ? OR codigo LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }

  const total = db.prepare(`SELECT COUNT(*) as n FROM paraderos ${where}`).get(...params).n;
  const rows = db.prepare(`
    SELECT id, codigo, nombre, comuna, eje, lat, lng, tipo, zona_paga, activo, linea_metro, combinaciones
    FROM paraderos ${where}
    ORDER BY activo DESC, comuna, nombre
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize);

  res.json({ total, page, pageSize, resultados: rows });
});

// GET /api/paraderos/meta/comunas
router.get("/meta/comunas", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT comuna FROM paraderos WHERE comuna IS NOT NULL ORDER BY comuna").all();
  res.json({ comunas: rows.map((r) => r.comuna) });
});

// GET /api/paraderos/meta/resumen — conteos rápidos para el panel de administración
router.get("/meta/resumen", requireAdmin, (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as n FROM paraderos").get().n;
  const activos = db.prepare("SELECT COUNT(*) as n FROM paraderos WHERE activo = 1").get().n;
  const porTipo = db.prepare("SELECT tipo, COUNT(*) as n, SUM(activo) as activos FROM paraderos GROUP BY tipo").all();
  res.json({ total, activos, inactivos: total - activos, porTipo });
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM paraderos WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Paradero no encontrado." });
  res.json(row);
});

// ---- Administración (requiere sesión de admin) ----

// POST /api/paraderos — creación manual, para puntos que el Ministerio de
// Transportes agregue o modifique y que aún no estén en el registro cargado.
router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.nombre || b.lat === undefined || b.lng === undefined) {
    return res.status(400).json({ error: "nombre, lat y lng son obligatorios." });
  }
  const codigo = b.codigo && b.codigo.trim() ? b.codigo.trim() : `MANUAL-${Date.now().toString(36).toUpperCase()}`;
  try {
    const info = db.prepare(`
      INSERT INTO paraderos (codigo, codigo_ts, nombre, comuna, eje, entre1, entre2, lat, lng, tipo, zona_paga, activo, linea_metro, combinaciones)
      VALUES (@codigo, @codigo_ts, @nombre, @comuna, @eje, @entre1, @entre2, @lat, @lng, @tipo, @zona_paga, @activo, @linea_metro, @combinaciones)
    `).run({
      codigo, codigo_ts: b.codigo_ts || null, nombre: b.nombre, comuna: b.comuna || null,
      eje: b.eje || null, entre1: b.entre1 || null, entre2: b.entre2 || null,
      lat: parseFloat(b.lat), lng: parseFloat(b.lng), tipo: b.tipo || "paradero",
      zona_paga: b.zona_paga ? 1 : 0, activo: b.activo ? 1 : 0,
      linea_metro: b.linea_metro || null, combinaciones: b.combinaciones || null,
    });
    res.status(201).json({ id: info.lastInsertRowid, codigo });
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Ya existe un paradero con ese código." });
    }
    res.status(500).json({ error: "No se pudo crear el paradero." });
  }
});

router.put("/:id", requireAdmin, (req, res) => {
  const b = req.body || {};
  const existing = db.prepare("SELECT * FROM paraderos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Paradero no encontrado." });
  db.prepare(`
    UPDATE paraderos SET nombre=?, comuna=?, eje=?, lat=?, lng=?, tipo=?, zona_paga=?, activo=?, linea_metro=?, combinaciones=?
    WHERE id=?
  `).run(
    b.nombre ?? existing.nombre, b.comuna ?? existing.comuna, b.eje ?? existing.eje,
    b.lat ?? existing.lat, b.lng ?? existing.lng, b.tipo ?? existing.tipo,
    b.zona_paga !== undefined ? (b.zona_paga ? 1 : 0) : existing.zona_paga,
    b.activo !== undefined ? (b.activo ? 1 : 0) : existing.activo,
    b.linea_metro ?? existing.linea_metro, b.combinaciones ?? existing.combinaciones,
    req.params.id
  );
  res.json({ ok: true });
});

// PATCH /api/paraderos/:id/activo  { activo: true|false } — activación rápida
// de un punto del registro oficial, sin tener que abrir un formulario.
router.patch("/:id/activo", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT id FROM paraderos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Paradero no encontrado." });
  const activo = req.body && req.body.activo ? 1 : 0;
  db.prepare("UPDATE paraderos SET activo = ? WHERE id = ?").run(activo, req.params.id);
  res.json({ ok: true, activo: !!activo });
});

// PATCH /api/paraderos/activar-lote  { ids: [1,2,3], activo: true|false }
router.patch("/activar-lote", requireAdmin, (req, res) => {
  const { ids, activo } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: "Debes indicar una lista de ids." });
  }
  const val = activo ? 1 : 0;
  const stmt = db.prepare("UPDATE paraderos SET activo = ? WHERE id = ?");
  const tx = db.transaction((rows) => { rows.forEach((id) => stmt.run(val, id)); });
  tx(ids);
  res.json({ ok: true, actualizados: ids.length, activo: !!val });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM paraderos WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

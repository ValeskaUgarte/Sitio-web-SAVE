const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const { categoria, tipo_relacion } = req.query;
  let sql = "SELECT * FROM empresas WHERE 1=1";
  const params = [];
  if (categoria && categoria !== "Todas") {
    sql += " AND categoria = ?";
    params.push(categoria);
  }
  if (tipo_relacion) {
    sql += " AND tipo_relacion = ?";
    params.push(tipo_relacion);
  }
  sql += " ORDER BY creado_en DESC";
  const rows = db.prepare(sql).all(...params).map((e) => ({ ...e, demo: !!e.demo }));
  res.json({ resultados: rows });
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM empresas WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Empresa no encontrada." });
  res.json({ ...row, demo: !!row.demo });
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.nombre) return res.status(400).json({ error: "nombre es obligatorio." });
  const info = db.prepare(`
    INSERT INTO empresas (nombre, categoria, descripcion, ubicacion, nodos, fecha, estado, logo_url, sitio_web, tipo_relacion, demo)
    VALUES (@nombre, @categoria, @descripcion, @ubicacion, @nodos, @fecha, @estado, @logo_url, @sitio_web, @tipo_relacion, @demo)
  `).run({
    nombre: b.nombre, categoria: b.categoria || null, descripcion: b.descripcion || null,
    ubicacion: b.ubicacion || null, nodos: b.nodos || null, fecha: b.fecha || null,
    estado: b.estado || "Activa", logo_url: b.logo_url || null, sitio_web: b.sitio_web || null,
    tipo_relacion: b.tipo_relacion || "implementadora",
    demo: b.demo ? 1 : 0,
  });
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM empresas WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Empresa no encontrada." });
  const b = req.body || {};
  db.prepare(`
    UPDATE empresas SET nombre=?, categoria=?, descripcion=?, ubicacion=?, nodos=?, fecha=?, estado=?, logo_url=?, sitio_web=?, tipo_relacion=?, demo=?
    WHERE id=?
  `).run(
    b.nombre ?? existing.nombre, b.categoria ?? existing.categoria, b.descripcion ?? existing.descripcion,
    b.ubicacion ?? existing.ubicacion, b.nodos ?? existing.nodos, b.fecha ?? existing.fecha,
    b.estado ?? existing.estado, b.logo_url ?? existing.logo_url, b.sitio_web ?? existing.sitio_web,
    b.tipo_relacion ?? existing.tipo_relacion,
    b.demo !== undefined ? (b.demo ? 1 : 0) : existing.demo, req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM empresas WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

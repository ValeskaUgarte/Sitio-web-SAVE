const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM lanzamientos ORDER BY orden ASC, creado_en DESC").all()
    .map((l) => ({ ...l, destacado_home: !!l.destacado_home }));
  res.json({ resultados: rows });
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM lanzamientos WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Lanzamiento no encontrado." });
  res.json({ ...row, destacado_home: !!row.destacado_home });
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.titulo) return res.status(400).json({ error: "titulo es obligatorio." });
  const info = db.prepare(`
    INSERT INTO lanzamientos (titulo, descripcion, fecha_estimada, fecha_exacta, estado, orden, imagen_url, destacado_home)
    VALUES (@titulo, @descripcion, @fecha_estimada, @fecha_exacta, @estado, @orden, @imagen_url, @destacado_home)
  `).run({
    titulo: b.titulo, descripcion: b.descripcion || null, fecha_estimada: b.fecha_estimada || null,
    fecha_exacta: b.fecha_exacta || null, estado: b.estado || "proximamente", orden: b.orden || 0,
    imagen_url: b.imagen_url || null, destacado_home: b.destacado_home === false ? 0 : 1,
  });
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM lanzamientos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Lanzamiento no encontrado." });
  const b = req.body || {};
  db.prepare(`
    UPDATE lanzamientos SET titulo=?, descripcion=?, fecha_estimada=?, fecha_exacta=?, estado=?, orden=?, imagen_url=?, destacado_home=?
    WHERE id=?
  `).run(
    b.titulo ?? existing.titulo, b.descripcion ?? existing.descripcion,
    b.fecha_estimada ?? existing.fecha_estimada, b.fecha_exacta ?? existing.fecha_exacta,
    b.estado ?? existing.estado, b.orden ?? existing.orden, b.imagen_url ?? existing.imagen_url,
    b.destacado_home !== undefined ? (b.destacado_home ? 1 : 0) : existing.destacado_home,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM lanzamientos WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

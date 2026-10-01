const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const { tipo } = req.query;
  let sql = "SELECT * FROM casos WHERE 1=1";
  const params = [];
  if (tipo && tipo !== "Todos") { sql += " AND tipo = ?"; params.push(tipo); }
  sql += " ORDER BY creado_en DESC";
  res.json({ resultados: db.prepare(sql).all(...params) });
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.titulo) return res.status(400).json({ error: "titulo es obligatorio." });
  const info = db.prepare(`
    INSERT INTO casos (titulo, fecha, lugar, tipo, fact_type, hecho, problema, fuente, fuente_doi, url, fecha_publicacion, imagen_url)
    VALUES (@titulo, @fecha, @lugar, @tipo, @fact_type, @hecho, @problema, @fuente, @fuente_doi, @url, @fecha_publicacion, @imagen_url)
  `).run({
    titulo: b.titulo, fecha: b.fecha || null, lugar: b.lugar || null, tipo: b.tipo || null,
    fact_type: b.fact_type || null, hecho: b.hecho || null, problema: b.problema || null,
    fuente: b.fuente || null, fuente_doi: b.fuente_doi || null, url: b.url || null,
    fecha_publicacion: b.fecha_publicacion || null, imagen_url: b.imagen_url || null,
  });
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM casos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Caso no encontrado." });
  const b = req.body || {};
  db.prepare(`
    UPDATE casos SET titulo=?, fecha=?, lugar=?, tipo=?, fact_type=?, hecho=?, problema=?, fuente=?, fuente_doi=?, url=?, fecha_publicacion=?, imagen_url=?
    WHERE id=?
  `).run(
    b.titulo ?? existing.titulo, b.fecha ?? existing.fecha, b.lugar ?? existing.lugar,
    b.tipo ?? existing.tipo, b.fact_type ?? existing.fact_type, b.hecho ?? existing.hecho,
    b.problema ?? existing.problema, b.fuente ?? existing.fuente, b.fuente_doi ?? existing.fuente_doi,
    b.url ?? existing.url, b.fecha_publicacion ?? existing.fecha_publicacion,
    b.imagen_url ?? existing.imagen_url, req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM casos WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

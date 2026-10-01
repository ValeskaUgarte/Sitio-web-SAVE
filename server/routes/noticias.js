const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");
const { slugify } = require("../utils");

const router = express.Router();

function parseRow(n) {
  return { ...n, tags: n.tags ? JSON.parse(n.tags) : [], publicado: !!n.publicado, destacado: !!n.destacado };
}

// Público: solo noticias publicadas, salvo que se pida ?all=1 con sesión admin
router.get("/", (req, res) => {
  const soloPublicadas = !(req.query.all === "1" && req.session && req.session.adminId);
  const { categoria } = req.query;
  let sql = "SELECT * FROM noticias WHERE 1=1";
  const params = [];
  if (soloPublicadas) sql += " AND publicado = 1";
  if (categoria && categoria !== "Todas") { sql += " AND categoria = ?"; params.push(categoria); }
  sql += " ORDER BY creado_en DESC";
  const rows = db.prepare(sql).all(...params).map(parseRow);
  res.json({ resultados: rows });
});

router.get("/destacadas", (req, res) => {
  const rows = db.prepare("SELECT * FROM noticias WHERE publicado = 1 AND destacado = 1 ORDER BY creado_en DESC LIMIT 6").all().map(parseRow);
  res.json({ resultados: rows });
});

router.get("/:slugOrId", (req, res) => {
  const key = req.params.slugOrId;
  const row = /^\d+$/.test(key)
    ? db.prepare("SELECT * FROM noticias WHERE id = ?").get(key)
    : db.prepare("SELECT * FROM noticias WHERE slug = ?").get(key);
  if (!row) return res.status(404).json({ error: "Noticia no encontrada." });
  if (!row.publicado && !(req.session && req.session.adminId)) {
    return res.status(404).json({ error: "Noticia no encontrada." });
  }
  res.json(parseRow(row));
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.titulo) return res.status(400).json({ error: "titulo es obligatorio." });
  let slug = slugify(b.titulo);
  const exists = db.prepare("SELECT id FROM noticias WHERE slug = ?").get(slug);
  if (exists) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  const info = db.prepare(`
    INSERT INTO noticias (titulo, slug, fecha, autor, categoria, resumen, contenido, imagen_url, tags, publicado, destacado)
    VALUES (@titulo, @slug, @fecha, @autor, @categoria, @resumen, @contenido, @imagen_url, @tags, @publicado, @destacado)
  `).run({
    titulo: b.titulo, slug, fecha: b.fecha || new Date().toISOString().slice(0, 10),
    autor: b.autor || "Equipo SAVE", categoria: b.categoria || "Actualización",
    resumen: b.resumen || "", contenido: b.contenido || "", imagen_url: b.imagen_url || null,
    tags: JSON.stringify(b.tags || []), publicado: b.publicado === false ? 0 : 1, destacado: b.destacado ? 1 : 0,
  });
  res.status(201).json({ id: info.lastInsertRowid, slug });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM noticias WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Noticia no encontrada." });
  const b = req.body || {};
  db.prepare(`
    UPDATE noticias SET titulo=?, fecha=?, autor=?, categoria=?, resumen=?, contenido=?, imagen_url=?, tags=?, publicado=?, destacado=?
    WHERE id=?
  `).run(
    b.titulo ?? existing.titulo, b.fecha ?? existing.fecha, b.autor ?? existing.autor,
    b.categoria ?? existing.categoria, b.resumen ?? existing.resumen, b.contenido ?? existing.contenido,
    b.imagen_url ?? existing.imagen_url, JSON.stringify(b.tags ?? JSON.parse(existing.tags || "[]")),
    b.publicado !== undefined ? (b.publicado ? 1 : 0) : existing.publicado,
    b.destacado !== undefined ? (b.destacado ? 1 : 0) : existing.destacado,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM noticias WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

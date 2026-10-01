const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// producto: "pulsera" | "app" | "nodo_movil"
router.get("/", (req, res) => {
  const { producto } = req.query;
  let sql = "SELECT * FROM producto_items";
  const params = [];
  if (producto) { sql += " WHERE producto = ?"; params.push(producto); }
  sql += " ORDER BY producto, orden ASC";
  res.json({ resultados: db.prepare(sql).all(...params) });
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.producto || !b.nombre) return res.status(400).json({ error: "producto y nombre son obligatorios." });
  const info = db.prepare(`
    INSERT INTO producto_items (producto, nombre, descripcion, imagen_url, orden)
    VALUES (?, ?, ?, ?, ?)
  `).run(b.producto, b.nombre, b.descripcion || null, b.imagen_url || null, b.orden || 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM producto_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Ítem no encontrado." });
  const b = req.body || {};
  db.prepare(`UPDATE producto_items SET nombre=?, descripcion=?, imagen_url=?, orden=? WHERE id=?`).run(
    b.nombre ?? existing.nombre, b.descripcion ?? existing.descripcion,
    b.imagen_url ?? existing.imagen_url, b.orden ?? existing.orden, req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM producto_items WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

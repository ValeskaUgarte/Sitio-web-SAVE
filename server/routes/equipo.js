const express = require("express");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM equipo ORDER BY orden ASC, creado_en ASC").all();
  res.json({ resultados: rows });
});

router.post("/", requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.nombre) return res.status(400).json({ error: "nombre es obligatorio." });
  const info = db.prepare(`
    INSERT INTO equipo (nombre, rol, foto_url, orden)
    VALUES (@nombre, @rol, @foto_url, @orden)
  `).run({
    nombre: b.nombre, rol: b.rol || null, foto_url: b.foto_url || null,
    orden: Number.isFinite(b.orden) ? b.orden : (b.orden ? parseInt(b.orden, 10) : 0),
  });
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM equipo WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Integrante no encontrado." });
  const b = req.body || {};
  db.prepare(`UPDATE equipo SET nombre=?, rol=?, foto_url=?, orden=? WHERE id=?`).run(
    b.nombre ?? existing.nombre, b.rol ?? existing.rol, b.foto_url ?? existing.foto_url,
    b.orden !== undefined ? parseInt(b.orden, 10) || 0 : existing.orden, req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM equipo WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

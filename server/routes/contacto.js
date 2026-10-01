const express = require("express");
const rateLimit = require("express-rate-limit");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post("/", formLimiter, (req, res) => {
  const b = req.body || {};
  if (!b.nombre || !b.correo || !b.mensaje) {
    return res.status(400).json({ error: "nombre, correo y mensaje son obligatorios." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.correo)) {
    return res.status(400).json({ error: "El correo no es válido." });
  }
  const info = db.prepare(`
    INSERT INTO contactos (nombre, correo, asunto, motivo, mensaje, estado)
    VALUES (?, ?, ?, ?, ?, 'Nuevo')
  `).run(b.nombre, b.correo, b.asunto || null, b.motivo || null, b.mensaje);
  res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

router.get("/", requireAdmin, (req, res) => {
  res.json({ resultados: db.prepare("SELECT * FROM contactos ORDER BY creado_en DESC").all() });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM contactos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Mensaje no encontrado." });
  db.prepare("UPDATE contactos SET estado=? WHERE id=?").run(req.body.estado ?? existing.estado, req.params.id);
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM contactos WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

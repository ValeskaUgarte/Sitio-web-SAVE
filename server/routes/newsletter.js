const express = require("express");
const rateLimit = require("express-rate-limit");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post("/", formLimiter, (req, res) => {
  const b = req.body || {};
  if (!b.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.correo)) {
    return res.status(400).json({ error: "Correo inválido." });
  }
  try {
    db.prepare("INSERT INTO newsletter (nombre, correo) VALUES (?, ?)").run(b.nombre || null, b.correo);
    res.status(201).json({ ok: true });
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return res.status(200).json({ ok: true, note: "Ya estabas suscrito." });
    }
    res.status(500).json({ error: "Error al guardar la suscripción." });
  }
});

router.get("/", requireAdmin, (req, res) => {
  res.json({ resultados: db.prepare("SELECT * FROM newsletter ORDER BY creado_en DESC").all() });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM newsletter WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

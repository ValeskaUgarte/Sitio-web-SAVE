const express = require("express");
const rateLimit = require("express-rate-limit");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");
const { genCode } = require("../utils");

const router = express.Router();
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post("/", formLimiter, (req, res) => {
  const b = req.body || {};
  if (!b.nombre || !b.correo || !b.producto) {
    return res.status(400).json({ error: "nombre, correo y producto son obligatorios." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.correo)) {
    return res.status(400).json({ error: "El correo no es válido." });
  }
  const codigo = genCode("SAVE-COT");
  const info = db.prepare(`
    INSERT INTO cotizaciones (codigo, tipo_solicitante, nombre, correo, telefono, producto, cantidad, comuna, region, comentario, estado)
    VALUES (@codigo, @tipo_solicitante, @nombre, @correo, @telefono, @producto, @cantidad, @comuna, @region, @comentario, 'Nueva')
  `).run({
    codigo,
    tipo_solicitante: b.tipo_solicitante === "organizacion" ? "organizacion" : "persona",
    nombre: b.nombre,
    correo: b.correo,
    telefono: b.telefono || null,
    producto: b.producto,
    cantidad: b.cantidad ? parseInt(b.cantidad, 10) : 1,
    comuna: b.comuna || null,
    region: b.region || null,
    comentario: b.comentario || null,
  });
  res.status(201).json({ ok: true, codigo, id: info.lastInsertRowid });
});

router.get("/", requireAdmin, (req, res) => {
  const { estado } = req.query;
  let sql = "SELECT * FROM cotizaciones WHERE 1=1";
  const params = [];
  if (estado) { sql += " AND estado = ?"; params.push(estado); }
  sql += " ORDER BY creado_en DESC";
  res.json({ resultados: db.prepare(sql).all(...params) });
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM cotizaciones WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Cotización no encontrada." });
  const b = req.body || {};
  db.prepare("UPDATE cotizaciones SET estado=?, notas_internas=? WHERE id=?").run(
    b.estado ?? existing.estado, b.notas_internas ?? existing.notas_internas, req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM cotizaciones WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

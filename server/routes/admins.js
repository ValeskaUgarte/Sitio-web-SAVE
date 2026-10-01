const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

// Nunca se devuelve password_hash al frontend.
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT id, nombre, email, rol, creado_en FROM admins ORDER BY creado_en ASC").all();
  res.json({ resultados: rows, miId: req.session.adminId });
});

router.post("/", (req, res) => {
  const b = req.body || {};
  const email = String(b.email || "").trim().toLowerCase();
  if (!b.nombre || !email || !b.password) {
    return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." });
  }
  if (b.password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }
  const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "Ya existe un administrador con ese correo." });
  const hash = bcrypt.hashSync(b.password, 12);
  const info = db.prepare(`
    INSERT INTO admins (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)
  `).run(b.nombre, email, hash, b.rol || "admin");
  res.status(201).json({ id: info.lastInsertRowid });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.adminId) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta mientras tienes sesión iniciada." });
  }
  const total = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
  if (total <= 1) {
    return res.status(400).json({ error: "Debe quedar al menos un administrador." });
  }
  db.prepare("DELETE FROM admins WHERE id = ?").run(id);
  res.json({ ok: true });
});

// Cambiar la propia contraseña (requiere la contraseña actual).
router.post("/cambiar-password", (req, res) => {
  const b = req.body || {};
  const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.session.adminId);
  if (!admin) return res.status(401).json({ error: "No autenticado." });
  if (!bcrypt.compareSync(b.actual || "", admin.password_hash)) {
    return res.status(401).json({ error: "La contraseña actual no es correcta." });
  }
  if (!b.nueva || b.nueva.length < 8) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres." });
  }
  const hash = bcrypt.hashSync(b.nueva, 12);
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, admin.id);
  res.json({ ok: true });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const db = require("../db/db");

const router = express.Router();

// Protección contra fuerza bruta: máximo 8 intentos de login cada 15 minutos
// por IP. No distingue por correo a propósito (si distinguiera por correo,
// alguien podría usarlo para saber si un correo existe probando cuál se
// bloquea primero).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Espera unos minutos e intenta de nuevo." },
});

router.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }
  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(String(email).trim().toLowerCase());
  if (!admin) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }
  const ok = bcrypt.compareSync(password, admin.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }
  req.session.adminId = admin.id;
  req.session.adminEmail = admin.email;
  res.json({ ok: true, admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol } });
});

router.post("/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: "No autenticado." });
  }
  const admin = db.prepare("SELECT id, nombre, email, rol FROM admins WHERE id = ?").get(req.session.adminId);
  if (!admin) return res.status(401).json({ error: "No autenticado." });
  res.json({ admin });
});

module.exports = router;

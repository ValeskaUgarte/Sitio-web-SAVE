const express = require("express");
const rateLimit = require("express-rate-limit");
const db = require("../db/db");
const { requireAdmin } = require("../middleware/auth");
const { genCode } = require("../utils");

const router = express.Router();

// Límite de envíos para evitar spam del formulario público (20 envíos cada 15 min por IP)
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

function validarComun(b, res) {
  if (!b.nombre || !b.correo) {
    res.status(400).json({ error: "Nombre y correo son obligatorios." });
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.correo)) {
    res.status(400).json({ error: "El correo no es válido." });
    return false;
  }
  return true;
}

// Público: crear solicitud (organización o persona natural)
router.post("/", formLimiter, (req, res) => {
  const b = req.body || {};
  if (!validarComun(b, res)) return;

  const tipoSolicitante = b.tipo_solicitante === "persona" ? "persona" : "organizacion";
  if (tipoSolicitante === "organizacion" && (!b.tipo_organizacion || !b.nombre_organizacion)) {
    return res.status(400).json({ error: "Para organizaciones, tipo y nombre de la organización son obligatorios." });
  }

  const codigo = genCode("SAVE-REQ");
  const info = db.prepare(`
    INSERT INTO solicitudes (
      codigo, tipo_solicitante, nombre, correo, telefono, rut, cargo, organizacion, tipo_organizacion,
      direccion, comuna, region, sitio_web, tipo_servicio, cantidad_personas, cantidad_nodos,
      ubicaciones, descripcion_necesidad, info_adicional, medio_contacto, horario_preferido, estado
    ) VALUES (
      @codigo, @tipo_solicitante, @nombre, @correo, @telefono, @rut, @cargo, @organizacion, @tipo_organizacion,
      @direccion, @comuna, @region, @sitio_web, @tipo_servicio, @cantidad_personas, @cantidad_nodos,
      @ubicaciones, @descripcion_necesidad, @info_adicional, @medio_contacto, @horario_preferido, 'Recibida'
    )
  `).run({
    codigo,
    tipo_solicitante: tipoSolicitante,
    nombre: b.nombre,
    correo: b.correo,
    telefono: b.telefono || null,
    rut: b.rut || null,
    cargo: b.cargo || null,
    organizacion: b.nombre_organizacion || b.organizacion || null,
    tipo_organizacion: tipoSolicitante === "persona" ? "Persona natural" : (b.tipo_organizacion || null),
    direccion: b.direccion || null,
    comuna: b.comuna || null,
    region: b.region || null,
    sitio_web: b.sitio_web || null,
    tipo_servicio: b.tipo_servicio || null,
    cantidad_personas: b.cantidad_personas ? parseInt(b.cantidad_personas, 10) : null,
    cantidad_nodos: b.cantidad_nodos ? parseInt(b.cantidad_nodos, 10) : null,
    ubicaciones: b.ubicaciones || null,
    descripcion_necesidad: b.descripcion_necesidad || null,
    info_adicional: b.info_adicional || null,
    medio_contacto: b.medio_contacto || null,
    horario_preferido: b.horario_preferido || null,
  });

  res.status(201).json({ ok: true, codigo, id: info.lastInsertRowid });
});

// Admin: listar y gestionar
router.get("/", requireAdmin, (req, res) => {
  const { estado, tipo_solicitante } = req.query;
  let sql = "SELECT * FROM solicitudes WHERE 1=1";
  const params = [];
  if (estado) { sql += " AND estado = ?"; params.push(estado); }
  if (tipo_solicitante) { sql += " AND tipo_solicitante = ?"; params.push(tipo_solicitante); }
  sql += " ORDER BY creado_en DESC";
  res.json({ resultados: db.prepare(sql).all(...params) });
});

router.get("/:id", requireAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Solicitud no encontrada." });
  res.json(row);
});

router.put("/:id", requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Solicitud no encontrada." });
  const b = req.body || {};
  db.prepare("UPDATE solicitudes SET estado=?, notas_internas=? WHERE id=?").run(
    b.estado ?? existing.estado, b.notas_internas ?? existing.notas_internas, req.params.id
  );
  res.json({ ok: true });
});

router.delete("/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM solicitudes WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;

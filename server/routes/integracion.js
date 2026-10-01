const express = require("express");
const db = require("../db/db");

const router = express.Router();

/*
 * Endpoint de integración para la página de MONITOREO (la que recibe
 * pulseras, nodos y usuarios para seguimiento y alerta).
 *
 * Este backend (el sitio oficial + admin) no sabe nada de la tecnología ni
 * de la base de datos de esa página, así que en vez de intentar "empujarle"
 * datos a ciegas, expone un endpoint de solo lectura que la página de
 * monitoreo puede consultar (poll) cada cierto tiempo, o llamar cuando lo
 * necesite. Protegido con una API key propia (no la sesión del admin).
 *
 * Configuración: define INTEGRACION_API_KEY en tu .env con un valor largo y
 * secreto, y usa ese mismo valor en la página de monitoreo al llamar a este
 * endpoint con el header:  X-API-Key: <ese valor>
 *
 * Si necesitas otro formato de datos (JSON distinto, autenticación distinta,
 * un webhook que avise apenas se crea un nodo en vez de este poll) cuéntame
 * cómo está construida la página de monitoreo y lo ajustamos: esto es un
 * punto de partida funcional, no la integración final.
 */
function requireApiKey(req, res, next) {
  const configurada = process.env.INTEGRACION_API_KEY;
  if (!configurada) {
    return res.status(503).json({
      error: "La integración no está configurada. Define INTEGRACION_API_KEY en el archivo .env del servidor.",
    });
  }
  const recibida = req.get("X-API-Key");
  if (recibida !== configurada) {
    return res.status(401).json({ error: "API key inválida o ausente (header X-API-Key)." });
  }
  next();
}

router.use(requireApiKey);

// GET /api/integracion/nodos
// Todos los nodos (incluye inactivos/planificados), con su código de
// trazabilidad (SAVE-LED-XXXXXX): ese código es el identificador que debería
// usar la página de monitoreo para relacionar cada nodo físico con sus
// pulseras y alertas.
router.get("/nodos", (req, res) => {
  const rows = db.prepare("SELECT * FROM nodos ORDER BY creado_en DESC").all()
    .map(n => ({ ...n, servicios: n.servicios ? JSON.parse(n.servicios) : [], demo: !!n.demo, activo: !!n.activo }));
  res.json({ resultados: rows });
});

// GET /api/integracion/solicitudes
// Solicitudes y cotizaciones recibidas por el sitio (organizaciones y
// personas naturales interesadas): útil para que el monitoreo sepa qué
// usuarios/pulseras nuevas esperar antes de que lleguen a registrarse ahí.
router.get("/solicitudes", (req, res) => {
  const solicitudes = db.prepare("SELECT * FROM solicitudes ORDER BY creado_en DESC").all();
  const cotizaciones = db.prepare("SELECT * FROM cotizaciones ORDER BY creado_en DESC").all();
  res.json({ solicitudes, cotizaciones });
});

module.exports = router;

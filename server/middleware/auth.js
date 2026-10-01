function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: "No autenticado. Inicia sesión como administrador." });
}

module.exports = { requireAdmin };

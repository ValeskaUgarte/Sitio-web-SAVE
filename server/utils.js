function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // radio de la Tierra en km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function genCode(prefix) {
  const year = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${n}`;
}

function genNodeTraceCode(tipo) {
  // Código corto y estable para identificar el nodo desde la futura app de
  // monitoreo / app móvil, independiente del id numérico interno de la base
  // de datos. Formato: SAVE-<TIPO>-<sufijo aleatorio>.
  const prefixByType = {
    "Nodo LED": "LED", "Paradero": "PAR", "Metro": "MET", "Empresa": "EMP",
    "Institución": "INS", "Hogar": "HOG", "Comunidad": "COM", "Espacio público": "PUB", "Otro": "OTR",
  };
  const short = prefixByType[tipo] || "NOD";
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SAVE-${short}-${suffix}`;
}

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

module.exports = { haversineKm, genCode, genNodeTraceCode, slugify };

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const authRoutes = require("./routes/auth");
const paraderosRoutes = require("./routes/paraderos");
const nodosRoutes = require("./routes/nodos");
const empresasRoutes = require("./routes/empresas");
const noticiasRoutes = require("./routes/noticias");
const lanzamientosRoutes = require("./routes/lanzamientos");
const solicitudesRoutes = require("./routes/solicitudes");
const cotizacionesRoutes = require("./routes/cotizaciones");
const contactoRoutes = require("./routes/contacto");
const newsletterRoutes = require("./routes/newsletter");
const casosRoutes = require("./routes/casos");
const productoRoutes = require("./routes/producto");
const uploadsRoutes = require("./routes/uploads");
const integracionRoutes = require("./routes/integracion");
const equipoRoutes = require("./routes/equipo");
const adminsRoutes = require("./routes/admins");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "save-desarrollo-cambiar-en-produccion";

app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "save_session",
    secret: SESSION_SECRET,
    maxAge: 12 * 60 * 60 * 1000, // 12 horas
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })
);

// Archivos subidos (imágenes de noticias, empresas, producto)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// API
app.use("/api/auth", authRoutes);
app.use("/api/paraderos", paraderosRoutes);
app.use("/api/nodos", nodosRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/noticias", noticiasRoutes);
app.use("/api/lanzamientos", lanzamientosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/cotizaciones", cotizacionesRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/casos", casosRoutes);
app.use("/api/producto", productoRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/integracion", integracionRoutes);
app.use("/api/equipo", equipoRoutes);
app.use("/api/admins", adminsRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, servicio: "SAVE backend", hora: new Date().toISOString() }));

// Panel de administración (archivos estáticos propios)
app.use("/admin", express.static(path.join(__dirname, "..", "admin")));

// Sitio público (el frontend del sitio SAVE)
const PUBLIC_DIR = path.join(__dirname, "..", "public-site");

// Versión automática para los <script>/<link> del sitio: es la fecha de la
// última modificación de cualquier archivo del sitio. Así, cada vez que se
// edita un .js/.css el navegador (o un caché/CDN) descarga la versión nueva,
// sin tener que acordarse de cambiar a mano el "?v=..." de index.html.
function versionDelSitio() {
  let max = 0;
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) walk(full);
      else max = Math.max(max, fs.statSync(full).mtimeMs);
    }
  };
  try { walk(PUBLIC_DIR); } catch (e) { /* si falla, se usa 0 */ }
  return Math.floor(max / 1000);
}

function enviarIndex(req, res) {
  let html = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf-8");
  html = html.replace(/(\.(?:js|css))\?v=\d+/g, `$1?v=${versionDelSitio()}`);
  res.set("Cache-Control", "no-cache");
  res.type("html").send(html);
}

app.get(["/", "/index.html"], enviarIndex);
app.use(express.static(PUBLIC_DIR, {
  setHeaders: (res, filePath) => {
    // HTML/JS/CSS siempre se revalidan; imágenes y otros archivos usan el caché normal.
    if (/\.(html|js|css)$/i.test(filePath)) res.set("Cache-Control", "no-cache");
  },
}));
app.get(/^\/(?!api|uploads|admin).*/, enviarIndex);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor." });
});

app.listen(PORT, () => {
  console.log(`\nSAVE backend escuchando en http://localhost:${PORT}`);
  console.log(`  Sitio público:     http://localhost:${PORT}/`);
  console.log(`  Panel admin:       http://localhost:${PORT}/admin`);
  console.log(`  API:               http://localhost:${PORT}/api/health\n`);
});

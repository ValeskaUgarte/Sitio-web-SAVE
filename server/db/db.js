// Conexión a la base de datos SQLite del sistema SAVE.
// SQLite = motor de base de datos que vive en un solo archivo (data/save.db),
// sin necesidad de instalar ni pagar un servidor de base de datos aparte.
// Suficiente para el tamaño de este proyecto y fácil de migrar a Postgres después si crece.

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "save.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function init() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'admin',
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS paraderos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    codigo_ts TEXT,
    nombre TEXT NOT NULL,
    comuna TEXT,
    eje TEXT,
    entre1 TEXT,
    entre2 TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'paradero',
    zona_paga INTEGER NOT NULL DEFAULT 0,
    activo INTEGER NOT NULL DEFAULT 0,
    linea_metro TEXT,
    combinaciones TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_paraderos_lat ON paraderos(lat);
  CREATE INDEX IF NOT EXISTS idx_paraderos_lng ON paraderos(lng);
  CREATE INDEX IF NOT EXISTS idx_paraderos_comuna ON paraderos(comuna);

  CREATE TABLE IF NOT EXISTS nodos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_trazabilidad TEXT UNIQUE,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    categoria_instalacion TEXT NOT NULL DEFAULT 'publico',
    direccion TEXT,
    comuna TEXT,
    lat REAL,
    lng REAL,
    organizacion TEXT,
    estado TEXT NOT NULL DEFAULT 'Planificado',
    activo INTEGER NOT NULL DEFAULT 0,
    fecha TEXT,
    descripcion TEXT,
    servicios TEXT,
    paradero_id INTEGER,
    imagen_url TEXT,
    demo INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now')),
    actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(paradero_id) REFERENCES paraderos(id)
  );

  CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    ubicacion TEXT,
    nodos TEXT,
    fecha TEXT,
    estado TEXT NOT NULL DEFAULT 'Activa',
    logo_url TEXT,
    sitio_web TEXT,
    tipo_relacion TEXT NOT NULL DEFAULT 'implementadora',
    demo INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS noticias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    fecha TEXT NOT NULL,
    autor TEXT,
    categoria TEXT,
    resumen TEXT,
    contenido TEXT,
    imagen_url TEXT,
    tags TEXT,
    publicado INTEGER NOT NULL DEFAULT 1,
    destacado INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lanzamientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_estimada TEXT,
    fecha_exacta TEXT,
    estado TEXT NOT NULL DEFAULT 'proximamente',
    orden INTEGER NOT NULL DEFAULT 0,
    imagen_url TEXT,
    destacado_home INTEGER NOT NULL DEFAULT 1,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    tipo_solicitante TEXT NOT NULL DEFAULT 'organizacion',
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    rut TEXT,
    cargo TEXT,
    organizacion TEXT,
    tipo_organizacion TEXT,
    direccion TEXT,
    comuna TEXT,
    region TEXT,
    sitio_web TEXT,
    tipo_servicio TEXT,
    cantidad_personas INTEGER,
    cantidad_nodos INTEGER,
    ubicaciones TEXT,
    descripcion_necesidad TEXT,
    info_adicional TEXT,
    medio_contacto TEXT,
    horario_preferido TEXT,
    estado TEXT NOT NULL DEFAULT 'Recibida',
    notas_internas TEXT,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cotizaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    tipo_solicitante TEXT NOT NULL DEFAULT 'persona',
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    comuna TEXT,
    region TEXT,
    comentario TEXT,
    estado TEXT NOT NULL DEFAULT 'Nueva',
    notas_internas TEXT,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    asunto TEXT,
    motivo TEXT,
    mensaje TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Nuevo',
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    correo TEXT NOT NULL UNIQUE,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS casos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fecha TEXT,
    lugar TEXT,
    tipo TEXT,
    fact_type TEXT,
    hecho TEXT,
    problema TEXT,
    fuente TEXT,
    fuente_doi TEXT,
    url TEXT,
    fecha_publicacion TEXT,
    imagen_url TEXT,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS producto_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS equipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    rol TEXT,
    foto_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `);

  migrate();
}

// Añade columnas nuevas a bases de datos creadas con una versión anterior
// del esquema, sin borrar ni tocar los datos que ya tengas cargados.
function migrate() {
  const addColumnIfMissing = (table, column, definition) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
    if (!cols.includes(column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`[migración] columna añadida: ${table}.${column}`);
    }
  };
  addColumnIfMissing("paraderos", "activo", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("paraderos", "linea_metro", "TEXT");
  addColumnIfMissing("paraderos", "combinaciones", "TEXT");
  addColumnIfMissing("nodos", "codigo_trazabilidad", "TEXT");
  addColumnIfMissing("nodos", "categoria_instalacion", "TEXT NOT NULL DEFAULT 'publico'");
  addColumnIfMissing("nodos", "activo", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("nodos", "imagen_url", "TEXT");
  addColumnIfMissing("casos", "imagen_url", "TEXT");
  // tipo_relacion distingue empresas que IMPLEMENTAN el sistema (nodos en sus
  // espacios) de empresas/instituciones que FINANCIAN o forman CONVENIOS de
  // apoyo institucional (ej. INACAP). Valores: 'implementadora' | 'convenio'
  addColumnIfMissing("empresas", "tipo_relacion", "TEXT NOT NULL DEFAULT 'implementadora'");
  db.exec(`CREATE INDEX IF NOT EXISTS idx_paraderos_activo ON paraderos(activo)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_paraderos_tipo ON paraderos(tipo)`);
}

init();

module.exports = db;

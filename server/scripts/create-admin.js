// Crea (o actualiza la contraseña de) un usuario administrador.
// Uso: node server/scripts/create-admin.js correo@ejemplo.com "contraseña" "Nombre visible"

const bcrypt = require("bcryptjs");
const db = require("../db/db");

const [, , email, password, nombre] = process.argv;

if (!email || !password) {
  console.error('Uso: node server/scripts/create-admin.js correo@ejemplo.com "contraseña" "Nombre visible"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
const emailNorm = email.trim().toLowerCase();

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(emailNorm);
if (existing) {
  db.prepare("UPDATE admins SET password_hash = ?, nombre = ? WHERE email = ?")
    .run(hash, nombre || "Administrador SAVE", emailNorm);
  console.log(`Contraseña actualizada para el administrador existente: ${emailNorm}`);
} else {
  db.prepare("INSERT INTO admins (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'admin')")
    .run(nombre || "Administrador SAVE", emailNorm, hash);
  console.log(`Administrador creado: ${emailNorm}`);
}

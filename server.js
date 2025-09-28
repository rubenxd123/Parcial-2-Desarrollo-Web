// servidor Express principal
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- Conexión a PostgreSQL ---
const connectionString = process.env.DATABASE_URL;
const forceSSL = (process.env.FORCE_DB_SSL || '').toLowerCase() === 'true';

const pool = new Pool({
  connectionString,
  ssl: forceSSL ? { rejectUnauthorized: false } : undefined,
});

async function initDb() {
  // Verificación simple
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("✅ Conectado a PostgreSQL");
  } finally {
    client.release();
  }
}
initDb().catch(err => {
  console.error("❌ Error conectando a PostgreSQL:", err.message);
});

// --- Utilidades de validación ---
const ESTADOS = ["pending", "preparing", "delivered"];
function siguienteEstado(actual) {
  const idx = ESTADOS.indexOf(actual);
  if (idx === -1 || idx === ESTADOS.length - 1) return null;
  return ESTADOS[idx + 1];
}

// --- Endpoints ---

// Registrar cliente
app.post("/clientes/registrar", async (req, res) => {
  const { nombre, email, telefono } = req.body || {};
  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: "nombre, email y telefono son obligatorios" });
  }
  try {
    const query = `
      INSERT INTO clientes (nombre, email, telefono)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, nombre, email, telefono;
    `;
    const { rows } = await pool.query(query, [nombre, email, telefono]);
    if (rows.length === 0) {
      return res.status(409).json({ error: "El email ya existe" });
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar cliente" });
  }
});

// Login (validar email y telefono)
app.post("/clientes/login", async (req, res) => {
  const { email, telefono } = req.body || {};
  if (!email || !telefono) {
    return res.status(400).json({ error: "email y telefono son obligatorios" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, nombre, email, telefono FROM clientes WHERE email = $1 AND telefono = $2",
      [email, telefono]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en login" });
  }
});

// Crear nueva orden para un cliente
app.post("/ordenes/:clienteId", async (req, res) => {
  const { clienteId } = req.params;
  const { platillo_nombre, notes } = req.body || {};
  if (!platillo_nombre) {
    return res.status(400).json({ error: "platillo_nombre es obligatorio" });
  }
  try {
    const query = `
      INSERT INTO ordenes (cliente_id, platillo_nombre, notes)
      VALUES ($1, $2, $3)
      RETURNING id, cliente_id, platillo_nombre, notes, estado, timestamp;
    `;
    const { rows } = await pool.query(query, [clienteId, platillo_nombre, notes || null]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la orden" });
  }
});

// Obtener todas las órdenes de un cliente
app.get("/ordenes/:clienteId", async (req, res) => {
  const { clienteId } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM ordenes WHERE cliente_id = $1 ORDER BY id DESC",
      [clienteId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar órdenes" });
  }
});

// Actualizar el estado de una orden (advance: pending -> preparing -> delivered)
app.put("/ordenes/:id/estado", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT estado FROM ordenes WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Orden no encontrada" });
    const actual = rows[0].estado;
    const nuevo = siguienteEstado(actual);
    if (!nuevo) return res.status(400).json({ error: "La orden ya está en el último estado" });

    const upd = await pool.query(
      "UPDATE ordenes SET estado = $1 WHERE id = $2 RETURNING id, cliente_id, platillo_nombre, notes, estado, timestamp",
      [nuevo, id]
    );
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// Servir frontend estático (./frontend)
app.use(express.static(path.join(__dirname, "frontend")));

// Fallback a index.html para rutas del frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});

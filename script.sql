-- Script de base de datos para restaurante_ordenes_db
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS ordenes (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES clientes(id),
  platillo_nombre VARCHAR(100) NOT NULL,
  notes TEXT,
  estado VARCHAR(20) DEFAULT 'pending',
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Datos de ejemplo
INSERT INTO clientes (nombre, email, telefono) VALUES
('Juan Pérez', 'juan@example.com', '555-1111') ON CONFLICT (email) DO NOTHING,
('Ana López', 'ana@example.com', '555-2222') ON CONFLICT (email) DO NOTHING;

-- Una orden de ejemplo
INSERT INTO ordenes (cliente_id, platillo_nombre, notes)
SELECT id, 'Hamburguesa Clásica', 'sin cebolla'
FROM clientes WHERE email = 'juan@example.com'
ON CONFLICT DO NOTHING;

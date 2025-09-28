# Restaurante Órdenes (Node + Express + PostgreSQL + HTML/JS)

Proyecto base para el parcial. Incluye:
- API REST con Node.js/Express
- PostgreSQL (tabla `clientes` y `ordenes`)
- Frontend simple HTML/CSS/JS
- Despliegue recomendado en Render

## Desarrollo local

1) **Instalar dependencias**
```bash
npm install
```

2) **Configurar variables**
Copia `.env.example` a `.env` y ajusta `DATABASE_URL` (si usas Docker local, pgAdmin, etc.).

3) **Crear tablas**
Ejecuta `script.sql` en tu base de datos PostgreSQL.

4) **Iniciar**
```bash
npm run dev
# o
npm start
```
Abre `http://localhost:10000`

## Endpoints
- `POST /clientes/registrar`
- `POST /clientes/login`
- `POST /ordenes/:clienteId`
- `GET  /ordenes/:clienteId`
- `PUT  /ordenes/:id/estado`

## Despliegue en Render

1. Sube este repo a GitHub.
2. En Render, crea **Web Service** (Node).
3. En **Environment** agrega:
   - `PORT=10000`
   - `DATABASE_URL` (desde tu instancia de PostgreSQL de Render)
   - `FORCE_DB_SSL=true`
4. En tu PostgreSQL de Render ejecuta `script.sql` (puedes usar la consola "psql" o conectarte con un cliente).
5. Deploy. La app servirá el frontend desde `/frontend` y consumirá la API en el mismo dominio.

> El login se valida por `email + telefono`. Puedes usar los ejemplos del `script.sql`.

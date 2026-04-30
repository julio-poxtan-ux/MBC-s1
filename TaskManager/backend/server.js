// server.js — Punto de entrada del backend Bitácora

require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const incidenciasRouter = require('./routes/incidencias');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json({ limit: '10mb' }));

// ── Rutas ──────────────────────────────────────────────────────────────────

// Health check — útil para Cloud Run y load balancers
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/incidencias', incidenciasRouter);

// 404 para cualquier ruta no definida
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Arranque ───────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Modo: ${process.env.NODE_ENV || 'development'}`);
});

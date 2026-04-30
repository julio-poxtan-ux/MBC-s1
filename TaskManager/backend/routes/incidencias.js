// routes/incidencias.js — CRUD completo para la tabla `incidencias`

const express = require('express');
const router  = express.Router();
const { getPool } = require('../db');

// ── Helpers ────────────────────────────────────────────────────────────────

// Convierte snake_case de la DB al camelCase que espera el frontend
function toFrontend(row) {
  return {
    id:                    row.id,
    titulo:                row.titulo,
    plataforma:            row.plataforma,
    comentario:            row.comentario,
    imagen:                row.imagen,
    imagenNombre:          row.imagen_nombre,
    imagenEsperada:        row.imagen_esperada,
    imagenEsperadaNombre:  row.imagen_esperada_nombre,
    urlSitio:              row.url_sitio,
    urlGithub:             row.url_github,
    revisado:              row.revisado,
    archivado:             row.archivado,
    creadoEn:              row.creado_en,
    actualizadoEn:         row.actualizado_en,
  };
}

// ── GET /api/incidencias ───────────────────────────────────────────────────
// Devuelve todas las incidencias ordenadas por fecha de creación (más nuevas primero)
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { rows } = await pool.query(
      'SELECT * FROM incidencias ORDER BY creado_en DESC'
    );
    res.json(rows.map(toFrontend));
  } catch (err) {
    console.error('GET /incidencias error:', err);
    res.status(500).json({ error: 'Error al obtener incidencias' });
  }
});

// ── GET /api/incidencias/:id ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const { rows } = await pool.query(
      'SELECT * FROM incidencias WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json(toFrontend(rows[0]));
  } catch (err) {
    console.error('GET /incidencias/:id error:', err);
    res.status(500).json({ error: 'Error al obtener la incidencia' });
  }
});

// ── POST /api/incidencias ──────────────────────────────────────────────────
// Crea una nueva incidencia. El id lo genera el frontend (uid()).
router.post('/', async (req, res) => {
  try {
    const pool = await getPool();
    const i    = req.body;

    if (!i.id || !i.titulo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: id, titulo' });
    }

    const { rows } = await pool.query(
      `INSERT INTO incidencias (
         id, titulo, plataforma, comentario,
         imagen, imagen_nombre, imagen_esperada, imagen_esperada_nombre,
         url_sitio, url_github, revisado, archivado,
         creado_en, actualizado_en
       ) VALUES (
         $1,  $2,  $3,  $4,
         $5,  $6,  $7,  $8,
         $9,  $10, $11, $12,
         $13, $14
       ) RETURNING *`,
      [
        i.id,                  i.titulo,               i.plataforma  || null,  i.comentario  || null,
        i.imagen      || null, i.imagenNombre || null,  i.imagenEsperada || null, i.imagenEsperadaNombre || null,
        i.urlSitio    || null, i.urlGithub    || null,
        i.revisado    ?? false, i.archivado   ?? false,
        i.creadoEn    || new Date().toISOString(),
        i.actualizadoEn || new Date().toISOString(),
      ]
    );
    res.status(201).json(toFrontend(rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una incidencia con ese id' });
    }
    console.error('POST /incidencias error:', err);
    res.status(500).json({ error: 'Error al crear la incidencia' });
  }
});

// ── PUT /api/incidencias/:id ───────────────────────────────────────────────
// Actualiza los campos enviados. Solo pisa los que vienen en el body.
router.put('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const i    = req.body;

    const { rows } = await pool.query(
      `UPDATE incidencias SET
         titulo                 = COALESCE($1,  titulo),
         plataforma             = COALESCE($2,  plataforma),
         comentario             = COALESCE($3,  comentario),
         imagen                 = $4,
         imagen_nombre          = $5,
         imagen_esperada        = $6,
         imagen_esperada_nombre = $7,
         url_sitio              = COALESCE($8,  url_sitio),
         url_github             = COALESCE($9,  url_github),
         revisado               = COALESCE($10, revisado),
         archivado              = COALESCE($11, archivado),
         actualizado_en         = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        i.titulo      ?? null,
        i.plataforma  ?? null,
        i.comentario  ?? null,
        i.imagen      ?? null,
        i.imagenNombre ?? null,
        i.imagenEsperada ?? null,
        i.imagenEsperadaNombre ?? null,
        i.urlSitio    ?? null,
        i.urlGithub   ?? null,
        i.revisado    ?? null,
        i.archivado   ?? null,
        req.params.id,
      ]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json(toFrontend(rows[0]));
  } catch (err) {
    console.error('PUT /incidencias/:id error:', err);
    res.status(500).json({ error: 'Error al actualizar la incidencia' });
  }
});

// ── DELETE /api/incidencias/:id ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const { rowCount } = await pool.query(
      'DELETE FROM incidencias WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'No encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /incidencias/:id error:', err);
    res.status(500).json({ error: 'Error al eliminar la incidencia' });
  }
});

module.exports = router;

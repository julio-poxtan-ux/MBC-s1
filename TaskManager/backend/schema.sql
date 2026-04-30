-- ============================================================
-- Bitácora — Schema para Cloud SQL (PostgreSQL)
-- Ejecutar una sola vez al crear la base de datos
-- ============================================================

CREATE TABLE IF NOT EXISTS incidencias (
  id                     VARCHAR(50)   PRIMARY KEY,
  titulo                 VARCHAR(120)  NOT NULL,
  plataforma             VARCHAR(60),
  comentario             TEXT,
  imagen                 TEXT,                        -- URL pública (Firebase Storage u otro CDN)
  imagen_nombre          VARCHAR(255),
  imagen_esperada        TEXT,
  imagen_esperada_nombre VARCHAR(255),
  url_sitio              VARCHAR(500),
  url_github             VARCHAR(500),
  revisado               BOOLEAN       NOT NULL DEFAULT FALSE,
  archivado              BOOLEAN       NOT NULL DEFAULT FALSE,
  creado_en              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actualizado_en         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices para los filtros más usados por el frontend
CREATE INDEX IF NOT EXISTS idx_incidencias_archivado   ON incidencias (archivado);
CREATE INDEX IF NOT EXISTS idx_incidencias_creado_en   ON incidencias (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_incidencias_plataforma  ON incidencias (plataforma);

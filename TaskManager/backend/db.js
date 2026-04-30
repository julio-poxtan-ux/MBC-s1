// db.js — Pool de conexión a Cloud SQL (PostgreSQL)
// En producción usa el Cloud SQL Connector de Google.
// En desarrollo local usa conexión directa (requiere Cloud SQL Auth Proxy o PostgreSQL local).

require('dotenv').config();
const { Pool } = require('pg');

let pool;

async function getPool() {
  if (pool) return pool;

  if (process.env.NODE_ENV === 'production') {
    // Cloud SQL Connector — funciona en Cloud Run, App Engine y GCE sin credenciales extra
    const { Connector } = require('@google-cloud/cloud-sql-connector');
    const connector = new Connector();

    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.CLOUD_SQL_CONNECTION_NAME,
      ipType: 'PUBLIC',
    });

    pool = new Pool({
      ...clientOpts,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 5,
    });
  } else {
    // Desarrollo local — PostgreSQL directo o con Cloud SQL Auth Proxy corriendo en el puerto 5432
    pool = new Pool({
      host:     process.env.DB_HOST     || '127.0.0.1',
      port:     parseInt(process.env.DB_PORT || '5432'),
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  // Verificar conexión al iniciar
  const client = await pool.connect();
  console.log(`✅ Conectado a PostgreSQL (${process.env.NODE_ENV || 'development'})`);
  client.release();

  return pool;
}

module.exports = { getPool };

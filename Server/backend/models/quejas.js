const pool = require('../db');

const quejasModel = {
  // Obtener todas las quejas
  async obtenerTodas() {
    const query = `
      SELECT q.*, u."nombreUsuario" 
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      WHERE q."activo" = true 
      ORDER BY q."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener queja por ID
  async obtenerPorId(idQueja) {
    const query = `
      SELECT q.*, u."nombreUsuario" 
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      WHERE q."idQueja" = $1 AND q."activo" = true
    `;
    const result = await pool.query(query, [idQueja]);
    return result.rows[0];
  },

  // Obtener quejas por código
  async obtenerPorCodigo(codigoQueja) {
    const query = `
      SELECT q.*, u."nombreUsuario" 
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      WHERE q."codigoQueja" = $1 AND q."activo" = true
    `;
    const result = await pool.query(query, [codigoQueja]);
    return result.rows[0];
  },

  // Obtener quejas resueltas
  async obtenerResueltas() {
    const query = `
      SELECT q.*, u."nombreUsuario" 
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      WHERE q."resuelto" = true AND q."activo" = true 
      ORDER BY q."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener quejas pendientes
  async obtenerPendientes() {
    const query = `
      SELECT q.*, u."nombreUsuario" 
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      WHERE q."resuelto" = false AND q."activo" = true 
      ORDER BY q."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Crear nueva queja (sin código, se generará después)
  async crear(datos) {
    const {
      asunto,
      detalle,
      idUsuario,
      resuelto = false,
      activo = true
    } = datos;

    const query = `
      INSERT INTO "Queja" ("asunto", "detalle", "fechaCreacion", "idUsuario", "resuelto", "activo")
      VALUES ($1, $2, NOW(), $3, $4, $5)
      RETURNING *
    `;
    const values = [asunto, detalle, idUsuario, resuelto, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar queja
  async actualizar(idQueja, datos) {
    const {
      codigoQueja,
      asunto,
      detalle,
      resuelto,
      activo
    } = datos;

    const query = `
      UPDATE "Queja"
      SET "codigoQueja" = $1, "asunto" = $2, "detalle" = $3, "resuelto" = $4, "activo" = $5
      WHERE "idQueja" = $6
      RETURNING *
    `;
    const values = [codigoQueja, asunto, detalle, resuelto, activo, idQueja];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Marcar como resuelta
  async marcarResuelta(idQueja) {
    const query = `
      UPDATE "Queja" 
      SET "resuelto" = true
      WHERE "idQueja" = $1
      RETURNING *
    `;
    const result = await pool.query(query, [idQueja]);
    return result.rows[0];
  },

  // Eliminar queja (soft delete)
  async eliminar(idQueja) {
    const query = 'UPDATE "Queja" SET "activo" = false WHERE "idQueja" = $1 RETURNING *';
    const result = await pool.query(query, [idQueja]);
    return result.rows[0];
  },

  // Obtener estadísticas de quejas
  async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_quejas,
        COUNT(CASE WHEN "resuelto" = true THEN 1 END) as quejas_resueltas,
        COUNT(CASE WHEN "resuelto" = false THEN 1 END) as quejas_pendientes
      FROM "Queja" 
      WHERE "activo" = true
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = quejasModel; 
const pool = require('../db');

const sugerenciasModel = {
  // Obtener todas las sugerencias
  async obtenerTodas() {
    const query = `
      SELECT s.*, u."nombreUsuario" 
      FROM "Sugerencia" s 
      LEFT JOIN "Usuario" u ON s."idUsuario" = u."idUsuario" 
      WHERE s."activo" = true 
      ORDER BY s."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener sugerencia por ID
  async obtenerPorId(idSugerencia) {
    const query = `
      SELECT s.*, u."nombreUsuario" 
      FROM "Sugerencia" s 
      LEFT JOIN "Usuario" u ON s."idUsuario" = u."idUsuario" 
      WHERE s."idSugerencia" = $1 AND s."activo" = true
    `;
    const result = await pool.query(query, [idSugerencia]);
    return result.rows[0];
  },

  // Obtener sugerencia por código
  async obtenerPorCodigo(codigoSugerencia) {
    const query = `
      SELECT s.*, u."nombreUsuario" 
      FROM "Sugerencia" s 
      LEFT JOIN "Usuario" u ON s."idUsuario" = u."idUsuario" 
      WHERE s."codigoSugerencia" = $1 AND s."activo" = true
    `;
    const result = await pool.query(query, [codigoSugerencia]);
    return result.rows[0];
  },

  // Crear nueva sugerencia
  async crear(datos) {
    const {
      codigoSugerencia,
      asunto,
      detalle,
      idUsuario,
      activo = true
    } = datos;

    const query = `
      INSERT INTO "Sugerencia" ("codigoSugerencia", "asunto", "detalle", "fechaCreacion", "idUsuario", "activo")
      VALUES ($1, $2, $3, NOW(), $4, $5)
      RETURNING *
    `;
    const values = [codigoSugerencia, asunto, detalle, idUsuario, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar sugerencia
  async actualizar(idSugerencia, datos) {
    const {
      codigoSugerencia,
      asunto,
      detalle,
      activo
    } = datos;

    const query = `
      UPDATE "Sugerencia"
      SET "codigoSugerencia" = $1, "asunto" = $2, "detalle" = $3, "activo" = $4
      WHERE "idSugerencia" = $5
      RETURNING *
    `;
    const values = [codigoSugerencia, asunto, detalle, activo, idSugerencia];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar sugerencia (soft delete)
  async eliminar(idSugerencia) {
    const query = 'UPDATE "Sugerencia" SET "activo" = false WHERE "idSugerencia" = $1 RETURNING *';
    const result = await pool.query(query, [idSugerencia]);
    return result.rows[0];
  },

  // Obtener estadísticas de sugerencias
  async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_sugerencias
      FROM "Sugerencia" 
      WHERE "activo" = true
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = sugerenciasModel; 
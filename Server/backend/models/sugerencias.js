const pool = require('../db');

const sugerenciasModel = {
  // Obtener todas las sugerencias
  async obtenerTodas() {
    const query = `
      SELECT s.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Sugerencia" s 
      LEFT JOIN "Usuario" u ON s."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
      WHERE s."activo" = true 
      ORDER BY s."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener sugerencia por ID
  async obtenerPorId(idSugerencia) {
    const query = `
      SELECT s.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Sugerencia" s 
      LEFT JOIN "Usuario" u ON s."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
      WHERE s."idSugerencia" = $1 AND s."activo" = true
    `;
    const result = await pool.query(query, [idSugerencia]);
    return result.rows[0];
  },

  // Obtener sugerencia por código
  async obtenerPorCodigo(codigoSugerencia) {
    const query = `
      SELECT s.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Sugerencia" s 
      LEFT JOIN "Usuario" u ON s."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
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
    // Construir dinámicamente la query basada en los campos que se envían
    const campos = [];
    const valores = [];
    let contador = 1;

    if (datos.codigoSugerencia !== undefined) {
      campos.push(`"codigoSugerencia" = $${contador}`);
      valores.push(datos.codigoSugerencia);
      contador++;
    }

    if (datos.asunto !== undefined) {
      campos.push(`"asunto" = $${contador}`);
      valores.push(datos.asunto);
      contador++;
    }

    if (datos.detalle !== undefined) {
      campos.push(`"detalle" = $${contador}`);
      valores.push(datos.detalle);
      contador++;
    }

    if (datos.activo !== undefined) {
      campos.push(`"activo" = $${contador}`);
      valores.push(datos.activo);
      contador++;
    }

    if (campos.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    valores.push(idSugerencia); // ID al final

    const query = `
      UPDATE "Sugerencia"
      SET ${campos.join(', ')}
      WHERE "idSugerencia" = $${contador}
      RETURNING *
    `;
    
    const result = await pool.query(query, valores);
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
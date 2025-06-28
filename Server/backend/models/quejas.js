const pool = require('../db');

const quejasModel = {
  // Obtener todas las quejas
  async obtenerTodas() {
    const query = `
      SELECT q.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
      WHERE q."activo" = true 
      ORDER BY q."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener queja por ID
  async obtenerPorId(idQueja) {
    const query = `
      SELECT q.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
      WHERE q."idQueja" = $1 AND q."activo" = true
    `;
    const result = await pool.query(query, [idQueja]);
    return result.rows[0];
  },

  // Obtener quejas por código
  async obtenerPorCodigo(codigoQueja) {
    const query = `
      SELECT q.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
      WHERE q."codigoQueja" = $1 AND q."activo" = true
    `;
    const result = await pool.query(query, [codigoQueja]);
    return result.rows[0];
  },

  // Obtener quejas resueltas
  async obtenerResueltas() {
    const query = `
      SELECT q.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
      WHERE q."resuelto" = true AND q."activo" = true 
      ORDER BY q."fechaCreacion" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener quejas pendientes
  async obtenerPendientes() {
    const query = `
      SELECT q.*, 
             CONCAT(c."nombres", ' ', c."apellidoPaterno", ' ', c."apellidoMaterno") as "nombreCompletoCliente",
             u."nombreUsuario"
      FROM "Queja" q 
      LEFT JOIN "Usuario" u ON q."idUsuario" = u."idUsuario" 
      LEFT JOIN "Cliente" c ON u."nombreUsuario" = c."codigoCliente"
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
    // Construir dinámicamente la query basada en los campos que se envían
    const campos = [];
    const valores = [];
    let contador = 1;

    if (datos.codigoQueja !== undefined) {
      campos.push(`"codigoQueja" = $${contador}`);
      valores.push(datos.codigoQueja);
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

    if (datos.resuelto !== undefined) {
      campos.push(`"resuelto" = $${contador}`);
      valores.push(datos.resuelto);
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

    valores.push(idQueja); // ID al final

    const query = `
      UPDATE "Queja"
      SET ${campos.join(', ')}
      WHERE "idQueja" = $${contador}
      RETURNING *
    `;
    
    const result = await pool.query(query, valores);
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
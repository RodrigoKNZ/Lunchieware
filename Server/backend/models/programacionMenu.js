const pool = require('../db');

const programacionMenuModel = {
  // Obtener toda la programación del menú
  async obtenerTodos() {
    const query = 'SELECT * FROM "ProgramacionMenu" WHERE "activo" = true ORDER BY "fecha" DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener menú por ID
  async obtenerPorId(idMenu) {
    const query = 'SELECT * FROM "ProgramacionMenu" WHERE "idMenu" = $1 AND "activo" = true';
    const result = await pool.query(query, [idMenu]);
    return result.rows[0];
  },

  // Obtener menú por fecha
  async obtenerPorFecha(fecha) {
    const query = 'SELECT * FROM "ProgramacionMenu" WHERE "fecha" = $1 AND "activo" = true';
    const result = await pool.query(query, [fecha]);
    return result.rows[0];
  },

  // Obtener menú activo para una fecha específica
  async obtenerMenuActivo(fecha) {
    const query = 'SELECT * FROM "ProgramacionMenu" WHERE "fecha" = $1 AND "activo" = true AND "activo" = true';
    const result = await pool.query(query, [fecha]);
    return result.rows[0];
  },

  // Crear nueva programación de menú
  async crear(datos) {
    const {
      fecha,
      entrada,
      plato,
      platoALaCarta,
      postre,
      refresco,
      activo = true
    } = datos;

    const query = `
      INSERT INTO "ProgramacionMenu" ("fecha", "entrada", "plato", "platoALaCarta", "postre", "refresco", "activo")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [fecha, entrada, plato, platoALaCarta, postre, refresco, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar programación de menú
  async actualizar(idMenu, datos) {
    const {
      fecha,
      entrada,
      plato,
      platoALaCarta,
      postre,
      refresco,
      activo
    } = datos;

    const query = `
      UPDATE "ProgramacionMenu"
      SET "fecha" = $1, "entrada" = $2, "plato" = $3, "platoALaCarta" = $4, 
          "postre" = $5, "refresco" = $6, "activo" = $7
      WHERE "idMenu" = $8
      RETURNING *
    `;
    const values = [fecha, entrada, plato, platoALaCarta, postre, refresco, activo, idMenu];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar programación de menú (soft delete)
  async eliminar(idMenu) {
    const query = 'UPDATE "ProgramacionMenu" SET "activo" = false WHERE "idMenu" = $1 RETURNING *';
    const result = await pool.query(query, [idMenu]);
    return result.rows[0];
  },

  // Obtener menús por rango de fechas
  async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const query = `
      SELECT * FROM "ProgramacionMenu" 
      WHERE "fecha" BETWEEN $1 AND $2 AND "activo" = true 
      ORDER BY "fecha" ASC
    `;
    const result = await pool.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }
};

module.exports = programacionMenuModel; 
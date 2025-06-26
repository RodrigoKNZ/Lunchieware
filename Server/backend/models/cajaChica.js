const pool = require('../db');

const cajaChicaModel = {
  // Listar todas las cajas chicas
  async obtenerTodas() {
    const query = 'SELECT * FROM "CajaChica" WHERE "activo" = true ORDER BY "idCajaChica" DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener caja chica por ID
  async obtenerPorId(idCajaChica) {
    const query = 'SELECT * FROM "CajaChica" WHERE "idCajaChica" = $1 AND "activo" = true';
    const result = await pool.query(query, [idCajaChica]);
    return result.rows[0];
  },

  // Obtener caja chica por numeroLiquidacion
  async obtenerPorNumeroLiquidacion(numeroLiquidacion) {
    const query = 'SELECT * FROM "CajaChica" WHERE "numeroLiquidacion" = $1 AND "activo" = true';
    const result = await pool.query(query, [numeroLiquidacion]);
    return result.rows[0];
  },

  // Crear nueva caja chica
  async crear(datos) {
    const { numeroLiquidacion, fechaApertura, saldoInicial, observaciones } = datos;
    
    // Generar numeroLiquidacion automáticamente si no se proporciona
    let numeroLiquidacionFinal = numeroLiquidacion;
    if (!numeroLiquidacionFinal) {
      const result = await pool.query('SELECT MAX("idCajaChica") as maxId FROM "CajaChica"');
      const nextId = (result.rows[0].maxid || 0) + 1;
      numeroLiquidacionFinal = nextId.toString().padStart(4, '0');
    }

    const query = `
      INSERT INTO "CajaChica" ("numeroLiquidacion", "fechaApertura", "saldoInicial", "saldoFinal", "observaciones", "abierta")
      VALUES ($1, $2, $3, $3, $4, true)
      RETURNING *
    `;
    const values = [numeroLiquidacionFinal, fechaApertura, saldoInicial, observaciones];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar caja chica (observaciones)
  async actualizar(idCajaChica, datos) {
    const { observaciones } = datos;
    const query = `
      UPDATE "CajaChica"
      SET "observaciones" = $1
      WHERE "idCajaChica" = $2 AND "activo" = true
      RETURNING *
    `;
    const values = [observaciones, idCajaChica];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Cerrar (liquidar) caja chica
  async cerrar(idCajaChica, fechaLiquidacion, saldoFinal) {
    const query = `
      UPDATE "CajaChica"
      SET "fechaLiquidacion" = $1, "saldoFinal" = $2, "abierta" = false
      WHERE "idCajaChica" = $3 AND "activo" = true AND "abierta" = true
      RETURNING *
    `;
    const values = [fechaLiquidacion, saldoFinal, idCajaChica];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar caja chica (soft delete)
  async eliminar(idCajaChica) {
    const query = `
      UPDATE "CajaChica"
      SET "activo" = false
      WHERE "idCajaChica" = $1 AND "activo" = true
      RETURNING *
    `;
    const result = await pool.query(query, [idCajaChica]);
    return result.rows[0];
  },

  // Filtrar cajas chicas (ejemplo básico por número y estado)
  async filtrar({ numeroLiquidacion, abierta }) {
    let query = 'SELECT * FROM "CajaChica" WHERE "activo" = true';
    const values = [];
    if (numeroLiquidacion) {
      values.push(`%${numeroLiquidacion}%`);
      query += ` AND "numeroLiquidacion" ILIKE $${values.length}`;
    }
    if (abierta !== undefined) {
      values.push(abierta);
      query += ` AND "abierta" = $${values.length}`;
    }
    query += ' ORDER BY "idCajaChica" DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }
};

module.exports = cajaChicaModel; 
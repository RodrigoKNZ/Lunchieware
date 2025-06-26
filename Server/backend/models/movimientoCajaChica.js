const pool = require('../db');

const movimientoCajaChicaModel = {
  // Obtener todos los movimientos de una caja chica
  async obtenerPorCajaChica(idCajaChica) {
    const query = `
      SELECT * FROM "MovimientoDeCajaChica" 
      WHERE "idCajaChica" = $1 AND "activo" = true 
      ORDER BY "fechaMovimiento" DESC, "idMovimiento" DESC
    `;
    const result = await pool.query(query, [idCajaChica]);
    return result.rows;
  },

  // Obtener movimiento por ID
  async obtenerPorId(idMovimiento) {
    const query = 'SELECT * FROM "MovimientoDeCajaChica" WHERE "idMovimiento" = $1 AND "activo" = true';
    const result = await pool.query(query, [idMovimiento]);
    return result.rows[0];
  },

  // Crear nuevo movimiento
  async crear(datos) {
    const {
      idCajaChica,
      tipoDocumento,
      referencia,
      serie,
      numero,
      fechaMovimiento,
      montoImponible,
      impuestos,
      montoTotal
    } = datos;

    const query = `
      INSERT INTO "MovimientoDeCajaChica" (
        "idCajaChica", "tipoDocumento", "referencia", "serie", "numero", 
        "fechaMovimiento", "montoImponible", "impuestos", "montoTotal"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      idCajaChica, tipoDocumento, referencia, serie, numero,
      fechaMovimiento, montoImponible, impuestos, montoTotal
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar movimiento
  async actualizar(idMovimiento, datos) {
    const {
      tipoDocumento,
      referencia,
      serie,
      numero,
      fechaMovimiento,
      montoImponible,
      impuestos,
      montoTotal
    } = datos;

    const query = `
      UPDATE "MovimientoDeCajaChica"
      SET "tipoDocumento" = $1, "referencia" = $2, "serie" = $3, "numero" = $4,
          "fechaMovimiento" = $5, "montoImponible" = $6, "impuestos" = $7, "montoTotal" = $8
      WHERE "idMovimiento" = $9 AND "activo" = true
      RETURNING *
    `;
    
    const values = [
      tipoDocumento, referencia, serie, numero,
      fechaMovimiento, montoImponible, impuestos, montoTotal, idMovimiento
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar movimiento (soft delete)
  async eliminar(idMovimiento) {
    const query = `
      UPDATE "MovimientoDeCajaChica"
      SET "activo" = false
      WHERE "idMovimiento" = $1 AND "activo" = true
      RETURNING *
    `;
    const result = await pool.query(query, [idMovimiento]);
    return result.rows[0];
  },

  // Calcular saldo actual de una caja chica basado en movimientos
  async calcularSaldoActual(idCajaChica) {
    const query = `
      SELECT COALESCE(SUM("montoTotal"), 0) as totalGastado
      FROM "MovimientoDeCajaChica"
      WHERE "idCajaChica" = $1 AND "activo" = true
    `;
    const result = await pool.query(query, [idCajaChica]);
    return parseFloat(result.rows[0].totalgastado);
  }
};

module.exports = movimientoCajaChicaModel; 
const pool = require('../db');

const abonosModel = {
  // Obtener todos los abonos
  async obtenerTodos() {
    const query = `
      SELECT a.*, c."codigoContrato", cb."codigoCuenta", cb."tipoCuenta", b."nombreBanco"
      FROM "Abono" a
      LEFT JOIN "Contrato" c ON a."idContrato" = c."idContrato"
      LEFT JOIN "CuentaBancaria" cb ON a."idCuenta" = cb."idCuenta"
      LEFT JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE a."activo" = true 
      ORDER BY a."fechaAbono" DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener abono por ID
  async obtenerPorId(idAbono) {
    const query = `
      SELECT a.*, c."codigoContrato", cb."codigoCuenta", cb."tipoCuenta", b."nombreBanco"
      FROM "Abono" a
      LEFT JOIN "Contrato" c ON a."idContrato" = c."idContrato"
      LEFT JOIN "CuentaBancaria" cb ON a."idCuenta" = cb."idCuenta"
      LEFT JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE a."idAbono" = $1 AND a."activo" = true
    `;
    const result = await pool.query(query, [idAbono]);
    return result.rows[0];
  },

  // Obtener abonos por contrato
  async obtenerPorContrato(idContrato) {
    const query = `
      SELECT a.*, c."codigoContrato", cb."codigoCuenta", cb."tipoCuenta", b."nombreBanco"
      FROM "Abono" a
      LEFT JOIN "Contrato" c ON a."idContrato" = c."idContrato"
      LEFT JOIN "CuentaBancaria" cb ON a."idCuenta" = cb."idCuenta"
      LEFT JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE a."idContrato" = $1 AND a."activo" = true 
      ORDER BY a."fechaAbono" DESC
    `;
    const result = await pool.query(query, [idContrato]);
    return result.rows;
  },

  // Obtener abonos por cliente (a través de contratos)
  async obtenerPorCliente(idCliente) {
    const query = `
      SELECT a.*, c."codigoContrato", cb."codigoCuenta", cb."tipoCuenta", b."nombreBanco"
      FROM "Abono" a
      LEFT JOIN "Contrato" c ON a."idContrato" = c."idContrato"
      LEFT JOIN "CuentaBancaria" cb ON a."idCuenta" = cb."idCuenta"
      LEFT JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE c."idCliente" = $1 AND a."activo" = true 
      ORDER BY a."fechaAbono" DESC
    `;
    const result = await pool.query(query, [idCliente]);
    return result.rows;
  },

  // Crear nuevo abono
  async crear(datos) {
    console.log('🟦 [AbonosModel] Iniciando creación de abono con datos:', datos);
    const {
      idContrato,
      fechaAbono,
      idCuenta,
      importeAbono,
      registroManual = false,
      activo = true
    } = datos;
    const query = `
      INSERT INTO "Abono" (
        "idContrato", "fechaAbono", "idCuenta", "numRecibo", 
        "importeAbono", "registroManual", "activo"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      idContrato, fechaAbono, idCuenta, '0000000',
      importeAbono, registroManual, activo
    ];
    console.log('🟦 [AbonosModel] Ejecutando query con valores:', values);
    try {
      const result = await pool.query(query, values);
      let abono = result.rows[0];
      // Actualizar el número de recibo con el idAbono en 7 dígitos
      const nuevoNumRecibo = abono.idAbono.toString().padStart(7, '0');
      const updateQuery = 'UPDATE "Abono" SET "numRecibo" = $1 WHERE "idAbono" = $2 RETURNING *';
      const updateResult = await pool.query(updateQuery, [nuevoNumRecibo, abono.idAbono]);
      abono = updateResult.rows[0];
      console.log('🟢 [AbonosModel] Abono creado y actualizado:', abono);
      return abono;
    } catch (error) {
      console.error('🔴 [AbonosModel] Error en la consulta SQL:', error);
      throw error;
    }
  },

  // Actualizar abono
  async actualizar(idAbono, datos) {
    const {
      fechaAbono,
      idCuenta,
      numRecibo,
      importeAbono,
      registroManual,
      activo
    } = datos;

    const query = `
      UPDATE "Abono"
      SET "fechaAbono" = $1, "idCuenta" = $2, "numRecibo" = $3,
          "importeAbono" = $4, "registroManual" = $5, "activo" = $6
      WHERE "idAbono" = $7
      RETURNING *
    `;
    const values = [
      fechaAbono, idCuenta, numRecibo, importeAbono,
      registroManual, activo, idAbono
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar abono (soft delete)
  async eliminar(idAbono) {
    const query = 'UPDATE "Abono" SET "activo" = false WHERE "idAbono" = $1 RETURNING *';
    const result = await pool.query(query, [idAbono]);
    return result.rows[0];
  },

  // Obtener estadísticas de abonos
  async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_abonos,
        SUM("importeAbono") as total_importe,
        COUNT(CASE WHEN "registroManual" = true THEN 1 END) as abonos_manuales,
        COUNT(CASE WHEN "registroManual" = false THEN 1 END) as abonos_automaticos
      FROM "Abono" 
      WHERE "activo" = true
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = abonosModel; 
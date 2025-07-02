const pool = require('../db');

const devolucionesModel = {
  async obtenerPorContrato(idContrato) {
    const query = `
      SELECT d.*, cb."codigoCuenta", cb."tipoCuenta", b."nombreBanco"
      FROM "Devolucion" d
      LEFT JOIN "CuentaBancaria" cb ON d."idCuenta" = cb."idCuenta"
      LEFT JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE d."idContrato" = $1 AND d."activo" = true 
      ORDER BY d."fechaDevolucion" DESC
    `;
    const result = await pool.query(query, [idContrato]);
    return result.rows;
  },
  async obtenerPorId(idDevolucion) {
    const query = `
      SELECT d.*, cb."codigoCuenta", cb."tipoCuenta", b."nombreBanco"
      FROM "Devolucion" d
      LEFT JOIN "CuentaBancaria" cb ON d."idCuenta" = cb."idCuenta"
      LEFT JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE d."idDevolucion" = $1
    `;
    const result = await pool.query(query, [idDevolucion]);
    return result.rows[0];
  },
  async crear(datos) {
    console.log('🟦 [DevolucionesModel] Iniciando creación de devolución con datos:', datos);
    const {
      idContrato,
      fechaDevolucion,
      idCuenta,
      numRecibo,
      importeDevolucion
    } = datos;
    const query = `
      INSERT INTO "Devolucion" (
        "idContrato", "fechaDevolucion", "idCuenta", "numRecibo", "importeDevolución", "activo"
      ) VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `;
    const values = [idContrato, fechaDevolucion, idCuenta, numRecibo, importeDevolucion];
    console.log('🟦 [DevolucionesModel] Ejecutando query con valores:', values);
    try {
      const result = await pool.query(query, values);
      console.log('🟢 [DevolucionesModel] Devolución creada exitosamente en BD:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('🔴 [DevolucionesModel] Error en la consulta SQL:', error);
      throw error;
    }
  }
};

module.exports = devolucionesModel; 
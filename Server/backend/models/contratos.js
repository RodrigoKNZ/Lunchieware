const pool = require('../db');

const contratosModel = {
  // Obtener todos los contratos
  async obtenerTodos() {
    const query = 'SELECT * FROM "Contrato" WHERE "activo" = true ORDER BY "fechaInicioVigencia" DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener contrato por ID
  async obtenerPorId(idContrato) {
    const query = 'SELECT * FROM "Contrato" WHERE "idContrato" = $1 AND "activo" = true';
    const result = await pool.query(query, [idContrato]);
    return result.rows[0];
  },

  // Obtener contratos por cliente
  async obtenerPorCliente(idCliente) {
    const query = 'SELECT * FROM "Contrato" WHERE "idCliente" = $1 AND "activo" = true ORDER BY "fechaInicioVigencia" DESC';
    const result = await pool.query(query, [idCliente]);
    return result.rows;
  },

  // Crear contrato (con código autogenerado)
  async crear({ idCliente, fechaInicioVigencia, fechaFinVigencia, fechaCreacion }) {
    // Insertar con código temporal
    const insertQuery = `
      INSERT INTO "Contrato" (
        "codigoContrato", "idCliente", "fechaInicioVigencia", "fechaFinVigencia", "fechaCreacion", "importeAbonos", "importeConsumos", "importeSaldo", "activo"
      ) VALUES ($1, $2, $3, $4, $5, 0, 0, 0, true)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [
      'TEMP',
      idCliente,
      fechaInicioVigencia,
      fechaFinVigencia,
      fechaCreacion
    ]);
    const idContrato = insertResult.rows[0].idContrato;
    const codigoContrato = idContrato.toString().padStart(6, '0');
    // Actualizar el código de contrato
    await pool.query('UPDATE "Contrato" SET "codigoContrato" = $1 WHERE "idContrato" = $2', [codigoContrato, idContrato]);
    // Devolver el contrato actualizado
    const contrato = await this.obtenerPorId(idContrato);
    return contrato;
  },

  // Actualizar contrato
  async actualizar(idContrato, datos) {
    const {
      fechaInicioVigencia,
      fechaFinVigencia,
      fechaCreacion,
      importeAbonos,
      importeConsumos,
      importeSaldo,
      activo
    } = datos;
    const query = `
      UPDATE "Contrato"
      SET "fechaInicioVigencia" = $1, "fechaFinVigencia" = $2, "fechaCreacion" = $3,
          "importeAbonos" = $4, "importeConsumos" = $5, "importeSaldo" = $6, "activo" = $7
      WHERE "idContrato" = $8
      RETURNING *
    `;
    const values = [
      fechaInicioVigencia, fechaFinVigencia, fechaCreacion,
      importeAbonos, importeConsumos, importeSaldo, activo, idContrato
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar contrato (soft delete)
  async eliminar(idContrato) {
    const query = 'UPDATE "Contrato" SET "activo" = false WHERE "idContrato" = $1 RETURNING *';
    const result = await pool.query(query, [idContrato]);
    return result.rows[0];
  },

  // Actualizar saldo del contrato después de un abono
  async actualizarSaldoDespuesAbono(idContrato, montoAbono) {
    try {
      // Obtener el contrato actual
      const contrato = await this.obtenerPorId(idContrato);
      if (!contrato) {
        throw new Error(`Contrato con ID ${idContrato} no encontrado`);
      }

      // Calcular nuevos valores
      const nuevoImporteAbonos = parseFloat(contrato.importeAbonos || 0) + parseFloat(montoAbono);
      const nuevoSaldo = nuevoImporteAbonos - parseFloat(contrato.importeConsumos || 0);

      // Actualizar el contrato
      const datosActualizados = {
        ...contrato,
        importeAbonos: nuevoImporteAbonos,
        importeSaldo: nuevoSaldo
      };

      const contratoActualizado = await this.actualizar(idContrato, datosActualizados);
      
      console.log('Saldo del contrato actualizado:', {
        contrato: contrato.codigoContrato,
        abonoAnterior: contrato.importeAbonos,
        nuevoAbono: montoAbono,
        totalAbonos: nuevoImporteAbonos,
        saldoAnterior: contrato.importeSaldo,
        nuevoSaldo: nuevoSaldo
      });

      return contratoActualizado;
    } catch (error) {
      console.error('Error actualizando saldo del contrato:', error);
      throw error;
    }
  }
};

module.exports = contratosModel; 
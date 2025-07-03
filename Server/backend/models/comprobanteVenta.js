const pool = require('../db');

const comprobanteVentaModel = {
  // Buscar o crear consumo del día para un contrato
  async obtenerOCrearConsumoDelDia(idContrato, fecha) {
    // Buscar consumo existente
    const queryBuscar = 'SELECT * FROM "Consumo" WHERE "idContrato" = $1 AND "fechaConsumo" = $2 AND "activo" = true';
    const resultBuscar = await pool.query(queryBuscar, [idContrato, fecha]);
    if (resultBuscar.rows.length > 0) return resultBuscar.rows[0];
    // Crear consumo nuevo
    const queryCrear = 'INSERT INTO "Consumo" ("idContrato", "fechaConsumo", "activo") VALUES ($1, $2, true) RETURNING *';
    const resultCrear = await pool.query(queryCrear, [idContrato, fecha]);
    return resultCrear.rows[0];
  },

  // Crear comprobante de venta y detalles en una transacción
  async registrarVenta({ idContrato, tipoComprobante, numeroSerie, numeroComprobante, fechaDocumento, formaPago, medioDePago, detalles, importeImponible, importeImpuesto, importeTotal, saldoAlMomentoDeVenta }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // 1. Buscar o crear consumo del día
      const hoy = fechaDocumento;
      const consumo = await this.obtenerOCrearConsumoDelDia(idContrato, hoy);
      // 2. Crear comprobante de venta con número temporal '0000000'
      const queryComprobante = `INSERT INTO "ComprobanteVenta" (
        "tipoComprobante", "numeroSerie", "numeroComprobante", "fechaDocumento", "idContrato", "formaDePago", "medioDePago", "importeImponible", "importeImpuesto", "importeTotal", "saldoAlMomentoDeVenta", "idConsumo", "activo"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true) RETURNING *`;
      const valuesComprobante = [
        tipoComprobante, numeroSerie, '0000000', fechaDocumento, idContrato, formaPago, medioDePago, importeImponible, importeImpuesto, importeTotal, saldoAlMomentoDeVenta, consumo.idConsumo
      ];
      const resultComprobante = await client.query(queryComprobante, valuesComprobante);
      let comprobante = resultComprobante.rows[0];
      // 3. Actualizar el número de comprobante con el id en 7 dígitos
      const nuevoNumeroComprobante = comprobante.idComprobante.toString().padStart(7, '0');
      const updateQuery = 'UPDATE "ComprobanteVenta" SET "numeroComprobante" = $1 WHERE "idComprobante" = $2 RETURNING *';
      const updateResult = await client.query(updateQuery, [nuevoNumeroComprobante, comprobante.idComprobante]);
      comprobante = updateResult.rows[0];
      // 4. Crear detalles
      for (const [i, det] of detalles.entries()) {
        const queryDetalle = `INSERT INTO "FilaDetalleComprobante" (
          "idComprobante", "idFila", "idProducto", "cantidad", "importeTotal", "activo"
        ) VALUES ($1, $2, $3, $4, $5, true)`;
        await client.query(queryDetalle, [
          comprobante.idComprobante, i + 1, det.idProducto, det.cantidad, det.importeTotal
        ]);
      }
      // 5. Actualizar importes en contrato SOLO si es con cargo en cuenta
      if (formaPago === 'cuenta') {
        const queryContrato = 'UPDATE "Contrato" SET "importeConsumos" = "importeConsumos" + $1, "importeSaldo" = "importeSaldo" - $1 WHERE "idContrato" = $2';
        await client.query(queryContrato, [importeTotal, idContrato]);
      }
      await client.query('COMMIT');
      return { comprobante, consumoId: consumo.idConsumo };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = comprobanteVentaModel; 
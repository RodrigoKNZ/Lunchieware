const pool = require('../db');

const notasCreditoModel = {
  async obtenerPorContrato(idContrato) {
    const query = `
      SELECT n.*, c."numeroComprobante" as "numeroComprobanteAfectado"
      FROM "NotaDeCredito" n
      JOIN "ComprobanteVenta" c ON n."idComprobante" = c."idComprobante"
      WHERE c."idContrato" = $1 AND n."activo" = true
      ORDER BY n."fechaDocumento" DESC
    `;
    const result = await pool.query(query, [idContrato]);
    return result.rows;
  },
  async obtenerPorId(idNota) {
    const query = `
      SELECT n.*, c."numeroComprobante" as "numeroComprobanteAfectado"
      FROM "NotaDeCredito" n
      LEFT JOIN "ComprobanteVenta" c ON n."idComprobante" = c."idComprobante"
      WHERE n."idNotaDeCredito" = $1
    `;
    const result = await pool.query(query, [idNota]);
    return result.rows[0];
  },
  async crear(datos) {
    const {
      idContrato,
      numeroNotaCredito,
      numeroComprobanteAfectado,
      importeInafecto,
      importeImponible,
      importeImpuesto,
      importeTotal,
      motivo
    } = datos;

    // Primero necesitamos obtener el idComprobante basado en el numeroComprobanteAfectado
    const comprobanteQuery = `
      SELECT "idComprobante" FROM "ComprobanteVenta" 
      WHERE "numeroComprobante" = $1 AND "idContrato" = $2 AND "activo" = true
    `;
    const comprobanteResult = await pool.query(comprobanteQuery, [numeroComprobanteAfectado, idContrato]);
    
    if (comprobanteResult.rows.length === 0) {
      throw new Error('Comprobante no encontrado');
    }

    const idComprobante = comprobanteResult.rows[0].idComprobante;

    const query = `
      INSERT INTO "NotaDeCredito" (
        "idComprobante", "numeroNotaCredito", "fechaDocumento", 
        "importeInafecto", "importeImponible", "importeImpuesto", 
        "importeTotal", "motivo", "activo"
      )
      VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, true)
      RETURNING *
    `;
    const values = [
      idComprobante, numeroNotaCredito, importeInafecto, 
      importeImponible, importeImpuesto, importeTotal, motivo
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  async actualizarCodigo(idNota, codigo) {
    const query = `
      UPDATE "NotaDeCredito"
      SET "numeroNotaCredito" = $1
      WHERE "idNotaDeCredito" = $2
      RETURNING *
    `;
    const result = await pool.query(query, [codigo, idNota]);
    return result.rows[0];
  }
};

module.exports = notasCreditoModel; 
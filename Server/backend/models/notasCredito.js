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
      numeroSerie,
      numeroComprobanteAfectado,
      importeInafecto,
      importeImponible,
      importeImpuesto,
      importeTotal,
      motivo
    } = datos;

    console.log('[NotaCredito] Datos recibidos:', datos);
    // Obtener el idComprobante basado en el numeroComprobanteAfectado
    const comprobanteQuery = `
      SELECT "idComprobante" FROM "ComprobanteVenta" 
      WHERE "numeroComprobante" = $1 AND "idContrato" = $2 AND "activo" = true
    `;
    console.log('[NotaCredito] Ejecutando query para buscar comprobante:', comprobanteQuery, [numeroComprobanteAfectado, idContrato]);
    const comprobanteResult = await pool.query(comprobanteQuery, [numeroComprobanteAfectado, idContrato]);
    console.log('[NotaCredito] Resultado de búsqueda de comprobante:', comprobanteResult.rows);
    if (comprobanteResult.rows.length === 0) {
      console.error('[NotaCredito] Comprobante no encontrado para:', numeroComprobanteAfectado, 'Contrato:', idContrato);
      throw new Error('Comprobante no encontrado');
    }
    const idComprobante = comprobanteResult.rows[0].idComprobante;

    // Insertar con numeroDocumento temporal
    const query = `
      INSERT INTO "NotaDeCredito" (
        "idComprobante", "numeroSerie", "numeroDocumento", "fechaDocumento", 
        "importeInafecto", "importeImponible", "importeImpuesto", 
        "importeTotal", "motivo", "activo"
      )
      VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, true)
      RETURNING *
    `;
    const values = [
      idComprobante, numeroSerie, '0000000', importeInafecto, 
      importeImponible, importeImpuesto, importeTotal, motivo
    ];
    console.log('[NotaCredito] Insertando nota de crédito con valores:', values);
    const result = await pool.query(query, values);
    let nota = result.rows[0];
    // Actualizar el número de documento con el idNotaDeCredito en 7 dígitos
    const nuevoNumeroDocumento = nota.idNotaDeCredito.toString().padStart(7, '0');
    const updateQuery = 'UPDATE "NotaDeCredito" SET "numeroDocumento" = $1 WHERE "idNotaDeCredito" = $2 RETURNING *';
    const updateResult = await pool.query(updateQuery, [nuevoNumeroDocumento, nota.idNotaDeCredito]);
    nota = updateResult.rows[0];
    console.log('[NotaCredito] Nota de crédito creada y actualizada:', nota);
    return nota;
  },
  async actualizarCodigo(idNota, codigo) {
    const query = `
      UPDATE "NotaDeCredito"
      SET "numeroDocumento" = $1
      WHERE "idNotaDeCredito" = $2
      RETURNING *
    `;
    const result = await pool.query(query, [codigo, idNota]);
    return result.rows[0];
  }
};

module.exports = notasCreditoModel; 
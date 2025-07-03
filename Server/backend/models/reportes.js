const pool = require('../db');

const reportesModel = {
  async liquidacionDiaria(fecha) {
    if (!fecha) return { ventas: [], total: 0 };
    try {
      const result = await pool.query(`
        WITH comprobantes_ordenados AS (
          SELECT 
            cv.*, 
            MIN(cv."saldoAlMomentoDeVenta") OVER (PARTITION BY cv."idConsumo") AS saldo_dia_anterior
          FROM "ComprobanteVenta" cv
          WHERE cv."activo" = true
        )
        SELECT 
          TO_CHAR(co."fechaConsumo", 'YYYY-MM-DD') AS "fecha",
          cl."codigoCliente", 
          cl."nombres", 
          ct."idContrato",
          CASE cv."tipoComprobante"
            WHEN 'N' THEN 'Nota de venta'
            WHEN 'B' THEN 'Boleta'
            WHEN 'F' THEN 'Factura'
            ELSE cv."tipoComprobante"
          END AS "tipoComprobante",
          cv."numeroSerie", 
          cv."numeroComprobante", 
          p."nombreProducto" AS "producto",
          cv.saldo_dia_anterior AS "saldoDiaAnterior",
          cv."importeTotal" AS "valorVenta"
        FROM "Consumo" co
        JOIN "Contrato" ct ON co."idContrato" = ct."idContrato"
        JOIN "Cliente" cl ON ct."idCliente" = cl."idCliente"
        JOIN comprobantes_ordenados cv ON cv."idConsumo" = co."idConsumo"
        LEFT JOIN "FilaDetalleComprobante" fdc ON fdc."idComprobante" = cv."idComprobante" AND fdc."activo" = true
        LEFT JOIN "Producto" p ON fdc."idProducto" = p."idProducto"
        WHERE DATE(co."fechaConsumo") = $1
          AND co."activo" = true
        ORDER BY co."fechaConsumo" ASC, cv."fechaDocumento" ASC, cv."idComprobante" ASC
      `, [fecha]);
      const total = result.rows.reduce((acc, r) => acc + Number(r.valorVenta || 0), 0);
      return { ventas: result.rows, total };
    } catch (e) {
      return { ventas: [], total: 0 };
    }
  },
  async consumoProfesores(desde, hasta) {
    if (!desde || !hasta) return [];
    try {
      const result = await pool.query(`
        SELECT c."codigoCliente", c."nombres", co."montoPagado", co."montoConsumido", co."saldoRestante", co."fechaConsumo", co."totalAcumulado"
        FROM "Consumo" co
        JOIN "Cliente" c ON co."idCliente" = c."idCliente"
        JOIN "Contrato" ct ON ct."idCliente" = c."idCliente"
        WHERE c."tipoCliente" = 'D' AND ct."deudaPendiente" = true
          AND co."fechaConsumo" BETWEEN $1 AND $2
        ORDER BY co."fechaConsumo" ASC
      `, [desde, hasta]);
      return result.rows;
    } catch (e) {
      return [];
    }
  },
  async cobranzas(desde, hasta) {
    if (!desde || !hasta) return [];
    try {
      const result = await pool.query(`
        SELECT c."codigoCliente", c."nombres", c."nivel", c."grado", c."seccion", a."fechaDeposito", a."numeroRecibo", a."importeDepositado", a."banco", a."numeroCuenta", a."tipoRegistro"
        FROM "Abono" a
        JOIN "Cliente" c ON a."idCliente" = c."idCliente"
        WHERE a."fechaDeposito" BETWEEN $1 AND $2
        ORDER BY a."fechaDeposito" ASC
      `, [desde, hasta]);
      return result.rows;
    } catch (e) {
      return [];
    }
  }
};

module.exports = reportesModel; 
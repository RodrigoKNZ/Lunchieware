const express = require('express');
const comprobanteVentaModel = require('../models/comprobanteVenta');
const contratosModel = require('../models/contratos');
const router = express.Router();

// Registrar venta
router.post('/registrar-venta', async (req, res) => {
  try {
    const IGV = parseFloat(process.env.IGV || '0.18');
    const {
      idContrato,
      numeroSerie,
      numeroComprobante,
      fechaDocumento,
      formaPago,
      medioDePago,
      detalles,
      total,
      saldoAlMomentoDeVenta
    } = req.body;

    // Calcular imponible e impuesto
    const imponible = +(total / (1 + IGV)).toFixed(2);
    const impuesto = +(imponible * IGV).toFixed(2);

    // Registrar venta
    const result = await comprobanteVentaModel.registrarVenta({
      idContrato,
      tipoComprobante: 'N', // Nota de venta
      numeroSerie,
      numeroComprobante,
      fechaDocumento,
      formaPago,
      medioDePago,
      detalles,
      importeImponible: imponible,
      importeImpuesto: impuesto,
      importeTotal: total,
      saldoAlMomentoDeVenta
    });

    res.json({ message: 'Venta registrada exitosamente', data: result });
  } catch (error) {
    console.error('Error registrando venta:', error);
    res.status(500).json({ message: 'Error registrando venta', error: error.message });
  }
});

// Obtener todos los comprobantes de venta por contrato (con detalles)
router.get('/contrato/:idContrato', async (req, res) => {
  try {
    const { idContrato } = req.params;
    const pool = require('../db');
    // Traer comprobantes y detalles con nombres de productos y tipos de comprobante
    const comprobantesQuery = `
      SELECT 
        c.*,
        d."idProducto", 
        d."cantidad", 
        d."importeTotal" as "detalleImporteTotal",
        p."nombreProducto",
        CASE 
          WHEN c."tipoComprobante" = 'N' THEN 'Nota de Venta'
          WHEN c."tipoComprobante" = 'F' THEN 'Factura'
          WHEN c."tipoComprobante" = 'B' THEN 'Boleta'
          ELSE c."tipoComprobante"
        END as "tipoComprobanteNombre"
      FROM "ComprobanteVenta" c
      LEFT JOIN "FilaDetalleComprobante" d ON c."idComprobante" = d."idComprobante"
      LEFT JOIN "Producto" p ON d."idProducto" = p."idProducto"
      WHERE c."idContrato" = $1 AND c."activo" = true
      ORDER BY c."fechaDocumento" DESC, c."idComprobante" DESC
    `;
    const result = await pool.query(comprobantesQuery, [idContrato]);
    // Agrupar detalles por comprobante
    const comprobantesMap = {};
    for (const row of result.rows) {
      if (!comprobantesMap[row.idComprobante]) {
        comprobantesMap[row.idComprobante] = {
          ...row,
          detalles: []
        };
      }
      if (row.idProducto) {
        comprobantesMap[row.idComprobante].detalles.push({
          idProducto: row.idProducto,
          nombreProducto: row.nombreProducto,
          cantidad: row.cantidad,
          importeTotal: row.detalleImporteTotal
        });
      }
    }
    const comprobantes = Object.values(comprobantesMap);
    res.json({ message: 'Comprobantes de venta obtenidos', data: comprobantes });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo comprobantes de venta', error: error.message });
  }
});

module.exports = router; 
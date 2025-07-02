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

module.exports = router; 
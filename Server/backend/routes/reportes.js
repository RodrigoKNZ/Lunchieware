const express = require('express');
const router = express.Router();
const reportesModel = require('../models/reportes');

// Liquidación diaria de caja
router.get('/liquidacion-diaria', async (req, res) => {
  try {
    const { fecha } = req.query;
    const data = await reportesModel.liquidacionDiaria(fecha);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consumo de profesores
router.get('/consumo-profesores', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const data = await reportesModel.consumoProfesores(desde, hasta);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cobranzas
router.get('/cobranzas', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const data = await reportesModel.cobranzas(desde, hasta);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
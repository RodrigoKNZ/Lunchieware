const express = require('express');
const consumosModel = require('../models/consumos');
const router = express.Router();

// Obtener todos los consumos por contrato
router.get('/contrato/:idContrato', async (req, res) => {
  try {
    const consumos = await consumosModel.obtenerPorContrato(req.params.idContrato);
    res.json({ message: 'Consumos obtenidos', data: consumos });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo consumos', error: error.message });
  }
});

// Obtener un consumo por ID
router.get('/:id', async (req, res) => {
  try {
    const consumo = await consumosModel.obtenerPorId(req.params.id);
    if (!consumo) return res.status(404).json({ message: 'Consumo no encontrado' });
    res.json({ message: 'Consumo obtenido', data: consumo });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo consumo', error: error.message });
  }
});

module.exports = router; 
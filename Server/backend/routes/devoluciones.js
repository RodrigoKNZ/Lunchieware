const express = require('express');
const devolucionesModel = require('../models/devoluciones');
const router = express.Router();

// Obtener todas las devoluciones por contrato
router.get('/contrato/:idContrato', async (req, res) => {
  try {
    const devoluciones = await devolucionesModel.obtenerPorContrato(req.params.idContrato);
    res.json({ message: 'Devoluciones obtenidas', data: devoluciones });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo devoluciones', error: error.message });
  }
});

// Obtener una devolución por ID
router.get('/:id', async (req, res) => {
  try {
    const devolucion = await devolucionesModel.obtenerPorId(req.params.id);
    if (!devolucion) return res.status(404).json({ message: 'Devolución no encontrada' });
    res.json({ message: 'Devolución obtenida', data: devolucion });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo devolución', error: error.message });
  }
});

// Crear nueva devolución
router.post('/', async (req, res) => {
  try {
    const {
      idContrato,
      fechaDevolucion,
      idCuenta,
      numRecibo,
      importeDevolucion
    } = req.body;

    if (!idContrato || !idCuenta || !numRecibo || !importeDevolucion) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Si no viene fecha, usar la del sistema
    const fechaFinal = fechaDevolucion || new Date().toISOString().slice(0, 10);

    const nuevaDevolucion = await devolucionesModel.crear({
      idContrato,
      fechaDevolucion: fechaFinal,
      idCuenta,
      numRecibo,
      importeDevolucion
    });
    res.status(201).json({ message: 'Devolución creada', data: nuevaDevolucion });
  } catch (error) {
    res.status(500).json({ message: 'Error creando devolución', error: error.message });
  }
});

module.exports = router; 
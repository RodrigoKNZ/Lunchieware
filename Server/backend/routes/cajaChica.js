const express = require('express');
const cajaChicaModel = require('../models/cajaChica');
const router = express.Router();

// Listar todas las cajas chicas
router.get('/', async (req, res) => {
  try {
    const cajas = await cajaChicaModel.obtenerTodas();
    res.json({ message: 'Cajas chicas obtenidas exitosamente', data: cajas });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo cajas chicas', error: error.message });
  }
});

// Obtener caja chica por ID
router.get('/:id', async (req, res) => {
  try {
    const caja = await cajaChicaModel.obtenerPorId(req.params.id);
    if (!caja) return res.status(404).json({ message: 'Caja chica no encontrada' });
    res.json({ message: 'Caja chica obtenida exitosamente', data: caja });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo caja chica', error: error.message });
  }
});

// Crear nueva caja chica
router.post('/', async (req, res) => {
  try {
    const { fechaApertura, saldoInicial, observaciones } = req.body;
    
    // Validaciones
    if (!fechaApertura || !saldoInicial) {
      return res.status(400).json({ message: 'Fecha de apertura y saldo inicial son requeridos' });
    }
    
    if (saldoInicial <= 0) {
      return res.status(400).json({ message: 'El saldo inicial debe ser mayor a 0' });
    }

    const nuevaCaja = await cajaChicaModel.crear({
      fechaApertura,
      saldoInicial: parseFloat(saldoInicial),
      observaciones: observaciones || ''
    });
    res.status(201).json({ message: 'Caja chica creada exitosamente', data: nuevaCaja });
  } catch (error) {
    res.status(500).json({ message: 'Error creando caja chica', error: error.message });
  }
});

// Actualizar caja chica (observaciones)
router.put('/:id', async (req, res) => {
  try {
    const { observaciones } = req.body;
    
    if (!observaciones) {
      return res.status(400).json({ message: 'Las observaciones son requeridas' });
    }

    const cajaActualizada = await cajaChicaModel.actualizar(req.params.id, { observaciones });
    if (!cajaActualizada) {
      return res.status(404).json({ message: 'Caja chica no encontrada' });
    }
    res.json({ message: 'Caja chica actualizada exitosamente', data: cajaActualizada });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando caja chica', error: error.message });
  }
});

// Cerrar (liquidar) caja chica
router.patch('/:id/cerrar', async (req, res) => {
  try {
    const { fechaLiquidacion, saldoFinal } = req.body;
    
    // Validaciones
    if (!fechaLiquidacion || !saldoFinal) {
      return res.status(400).json({ message: 'Fecha de liquidación y saldo final son requeridos' });
    }
    
    if (saldoFinal < 0) {
      return res.status(400).json({ message: 'El saldo final no puede ser negativo' });
    }

    const cajaCerrada = await cajaChicaModel.cerrar(req.params.id, fechaLiquidacion, parseFloat(saldoFinal));
    if (!cajaCerrada) {
      return res.status(404).json({ message: 'Caja chica no encontrada o ya cerrada' });
    }
    res.json({ message: 'Caja chica cerrada exitosamente', data: cajaCerrada });
  } catch (error) {
    res.status(500).json({ message: 'Error cerrando caja chica', error: error.message });
  }
});

// Eliminar caja chica
router.delete('/:id', async (req, res) => {
  try {
    const cajaEliminada = await cajaChicaModel.eliminar(req.params.id);
    if (!cajaEliminada) {
      return res.status(404).json({ message: 'Caja chica no encontrada' });
    }
    res.json({ message: 'Caja chica eliminada exitosamente', data: cajaEliminada });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando caja chica', error: error.message });
  }
});

// Filtrar cajas chicas (por número y estado)
router.get('/filtrar', async (req, res) => {
  try {
    const { numeroLiquidacion, abierta } = req.query;
    const cajas = await cajaChicaModel.filtrar({ numeroLiquidacion, abierta });
    res.json({ message: 'Cajas chicas filtradas exitosamente', data: cajas });
  } catch (error) {
    res.status(500).json({ message: 'Error filtrando cajas chicas', error: error.message });
  }
});

// Obtener caja chica por numeroLiquidacion
router.get('/numero/:numeroLiquidacion', async (req, res) => {
  try {
    const caja = await cajaChicaModel.obtenerPorNumeroLiquidacion(req.params.numeroLiquidacion);
    if (!caja) return res.status(404).json({ message: 'Caja chica no encontrada' });
    res.json({ message: 'Caja chica obtenida exitosamente', data: caja });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo caja chica', error: error.message });
  }
});

module.exports = router; 
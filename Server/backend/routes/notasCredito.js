const express = require('express');
const notasCreditoModel = require('../models/notasCredito');
const router = express.Router();

// Crear nueva nota de crédito
router.post('/', async (req, res) => {
  try {
    const {
      idContrato,
      numeroNotaCredito,
      numeroComprobanteAfectado,
      importeInafecto,
      importeImponible,
      importeImpuesto,
      importeTotal,
      motivo
    } = req.body;

    if (!idContrato || !numeroNotaCredito || !numeroComprobanteAfectado || !motivo) {
      return res.status(400).json({ 
        message: 'Los campos contrato, número de nota de crédito, número de comprobante afectado y motivo son requeridos' 
      });
    }

    const nuevaNota = await notasCreditoModel.crear({
      idContrato,
      numeroNotaCredito,
      numeroComprobanteAfectado,
      importeInafecto: importeInafecto || 0,
      importeImponible: importeImponible || 0,
      importeImpuesto: importeImpuesto || 0,
      importeTotal: importeTotal || 0,
      motivo
    });

    res.status(201).json({
      message: 'Nota de crédito creada exitosamente',
      data: nuevaNota
    });
  } catch (error) {
    console.error('Error creando nota de crédito:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Obtener todas las notas de crédito por contrato
router.get('/contrato/:idContrato', async (req, res) => {
  try {
    const notas = await notasCreditoModel.obtenerPorContrato(req.params.idContrato);
    res.json({ message: 'Notas de crédito obtenidas', data: notas });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo notas de crédito', error: error.message });
  }
});

// Obtener una nota de crédito por ID
router.get('/:id', async (req, res) => {
  try {
    const nota = await notasCreditoModel.obtenerPorId(req.params.id);
    if (!nota) return res.status(404).json({ message: 'Nota de crédito no encontrada' });
    res.json({ message: 'Nota de crédito obtenida', data: nota });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo nota de crédito', error: error.message });
  }
});

// Actualizar código de nota de crédito
router.put('/:id/codigo', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;

    if (!codigo) {
      return res.status(400).json({ 
        message: 'El código es requerido' 
      });
    }

    const notaActualizada = await notasCreditoModel.actualizarCodigo(id, codigo);

    res.json({
      message: 'Código de nota de crédito actualizado exitosamente',
      data: notaActualizada
    });
  } catch (error) {
    console.error('Error actualizando código de nota de crédito:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router; 
const express = require('express');
const contratosModel = require('../models/contratos');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todos los contratos
router.get('/', async (req, res) => {
  try {
    const contratos = await contratosModel.obtenerTodos();
    res.json({ message: 'Contratos obtenidos exitosamente', data: contratos });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo contratos', error: error.message });
  }
});

// Obtener contrato por ID
router.get('/:id', async (req, res) => {
  try {
    const contrato = await contratosModel.obtenerPorId(req.params.id);
    if (!contrato) return res.status(404).json({ message: 'Contrato no encontrado' });
    res.json({ message: 'Contrato obtenido exitosamente', data: contrato });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo contrato', error: error.message });
  }
});

// Obtener contratos por cliente
router.get('/cliente/:idCliente', async (req, res) => {
  try {
    const contratos = await contratosModel.obtenerPorCliente(req.params.idCliente);
    res.json({ message: 'Contratos por cliente obtenidos', data: contratos });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo contratos por cliente', error: error.message });
  }
});

// Crear contrato
router.post('/', async (req, res) => {
  try {
    const contrato = await contratosModel.crear(req.body);
    res.status(201).json({ message: 'Contrato creado exitosamente', data: contrato });
  } catch (error) {
    res.status(500).json({ message: 'Error creando contrato', error: error.message });
  }
});

// Actualizar contrato
router.put('/:id', async (req, res) => {
  try {
    const contrato = await contratosModel.actualizar(req.params.id, req.body);
    res.json({ message: 'Contrato actualizado exitosamente', data: contrato });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando contrato', error: error.message });
  }
});

// Eliminar contrato (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const contrato = await contratosModel.eliminar(req.params.id);
    res.json({ message: 'Contrato eliminado exitosamente', data: contrato });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando contrato', error: error.message });
  }
});

module.exports = router; 
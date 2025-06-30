const express = require('express');
const abonosModel = require('../models/abonos');
const { authMiddleware, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Temporalmente deshabilitado para pruebas
// router.use(authMiddleware);

// Obtener todos los abonos
router.get('/', async (req, res) => {
  try {
    const abonos = await abonosModel.obtenerTodos();
    res.json({
      message: 'Abonos obtenidos exitosamente',
      data: abonos
    });
  } catch (error) {
    console.error('Error obteniendo abonos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener abono por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const abono = await abonosModel.obtenerPorId(id);
    
    if (!abono) {
      return res.status(404).json({ 
        message: 'Abono no encontrado' 
      });
    }

    res.json({
      message: 'Abono obtenido exitosamente',
      data: abono
    });
  } catch (error) {
    console.error('Error obteniendo abono:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener abonos por contrato
router.get('/contrato/:idContrato', async (req, res) => {
  try {
    const { idContrato } = req.params;
    const abonos = await abonosModel.obtenerPorContrato(idContrato);
    
    res.json({
      message: 'Abonos por contrato obtenidos exitosamente',
      data: abonos
    });
  } catch (error) {
    console.error('Error obteniendo abonos por contrato:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener abonos por cliente
router.get('/cliente/:idCliente', async (req, res) => {
  try {
    const { idCliente } = req.params;
    const abonos = await abonosModel.obtenerPorCliente(idCliente);
    
    res.json({
      message: 'Abonos por cliente obtenidos exitosamente',
      data: abonos
    });
  } catch (error) {
    console.error('Error obteniendo abonos por cliente:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nuevo abono
router.post('/', async (req, res) => {
  try {
    const {
      idContrato,
      fechaAbono,
      idCuenta,
      numRecibo,
      importeAbono,
      registroManual
    } = req.body;

    if (!idContrato || !fechaAbono || !idCuenta || !numRecibo || !importeAbono) {
      return res.status(400).json({ 
        message: 'Los campos contrato, fecha, cuenta, número de recibo e importe son requeridos' 
      });
    }

    const nuevoAbono = await abonosModel.crear({
      idContrato,
      fechaAbono,
      idCuenta,
      numRecibo,
      importeAbono,
      registroManual
    });

    res.status(201).json({
      message: 'Abono creado exitosamente',
      data: nuevoAbono
    });
  } catch (error) {
    console.error('Error creando abono:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar abono
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const abonoExistente = await abonosModel.obtenerPorId(id);
    if (!abonoExistente) {
      return res.status(404).json({ 
        message: 'Abono no encontrado' 
      });
    }

    const abonoActualizado = await abonosModel.actualizar(id, datos);

    res.json({
      message: 'Abono actualizado exitosamente',
      data: abonoActualizado
    });
  } catch (error) {
    console.error('Error actualizando abono:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar abono
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const abonoExistente = await abonosModel.obtenerPorId(id);
    if (!abonoExistente) {
      return res.status(404).json({ 
        message: 'Abono no encontrado' 
      });
    }

    await abonosModel.eliminar(id);

    res.json({
      message: 'Abono eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando abono:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener estadísticas de abonos
router.get('/estadisticas/totales', async (req, res) => {
  try {
    const estadisticas = await abonosModel.obtenerEstadisticas();
    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router; 
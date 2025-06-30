const express = require('express');
const quejasModel = require('../models/quejas');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todas las quejas
router.get('/', async (req, res) => {
  try {
    const quejas = await quejasModel.obtenerTodas();
    res.json({
      message: 'Quejas obtenidas exitosamente',
      data: quejas
    });
  } catch (error) {
    console.error('Error obteniendo quejas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener queja por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queja = await quejasModel.obtenerPorId(id);
    
    if (!queja) {
      return res.status(404).json({ 
        message: 'Queja no encontrada' 
      });
    }

    res.json({
      message: 'Queja obtenida exitosamente',
      data: [queja]
    });
  } catch (error) {
    console.error('Error obteniendo queja:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener quejas resueltas
router.get('/resueltas/todas', async (req, res) => {
  try {
    const quejas = await quejasModel.obtenerResueltas();
    res.json({
      message: 'Quejas resueltas obtenidas exitosamente',
      data: quejas
    });
  } catch (error) {
    console.error('Error obteniendo quejas resueltas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener quejas pendientes
router.get('/pendientes/todas', async (req, res) => {
  try {
    const quejas = await quejasModel.obtenerPendientes();
    res.json({
      message: 'Quejas pendientes obtenidas exitosamente',
      data: quejas
    });
  } catch (error) {
    console.error('Error obteniendo quejas pendientes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nueva queja
router.post('/', async (req, res) => {
  try {
    const {
      codigoQueja,
      asunto,
      detalle,
      idUsuario,
      resuelto,
      activo
    } = req.body;

    // Solo validar asunto, detalle e idUsuario
    if (!asunto || !detalle || !idUsuario) {
      return res.status(400).json({ 
        message: 'Los campos asunto, detalle y usuario son requeridos' 
      });
    }

    // Si se envía código, verificar unicidad
    if (codigoQueja) {
      const quejaExistente = await quejasModel.obtenerPorCodigo(codigoQueja);
      if (quejaExistente) {
        return res.status(400).json({ 
          message: 'Ya existe una queja con ese código' 
        });
      }
    }

    const nuevaQueja = await quejasModel.crear({
      codigoQueja,
      asunto,
      detalle,
      idUsuario,
      resuelto,
      activo
    });

    res.status(201).json({
      message: 'Queja creada exitosamente',
      data: nuevaQueja
    });
  } catch (error) {
    console.error('Error creando queja:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar queja
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const quejaExistente = await quejasModel.obtenerPorId(id);
    if (!quejaExistente) {
      return res.status(404).json({ 
        message: 'Queja no encontrada' 
      });
    }

    const quejaActualizada = await quejasModel.actualizar(id, datos);

    res.json({
      message: 'Queja actualizada exitosamente',
      data: quejaActualizada
    });
  } catch (error) {
    console.error('Error actualizando queja:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Marcar queja como resuelta
router.patch('/:id/resolver', async (req, res) => {
  try {
    const { id } = req.params;

    const quejaExistente = await quejasModel.obtenerPorId(id);
    if (!quejaExistente) {
      return res.status(404).json({ 
        message: 'Queja no encontrada' 
      });
    }

    const quejaResuelta = await quejasModel.marcarResuelta(id);

    res.json({
      message: 'Queja marcada como resuelta exitosamente',
      data: quejaResuelta
    });
  } catch (error) {
    console.error('Error resolviendo queja:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar queja (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quejaExistente = await quejasModel.obtenerPorId(id);
    if (!quejaExistente) {
      return res.status(404).json({ 
        message: 'Queja no encontrada' 
      });
    }

    await quejasModel.eliminar(id);

    res.json({
      message: 'Queja eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando queja:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener estadísticas de quejas
router.get('/estadisticas/totales', async (req, res) => {
  try {
    const estadisticas = await quejasModel.obtenerEstadisticas();
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
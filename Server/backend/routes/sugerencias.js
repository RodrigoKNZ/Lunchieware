const express = require('express');
const sugerenciasModel = require('../models/sugerencias');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todas las sugerencias
router.get('/', async (req, res) => {
  try {
    const sugerencias = await sugerenciasModel.obtenerTodas();
    res.json({
      message: 'Sugerencias obtenidas exitosamente',
      data: sugerencias
    });
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener sugerencia por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sugerencia = await sugerenciasModel.obtenerPorId(id);
    if (!sugerencia) {
      return res.status(404).json({ 
        message: 'Sugerencia no encontrada' 
      });
    }
    res.json({
      message: 'Sugerencia obtenida exitosamente',
      data: [sugerencia]
    });
  } catch (error) {
    console.error('Error obteniendo sugerencia:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nueva sugerencia
router.post('/', async (req, res) => {
  try {
    const {
      codigoSugerencia,
      asunto,
      detalle,
      idUsuario,
      activo
    } = req.body;

    if (!asunto || !detalle || !idUsuario) {
      return res.status(400).json({ 
        message: 'Los campos asunto, detalle y usuario son requeridos' 
      });
    }

    // Generar un código temporal si no se proporciona
    const codigoFinal = codigoSugerencia || `TEMP${Date.now()}`;

    // Verificar si ya existe una sugerencia con ese código (solo si se proporciona un código)
    if (codigoSugerencia) {
      const sugerenciaExistente = await sugerenciasModel.obtenerPorCodigo(codigoSugerencia);
      if (sugerenciaExistente) {
        return res.status(400).json({ 
          message: 'Ya existe una sugerencia con ese código' 
        });
      }
    }

    const nuevaSugerencia = await sugerenciasModel.crear({
      codigoSugerencia: codigoFinal,
      asunto,
      detalle,
      idUsuario,
      activo
    });

    res.status(201).json({
      message: 'Sugerencia creada exitosamente',
      data: nuevaSugerencia
    });
  } catch (error) {
    console.error('Error creando sugerencia:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar sugerencia
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const sugerenciaExistente = await sugerenciasModel.obtenerPorId(id);
    if (!sugerenciaExistente) {
      return res.status(404).json({ 
        message: 'Sugerencia no encontrada' 
      });
    }

    const sugerenciaActualizada = await sugerenciasModel.actualizar(id, datos);

    res.json({
      message: 'Sugerencia actualizada exitosamente',
      data: sugerenciaActualizada
    });
  } catch (error) {
    console.error('Error actualizando sugerencia:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar sugerencia (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sugerenciaExistente = await sugerenciasModel.obtenerPorId(id);
    if (!sugerenciaExistente) {
      return res.status(404).json({ 
        message: 'Sugerencia no encontrada' 
      });
    }

    await sugerenciasModel.eliminar(id);

    res.json({
      message: 'Sugerencia eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando sugerencia:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener estadísticas de sugerencias
router.get('/estadisticas/totales', async (req, res) => {
  try {
    const estadisticas = await sugerenciasModel.obtenerEstadisticas();
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
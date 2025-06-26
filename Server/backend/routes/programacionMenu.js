const express = require('express');
const programacionMenuModel = require('../models/programacionMenu');

const router = express.Router();

// Obtener toda la programación del menú
router.get('/', async (req, res) => {
  try {
    const menus = await programacionMenuModel.obtenerTodos();
    res.json({
      message: 'Programación del menú obtenida exitosamente',
      data: menus
    });
  } catch (error) {
    console.error('Error obteniendo programación del menú:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener menús por rango de fechas (DEBE IR ANTES DE /:id)
router.get('/rango/:fechaInicio/:fechaFin', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;
    const menus = await programacionMenuModel.obtenerPorRangoFechas(fechaInicio, fechaFin);
    
    res.json({
      message: 'Menús obtenidos exitosamente',
      data: menus
    });
  } catch (error) {
    console.error('Error obteniendo menús por rango:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener menú por fecha (DEBE IR ANTES DE /:id)
router.get('/fecha/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const menu = await programacionMenuModel.obtenerPorFecha(fecha);
    
    if (!menu) {
      return res.status(404).json({ 
        message: 'No hay menú programado para esta fecha' 
      });
    }

    res.json({
      message: 'Menú obtenido exitosamente',
      data: menu
    });
  } catch (error) {
    console.error('Error obteniendo menú por fecha:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener menú por ID (DEBE IR AL FINAL)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await programacionMenuModel.obtenerPorId(id);
    
    if (!menu) {
      return res.status(404).json({ 
        message: 'Menú no encontrado' 
      });
    }

    res.json({
      message: 'Menú obtenido exitosamente',
      data: menu
    });
  } catch (error) {
    console.error('Error obteniendo menú:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nueva programación de menú (con sobreescritura)
router.post('/', async (req, res) => {
  try {
    const {
      fecha,
      entrada,
      plato,
      platoALaCarta,
      postre,
      refresco,
      activo
    } = req.body;

    if (!fecha || !entrada || !plato || !postre || !refresco) {
      return res.status(400).json({ 
        message: 'Los campos fecha, entrada, plato, postre y refresco son requeridos' 
      });
    }

    // Verificar si ya existe un menú para esa fecha
    const menuExistente = await programacionMenuModel.obtenerPorFecha(fecha);
    if (menuExistente) {
      // Sobreescribir (update)
      const actualizado = await programacionMenuModel.actualizar(menuExistente.idMenu, {
        fecha,
        entrada,
        plato,
        platoALaCarta,
        postre,
        refresco,
        activo: typeof activo === 'undefined' ? menuExistente.activo : activo
      });
      return res.json({
        message: 'Programación del menú actualizada exitosamente (sobreescritura)',
        data: actualizado
      });
    }

    const nuevoMenu = await programacionMenuModel.crear({
      fecha,
      entrada,
      plato,
      platoALaCarta,
      postre,
      refresco,
      activo
    });

    res.status(201).json({
      message: 'Programación del menú creada exitosamente',
      data: nuevoMenu
    });
  } catch (error) {
    console.error('Error creando programación del menú:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar programación de menú
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const menuExistente = await programacionMenuModel.obtenerPorId(id);
    if (!menuExistente) {
      return res.status(404).json({ 
        message: 'Menú no encontrado' 
      });
    }

    const menuActualizado = await programacionMenuModel.actualizar(id, datos);

    res.json({
      message: 'Programación del menú actualizada exitosamente',
      data: menuActualizado
    });
  } catch (error) {
    console.error('Error actualizando programación del menú:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar programación de menú
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const menuExistente = await programacionMenuModel.obtenerPorId(id);
    if (!menuExistente) {
      return res.status(404).json({ 
        message: 'Menú no encontrado' 
      });
    }

    await programacionMenuModel.eliminar(id);

    res.json({
      message: 'Programación del menú eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando programación del menú:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router; 
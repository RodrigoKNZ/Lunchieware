const express = require('express');
const movimientoCajaChicaModel = require('../models/movimientoCajaChica');
const { authMiddleware, requireAuth } = require('../middleware/auth');
const router = express.Router();

// Temporalmente deshabilitado para pruebas
// router.use(authMiddleware);

// Obtener todos los movimientos de todas las cajas chicas
router.get('/', async (req, res) => {
  try {
    const movimientos = await movimientoCajaChicaModel.obtenerTodos();
    console.log('GET /api/movimientos-cajachica - Movimientos obtenidos:', movimientos);
    res.json({ message: 'Movimientos obtenidos exitosamente', data: movimientos });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo movimientos', error: error.message });
  }
});

// Obtener movimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const movimiento = await movimientoCajaChicaModel.obtenerPorId(req.params.id);
    if (!movimiento) return res.status(404).json({ message: 'Movimiento no encontrado' });
    res.json({ message: 'Movimiento obtenido exitosamente', data: movimiento });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo movimiento', error: error.message });
  }
});

// Crear nuevo movimiento
router.post('/', async (req, res) => {
  try {
    const {
      idCajaChica,
      tipoDocumento,
      referencia,
      serie,
      numero,
      fechaMovimiento,
      montoImponible,
      impuestos,
      montoTotal
    } = req.body;

    // Validaciones básicas
    if (!idCajaChica || !tipoDocumento || !referencia || !serie || !numero || 
        !fechaMovimiento || !montoImponible || !impuestos || !montoTotal) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (montoImponible <= 0 || impuestos < 0 || montoTotal <= 0) {
      return res.status(400).json({ message: 'Los montos deben ser valores positivos' });
    }

    const nuevoMovimiento = await movimientoCajaChicaModel.crear({
      idCajaChica,
      tipoDocumento,
      referencia,
      serie,
      numero,
      fechaMovimiento,
      montoImponible: parseFloat(montoImponible),
      impuestos: parseFloat(impuestos),
      montoTotal: parseFloat(montoTotal)
    });

    res.status(201).json({ message: 'Movimiento creado exitosamente', data: nuevoMovimiento });
  } catch (error) {
    res.status(500).json({ message: 'Error creando movimiento', error: error.message });
  }
});

// Actualizar movimiento
router.put('/:id', async (req, res) => {
  try {
    const {
      tipoDocumento,
      referencia,
      serie,
      numero,
      fechaMovimiento,
      montoImponible,
      impuestos,
      montoTotal
    } = req.body;

    // Validaciones básicas
    if (!tipoDocumento || !referencia || !serie || !numero || 
        !fechaMovimiento || !montoImponible || !impuestos || !montoTotal) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (montoImponible <= 0 || impuestos < 0 || montoTotal <= 0) {
      return res.status(400).json({ message: 'Los montos deben ser valores positivos' });
    }

    const movimientoActualizado = await movimientoCajaChicaModel.actualizar(req.params.id, {
      tipoDocumento,
      referencia,
      serie,
      numero,
      fechaMovimiento,
      montoImponible: parseFloat(montoImponible),
      impuestos: parseFloat(impuestos),
      montoTotal: parseFloat(montoTotal)
    });

    if (!movimientoActualizado) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    res.json({ message: 'Movimiento actualizado exitosamente', data: movimientoActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando movimiento', error: error.message });
  }
});

// Eliminar movimiento
router.delete('/:id', async (req, res) => {
  try {
    const movimientoEliminado = await movimientoCajaChicaModel.eliminar(req.params.id);
    if (!movimientoEliminado) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    res.json({ message: 'Movimiento eliminado exitosamente', data: movimientoEliminado });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando movimiento', error: error.message });
  }
});

// Calcular saldo actual de una caja chica
router.get('/caja/:idCajaChica/saldo', async (req, res) => {
  try {
    const saldoGastado = await movimientoCajaChicaModel.calcularSaldoActual(req.params.idCajaChica);
    res.json({ message: 'Saldo calculado exitosamente', data: { saldoGastado } });
  } catch (error) {
    res.status(500).json({ message: 'Error calculando saldo', error: error.message });
  }
});

// Obtener todos los movimientos de una caja chica
router.get('/caja/:idCajaChica', async (req, res) => {
  try {
    const movimientos = await movimientoCajaChicaModel.obtenerPorCajaChica(req.params.idCajaChica);
    res.json({ message: 'Movimientos obtenidos exitosamente', data: movimientos });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo movimientos', error: error.message });
  }
});

module.exports = router; 
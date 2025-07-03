const express = require('express');
const cuentaBancariaModel = require('../models/cuentaBancaria');
const router = express.Router();

// Listar todas las cuentas bancarias agrupadas por banco
router.get('/', async (req, res) => {
  try {
    const cuentas = await cuentaBancariaModel.listarTodas();
    res.json({ message: 'Cuentas obtenidas', data: cuentas });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo cuentas', error: error.message });
  }
});

// Crear cuenta bancaria
router.post('/', async (req, res) => {
  try {
    console.log('🟦 [CuentasBancarias] Body recibido en POST:', req.body);
    const { idBanco, codigoCuenta, codigoAgencia, tipoCuenta, disponible } = req.body;
    console.log('🟦 [CuentasBancarias] Campos recibidos:', { idBanco, codigoCuenta, codigoAgencia, tipoCuenta, disponible });
    if (!idBanco || !codigoCuenta || !tipoCuenta) {
      console.log('🔴 [CuentasBancarias] Faltan campos obligatorios:', { idBanco, codigoCuenta, tipoCuenta });
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const cuenta = await cuentaBancariaModel.crear({ idBanco, codigoCuenta, codigoAgencia, tipoCuenta, disponible: disponible ?? true });
    res.status(201).json({ message: 'Cuenta creada', data: cuenta });
  } catch (error) {
    console.error('Error creando cuenta:', error);
    console.error('Body recibido:', req.body);
    res.status(500).json({ message: 'Error creando cuenta', error: error.message });
  }
});

// Listar cuentas por banco
router.get('/banco/:idBanco', async (req, res) => {
  try {
    const cuentas = await cuentaBancariaModel.listarPorBanco(req.params.idBanco);
    res.json({ message: 'Cuentas obtenidas', data: cuentas });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo cuentas', error: error.message });
  }
});

// Editar cuenta bancaria
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { codigoCuenta, codigoAgencia, tipoCuenta, disponible } = req.body;
    if (!codigoCuenta || !codigoAgencia || !tipoCuenta) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const cuenta = await cuentaBancariaModel.editar(id, { codigoCuenta, codigoAgencia, tipoCuenta, disponible });
    res.json({ message: 'Cuenta editada', data: cuenta });
  } catch (error) {
    res.status(500).json({ message: 'Error editando cuenta', error: error.message });
  }
});

// Eliminar cuenta bancaria (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await cuentaBancariaModel.eliminar(id);
    res.json({ message: 'Cuenta eliminada', data: cuenta });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando cuenta', error: error.message });
  }
});

module.exports = router; 
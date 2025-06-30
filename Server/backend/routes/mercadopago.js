const express = require('express');
const mercadopago = require('mercadopago'); // SDK clásico
const router = express.Router();

// Importar modelos necesarios
const abonosModel = require('../models/abonos');
const clientesModel = require('../models/clientes');
const contratosModel = require('../models/contratos');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Función para obtener la cuenta bancaria de Mercado Pago
async function obtenerCuentaMercadoPago() {
  try {
    const pool = require('../db');
    const query = `
      SELECT cb."idCuenta"
      FROM "CuentaBancaria" cb
      JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE b."codigoBanco" = 'MP001' AND cb."activo" = true
      LIMIT 1
    `;
    const result = await pool.query(query);
    return result.rows[0]?.idCuenta;
  } catch (error) {
    console.error('Error obteniendo cuenta de Mercado Pago:', error);
    return null;
  }
}

// Función para procesar pago exitoso y registrar abono
async function procesarPagoExitoso(paymentData) {
  try {
    const { id, external_reference, transaction_amount, payer } = paymentData;
    
    console.log('Procesando pago exitoso:', {
      paymentId: id,
      externalReference: external_reference,
      amount: transaction_amount,
      payerEmail: payer?.email
    });

    // Extraer el email del pagador
    const payerEmail = payer?.email;
    
    // Buscar el cliente - priorizar por external_reference si está disponible
    let cliente = null;
    
    if (external_reference && external_reference.startsWith('lunchieware_')) {
      // Extraer el ID del cliente del external_reference
      const parts = external_reference.split('_');
      if (parts.length >= 3) {
        const clienteId = parts[1];
        try {
          cliente = await clientesModel.obtenerPorId(parseInt(clienteId));
          if (cliente) {
            console.log('Cliente encontrado por external_reference:', cliente.codigoCliente);
          }
        } catch (error) {
          console.log('Error buscando cliente por ID:', error.message);
        }
      }
    }
    
    // Si no se encontró por external_reference, intentar por email
    if (!cliente && payerEmail && !payerEmail.includes('invitado_') && !payerEmail.includes('test_user_')) {
      cliente = await clientesModel.obtenerPorEmail(payerEmail);
      if (cliente) {
        console.log('Cliente encontrado por email:', cliente.codigoCliente);
      }
    }
    
    // Si no se encuentra por email, usar lógica de fallback
    if (!cliente) {
      // Buscar un cliente disponible para procesar el pago
      const clientes = await clientesModel.obtenerTodos();
      if (clientes.length > 0) {
        // En un entorno real, aquí implementarías lógica para identificar
        // al cliente correcto basado en la sesión o cookies
        cliente = clientes[0]; // Usar el primer cliente disponible para pruebas
        console.log('Usando cliente disponible:', cliente.codigoCliente);
      } else {
        throw new Error('No hay clientes disponibles para procesar el pago');
      }
    }

    // Obtener el contrato activo del cliente
    const contratos = await contratosModel.obtenerPorCliente(cliente.idCliente);
    if (contratos.length === 0) {
      throw new Error(`No hay contratos activos para el cliente ${cliente.codigoCliente}`);
    }

    const contrato = contratos[0]; // Usar el contrato más reciente
    
    // Obtener la cuenta bancaria de Mercado Pago
    const idCuentaMP = await obtenerCuentaMercadoPago();
    if (!idCuentaMP) {
      throw new Error('No se encontró la cuenta bancaria de Mercado Pago');
    }
    
    // Crear el abono
    const datosAbono = {
      idContrato: contrato.idContrato,
      fechaAbono: new Date(),
      idCuenta: idCuentaMP, // Usar la cuenta bancaria de Mercado Pago
      numRecibo: `MP-${id}`, // Usar el ID de Mercado Pago como número de recibo
      importeAbono: transaction_amount,
      registroManual: false, // Es un registro automático
      activo: true
    };

    const abonoCreado = await abonosModel.crear(datosAbono);
    
    console.log('Abono registrado exitosamente:', {
      idAbono: abonoCreado.idAbono,
      contrato: contrato.codigoContrato,
      cliente: cliente.codigoCliente,
      monto: transaction_amount,
      fecha: abonoCreado.fechaAbono
    });

    // Actualizar el saldo del contrato
    await contratosModel.actualizarSaldoDespuesAbono(contrato.idContrato, transaction_amount);

    return abonoCreado;

  } catch (error) {
    console.error('Error procesando pago exitoso:', error);
    throw error;
  }
}

// Ruta de prueba para verificar configuración
router.get('/test', async (req, res) => {
  try {
    const response = await mercadopago.payment.search();
    res.json({
      message: 'Configuración de Mercado Pago exitosa',
      environment: process.env.MERCADOPAGO_ENVIRONMENT,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
      timestamp: new Date().toISOString(),
      results: response.body.results ? response.body.results.length : 0
    });
  } catch (error) {
    console.error('Error en prueba de Mercado Pago:', error);
    res.status(500).json({
      message: 'Error en la configuración de Mercado Pago',
      error: error.message
    });
  }
});

// Crear preferencia de pago (Checkout)
router.post('/create-preference', async (req, res) => {
  try {
    let { amount, description, payer_email, cliente_id } = req.body;
    if (!amount || !payer_email) {
      return res.status(400).json({ message: 'amount y payer_email son requeridos' });
    }
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'El monto debe ser un número positivo' });
    }
    description = description || 'Recarga de saldo Lunchieware';
    
    // Usar URL del frontend si está disponible, si no usar host local
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Crear external_reference con ID del cliente si está disponible
    const externalRef = cliente_id ? 
      `lunchieware_${cliente_id}_${Date.now()}` : 
      `lunchieware_${Date.now()}`;

    // Configuración mínima para evitar login forzado
    const preferenceData = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount
        }
      ],
      back_urls: {
        success: `${baseUrl}/payment-success`,
        failure: `${baseUrl}/payment-failure`,
        pending: `${baseUrl}/payment-pending`
      },
      external_reference: externalRef,
      // Incluir notification_url solo en producción
      ...(process.env.VERCEL_URL ? { 
        notification_url: `${process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : 'https://' + process.env.VERCEL_URL}/api/mercadopago/webhook`
      } : {})
    };

    console.log('Preference enviada a Mercado Pago (modo invitado):', JSON.stringify(preferenceData, null, 2));

    // Usa el método clásico del SDK
    const result = await mercadopago.preferences.create(preferenceData);

    res.json({
      message: 'Preferencia creada exitosamente',
      data: {
        preferenceId: result.body.id,
        initPoint: result.body.init_point,
        sandboxInitPoint: result.body.sandbox_init_point,
        externalReference: result.body.external_reference
      }
    });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    res.status(500).json({ message: 'Error creando preferencia', error: error.message });
  }
});

// Crear preferencia de pago (Alternativo - Checkout API)
router.post('/create-preference-api', async (req, res) => {
  try {
    let { amount, description, payer_email, cliente_id } = req.body;
    if (!amount || !payer_email) {
      return res.status(400).json({ message: 'amount y payer_email son requeridos' });
    }
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'El monto debe ser un número positivo' });
    }
    description = description || 'Recarga de saldo Lunchieware';
    
    // Usar URL de producción si está disponible, si no usar host local
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NGROK_URL || `${req.protocol}://${req.get('host')}`);

    // Crear external_reference con ID del cliente si está disponible
    const externalRef = cliente_id ? 
      `lunchieware_${cliente_id}_${Date.now()}` : 
      `lunchieware_${Date.now()}`;

    // Configuración mínima para Checkout API
    const preferenceData = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount
        }
      ],
      back_urls: {
        success: `${baseUrl}/payment-success`,
        failure: `${baseUrl}/payment-failure`,
        pending: `${baseUrl}/payment-pending`
      },
      external_reference: externalRef
    };

    console.log('Preference API enviada a Mercado Pago (modo invitado):', JSON.stringify(preferenceData, null, 2));

    // Usa el método clásico del SDK
    const result = await mercadopago.preferences.create(preferenceData);

    res.json({
      message: 'Preferencia API creada exitosamente',
      data: {
        preferenceId: result.body.id,
        initPoint: result.body.init_point,
        sandboxInitPoint: result.body.sandbox_init_point,
        externalReference: result.body.external_reference
      }
    });
  } catch (error) {
    console.error('Error creando preferencia API:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    res.status(500).json({ message: 'Error creando preferencia API', error: error.message });
  }
});

// Webhook para recibir notificaciones
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Webhook recibido de Mercado Pago:', {
      type,
      data,
      timestamp: new Date().toISOString()
    });

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener información del pago
      const payment = await mercadopago.payment.findById(paymentId);
      
      console.log('Información del pago:', {
        id: payment.body.id,
        status: payment.body.status,
        external_reference: payment.body.external_reference,
        amount: payment.body.transaction_amount
      });

      // Aquí procesarías el pago según su estado
      switch (payment.body.status) {
        case 'approved':
          console.log(`Pago aprobado: ${paymentId}`);
          await procesarPagoExitoso(payment.body);
          break;
        case 'rejected':
          console.log(`Pago rechazado: ${paymentId}`);
          // await procesarPagoRechazado(payment.body);
          break;
        case 'pending':
          console.log(`Pago pendiente: ${paymentId}`);
          // await procesarPagoPendiente(payment.body);
          break;
        default:
          console.log(`Estado desconocido: ${payment.body.status}`);
      }
    }

    res.status(200).json({ message: 'Webhook recibido correctamente' });

  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({
      message: 'Error procesando webhook',
      error: error.message
    });
  }
});

// Obtener información de un pago
router.get('/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await mercadopago.payment.findById(id);
    
    res.json({
      message: 'Información del pago obtenida',
      data: {
        id: payment.body.id,
        status: payment.body.status,
        external_reference: payment.body.external_reference,
        amount: payment.body.transaction_amount,
        currency: payment.body.currency_id,
        payment_method: payment.body.payment_method_id,
        created: payment.body.date_created,
        updated: payment.body.date_last_updated
      }
    });

  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router; 
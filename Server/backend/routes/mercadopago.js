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
    // Buscar banco con siglas 'MP' y una sola cuenta activa
    const bancoQuery = `SELECT "idBanco" FROM "Banco" WHERE "siglas" = 'MP' AND "activo" = true LIMIT 1`;
    const bancoResult = await pool.query(bancoQuery);
    if (!bancoResult.rows.length) {
      throw new Error('No existe un banco activo con siglas "MP"');
    }
    const idBanco = bancoResult.rows[0].idBanco;
    const cuentaQuery = `SELECT "idCuenta" FROM "CuentaBancaria" WHERE "idBanco" = $1 AND "activo" = true`;
    const cuentaResult = await pool.query(cuentaQuery, [idBanco]);
    if (cuentaResult.rows.length !== 1) {
      throw new Error('Debe existir exactamente una cuenta activa para el banco Mercado Pago (siglas MP)');
    }
    return cuentaResult.rows[0].idCuenta;
  } catch (error) {
    console.error('Error obteniendo cuenta de Mercado Pago:', error);
    return null;
  }
}

// Función para procesar pago exitoso y registrar abono
async function procesarPagoExitoso(paymentData) {
  try {
    console.log('🟦 [ProcesarPago] Iniciando procesamiento:', paymentData);
    const { id, external_reference, transaction_amount, payer } = paymentData;
    
    console.log('🟦 [ProcesarPago] Iniciando procesamiento:', {
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
      console.log('🟦 [ProcesarPago] Buscando cliente por external_reference:', external_reference);
      // Extraer el ID del cliente del external_reference
      const parts = external_reference.split('_');
      if (parts.length >= 3) {
        const clienteId = parts[1];
        console.log('🟦 [ProcesarPago] ID del cliente extraído:', clienteId);
        try {
          cliente = await clientesModel.obtenerPorId(parseInt(clienteId));
          if (cliente) {
            console.log('🟢 [ProcesarPago] Cliente encontrado por external_reference:', cliente.codigoCliente);
          } else {
            console.log('🟡 [ProcesarPago] No se encontró cliente con ID:', clienteId);
          }
        } catch (error) {
          console.log('🔴 [ProcesarPago] Error buscando cliente por ID:', error.message);
        }
      }
    }
    
    // Si no se encontró por external_reference, intentar por email
    if (!cliente && payerEmail && !payerEmail.includes('invitado_') && !payerEmail.includes('test_user_')) {
      console.log('🟦 [ProcesarPago] Buscando cliente por email:', payerEmail);
      try {
        cliente = await clientesModel.obtenerPorEmail(payerEmail);
        if (cliente) {
          console.log('🟢 [ProcesarPago] Cliente encontrado por email:', cliente.codigoCliente);
        } else {
          console.log('🟡 [ProcesarPago] No se encontró cliente con email:', payerEmail);
        }
      } catch (error) {
        console.log('🔴 [ProcesarPago] Error buscando cliente por email:', error.message);
      }
    }
    
    // Si no se encuentra por email, usar lógica de fallback
    if (!cliente) {
      console.log('🟦 [ProcesarPago] Usando lógica de fallback para encontrar cliente');
      // Buscar un cliente disponible para procesar el pago
      try {
        const clientes = await clientesModel.obtenerTodos();
        console.log('🟦 [ProcesarPago] Total de clientes disponibles:', clientes.length);
        if (clientes.length > 0) {
          // En un entorno real, aquí implementarías lógica para identificar
          // al cliente correcto basado en la sesión o cookies
          cliente = clientes[0]; // Usar el primer cliente disponible para pruebas
          console.log('🟢 [ProcesarPago] Usando cliente disponible:', cliente.codigoCliente);
        } else {
          throw new Error('No hay clientes disponibles para procesar el pago');
        }
      } catch (error) {
        console.log('🔴 [ProcesarPago] Error obteniendo todos los clientes:', error.message);
        throw error;
      }
    }

    console.log('🟦 [ProcesarPago] Buscando contratos del cliente:', cliente.idCliente);
    // Obtener el contrato activo del cliente
    try {
      const contratos = await contratosModel.obtenerPorCliente(cliente.idCliente);
      console.log('🟦 [ProcesarPago] Contratos encontrados:', contratos.length);
      if (contratos.length === 0) {
        throw new Error(`No hay contratos activos para el cliente ${cliente.codigoCliente}`);
      }

      const contrato = contratos[0]; // Usar el contrato más reciente
      console.log('🟢 [ProcesarPago] Usando contrato:', contrato.codigoContrato);
      
      console.log('🟦 [ProcesarPago] Buscando cuenta bancaria de Mercado Pago');
      // Obtener la cuenta bancaria de Mercado Pago
      const idCuentaMP = await obtenerCuentaMercadoPago();
      if (!idCuentaMP) {
        throw new Error('No se encontró la cuenta bancaria de Mercado Pago');
      }
      console.log('🟢 [ProcesarPago] Cuenta bancaria encontrada:', idCuentaMP);
      
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

      console.log('🟦 [ProcesarPago] Creando abono con datos:', datosAbono);
      const abonoCreado = await abonosModel.crear(datosAbono);
      
      console.log('🟢 [ProcesarPago] Abono registrado exitosamente:', {
        idAbono: abonoCreado.idAbono,
        contrato: contrato.codigoContrato,
        cliente: cliente.codigoCliente,
        monto: transaction_amount,
        fecha: abonoCreado.fechaAbono
      });

      console.log('🟦 [ProcesarPago] Actualizando saldo del contrato');
      // Actualizar el saldo del contrato
      await contratosModel.actualizarSaldoDespuesAbono(contrato.idContrato, transaction_amount);
      console.log('🟢 [ProcesarPago] Saldo del contrato actualizado');

      return abonoCreado;

    } catch (error) {
      console.log('🔴 [ProcesarPago] Error en procesamiento de contrato, cuenta o abono:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('🔴 [ProcesarPago] Error procesando pago exitoso:', error);
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

// Ruta de prueba para webhook
router.post('/test-webhook', async (req, res) => {
  try {
    console.log('🟦 [TestWebhook] Prueba de webhook recibida:', {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    // Simular un pago exitoso para pruebas
    const mockPaymentData = {
      id: 123456789,
      external_reference: 'lunchieware_1_' + Date.now(),
      transaction_amount: 10.00,
      payer: {
        email: 'test@example.com'
      },
      status: 'approved'
    };

    console.log('🟦 [TestWebhook] Procesando pago de prueba...');
    const resultado = await procesarPagoExitoso(mockPaymentData);
    
    console.log('🟢 [TestWebhook] Pago de prueba procesado exitosamente:', resultado);

    res.json({
      message: 'Webhook de prueba procesado exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('🔴 [TestWebhook] Error en webhook de prueba:', error);
    res.status(500).json({
      message: 'Error en webhook de prueba',
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
      ...(process.env.VERCEL_URL
        ? { notification_url: `${process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : 'https://' + process.env.VERCEL_URL}/api/mercadopago/webhook` }
        : process.env.NGROK_URL
          ? { notification_url: `${process.env.NGROK_URL.startsWith('http') ? process.env.NGROK_URL : 'https://' + process.env.NGROK_URL}/api/mercadopago/webhook` }
          : {})
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
      external_reference: externalRef,
      ...(process.env.VERCEL_URL
        ? { notification_url: `${process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : 'https://' + process.env.VERCEL_URL}/api/mercadopago/webhook` }
        : process.env.NGROK_URL
          ? { notification_url: `${process.env.NGROK_URL.startsWith('http') ? process.env.NGROK_URL : 'https://' + process.env.NGROK_URL}/api/mercadopago/webhook` }
          : {})
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
    console.log('🟦 [Webhook] Recibido de Mercado Pago:', {
      type: req.body.type,
      data: req.body.data,
      timestamp: new Date().toISOString(),
      body: req.body
    });

    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      console.log('🟦 [Webhook] Procesando pago con ID:', paymentId);
      try {
        const payment = await mercadopago.payment.findById(paymentId);
        console.log('🟢 [Webhook] Información del pago obtenida:', {
          id: payment.body.id,
          status: payment.body.status,
          external_reference: payment.body.external_reference,
          amount: payment.body.transaction_amount,
          payer: payment.body.payer
        });

        // Aquí procesarías el pago según su estado
        switch (payment.body.status) {
          case 'approved':
            console.log('🟢 [Webhook] Pago aprobado, procesando...');
            try {
              const resultado = await procesarPagoExitoso(payment.body);
              console.log('🟢 [Webhook] Pago procesado exitosamente:', resultado);
            } catch (error) {
              console.error('🔴 [Webhook] Error procesando pago aprobado:', error);
            }
            break;
          case 'rejected':
            console.log('🔴 [Webhook] Pago rechazado:', paymentId);
            break;
          case 'pending':
            console.log('🟡 [Webhook] Pago pendiente:', paymentId);
            break;
          default:
            console.log('🟡 [Webhook] Estado desconocido:', payment.body.status);
        }
      } catch (error) {
        console.error('🔴 [Webhook] Error obteniendo información del pago:', error);
      }
    } else {
      console.log('🟡 [Webhook] Tipo de notificación no manejado:', type);
    }

    res.status(200).json({ message: 'Webhook recibido correctamente' });

  } catch (error) {
    console.error('🔴 [Webhook] Error procesando webhook:', error);
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
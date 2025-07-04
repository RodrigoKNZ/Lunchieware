import mercadopago from 'mercadopago';
import abonosModel from '../../models/abonos.js';
import clientesModel from '../../models/clientes.js';
import contratosModel from '../../models/contratos.js';

// Configura Mercado Pago con la variable de entorno
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { type, data } = req.body;
    console.log('[Webhook Serverless] Recibido:', req.body);

    if (type === 'payment') {
      const paymentId = data.id;
      try {
        const payment = await mercadopago.payment.findById(paymentId);
        console.log('[Webhook Serverless] Información del pago:', payment.body);
        if (payment.body.status === 'approved') {
          // Procesar pago exitoso (lógica simplificada)
          const { external_reference, transaction_amount, payer } = payment.body;
          let cliente = null;
          if (external_reference && external_reference.startsWith('lunchieware_')) {
            const parts = external_reference.split('_');
            if (parts.length >= 3) {
              const clienteId = parts[1];
              cliente = await clientesModel.obtenerPorId(parseInt(clienteId));
            }
          }
          if (!cliente && payer?.email) {
            cliente = await clientesModel.obtenerPorEmail(payer.email);
          }
          if (!cliente) {
            const clientes = await clientesModel.obtenerTodos();
            cliente = clientes[0];
          }
          const contratos = await contratosModel.obtenerPorCliente(cliente.idCliente);
          const contrato = contratos[0];
          // ID de cuenta Mercado Pago (ajusta si es necesario)
          const idCuentaMP = 7;
          const datosAbono = {
            idContrato: contrato.idContrato,
            fechaAbono: new Date(),
            idCuenta: idCuentaMP,
            numRecibo: `MP-${paymentId}`,
            importeAbono: transaction_amount,
            registroManual: false,
            activo: true
          };
          const abonoCreado = await abonosModel.crear(datosAbono);
          await contratosModel.actualizarSaldoDespuesAbono(contrato.idContrato, transaction_amount);
          console.log('[Webhook Serverless] Abono registrado:', abonoCreado);
        }
      } catch (error) {
        console.error('[Webhook Serverless] Error procesando pago:', error);
      }
    }
    res.status(200).json({ message: 'Webhook recibido correctamente' });
  } catch (error) {
    console.error('[Webhook Serverless] Error general:', error);
    res.status(500).json({ message: 'Error procesando webhook', error: error.message });
  }
} 
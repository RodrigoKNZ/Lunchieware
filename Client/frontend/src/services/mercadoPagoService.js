import axios from 'axios';

// URL base que funciona tanto en desarrollo como en producción
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/mercadopago' 
  : 'http://localhost:5000/api/mercadopago';

const mercadoPagoService = {
  async crearPreferencia({ amount, description, payer_email, external_reference, cliente_id }) {
    const response = await axios.post(`${API_BASE_URL}/create-preference`, {
      amount,
      description,
      payer_email,
      external_reference,
      cliente_id
    });
    return response.data;
  },

  async crearPreferenciaAlternativa({ amount, description, payer_email, external_reference, cliente_id }) {
    const response = await axios.post(`${API_BASE_URL}/create-preference-api`, {
      amount,
      description,
      payer_email,
      external_reference,
      cliente_id
    });
    return response.data;
  },

  async consultarEstadoPago(paymentId) {
    const response = await axios.get(`${API_BASE_URL}/payment-status/${paymentId}`);
    return response.data;
  },

  // Función para hacer polling del estado del pago
  async pollPaymentStatus(paymentId, maxAttempts = 30, interval = 2000) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkStatus = async () => {
        try {
          attempts++;
          const result = await this.consultarEstadoPago(paymentId);
          
          // Si el pago está aprobado, rechazado o en proceso, detener polling
          if (['approved', 'rejected', 'cancelled'].includes(result.data.status)) {
            resolve(result);
            return;
          }
          
          // Si se agotaron los intentos, detener
          if (attempts >= maxAttempts) {
            resolve({
              message: 'Tiempo de espera agotado',
              data: { status: 'timeout', paymentId }
            });
            return;
          }
          
          // Continuar polling
          setTimeout(checkStatus, interval);
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  }
};

export default mercadoPagoService; 
import axios from 'axios';
import { API_URLS } from '../config/api';

const mercadoPagoService = {
    // Crear preferencia de pago
    crearPreferencia: async (datos) => {
        const response = await axios.post(`${API_URLS.mercadopago}/crear-preferencia`, datos);
        return response;
    },
    // Procesar webhook
    procesarWebhook: async (datos) => {
        const response = await axios.post(`${API_URLS.mercadopago}/webhook`, datos);
        return response;
    },
    // Obtener estado de pago
    obtenerEstadoPago: async (paymentId) => {
        const response = await axios.get(`${API_URLS.mercadopago}/estado/${paymentId}`);
        return response;
    }
};

export default mercadoPagoService; 
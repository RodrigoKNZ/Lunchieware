import React from 'react';

export default function PaymentPending() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <h2>Pago pendiente ⏳</h2>
      <p>Tu pago está siendo procesado.<br />Te notificaremos cuando se confirme.</p>
      <a href="/mi-cuenta">Ir a Mi Cuenta</a>
    </div>
  );
} 
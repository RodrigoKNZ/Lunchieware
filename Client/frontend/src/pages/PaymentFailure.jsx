import React from 'react';

export default function PaymentFailure() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', minWidth: '100vw', textAlign: 'center' }}>
      <h2>Pago fallido 😢</h2>
      <p>Ocurrió un problema al procesar tu pago.<br />Por favor, intenta nuevamente o usa otro método de pago.</p>
      <a href="/mi-cuenta">Volver a Mi Cuenta</a>
    </div>
  );
} 
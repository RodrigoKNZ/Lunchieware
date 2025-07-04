import React, { useEffect } from 'react';

export default function PaymentSuccess() {
  useEffect(() => {
    // Opcional: aquí podrías llamar a un servicio para refrescar datos del usuario
    // o simplemente redirigir automáticamente a /mi-cuenta después de unos segundos
    const timer = setTimeout(() => {
      window.location.href = '/mi-cuenta';
    }, 3500); // 3.5 segundos
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', minWidth: '100vw', textAlign: 'center' }}>
      <h2>¡Pago realizado con éxito! 🎉</h2>
      <p>Tu recarga fue procesada correctamente.<br />En unos segundos serás redirigido a tu cuenta para ver el saldo actualizado.</p>
      <a href="/mi-cuenta">Ir a Mi Cuenta ahora</a>
    </div>
  );
} 
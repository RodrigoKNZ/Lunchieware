# Lunchieware

## Exponer el backend con ngrok (para pruebas de Mercado Pago)

1. Asegúrate de que tu backend esté corriendo en el puerto 5000 (por defecto).
2. En una terminal, ejecuta:

```bash
ngrok http 5000
```

Esto generará una URL pública (por ejemplo, `https://xxxxxx.ngrok-free.app`) que puedes usar en los back_urls de Mercado Pago y para pruebas externas.

Recuerda actualizar la variable de entorno `NGROK_URL` en tu archivo `.env` del backend con la URL pública generada por ngrok. 
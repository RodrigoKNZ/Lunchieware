# 🚀 Desarrollo Local - Lunchieware

Este documento explica cómo configurar y usar el entorno de desarrollo local que simula el entorno de producción, evitando consumir deployments de Vercel.

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- npm o yarn
- Git

## 🔧 Configuración Inicial

### 1. Instalar dependencias

```bash
npm run install-deps
```

### 2. Configurar certificados SSL locales

```bash
npm run setup:ssl
```

Este comando:
- Instala `mkcert` globalmente si no está disponible
- Genera certificados SSL válidos para `localhost`
- Los certificados se guardan en la carpeta `ssl/`

## 🎯 Modos de Desarrollo

### Modo Desarrollo Normal
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Sin HTTPS

### Modo Simulación de Producción (Recomendado)
```bash
npm run dev:prod-sim
```
- Frontend: https://localhost:5173
- Backend: https://localhost:5000
- Con HTTPS (necesario para webhooks de Mercado Pago)

### Modo con Proxy Local
```bash
# Terminal 1: Iniciar proxy
npm run start:proxy

# Terminal 2: Iniciar servicios
npm run dev
```
- Proxy: http://localhost:3000 (HTTP) / https://localhost:3001 (HTTPS)
- Simula el comportamiento de Vercel

## 🔐 Configuración de HTTPS

### Para Webhooks de Mercado Pago

Los webhooks de Mercado Pago requieren HTTPS. Para probarlos localmente:

1. **Usar modo producción simulado:**
   ```bash
   npm run dev:prod-sim
   ```

2. **Configurar webhook en Mercado Pago:**
   - URL: `https://localhost:5000/api/mercadopago/webhook`
   - Método: POST

3. **Usar ngrok para exposición pública (opcional):**
   ```bash
   # Instalar ngrok
   npm install -g ngrok

   # Exponer el puerto 5000
   ngrok http 5000
   ```
   - Usar la URL HTTPS de ngrok para el webhook

## 🌐 URLs de Acceso

### Desarrollo Normal
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/test

### Simulación de Producción
- **Frontend:** https://localhost:5173
- **Backend API:** https://localhost:5000/api
- **Health Check:** https://localhost:5000/api/test

### Con Proxy Local
- **Proxy HTTP:** http://localhost:3000
- **Proxy HTTPS:** https://localhost:3001
- **API a través del proxy:** http://localhost:3000/api

## 🔍 Troubleshooting

### Error de certificados SSL
```bash
# Regenerar certificados
npm run setup:ssl
```

### Puerto ocupado
```bash
# Verificar procesos en puertos
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Terminar proceso específico (Windows)
taskkill /PID <PID> /F
```

### CORS errors
- Verificar que las URLs estén en la configuración de CORS del backend
- Asegurar que el frontend use la URL correcta del backend

### Webhook no funciona
1. Verificar que el backend esté en HTTPS
2. Confirmar que la URL del webhook sea accesible
3. Revisar logs del backend para errores
4. Usar ngrok para exposición pública si es necesario

## 📝 Variables de Entorno

### Backend (.env.local)
```env
NODE_ENV=production-sim
PORT=5000
DATABASE_URL=tu_url_de_base_de_datos
JWT_SECRET=tu_jwt_secret
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
```

### Frontend (.env.production-sim)
```env
VITE_API_BASE_URL=https://localhost:5000/api
VITE_APP_ENV=production-sim
VITE_APP_URL=https://localhost:5173
```

## 🎯 Flujo de Trabajo Recomendado

1. **Desarrollo diario:**
   ```bash
   npm run dev:prod-sim
   ```

2. **Pruebas de webhooks:**
   - Usar ngrok para exposición pública
   - Configurar webhook en Mercado Pago con URL de ngrok

3. **Deployment a Vercel:**
   - Solo cuando estés seguro de que todo funciona
   - Usar `git push` para trigger automático

## 🔗 Enlaces Útiles

- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Express](https://expressjs.com/)
- [mkcert - Certificados SSL locales](https://github.com/FiloSottile/mkcert)
- [ngrok - Tunneling local](https://ngrok.com/)
- [Mercado Pago Webhooks](https://www.mercadopago.com.ar/developers/es/docs/notifications/webhooks) 
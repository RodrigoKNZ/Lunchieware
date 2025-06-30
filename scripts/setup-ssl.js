const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Configurando certificados SSL locales...');

const sslDir = path.join(__dirname, '..', 'ssl');

// Crear directorio SSL si no existe
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('📁 Directorio SSL creado');
}

try {
  // Verificar si mkcert está instalado
  execSync('mkcert --version', { stdio: 'pipe' });
  console.log('✅ mkcert encontrado');
} catch (error) {
  console.log('❌ mkcert no encontrado. Instalando...');
  try {
    execSync('npm install -g mkcert', { stdio: 'inherit' });
    console.log('✅ mkcert instalado globalmente');
  } catch (installError) {
    console.error('❌ Error instalando mkcert:', installError.message);
    console.log('💡 Alternativa: Instala mkcert manualmente desde https://github.com/FiloSottile/mkcert');
    process.exit(1);
  }
}

try {
  // Generar certificados
  console.log('🔑 Generando certificados SSL...');
  execSync(`mkcert install`, { stdio: 'inherit' });
  execSync(`mkcert -key-file ${path.join(sslDir, 'localhost-key.pem')} -cert-file ${path.join(sslDir, 'localhost.pem')} localhost 127.0.0.1 ::1`, { 
    stdio: 'inherit',
    cwd: sslDir 
  });
  
  console.log('✅ Certificados SSL generados exitosamente');
  console.log('📁 Ubicación de los certificados:', sslDir);
  console.log('🔗 Ahora puedes usar HTTPS localmente');
  
} catch (error) {
  console.error('❌ Error generando certificados:', error.message);
  process.exit(1);
} 
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

function tryModernMkcert() {
  try {
    execSync('mkcert -install', { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️  No se pudo instalar la CA, continuando...');
  }
  try {
    execSync(`mkcert -key-file ${path.join(sslDir, 'localhost-key.pem')} -cert-file ${path.join(sslDir, 'localhost.pem')} localhost 127.0.0.1 ::1`, {
      stdio: 'inherit',
      cwd: sslDir
    });
    return true;
  } catch (e) {
    return false;
  }
}

function tryClassicMkcert() {
  try {
    execSync('mkcert -install', { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️  No se pudo instalar la CA, continuando...');
  }
  try {
    execSync('mkcert localhost 127.0.0.1 ::1', { stdio: 'inherit', cwd: sslDir });
    // Buscar archivos generados
    const files = fs.readdirSync(sslDir);
    const certFile = files.find(f => f.match(/^localhost.*\.pem$/) && !f.includes('key'));
    const keyFile = files.find(f => f.match(/^localhost.*-key\.pem$/));
    if (certFile && keyFile) {
      fs.renameSync(path.join(sslDir, certFile), path.join(sslDir, 'localhost.pem'));
      fs.renameSync(path.join(sslDir, keyFile), path.join(sslDir, 'localhost-key.pem'));
      return true;
    } else {
      throw new Error('No se encontraron los archivos generados por mkcert');
    }
  } catch (e) {
    return false;
  }
}

console.log('🔑 Generando certificados SSL...');
let ok = tryModernMkcert();
if (!ok) {
  console.log('🔄 Intentando método clásico de mkcert...');
  ok = tryClassicMkcert();
}

if (ok) {
  console.log('✅ Certificados SSL generados exitosamente');
  console.log('📁 Ubicación de los certificados:', sslDir);
  console.log('🔗 Ahora puedes usar HTTPS localmente');
} else {
  console.error('❌ Error generando certificados SSL. Por favor, revisa la instalación de mkcert.');
  process.exit(1);
} 
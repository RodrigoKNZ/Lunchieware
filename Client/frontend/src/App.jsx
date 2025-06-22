import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import ClientHome from './pages/ClientHome';
import MenuProgramacion from './pages/MenuProgramacion';
import Quejas from './pages/Quejas';
import Sugerencias from './pages/Sugerencias';
import MiCuenta from './pages/MiCuenta';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/AdminHome';
import AdminVenta from './pages/AdminVenta';
import AdminProductos from './pages/AdminProductos';
import AdminCuentasBancarias from './pages/AdminCuentasBancarias';
import AdminCajaChica from './pages/AdminCajaChica';
import AdminCajaChicaDetalle from './pages/AdminCajaChicaDetalle';
import AdminMenuProgramacion from './pages/AdminMenuProgramacion';

function App() {
  const [user, setUser] = useState(null);

  // Función para manejar el login exitoso
  const handleLogin = (usuario) => {
    // Acceso según tipo de usuario
    if (usuario === 'cliente') {
      setUser({ tipo: 'cliente', usuario });
    } else if (usuario === 'admin') {
      setUser({ tipo: 'admin', usuario });
    } else {
      setUser({ tipo: 'otro', usuario });
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.tipo === 'admin') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="venta" element={<AdminVenta />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="cuentas-bancarias" element={<AdminCuentasBancarias />} />
            <Route path="caja-chica" element={<AdminCajaChica />} />
            <Route path="caja-chica/:id" element={<AdminCajaChicaDetalle />} />
            <Route path="programacion-menu" element={<AdminMenuProgramacion />} />
            {/* Aquí se agregarán las demás rutas del admin */}
          </Route>
          {/* Redirigir cualquier otra ruta a /admin */}
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (user.tipo === 'cliente') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Navigate to="/inicio" />} />
            <Route path="/inicio" element={<ClientHome />} />
            <Route path="/programacion-menu" element={<MenuProgramacion />} />
            <Route path="/quejas" element={<Quejas />} />
            <Route path="/sugerencias" element={<Sugerencias />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  // Si el usuario es de otro tipo, podrías mostrar otra vista o mensaje
  return <Login onLogin={handleLogin} />;
}

export default App;

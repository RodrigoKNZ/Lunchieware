import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { API_URLS } from './config/api';
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
import AdminQuejasSugerencias from './pages/AdminQuejasSugerencias';
import AdminClientes from './pages/AdminClientes';
import AdminClienteDetalle from './pages/AdminClienteDetalle';
import AdminContratoDetalle from './pages/AdminContratoDetalle';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import AdminCrearUsuario from './pages/AdminCrearUsuario';
import AdminReportes from './pages/AdminReportes';

function App() {
  const [user, setUser] = useState(() => {
    // Cargar usuario desde localStorage al iniciar
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loadingUser, setLoadingUser] = useState(false);

  // Intentar restaurar sesión desde cookie al montar
  useEffect(() => {
    if (!user) {
      setLoadingUser(true);
      fetch(`${API_URLS.auth}/me`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.usuario) {
            setUser(data.usuario);
            localStorage.setItem('user', JSON.stringify(data.usuario));
          }
        })
        .finally(() => setLoadingUser(false));
    }
  }, []);

  // Función para manejar el login exitoso
  const handleLogin = (usuario) => {
    console.log('Usuario logueado:', usuario); // Para debugging
    setUser(usuario);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    fetch(`${API_URLS.auth}/logout`, { method: 'POST', credentials: 'include' })
      .finally(() => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/'; // Redirigir al login tras logout
      });
  };

  if (!user || loadingUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.rol === 'admin') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<AdminHome />} />
            <Route path="venta" element={<AdminVenta />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="clientes/:id" element={<AdminClienteDetalle />} />
            <Route path="clientes/:id/contrato/:contratoId" element={<AdminContratoDetalle />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="cuentas-bancarias" element={<AdminCuentasBancarias />} />
            <Route path="caja-chica" element={<AdminCajaChica />} />
            <Route path="caja-chica/:id" element={<AdminCajaChicaDetalle />} />
            <Route path="programacion-menu" element={<AdminMenuProgramacion />} />
            <Route path="quejas-sugerencias" element={<AdminQuejasSugerencias />} />
            <Route path="usuarios/crear" element={<AdminCrearUsuario />} />
            <Route path="reportes" element={<AdminReportes />} />
            {/* Aquí se agregarán las demás rutas del admin */}
          </Route>
          {/* Redirigir cualquier otra ruta a /admin */}
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (user.rol === 'admin_caja') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<AdminHome />} />
            <Route path="venta" element={<AdminVenta />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="clientes/:id" element={<AdminClienteDetalle />} />
            <Route path="clientes/:id/contrato/:contratoId" element={<AdminContratoDetalle />} />
            <Route path="caja-chica" element={<AdminCajaChica />} />
            <Route path="caja-chica/:id" element={<AdminCajaChicaDetalle />} />
            <Route path="programacion-menu" element={<AdminMenuProgramacion />} />
            <Route path="quejas-sugerencias" element={<AdminQuejasSugerencias />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (user.rol === 'cliente') {
    return (
      <BrowserRouter>
        <Routes>
          {/* Rutas de Mercado Pago fuera del layout principal */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/payment-pending" element={<PaymentPending />} />
          <Route path="/" element={<ClientLayout onLogout={handleLogout} />}>
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

  // Si el usuario tiene un rol no reconocido, mostrar login nuevamente
  console.log('Rol no reconocido:', user.rol);
  return <Login onLogin={handleLogin} />;
}

export default App;

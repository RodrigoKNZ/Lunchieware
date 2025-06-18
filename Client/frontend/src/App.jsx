import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import ClientHome from './pages/ClientHome';
import MenuProgramacion from './pages/MenuProgramacion';
import Quejas from './pages/Quejas';
import Sugerencias from './pages/Sugerencias';
import MiCuenta from './pages/MiCuenta';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  // Función para manejar el login exitoso
  const handleLogin = (usuario) => {
    // Solo permitimos acceso a la vista cliente si el usuario es "cliente"
    if (usuario === 'cliente') {
      setUser({ tipo: 'cliente', usuario });
    } else {
      // Aquí podrías manejar otros tipos de usuario en el futuro
      setUser({ tipo: 'otro', usuario });
    }
  };

  if (!user || user.tipo !== 'cliente') {
    return <Login onLogin={handleLogin} />;
  }

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

export default App;

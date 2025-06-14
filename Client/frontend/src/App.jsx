import { useState } from 'react';
import ClientLayout from './layouts/ClientLayout';
import ClientHome from './pages/ClientHome';
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
    <ClientLayout>
      <ClientHome />
    </ClientLayout>
  );
}

export default App;

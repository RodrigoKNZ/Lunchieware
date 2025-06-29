import { Box, Button, TextField, Typography, Paper, Avatar, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState, useRef } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userToChange, setUserToChange] = useState(null);
  const newPasswordRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false); // Limpiar errores previos
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        nombreUsuario: usuario,
        password: password
      });
      const userData = res.data.usuario;
      console.log('Respuesta del login:', res.data); // Para debugging
      
      // Guardar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Si requiere cambio de contraseña, mostrar modal
      if (userData.accesoRealizado === false) {
        setUserToChange(userData);
        setShowChangePassword(true);
        setNewPassword("");
        setConfirmPassword("");
        setChangePasswordError("");
        setLoading(false);
        setTimeout(() => newPasswordRef.current && newPasswordRef.current.focus(), 200);
        return;
      }
      if (onLogin) onLogin(userData);
    } catch (err) {
      console.error('Error en login:', err); // Para debugging
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setChangePasswordError("");
    if (!newPassword || !confirmPassword) {
      setChangePasswordError("Debes ingresar y confirmar la nueva contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Las contraseñas no coinciden.");
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/cambiar-password', {
        idUsuario: userToChange.id,
        nuevaPassword: newPassword
      });
      // Cerrar modal y continuar login
      setShowChangePassword(false);
      setUserToChange(null);
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordError("");
      // Volver a hacer login automáticamente con la nueva contraseña
      setPassword(newPassword);
      setTimeout(async () => {
        setLoading(true);
        setError(false);
        try {
          const res = await axios.post('http://localhost:5000/api/auth/login', {
            nombreUsuario: usuario,
            password: newPassword
          });
          const userData = res.data.usuario;
          localStorage.setItem('user', JSON.stringify(userData));
          if (onLogin) onLogin(userData);
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (err) {
      setChangePasswordError("Error al cambiar la contraseña. Intenta nuevamente.");
    }
  };

  const handleClose = () => setError(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/bg-login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: isMobile ? 3 : 6,
          borderRadius: 4,
          width: isMobile ? '90%' : 400,
          maxWidth: '95vw',
          minWidth: isMobile ? 'unset' : 350,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'white', boxShadow: 1 }}>
            <img src="/LogoLunchieware.png" alt="Logo Lunchieware" style={{ width: 56, height: 56 }} />
          </Avatar>
        </Box>
        <Typography variant="h5" align="center" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            variant="outlined"
            fullWidth
            margin="normal"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            autoFocus
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontWeight: 'bold' }}
            disabled={loading}
          >
            INGRESAR
          </Button>
        </Box>
      </Paper>
      {/* Modal de error */}
      <Dialog
        open={error}
        onClose={handleClose}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 320 } }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'error.main' }}>
          Error de acceso
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Las credenciales de acceso ingresadas son incorrectas o no existen.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={handleClose} variant="contained" color="primary" autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de cambio de contraseña obligatorio */}
      <Dialog
        open={showChangePassword}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 340 } }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        }}
        disableEscapeKeyDown
        disableBackdropClick
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
          Cambia tu contraseña
        </DialogTitle>
        <DialogContent>
          <Typography align="center" sx={{ mb: 2 }}>
            Es necesario que cambies tu contraseña antes de continuar.
          </Typography>
          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            inputRef={newPasswordRef}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {changePasswordError && (
            <Typography color="error" sx={{ mt: 1, fontSize: 14 }} align="center">
              {changePasswordError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={handleChangePassword} variant="contained" color="primary">
            Guardar nueva contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 
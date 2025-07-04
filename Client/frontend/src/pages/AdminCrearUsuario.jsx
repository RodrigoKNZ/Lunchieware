import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Breadcrumbs } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { Link as RouterLink } from 'react-router-dom';
import api from '../config/api';

function generarPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

export default function AdminCrearUsuario() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordGenerada, setPasswordGenerada] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const password = generarPassword();
    try {
      await api.post('/usuarios', { nombreUsuario, password, rol: 'admin_caja' });
      setPasswordGenerada(password);
      setModalOpen(true);
      setNombreUsuario('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Breadcrumb y header como en productos */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <RouterLink to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}><HomeIcon sx={{ mr: 0.5, fontSize: 20, mb: '-3px' }} /></RouterLink>
        <Typography color="text.primary">Crear administrador de caja</Typography>
      </Breadcrumbs>
      <Typography variant="h4" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 32, mb: '-4px' }} /> Crear administrador de caja
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Paper sx={{ p: 4, minWidth: 350 }} elevation={2}>
          <form onSubmit={handleSubmit}>
            <TextField label="Usuario" value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} fullWidth required sx={{ mb: 3 }} autoFocus />
            <TextField label="Rol" value="Administrador de caja" fullWidth disabled sx={{ mb: 3 }} />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={!nombreUsuario || loading}>Crear usuario</Button>
          </form>
        </Paper>
      </Box>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Usuario creado</DialogTitle>
        <DialogContent>
          <Typography>La contraseña generada para el nuevo administrador de caja es:</Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: 20, fontWeight: 600, textAlign: 'center', letterSpacing: 1 }}>{passwordGenerada}</Box>
          <Alert severity="info">Por favor, copia y guarda esta contraseña. Será necesaria para el primer ingreso al sistema y deberá ser cambiada por el usuario.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} variant="contained">Entendido</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
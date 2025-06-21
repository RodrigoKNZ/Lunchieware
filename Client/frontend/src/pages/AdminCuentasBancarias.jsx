import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
  Radio,
  Breadcrumbs
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Link as RouterLink } from 'react-router-dom';

// Datos de prueba para bancos
const banks = [
  { id: 1, code: '0002', name: 'Banco de Crédito del Perú', acronym: 'BCP', status: 'Disponible' },
  { id: 2, code: '0003', name: 'Interbank', acronym: 'IBK', status: 'Disponible' },
  { id: 3, code: '0004', name: 'Scotiabank', acronym: 'SBP', status: 'No Disponible' },
  { id: 4, code: '0005', name: 'BBVA', acronym: 'BBVA', status: 'Disponible' },
  { id: 5, code: '0006', name: 'Banco de la Nación', acronym: 'BN', status: 'Disponible' },
];

// Datos de prueba para cuentas
const accountsData = {
  1: [
    { id: 1, accountCode: '539-2453972-0-47', agencyCode: '196', type: 'Cuenta de recaudación', bank: 'Banco de Crédito del Perú', status: 'Disponible' },
    { id: 2, accountCode: '539-2453972-0-48', agencyCode: '196', type: 'Cuenta corriente', bank: 'Banco de Crédito del Perú', status: 'Disponible' },
    { id: 3, accountCode: '539-2453972-0-49', agencyCode: '196', type: 'Aplicativo', bank: 'Banco de Crédito del Perú', status: 'No Disponible' },
  ],
  2: [
    { id: 4, accountCode: '123-4567890-1-23', agencyCode: '050', type: 'Cuenta de ahorros', bank: 'Interbank', status: 'Disponible' },
  ],
  // Add more accounts for other banks if needed
};

const AdminCuentasBancarias = () => {
  // Estados para bancos
  const [selectedBank, setSelectedBank] = useState(null);
  const [filtroCodigoBanco, setFiltroCodigoBanco] = useState('');
  const [filtroNombreBanco, setFiltroNombreBanco] = useState('');
  const [filtroSiglasBanco, setFiltroSiglasBanco] = useState('');
  const [filtroDisponibilidadBanco, setFiltroDisponibilidadBanco] = useState('todos');
  const [bancos, setBancos] = useState(banks);
  const [bancosFiltrados, setBancosFiltrados] = useState(banks);
  
  // Estados para control de filtros bancos
  const [filtrosAplicadosBanco, setFiltrosAplicadosBanco] = useState(false);
  const filtrosInicialesBanco = {
    codigo: '',
    nombre: '',
    siglas: '',
    disponibilidad: 'todos',
  };
  const filtrosEnEstadoInicialBanco =
    filtroCodigoBanco === filtrosInicialesBanco.codigo &&
    filtroNombreBanco === filtrosInicialesBanco.nombre &&
    filtroSiglasBanco === filtrosInicialesBanco.siglas &&
    filtroDisponibilidadBanco === filtrosInicialesBanco.disponibilidad;

  // Modales bancos
  const [editarBancoOpen, setEditarBancoOpen] = useState(false);
  const [eliminarBancoOpen, setEliminarBancoOpen] = useState(false);
  const [nuevoBancoOpen, setNuevoBancoOpen] = useState(false);
  const [bancoSeleccionado, setBancoSeleccionado] = useState(null);
  const [editBancoNombre, setEditBancoNombre] = useState('');
  const [editBancoSiglas, setEditBancoSiglas] = useState('');
  const [editBancoEstado, setEditBancoEstado] = useState('Disponible');
  
  // Estados para nuevo banco
  const [nuevoBancoCodigo, setNuevoBancoCodigo] = useState('');
  const [nuevoBancoNombre, setNuevoBancoNombre] = useState('');
  const [nuevoBancoSiglas, setNuevoBancoSiglas] = useState('');
  const [nuevoBancoEstado, setNuevoBancoEstado] = useState('Disponible');

  // Estados para cuentas
  const [filtroCodigoCuenta, setFiltroCodigoCuenta] = useState('');
  const [filtroCodigoAgencia, setFiltroCodigoAgencia] = useState('');
  const [filtroTipoCuenta, setFiltroTipoCuenta] = useState('');
  const [filtroDisponibilidadCuenta, setFiltroDisponibilidadCuenta] = useState('todos');
  const [cuentasFiltradas, setCuentasFiltradas] = useState([]);
  
  // Estados para control de filtros cuentas
  const [filtrosAplicadosCuenta, setFiltrosAplicadosCuenta] = useState(false);
  const filtrosInicialesCuenta = {
    codigo: '',
    agencia: '',
    tipo: '',
    disponibilidad: 'todos',
  };
  const filtrosEnEstadoInicialCuenta =
    filtroCodigoCuenta === filtrosInicialesCuenta.codigo &&
    filtroCodigoAgencia === filtrosInicialesCuenta.agencia &&
    filtroTipoCuenta === filtrosInicialesCuenta.tipo &&
    filtroDisponibilidadCuenta === filtrosInicialesCuenta.disponibilidad;
  
  // Modales cuentas
  const [editarCuentaOpen, setEditarCuentaOpen] = useState(false);
  const [eliminarCuentaOpen, setEliminarCuentaOpen] = useState(false);
  const [nuevaCuentaOpen, setNuevaCuentaOpen] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [editCuentaTipo, setEditCuentaTipo] = useState('');
  const [editCuentaEstado, setEditCuentaEstado] = useState('Disponible');
  
  // Estados para nueva cuenta
  const [nuevaCuentaCodigo, setNuevaCuentaCodigo] = useState('');
  const [nuevaCuentaAgencia, setNuevaCuentaAgencia] = useState('');
  const [nuevaCuentaTipo, setNuevaCuentaTipo] = useState('');
  const [nuevaCuentaEstado, setNuevaCuentaEstado] = useState('Disponible');
  
  // Estados para editar cuenta
  const [editCuentaCodigo, setEditCuentaCodigo] = useState('');
  const [editCuentaAgencia, setEditCuentaAgencia] = useState('');

  const selectedBankData = bancos.find(b => b.id === selectedBank);

  // Filtrado bancos
  const handleAplicarFiltrosBanco = () => {
    let filtrados = bancos.filter(b => {
      const matchCodigo = !filtroCodigoBanco || b.code.toLowerCase().includes(filtroCodigoBanco.toLowerCase());
      const matchNombre = !filtroNombreBanco || b.name.toLowerCase().includes(filtroNombreBanco.toLowerCase());
      const matchSiglas = !filtroSiglasBanco || b.acronym.toLowerCase().includes(filtroSiglasBanco.toLowerCase());
      const matchDisponibilidad = filtroDisponibilidadBanco === 'todos' ||
        (filtroDisponibilidadBanco === 'disponible' ? b.status === 'Disponible' : b.status === 'No Disponible');
      return matchCodigo && matchNombre && matchSiglas && matchDisponibilidad;
    });
    setBancosFiltrados(filtrados);
    setFiltrosAplicadosBanco(true);
  };
  
  const handleLimpiarFiltrosBanco = () => {
    setFiltroCodigoBanco(filtrosInicialesBanco.codigo);
    setFiltroNombreBanco(filtrosInicialesBanco.nombre);
    setFiltroSiglasBanco(filtrosInicialesBanco.siglas);
    setFiltroDisponibilidadBanco(filtrosInicialesBanco.disponibilidad);
    setBancosFiltrados(bancos);
    setFiltrosAplicadosBanco(false);
  };

  // Filtrado cuentas
  const handleAplicarFiltrosCuenta = () => {
    if (selectedBank) {
      let cuentas = accountsData[selectedBank] || [];
      let filtradas = cuentas.filter(c => {
        const matchCodigo = !filtroCodigoCuenta || c.accountCode.toLowerCase().includes(filtroCodigoCuenta.toLowerCase());
        const matchAgencia = !filtroCodigoAgencia || c.agencyCode.toLowerCase().includes(filtroCodigoAgencia.toLowerCase());
        const matchTipo = !filtroTipoCuenta || c.type.toLowerCase().includes(filtroTipoCuenta.toLowerCase());
        const matchDisponibilidad = filtroDisponibilidadCuenta === 'todos' ||
          (filtroDisponibilidadCuenta === 'disponible' ? c.status === 'Disponible' : c.status === 'No Disponible');
        return matchCodigo && matchAgencia && matchTipo && matchDisponibilidad;
      });
      setCuentasFiltradas(filtradas);
      setFiltrosAplicadosCuenta(true);
    }
  };

  const handleLimpiarFiltrosCuenta = () => {
    setFiltroCodigoCuenta(filtrosInicialesCuenta.codigo);
    setFiltroCodigoAgencia(filtrosInicialesCuenta.agencia);
    setFiltroTipoCuenta(filtrosInicialesCuenta.tipo);
    setFiltroDisponibilidadCuenta(filtrosInicialesCuenta.disponibilidad);
    if (selectedBank) {
      setCuentasFiltradas(accountsData[selectedBank] || []);
    }
    setFiltrosAplicadosCuenta(false);
  };

  // Cargar cuentas al seleccionar banco
  useEffect(() => {
    if (selectedBank) {
      setCuentasFiltradas(accountsData[selectedBank] || []);
      setFiltrosAplicadosCuenta(false);
    } else {
      setCuentasFiltradas([]);
    }
  }, [selectedBank]);

  // Modales bancos
  const handleEditarBanco = (banco) => {
    setBancoSeleccionado(banco);
    setEditBancoNombre(banco.name);
    setEditBancoSiglas(banco.acronym);
    setEditBancoEstado(banco.status);
    setEditarBancoOpen(true);
  };
  
  const handleEliminarBanco = (banco) => {
    setBancoSeleccionado(banco);
    setEliminarBancoOpen(true);
  };
  
  const handleGuardarEdicionBanco = () => {
    if (!editBancoNombre.trim() || !editBancoSiglas.trim()) return;
    
    setBancos(prev => prev.map(b => b.id === bancoSeleccionado.id ? { ...b, name: editBancoNombre, acronym: editBancoSiglas, status: editBancoEstado } : b));
    setBancosFiltrados(prev => prev.map(b => b.id === bancoSeleccionado.id ? { ...b, name: editBancoNombre, acronym: editBancoSiglas, status: editBancoEstado } : b));
    setEditarBancoOpen(false);
    setBancoSeleccionado(null);
  };
  
  const handleConfirmarEliminarBanco = () => {
    setBancos(prev => prev.filter(b => b.id !== bancoSeleccionado.id));
    setBancosFiltrados(prev => prev.filter(b => b.id !== bancoSeleccionado.id));
    setEliminarBancoOpen(false);
    setBancoSeleccionado(null);
    if (selectedBank === bancoSeleccionado.id) setSelectedBank(null);
  };

  // Nuevo banco
  const handleNuevoBanco = () => {
    setNuevoBancoOpen(true);
    // Generar código automático
    const nuevoCodigo = String(Math.max(...bancos.map(b => parseInt(b.code))) + 1).padStart(4, '0');
    setNuevoBancoCodigo(nuevoCodigo);
    setNuevoBancoNombre('');
    setNuevoBancoSiglas('');
    setNuevoBancoEstado('Disponible');
  };
  
  const handleGuardarNuevoBanco = () => {
    if (!nuevoBancoNombre.trim() || !nuevoBancoSiglas.trim()) return;
    
    const nuevoBanco = {
      id: Math.max(...bancos.map(b => b.id)) + 1,
      code: String(Math.max(...bancos.map(b => parseInt(b.code))) + 1).padStart(4, '0'),
      name: nuevoBancoNombre,
      acronym: nuevoBancoSiglas,
      status: nuevoBancoEstado
    };
    
    setBancos(prev => [...prev, nuevoBanco]);
    setBancosFiltrados(prev => [...prev, nuevoBanco]);
    setNuevoBancoOpen(false);
  };

  // Modales cuentas
  const handleEditarCuenta = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setEditCuentaCodigo(cuenta.accountCode);
    setEditCuentaAgencia(cuenta.agencyCode);
    setEditCuentaTipo(cuenta.type);
    setEditCuentaEstado(cuenta.status);
    setEditarCuentaOpen(true);
  };
  
  const handleEliminarCuenta = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setEliminarCuentaOpen(true);
  };
  
  const handleGuardarEdicionCuenta = () => {
    if (!editCuentaCodigo.trim() || !editCuentaAgencia.trim() || !editCuentaTipo.trim()) return;
    
    // Simular actualización de cuenta
    setCuentasFiltradas(prev => prev.map(c => 
      c.id === cuentaSeleccionada.id 
        ? { ...c, accountCode: editCuentaCodigo, agencyCode: editCuentaAgencia, type: editCuentaTipo, status: editCuentaEstado }
        : c
    ));
    setEditarCuentaOpen(false);
    setCuentaSeleccionada(null);
  };
  
  const handleConfirmarEliminarCuenta = () => {
    setCuentasFiltradas(prev => prev.filter(c => c.id !== cuentaSeleccionada.id));
    setEliminarCuentaOpen(false);
    setCuentaSeleccionada(null);
  };

  // Nueva cuenta
  const handleNuevaCuenta = () => {
    setNuevaCuentaOpen(true);
    setNuevaCuentaCodigo('');
    setNuevaCuentaAgencia('');
    setNuevaCuentaTipo('');
    setNuevaCuentaEstado('Disponible');
  };
  
  const handleGuardarNuevaCuenta = () => {
    if (!nuevaCuentaCodigo.trim() || !nuevaCuentaAgencia.trim() || !nuevaCuentaTipo.trim()) return;
    
    const nuevaCuenta = {
      id: Math.max(...cuentasFiltradas.map(c => c.id)) + 1,
      accountCode: nuevaCuentaCodigo,
      agencyCode: nuevaCuentaAgencia,
      type: nuevaCuentaTipo,
      bank: selectedBankData?.name || '',
      status: nuevaCuentaEstado
    };
    
    setCuentasFiltradas(prev => [...prev, nuevaCuenta]);
    setNuevaCuentaOpen(false);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafbfc', p: 0, display: 'flex', flexDirection: 'column' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2, mt: 1, ml: 4 }}>
        <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}>
          <HomeIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
          <AccountBalanceIcon sx={{ mr: 0.5, fontSize: 20 }} />
          <Typography color="text.primary">Cuentas bancarias</Typography>
        </Box>
      </Breadcrumbs>
      <Typography variant="h4" fontWeight={600} sx={{ ml: 4, mb: 2 }}>Cuentas bancarias</Typography>
      <Divider sx={{ mb: 3, ml: 4, mr: 4 }} />

      {/* Bancos Section */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 4 }}>
        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>Bancos</Typography>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                sx={{ fontWeight: 600 }} 
                onClick={handleAplicarFiltrosBanco}
                disabled={filtrosEnEstadoInicialBanco || filtrosAplicadosBanco}
              >
                APLICAR FILTROS
              </Button>
              <Button 
                variant="outlined" 
                sx={{ fontWeight: 600 }} 
                onClick={handleLimpiarFiltrosBanco}
                disabled={!filtrosAplicadosBanco}
              >
                LIMPIAR FILTROS
              </Button>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ fontWeight: 600 }}
              onClick={handleNuevoBanco}
              disabled={filtrosAplicadosBanco}
            >
              + NUEVO BANCO
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField 
              label="Código" 
              size="small" 
              placeholder="Ingrese el código" 
              value={filtroCodigoBanco}
              onChange={e => setFiltroCodigoBanco(e.target.value)}
              disabled={filtrosAplicadosBanco}
              sx={{ width: 100 }}
            />
            <TextField 
              label="Nombre del banco" 
              size="small" 
              placeholder="Ingrese el nombre del banco" 
              sx={{ flexGrow: 1, minWidth: 250 }}
              value={filtroNombreBanco}
              onChange={e => setFiltroNombreBanco(e.target.value)}
              disabled={filtrosAplicadosBanco}
            />
            <TextField 
              label="Siglas" 
              size="small" 
              sx={{ width: 120 }} 
              value={filtroSiglasBanco}
              onChange={e => setFiltroSiglasBanco(e.target.value)}
              disabled={filtrosAplicadosBanco}
            />
            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Disponibilidad</InputLabel>
              <Select 
                label="Disponibilidad" 
                value={filtroDisponibilidadBanco} 
                onChange={e => setFiltroDisponibilidadBanco(e.target.value)}
                disabled={filtrosAplicadosBanco}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="no_disponible">No Disponible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" align="center">Seleccionar</TableCell>
                <TableCell sx={{ minWidth: 80, maxWidth: 90, width: 80, textAlign: 'center', px: 0.5 }} align="center">Código</TableCell>
                <TableCell align="center">Nombre del Banco</TableCell>
                <TableCell sx={{ minWidth: 60, maxWidth: 70, width: 60, textAlign: 'center', px: 0.5 }} align="center">Siglas</TableCell>
                <TableCell sx={{ width: 110, textAlign: 'center' }} align="center">Disponibilidad</TableCell>
                <TableCell sx={{ minWidth: 60, maxWidth: 70, width: 65, textAlign: 'center', px: 0.5 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bancosFiltrados.map((bank) => (
                <TableRow key={bank.id} hover>
                  <TableCell padding="checkbox" align="center">
                    <Radio
                      checked={selectedBank === bank.id}
                      onChange={() => setSelectedBank(bank.id)}
                      value={bank.id}
                      name="radio-buttons"
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80, maxWidth: 90, width: 80, textAlign: 'center', px: 0.5 }} align="center">{bank.code}</TableCell>
                  <TableCell align="center">{bank.name}</TableCell>
                  <TableCell sx={{ minWidth: 60, maxWidth: 70, width: 60, textAlign: 'center', px: 0.5 }} align="center">{bank.acronym}</TableCell>
                  <TableCell sx={{ width: 110, textAlign: 'center' }} align="center">
                    <Box
                      sx={{
                        bgcolor: bank.status === 'Disponible' ? 'success.main' : 'error.main',
                        color: 'white',
                        px: 1.2,
                        py: 0.2,
                        borderRadius: '12px',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        minWidth: 60,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {bank.status}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 60, maxWidth: 70, width: 65, textAlign: 'center', px: 0.5 }} align="center">
                    <Tooltip title="Editar">
                      <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleEditarBanco(bank)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleEliminarBanco(bank)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Cuentas Bancarias Section */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
          {selectedBankData ? `${selectedBankData.name} - Cuentas` : 'Cuentas'}
        </Typography>
        {selectedBank ? (
          <>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    sx={{ fontWeight: 600 }} 
                    onClick={handleAplicarFiltrosCuenta}
                    disabled={filtrosEnEstadoInicialCuenta || filtrosAplicadosCuenta}
                  >
                    APLICAR FILTROS
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ fontWeight: 600 }} 
                    onClick={handleLimpiarFiltrosCuenta}
                    disabled={!filtrosAplicadosCuenta}
                  >
                    LIMPIAR FILTROS
                  </Button>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ fontWeight: 600 }}
                  onClick={handleNuevaCuenta}
                  disabled={filtrosAplicadosCuenta}
                >
                  + NUEVA CUENTA
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField 
                  label="Código de cuenta" 
                  size="small" 
                  placeholder="Ingrese el código" 
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  value={filtroCodigoCuenta}
                  onChange={e => setFiltroCodigoCuenta(e.target.value)}
                  disabled={filtrosAplicadosCuenta}
                />
                <TextField 
                  label="Código de agencia" 
                  size="small" 
                  sx={{ width: 150 }}
                  value={filtroCodigoAgencia}
                  onChange={e => setFiltroCodigoAgencia(e.target.value)}
                  disabled={filtrosAplicadosCuenta}
                />
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Tipo de cuenta</InputLabel>
                  <Select 
                    label="Tipo de cuenta" 
                    value={filtroTipoCuenta} 
                    onChange={e => setFiltroTipoCuenta(e.target.value)}
                    disabled={filtrosAplicadosCuenta}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="recaudacion">Cuenta de recaudación</MenuItem>
                    <MenuItem value="corriente">Cuenta corriente</MenuItem>
                    <MenuItem value="aplicativo">Aplicativo</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel>Disponibilidad</InputLabel>
                  <Select 
                    label="Disponibilidad" 
                    value={filtroDisponibilidadCuenta} 
                    onChange={e => setFiltroDisponibilidadCuenta(e.target.value)}
                    disabled={filtrosAplicadosCuenta}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="no_disponible">No Disponible</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
              <Table size="small" sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 180 }} align="center">Código de cuenta</TableCell>
                    <TableCell sx={{ width: 120 }} align="center">Código de agencia</TableCell>
                    <TableCell sx={{ width: 240 }} align="center">Tipo de cuenta</TableCell>
                    <TableCell sx={{ width: 110, textAlign: 'center' }} align="center">Disponibilidad</TableCell>
                    <TableCell sx={{ width: 80, textAlign: 'center' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cuentasFiltradas.map((account) => (
                    <TableRow key={account.id} hover>
                      <TableCell sx={{ minWidth: 180 }} align="center">{account.accountCode}</TableCell>
                      <TableCell sx={{ width: 120 }} align="center">{account.agencyCode}</TableCell>
                      <TableCell sx={{ width: 240 }} align="center">{account.type}</TableCell>
                      <TableCell sx={{ width: 110, textAlign: 'center' }} align="center">
                        <Box
                          sx={{
                            bgcolor: account.status === 'Disponible' ? 'success.main' : 'error.main',
                            color: 'white',
                            px: 1.2,
                            py: 0.2,
                            borderRadius: '12px',
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            minWidth: 60,
                            textAlign: 'center',
                          }}
                        >
                          {account.status}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: 80, textAlign: 'center' }} align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleEditarCuenta(account)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleEliminarCuenta(account)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Seleccione un banco para ver sus cuentas asociadas
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Modals */}
      {/* Nuevo Banco */}
      <Dialog open={nuevoBancoOpen} onClose={() => setNuevoBancoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>Nuevo Banco</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Nombre"
            type="text"
            fullWidth
            size="small"
            value={nuevoBancoNombre}
            onChange={(e) => setNuevoBancoNombre(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Siglas"
            type="text"
            fullWidth
            size="small"
            value={nuevoBancoSiglas}
            onChange={(e) => setNuevoBancoSiglas(e.target.value)}
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Disponibilidad</InputLabel>
            <Select label="Disponibilidad" value={nuevoBancoEstado} onChange={(e) => setNuevoBancoEstado(e.target.value)}>
              <MenuItem value="Disponible">Disponible</MenuItem>
              <MenuItem value="No Disponible">No Disponible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setNuevoBancoOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarNuevoBanco} autoFocus sx={{ fontWeight: 600 }} disabled={!nuevoBancoNombre.trim() || !nuevoBancoSiglas.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar Banco */}
      <Dialog open={editarBancoOpen} onClose={() => setEditarBancoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>Editar Banco</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Nombre"
            type="text"
            fullWidth
            size="small"
            value={editBancoNombre}
            onChange={(e) => setEditBancoNombre(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Siglas"
            type="text"
            fullWidth
            size="small"
            value={editBancoSiglas}
            onChange={(e) => setEditBancoSiglas(e.target.value)}
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Disponibilidad</InputLabel>
            <Select label="Disponibilidad" value={editBancoEstado} onChange={(e) => setEditBancoEstado(e.target.value)}>
              <MenuItem value="Disponible">Disponible</MenuItem>
              <MenuItem value="No Disponible">No Disponible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEditarBancoOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarEdicionBanco} autoFocus sx={{ fontWeight: 600 }} disabled={!editBancoNombre.trim() || !editBancoSiglas.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Eliminar Banco */}
      <Dialog open={eliminarBancoOpen} onClose={() => setEliminarBancoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 1 }}>Eliminar Banco</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`¿Estás seguro de que quieres eliminar el banco "${bancoSeleccionado?.name}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEliminarBancoOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleConfirmarEliminarBanco} autoFocus color="error" sx={{ fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Nueva Cuenta */}
      <Dialog open={nuevaCuentaOpen} onClose={() => setNuevaCuentaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>Nueva Cuenta</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Código de cuenta"
            type="text"
            fullWidth
            size="small"
            value={nuevaCuentaCodigo}
            onChange={(e) => setNuevaCuentaCodigo(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Código de agencia"
            type="text"
            fullWidth
            size="small"
            value={nuevaCuentaAgencia}
            onChange={(e) => setNuevaCuentaAgencia(e.target.value)}
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Tipo de cuenta</InputLabel>
            <Select label="Tipo de cuenta" value={nuevaCuentaTipo} onChange={(e) => setNuevaCuentaTipo(e.target.value)}>
              <MenuItem value="">Seleccione un tipo</MenuItem>
              <MenuItem value="Cuenta de recaudación">Cuenta de recaudación</MenuItem>
              <MenuItem value="Cuenta corriente">Cuenta corriente</MenuItem>
              <MenuItem value="Cuenta de ahorros">Cuenta de ahorros</MenuItem>
              <MenuItem value="Aplicativo">Aplicativo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Disponibilidad</InputLabel>
            <Select label="Disponibilidad" value={nuevaCuentaEstado} onChange={(e) => setNuevaCuentaEstado(e.target.value)}>
              <MenuItem value="Disponible">Disponible</MenuItem>
              <MenuItem value="No Disponible">No Disponible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setNuevaCuentaOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarNuevaCuenta} autoFocus sx={{ fontWeight: 600 }} disabled={!nuevaCuentaCodigo.trim() || !nuevaCuentaAgencia.trim() || !nuevaCuentaTipo.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar Cuenta */}
      <Dialog open={editarCuentaOpen} onClose={() => setEditarCuentaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>Editar Cuenta</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Código de cuenta"
            type="text"
            fullWidth
            size="small"
            value={editCuentaCodigo}
            onChange={(e) => setEditCuentaCodigo(e.target.value)}
          />
          <TextField
            margin="normal"
            label="Código de agencia"
            type="text"
            fullWidth
            size="small"
            value={editCuentaAgencia}
            onChange={(e) => setEditCuentaAgencia(e.target.value)}
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Tipo de cuenta</InputLabel>
            <Select label="Tipo de cuenta" value={editCuentaTipo} onChange={(e) => setEditCuentaTipo(e.target.value)}>
              <MenuItem value="Cuenta de recaudación">Cuenta de recaudación</MenuItem>
              <MenuItem value="Cuenta corriente">Cuenta corriente</MenuItem>
              <MenuItem value="Cuenta de ahorros">Cuenta de ahorros</MenuItem>
              <MenuItem value="Aplicativo">Aplicativo</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Disponibilidad</InputLabel>
            <Select label="Disponibilidad" value={editCuentaEstado} onChange={(e) => setEditCuentaEstado(e.target.value)}>
              <MenuItem value="Disponible">Disponible</MenuItem>
              <MenuItem value="No Disponible">No Disponible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEditarCuentaOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarEdicionCuenta} autoFocus sx={{ fontWeight: 600 }} disabled={!editCuentaCodigo.trim() || !editCuentaAgencia.trim() || !editCuentaTipo.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Eliminar Cuenta */}
      <Dialog open={eliminarCuentaOpen} onClose={() => setEliminarCuentaOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 1 }}>Eliminar Cuenta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`¿Estás seguro de que quieres eliminar la cuenta "${cuentaSeleccionada?.accountCode}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEliminarCuentaOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleConfirmarEliminarCuenta} autoFocus color="error" sx={{ fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCuentasBancarias; 
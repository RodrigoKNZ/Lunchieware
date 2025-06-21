import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Tooltip, Breadcrumbs, TablePagination
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Visibility, Add } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Link as RouterLink } from 'react-router-dom';

// Datos mock
const cajasMock = [
  { id: 1, numero: '0001', fechaApertura: '27/03/2025', fechaLiquidacion: '', saldoInicial: 20, saldoFinal: 10, estado: 'Abierta' },
  { id: 2, numero: '0002', fechaApertura: '10/03/2025', fechaLiquidacion: '20/03/2025', saldoInicial: 50, saldoFinal: 20, estado: 'Cerrada' },
  { id: 3, numero: '0004', fechaApertura: '10/03/2025', fechaLiquidacion: '20/03/2025', saldoInicial: 50, saldoFinal: 20, estado: 'Cerrada' },
  { id: 4, numero: '0005', fechaApertura: '10/03/2025', fechaLiquidacion: '20/03/2025', saldoInicial: 50, saldoFinal: 20, estado: 'Cerrada' },
  { id: 5, numero: '0006', fechaApertura: '10/03/2025', fechaLiquidacion: '20/03/2025', saldoInicial: 50, saldoFinal: 20, estado: 'Cerrada' },
  { id: 6, numero: '0007', fechaApertura: '10/03/2025', fechaLiquidacion: '20/03/2025', saldoInicial: 50, saldoFinal: 20, estado: 'Cerrada' },
];

const estados = [
  { value: 'todos', label: 'Todos' },
  { value: 'Abierta', label: 'Activa' },
  { value: 'Cerrada', label: 'Cerrada' },
];

const AdminCajaChica = () => {
  // Filtros
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroFechaApertura, setFiltroFechaApertura] = useState(null);
  const [filtroFechaLiquidacion, setFiltroFechaLiquidacion] = useState(null);
  const [filtroSaldoInicialMin, setFiltroSaldoInicialMin] = useState('');
  const [filtroSaldoInicialMax, setFiltroSaldoInicialMax] = useState('');
  const [filtroSaldoFinalMin, setFiltroSaldoFinalMin] = useState('');
  const [filtroSaldoFinalMax, setFiltroSaldoFinalMax] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const handleNumericChange = (setter) => (e) => {
    let value = e.target.value.replace(/,/g, '');
    value = value.replace(/-/g, '');
    // Truncar a dos decimales si es necesario
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      value = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
    }
    // Permitir solo números y punto
    if (!/^\d*(\.?\d{0,2})?$/.test(value)) {
      return;
    }
    setter(value);
  };

  // Control de filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const filtrosIniciales = {
    numero: '',
    fechaApertura: null,
    fechaLiquidacion: null,
    saldoInicialMin: '',
    saldoInicialMax: '',
    saldoFinalMin: '',
    saldoFinalMax: '',
    estado: 'todos',
  };
  const filtrosEnEstadoInicial =
    filtroNumero === filtrosIniciales.numero &&
    filtroFechaApertura === filtrosIniciales.fechaApertura &&
    filtroFechaLiquidacion === filtrosIniciales.fechaLiquidacion &&
    filtroSaldoInicialMin === filtrosIniciales.saldoInicialMin &&
    filtroSaldoInicialMax === filtrosIniciales.saldoInicialMax &&
    filtroSaldoFinalMin === filtrosIniciales.saldoFinalMin &&
    filtroSaldoFinalMax === filtrosIniciales.saldoFinalMax &&
    filtroEstado === filtrosIniciales.estado;

  // Datos y paginación
  const [cajas, setCajas] = useState(cajasMock);
  const [cajasFiltradas, setCajasFiltradas] = useState(cajasMock);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal apertura
  const [modalApertura, setModalApertura] = useState(false);
  const [nuevoSaldoInicial, setNuevoSaldoInicial] = useState('');
  const [nuevaObs, setNuevaObs] = useState('');

  // Filtros
  const handleAplicarFiltros = () => {
    let filtradas = cajas.filter(c => {
      const matchNumero = !filtroNumero || c.numero.includes(filtroNumero);
      const matchFechaApertura = !filtroFechaApertura || c.fechaApertura === filtroFechaApertura;
      const matchFechaLiquidacion = !filtroFechaLiquidacion || c.fechaLiquidacion === filtroFechaLiquidacion;
      const matchSaldoInicial = (!filtroSaldoInicialMin || c.saldoInicial >= parseFloat(filtroSaldoInicialMin)) && (!filtroSaldoInicialMax || c.saldoInicial <= parseFloat(filtroSaldoInicialMax));
      const matchSaldoFinal = (!filtroSaldoFinalMin || c.saldoFinal >= parseFloat(filtroSaldoFinalMin)) && (!filtroSaldoFinalMax || c.saldoFinal <= parseFloat(filtroSaldoFinalMax));
      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
      return matchNumero && matchFechaApertura && matchFechaLiquidacion && matchSaldoInicial && matchSaldoFinal && matchEstado;
    });
    setCajasFiltradas(filtradas);
    setFiltrosAplicados(true);
    setPage(0);
  };
  const handleLimpiarFiltros = () => {
    setFiltroNumero('');
    setFiltroFechaApertura(null);
    setFiltroFechaLiquidacion(null);
    setFiltroSaldoInicialMin('');
    setFiltroSaldoInicialMax('');
    setFiltroSaldoFinalMin('');
    setFiltroSaldoFinalMax('');
    setFiltroEstado('todos');
    setCajasFiltradas(cajas);
    setFiltrosAplicados(false);
    setPage(0);
  };

  // Paginación
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedCajas = cajasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Render
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafbfc', p: 0, display: 'flex', flexDirection: 'column' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2, mt: 1, ml: 4 }}>
        <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}>
          <HomeIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
          <AccountBalanceWalletIcon sx={{ mr: 0.5, fontSize: 20 }} />
          <Typography color="text.primary">Caja chica</Typography>
        </Box>
      </Breadcrumbs>
      <Typography variant="h4" fontWeight={600} sx={{ ml: 4, mb: 2 }}>Caja chica</Typography>
      <Divider sx={{ mb: 3, ml: 4, mr: 4 }} />
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', m: 4, mt: 0 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" sx={{ fontWeight: 600 }} onClick={handleAplicarFiltros} disabled={filtrosEnEstadoInicial || filtrosAplicados}>APLICAR FILTROS</Button>
              <Button variant="outlined" sx={{ fontWeight: 600 }} onClick={handleLimpiarFiltros} disabled={!filtrosAplicados}>LIMPIAR FILTROS</Button>
            </Box>
            <Button variant="contained" color="primary" sx={{ fontWeight: 600 }} onClick={() => setModalApertura(true)} disabled={filtrosAplicados}>
              + APERTURAR NUEVA CAJA
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                <TextField label="Nro. liquidación" size="small" value={filtroNumero} onChange={e => setFiltroNumero(e.target.value)} disabled={filtrosAplicados} sx={{ width: 140 }}/>
                <DatePicker
                  label="Fecha apertura"
                  value={filtroFechaApertura}
                  onChange={(newValue) => setFiltroFechaApertura(newValue)}
                  disabled={filtrosAplicados}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 170 }} />}
                />
                <DatePicker
                  label="Fecha liquidación"
                  value={filtroFechaLiquidacion}
                  onChange={(newValue) => setFiltroFechaLiquidacion(newValue)}
                  disabled={filtrosAplicados}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 180 }} />}
                />
                <FormControl size="small" sx={{ width: 120 }} disabled={filtrosAplicados}>
                  <InputLabel>Estado</InputLabel>
                  <Select label="Estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                    {estados.map(e => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </LocalizationProvider>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
              <TextField label="Saldo inicial mín." size="small" value={filtroSaldoInicialMin} onChange={handleNumericChange(setFiltroSaldoInicialMin)} disabled={filtrosAplicados} sx={{ width: 150 }} type="text" inputMode="decimal"/>
              <TextField label="Saldo inicial máx." size="small" value={filtroSaldoInicialMax} onChange={handleNumericChange(setFiltroSaldoInicialMax)} disabled={filtrosAplicados} sx={{ width: 170 }} type="text" inputMode="decimal"/>
              <TextField label="Saldo final mín." size="small" value={filtroSaldoFinalMin} onChange={handleNumericChange(setFiltroSaldoFinalMin)} disabled={filtrosAplicados} sx={{ width: 150 }} type="text" inputMode="decimal"/>
              <TextField label="Saldo final máx." size="small" value={filtroSaldoFinalMax} onChange={handleNumericChange(setFiltroSaldoFinalMax)} disabled={filtrosAplicados} sx={{ width: 150 }} type="text" inputMode="decimal"/>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Nro. liquidación</TableCell>
                <TableCell align="center">Fecha apertura</TableCell>
                <TableCell align="center">Fecha liquidación</TableCell>
                <TableCell align="center">Saldo inicial</TableCell>
                <TableCell align="center">Saldo final</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCajas.map((caja) => (
                <TableRow key={caja.id} hover>
                  <TableCell align="center">{caja.numero}</TableCell>
                  <TableCell align="center">{caja.fechaApertura}</TableCell>
                  <TableCell align="center">{caja.fechaLiquidacion || '-'}</TableCell>
                  <TableCell align="center">S/. {caja.saldoInicial.toFixed(2)}</TableCell>
                  <TableCell align="center">S/. {caja.saldoFinal.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ bgcolor: caja.estado === 'Abierta' ? 'success.main' : 'error.main', color: 'white', px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem' }}>
                      {caja.estado === 'Abierta' ? 'Abierta' : 'Cerrada'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" component={RouterLink} to={`/admin/caja-chica/${caja.numero}`}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={cajasFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>
      {/* Modal apertura nueva caja chica */}
      <Dialog open={modalApertura} onClose={() => setModalApertura(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22 }}>Apertura de nueva caja chica</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Saldo inicial"
            type="text"
            inputMode="decimal"
            fullWidth
            size="small"
            value={nuevoSaldoInicial}
            onChange={handleNumericChange(setNuevoSaldoInicial)}
          />
          <TextField margin="dense" label="Observaciones" type="text" fullWidth size="small" multiline minRows={3} value={nuevaObs} onChange={e => setNuevaObs(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setModalApertura(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={() => setModalApertura(false)} sx={{ fontWeight: 600 }} disabled={!nuevoSaldoInicial}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCajaChica; 
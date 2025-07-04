import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Tooltip, Breadcrumbs, TablePagination
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Visibility from '@mui/icons-material/Visibility';
import Delete from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import cajaChicaService from '../services/cajaChicaService';
import CloseIcon from '@mui/icons-material/Close';

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
  // Estados de filtros
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroFechaAperturaDesde, setFiltroFechaAperturaDesde] = useState(null);
  const [filtroFechaAperturaHasta, setFiltroFechaAperturaHasta] = useState(null);
  const [filtroFechaLiquidacionDesde, setFiltroFechaLiquidacionDesde] = useState(null);
  const [filtroFechaLiquidacionHasta, setFiltroFechaLiquidacionHasta] = useState(null);
  const [filtroSaldoInicialMin, setFiltroSaldoInicialMin] = useState('');
  const [filtroSaldoInicialMax, setFiltroSaldoInicialMax] = useState('');
  const [filtroSaldoFinalMin, setFiltroSaldoFinalMin] = useState('');
  const [filtroSaldoFinalMax, setFiltroSaldoFinalMax] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  // Datos y paginación
  const [cajas, setCajas] = useState([]);
  const [cajasFiltradas, setCajasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal apertura
  const [modalApertura, setModalApertura] = useState(false);
  const [nuevoSaldoInicial, setNuevoSaldoInicial] = useState('');
  const [nuevaObs, setNuevaObs] = useState('');

  const filtrosIniciales = {
    numero: '',
    fechaAperturaDesde: null,
    fechaAperturaHasta: null,
    fechaLiquidacionDesde: null,
    fechaLiquidacionHasta: null,
    saldoInicialMin: '',
    saldoInicialMax: '',
    saldoFinalMin: '',
    saldoFinalMax: '',
    estado: 'todos',
  };
  const filtrosEnEstadoInicial =
    filtroNumero === filtrosIniciales.numero &&
    filtroFechaAperturaDesde === null && filtroFechaAperturaHasta === null &&
    filtroFechaLiquidacionDesde === null && filtroFechaLiquidacionHasta === null &&
    filtroSaldoInicialMin === filtrosIniciales.saldoInicialMin &&
    filtroSaldoInicialMax === filtrosIniciales.saldoInicialMax &&
    filtroSaldoFinalMin === filtrosIniciales.saldoFinalMin &&
    filtroSaldoFinalMax === filtrosIniciales.saldoFinalMax &&
    filtroEstado === filtrosIniciales.estado;

  // Filtros
  const handleAplicarFiltros = () => {
    let filtradas = cajas.filter(c => {
      const matchNumero = !filtroNumero || c.numero.includes(filtroNumero);
      
      const fechaAperturaCaja = dayjs(c.fechaApertura, 'DD/MM/YYYY');
      const matchFechaApertura = (!filtroFechaAperturaDesde || fechaAperturaCaja.isSame(dayjs(filtroFechaAperturaDesde), 'day') || fechaAperturaCaja.isAfter(dayjs(filtroFechaAperturaDesde))) &&
                                 (!filtroFechaAperturaHasta || fechaAperturaCaja.isSame(dayjs(filtroFechaAperturaHasta), 'day') || fechaAperturaCaja.isBefore(dayjs(filtroFechaAperturaHasta)));
      
      const fechaLiquidacionCaja = c.fechaLiquidacion ? dayjs(c.fechaLiquidacion, 'DD/MM/YYYY') : null;
      const matchFechaLiquidacion = !fechaLiquidacionCaja || (!filtroFechaLiquidacionDesde || fechaLiquidacionCaja.isSame(dayjs(filtroFechaLiquidacionDesde), 'day') || fechaLiquidacionCaja.isAfter(dayjs(filtroFechaLiquidacionDesde))) &&
                                    (!filtroFechaLiquidacionHasta || fechaLiquidacionCaja.isSame(dayjs(filtroFechaLiquidacionHasta), 'day') || fechaLiquidacionCaja.isBefore(dayjs(filtroFechaLiquidacionHasta)));
      
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
    setFiltroFechaAperturaDesde(null);
    setFiltroFechaAperturaHasta(null);
    setFiltroFechaLiquidacionDesde(null);
    setFiltroFechaLiquidacionHasta(null);
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

  // Cargar cajas al montar el componente
  useEffect(() => {
    cargarCajas();
  }, []);

  // Calcular saldos finales dinámicamente
  useEffect(() => {
    async function calcularSaldosFinales() {
      // Solo si hay cajas
      if (!cajas.length) return;
      const cajasConSaldo = await Promise.all(cajas.map(async (caja) => {
        try {
          const resp = await cajaChicaService.obtenerMovimientos(caja.id);
          const movimientos = Array.isArray(resp.data.data) ? resp.data.data : [];
          const sumaMovimientos = movimientos.reduce((acc, mov) => acc + parseFloat(mov.montoTotal || 0), 0);
          return { ...caja, saldoFinal: caja.saldoInicial - sumaMovimientos };
        } catch {
          return { ...caja, saldoFinal: caja.saldoInicial };
        }
      }));
      setCajas(cajasConSaldo);
      setCajasFiltradas(cajasConSaldo);
    }
    calcularSaldosFinales();
    // eslint-disable-next-line
  }, [JSON.stringify(cajas)]);

  const cargarCajas = async () => {
    setLoading(true);
    try {
      const response = await cajaChicaService.obtenerTodas();
      console.log('Respuesta cruda de backend (cajas chicas):', response);
      // Validar que response.data.data sea un array
      const cajasData = Array.isArray(response.data.data) ? response.data.data : [];
      // Adaptar los datos del backend al formato esperado por el frontend
      const adaptadas = cajasData.map(caja => ({
        id: caja.idCajaChica,
        numero: caja.numeroLiquidacion,
        fechaApertura: caja.fechaApertura ? dayjs(caja.fechaApertura).format('DD/MM/YYYY') : '',
        fechaLiquidacion: caja.fechaLiquidacion ? dayjs(caja.fechaLiquidacion).format('DD/MM/YYYY') : '',
        saldoInicial: parseFloat(caja.saldoInicial),
        saldoFinal: parseFloat(caja.saldoFinal),
        estado: caja.abierta ? 'Abierta' : 'Cerrada',
        observaciones: caja.observaciones || ''
      }));
      console.log('Datos adaptados para la tabla:', adaptadas);
      setCajas(adaptadas);
      setCajasFiltradas(adaptadas);
    } catch (err) {
      setCajas([]);
      setCajasFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  // Guardar nueva caja chica
  const handleGuardarNuevaCaja = async () => {
    try {
      // Validaciones
      if (!nuevoSaldoInicial || parseFloat(nuevoSaldoInicial) <= 0) {
        alert('El saldo inicial debe ser mayor a 0');
        return;
      }

      const nuevaCaja = {
        fechaApertura: dayjs().format('YYYY-MM-DD'),
        saldoInicial: parseFloat(nuevoSaldoInicial),
        observaciones: nuevaObs || ''
      };
      
      await cajaChicaService.crear(nuevaCaja);
      setModalApertura(false);
      setNuevoSaldoInicial('');
      setNuevaObs('');
      cargarCajas();
    } catch (err) {
      console.error('Error al crear caja chica:', err);
      alert('Error al crear la caja chica');
    }
  };

  // Eliminar caja chica
  const handleEliminarCaja = async (caja) => {
    if (window.confirm(`¿Está seguro que desea eliminar la caja chica ${caja.numero}? Esta acción no puede deshacerse.`)) {
      try {
        await cajaChicaService.eliminar(caja.id);
        cargarCajas();
      } catch (err) {
        console.error('Error al eliminar caja chica:', err);
        alert('Error al eliminar la caja chica');
      }
    }
  };

  // Liquidar caja chica automáticamente
  const handleLiquidarCaja = async (caja) => {
    try {
      // Liquidar con fecha del sistema y saldo final calculado
      const datosCierre = {
        fechaLiquidacion: dayjs().format('YYYY-MM-DD'),
        saldoFinal: caja.saldoFinal
      };
      await cajaChicaService.cerrar(caja.id, datosCierre);
      cargarCajas();
    } catch (err) {
      alert('Error al liquidar la caja chica');
    }
  };

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
            <Button variant="contained" color="primary" sx={{ fontWeight: 600 }} onClick={() => setModalApertura(true)} disabled={cajas.some(c => c.estado === 'Abierta')}>
              + APERTURAR NUEVA CAJA
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
              <TextField label="Nro. liquidación" size="small" value={filtroNumero} onChange={e => setFiltroNumero(e.target.value)} disabled={filtrosAplicados} sx={{ width: 140 }}/>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                label="Fecha apertura"
                  value={filtroFechaAperturaDesde ? dayjs(filtroFechaAperturaDesde) : null}
                  onChange={(newValue) => {
                    setFiltroFechaAperturaDesde(newValue ? newValue.format('YYYY-MM-DD') : null);
                    setFiltroFechaAperturaHasta(newValue ? newValue.format('YYYY-MM-DD') : null);
                  }}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 220 }} />}
                disabled={filtrosAplicados}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                label="Fecha liquidación"
                  value={filtroFechaLiquidacionDesde ? dayjs(filtroFechaLiquidacionDesde) : null}
                  onChange={(newValue) => {
                    setFiltroFechaLiquidacionDesde(newValue ? newValue.format('YYYY-MM-DD') : null);
                    setFiltroFechaLiquidacionHasta(newValue ? newValue.format('YYYY-MM-DD') : null);
                  }}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 220 }} />}
                disabled={filtrosAplicados}
                />
              </LocalizationProvider>
              <FormControl size="small" sx={{ width: 120 }} disabled={filtrosAplicados}>
                <InputLabel>Estado</InputLabel>
                <Select label="Estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                  {estados.map(e => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
              <TextField label="Saldo inicial mín." size="small" value={filtroSaldoInicialMin} onChange={e => setFiltroSaldoInicialMin(e.target.value)} disabled={filtrosAplicados} sx={{ width: 150 }} type="text" inputMode="decimal"/>
              <TextField label="Saldo inicial máx." size="small" value={filtroSaldoInicialMax} onChange={e => setFiltroSaldoInicialMax(e.target.value)} disabled={filtrosAplicados} sx={{ width: 170 }} type="text" inputMode="decimal"/>
              <TextField label="Saldo final mín." size="small" value={filtroSaldoFinalMin} onChange={e => setFiltroSaldoFinalMin(e.target.value)} disabled={filtrosAplicados} sx={{ width: 150 }} type="text" inputMode="decimal"/>
              <TextField label="Saldo final máx." size="small" value={filtroSaldoFinalMax} onChange={e => setFiltroSaldoFinalMax(e.target.value)} disabled={filtrosAplicados} sx={{ width: 150 }} type="text" inputMode="decimal"/>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <TableContainer>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>Cargando cajas chicas...</Typography>
            </Box>
          ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Nro. liquidación</TableCell>
                <TableCell align="center">Fecha apertura</TableCell>
                <TableCell align="center">Fecha liquidación</TableCell>
                <TableCell align="center">Saldo inicial</TableCell>
                <TableCell align="center">Saldo final</TableCell>
                <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" component={RouterLink} to={`/admin/caja-chica/${caja.numero}`}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                        {caja.estado === 'Abierta' && (
                          <Tooltip title="Liquidar caja chica">
                            <IconButton size="small" color="warning" onClick={() => handleLiquidarCaja(caja)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleEliminarCaja(caja)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
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
            onChange={e => setNuevoSaldoInicial(e.target.value)}
          />
          <TextField margin="dense" label="Observaciones" type="text" fullWidth size="small" multiline minRows={3} value={nuevaObs} onChange={e => setNuevaObs(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setModalApertura(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarNuevaCaja} sx={{ fontWeight: 600 }} disabled={!nuevoSaldoInicial}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCajaChica; 
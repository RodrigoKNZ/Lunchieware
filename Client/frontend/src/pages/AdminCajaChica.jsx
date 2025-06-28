import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Tooltip, Breadcrumbs, TablePagination, Popover, InputAdornment
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Visibility from '@mui/icons-material/Visibility';
import Delete from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import es from 'date-fns/locale/es';
import cajaChicaService from '../services/cajaChicaService';

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
  const [filtroFechaApertura, setFiltroFechaApertura] = useState([{
    startDate: null,
    endDate: null,
    key: 'selection'
  }]);
  const [filtroFechaLiquidacion, setFiltroFechaLiquidacion] = useState([{
    startDate: null,
    endDate: null,
    key: 'selection'
  }]);
  const [filtroSaldoInicialMin, setFiltroSaldoInicialMin] = useState('');
  const [filtroSaldoInicialMax, setFiltroSaldoInicialMax] = useState('');
  const [filtroSaldoFinalMin, setFiltroSaldoFinalMin] = useState('');
  const [filtroSaldoFinalMax, setFiltroSaldoFinalMax] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  // Estados para Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverType, setPopoverType] = useState('');

  const filtrosIniciales = {
    numero: '',
    fechaApertura: [{ startDate: null, endDate: null, key: 'selection' }],
    fechaLiquidacion: [{ startDate: null, endDate: null, key: 'selection' }],
    saldoInicialMin: '',
    saldoInicialMax: '',
    saldoFinalMin: '',
    saldoFinalMax: '',
    estado: 'todos',
  };
  const filtrosEnEstadoInicial =
    filtroNumero === filtrosIniciales.numero &&
    filtroFechaApertura[0].startDate === null && filtroFechaApertura[0].endDate === null &&
    filtroFechaLiquidacion[0].startDate === null && filtroFechaLiquidacion[0].endDate === null &&
    filtroSaldoInicialMin === filtrosIniciales.saldoInicialMin &&
    filtroSaldoInicialMax === filtrosIniciales.saldoInicialMax &&
    filtroSaldoFinalMin === filtrosIniciales.saldoFinalMin &&
    filtroSaldoFinalMax === filtrosIniciales.saldoFinalMax &&
    filtroEstado === filtrosIniciales.estado;

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

  // Handlers Popover
  const handleOpenPopover = (event, type) => {
    setAnchorEl(event.currentTarget);
    setPopoverType(type);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverType('');
  };

  const open = Boolean(anchorEl);
  const idPopover = open ? 'date-range-popover' : undefined;

  // Filtros
  const handleAplicarFiltros = () => {
    let filtradas = cajas.filter(c => {
      const matchNumero = !filtroNumero || c.numero.includes(filtroNumero);
      
      const fechaAperturaCaja = dayjs(c.fechaApertura, 'DD/MM/YYYY');
      const [rangoApertura] = filtroFechaApertura;
      const matchFechaApertura = (!rangoApertura.startDate || fechaAperturaCaja.isSame(dayjs(rangoApertura.startDate), 'day') || fechaAperturaCaja.isAfter(dayjs(rangoApertura.startDate))) &&
                                 (!rangoApertura.endDate || fechaAperturaCaja.isSame(dayjs(rangoApertura.endDate), 'day') || fechaAperturaCaja.isBefore(dayjs(rangoApertura.endDate)));
      
      const fechaLiquidacionCaja = c.fechaLiquidacion ? dayjs(c.fechaLiquidacion, 'DD/MM/YYYY') : null;
      const [rangoLiquidacion] = filtroFechaLiquidacion;
      const matchFechaLiquidacion = !fechaLiquidacionCaja || (!rangoLiquidacion.startDate || fechaLiquidacionCaja.isSame(dayjs(rangoLiquidacion.startDate), 'day') || fechaLiquidacionCaja.isAfter(dayjs(rangoLiquidacion.startDate))) &&
                                    (!rangoLiquidacion.endDate || fechaLiquidacionCaja.isSame(dayjs(rangoLiquidacion.endDate), 'day') || fechaLiquidacionCaja.isBefore(dayjs(rangoLiquidacion.endDate)));
      
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
    setFiltroFechaApertura([{ startDate: null, endDate: null, key: 'selection' }]);
    setFiltroFechaLiquidacion([{ startDate: null, endDate: null, key: 'selection' }]);
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

  const cargarCajas = async () => {
    setLoading(true);
    try {
      const response = await cajaChicaService.obtenerTodas();
      // Adaptar los datos del backend al formato esperado por el frontend
      const adaptadas = response.data.map(caja => ({
        id: caja.idCajaChica,
        numero: caja.numeroLiquidacion,
        fechaApertura: caja.fechaApertura ? dayjs(caja.fechaApertura).format('DD/MM/YYYY') : '',
        fechaLiquidacion: caja.fechaLiquidacion ? dayjs(caja.fechaLiquidacion).format('DD/MM/YYYY') : '',
        saldoInicial: parseFloat(caja.saldoInicial),
        saldoFinal: parseFloat(caja.saldoFinal),
        estado: caja.abierta ? 'Abierta' : 'Cerrada',
        observaciones: caja.observaciones || ''
      }));
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
              <TextField label="Nro. liquidación" size="small" value={filtroNumero} onChange={e => setFiltroNumero(e.target.value)} disabled={filtrosAplicados} sx={{ width: 140 }}/>
              <TextField
                label="Fecha apertura"
                size="small"
                value={
                  filtroFechaApertura[0].startDate && filtroFechaApertura[0].endDate
                  ? `${dayjs(filtroFechaApertura[0].startDate).format('DD/MM/YYYY')} - ${dayjs(filtroFechaApertura[0].endDate).format('DD/MM/YYYY')}`
                  : ''
                }
                onClick={(e) => handleOpenPopover(e, 'apertura')}
                readOnly
                sx={{ width: 220 }}
                disabled={filtrosAplicados}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarTodayIcon sx={{ color: 'action.active', cursor: 'pointer' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Fecha liquidación"
                size="small"
                value={
                  filtroFechaLiquidacion[0].startDate && filtroFechaLiquidacion[0].endDate
                  ? `${dayjs(filtroFechaLiquidacion[0].startDate).format('DD/MM/YYYY')} - ${dayjs(filtroFechaLiquidacion[0].endDate).format('DD/MM/YYYY')}`
                  : ''
                }
                onClick={(e) => handleOpenPopover(e, 'liquidacion')}
                readOnly
                sx={{ width: 220 }}
                disabled={filtrosAplicados}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarTodayIcon sx={{ color: 'action.active', cursor: 'pointer' }} />
                    </InputAdornment>
                  ),
                }}
              />
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

      <Popover
        id={idPopover}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <DateRange
          editableDateInputs={true}
          onChange={item => {
            if (popoverType === 'apertura') setFiltroFechaApertura([item.selection]);
            else if (popoverType === 'liquidacion') setFiltroFechaLiquidacion([item.selection]);
          }}
          moveRangeOnFirstSelection={false}
          ranges={
            popoverType === 'apertura' ? filtroFechaApertura :
            filtroFechaLiquidacion
          }
          locale={es}
        />
      </Popover>
    </Box>
  );
};

export default AdminCajaChica; 
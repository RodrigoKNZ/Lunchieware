import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider, IconButton, Breadcrumbs, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, TablePagination, Popover, InputAdornment, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import cajaChicaService from '../services/cajaChicaService';

const tiposDocumento = [
  { value: 'B', label: 'Boleta' },
  { value: 'F', label: 'Factura' },
  { value: 'N', label: 'Nota' }
];

// Función para obtener el label del tipo de documento
const getTipoDocumentoLabel = (codigo) => {
  const tipo = tiposDocumento.find(t => t.value === codigo);
  return tipo ? tipo.label : codigo;
};

const AdminCajaChicaDetalle = () => {
  const { id } = useParams(); // id es el numeroLiquidacion
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openLiquidarModal, setOpenLiquidarModal] = useState(false);
  const [openMovimientoModal, setOpenMovimientoModal] = useState(false);
  const [openDeleteMovimientoModal, setOpenDeleteMovimientoModal] = useState(false);
  
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [movimientoForm, setMovimientoForm] = useState({});
  const [editCajaForm, setEditCajaForm] = useState({});
  const [liquidarForm, setLiquidarForm] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos de la caja chica
  useEffect(() => {
    const fetchCaja = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await cajaChicaService.obtenerPorNumeroLiquidacion(id);
        
        // Adaptar la respuesta del backend al formato esperado por el frontend
        const cajaAdaptada = {
          id: response.data.idCajaChica,
          numero: response.data.numeroLiquidacion,
          fechaApertura: response.data.fechaApertura ? dayjs(response.data.fechaApertura).format('DD/MM/YYYY') : '',
          fechaLiquidacion: response.data.fechaLiquidacion ? dayjs(response.data.fechaLiquidacion).format('DD/MM/YYYY') : '-',
          estado: response.data.abierta ? 'Abierta' : 'Cerrada',
          saldoInicial: parseFloat(response.data.saldoInicial),
          saldoFinal: parseFloat(response.data.saldoFinal),
          observaciones: response.data.observaciones || ''
        };
        
        setData(cajaAdaptada);
        
        // Cargar movimientos si la caja está abierta
        if (response.data.abierta) {
          await cargarMovimientos(response.data.idCajaChica);
        }
      } catch (error) {
        console.error('Error al cargar caja chica:', error);
        setError('Error al cargar la caja chica');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCaja();
    }
  }, [id]);

  const cargarMovimientos = async (idCajaChica) => {
    try {
      setLoadingMovimientos(true);
      const response = await cajaChicaService.obtenerMovimientos(idCajaChica);
      
      // Adaptar los movimientos al formato esperado por el frontend
      const movimientosAdaptados = response.data.map(mov => ({
        id: mov.idMovimiento,
        tipoDocumento: mov.tipoDocumento,
        serie: mov.serie,
        numero: mov.numero,
        referencia: mov.referencia,
        fecha: dayjs(mov.fechaMovimiento).format('DD/MM/YYYY'),
        imponible: parseFloat(mov.montoImponible),
        impuestos: parseFloat(mov.impuestos),
        total: parseFloat(mov.montoTotal)
      }));
      
      setMovimientos(movimientosAdaptados);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      setMovimientos([]);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const handleOpenMovimientoModal = (movimiento = null) => {
    setSelectedMovimiento(movimiento);
    if (movimiento) {
      setMovimientoForm({
        tipoDocumento: movimiento.tipoDocumento,
        serie: movimiento.serie,
        numero: movimiento.numero,
        referencia: movimiento.referencia,
        fecha: dayjs(movimiento.fecha, "DD/MM/YYYY"),
        imponible: movimiento.imponible.toFixed(2),
        impuestos: movimiento.impuestos.toFixed(2)
      });
    } else {
      setMovimientoForm({
        tipoDocumento: '',
        serie: '',
        numero: '',
        referencia: '',
        fecha: dayjs(),
        imponible: '',
        impuestos: ''
      });
    }
    setOpenMovimientoModal(true);
  };

  const handleGuardarMovimiento = async () => {
    try {
      const { tipoDocumento, serie, numero, referencia, fecha, imponible, impuestos } = movimientoForm;
      
      // Validaciones
      if (!tipoDocumento || !serie || !numero || !referencia || !fecha || !imponible || !impuestos) {
        setSnackbar({ open: true, message: 'Todos los campos son requeridos', severity: 'error' });
        return;
      }

      const montoImponible = parseFloat(imponible);
      const montoImpuestos = parseFloat(impuestos);
      const montoTotal = montoImponible + montoImpuestos;

      if (montoImponible <= 0 || montoImpuestos < 0) {
        setSnackbar({ open: true, message: 'Los montos deben ser valores positivos', severity: 'error' });
        return;
      }

      const movimientoData = {
        idCajaChica: data.id,
        tipoDocumento,
        referencia,
        serie,
        numero,
        fechaMovimiento: fecha.format('YYYY-MM-DD'),
        montoImponible,
        impuestos: montoImpuestos,
        montoTotal
      };

      if (selectedMovimiento) {
        // Actualizar movimiento existente
        await cajaChicaService.actualizarMovimiento(selectedMovimiento.id, movimientoData);
        setSnackbar({ open: true, message: 'Movimiento actualizado exitosamente', severity: 'success' });
      } else {
        // Crear nuevo movimiento
        await cajaChicaService.crearMovimiento(movimientoData);
        setSnackbar({ open: true, message: 'Movimiento creado exitosamente', severity: 'success' });
      }

      setOpenMovimientoModal(false);
      setSelectedMovimiento(null);
      await cargarMovimientos(data.id);
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
      setSnackbar({ open: true, message: 'Error al guardar el movimiento', severity: 'error' });
    }
  };

  const handleEliminarMovimiento = async () => {
    try {
      await cajaChicaService.eliminarMovimiento(selectedMovimiento.id);
      setSnackbar({ open: true, message: 'Movimiento eliminado exitosamente', severity: 'success' });
      setOpenDeleteMovimientoModal(false);
      setSelectedMovimiento(null);
      await cargarMovimientos(data.id);
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      setSnackbar({ open: true, message: 'Error al eliminar el movimiento', severity: 'error' });
    }
  };

  const handleOpenEditModal = () => {
    setEditCajaForm({
      observaciones: data.observaciones
    });
    setOpenEditModal(true);
  };

  const handleGuardarObservaciones = async () => {
    try {
      await cajaChicaService.actualizar(data.id, { observaciones: editCajaForm.observaciones });
      setData(prev => ({ ...prev, observaciones: editCajaForm.observaciones }));
      setSnackbar({ open: true, message: 'Observaciones actualizadas exitosamente', severity: 'success' });
      setOpenEditModal(false);
    } catch (error) {
      console.error('Error al actualizar observaciones:', error);
      setSnackbar({ open: true, message: 'Error al actualizar las observaciones', severity: 'error' });
    }
  };

  const handleLiquidarCaja = async () => {
    try {
      const { fechaLiquidacion, saldoFinal } = liquidarForm;
      
      if (!fechaLiquidacion || !saldoFinal) {
        setSnackbar({ open: true, message: 'Fecha de liquidación y saldo final son requeridos', severity: 'error' });
        return;
      }

      await cajaChicaService.cerrar(data.id, {
        fechaLiquidacion: fechaLiquidacion.format('YYYY-MM-DD'),
        saldoFinal: parseFloat(saldoFinal)
      });

      setSnackbar({ open: true, message: 'Caja chica liquidada exitosamente', severity: 'success' });
      setOpenLiquidarModal(false);
      navigate('/admin/caja-chica');
    } catch (error) {
      console.error('Error al liquidar caja:', error);
      setSnackbar({ open: true, message: 'Error al liquidar la caja chica', severity: 'error' });
    }
  };

  const handleEliminarCaja = async () => {
    try {
      await cajaChicaService.eliminar(data.id);
      setSnackbar({ open: true, message: 'Caja chica eliminada exitosamente', severity: 'success' });
      setOpenDeleteModal(false);
      navigate('/admin/caja-chica');
    } catch (error) {
      console.error('Error al eliminar caja:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la caja chica', severity: 'error' });
    }
  };

  const handleCloseMovimientoModal = () => {
    setOpenMovimientoModal(false);
    setSelectedMovimiento(null);
  };
  
  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value.replace(/,/g, '');
    cleanValue = cleanValue.replace(/-/g, '');
    // Truncar a dos decimales si es necesario
    if (cleanValue.includes('.')) {
      const [intPart, decPart] = cleanValue.split('.');
      cleanValue = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
    }
    // Permitir solo números y punto
    if (!/^\d*(\.?\d{0,2})?$/.test(cleanValue)) {
      return;
    }
    setMovimientoForm(prev => ({...prev, [name]: cleanValue}));
  };

  const handleOpenDeleteMovimientoModal = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setOpenDeleteMovimientoModal(true);
  };

  const handleCloseDeleteMovimientoModal = () => {
    setOpenDeleteMovimientoModal(false);
    setSelectedMovimiento(null);
  };
  
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Mostrar loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar error
  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error || 'Caja no encontrada'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/admin/caja-chica')}>
          Volver a Caja Chica
        </Button>
      </Box>
    );
  }
  
  const paginatedMovimientos = movimientos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <IconButton component={RouterLink} to="/admin" size="small"><HomeIcon sx={{ fontSize: 20 }} /></IconButton>
        <RouterLink to="/admin/caja-chica" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}><AccountBalanceWalletIcon sx={{ mr: 0.5, fontSize: 20 }} /> Caja chica</Box>
        </RouterLink>
        <Typography color="text.primary">Detalle</Typography>
      </Breadcrumbs>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Caja chica - {data.numero}</Typography>
      
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Datos de la caja chica</Typography>
            <Box>
                {data.estado === 'Abierta' && (
                  <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => setOpenLiquidarModal(true)}>LIQUIDAR CAJA</Button>
                )}
                <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleOpenEditModal}>EDITAR</Button>
                <Button variant="outlined" color="error" onClick={() => setOpenDeleteModal(true)}>ELIMINAR</Button>
            </Box>
        </Box>
        <Divider sx={{ mb: 2 }}/>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><Typography fontWeight={500}>Número de liquidación</Typography><Typography>{data.numero}</Typography></Grid>
          <Grid item xs={12} sm={3}><Typography fontWeight={500}>Saldo inicial</Typography><Typography>S/. {data.saldoInicial.toFixed(2)}</Typography></Grid>
          <Grid item xs={12} sm={3}><Typography fontWeight={500}>Fecha de apertura</Typography><Typography>{data.fechaApertura}</Typography></Grid>
          <Grid item xs={12} sm={3}><Typography fontWeight={500}>Saldo final</Typography><Typography>S/. {data.saldoFinal.toFixed(2)}</Typography></Grid>
          <Grid item xs={12} sm={3}><Typography fontWeight={500}>Fecha de liquidación</Typography><Typography>{data.fechaLiquidacion}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography fontWeight={500}>Observaciones</Typography><Typography>{data.observaciones}</Typography></Grid>
          <Grid item xs={12} sm={3}><Typography fontWeight={500}>Estado</Typography><Typography>{data.estado}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Movimientos</Typography>
            {data.estado === 'Abierta' && (
              <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenMovimientoModal()}>NUEVO MOVIMIENTO</Button>
            )}
        </Box>
        <Divider sx={{ mb: 2 }}/>
        
        {loadingMovimientos ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : movimientos.length === 0 ? (
          <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
            No hay movimientos registrados
          </Typography>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{width: '15%'}}>Tipo documento</TableCell>
                    <TableCell sx={{width: '8%'}}>Serie</TableCell>
                    <TableCell sx={{width: '10%'}}>Número</TableCell>
                    <TableCell>Referencia/Proveedor</TableCell>
                    <TableCell sx={{width: '10%'}}>Fecha</TableCell>
                    <TableCell sx={{width: '10%'}} align="right">Monto Imponible</TableCell>
                    <TableCell sx={{width: '10%'}} align="right">Impuestos</TableCell>
                    <TableCell sx={{width: '10%'}} align="right">Monto total</TableCell>
                    {data.estado === 'Abierta' && (
                      <TableCell sx={{width: '10%'}} align="center">Acciones</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMovimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{getTipoDocumentoLabel(mov.tipoDocumento)}</TableCell>
                      <TableCell>{mov.serie}</TableCell>
                      <TableCell>{mov.numero}</TableCell>
                      <TableCell>{mov.referencia}</TableCell>
                      <TableCell>{dayjs(mov.fecha, "DD/MM/YYYY").format('DD/MM/YY')}</TableCell>
                      <TableCell align="right">S/. {mov.imponible.toFixed(2)}</TableCell>
                      <TableCell align="right">S/. {mov.impuestos.toFixed(2)}</TableCell>
                      <TableCell align="right">S/. {mov.total.toFixed(2)}</TableCell>
                      {data.estado === 'Abierta' && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => handleOpenMovimientoModal(mov)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" onClick={() => handleOpenDeleteMovimientoModal(mov)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={movimientos.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Edit Caja Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar datos de la caja chica</DialogTitle>
        <DialogContent>
          <TextField 
            margin="dense" 
            label="Observaciones" 
            value={editCajaForm.observaciones || ''} 
            onChange={(e) => setEditCajaForm({...editCajaForm, observaciones: e.target.value})}
            fullWidth 
            multiline 
            rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>CANCELAR</Button>
          <Button onClick={handleGuardarObservaciones} variant="contained">GUARDAR</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Caja Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Caja Chica</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar esta caja chica? Esta acción no puede deshacerse.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>CANCELAR</Button>
          <Button onClick={handleEliminarCaja} color="error" variant="contained">ELIMINAR</Button>
        </DialogActions>
      </Dialog>

      {/* Liquidar Caja Modal */}
      <Dialog open={openLiquidarModal} onClose={() => setOpenLiquidarModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Liquidar Caja Chica</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <DatePicker
                  label="Fecha de liquidación"
                  value={liquidarForm.fechaLiquidacion || null}
                  onChange={(date) => setLiquidarForm({...liquidarForm, fechaLiquidacion: date})}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Saldo final"
                  type="number"
                  value={liquidarForm.saldoFinal || ''}
                  onChange={(e) => setLiquidarForm({...liquidarForm, saldoFinal: e.target.value})}
                  fullWidth
                  inputProps={{ step: 0.01, min: 0 }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLiquidarModal(false)}>CANCELAR</Button>
          <Button onClick={handleLiquidarCaja} color="primary" variant="contained">LIQUIDAR</Button>
        </DialogActions>
      </Dialog>

      {/* Movimiento Modal (Add/Edit) */}
      <Dialog open={openMovimientoModal} onClose={handleCloseMovimientoModal} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMovimiento ? 'Editar' : 'Nuevo'} movimiento</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{mt: 1}}>
              <Grid item xs={12} sm={6}>
                <TextField 
                  select 
                  name="tipoDocumento" 
                  label="Tipo de documento" 
                  value={movimientoForm.tipoDocumento || ''} 
                  onChange={e => setMovimientoForm(prev => ({...prev, tipoDocumento: e.target.value}))} 
                  fullWidth 
                  size="small"
                >
                  {tiposDocumento.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="serie" 
                  label="Serie" 
                  value={movimientoForm.serie || ''} 
                  onChange={e => setMovimientoForm(prev => ({...prev, serie: e.target.value}))} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="numero" 
                  label="Número" 
                  value={movimientoForm.numero || ''} 
                  onChange={e => setMovimientoForm(prev => ({...prev, numero: e.target.value}))} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker 
                  label="Fecha movimiento" 
                  value={movimientoForm.fecha || null} 
                  onChange={date => setMovimientoForm(prev => ({...prev, fecha: date}))} 
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />} 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="imponible" 
                  label="Monto imponible" 
                  value={movimientoForm.imponible || ''} 
                  onChange={handleNumericInputChange}
                  fullWidth 
                  size="small" 
                  type="text"
                  inputMode="decimal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  name="impuestos"
                  label="Impuestos"
                  value={movimientoForm.impuestos || ''}
                  onChange={handleNumericInputChange}
                  fullWidth
                  size="small"
                  type="text"
                  inputMode="decimal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  name="referencia" 
                  label="Referencia" 
                  value={movimientoForm.referencia || ''} 
                  onChange={e => setMovimientoForm(prev => ({...prev, referencia: e.target.value}))} 
                  fullWidth 
                  size="small" 
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMovimientoModal}>CANCELAR</Button>
          <Button onClick={handleGuardarMovimiento} variant="contained">GUARDAR</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Movimiento Modal */}
      <Dialog open={openDeleteMovimientoModal} onClose={handleCloseDeleteMovimientoModal} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar movimiento</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este movimiento? Esta acción no puede deshacerse.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteMovimientoModal}>CANCELAR</Button>
          <Button onClick={handleEliminarMovimiento} color="error" variant="contained">ELIMINAR</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCajaChicaDetalle; 
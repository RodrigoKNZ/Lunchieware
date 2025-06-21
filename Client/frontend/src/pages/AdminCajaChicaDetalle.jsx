import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Divider, IconButton, Breadcrumbs, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, TablePagination
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Edit, Delete, Add } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Mock Data
const cajaData = {
  '0001': {
    numero: '0001',
    fechaApertura: '27/03/2025',
    fechaLiquidacion: '-',
    estado: 'Abierta',
    saldoInicial: 32.30,
    saldoFinal: 10.00,
    observaciones: 'Se compró Papel Bond A4 para el uso de la impresora.',
    movimientos: [
      { id: 1, tipoDocumento: 'Boleta de venta', serie: 'F001', numero: '45613213', referencia: 'Papel Bond A4', fecha: '28/03/2025', imponible: 20.00, impuestos: 2.30, total: 22.30 },
    ]
  }
};

const tiposDocumento = ['Boleta de venta', 'Factura', 'Recibo por honorarios', 'Otro'];

const AdminCajaChicaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = cajaData[id];

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

  const handleOpenMovimientoModal = (movimiento = null) => {
    setSelectedMovimiento(movimiento);
    setMovimientoForm(movimiento ? 
      {...movimiento, imponible: movimiento.imponible.toFixed(2), impuestos: movimiento.impuestos.toFixed(2), fecha: dayjs(movimiento.fecha, "DD/MM/YYYY")} 
      : { tipoDocumento: '', serie: '', numero: '', fecha: null, imponible: '', impuestos: '', referencia: ''}
    );
    setOpenMovimientoModal(true);
  };

  const handleOpenEditModal = () => {
    setEditCajaForm({
      observaciones: data.observaciones
    });
    setOpenEditModal(true);
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

  const handleLiquidarCaja = () => {
    // Aquí iría la lógica para liquidar la caja
    setOpenLiquidarModal(false);
    navigate('/admin/caja-chica');
  };
  
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!data) {
    return <Typography>Caja no encontrada</Typography>;
  }
  
  const paginatedMovimientos = data.movimientos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => setOpenLiquidarModal(true)}>LIQUIDAR CAJA</Button>
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
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenMovimientoModal()}>NUEVO MOVIMIENTO</Button>
        </Box>
        <Divider sx={{ mb: 2 }}/>
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
                <TableCell sx={{width: '10%'}} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMovimientos.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>{mov.tipoDocumento}</TableCell>
                  <TableCell>{mov.serie}</TableCell>
                  <TableCell>{mov.numero}</TableCell>
                  <TableCell>{mov.referencia}</TableCell>
                  <TableCell>{dayjs(mov.fecha, "DD/MM/YYYY").format('DD/MM/YY')}</TableCell>
                  <TableCell align="right">S/. {mov.imponible.toFixed(2)}</TableCell>
                  <TableCell align="right">S/. {mov.impuestos.toFixed(2)}</TableCell>
                  <TableCell align="right">S/. {mov.total.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpenMovimientoModal(mov)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton size="small" onClick={() => handleOpenDeleteMovimientoModal(mov)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.movimientos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Edit Caja Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar datos de la caja chica</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Número de liquidación" defaultValue={data.numero} fullWidth size="small" disabled/>
          <TextField 
            margin="dense"
            label="Saldo inicial"
            defaultValue={data.saldoInicial.toFixed(2)}
            fullWidth
            size="small"
            disabled
            type="text"
            inputMode="decimal"
          />
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
          <Button onClick={() => setOpenEditModal(false)} variant="contained">GUARDAR</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Caja Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar Caja Chica</DialogTitle>
        <DialogContent><Typography>¿Está seguro que desea eliminar esta caja chica?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>CANCELAR</Button>
          <Button onClick={() => setOpenDeleteModal(false)} color="error" variant="contained">ELIMINAR</Button>
        </DialogActions>
      </Dialog>

      {/* Liquidar Caja Modal */}
      <Dialog open={openLiquidarModal} onClose={() => setOpenLiquidarModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Liquidar Caja Chica</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea liquidar esta caja? Esta acción no puede deshacerse.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLiquidarModal(false)}>CANCELAR</Button>
          <Button onClick={handleLiquidarCaja} color="primary" variant="contained">LIQUIDAR</Button>
        </DialogActions>
      </Dialog>

      {/* Movimiento Modal (Add/Edit) */}
      <Dialog open={openMovimientoModal} onClose={handleCloseMovimientoModal} maxWidth="md">
        <DialogTitle>{selectedMovimiento ? 'Editar' : 'Nuevo'} movimiento</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{mt: 1}}>
              <Grid item xs={12} sm={6}>
                <TextField select name="tipoDocumento" label="Tipo de documento" value={movimientoForm.tipoDocumento || ''} onChange={e => setMovimientoForm(prev => ({...prev, tipoDocumento: e.target.value}))} fullWidth size="small">
                  {tiposDocumento.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField name="serie" label="Serie" value={movimientoForm.serie || ''} onChange={e => setMovimientoForm(prev => ({...prev, serie: e.target.value}))} fullWidth size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField name="numero" label="Número" value={movimientoForm.numero || ''} onChange={e => setMovimientoForm(prev => ({...prev, numero: e.target.value}))} fullWidth size="small" /></Grid>
              <Grid item xs={12} sm={6}><DatePicker label="Fecha movimiento" value={movimientoForm.fecha || null} onChange={date => setMovimientoForm(prev => ({...prev, fecha: date}))} renderInput={(params) => <TextField {...params} fullWidth size="small" />} /></Grid>
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
              <Grid item xs={12}><TextField name="referencia" label="Referencia" value={movimientoForm.referencia || ''} onChange={e => setMovimientoForm(prev => ({...prev, referencia: e.target.value}))} fullWidth size="small" /></Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMovimientoModal}>CANCELAR</Button>
          <Button onClick={handleCloseMovimientoModal} variant="contained">GUARDAR</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Movimiento Modal */}
      <Dialog open={openDeleteMovimientoModal} onClose={handleCloseDeleteMovimientoModal} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar movimiento</DialogTitle>
        <DialogContent><Typography>¿Está seguro que desea eliminar este movimiento?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteMovimientoModal}>CANCELAR</Button>
          <Button onClick={handleCloseDeleteMovimientoModal} color="error" variant="contained">ELIMINAR</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCajaChicaDetalle; 
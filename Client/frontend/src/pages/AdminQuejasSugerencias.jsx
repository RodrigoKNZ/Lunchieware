import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, TextField,
  Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Checkbox, Tooltip,
  Dialog, DialogActions, DialogContent, DialogTitle, Alert, Snackbar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import quejasService from '../services/quejasService';
import sugerenciasService from '../services/sugerenciasService';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const QuejasSugerenciasContent = ({ data, isQuejas, onDataChange }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openResolveModal, setOpenResolveModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    // Filtros
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroAsunto, setFiltroAsunto] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);
    const [filtrados, setFiltrados] = useState(data);
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);
    // Estado para saber si los filtros están en su estado inicial
    const filtrosIniciales = {
        codigo: '',
        asunto: '',
        cliente: '',
        estado: 'todos',
        fechaDesde: null,
        fechaHasta: null
    };
    const filtrosEnEstadoInicial =
        filtroCodigo === filtrosIniciales.codigo &&
        filtroAsunto === filtrosIniciales.asunto &&
        filtroCliente === filtrosIniciales.cliente &&
        filtroEstado === filtrosIniciales.estado &&
        (!fechaDesde && !fechaHasta);

    useEffect(() => {
        setFiltrados(data);
        setFiltrosAplicados(false);
    }, [data]);

    useEffect(() => {
        // No hacer nada, solo para que React detecte el cambio y recalcule filtrosEnEstadoInicial
    }, [filtroCodigo, filtroAsunto, filtroCliente, filtroEstado, fechaDesde, fechaHasta]);

    const handleFechaDesde = (date) => {
        setFechaDesde(date ? dayjs(date) : null);
    };
    const handleFechaHasta = (date) => {
        setFechaHasta(date ? dayjs(date) : null);
    };

    const handleAplicarFiltros = () => {
        let resultado = data.filter(item => {
            const matchCodigo = !filtroCodigo || (item.codigo && item.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()));
            const matchAsunto = !filtroAsunto || (item.asunto && item.asunto.toLowerCase().includes(filtroAsunto.toLowerCase()));
            const matchCliente = !filtroCliente || (item.cliente && item.cliente.toLowerCase().includes(filtroCliente.toLowerCase()));
            let matchEstado = true;
            if (isQuejas) {
                matchEstado = filtroEstado === 'todos' ||
                    (filtroEstado === 'resuelta' && item.estado === 'Resuelta') ||
                    (filtroEstado === 'sin_resolver' && item.estado === 'Sin resolver');
            }
            let matchDesde = true, matchHasta = true;
            if (fechaDesde) {
                const fechaItem = dayjs(item.fecha, 'DD/MM/YYYY');
                matchDesde = fechaItem.isSame(fechaDesde.startOf('day'), 'day') || fechaItem.isAfter(fechaDesde.startOf('day'), 'day');
            }
            if (fechaHasta) {
                const fechaItem = dayjs(item.fecha, 'DD/MM/YYYY');
                matchHasta = fechaItem.isSame(fechaHasta.endOf('day'), 'day') || fechaItem.isBefore(fechaHasta.endOf('day'), 'day');
            }
            return matchCodigo && matchAsunto && matchCliente && matchEstado && matchDesde && matchHasta;
        });
        setFiltrados(resultado);
        setPage(0);
        setFiltrosAplicados(true);
    };

    const handleLimpiarFiltros = () => {
        setFiltroCodigo(filtrosIniciales.codigo);
        setFiltroAsunto(filtrosIniciales.asunto);
        setFiltroCliente(filtrosIniciales.cliente);
        setFiltroEstado(filtrosIniciales.estado);
        setFechaDesde(filtrosIniciales.fechaDesde);
        setFechaHasta(filtrosIniciales.fechaHasta);
        setFiltrados(data);
        setPage(0);
        setFiltrosAplicados(false);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = data.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;
    
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDetail = (item) => {
        setCurrentItem(item);
        setOpenDetailModal(true);
    };

    const handleOpenResolve = () => {
        setOpenResolveModal(true);
    };

    const handleResolveQuejas = async () => {
        try {
            setLoading(true);
            const promises = selected.map(id => quejasService.actualizar(id, { resuelto: true }));
            await Promise.all(promises);
            
            setSnackbar({
                open: true,
                message: 'Quejas marcadas como resueltas exitosamente',
                severity: 'success'
            });
            
            setSelected([]);
            setOpenResolveModal(false);
            if (onDataChange) {
                onDataChange();
            }
        } catch (error) {
            console.error('Error resolviendo quejas:', error);
            setSnackbar({
                open: true,
                message: 'Error al marcar las quejas como resueltas',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Paper sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={handleAplicarFiltros} disabled={filtrosEnEstadoInicial || filtrosAplicados}>APLICAR FILTROS</Button>
                    <Button variant="outlined" onClick={handleLimpiarFiltros} disabled={!filtrosAplicados}>LIMPIAR FILTROS</Button>
                </Box>
                {isQuejas && <Button variant="contained" disabled={selected.length === 0} onClick={handleOpenResolve}>MARCAR COMO RESUELTO</Button>}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField label="Código" size="small" sx={{ width: 90 }} value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)} disabled={filtrosAplicados} />
                <TextField label="Asunto" size="small" sx={{flex: 1, minWidth: 220}} value={filtroAsunto} onChange={e => setFiltroAsunto(e.target.value)} disabled={filtrosAplicados} />
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <DatePicker
                        label="Desde"
                        value={fechaDesde}
                        onChange={handleFechaDesde}
                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 120 }} disabled={filtrosAplicados} />} 
                        inputFormat="DD/MM/YYYY"
                    />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <DatePicker
                        label="Hasta"
                        value={fechaHasta}
                        onChange={handleFechaHasta}
                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 120 }} disabled={filtrosAplicados} />} 
                        inputFormat="DD/MM/YYYY"
                    />
                </LocalizationProvider>
                <TextField label="Nombre cliente asociado" size="small" sx={{flex: 1, minWidth: 220}} value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} disabled={filtrosAplicados} />
                {isQuejas && (
                    <FormControl size="small" sx={{ minWidth: 120 }} disabled={filtrosAplicados}>
                        <InputLabel>Estado</InputLabel>
                        <Select label="Estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} disabled={filtrosAplicados}>
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="resuelta">Resuelta</MenuItem>
                            <MenuItem value="sin_resolver">Sin resolver</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {isQuejas && <TableCell padding="checkbox"><Checkbox onChange={handleSelectAllClick} /></TableCell>}
                            <TableCell>Código</TableCell>
                            <TableCell>Asunto</TableCell>
                            <TableCell>Fecha creación</TableCell>
                            <TableCell>Cliente asociado</TableCell>
                            {isQuejas && <TableCell>Estado</TableCell>}
                            <TableCell align="center">Detalle</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            const isItemSelected = isSelected(row.id);
                            return (
                                <TableRow key={row.id} hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                                    {isQuejas && (
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, row.id)} />
                                        </TableCell>
                                    )}
                                    <TableCell>{row.codigo}</TableCell>
                                    <TableCell>{row.asunto}</TableCell>
                                    <TableCell>{row.fecha}</TableCell>
                                    <TableCell>{row.cliente}</TableCell>
                                    {isQuejas && (
                                        <TableCell>
                                            <Box sx={{
                                                bgcolor: row.estado === 'Resuelta' ? 'success.main' : 'error.main',
                                                color: 'white',
                                                px: 1.2, py: 0.2,
                                                borderRadius: '12px',
                                                display: 'inline-block',
                                                fontSize: '0.75rem'
                                            }}>
                                                {row.estado}
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell align="center">
                                        <Tooltip title="Ver detalle">
                                            <IconButton onClick={() => handleOpenDetail(row)}><VisibilityIcon /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filtrados.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
            />
            {/* Modals */}
            <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Detalle de la {isQuejas ? 'queja' : 'sugerencia'}</DialogTitle>
                <DialogContent><Typography>{currentItem?.detalle}</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailModal(false)}>CERRAR</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openResolveModal} onClose={() => setOpenResolveModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Marcar como resuelto</DialogTitle>
                <DialogContent><Typography>¿Está seguro que desea marcar las quejas seleccionadas como resueltas?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResolveModal(false)} disabled={loading}>CANCELAR</Button>
                    <Button onClick={handleResolveQuejas} variant="contained" disabled={loading}>
                        {loading ? 'PROCESANDO...' : 'ACEPTAR'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

const AdminQuejasSugerencias = () => {
  const [tabValue, setTabValue] = useState(0);
  const [quejas, setQuejas] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarQuejas = async () => {
    try {
      const response = await quejasService.obtenerTodas();
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      const quejasFormateadas = data.map(queja => ({
        id: queja.idQueja,
        codigo: queja.codigoQueja || `QJ${queja.idQueja?.toString().padStart(5, '0')}`,
        asunto: queja.asunto,
        fecha: queja.fechaCreacion ? dayjs(queja.fechaCreacion).format('DD/MM/YYYY') : '',
        cliente: queja.nombreCompletoCliente || queja.nombreUsuario || 'Cliente no identificado',
        estado: queja.resuelto ? 'Resuelta' : 'Sin resolver',
        detalle: queja.detalle
      }));
      setQuejas(quejasFormateadas);
    } catch (error) {
      setQuejas([]);
    }
  };

  const cargarSugerencias = async () => {
    try {
      const response = await sugerenciasService.obtenerTodas();
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      const sugerenciasFormateadas = data.map(sugerencia => ({
        id: sugerencia.idSugerencia,
        codigo: sugerencia.codigoSugerencia || `SG${sugerencia.idSugerencia?.toString().padStart(5, '0')}`,
        asunto: sugerencia.asunto,
        fecha: sugerencia.fechaCreacion ? dayjs(sugerencia.fechaCreacion).format('DD/MM/YYYY') : '',
        cliente: sugerencia.nombreCompletoCliente || sugerencia.nombreUsuario || 'Cliente no identificado',
        estado: undefined, // No aplica para sugerencias
        detalle: sugerencia.detalle
      }));
      setSugerencias(sugerenciasFormateadas);
    } catch (error) {
      setSugerencias([]);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([cargarQuejas(), cargarSugerencias()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuejasChange = () => {
    cargarQuejas();
  };

  const handleSugerenciasChange = () => {
    cargarSugerencias();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <HomeIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <ChatBubbleOutlineIcon sx={{ mr: 0.5, fontSize: 20 }} />
            <Typography color="text.primary">Quejas y sugerencias</Typography>
          </Box>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Quejas y sugerencias</Typography>
        <Divider />
      </Box>

      <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Quejas (${quejas.length})`} />
          <Tab label={`Sugerencias (${sugerencias.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <QuejasSugerenciasContent data={quejas} isQuejas={true} onDataChange={handleQuejasChange} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <QuejasSugerenciasContent data={sugerencias} isQuejas={false} onDataChange={handleSugerenciasChange} />
      </TabPanel>
    </React.Fragment>
  );
};

export default AdminQuejasSugerencias; 
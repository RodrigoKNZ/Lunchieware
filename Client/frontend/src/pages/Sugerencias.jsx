import {
  Box, Typography, Breadcrumbs, TextField, Divider, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, useMediaQuery, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Link as RouterLink } from 'react-router-dom';
import TablePagination from '@mui/material/TablePagination';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import dayjs from 'dayjs';
import sugerenciasService from '../services/sugerenciasService';

const estados = [
  { value: 'todos', label: 'Todos' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'sin_resolver', label: 'Sin resolver' },
];

const Sugerencias = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtroAsunto, setFiltroAsunto] = React.useState('');
  const [filtroDesde, setFiltroDesde] = React.useState(null);
  const [filtroHasta, setFiltroHasta] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 4;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuRowIdx, setMenuRowIdx] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const [openModal, setOpenModal] = React.useState(false);
  const [nuevoAsunto, setNuevoAsunto] = React.useState('');
  const [nuevoDetalle, setNuevoDetalle] = React.useState('');
  const [detalleOpen, setDetalleOpen] = React.useState(false);
  const [editarOpen, setEditarOpen] = React.useState(false);
  const [eliminarOpen, setEliminarOpen] = React.useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = React.useState(null);
  const [editAsunto, setEditAsunto] = React.useState('');
  const [editFecha, setEditFecha] = React.useState(dayjs());
  const [editDetalle, setEditDetalle] = React.useState('');
  const [sugerencias, setSugerencias] = React.useState([]);
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = React.useState([]);

  // 1. Estados para filtros y control de bloqueo
  const [filtrosAplicados, setFiltrosAplicados] = React.useState(false);
  const filtrosIniciales = {
    asunto: '',
    desde: null,
    hasta: null,
  };

  // 2. Determinar si los filtros están en su estado inicial
  const filtrosEnEstadoInicial =
    filtroAsunto === filtrosIniciales.asunto &&
    !filtroDesde &&
    !filtroHasta;

  // Función de prueba para verificar comparaciones de fechas
  const probarComparacionFechas = () => {
    console.log('=== PRUEBA DE COMPARACIÓN DE FECHAS ===');
    
    // Ejemplo con fechas conocidas
    const fecha1 = dayjs('2024-01-15');
    const fecha2 = dayjs('2024-01-20');
    
    console.log('Fecha 1:', fecha1.format('YYYY-MM-DD'));
    console.log('Fecha 2:', fecha2.format('YYYY-MM-DD'));
    console.log('¿Fecha 1 es anterior a Fecha 2?', fecha1.isBefore(fecha2, 'day'));
    console.log('¿Fecha 1 es igual o anterior a Fecha 2?', fecha1.isSameOrBefore(fecha2, 'day'));
    console.log('¿Fecha 2 es posterior a Fecha 1?', fecha2.isAfter(fecha1, 'day'));
    console.log('¿Fecha 2 es igual o posterior a Fecha 1?', fecha2.isSameOrAfter(fecha1, 'day'));
    
    // Probar con las fechas reales de las sugerencias
    if (sugerencias.length > 0) {
      console.log('=== PRUEBA CON FECHAS REALES ===');
      const primeraSugerencia = sugerencias[0];
      console.log('Primera sugerencia:', primeraSugerencia);
      console.log('Fecha de sugerencia:', primeraSugerencia.fechaCreacion);
      
      const fechaSugerencia = dayjs(primeraSugerencia.fechaCreacion);
      console.log('Fecha parseada:', fechaSugerencia.format('YYYY-MM-DD'));
      console.log('¿Es válida?', fechaSugerencia.isValid());
      
      if (filtroDesde) {
        const fechaDesde = dayjs(filtroDesde);
        console.log('Filtro desde parseado:', fechaDesde.format('YYYY-MM-DD'));
        console.log('¿Es válida?', fechaDesde.isValid());
        console.log('¿Sugerencia es igual o posterior al filtro desde?', fechaSugerencia.isSameOrAfter(fechaDesde, 'day'));
      }
    }
    
    console.log('=== FIN PRUEBA ===');
  };

  // 3. Lógica de filtrado
  const filtrarSugerencias = () => {
    return sugerencias.filter(s => {
      const matchAsunto = !filtroAsunto || s.asunto.toLowerCase().includes(filtroAsunto.toLowerCase());
      let matchDesde = true, matchHasta = true;
      if (filtroDesde) {
        const fechaS = dayjs(s.fechaCreacion);
        const desde = dayjs(filtroDesde).startOf('day');
        matchDesde = fechaS.isSame(desde, 'day') || fechaS.isAfter(desde, 'day');
      }
      if (filtroHasta) {
        const fechaS = dayjs(s.fechaCreacion);
        const hasta = dayjs(filtroHasta).endOf('day');
        matchHasta = fechaS.isSame(hasta, 'day') || fechaS.isBefore(hasta, 'day');
      }
      return matchAsunto && matchDesde && matchHasta;
    });
  };

  // Función de prueba simple para el botón
  const handleAplicarFiltrosSimple = () => {
    alert('Botón funcionando! Filtros: ' + JSON.stringify({
      asunto: filtroAsunto,
      desde: filtroDesde,
      hasta: filtroHasta
    }));
  };

  // LOGS EN CADA RENDER
  React.useEffect(() => {
    console.log('--- RENDER SUGERENCIAS ---');
    console.log('filtrosAplicados:', filtrosAplicados);
    console.log('filtrosEnEstadoInicial:', filtrosEnEstadoInicial);
    console.log('filtroAsunto:', filtroAsunto);
    console.log('filtroDesde:', filtroDesde);
    console.log('filtroHasta:', filtroHasta);
    console.log('--------------------------');
  });

  // 4. Handlers de botones
  const handleAplicarFiltros = () => {
    setSugerenciasFiltradas(filtrarSugerencias());
    setFiltrosAplicados(true);
  };
  const handleLimpiarFiltros = () => {
    setFiltroAsunto(filtrosIniciales.asunto);
    setFiltroDesde(filtrosIniciales.desde);
    setFiltroHasta(filtrosIniciales.hasta);
    setSugerenciasFiltradas(sugerencias);
    setFiltrosAplicados(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleMenuClick = (event, idx) => {
    setAnchorEl(event.currentTarget);
    setMenuRowIdx(idx);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowIdx(null);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNuevoAsunto('');
    setNuevoDetalle('');
  };

  // Abrir modales de acción
  const handleDetalle = (row) => {
    setSugerenciaSeleccionada(row);
    setDetalleOpen(true);
  };
  const handleEditar = (row) => {
    setSugerenciaSeleccionada(row);
    setEditAsunto(row.asunto);
    setEditFecha(dayjs());
    setEditDetalle(row.detalle || '');
    setEditarOpen(true);
  };
  const handleEliminar = (row) => {
    setSugerenciaSeleccionada(row);
    setEliminarOpen(true);
  };

  // Cargar sugerencias desde la API al montar el componente
  React.useEffect(() => {
    const fetchSugerencias = async () => {
      try {
        const res = await sugerenciasService.obtenerTodas();
        console.log('Sugerencias cargadas del backend:', res.data);
        console.log('Ejemplo de fecha de sugerencia:', res.data[0]?.fechaCreacion);
        console.log('Tipo de fecha:', typeof res.data[0]?.fechaCreacion);
        // Validar que res.data sea un array
        const sugerenciasData = Array.isArray(res.data) ? res.data : [];
        setSugerencias(sugerenciasData);
        setSugerenciasFiltradas(sugerenciasData);
      } catch (err) {
        console.error('Error cargando sugerencias:', err);
        setSugerencias([]);
        setSugerenciasFiltradas([]);
      }
    };
    fetchSugerencias();
  }, []);

  // Crear sugerencia
  const handleCrearSugerencia = async () => {
    try {
      // Obtener el usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem('user') || '{}');
      const idUsuario = usuarioLogueado.id;
      
      if (!idUsuario) {
        alert('Error: No se pudo obtener la información del usuario');
        return;
      }
      
      // Crear sugerencia sin código primero
      const nueva = {
        asunto: nuevoAsunto,
        detalle: nuevoDetalle,
        idUsuario
      };
      
      const respuesta = await sugerenciasService.crear(nueva);
      console.log('Respuesta de creación:', respuesta); // Para debugging
      
      // Generar código basado en el ID de la sugerencia creada
      const idSugerencia = respuesta.data.idSugerencia;
      const codigoSugerencia = idSugerencia.toString().padStart(5, '0');
      
      console.log('ID generado:', idSugerencia, 'Código:', codigoSugerencia); // Para debugging
      
      // Actualizar la sugerencia con el código generado
      await sugerenciasService.actualizar(idSugerencia, {
        codigoSugerencia,
        asunto: nuevoAsunto,
        detalle: nuevoDetalle,
        activo: true
      });
      
      // Recargar sugerencias
      const res = await sugerenciasService.obtenerTodas();
      const sugerenciasData = Array.isArray(res.data) ? res.data : [];
      setSugerencias(sugerenciasData);
      setSugerenciasFiltradas(sugerenciasData);
      handleCloseModal();
    } catch (err) {
      console.error('Error al crear sugerencia:', err);
      alert('Error al registrar sugerencia');
    }
  };

  // Editar sugerencia
  const handleGuardarEdicion = async () => {
    try {
      await sugerenciasService.actualizar(sugerenciaSeleccionada.idSugerencia, {
        codigoSugerencia: sugerenciaSeleccionada.codigoSugerencia,
        asunto: editAsunto,
        detalle: editDetalle,
        activo: true
      });
      const res = await sugerenciasService.obtenerTodas();
      const sugerenciasData = Array.isArray(res.data) ? res.data : [];
      setSugerencias(sugerenciasData);
      setSugerenciasFiltradas(sugerenciasData);
      setEditarOpen(false);
      setSugerenciaSeleccionada(null);
    } catch (err) {
      alert('Error al editar sugerencia');
    }
  };

  // Eliminar sugerencia
  const handleConfirmarEliminar = async () => {
    try {
      await sugerenciasService.eliminar(sugerenciaSeleccionada.idSugerencia);
      const res = await sugerenciasService.obtenerTodas();
      const sugerenciasData = Array.isArray(res.data) ? res.data : [];
      setSugerencias(sugerenciasData);
      setSugerenciasFiltradas(sugerenciasData);
      setEliminarOpen(false);
      setSugerenciaSeleccionada(null);
    } catch (err) {
      alert('Error al eliminar sugerencia');
    }
  };

  // 6. Cambiar fuente de datos de la tabla
  const rowsToShow = sugerenciasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%', p: 0, pl: isMobile ? 1 : 3, pb: { xs: 7, md: 0 } }}>
      {!isMobile && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/inicio" size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <HomeIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography color="text.primary">Sugerencias</Typography>
        </Breadcrumbs>
      )}
      <Typography variant="h4" fontWeight={500} sx={{ mb: 1, textAlign: 'left', mt: isMobile ? 2 : 0 }}>
        Mis sugerencias
      </Typography>
      <Divider sx={{ mb: 4, width: '100%' }} />
      {/* Filtros en una fila */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2, alignItems: isMobile ? 'stretch' : 'center', width: '100%', maxWidth: 900 }}>
        <TextField
          label="Buscar por asunto"
          value={filtroAsunto}
          onChange={e => setFiltroAsunto(e.target.value)}
          size="small"
          fullWidth={isMobile}
          sx={{ minWidth: isMobile ? 'unset' : 320, flex: 2, height: 40 }}
          disabled={filtrosAplicados}
        />
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Desde"
                value={filtroDesde}
                onChange={setFiltroDesde}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicados}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHasta}
                onChange={setFiltroHasta}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicados}
              />
            </LocalizationProvider>
          </Box>
        ) : (
          <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Desde"
                value={filtroDesde}
                onChange={setFiltroDesde}
                renderInput={(params) => <TextField {...params} size="small" fullWidth={isMobile} sx={{ minWidth: 180, height: 40 }} />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicados}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHasta}
                onChange={setFiltroHasta}
                renderInput={(params) => <TextField {...params} size="small" fullWidth={isMobile} sx={{ minWidth: 180, height: 40 }} />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicados}
              />
            </LocalizationProvider>
          </>
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            width: isMobile ? '100%' : 200,
            minWidth: isMobile ? 'unset' : 200,
            height: 40,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: 15,
            bgcolor: '#1976d2',
            boxShadow: isMobile ? 1 : 0,
            textTransform: 'none',
            ml: isMobile ? 0 : 'auto',
            mt: isMobile ? 2 : 0,
            px: isMobile ? undefined : 3,
            whiteSpace: isMobile ? undefined : 'nowrap',
          }}
          onClick={handleOpenModal}
          disabled={filtrosAplicados}
        >
          Nueva sugerencia
        </Button>
      </Box>
      {/* Botones de filtros en una fila aparte */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, width: '100%', maxWidth: 900 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ fontWeight: 600, minWidth: 140, height: 40 }}
          disabled={filtrosEnEstadoInicial || filtrosAplicados}
          onClick={() => {
            console.log('RENDER botón aplicar:', { filtrosEnEstadoInicial, filtrosAplicados });
            handleAplicarFiltros();
          }}
        >
          Aplicar filtros
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600, minWidth: 140, height: 40 }}
          disabled={filtrosEnEstadoInicial || !filtrosAplicados}
          onClick={() => {
            console.log('RENDER botón limpiar:', { filtrosEnEstadoInicial, filtrosAplicados });
            handleLimpiarFiltros();
          }}
        >
          Limpiar filtros
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ maxWidth: 900, mx: 'auto', boxShadow: 2, maxHeight: 480, overflowY: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'} stickyHeader>
          <TableHead>
            <TableRow>
              {!isMobile && <TableCell>Código</TableCell>}
              <TableCell>Asunto</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">{isMobile ? 'Acciones' : 'Detalle'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsToShow.map((row, idx) => (
              <TableRow key={idx}>
                {!isMobile && <TableCell>{row.codigoSugerencia}</TableCell>}
                <TableCell>{row.asunto}</TableCell>
                <TableCell>{row.fechaCreacion ? new Date(row.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
                <TableCell align="center">
                  {isMobile ? (
                    <>
                      <IconButton size="small" onClick={e => handleMenuClick(e, idx)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={openMenu && menuRowIdx === idx}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem onClick={() => { handleDetalle(row); handleMenuClose(); }}>Detalle</MenuItem>
                        <MenuItem onClick={() => { handleEditar(row); handleMenuClose(); }}>Editar</MenuItem>
                        <MenuItem onClick={() => { handleEliminar(row); handleMenuClose(); }}>Eliminar</MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton size="small" color="default" onClick={() => handleDetalle(row)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="default" onClick={() => handleEditar(row)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="default" onClick={() => handleEliminar(row)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={sugerenciasFiltradas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>
          Registrar nueva sugerencia
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Asunto"
            placeholder="Ingrese el asunto de la sugerencia"
            value={nuevoAsunto}
            onChange={e => setNuevoAsunto(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Detalle"
            placeholder="Ingrese el detalle de la sugerencia"
            value={nuevoDetalle}
            onChange={e => setNuevoDetalle(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={4}
          />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="primary" sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleCrearSugerencia} color="primary" sx={{ fontWeight: 600 }} disabled={!nuevoAsunto || !nuevoDetalle}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal Detalle */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>
          Detalle de sugerencia
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {sugerenciaSeleccionada && (
            <Box>
              <TextField
                label="Código"
                value={sugerenciaSeleccionada.codigoSugerencia || ''}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Asunto"
                value={sugerenciaSeleccionada.asunto || ''}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Fecha"
                value={sugerenciaSeleccionada.fechaCreacion ? new Date(sugerenciaSeleccionada.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Detalle"
                value={sugerenciaSeleccionada.detalle || 'Sin detalle'}
                fullWidth
                margin="normal"
                multiline
                minRows={4}
                disabled
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setDetalleOpen(false)} color="primary" sx={{ fontWeight: 600 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal Editar */}
      <Dialog open={editarOpen} onClose={() => setEditarOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>
          Editar sugerencia
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Código"
            value={sugerenciaSeleccionada?.codigoSugerencia || ''}
            fullWidth
            margin="normal"
            size="small"
            disabled
          />
          <TextField
            label="Asunto"
            value={editAsunto}
            onChange={e => setEditAsunto(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Fecha"
            value={sugerenciaSeleccionada?.fechaCreacion ? new Date(sugerenciaSeleccionada.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'}
            fullWidth
            margin="normal"
            size="small"
            disabled
          />
          <TextField
            label="Detalle"
            value={editDetalle}
            onChange={e => setEditDetalle(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={4}
          />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEditarOpen(false)} color="primary" sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleGuardarEdicion} color="primary" sx={{ fontWeight: 600 }} disabled={!editAsunto || !editDetalle}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal Eliminar */}
      <Dialog open={eliminarOpen} onClose={() => setEliminarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 1 }}>
          Eliminar sugerencia
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta sugerencia?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEliminarOpen(false)} color="primary" sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmarEliminar} color="error" sx={{ fontWeight: 600 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sugerencias; 
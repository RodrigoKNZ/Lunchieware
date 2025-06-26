import {
  Box, Typography, Breadcrumbs, TextField, Divider, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, useMediaQuery, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Link as RouterLink } from 'react-router-dom';
import TablePagination from '@mui/material/TablePagination';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Menu from '@mui/material/Menu';
import quejasService from '../services/quejasService';

const estados = [
  { value: 'todos', label: 'Todos' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'sin_resolver', label: 'Sin resolver' },
];

const tipos = [
  { value: 'todos', label: 'Todos' },
  { value: 'financiero', label: 'Financiero' },
  { value: 'servicio', label: 'Servicio' },
];

const Quejas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtroAsunto, setFiltroAsunto] = React.useState('');
  const [filtroDesde, setFiltroDesde] = React.useState(null);
  const [filtroHasta, setFiltroHasta] = React.useState(null);
  const [filtroTipo, setFiltroTipo] = React.useState('todos');
  const [filtroEstado, setFiltroEstado] = React.useState('todos');
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 4;

  // 1. Estados para filtros y control de bloqueo
  const [filtrosAplicados, setFiltrosAplicados] = React.useState(false);
  const filtrosIniciales = {
    asunto: '',
    desde: null,
    hasta: null,
    estado: 'todos',
  };

  // 2. Determinar si los filtros están en su estado inicial
  const filtrosEnEstadoInicial =
    filtroAsunto === filtrosIniciales.asunto &&
    !filtroDesde &&
    !filtroHasta &&
    (filtroEstado === filtrosIniciales.estado || filtroEstado === '' || !filtroEstado);

  // 3. Lógica de filtrado
  const filtrarQuejas = () => {
    return quejas.filter(q => {
      const matchAsunto = !filtroAsunto || q.asunto.toLowerCase().includes(filtroAsunto.toLowerCase());
      const matchEstado = !filtroEstado || filtroEstado === 'todos' || (filtroEstado === 'resuelto' ? q.resuelto : !q.resuelto);
      let matchDesde = true, matchHasta = true;
      if (filtroDesde) {
        const fechaQ = dayjs(q.fechaCreacion);
        const desde = dayjs(filtroDesde).startOf('day');
        matchDesde = fechaQ.isSame(desde, 'day') || fechaQ.isAfter(desde, 'day');
      }
      if (filtroHasta) {
        const fechaQ = dayjs(q.fechaCreacion);
        const hasta = dayjs(filtroHasta).endOf('day');
        matchHasta = fechaQ.isSame(hasta, 'day') || fechaQ.isBefore(hasta, 'day');
      }
      return matchAsunto && matchEstado && matchDesde && matchHasta;
    });
  };

  const [quejas, setQuejas] = React.useState([]);
  const [quejasFiltradas, setQuejasFiltradas] = React.useState([]);

  // 4. Handlers de botones
  const handleAplicarFiltros = () => {
    setQuejasFiltradas(filtrarQuejas());
    setFiltrosAplicados(true);
  };
  const handleLimpiarFiltros = () => {
    setFiltroAsunto(filtrosIniciales.asunto);
    setFiltroDesde(filtrosIniciales.desde);
    setFiltroHasta(filtrosIniciales.hasta);
    setFiltroEstado(filtrosIniciales.estado);
    setQuejasFiltradas(quejas);
    setFiltrosAplicados(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Paginación
  const rowsToShow = quejasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const [detalleOpen, setDetalleOpen] = React.useState(false);
  const [editarOpen, setEditarOpen] = React.useState(false);
  const [eliminarOpen, setEliminarOpen] = React.useState(false);
  const [quejaSeleccionada, setQuejaSeleccionada] = React.useState(null);
  const [editAsunto, setEditAsunto] = React.useState('');
  const [editDetalle, setEditDetalle] = React.useState('');

  const handleDetalle = (row) => {
    setQuejaSeleccionada(row);
    setDetalleOpen(true);
  };
  const handleEditar = (row) => {
    setQuejaSeleccionada(row);
    setEditAsunto(row.asunto);
    setEditDetalle(row.detalle || '');
    setEditarOpen(true);
  };
  const handleEliminar = (row) => {
    setQuejaSeleccionada(row);
    setEliminarOpen(true);
  };

  const [openModal, setOpenModal] = React.useState(false);
  const [nuevoAsunto, setNuevoAsunto] = React.useState('');
  const [nuevoDetalle, setNuevoDetalle] = React.useState('');
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNuevoAsunto('');
    setNuevoDetalle('');
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuRowIdx, setMenuRowIdx] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event, idx) => {
    setAnchorEl(event.currentTarget);
    setMenuRowIdx(idx);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowIdx(null);
  };

  // Cargar quejas desde la API al montar el componente
  React.useEffect(() => {
    const fetchQuejas = async () => {
      try {
        const res = await quejasService.obtenerTodas();
        console.log('Quejas cargadas del backend:', res.data);
        setQuejas(res.data);
        setQuejasFiltradas(res.data);
      } catch (err) {
        console.error('Error cargando quejas:', err);
        setQuejas([]);
        setQuejasFiltradas([]);
      }
    };
    fetchQuejas();
  }, []);

  // Crear queja
  const handleCrearQueja = async () => {
    try {
      // Obtener el usuario logueado desde localStorage
      const usuarioLogueado = JSON.parse(localStorage.getItem('user') || '{}');
      const idUsuario = usuarioLogueado.id;
      
      if (!idUsuario) {
        alert('Error: No se pudo obtener la información del usuario');
        return;
      }
      
      // Crear queja sin código primero
      const nueva = {
        asunto: nuevoAsunto,
        detalle: nuevoDetalle,
        idUsuario
      };
      
      const respuesta = await quejasService.crear(nueva);
      console.log('Respuesta de creación:', respuesta);
      
      // Generar código basado en el ID de la queja creada
      const idQueja = respuesta.data.idQueja;
      const codigoQueja = idQueja.toString().padStart(5, '0');
      
      console.log('ID generado:', idQueja, 'Código:', codigoQueja);
      
      // Actualizar la queja con el código generado
      await quejasService.actualizar(idQueja, {
        codigoQueja,
        asunto: nuevoAsunto,
        detalle: nuevoDetalle,
        resuelto: false,
        activo: true
      });
      
      // Recargar quejas
      const res = await quejasService.obtenerTodas();
      setQuejas(res.data);
      setQuejasFiltradas(res.data);
      handleCloseModal();
    } catch (err) {
      console.error('Error al crear queja:', err);
      alert('Error al registrar queja');
    }
  };

  // Editar queja
  const handleGuardarEdicion = async () => {
    try {
      await quejasService.actualizar(quejaSeleccionada.idQueja, {
        codigoQueja: quejaSeleccionada.codigoQueja,
        asunto: editAsunto,
        detalle: editDetalle,
        resuelto: quejaSeleccionada.resuelto,
        activo: true
      });
      const res = await quejasService.obtenerTodas();
      setQuejas(res.data);
      setQuejasFiltradas(res.data);
      setEditarOpen(false);
      setQuejaSeleccionada(null);
    } catch (err) {
      alert('Error al editar queja');
    }
  };

  // Eliminar queja
  const handleConfirmarEliminar = async () => {
    try {
      await quejasService.eliminar(quejaSeleccionada.idQueja);
      const res = await quejasService.obtenerTodas();
      setQuejas(res.data);
      setQuejasFiltradas(res.data);
      setEliminarOpen(false);
      setQuejaSeleccionada(null);
    } catch (err) {
      alert('Error al eliminar queja');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 0, pl: isMobile ? 1 : 3, pb: { xs: 7, md: 0 } }}>
      {!isMobile && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/inicio" size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <HomeIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography color="text.primary">Quejas</Typography>
        </Breadcrumbs>
      )}
      <Typography variant="h4" fontWeight={500} sx={{ mb: 1, textAlign: 'left', mt: isMobile ? 2 : 0 }}>
        Mis quejas
      </Typography>
      <Divider sx={{ mb: 4, width: '100%' }} />
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        mb: 2,
        alignItems: isMobile ? 'stretch' : 'center',
        width: '100%',
        maxWidth: 900,
      }}>
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
        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 140, width: isMobile ? '100%' : 140 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            label="Estado"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            disabled={filtrosAplicados}
          >
            {estados.map(e => (
              <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            width: isMobile ? '100%' : 160,
            minWidth: isMobile ? 'unset' : 160,
            height: 40,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: 15,
            bgcolor: '#1976d2',
            boxShadow: isMobile ? 1 : 0,
            textTransform: 'none',
            ml: isMobile ? 0 : 'auto',
            mt: isMobile ? 2 : 0,
          }}
          onClick={handleOpenModal}
          disabled={filtrosAplicados}
        >
          Nueva queja
        </Button>
      </Box>
      {/* Botones de filtros en una fila aparte */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, width: '100%', maxWidth: 900 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ fontWeight: 600, minWidth: 140, height: 40 }}
          disabled={filtrosEnEstadoInicial || filtrosAplicados}
          onClick={handleAplicarFiltros}
        >
          Aplicar filtros
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600, minWidth: 140, height: 40 }}
          disabled={filtrosEnEstadoInicial || !filtrosAplicados}
          onClick={handleLimpiarFiltros}
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
              <TableCell>Estado</TableCell>
              <TableCell align="center">Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsToShow.map((row, idx) => (
              <TableRow key={idx}>
                {!isMobile && <TableCell>{row.codigoQueja || 'N/A'}</TableCell>}
                <TableCell sx={isMobile ? { py: 0.5 } : {}}>{row.asunto}</TableCell>
                <TableCell sx={isMobile ? { py: 0.2 } : {}}>
                  {isMobile 
                    ? (dayjs(row.fechaCreacion).format('DD/MM/YY')) 
                    : dayjs(row.fechaCreacion).format('DD/MM/YYYY')
                  }
                </TableCell>
                <TableCell sx={isMobile ? { py: 0.2 } : {}}>
                  <Box sx={{
                    display: 'inline-block',
                    px: isMobile ? 1 : 1.5,
                    py: isMobile ? 0.2 : 0.5,
                    borderRadius: 2,
                    bgcolor: row.resuelto ? '#43a047' : '#e53935',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: isMobile ? 11 : 13
                  }}>
                    {row.resuelto ? 'Resuelto' : 'Sin resolver'}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={isMobile ? { py: 0.2 } : {}}>
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
          count={quejasFiltradas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>
          Detalle de queja
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {quejaSeleccionada && (
            <Box>
              <TextField
                label="Código"
                value={quejaSeleccionada.codigoQueja || 'N/A'}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Asunto"
                value={quejaSeleccionada.asunto}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Fecha"
                value={dayjs(quejaSeleccionada.fechaCreacion).format('DD/MM/YYYY')}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Estado"
                value={quejaSeleccionada.resuelto ? 'Resuelto' : 'Sin resolver'}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Detalle"
                value={quejaSeleccionada.detalle || ''}
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
      <Dialog open={editarOpen} onClose={() => setEditarOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>
          Editar queja
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Código"
            value={quejaSeleccionada?.codigoQueja || 'N/A'}
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
            value={quejaSeleccionada ? dayjs(quejaSeleccionada.fechaCreacion).format('DD/MM/YYYY') : ''}
            fullWidth
            margin="normal"
            size="small"
            disabled
          />
          <TextField
            label="Estado"
            value={quejaSeleccionada?.resuelto ? 'Resuelto' : 'Sin resolver'}
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
      <Dialog open={eliminarOpen} onClose={() => setEliminarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 1 }}>
          Eliminar queja
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta queja?
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
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1 }}>
          Registrar nueva queja
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Asunto"
            placeholder="Ingrese el asunto de la queja"
            value={nuevoAsunto}
            onChange={e => setNuevoAsunto(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
          />
          <TextField
            label="Detalle"
            placeholder="Ingrese el detalle de la queja"
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
          <Button onClick={handleCrearQueja} color="primary" sx={{ fontWeight: 600 }} disabled={!nuevoAsunto || !nuevoDetalle}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Quejas; 
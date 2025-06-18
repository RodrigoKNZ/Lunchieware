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

const dataPrueba = [
  { codigo: '0321321', asunto: 'Conseguir un microondas adicional', fecha: '02/08/2025' },
  { codigo: '0321312', asunto: 'Ampliar los espacios', fecha: '02/08/2025' },
  { codigo: '0213213', asunto: 'Más variedad de platos', fecha: '02/08/2025' },
  { codigo: '2132421', asunto: 'Acerca de la atención', fecha: '02/08/2025' },
  { codigo: '5342123', asunto: 'Acerca del postre', fecha: '02/08/2025' },
  { codigo: '5412312', asunto: 'Acerca de los refrescos', fecha: '02/08/2025' },
  { codigo: '1254231', asunto: 'Acerca de  las entradas', fecha: '02/08/2025' },
  { codigo: '2312257', asunto: 'Opciones veganas', fecha: '02/08/2025' },
  { codigo: '1235126', asunto: 'Opciones sin gluten', fecha: '02/08/2025' },
];

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

  // Para la edición local de sugerencias (solo para demo)
  const [sugerencias, setSugerencias] = React.useState(dataPrueba);

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

  // 3. Lógica de filtrado
  const filtrarSugerencias = () => {
    return sugerencias.filter(s => {
      const matchAsunto = !filtroAsunto || s.asunto.toLowerCase().includes(filtroAsunto.toLowerCase());
      let matchDesde = true, matchHasta = true;
      if (filtroDesde) {
        const fechaS = dayjs(s.fecha, 'DD/MM/YYYY');
        matchDesde = fechaS.isSameOrAfter(dayjs(filtroDesde), 'day');
      }
      if (filtroHasta) {
        const fechaS = dayjs(s.fecha, 'DD/MM/YYYY');
        matchHasta = fechaS.isSameOrBefore(dayjs(filtroHasta), 'day');
      }
      return matchAsunto && matchDesde && matchHasta;
    });
  };
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = React.useState(sugerencias);

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
  // Guardar edición (solo demo)
  const handleGuardarEdicion = () => {
    setSugerencias(prev => prev.map(s =>
      s.codigo === sugerenciaSeleccionada.codigo
        ? { ...s, asunto: editAsunto, fecha: editFecha.format('DD/MM/YYYY'), detalle: editDetalle }
        : s
    ));
    setEditarOpen(false);
    setSugerenciaSeleccionada(null);
  };
  // Eliminar sugerencia (solo demo)
  const handleConfirmarEliminar = () => {
    setSugerencias(prev => prev.filter(s => s.codigo !== sugerenciaSeleccionada.codigo));
    setEliminarOpen(false);
    setSugerenciaSeleccionada(null);
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
      {/* Filtros y botón de nueva sugerencia en una sola fila en desktop, en columna en móvil */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        mb: 1,
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
                renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                inputFormat="DD/MM/YYYY"
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHasta}
                onChange={setFiltroHasta}
                renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                inputFormat="DD/MM/YYYY"
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
                renderInput={(params) => <TextField {...params} size="small" fullWidth={isMobile} sx={{ minWidth: 180, height: 40 }} disabled={filtrosAplicados} />}
                inputFormat="DD/MM/YYYY"
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHasta}
                onChange={setFiltroHasta}
                renderInput={(params) => <TextField {...params} size="small" fullWidth={isMobile} sx={{ minWidth: 180, height: 40 }} disabled={filtrosAplicados} />}
                inputFormat="DD/MM/YYYY"
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
        >
          Nueva sugerencia
        </Button>
      </Box>
      {/* Segunda fila: botones de filtros */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, width: '100%', maxWidth: 900 }}>
        <Button variant="contained" color="primary" sx={{ fontWeight: 600 }}
          disabled={filtrosEnEstadoInicial || filtrosAplicados}
          onClick={handleAplicarFiltros}
        >Aplicar filtros</Button>
        <Button variant="outlined" color="primary" sx={{ fontWeight: 600 }}
          disabled={filtrosEnEstadoInicial || !filtrosAplicados}
          onClick={handleLimpiarFiltros}
        >Limpiar filtros</Button>
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
                {!isMobile && <TableCell>{row.codigo}</TableCell>}
                <TableCell>{row.asunto}</TableCell>
                <TableCell>{row.fecha}</TableCell>
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
          <Button onClick={handleCloseModal} color="primary" sx={{ fontWeight: 600 }} disabled={!nuevoAsunto || !nuevoDetalle}>
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
                value={sugerenciaSeleccionada.codigo}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Asunto"
                value={sugerenciaSeleccionada.asunto}
                fullWidth
                margin="normal"
                size="small"
                disabled
              />
              <TextField
                label="Fecha"
                value={sugerenciaSeleccionada.fecha}
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
            value={sugerenciaSeleccionada?.codigo || ''}
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
            value={sugerenciaSeleccionada?.fecha || ''}
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
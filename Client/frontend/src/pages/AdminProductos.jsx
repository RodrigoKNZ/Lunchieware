import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Tooltip, Breadcrumbs, TablePagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { Link as RouterLink } from 'react-router-dom';

// Datos de prueba
const productsData = [
  { id: 1, code: '0001', name: 'Menú', shortName: 'Menú', type: 'Menú', cost: 12.00, igv: 'No', status: 'Disponible' },
  { id: 2, code: '0002', name: 'Plato a la carta', shortName: 'Plato carta', type: 'Plato a la carta', cost: 18.00, igv: 'No', status: 'Disponible' },
  { id: 3, code: '0003', name: 'Taper Menú', shortName: 'Taper', type: 'Diversos', cost: 10.00, igv: 'No', status: 'Disponible' },
  { id: 4, code: '0004', name: 'Entrada Menú', shortName: 'Entrada', type: 'Diversos', cost: 4.00, igv: 'No', status: 'No Disponible' },
  { id: 5, code: '0005', name: 'Plato de fondo Menú', shortName: 'Plato fondo', type: 'Diversos', cost: 10.00, igv: 'No', status: 'Disponible' },
  { id: 6, code: '0006', name: 'Postre Menú', shortName: 'Postre', type: 'Diversos', cost: 2.00, igv: 'No', status: 'Disponible' },
  { id: 7, code: '0007', name: 'Refresco Menú', shortName: 'Refresco', type: 'Diversos', cost: 1.00, igv: 'No', status: 'Disponible' },
  { id: 8, code: '0008', name: 'Servicio Delivery', shortName: 'Delivery', type: 'Diversos', cost: 3.00, igv: 'Sí', status: 'Disponible' },
  { id: 9, code: '0009', name: 'Gaseosa Personal', shortName: 'Gaseosa', type: 'Diversos', cost: 2.50, igv: 'Sí', status: 'Disponible' },
  { id: 10, code: '0010', name: 'Agua Mineral', shortName: 'Agua', type: 'Diversos', cost: 2.00, igv: 'Sí', status: 'No Disponible' },
  { id: 11, code: '0011', name: 'Porción de Arroz', shortName: 'Arroz', type: 'Diversos', cost: 3.00, igv: 'No', status: 'Disponible' },
  { id: 12, code: '0012', name: 'Ensalada Adicional', shortName: 'Ensalada', type: 'Diversos', cost: 5.00, igv: 'No', status: 'Disponible' },
  { id: 13, code: '0013', name: 'Jugo Especial', shortName: 'Jugo', type: 'Diversos', cost: 8.00, igv: 'Sí', status: 'Disponible' },
];

const AdminProductos = () => {
  // Estados para datos
  const [productos, setProductos] = useState(productsData);
  const [productosFiltrados, setProductosFiltrados] = useState(productsData);

  // Estados para filtros
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroNombreCorto, setFiltroNombreCorto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos');

  // Estados de control de filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const filtrosIniciales = {
    codigo: '',
    nombre: '',
    nombreCorto: '',
    tipo: 'todos',
    disponibilidad: 'todos',
  };
  const filtrosEnEstadoInicial =
    filtroCodigo === filtrosIniciales.codigo &&
    filtroNombre === filtrosIniciales.nombre &&
    filtroNombreCorto === filtrosIniciales.nombreCorto &&
    filtroTipo === filtrosIniciales.tipo &&
    filtroDisponibilidad === filtrosIniciales.disponibilidad;

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para modales
  const [nuevoModalOpen, setNuevoModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [eliminarModalOpen, setEliminarModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estados para campos de modales
  const [nuevoProducto, setNuevoProducto] = useState({ name: '', shortName: '', type: '', cost: '', igv: 'No', status: 'Disponible' });
  const [editProducto, setEditProducto] = useState({ id: null, code: '', name: '', shortName: '', type: '', cost: '', igv: 'No', status: 'Disponible' });

  // Lógica de filtros
  const handleAplicarFiltros = () => {
    let filtrados = productos.filter(p => {
      const matchCodigo = !filtroCodigo || p.code.toLowerCase().includes(filtroCodigo.toLowerCase());
      const matchNombre = !filtroNombre || p.name.toLowerCase().includes(filtroNombre.toLowerCase());
      const matchNombreCorto = !filtroNombreCorto || p.shortName.toLowerCase().includes(filtroNombreCorto.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || p.type === filtroTipo;
      const matchDisponibilidad = filtroDisponibilidad === 'todos' || p.status === filtroDisponibilidad;
      return matchCodigo && matchNombre && matchNombreCorto && matchTipo && matchDisponibilidad;
    });
    setProductosFiltrados(filtrados);
    setFiltrosAplicados(true);
    setPage(0);
  };

  const handleLimpiarFiltros = () => {
    setFiltroCodigo(filtrosIniciales.codigo);
    setFiltroNombre(filtrosIniciales.nombre);
    setFiltroNombreCorto(filtrosIniciales.nombreCorto);
    setFiltroTipo(filtrosIniciales.tipo);
    setFiltroDisponibilidad(filtrosIniciales.disponibilidad);
    setProductosFiltrados(productos);
    setFiltrosAplicados(false);
    setPage(0);
  };

  // Lógica de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const paginatedProducts = productosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handlers para modales
  const handleNuevo = () => {
    setNuevoProducto({ name: '', shortName: '', type: '', cost: '', igv: 'No', status: 'Disponible' });
    setNuevoModalOpen(true);
  };

  const handleGuardarNuevo = () => {
    const nuevo = {
      ...nuevoProducto,
      id: Math.max(...productos.map(p => p.id)) + 1,
      code: String(Math.max(...productos.map(p => parseInt(p.code))) + 1).padStart(4, '0'),
      cost: parseFloat(nuevoProducto.cost) || 0,
    };
    setProductos(prev => [...prev, nuevo]);
    setProductosFiltrados(prev => [...prev, nuevo]);
    setNuevoModalOpen(false);
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setEditProducto(producto);
    setEditarModalOpen(true);
  };

  const handleGuardarEdicion = () => {
    const actualizados = productos.map(p => p.id === editProducto.id ? { ...editProducto, cost: parseFloat(editProducto.cost) || 0 } : p);
    setProductos(actualizados);
    setProductosFiltrados(actualizados);
    setEditarModalOpen(false);
    setProductoSeleccionado(null);
  };

  const handleEliminar = (producto) => {
    setProductoSeleccionado(producto);
    setEliminarModalOpen(true);
  };

  const handleConfirmarEliminar = () => {
    const filtrados = productos.filter(p => p.id !== productoSeleccionado.id);
    setProductos(filtrados);
    setProductosFiltrados(filtrados);
    setEliminarModalOpen(false);
    setProductoSeleccionado(null);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafbfc', p: 0, display: 'flex', flexDirection: 'column' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2, mt: 1, ml: 4 }}>
        <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}>
          <HomeIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
          <WidgetsIcon sx={{ mr: 0.5, fontSize: 20 }} />
          <Typography color="text.primary">Productos</Typography>
        </Box>
      </Breadcrumbs>
      <Typography variant="h4" fontWeight={600} sx={{ ml: 4, mb: 2 }}>Productos</Typography>
      <Divider sx={{ mb: 3, ml: 4, mr: 4 }} />

      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', m: 4, mt: 0 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" sx={{ fontWeight: 600 }} onClick={handleAplicarFiltros} disabled={filtrosEnEstadoInicial || filtrosAplicados}>APLICAR FILTROS</Button>
              <Button variant="outlined" sx={{ fontWeight: 600 }} onClick={handleLimpiarFiltros} disabled={!filtrosAplicados}>LIMPIAR FILTROS</Button>
            </Box>
            <Button variant="contained" color="primary" sx={{ fontWeight: 600 }} onClick={handleNuevo} disabled={filtrosAplicados}>+ NUEVO PRODUCTO</Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField label="Código" size="small" value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)} disabled={filtrosAplicados} sx={{ width: 100 }}/>
            <TextField label="Nombre del producto" size="small" placeholder="Ingrese el nombre" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} disabled={filtrosAplicados} sx={{ flexGrow: 1, minWidth: 200 }} />
            <TextField label="Nombre corto" size="small" value={filtroNombreCorto} onChange={e => setFiltroNombreCorto(e.target.value)} disabled={filtrosAplicados} sx={{ width: 150 }}/>
            <FormControl size="small" disabled={filtrosAplicados} sx={{ width: 180 }}>
              <InputLabel>Tipo de producto</InputLabel>
              <Select label="Tipo de producto" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="Menú">Menú</MenuItem>
                <MenuItem value="Plato a la carta">Plato a la carta</MenuItem>
                <MenuItem value="Diversos">Diversos</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" disabled={filtrosAplicados} sx={{ width: 150 }}>
              <InputLabel>Disponibilidad</InputLabel>
              <Select label="Disponibilidad" value={filtroDisponibilidad} onChange={e => setFiltroDisponibilidad(e.target.value)}>
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="Disponible">Disponible</MenuItem>
                <MenuItem value="No Disponible">No Disponible</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ width: '5%' }}>Código</TableCell>
                <TableCell align="center">Nombre del producto</TableCell>
                <TableCell align="center">Nombre corto</TableCell>
                <TableCell align="center">Tipo de producto</TableCell>
                <TableCell align="center">Costo Unitario</TableCell>
                <TableCell align="center" sx={{ width: '5%' }}>Afecto a IGV</TableCell>
                <TableCell align="center">Disponibilidad</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell align="center">{product.code}</TableCell>
                  <TableCell align="center">{product.name}</TableCell>
                  <TableCell align="center">{product.shortName}</TableCell>
                  <TableCell align="center">{product.type}</TableCell>
                  <TableCell align="center">S/. {product.cost.toFixed(2)}</TableCell>
                  <TableCell align="center">{product.igv}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        bgcolor: product.status === 'Disponible' ? 'success.main' : 'error.main',
                        color: 'white',
                        px: 1.2,
                        py: 0.2,
                        borderRadius: '12px',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                      }}
                    >
                      {product.status}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEditar(product)}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleEliminar(product)}><Delete fontSize="small" /></IconButton>
                      </Tooltip>
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
          count={productosFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

      {/* Modal Nuevo Producto */}
      <Dialog open={nuevoModalOpen} onClose={() => setNuevoModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22 }}>Nuevo Producto</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Nombre del producto" type="text" fullWidth size="small" value={nuevoProducto.name} onChange={e => setNuevoProducto({...nuevoProducto, name: e.target.value})} />
          <TextField margin="dense" label="Nombre corto" type="text" fullWidth size="small" value={nuevoProducto.shortName} onChange={e => setNuevoProducto({...nuevoProducto, shortName: e.target.value})} />
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Tipo de producto</InputLabel>
            <Select label="Tipo de producto" value={nuevoProducto.type} onChange={e => setNuevoProducto({...nuevoProducto, type: e.target.value})}>
              <MenuItem value="Menú">Menú</MenuItem>
              <MenuItem value="Plato a la carta">Plato a la carta</MenuItem>
              <MenuItem value="Diversos">Diversos</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="dense" label="Costo Unitario" type="number" fullWidth size="small" value={nuevoProducto.cost} onChange={e => setNuevoProducto({...nuevoProducto, cost: e.target.value})} />
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Afecto a IGV</InputLabel>
            <Select label="Afecto a IGV" value={nuevoProducto.igv} onChange={e => setNuevoProducto({...nuevoProducto, igv: e.target.value})}>
              <MenuItem value="Sí">Sí</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Disponibilidad</InputLabel>
            <Select label="Disponibilidad" value={nuevoProducto.status} onChange={e => setNuevoProducto({...nuevoProducto, status: e.target.value})}>
              <MenuItem value="Disponible">Disponible</MenuItem>
              <MenuItem value="No Disponible">No Disponible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setNuevoModalOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarNuevo} sx={{ fontWeight: 600 }} disabled={!nuevoProducto.name || !nuevoProducto.shortName || !nuevoProducto.type || !nuevoProducto.cost}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Producto */}
      <Dialog open={editarModalOpen} onClose={() => setEditarModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 22 }}>Editar Producto</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Código" type="text" fullWidth size="small" value={editProducto.code} disabled />
          <TextField autoFocus margin="dense" label="Nombre del producto" type="text" fullWidth size="small" value={editProducto.name} onChange={e => setEditProducto({...editProducto, name: e.target.value})} />
          <TextField margin="dense" label="Nombre corto" type="text" fullWidth size="small" value={editProducto.shortName} onChange={e => setEditProducto({...editProducto, shortName: e.target.value})} />
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Tipo de producto</InputLabel>
            <Select label="Tipo de producto" value={editProducto.type} onChange={e => setEditProducto({...editProducto, type: e.target.value})}>
              <MenuItem value="Menú">Menú</MenuItem>
              <MenuItem value="Plato a la carta">Plato a la carta</MenuItem>
              <MenuItem value="Diversos">Diversos</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="dense" label="Costo Unitario" type="number" fullWidth size="small" value={editProducto.cost} onChange={e => setEditProducto({...editProducto, cost: e.target.value})} />
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Afecto a IGV</InputLabel>
            <Select label="Afecto a IGV" value={editProducto.igv} onChange={e => setEditProducto({...editProducto, igv: e.target.value})}>
              <MenuItem value="Sí">Sí</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Disponibilidad</InputLabel>
            <Select label="Disponibilidad" value={editProducto.status} onChange={e => setEditProducto({...editProducto, status: e.target.value})}>
              <MenuItem value="Disponible">Disponible</MenuItem>
              <MenuItem value="No Disponible">No Disponible</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEditarModalOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleGuardarEdicion} sx={{ fontWeight: 600 }} disabled={!editProducto.name || !editProducto.shortName || !editProducto.type || !editProducto.cost}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar Producto */}
      <Dialog open={eliminarModalOpen} onClose={() => setEliminarModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>Eliminar Producto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`¿Estás seguro de que quieres eliminar el producto "${productoSeleccionado?.name}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setEliminarModalOpen(false)} sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleConfirmarEliminar} color="error" sx={{ fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductos; 
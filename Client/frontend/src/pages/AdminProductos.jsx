import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Tooltip, Breadcrumbs, TablePagination, Alert, Snackbar
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { Link as RouterLink } from 'react-router-dom';
import productosService from '../services/productosService';

const AdminProductos = () => {
  // Estados para datos
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [nuevoProducto, setNuevoProducto] = useState({ 
    codigoProducto: '', 
    nombreProducto: '', 
    nombreCorto: '', 
    tipoProducto: 'C', 
    costoUnitario: '', 
    afectoIGV: true, 
    disponible: true 
  });
  const [editProducto, setEditProducto] = useState({ 
    idProducto: null, 
    codigoProducto: '', 
    nombreProducto: '', 
    nombreCorto: '', 
    tipoProducto: 'C', 
    costoUnitario: '', 
    afectoIGV: true, 
    disponible: true 
  });

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productosService.obtenerTodos();
      // Validar que response.data.data sea un array
      const productosData = Array.isArray(response.data.data) ? response.data.data : [];
      setProductos(productosData);
      setProductosFiltrados(productosData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error cargando productos:', err);
      setProductos([]);
      setProductosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtros
  const handleAplicarFiltros = () => {
    let filtrados = productos.filter(p => {
      const matchCodigo = !filtroCodigo || p.codigoProducto.toLowerCase().includes(filtroCodigo.toLowerCase());
      const matchNombre = !filtroNombre || p.nombreProducto.toLowerCase().includes(filtroNombre.toLowerCase());
      const matchNombreCorto = !filtroNombreCorto || p.nombreCorto.toLowerCase().includes(filtroNombreCorto.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || p.tipoProducto === filtroTipo;
      const matchDisponibilidad = filtroDisponibilidad === 'todos' || 
        (filtroDisponibilidad === 'Disponible' && p.disponible) ||
        (filtroDisponibilidad === 'No Disponible' && !p.disponible);
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
    setNuevoProducto({ 
      codigoProducto: '', 
      nombreProducto: '', 
      nombreCorto: '', 
      tipoProducto: 'C', 
      costoUnitario: '', 
      afectoIGV: true, 
      disponible: true 
    });
    setNuevoModalOpen(true);
  };

  const handleGuardarNuevo = async () => {
    try {
      const productoData = {
        ...nuevoProducto,
        costoUnitario: parseFloat(nuevoProducto.costoUnitario) || 0
      };
      
      const response = await productosService.crear(productoData);
      const nuevoProductoData = response.data;
      setProductos(prev => [...prev, nuevoProductoData]);
      setProductosFiltrados(prev => [...prev, nuevoProductoData]);
      setNuevoModalOpen(false);
      mostrarNotificacion('Producto creado exitosamente', 'success');
    } catch (err) {
      mostrarNotificacion('Error al crear el producto', 'error');
      console.error('Error creando producto:', err);
    }
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setEditProducto({
      idProducto: producto.idProducto,
      codigoProducto: producto.codigoProducto,
      nombreProducto: producto.nombreProducto,
      nombreCorto: producto.nombreCorto,
      tipoProducto: producto.tipoProducto,
      costoUnitario: producto.costoUnitario.toString(),
      afectoIGV: producto.afectoIGV,
      disponible: producto.disponible
    });
    setEditarModalOpen(true);
  };

  // Función para adaptar un producto al formato esperado por la tabla
  const adaptarProducto = (producto) => ({
    ...producto,
    costoUnitario: parseFloat(producto.costoUnitario),
    afectoIGV: Boolean(producto.afectoIGV),
    disponible: Boolean(producto.disponible)
  });

  const handleGuardarEdicion = async () => {
    try {
      const productoData = {
        ...editProducto,
        costoUnitario: parseFloat(editProducto.costoUnitario) || 0,
        afectoIGV: Boolean(editProducto.afectoIGV),
        disponible: Boolean(editProducto.disponible),
        activo: editProducto.activo !== undefined ? Boolean(editProducto.activo) : true
      };
      
      const response = await productosService.actualizar(editProducto.idProducto, productoData);
      const productoActualizado = response.data;
      const productoActualizadoAdaptado = adaptarProducto(productoActualizado);
      const actualizados = productos.map(p => 
        p.idProducto === productoActualizadoAdaptado.idProducto ? productoActualizadoAdaptado : p
      );
      setProductos(actualizados);
      setProductosFiltrados(actualizados);
      setEditarModalOpen(false);
      mostrarNotificacion('Producto actualizado exitosamente', 'success');
    } catch (err) {
      mostrarNotificacion('Error al actualizar el producto', 'error');
      console.error('Error actualizando producto:', err);
    }
  };

  const handleEliminar = (producto) => {
    setProductoSeleccionado(producto);
    setEliminarModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await productosService.eliminar(productoSeleccionado.idProducto);
      const filtrados = productos.filter(p => p.idProducto !== productoSeleccionado.idProducto);
      setProductos(filtrados);
      setProductosFiltrados(filtrados);
      setEliminarModalOpen(false);
      setProductoSeleccionado(null);
      mostrarNotificacion('Producto eliminado exitosamente', 'success');
    } catch (err) {
      mostrarNotificacion('Error al eliminar el producto', 'error');
      console.error('Error eliminando producto:', err);
    }
  };

  const mostrarNotificacion = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarNotificacion = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Función para mapear tipos de producto
  const mapearTipoProducto = (tipo) => {
    const tipos = {
      'M': 'Menú',
      'C': 'Plato a la carta',
      'D': 'Diversos'
    };
    return tipos[tipo] || tipo;
  };

  // Validación de campos obligatorios para nuevo producto
  const esNuevoProductoValido = () => {
    return (
      nuevoProducto.codigoProducto &&
      nuevoProducto.nombreProducto &&
      nuevoProducto.nombreCorto &&
      nuevoProducto.tipoProducto &&
      parseFloat(nuevoProducto.costoUnitario) > 0
    );
  };

  // Validación de campos obligatorios para edición
  const esEditProductoValido = () => {
    return (
      editProducto.codigoProducto &&
      editProducto.nombreProducto &&
      editProducto.nombreCorto &&
      editProducto.tipoProducto &&
      parseFloat(editProducto.costoUnitario) > 0
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Cargando productos...</Typography>
      </Box>
    );
  }

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

      {error && (
        <Alert severity="error" sx={{ m: 4, mt: 0 }}>
          {error}
        </Alert>
      )}

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
                <MenuItem value="M">Menú</MenuItem>
                <MenuItem value="C">Plato a la carta</MenuItem>
                <MenuItem value="D">Diversos</MenuItem>
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre del producto</TableCell>
                <TableCell>Nombre corto</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Costo unitario</TableCell>
                <TableCell>IGV</TableCell>
                <TableCell>Disponibilidad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((producto) => (
                <TableRow key={producto.idProducto}>
                  <TableCell>{producto.codigoProducto}</TableCell>
                  <TableCell>{producto.nombreProducto}</TableCell>
                  <TableCell>{producto.nombreCorto}</TableCell>
                  <TableCell>{mapearTipoProducto(producto.tipoProducto)}</TableCell>
                  <TableCell>S/. {parseFloat(producto.costoUnitario).toFixed(2)}</TableCell>
                  <TableCell>{producto.afectoIGV ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{producto.disponible ? 'Disponible' : 'No Disponible'}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEditar(producto)} size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleEliminar(producto)} size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={productosFiltrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Modal Nuevo Producto */}
      <Dialog open={nuevoModalOpen} onClose={() => setNuevoModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Producto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código del producto"
              value={nuevoProducto.codigoProducto}
              onChange={(e) => setNuevoProducto({...nuevoProducto, codigoProducto: e.target.value})}
              fullWidth
            />
            <TextField
              label="Nombre del producto"
              value={nuevoProducto.nombreProducto}
              onChange={(e) => setNuevoProducto({...nuevoProducto, nombreProducto: e.target.value})}
              fullWidth
            />
            <TextField
              label="Nombre corto"
              value={nuevoProducto.nombreCorto}
              onChange={(e) => setNuevoProducto({...nuevoProducto, nombreCorto: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de producto</InputLabel>
              <Select
                value={nuevoProducto.tipoProducto}
                onChange={(e) => setNuevoProducto({...nuevoProducto, tipoProducto: e.target.value})}
                label="Tipo de producto"
              >
                <MenuItem value="M">Menú</MenuItem>
                <MenuItem value="C">Plato a la carta</MenuItem>
                <MenuItem value="D">Diversos</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Costo unitario"
              type="number"
              value={nuevoProducto.costoUnitario}
              onChange={(e) => {
                let value = e.target.value;
                // Limitar a máximo 2 decimales
                if (/^\d*(\.\d{0,2})?$/.test(value)) {
                  // No permitir negativos ni cero
                  if (parseFloat(value) > 0 || value === "") {
                    setNuevoProducto({...nuevoProducto, costoUnitario: value});
                  }
                }
              }}
              inputProps={{ min: 0.01, step: 0.01 }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Afecto a IGV</InputLabel>
              <Select
                value={nuevoProducto.afectoIGV}
                onChange={(e) => setNuevoProducto({...nuevoProducto, afectoIGV: e.target.value})}
                label="Afecto a IGV"
              >
                <MenuItem value={true}>Sí</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Disponible</InputLabel>
              <Select
                value={nuevoProducto.disponible}
                onChange={(e) => setNuevoProducto({...nuevoProducto, disponible: e.target.value})}
                label="Disponible"
              >
                <MenuItem value={true}>Sí</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNuevoModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleGuardarNuevo} variant="contained" disabled={!esNuevoProductoValido()}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Producto */}
      <Dialog open={editarModalOpen} onClose={() => setEditarModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código del producto"
              value={editProducto.codigoProducto}
              onChange={(e) => setEditProducto({...editProducto, codigoProducto: e.target.value})}
              fullWidth
            />
            <TextField
              label="Nombre del producto"
              value={editProducto.nombreProducto}
              onChange={(e) => setEditProducto({...editProducto, nombreProducto: e.target.value})}
              fullWidth
            />
            <TextField
              label="Nombre corto"
              value={editProducto.nombreCorto}
              onChange={(e) => setEditProducto({...editProducto, nombreCorto: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de producto</InputLabel>
              <Select
                value={editProducto.tipoProducto}
                onChange={(e) => setEditProducto({...editProducto, tipoProducto: e.target.value})}
                label="Tipo de producto"
              >
                <MenuItem value="M">Menú</MenuItem>
                <MenuItem value="C">Plato a la carta</MenuItem>
                <MenuItem value="D">Diversos</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Costo unitario"
              type="number"
              value={editProducto.costoUnitario}
              onChange={(e) => {
                let value = e.target.value;
                // Limitar a máximo 2 decimales
                if (/^\d*(\.\d{0,2})?$/.test(value)) {
                  // No permitir negativos ni cero
                  if (parseFloat(value) > 0 || value === "") {
                    setEditProducto({...editProducto, costoUnitario: value});
                  }
                }
              }}
              inputProps={{ min: 0.01, step: 0.01 }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Afecto a IGV</InputLabel>
              <Select
                value={editProducto.afectoIGV}
                onChange={(e) => setEditProducto({...editProducto, afectoIGV: e.target.value})}
                label="Afecto a IGV"
              >
                <MenuItem value={true}>Sí</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Disponible</InputLabel>
              <Select
                value={editProducto.disponible}
                onChange={(e) => setEditProducto({...editProducto, disponible: e.target.value})}
                label="Disponible"
              >
                <MenuItem value={true}>Sí</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditarModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleGuardarEdicion} variant="contained" disabled={!esEditProductoValido()}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar Producto */}
      <Dialog open={eliminarModalOpen} onClose={() => setEliminarModalOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar el producto "{productoSeleccionado?.nombreProducto}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEliminarModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmarEliminar} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={cerrarNotificacion} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProductos; 
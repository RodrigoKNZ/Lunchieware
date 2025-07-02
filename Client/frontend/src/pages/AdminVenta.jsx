import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Breadcrumbs, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import productosService from '../services/productosService';
import clienteService from '../services/clienteService';
import contratosService from '../services/programacionMenuService';
import comprobanteVentaService from '../services/comprobanteVentaService';

const mediosPago = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
];

const AdminVenta = () => {
  // Estados
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [producto, setProducto] = React.useState('menu');
  const [cantidad, setCantidad] = React.useState(1);
  const [formaPago, setFormaPago] = useState('cuenta');
  const [medioPago, setMedioPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [cliente, setCliente] = React.useState({ codigo: '', nombre: '' });
  const [infoContrato, setInfoContrato] = React.useState({ abonos: undefined, consumos: undefined, saldo: undefined });
  const [errorCliente, setErrorCliente] = useState(false);
  const [idContratoVigente, setIdContratoVigente] = useState(null);

  // Cargar productos activos del backend y setear MEN001 por defecto
  useEffect(() => {
    const cargarProductos = async () => {
      const response = await productosService.obtenerTodos();
      const productosActivos = Array.isArray(response.data.data)
        ? response.data.data.filter(p => p.activo)
        : [];
      setProductosDisponibles(productosActivos);
      // Buscar MEN001
      const menu = productosActivos.find(p => p.codigoProducto === 'MEN001');
      if (menu) {
        setDetalleVenta([{ codigo: menu.codigoProducto, cantidad: 1 }]);
      } else if (productosActivos.length > 0) {
        setDetalleVenta([{ codigo: productosActivos[0].codigoProducto, cantidad: 1 }]);
      }
    };
    cargarProductos();
  }, []);

  // Handler para buscar cliente por código
  const handleBuscarCliente = async () => {
    setErrorCliente(false);
    setInfoContrato({ abonos: undefined, consumos: undefined, saldo: undefined });
    setCliente({ ...cliente, nombre: '' });
    setIdContratoVigente(null);
    if (!cliente.codigo) return;
    try {
      console.log('[VENTA] Buscando cliente por código:', cliente.codigo);
      const res = await clienteService.obtenerPorCodigo(cliente.codigo);
      console.log('[VENTA] Respuesta cliente:', res);
      if (!res.data || !res.data.esVigente) throw new Error('No vigente');
      const clienteData = res.data;
      setCliente({ codigo: clienteData.codigoCliente, nombre: clienteData.nombres + ' ' + clienteData.apellidoPaterno + ' ' + clienteData.apellidoMaterno });
      // Traer contratos activos
      console.log('[VENTA] Buscando contratos del cliente:', clienteData.idCliente);
      const contratosRes = await clienteService.obtenerContratos(clienteData.idCliente);
      console.log('[VENTA] Respuesta contratos:', contratosRes);
      const contrato = Array.isArray(contratosRes.data) && contratosRes.data.length > 0 ? contratosRes.data[0] : null;
      if (contrato) {
        setInfoContrato({
          abonos: contrato.importeAbonos,
          consumos: contrato.importeConsumos,
          saldo: contrato.importeSaldo
        });
        setIdContratoVigente(contrato.idContrato);
        console.log('[VENTA] Contrato vigente:', contrato);
      } else {
        throw new Error('No contrato');
      }
    } catch (e) {
      setErrorCliente(true);
      setCliente({ codigo: cliente.codigo, nombre: '' });
      setInfoContrato({ abonos: undefined, consumos: undefined, saldo: undefined });
      setIdContratoVigente(null);
      console.error('[VENTA] Error buscando cliente o contrato:', e);
    }
  };

  // Handlers
  const handleProductoChange = (idx, nuevoCodigo) => {
    // Evitar duplicados
    if (detalleVenta.some((item, i) => item.codigo === nuevoCodigo && i !== idx)) return;
    setDetalleVenta(detalleVenta.map((item, i) => i === idx ? { ...item, codigo: nuevoCodigo } : item));
  };
  const handleCantidadChange = (idx, nuevaCantidad) => {
    setDetalleVenta(detalleVenta.map((item, i) => i === idx ? { ...item, cantidad: Math.max(1, Number(nuevaCantidad) || 1) } : item));
  };
  const handleEliminarLinea = (idx) => {
    if (detalleVenta.length === 1) return; // Siempre debe quedar al menos una línea
    setDetalleVenta(detalleVenta.filter((_, i) => i !== idx));
  };
  const handleAgregarProducto = () => {
    // Buscar el primer producto no usado
    const usados = detalleVenta.map(item => item.codigo);
    const disponible = productosDisponibles.find(p => !usados.includes(p.codigoProducto));
    if (disponible) {
      setDetalleVenta([...detalleVenta, { codigo: disponible.codigoProducto, cantidad: 1 }]);
    }
  };
  // Productos que se pueden agregar (no repetidos)
  const productosNoUsados = productosDisponibles.filter(p => !detalleVenta.some(item => item.codigo === p.codigoProducto));

  const prod = productosDisponibles.find(p => p.codigoProducto === producto);
  const subtotal = prod ? prod.costoUnitario * cantidad : 0;
  const totalPagar = detalleVenta.reduce((acc, item) => {
    const producto = productosDisponibles.find(p => p.codigoProducto === item.codigo);
    return acc + (producto ? Number(producto.costoUnitario) * item.cantidad : 0);
  }, 0);
  const vuelto = formaPago === 'contado' && montoRecibido !== ''
    ? (parseFloat(montoRecibido) - totalPagar).toFixed(2)
    : '0.00';

  // Fecha y serie
  const fechaActual = new Date();
  const serie = fechaActual.getFullYear();
  const fechaStr = fechaActual.toLocaleDateString('es-PE');

  // Habilitación del botón de confirmar venta
  const puedeConfirmar =
    (formaPago === 'cuenta') ||
    (formaPago === 'contado' && parseFloat(montoRecibido) >= totalPagar);

  // Determinar si el monto recibido es suficiente
  const montoInsuficiente = formaPago === 'contado' && montoRecibido !== '' && parseFloat(montoRecibido) < totalPagar;

  // Handler para confirmar venta
  const handleConfirmarVenta = async () => {
    if (!infoContrato || !infoContrato.saldo || !cliente.codigo || !idContratoVigente) {
      console.warn('[VENTA] Faltan datos para confirmar venta', { infoContrato, cliente, idContratoVigente });
      return;
    }
    try {
      // Preparar detalles
      const detalles = detalleVenta.map(item => {
        const producto = productosDisponibles.find(p => p.codigoProducto === item.codigo);
        return {
          idProducto: producto.idProducto,
          cantidad: item.cantidad,
          importeTotal: (Number(producto.costoUnitario) * item.cantidad).toFixed(2)
        };
      });
      // Serie y número (puedes mejorar la lógica de número correlativo)
      const numeroSerie = String(new Date().getFullYear());
      const numeroComprobante = String(Date.now()); // Temporal, deberías usar un correlativo real
      // Fecha en formato YYYY-MM-DD
      const fechaDocumento = new Date().toISOString().slice(0, 10);
      // Saldo antes de la venta
      const saldoAlMomentoDeVenta = infoContrato.saldo;
      // Total
      const total = totalPagar;
      // Determinar medio de pago seguro
      let medioPagoSeguro = medioPago;
      if (formaPago === 'cuenta') {
        medioPagoSeguro = 'Cargo en cuenta';
      } else if (!medioPago || medioPago === 'cuenta') {
        medioPagoSeguro = 'Efectivo';
      }
      console.log('[VENTA] Datos a enviar al endpoint de venta:', {
        idContrato: idContratoVigente,
        numeroSerie,
        numeroComprobante,
        fechaDocumento,
        formaPago,
        medioDePago: medioPagoSeguro,
        detalles,
        total,
        saldoAlMomentoDeVenta
      });
      // Llamar al servicio de venta
      const ventaRes = await comprobanteVentaService.registrarVenta({
        idContrato: idContratoVigente,
        numeroSerie,
        numeroComprobante,
        fechaDocumento,
        formaPago,
        medioDePago: medioPagoSeguro,
        detalles,
        total,
        saldoAlMomentoDeVenta
      });
      console.log('[VENTA] Respuesta del endpoint de venta:', ventaRes);
      alert('¡Venta registrada exitosamente!');
      // Aquí podrías limpiar el formulario o recargar datos
    } catch (error) {
      console.error('[VENTA] Error al registrar la venta:', error);
      alert('Error al registrar la venta: ' + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <React.Fragment>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <HomeIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <PointOfSaleIcon sx={{ mr: 0.5, fontSize: 20 }} />
            <Typography color="text.primary">Venta</Typography>
          </Box>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Venta</Typography>
        <Divider />
      </Box>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mt: 2 }}>
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* NUEVO DISEÑO: Información del cliente */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={500} sx={{ mb: { xs: 2, md: 0 } }}>
                Información del cliente
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  sx={{ fontWeight: 600, minWidth: 160, height: 40, boxShadow: 1, textTransform: 'none', fontSize: 15 }}
                  onClick={handleBuscarCliente}
                >
                  Buscar cliente
                </Button>
              </Box>
            </Box>
            <Grid container spacing={2} alignItems="stretch">
              <Grid item xs={12} md={6} lg={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'stretch' }}>
                  <TextField
                    label="Código"
                    value={cliente.codigo}
                    onChange={e => setCliente({ ...cliente, codigo: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{ flex: 1, mt: 0.5 }}
                    onKeyDown={e => { if (e.key === 'Enter') handleBuscarCliente(); }}
                  />
                  <TextField
                    label="Nombre del cliente"
                    value={cliente.nombre || ''}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    size="small"
                    sx={{ flex: 1, mb: 0.5 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6} lg={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
                <Box component="fieldset" sx={{ border: errorCliente ? '2px solid #e57373' : '1px solid #e0e0e0', borderRadius: 1, pt: 1.2, pb: 1.2, px: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
                  <legend style={{ fontSize: 13, color: errorCliente ? '#e57373' : '#888', marginLeft: 8, padding: 0, height: 20, lineHeight: '20px' }}>Información del contrato</legend>
                  {errorCliente ? (
                    <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                      El código ingresado no corresponde a un cliente con contrato activo
                    </Typography>
                  ) : (
                    infoContrato && infoContrato.abonos !== undefined && infoContrato.abonos !== null && infoContrato.consumos !== undefined && infoContrato.consumos !== null && infoContrato.saldo !== undefined && infoContrato.saldo !== null ? (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Importe abonos: <b>S/. {infoContrato.abonos}</b>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Importe consumos: <b>S/. {infoContrato.consumos}</b>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Importe saldo: <b>S/. {infoContrato.saldo}</b>
                        </Typography>
                      </>
                    ) : null
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          {/* Detalle de venta */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>Detalle de venta</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Precio unitario</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalleVenta.map((item, idx) => {
                    const producto = productosDisponibles.find(p => p.codigoProducto === item.codigo);
                    return (
                      <TableRow key={item.codigo}>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Nombre corto</InputLabel>
                            <Select
                              value={item.codigo}
                              label="Nombre corto"
                              onChange={e => handleProductoChange(idx, e.target.value)}
                            >
                              {productosDisponibles.map(p => (
                                <MenuItem
                                  key={p.codigoProducto}
                                  value={p.codigoProducto}
                                  disabled={detalleVenta.some((d, i) => d.codigo === p.codigoProducto && i !== idx)}
                                >
                                  {p.nombreCorto || p.nombreProducto}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>{producto?.codigoProducto || '-'}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={item.cantidad}
                            onChange={e => handleCantidadChange(idx, e.target.value)}
                            inputProps={{ min: 1, style: { width: 60 } }}
                          />
                        </TableCell>
                        <TableCell>{producto ? `S/. ${Number(producto.costoUnitario).toFixed(2)}` : '-'}</TableCell>
                        <TableCell>{producto ? `S/. ${(Number(producto.costoUnitario) * item.cantidad).toFixed(2)}` : '-'}</TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => handleEliminarLinea(idx)} disabled={detalleVenta.length === 1}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2, fontWeight: 600 }}
              onClick={handleAgregarProducto}
              disabled={productosNoUsados.length === 0}
            >
              Agregar producto
            </Button>
          </Paper>
        </Box>
        {/* Panel lateral derecho */}
        <Paper elevation={0} sx={{ flex: 1, p: 3, minWidth: 240, maxWidth: 260, border: '1px solid #e0e0e0', ml: 0 }}>
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>Forma de pago</Typography>
          <RadioGroup
            value={formaPago}
            onChange={e => {
              setFormaPago(e.target.value);
              if (e.target.value === 'cuenta') {
                setMedioPago('cuenta');
                setMontoRecibido('');
              } else {
                setMedioPago('efectivo');
              }
            }}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="cuenta" control={<Radio />} label="Pago con cargo en cuenta" />
            <FormControlLabel value="contado" control={<Radio />} label="Pago al contado" />
          </RadioGroup>
          <Divider sx={{ mb: 2 }} />
          <Typography fontWeight={500} sx={{ mb: 1 }}>Documento de venta</Typography>
          <Typography variant="body2">Tipo de documento: Nota de venta</Typography>
          <Typography variant="body2">Serie: {serie}</Typography>
          <Typography variant="body2">Nro. comprobante: 000000</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Fecha: {fechaStr}</Typography>
          <Typography fontWeight={500} sx={{ mb: 1 }}>Medio de pago</Typography>
          {formaPago === 'cuenta' ? (
            <TextField
              value="Cargo en cuenta"
              size="small"
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
          ) : (
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Medio de pago</InputLabel>
              <Select
                value={medioPago}
                label="Medio de pago"
                onChange={e => setMedioPago(e.target.value)}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="yape">Yape</MenuItem>
              </Select>
            </FormControl>
          )}
          {formaPago === 'contado' && (
            <TextField
              label="Monto recibido"
              size="small"
              value={montoRecibido}
              onChange={e => setMontoRecibido(e.target.value.replace(/[^\d.]/g, ''))}
              fullWidth
              sx={{ mb: 2 }}
              type="number"
              inputProps={{ min: totalPagar, step: '0.01' }}
            />
          )}
          <Divider sx={{ mb: 2 }} />
          <Typography fontWeight={500} sx={{ mb: 1 }}>Resumen</Typography>
          <Typography variant="body2">Total a pagar: <Box component="span" color="primary.main" fontWeight={600}>S/.{totalPagar.toFixed(2)}</Box></Typography>
          {formaPago === 'contado' && montoRecibido !== '' && montoInsuficiente && (
            <Typography variant="body2" color="error" sx={{ mb: 2, mt: 1 }}>
              El monto recibido es insuficiente para cubrir el total a pagar.
            </Typography>
          )}
          {!(formaPago === 'contado' && montoRecibido !== '' && montoInsuficiente) && (
            <Typography variant="body2" sx={{ mb: 2 }}>Vuelto: <Box component="span" color="primary.main" fontWeight={600}>S/.{vuelto}</Box></Typography>
          )}
          <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 600, mb: 1 }} disabled={!puedeConfirmar} onClick={handleConfirmarVenta}>
            ✓ Confirmar venta
          </Button>
          <Button variant="outlined" color="primary" fullWidth sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
        </Paper>
      </Box>
    </React.Fragment>
  );
};

export default AdminVenta; 
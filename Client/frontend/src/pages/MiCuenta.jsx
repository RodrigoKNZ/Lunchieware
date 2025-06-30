import React from 'react';
import {
  Box, Typography, Tabs, Tab, Divider, TextField, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, useMediaQuery, Card, CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import clienteService from '../services/clienteService';
import abonosService from '../services/abonosService';
import mercadoPagoService from '../services/mercadoPagoService';

// Obtener nombre del cliente asociado al usuario logueado
const obtenerNombreCliente = async () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    if (!usuario.nombreUsuario) {
      return 'Cliente';
    }
    
    const response = await clienteService.obtenerPorUsuario(usuario.nombreUsuario);
    if (response.data && response.data.length > 0) {
      const cliente = response.data[0];
      console.log('%c🟦 [MiCuenta] Obteniendo datos del cliente para pago', 'color: #1976d2', cliente);
      return `${cliente.nombres} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno}`;
    }
    return 'Cliente';
  } catch (error) {
    console.error('Error obteniendo datos del cliente:', error);
    return 'Cliente';
  }
};

// Obtener datos del cliente y contrato vigente
const obtenerDatosCliente = async () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    if (!usuario.nombreUsuario) {
      return null;
    }
    
    const response = await clienteService.obtenerPorUsuario(usuario.nombreUsuario);
    if (response.data && response.data.length > 0) {
      const cliente = response.data[0];
      
      // Obtener contratos del cliente
      const contratosResponse = await clienteService.obtenerContratos(cliente.idCliente);
      const contratos = contratosResponse.data || [];
      
      // Obtener el contrato vigente (el más reciente)
      const contratoVigente = contratos.length > 0 ? contratos[0] : null;
      
      console.log('%c🟦 [MiCuenta] Obteniendo datos del cliente para pago', 'color: #1976d2', cliente);
      return {
        cliente,
        contratoVigente
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo datos del cliente:', error);
    return null;
  }
};

// Obtener abonos del cliente
const obtenerAbonosCliente = async (idCliente) => {
  try {
    const response = await abonosService.obtenerPorCliente(idCliente);
    return response.data || [];
  } catch (error) {
    console.error('Error obteniendo abonos del cliente:', error);
    return [];
  }
};

const productos = [
  { value: 'todos', label: 'Todos' },
  { value: 'menu', label: 'Menú' },
  { value: 'carta', label: 'Plato a la carta' },
];
const mediosPago = [
  { value: 'todos', label: 'Todos' },
  { value: 'yape', label: 'Yape' },
  { value: 'transferencia', label: 'Transferencia' },
];

// Nueva data mockup de consumos para abril 2025 (excluyendo sábados y domingos)
const historialConsumo = [
  { fecha: '30/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '29/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '28/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '25/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '24/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '23/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '22/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '21/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '18/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '17/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '16/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '15/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '14/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '11/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '10/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '09/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '08/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '07/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '04/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '03/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '02/04/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '01/04/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
];
const comprobantesPago = [
  { codigo: 'ABN001', fecha: '20/04/2025', monto: 'S/. 50.00', medio: 'Yape' },
  { codigo: 'ABN002', fecha: '18/04/2025', monto: 'S/. 30.00', medio: 'Yape' },
  { codigo: 'ABN003', fecha: '15/04/2025', monto: 'S/. 25.00', medio: 'Transferencia' },
  { codigo: 'ABN004', fecha: '12/04/2025', monto: 'S/. 40.00', medio: 'Yape' },
  { codigo: 'ABN005', fecha: '10/04/2025', monto: 'S/. 35.00', medio: 'Yape' },
  { codigo: 'ABN006', fecha: '08/04/2025', monto: 'S/. 45.00', medio: 'Transferencia' },
  { codigo: 'ABN007', fecha: '05/04/2025', monto: 'S/. 20.00', medio: 'Yape' },
  { codigo: 'ABN008', fecha: '03/04/2025', monto: 'S/. 55.00', medio: 'Yape' },
  { codigo: 'ABN009', fecha: '01/04/2025', monto: 'S/. 30.00', medio: 'Transferencia' },
  { codigo: 'ABN010', fecha: '30/03/2025', monto: 'S/. 40.00', medio: 'Yape' },
  { codigo: 'ABN011', fecha: '28/03/2025', monto: 'S/. 25.00', medio: 'Yape' },
  { codigo: 'ABN012', fecha: '25/03/2025', monto: 'S/. 35.00', medio: 'Transferencia' },
  { codigo: 'ABN013', fecha: '22/03/2025', monto: 'S/. 50.00', medio: 'Yape' }
];

const MiCuenta = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = React.useState(0);
  const [nombreCliente, setNombreCliente] = React.useState('Cliente');
  
  // Estados para datos reales
  const [datosCliente, setDatosCliente] = React.useState(null);
  const [abonos, setAbonos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Cargar datos del cliente al montar el componente
  React.useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError('');
      try {
        const nombre = await obtenerNombreCliente();
        setNombreCliente(nombre);
        
        const datos = await obtenerDatosCliente();
        if (datos) {
          setDatosCliente(datos);
          
          // Cargar abonos del cliente
          const abonosCliente = await obtenerAbonosCliente(datos.cliente.idCliente);
          setAbonos(abonosCliente);
        }
      } catch (err) {
        setError('Error al cargar los datos del cliente');
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Estados para filtros aplicados y valores temporales
  const [filtrosAplicadosConsumo, setFiltrosAplicadosConsumo] = React.useState(false);
  const [filtrosAplicadosAbonos, setFiltrosAplicadosAbonos] = React.useState(false);
  const [filtrosConsumo, setFiltrosConsumo] = React.useState({
    producto: 'todos',
    desde: null,
    hasta: null
  });

  // Inputs controlados (temporales)
  const [filtroProducto, setFiltroProducto] = React.useState('todos');
  const [filtroDesdeConsumo, setFiltroDesdeConsumo] = React.useState(null);
  const [filtroHastaConsumo, setFiltroHastaConsumo] = React.useState(null);

  // Filtros comprobantes
  const [filtroDesdeComp, setFiltroDesdeComp] = React.useState(null);
  const [filtroHastaComp, setFiltroHastaComp] = React.useState(null);
  const [filtroMontoMin, setFiltroMontoMin] = React.useState('');
  const [filtroMontoMax, setFiltroMontoMax] = React.useState('');
  const [filtroMedioPago, setFiltroMedioPago] = React.useState('todos');

  // Paginación
  const [pageConsumo, setPageConsumo] = React.useState(0);
  const [rowsPerPageConsumo, setRowsPerPageConsumo] = React.useState(10);
  const [pageComp, setPageComp] = React.useState(0);
  const [rowsPerPageComp, setRowsPerPageComp] = React.useState(10);

  // Estados iniciales para filtros
  const filtrosInicialesConsumo = { producto: 'todos', desde: null, hasta: null };
  const filtrosInicialesAbonos = { desde: null, hasta: null, montoMin: '', montoMax: '', medio: 'todos' };
  // Determinar si los filtros están en su estado inicial
  const filtrosEnEstadoInicialConsumo =
    filtroProducto === filtrosInicialesConsumo.producto &&
    !filtroDesdeConsumo &&
    !filtroHastaConsumo;
  const filtrosEnEstadoInicialAbonos =
    !filtroDesdeComp &&
    !filtroHastaComp &&
    filtroMontoMin === '' &&
    filtroMontoMax === '' &&
    filtroMedioPago === filtrosInicialesAbonos.medio;
  // Handlers filtros consumo
  const handleAplicarFiltrosConsumo = () => {
    setFiltrosConsumo({
      producto: filtroProducto,
      desde: filtroDesdeConsumo,
      hasta: filtroHastaConsumo
    });
    setFiltrosAplicadosConsumo(true);
  };
  const handleLimpiarFiltrosConsumo = () => {
    setFiltroProducto('todos');
    setFiltroDesdeConsumo(null);
    setFiltroHastaConsumo(null);
    setFiltrosConsumo({ producto: 'todos', desde: null, hasta: null });
    setFiltrosAplicadosConsumo(false);
  };
  // Handlers filtros abonos
  const handleAplicarFiltrosAbonos = () => {
    setFiltrosAplicadosAbonos(true);
  };
  const handleLimpiarFiltrosAbonos = () => {
    setFiltroDesdeComp(filtrosInicialesAbonos.desde);
    setFiltroHastaComp(filtrosInicialesAbonos.hasta);
    setFiltroMontoMin(filtrosInicialesAbonos.montoMin);
    setFiltroMontoMax(filtrosInicialesAbonos.montoMax);
    setFiltroMedioPago(filtrosInicialesAbonos.medio);
    setFiltrosAplicadosAbonos(false);
  };

  // Filtrado de historial de consumo (igual que en Quejas y Sugerencias, pero solo cuando se aplican filtros)
  const consumoFiltrado = React.useMemo(() => {
    return historialConsumo.filter(row => {
      let match = true;
      // Filtro por producto
      if (filtrosConsumo.producto !== 'todos') {
        match = match && (row.producto === (filtrosConsumo.producto === 'menu' ? 'Menú' : 'Plato a la carta'));
      }
      // Filtro por fecha desde
      let matchDesde = true, matchHasta = true;
      if (filtrosConsumo.desde) {
        const fechaRow = dayjs(row.fecha, 'DD/MM/YYYY');
        const desde = dayjs(filtrosConsumo.desde).startOf('day');
        matchDesde = fechaRow.isSame(desde, 'day') || fechaRow.isAfter(desde, 'day');
      }
      // Filtro por fecha hasta
      if (filtrosConsumo.hasta) {
        const fechaRow = dayjs(row.fecha, 'DD/MM/YYYY');
        const hasta = dayjs(filtrosConsumo.hasta).endOf('day');
        matchHasta = fechaRow.isSame(hasta, 'day') || fechaRow.isBefore(hasta, 'day');
      }
      return match && matchDesde && matchHasta;
    });
  }, [filtrosConsumo]);

  // Mostrar todos los datos si no hay filtros aplicados
  const rowsConsumoToShow = filtrosAplicadosConsumo ? consumoFiltrado : historialConsumo;

  // Filtrado de comprobantes (simulado)
  const comprobantesFiltrados = React.useMemo(() => {
    if (!filtrosAplicadosAbonos) {
      return comprobantesPago;
    }
    
    return comprobantesPago.filter(row => {
      let match = true;
      
      // Filtro por fecha desde
      if (filtroDesdeComp) {
        const fechaRow = dayjs(row.fecha, 'DD/MM/YYYY');
        const desde = dayjs(filtroDesdeComp).startOf('day');
        match = match && (fechaRow.isSame(desde, 'day') || fechaRow.isAfter(desde, 'day'));
      }
      
      // Filtro por fecha hasta
      if (filtroHastaComp) {
        const fechaRow = dayjs(row.fecha, 'DD/MM/YYYY');
        const hasta = dayjs(filtroHastaComp).endOf('day');
        match = match && (fechaRow.isSame(hasta, 'day') || fechaRow.isBefore(hasta, 'day'));
      }
      
      // Filtro por monto mínimo
      if (filtroMontoMin && filtroMontoMin !== '') {
        const montoRow = parseFloat(row.monto.replace('S/. ', ''));
        const montoMin = parseFloat(filtroMontoMin);
        match = match && montoRow >= montoMin;
      }
      
      // Filtro por monto máximo
      if (filtroMontoMax && filtroMontoMax !== '') {
        const montoRow = parseFloat(row.monto.replace('S/. ', ''));
        const montoMax = parseFloat(filtroMontoMax);
        match = match && montoRow <= montoMax;
      }
      
      // Filtro por medio de pago
      if (filtroMedioPago !== 'todos') {
        const medioRow = row.medio.toLowerCase();
        const medioFiltro = filtroMedioPago.toLowerCase();
        match = match && medioRow === medioFiltro;
      }
      
      return match;
    });
  }, [filtrosAplicadosAbonos, filtroDesdeComp, filtroHastaComp, filtroMontoMin, filtroMontoMax, filtroMedioPago]);

  // Estado para el modal de recarga
  const [openRecarga, setOpenRecarga] = React.useState(false);
  const [montoRecarga, setMontoRecarga] = React.useState('');
  const [loadingRecarga, setLoadingRecarga] = React.useState(false);
  const [urlPago, setUrlPago] = React.useState('');
  const [errorMonto, setErrorMonto] = React.useState('');
  const [errorMontoMin, setErrorMontoMin] = React.useState('');
  const [errorMontoMax, setErrorMontoMax] = React.useState('');

  const handleAbrirRecarga = () => {
    setOpenRecarga(true);
    setMontoRecarga('');
    setUrlPago('');
    setErrorMonto('');
  };
  const handleCerrarRecarga = () => {
    setOpenRecarga(false);
    setMontoRecarga('');
    setUrlPago('');
    setLoadingRecarga(false);
    setErrorMonto('');
  };
  const handleConfirmarRecarga = async () => {
    setLoadingRecarga(true);
    setErrorMonto('');
    setUrlPago('');
    try {
      // Validar monto
      if (!montoRecarga || isNaN(montoRecarga) || parseFloat(montoRecarga) <= 0) {
        setErrorMonto('Ingresa un monto válido');
        setLoadingRecarga(false);
        return;
      }

      const monto = parseFloat(montoRecarga);
      if (monto < 0.01) {
        setErrorMonto('El monto mínimo es S/. 0.01');
        setLoadingRecarga(false);
        return;
      }

      if (monto > 1000) {
        setErrorMonto('El monto máximo es S/. 1,000.00');
        setLoadingRecarga(false);
        return;
      }

      // Obtener el ID del cliente actual
      let clienteId = null;
      if (datosCliente && datosCliente.idCliente) {
        clienteId = datosCliente.idCliente;
      }

      // NO enviar información del usuario para evitar detección por Mercado Pago
      // Usar un email genérico que será reemplazado en el backend
      const payer_email = 'invitado@lunchieware.com';
      
      // Llamar al backend para crear la preferencia
      console.log('%c🟦 [Pago] Enviando datos a crearPreferencia:', 'color: #1976d2', {
        amount: monto,
        description: 'Recarga de saldo Lunchieware',
        payer_email,
        cliente_id: clienteId
      });
      const response = await mercadoPagoService.crearPreferencia({
        amount: monto,
        description: 'Recarga de saldo Lunchieware',
        payer_email,
        cliente_id: clienteId
      });
      console.log('%c🟢 [Pago] Respuesta de crearPreferencia:', 'color: #388e3c', response);
      
      if (response.data && response.data.data && response.data.data.initPoint) {
        setUrlPago(response.data.data.initPoint);
        window.location.href = response.data.data.initPoint;
      } else {
        setErrorMonto('No se pudo generar el enlace de pago. Intenta nuevamente.');
      }
    } catch (error) {
      setErrorMonto('Error al generar el pago: ' + (error.response?.data?.message || error.message));
      console.error('%c🔴 [Pago] Error al crear preferencia de Mercado Pago:', 'color: #d32f2f', error);
    } finally {
      setLoadingRecarga(false);
    }
  };

  // Validación de monto: solo números positivos, máximo 2 decimales, punto decimal
  const handleMontoChange = (e) => {
    let value = e.target.value.replace(/,/g, '');
    value = value.replace(/-/g, '');
    // Truncar a dos decimales si es necesario
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      value = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
    }
    // Permitir solo números y punto
    if (!/^\d*(\.?\d{0,2})?$/.test(value)) {
      return;
    }
    setErrorMonto('');
    setMontoRecarga(value);
  };

  // Validación para filtros de monto mínimo y máximo
  const handleMontoMinChange = (e) => {
    let value = e.target.value.replace(/,/g, '');
    value = value.replace(/-/g, '');
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      value = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
    }
    if (!/^\d*(\.?\d{0,2})?$/.test(value)) {
      return;
    }
    setErrorMontoMin('');
    setFiltroMontoMin(value);
  };

  const handleMontoMaxChange = (e) => {
    let value = e.target.value.replace(/,/g, '');
    value = value.replace(/-/g, '');
    if (value.includes('.')) {
      const [intPart, decPart] = value.split('.');
      value = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
    }
    if (!/^\d*(\.?\d{0,2})?$/.test(value)) {
      return;
    }
    setErrorMontoMax('');
    setFiltroMontoMax(value);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', mt: isMobile ? 1 : 4, mb: 4, pl: { xs: 1, md: 3 } }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>{nombreCliente}</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40, mb: 2 }}>
          <Tab label="Historial de consumo" sx={{ fontWeight: 500, minWidth: 180 }} />
          <Tab label="Historial de abonos" sx={{ fontWeight: 500, minWidth: 200 }} />
          <Tab label="Mi saldo / Recargar saldo" sx={{ fontWeight: 500, minWidth: 240 }} />
        </Tabs>
        <Divider />
      </Box>
      {/* HISTORIAL DE CONSUMO */}
      {tab === 0 && (
        <Box sx={{ mt: 3 }}>
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
              select
              label="Producto"
              value={filtroProducto}
              onChange={e => setFiltroProducto(e.target.value)}
              size="small"
              sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }}
              InputProps={{ sx: { height: 36, fontSize: 14 } }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
              fullWidth={isMobile}
              disabled={filtrosAplicadosConsumo}
            >
              {productos.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Desde"
                value={filtroDesdeConsumo}
                onChange={setFiltroDesdeConsumo}
                renderInput={params => <TextField {...params} size="small" sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }} InputProps={{ ...params.InputProps, sx: { height: 36, fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} fullWidth={isMobile} disabled={filtrosAplicadosConsumo} />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicadosConsumo}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHastaConsumo}
                onChange={setFiltroHastaConsumo}
                renderInput={params => <TextField {...params} size="small" sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }} InputProps={{ ...params.InputProps, sx: { height: 36, fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} fullWidth={isMobile} disabled={filtrosAplicadosConsumo} />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicadosConsumo}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, width: '100%', maxWidth: 900 }}>
            <Button variant="contained" color="primary" sx={{ fontWeight: 600 }}
              disabled={filtrosEnEstadoInicialConsumo || filtrosAplicadosConsumo}
              onClick={handleAplicarFiltrosConsumo}
            >Aplicar filtros</Button>
            <Button variant="outlined" color="primary" sx={{ fontWeight: 600 }}
              disabled={filtrosEnEstadoInicialConsumo || !filtrosAplicadosConsumo}
              onClick={handleLimpiarFiltrosConsumo}
            >Limpiar filtros</Button>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 1, maxWidth: 900, mx: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Fecha</TableCell>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Producto</TableCell>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Cantidad</TableCell>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Importe Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsConsumoToShow.slice(pageConsumo * rowsPerPageConsumo, pageConsumo * rowsPerPageConsumo + rowsPerPageConsumo).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.fecha}</TableCell>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.producto}</TableCell>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.cantidad}</TableCell>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={rowsConsumoToShow.length}
              page={pageConsumo}
              onPageChange={(_, newPage) => setPageConsumo(newPage)}
              rowsPerPage={rowsPerPageConsumo}
              onRowsPerPageChange={e => { setRowsPerPageConsumo(parseInt(e.target.value, 10)); setPageConsumo(0); }}
              rowsPerPageOptions={[10]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
        </Box>
      )}
      {/* HISTORIAL DE ABONOS */}
      {tab === 1 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            mb: 1,
            alignItems: isMobile ? 'stretch' : 'center',
            width: '100%',
            maxWidth: 900,
          }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Desde"
                value={filtroDesdeComp}
                onChange={setFiltroDesdeComp}
                renderInput={params => <TextField {...params} size="small" sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }} InputProps={{ ...params.InputProps, sx: { height: 36, fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} fullWidth={isMobile} disabled={filtrosAplicadosAbonos} />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicadosAbonos}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Hasta"
                value={filtroHastaComp}
                onChange={setFiltroHastaComp}
                renderInput={params => <TextField {...params} size="small" sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }} InputProps={{ ...params.InputProps, sx: { height: 36, fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} fullWidth={isMobile} disabled={filtrosAplicadosAbonos} />}
                inputFormat="DD/MM/YYYY"
                disabled={filtrosAplicadosAbonos}
              />
            </LocalizationProvider>
            <TextField
              label="Monto abonado mínimo"
              value={filtroMontoMin}
              onChange={handleMontoMinChange}
              size="small"
              type="number"
              sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }}
              InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>S/.</span>, sx: { height: 36, fontSize: 14 } }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
              fullWidth={isMobile}
              disabled={filtrosAplicadosAbonos}
              error={!!errorMontoMin}
              helperText={errorMontoMin}
              inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$' }}
            />
            <TextField
              label="Monto abonado máximo"
              value={filtroMontoMax}
              onChange={handleMontoMaxChange}
              size="small"
              type="number"
              sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }}
              InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>S/.</span>, sx: { height: 36, fontSize: 14 } }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
              fullWidth={isMobile}
              disabled={filtrosAplicadosAbonos}
              error={!!errorMontoMax}
              helperText={errorMontoMax}
              inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$' }}
            />
            <TextField
              select
              label="Medio de pago"
              value={filtroMedioPago}
              onChange={e => setFiltroMedioPago(e.target.value)}
              size="small"
              sx={{ minWidth: isMobile ? 'unset' : 120, maxWidth: 140, width: isMobile ? '100%' : undefined }}
              InputProps={{ sx: { height: 36, fontSize: 14 } }}
              InputLabelProps={{ sx: { fontSize: 14 } }}
              fullWidth={isMobile}
              disabled={filtrosAplicadosAbonos}
            >
              {mediosPago.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, width: '100%', maxWidth: 900 }}>
            <Button variant="contained" color="primary" sx={{ fontWeight: 600 }}
              disabled={filtrosEnEstadoInicialAbonos || filtrosAplicadosAbonos}
              onClick={handleAplicarFiltrosAbonos}
            >Aplicar filtros</Button>
            <Button variant="outlined" color="primary" sx={{ fontWeight: 600 }}
              disabled={filtrosEnEstadoInicialAbonos || !filtrosAplicadosAbonos}
              onClick={handleLimpiarFiltrosAbonos}
            >Limpiar filtros</Button>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: 1, maxWidth: 900, mx: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Código de abono</TableCell>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Fecha</TableCell>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Monto abonado</TableCell>
                  <TableCell sx={{ fontSize: 15, py: 1 }}>Medio de pago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Cargando abonos...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" color="error">{error}</TableCell>
                  </TableRow>
                ) : abonos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No hay abonos registrados</TableCell>
                  </TableRow>
                ) : (
                  abonos.slice(pageComp * rowsPerPageComp, pageComp * rowsPerPageComp + rowsPerPageComp).map((abono, idx) => (
                    <TableRow key={abono.idAbono || idx}>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>{abono.numRecibo}</TableCell>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>{dayjs(abono.fechaAbono).format('DD/MM/YYYY')}</TableCell>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>S/. {Number(abono.importeAbono).toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>{abono.nombreBanco || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={abonos.length}
              page={pageComp}
              onPageChange={(_, newPage) => setPageComp(newPage)}
              rowsPerPage={rowsPerPageComp}
              onRowsPerPageChange={e => { setRowsPerPageComp(parseInt(e.target.value, 10)); setPageComp(0); }}
              rowsPerPageOptions={[10]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
        </Box>
      )}
      {/* MI SALDO / RECARGAR SALDO */}
      {tab === 2 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <Typography>Cargando información del saldo...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" color="primary" sx={{ fontWeight: 600, borderRadius: 2 }} onClick={handleAbrirRecarga}>
                  + Recargar saldo
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
                  <CardContent>
                    <Typography color="text.secondary" fontSize={14} gutterBottom>
                      {datosCliente?.contratoVigente ? 
                        `Actualizado al ${dayjs(datosCliente.contratoVigente.fechaCreacion).format('DD/MM/YYYY')}` : 
                        'Sin contrato vigente'
                      }
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>Saldo</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {datosCliente?.contratoVigente ? 
                        `S/. ${Number(datosCliente.contratoVigente.importeSaldo).toFixed(2)}` : 
                        'S/. 0.00'
                      }
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
                  <CardContent>
                    <Typography color="text.secondary" fontSize={14} gutterBottom>
                      {datosCliente?.contratoVigente ? 
                        `Actualizado al ${dayjs(datosCliente.contratoVigente.fechaCreacion).format('DD/MM/YYYY')}` : 
                        'Sin contrato vigente'
                      }
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>Deuda pendiente</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      {datosCliente?.contratoVigente && Number(datosCliente.contratoVigente.importeSaldo) < 0 ? 
                        `S/. ${Math.abs(Number(datosCliente.contratoVigente.importeSaldo)).toFixed(2)}` : 
                        'S/. 0.00'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
                  <CardContent>
                    <Typography color="text.secondary" fontSize={14} gutterBottom>
                      {datosCliente?.contratoVigente ? 
                        `Actualizado al ${dayjs(datosCliente.contratoVigente.fechaCreacion).format('DD/MM/YYYY')}` : 
                        'Sin contrato vigente'
                      }
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>Medios de pago</Typography>
                    <Typography variant="body1">Yape, Plin, Transferencia</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
                  <CardContent>
                    <Typography color="text.secondary" fontSize={14} gutterBottom>
                      {datosCliente?.contratoVigente ? 
                        `Actualizado al ${dayjs(datosCliente.contratoVigente.fechaCreacion).format('DD/MM/YYYY')}` : 
                        'Sin contrato vigente'
                      }
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>Nuestras cuentas bancarias</Typography>
                    <Typography variant="body1">BCP: 123-4567890-0-12<br/>Interbank: 123-4567890-0-13</Typography>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}
        </Box>
      )}
      {/* Modal de recarga de saldo */}
      <Dialog open={openRecarga} onClose={handleCerrarRecarga} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>Recargar saldo</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Monto a recargar"
            type="text"
            value={montoRecarga}
            onChange={handleMontoChange}
            fullWidth
            margin="normal"
            size="small"
            InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>S/.</span> }}
            disabled={loadingRecarga || !!urlPago}
            error={!!errorMonto}
            helperText={errorMonto || 'Usa punto (.) como separador decimal. Ejemplo: 10.50'}
            inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$' }}
          />
          {urlPago && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                href={urlPago}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 600 }}
              >
                Ir a Mercado Pago
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Serás redirigido a la pasarela de pago de Mercado Pago para completar la recarga.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleCerrarRecarga} color="primary" sx={{ fontWeight: 600 }} disabled={loadingRecarga}>
            Cancelar
          </Button>
          {!urlPago && (
            <Button
              onClick={handleConfirmarRecarga}
              color="primary"
              variant="contained"
              sx={{ fontWeight: 600 }}
              disabled={!montoRecarga || Number(montoRecarga) <= 0 || loadingRecarga || !!errorMonto}
            >
              {loadingRecarga ? 'Procesando...' : 'Continuar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MiCuenta;

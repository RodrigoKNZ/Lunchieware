import React from 'react';
import {
  Box, Typography, Tabs, Tab, Divider, TextField, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, useMediaQuery, Card, CardContent, Breadcrumbs, IconButton
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
import comprobanteVentaService from '../services/comprobanteVentaService';
import cuentasBancariasService from '../services/cuentasBancariasService';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

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
  const [historialConsumo, setHistorialConsumo] = React.useState([]);
  const [cuentasBancarias, setCuentasBancarias] = React.useState([]);

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
          
          // Cargar cuentas bancarias
          try {
            const respCuentas = await cuentasBancariasService.listarTodas();
            const cuentas = respCuentas.data?.data || [];
            setCuentasBancarias(cuentas);
          } catch (err) {
            console.error('Error cargando cuentas bancarias:', err);
            setCuentasBancarias([]);
          }
          
          // Cargar historial de consumos reales
          if (datos.contratoVigente && datos.contratoVigente.idContrato) {
            const resp = await comprobanteVentaService.obtenerPorContrato(datos.contratoVigente.idContrato);
            const comprobantes = resp.data?.data || [];
            // Mapear a formato de la tabla
            const consumos = [];
            comprobantes.forEach(comprobante => {
              if (Array.isArray(comprobante.detalles)) {
                comprobante.detalles.forEach(det => {
                  consumos.push({
                    fecha: dayjs(comprobante.fechaDocumento).format('DD/MM/YYYY'),
                    producto: det.nombreProducto || 'Producto',
                    cantidad: det.cantidad,
                    total: `S/. ${Number(det.importeTotal).toFixed(2)}`
                  });
                });
              }
            });
            setHistorialConsumo(consumos);
          } else {
            setHistorialConsumo([]);
          }
        }
      } catch (err) {
        setError('Error al cargar los datos del cliente');
        setHistorialConsumo([]);
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

  // Paginación
  const [pageConsumo, setPageConsumo] = React.useState(0);
  const [rowsPerPageConsumo, setRowsPerPageConsumo] = React.useState(10);
  const [pageComp, setPageComp] = React.useState(0);
  const [rowsPerPageComp, setRowsPerPageComp] = React.useState(10);

  // Estados iniciales para filtros
  const filtrosInicialesConsumo = { producto: 'todos', desde: null, hasta: null };
  const filtrosInicialesAbonos = { desde: null, hasta: null, montoMin: '', montoMax: '' };
  // Determinar si los filtros están en su estado inicial
  const filtrosEnEstadoInicialConsumo =
    filtroProducto === filtrosInicialesConsumo.producto &&
    !filtroDesdeConsumo &&
    !filtroHastaConsumo;
  const filtrosEnEstadoInicialAbonos =
    !filtroDesdeComp &&
    !filtroHastaComp &&
    filtroMontoMin === '' &&
    filtroMontoMax === '';
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
  }, [filtrosConsumo, historialConsumo]);

  // Mostrar todos los datos si no hay filtros aplicados
  const rowsConsumoToShow = filtrosAplicadosConsumo ? consumoFiltrado : historialConsumo;

  // Agrupar cuentas bancarias por banco (solo cuentas de recaudación disponibles)
  const cuentasAgrupadasPorBanco = React.useMemo(() => {
    const agrupadas = {};
    cuentasBancarias.forEach(cuenta => {
      // Solo incluir cuentas de recaudación que estén disponibles
      if (cuenta.tipoCuenta === 'Recaudación' && cuenta.disponible) {
        if (!agrupadas[cuenta.nombreBanco]) {
          agrupadas[cuenta.nombreBanco] = [];
        }
        agrupadas[cuenta.nombreBanco].push(cuenta);
      }
    });
    return agrupadas;
  }, [cuentasBancarias]);

  // Filtrado de abonos reales
  const comprobantesFiltrados = React.useMemo(() => {
    if (!filtrosAplicadosAbonos) {
      return abonos;
    }
    return abonos.filter(row => {
      let match = true;
      // Filtro por fecha desde
      if (filtroDesdeComp) {
        const fechaRow = dayjs(row.fechaAbono || row.fecha, 'DD/MM/YYYY');
        const desde = dayjs(filtroDesdeComp).startOf('day');
        match = match && (fechaRow.isSame(desde, 'day') || fechaRow.isAfter(desde, 'day'));
      }
      // Filtro por fecha hasta
      if (filtroHastaComp) {
        const fechaRow = dayjs(row.fechaAbono || row.fecha, 'DD/MM/YYYY');
        const hasta = dayjs(filtroHastaComp).endOf('day');
        match = match && (fechaRow.isSame(hasta, 'day') || fechaRow.isBefore(hasta, 'day'));
      }
      // Filtro por monto mínimo
      if (filtroMontoMin && filtroMontoMin !== '') {
        const montoRow = parseFloat(row.importeAbono || row.monto || 0);
        const montoMin = parseFloat(filtroMontoMin);
        match = match && montoRow >= montoMin;
      }
      // Filtro por monto máximo
      if (filtroMontoMax && filtroMontoMax !== '') {
        const montoRow = parseFloat(row.importeAbono || row.monto || 0);
        const montoMax = parseFloat(filtroMontoMax);
        match = match && montoRow <= montoMax;
      }
      return match;
    });
  }, [filtrosAplicadosAbonos, abonos, filtroDesdeComp, filtroHastaComp, filtroMontoMin, filtroMontoMax]);

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
      if (monto < 5) {
        setErrorMonto('El monto mínimo es S/. 5.00');
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
      if (datosCliente && datosCliente.cliente && datosCliente.cliente.idCliente) {
        clienteId = datosCliente.cliente.idCliente;
      }

      // Log detallado para depuración
      console.log('[Recarga] Usuario logueado:', localStorage.getItem('user'));
      console.log('[Recarga] Objeto datosCliente:', datosCliente);
      console.log('[Recarga] clienteId que se enviará a Mercado Pago:', clienteId);
      
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
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', pl: isMobile ? 1 : 3, mb: 4 }}>
      {/* Header y breadcrumb unificado */}
      {!isMobile && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2, mt: 0 }}>
          <IconButton component={RouterLink} to="/inicio" size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <HomeIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography color="text.primary">Mi cuenta</Typography>
        </Breadcrumbs>
      )}
      <Typography variant="h4" fontWeight={500} sx={{ mb: 1, textAlign: 'left' }}>
        {nombreCliente}
      </Typography>
      {/* Tabs de la sección */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40, mb: 2 }}>
        <Tab label="Historial de consumo" sx={{ fontWeight: 500, minWidth: 180 }} />
        <Tab label="Historial de abonos" sx={{ fontWeight: 500, minWidth: 200 }} />
        <Tab label="Mi saldo / Recargar saldo" sx={{ fontWeight: 500, minWidth: 240 }} />
      </Tabs>
      <Divider sx={{ mb: 3, width: '100%' }} />
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
                  comprobantesFiltrados.slice(pageComp * rowsPerPageComp, pageComp * rowsPerPageComp + rowsPerPageComp).map((abono, idx) => (
                    <TableRow key={abono.idAbono || idx}>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>{abono.numRecibo}</TableCell>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>{dayjs(abono.fechaAbono).format('DD/MM/YYYY')}</TableCell>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>S/. {Number(abono.importeAbono).toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: 14, py: 0.5 }}>{abono.tipoCuenta || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={comprobantesFiltrados.length}
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
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800, mx: 'auto' }}>
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
              <Box sx={{ maxWidth: 620, mx: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2 }}>
                  <Card sx={{ minWidth: 300, maxWidth: 300, flex: 1 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600}>Saldo</Typography>
                      <Typography variant="h5" fontWeight={700} color="success.dark">
                        {datosCliente?.contratoVigente ?
                          `S/. ${Number(datosCliente.contratoVigente.importeSaldo).toFixed(2)}` :
                          'S/. 0.00'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 300, maxWidth: 300, flex: 1 }}>
                    <CardContent>
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
                <Card sx={{ width: '100%', boxShadow: 1, my: 0, minWidth: 300, maxWidth: 620 }}>
                  <CardContent sx={{ pb: 0.25, pt: 1.5, px: 2 }}>
                    <Typography variant="h6" fontWeight={600}>Nuestras cuentas bancarias</Typography>
                    {Object.keys(cuentasAgrupadasPorBanco).length > 0 ? (
                      <Box sx={{ mt: 0.5, mb: 0 }}>
                        {Object.entries(cuentasAgrupadasPorBanco).map(([nombreBanco, cuentas]) => (
                          <Box key={nombreBanco} sx={{ mb: 0.25 }}>
                            <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ mb: 0.1 }}>
                              {nombreBanco}
                            </Typography>
                            {cuentas.map((cuenta, index) => (
                              <Typography key={cuenta.idCuenta} variant="body2" sx={{ ml: 2, mb: 0 }}>
                                Recaudación: {cuenta.codigoCuenta}
                              </Typography>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay cuentas bancarias disponibles
                      </Typography>
                    )}
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

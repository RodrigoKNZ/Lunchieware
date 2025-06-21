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

const nombreUsuario = 'Oscar Rodrigo Canez Rodriguez';

const productos = [
  { value: 'todos', label: 'Todos' },
  { value: 'menu', label: 'Menú' },
  { value: 'carta', label: 'Plato a la carta' },
];
const mediosPago = [
  { value: 'todos', label: 'Todos' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'transferencia', label: 'Transferencia' },
];

// Datos simulados para las tablas
const historialConsumo = [
  { fecha: '20/03/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '19/03/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '18/03/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '17/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '16/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '13/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '12/03/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '11/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '10/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '09/03/2025', producto: 'Menú', cantidad: 1, total: 'S/. 10.50' },
  { fecha: '06/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '05/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '04/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
  { fecha: '03/03/2025', producto: 'Plato a la carta', cantidad: 1, total: 'S/. 13.50' },
];
const comprobantesPago = Array.from({ length: 13 }, (_, i) => ({ codigo: `ABN00${i+1}`, fecha: 'Cell', monto: 'Cell', medio: 'Cell' }));

function aDate(str) {
  // Convierte DD/MM/YYYY a dayjs
  const [d, m, y] = str.split('/');
  return dayjs(`${y}-${m}-${d}`);
}

const MiCuenta = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = React.useState(0);

  // Filtros historial consumo
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

  // Estados para control de filtros aplicados
  const [filtrosAplicadosConsumo, setFiltrosAplicadosConsumo] = React.useState(false);
  const [filtrosAplicadosAbonos, setFiltrosAplicadosAbonos] = React.useState(false);
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
    setFiltrosAplicadosConsumo(true);
  };
  const handleLimpiarFiltrosConsumo = () => {
    setFiltroProducto(filtrosInicialesConsumo.producto);
    setFiltroDesdeConsumo(filtrosInicialesConsumo.desde);
    setFiltroHastaConsumo(filtrosInicialesConsumo.hasta);
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

  // Filtrado de historial de consumo
  const consumoFiltrado = historialConsumo.filter(row => {
    let match = true;
    if (filtroProducto !== 'todos') match = match && (row.producto === (filtroProducto === 'menu' ? 'Menú' : 'Plato a la carta'));
    if (filtroDesdeConsumo) match = match && (aDate(row.fecha).isSameOrAfter(filtroDesdeConsumo, 'day'));
    if (filtroHastaConsumo) match = match && (aDate(row.fecha).isSameOrBefore(filtroHastaConsumo, 'day'));
    return match;
  });

  // Filtrado de comprobantes (simulado)
  const comprobantesFiltrados = comprobantesPago.filter(row => {
    let match = true;
    // Aquí podrías agregar lógica real de filtrado por fecha, monto y medio de pago
    return match;
  });

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
  const handleConfirmarRecarga = () => {
    setLoadingRecarga(true);
    setErrorMonto('');
    // Simular llamada al backend para obtener URL de pago
    setTimeout(() => {
      setUrlPago('https://www.mercadopago.com.pe/checkout/v1/redirect?preference-id=dummy123');
      setLoadingRecarga(false);
    }, 1200);
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
        <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>{nombreUsuario}</Typography>
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
                {consumoFiltrado.slice(pageConsumo * rowsPerPageConsumo, pageConsumo * rowsPerPageConsumo + rowsPerPageConsumo).map((row, idx) => (
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
              count={consumoFiltrado.length}
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
                {comprobantesFiltrados.slice(pageComp * rowsPerPageComp, pageComp * rowsPerPageComp + rowsPerPageComp).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.codigo}</TableCell>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.fecha}</TableCell>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.monto}</TableCell>
                    <TableCell sx={{ fontSize: 14, py: 0.5 }}>{row.medio}</TableCell>
                  </TableRow>
                ))}
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
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="primary" sx={{ fontWeight: 600, borderRadius: 2 }} onClick={handleAbrirRecarga}>
              + Recargar saldo
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <CardContent>
                <Typography color="text.secondary" fontSize={14} gutterBottom>Actualizado al 20/04/2025</Typography>
                <Typography variant="h6" fontWeight={600}>Saldo</Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">S/. 20.00</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <CardContent>
                <Typography color="text.secondary" fontSize={14} gutterBottom>Actualizado al 20/04/2025</Typography>
                <Typography variant="h6" fontWeight={600}>Deuda pendiente</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">S/. 0.00</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <CardContent>
                <Typography color="text.secondary" fontSize={14} gutterBottom>Actualizado al 20/04/2025</Typography>
                <Typography variant="h6" fontWeight={600}>Medios de pago</Typography>
                <Typography variant="body1">Yape, Plin, Transferencia</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: '1 1 300px', minWidth: 280 }}>
              <CardContent>
                <Typography color="text.secondary" fontSize={14} gutterBottom>Actualizado al 20/04/2025</Typography>
                <Typography variant="h6" fontWeight={600}>Nuestras cuentas bancarias</Typography>
                <Typography variant="body1">BCP: 123-4567890-0-12<br/>Interbank: 123-4567890-0-13</Typography>
              </CardContent>
            </Card>
          </Box>
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

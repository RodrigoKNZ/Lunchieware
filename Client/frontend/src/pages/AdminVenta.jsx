import React from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider, IconButton, MenuItem, Select, InputLabel, FormControl, RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const productos = [
  { value: 'menu', label: 'Menú', codigo: '0001', precio: 14.00 },
  { value: 'carta', label: 'Plato a la carta', codigo: '0002', precio: 16.00 },
];
const mediosPago = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
];

const AdminVenta = () => {
  // Estados simulados
  const [producto, setProducto] = React.useState('menu');
  const [cantidad, setCantidad] = React.useState(1);
  const [medioPago, setMedioPago] = React.useState('efectivo');
  const [montoRecibido, setMontoRecibido] = React.useState('20.00');
  const [formaPago, setFormaPago] = React.useState('contado');
  const [cliente, setCliente] = React.useState({ codigo: '', nombre: '' });
  const [infoContrato, setInfoContrato] = React.useState('');

  const prod = productos.find(p => p.value === producto);
  const subtotal = prod ? prod.precio * cantidad : 0;
  const total = subtotal;
  const vuelto = medioPago === 'efectivo' ? (parseFloat(montoRecibido) - total).toFixed(2) : '0.00';

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fafbfc', p: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, mb: 1, ml: 4 }}>
        <Typography color="text.secondary" fontSize={18}>/</Typography>
        <Typography color="text.secondary" fontSize={18}>Venta</Typography>
      </Box>
      <Typography variant="h4" fontWeight={600} sx={{ ml: 4, mb: 2 }}>Venta</Typography>
      <Divider sx={{ mb: 3, ml: 4, mr: 4 }} />
      <Box sx={{ display: 'flex', gap: 3, px: 4, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Información del cliente */}
          <Paper elevation={2} sx={{ p: 3, mb: 1 }}>
            <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>Información del cliente</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField label="Código" size="small" value={cliente.codigo} sx={{ flex: 1 }} />
              <TextField label="Nombre del cliente" size="small" value={cliente.nombre} sx={{ flex: 2 }} />
              <Button variant="contained" startIcon={<SearchIcon />} sx={{ fontWeight: 600, minWidth: 160, mr: 1 }}>
                Buscar cliente
              </Button>
              <Button variant="contained" startIcon={<CreditCardIcon />} sx={{ fontWeight: 600, minWidth: 180 }}>
                Escanear carnet
              </Button>
            </Box>
            <TextField
              label="Información del contrato"
              size="small"
              value={infoContrato}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Paper>
          {/* Detalle de venta */}
          <Paper elevation={2} sx={{ p: 3 }}>
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
                  <TableRow>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Nombre corto</InputLabel>
                        <Select
                          value={producto}
                          label="Nombre corto"
                          onChange={e => setProducto(e.target.value)}
                        >
                          {productos.map(p => (
                            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{prod?.codigo || ''}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={cantidad}
                        onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1, style: { width: 60 } }}
                      />
                    </TableCell>
                    <TableCell>S/. {prod?.precio.toFixed(2)}</TableCell>
                    <TableCell>S/. {subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2, fontWeight: 600 }}>
              Agregar producto
            </Button>
          </Paper>
        </Box>
        {/* Panel lateral derecho */}
        <Paper elevation={2} sx={{ flex: 1, p: 3, minWidth: 320, maxWidth: 340 }}>
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>Forma de pago</Typography>
          <RadioGroup
            value={formaPago}
            onChange={e => setFormaPago(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="cuenta" control={<Radio />} label="Pago con cargo en cuenta" />
            <FormControlLabel value="contado" control={<Radio />} label="Pago al contado" />
          </RadioGroup>
          <Divider sx={{ mb: 2 }} />
          <Typography fontWeight={500} sx={{ mb: 1 }}>Documento de venta</Typography>
          <Typography variant="body2">Tipo de documento: Nota de venta</Typography>
          <Typography variant="body2">Serie: 2025</Typography>
          <Typography variant="body2">Nro. comprobante: 00064943</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Fecha: 12/05/2025</Typography>
          <Typography fontWeight={500} sx={{ mb: 1 }}>Medio de pago</Typography>
          <FormControl size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel>Medio de pago</InputLabel>
            <Select
              value={medioPago}
              label="Medio de pago"
              onChange={e => setMedioPago(e.target.value)}
              disabled={formaPago === 'cuenta'}
            >
              {mediosPago.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Monto recibido"
            size="small"
            value={medioPago === 'efectivo' ? montoRecibido : ''}
            onChange={e => setMontoRecibido(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={medioPago !== 'efectivo' || formaPago === 'cuenta'}
          />
          <Divider sx={{ mb: 2 }} />
          <Typography fontWeight={500} sx={{ mb: 1 }}>Resumen</Typography>
          <Typography variant="body2">Total a pagar: <Box component="span" color="primary.main" fontWeight={600}>S/.{total.toFixed(2)}</Box></Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Vuelto: <Box component="span" color="primary.main" fontWeight={600}>S/.{vuelto}</Box></Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 600, mb: 1 }}>
            ✓ Confirmar venta
          </Button>
          <Button variant="outlined" color="primary" fullWidth sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminVenta; 
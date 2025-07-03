import React, { useState } from 'react';
import { Box, Paper, Typography, Tabs, Tab, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../config/api';

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString();
}

export default function AdminReportes() {
  const [tab, setTab] = useState(0);
  // Liquidación diaria
  const [fechaLD, setFechaLD] = useState(null);
  const [dataLD, setDataLD] = useState(null);
  const [errorLD, setErrorLD] = useState('');
  // Consumo profesores
  const [desdeCP, setDesdeCP] = useState(null);
  const [hastaCP, setHastaCP] = useState(null);
  const [dataCP, setDataCP] = useState(null);
  const [errorCP, setErrorCP] = useState('');
  // Cobranzas
  const [desdeCO, setDesdeCO] = useState(null);
  const [hastaCO, setHastaCO] = useState(null);
  const [dataCO, setDataCO] = useState(null);
  const [errorCO, setErrorCO] = useState('');

  // --- PDF helpers ---
  const exportPDF = (columns, rows, title) => {
    const doc = new jsPDF();
    doc.text(title, 14, 16);
    doc.autoTable({ head: [columns], body: rows, startY: 22 });
    doc.save(`${title.replace(/ /g, '_')}.pdf`);
  };

  // --- Liquidación Diaria ---
  const handleGenerarLD = async () => {
    setErrorLD(''); setDataLD(null);
    try {
      const fecha = fechaLD ? dayjs(fechaLD).format('YYYY-MM-DD') : '';
      const res = await api.get('/reportes/liquidacion-diaria', { params: { fecha } });
      setDataLD(res.data);
    } catch (e) { setErrorLD('Error al obtener datos'); }
  };
  // --- Consumo Profesores ---
  const handleGenerarCP = async () => {
    setErrorCP(''); setDataCP(null);
    try {
      const desde = desdeCP ? dayjs(desdeCP).format('YYYY-MM-DD') : '';
      const hasta = hastaCP ? dayjs(hastaCP).format('YYYY-MM-DD') : '';
      const res = await api.get('/reportes/consumo-profesores', { params: { desde, hasta } });
      setDataCP(res.data);
    } catch (e) { setErrorCP('Error al obtener datos'); }
  };
  // --- Cobranzas ---
  const handleGenerarCO = async () => {
    setErrorCO(''); setDataCO(null);
    try {
      const desde = desdeCO ? dayjs(desdeCO).format('YYYY-MM-DD') : '';
      const hasta = hastaCO ? dayjs(hastaCO).format('YYYY-MM-DD') : '';
      const res = await api.get('/reportes/cobranzas', { params: { desde, hasta } });
      setDataCO(res.data);
    } catch (e) { setErrorCO('Error al obtener datos'); }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Reportes administrativos</Typography>
      <Paper sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Liquidación diaria de caja" />
          <Tab label="Consumo de profesores" />
          <Tab label="Cobranzas" />
        </Tabs>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Liquidación diaria */}
          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <DatePicker label="Fecha" value={fechaLD} onChange={setFechaLD} format="DD/MM/YYYY" renderInput={(params) => <TextField {...params} />} />
                <Button variant="contained" onClick={handleGenerarLD} disabled={!fechaLD}>Generar</Button>
                {dataLD && <Button variant="outlined" onClick={() => exportPDF([
                  'Fecha', 'Código', 'Nombres', 'Tipo comprobante', 'N° Serie', 'N° Comprobante', 'Producto', 'Saldo día anterior', 'Valor venta'
                ], dataLD.ventas.map(r => [r.fecha, r.codigoCliente, r.nombres, r.tipoComprobante, r.numeroSerie, r.numeroComprobante, r.producto, r.saldoDiaAnterior, r.valorVenta]), 'Liquidación diaria de caja')}>Exportar PDF</Button>}
              </Box>
              {errorLD && <Alert severity="error">{errorLD}</Alert>}
              {dataLD && (
                <Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Nombres</TableCell>
                        <TableCell>Tipo comprobante</TableCell>
                        <TableCell>N° Serie</TableCell>
                        <TableCell>N° Comprobante</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell>Saldo día anterior</TableCell>
                        <TableCell>Valor venta</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataLD.ventas.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.fecha}</TableCell>
                          <TableCell>{r.codigoCliente}</TableCell>
                          <TableCell>{r.nombres}</TableCell>
                          <TableCell>{r.tipoComprobante}</TableCell>
                          <TableCell>{r.numeroSerie}</TableCell>
                          <TableCell>{r.numeroComprobante}</TableCell>
                          <TableCell>{r.producto}</TableCell>
                          <TableCell>{r.saldoDiaAnterior}</TableCell>
                          <TableCell>{r.valorVenta}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Typography mt={2} fontWeight={600}>Total ingresos: S/ {dataLD.total.toFixed(2)}</Typography>
                  <Typography mt={1} fontSize={13} color="text.secondary">Generado: {new Date().toLocaleString()}</Typography>
                </Box>
              )}
            </Box>
          )}
          {/* Consumo profesores */}
          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <DatePicker label="Desde" value={desdeCP} onChange={setDesdeCP} format="DD/MM/YYYY" renderInput={(params) => <TextField {...params} />} />
                <DatePicker label="Hasta" value={hastaCP} onChange={setHastaCP} format="DD/MM/YYYY" renderInput={(params) => <TextField {...params} />} />
                <Button variant="contained" onClick={handleGenerarCP} disabled={!desdeCP || !hastaCP}>Generar</Button>
                {dataCP && <Button variant="outlined" onClick={() => exportPDF([
                  'Código', 'Nombres', 'Pagado', 'Consumido', 'Saldo', 'Fecha consumo', 'Total acumulado'
                ], dataCP.map(r => [r.codigoCliente, r.nombres, r.montoPagado, r.montoConsumido, r.saldoRestante, r.fechaConsumo, r.totalAcumulado]), 'Consumo de profesores')}>Exportar PDF</Button>}
              </Box>
              {errorCP && <Alert severity="error">{errorCP}</Alert>}
              {dataCP && (
                <Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Nombres</TableCell>
                        <TableCell>Pagado</TableCell>
                        <TableCell>Consumido</TableCell>
                        <TableCell>Saldo</TableCell>
                        <TableCell>Fecha consumo</TableCell>
                        <TableCell>Total acumulado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataCP.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.codigoCliente}</TableCell>
                          <TableCell>{r.nombres}</TableCell>
                          <TableCell>{r.montoPagado}</TableCell>
                          <TableCell>{r.montoConsumido}</TableCell>
                          <TableCell>{r.saldoRestante}</TableCell>
                          <TableCell>{r.fechaConsumo}</TableCell>
                          <TableCell>{r.totalAcumulado}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
          {/* Cobranzas */}
          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <DatePicker label="Desde" value={desdeCO} onChange={setDesdeCO} format="DD/MM/YYYY" renderInput={(params) => <TextField {...params} />} />
                <DatePicker label="Hasta" value={hastaCO} onChange={setHastaCO} format="DD/MM/YYYY" renderInput={(params) => <TextField {...params} />} />
                <Button variant="contained" onClick={handleGenerarCO} disabled={!desdeCO || !hastaCO}>Generar</Button>
                {dataCO && <Button variant="outlined" onClick={() => exportPDF([
                  'Código', 'Nombre', 'Nivel', 'Grado', 'Sección', 'Fecha depósito', 'N° recibo', 'Importe', 'Banco', 'Cuenta', 'Tipo registro'
                ], dataCO.map(r => [r.codigoCliente, r.nombres, r.nivel, r.grado, r.seccion, r.fechaDeposito, r.numeroRecibo, r.importeDepositado, r.banco, r.numeroCuenta, r.tipoRegistro]), 'Cobranzas')}>Exportar PDF</Button>}
              </Box>
              {errorCO && <Alert severity="error">{errorCO}</Alert>}
              {dataCO && (
                <Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Nivel</TableCell>
                        <TableCell>Grado</TableCell>
                        <TableCell>Sección</TableCell>
                        <TableCell>Fecha depósito</TableCell>
                        <TableCell>N° recibo</TableCell>
                        <TableCell>Importe</TableCell>
                        <TableCell>Banco</TableCell>
                        <TableCell>Cuenta</TableCell>
                        <TableCell>Tipo registro</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataCO.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.codigoCliente}</TableCell>
                          <TableCell>{r.nombres}</TableCell>
                          <TableCell>{r.nivel}</TableCell>
                          <TableCell>{r.grado}</TableCell>
                          <TableCell>{r.seccion}</TableCell>
                          <TableCell>{r.fechaDeposito}</TableCell>
                          <TableCell>{r.numeroRecibo}</TableCell>
                          <TableCell>{r.importeDepositado}</TableCell>
                          <TableCell>{r.banco}</TableCell>
                          <TableCell>{r.numeroCuenta}</TableCell>
                          <TableCell>{r.tipoRegistro}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </LocalizationProvider>
      </Paper>
    </Box>
  );
} 
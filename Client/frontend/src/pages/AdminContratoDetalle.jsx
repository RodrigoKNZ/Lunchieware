import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, Grid, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Select, MenuItem, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const mockConsumos = [
    {
        fechaConsumo: '20/03/2025',
        producto: 'Menú',
        tipoComprobante: 'Nota de venta',
        numeroDocumento: 'B001-00064942',
        formaPago: 'Cargo en cuenta',
        medioPago: 'Cargo en cuenta',
        cantidad: 1,
        importeTotal: 'S/ 10.00'
    }
];

const mockAbonos = [
    {
        fechaAbono: '20/03/2025',
        banco: 'Banco de Crédito del Perú',
        cuenta: '539-2453972-0-47',
        tipoCuenta: 'Cuenta de recaudación',
        numeroRecibo: 'B001-00064942',
        importe: 'S/ 100.00',
        registroManual: 'No'
    }
]

const mockDevoluciones = [
    {
        fechaDevolucion: '20/03/2025',
        banco: 'Banco de Crédito del Perú',
        cuenta: '539-2453972-0-47',
        tipoCuenta: 'Cuenta de recaudación',
        numeroRecibo: 'B001-00064942',
        importe: 'S/ 100.00'
    }
];

const mockNotasDeCredito = [
    {
        fecha: '20/03/2025',
        nroNotaCredito: 'C001-00023112',
        nroComprobanteAfectado: 'B001-00064942',
        importeInafecto: 'S/ 20.00',
        importeImponible: 'S/ 20.00',
        importeImpuestos: 'S/ 3.40',
        importeTotal: 'S/ 43.40',
        motivo: 'Anulación de la operación'
    }
];

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
};

const AdminContratoDetalle = () => {
    const { id, contratoId } = useParams();
    const navigate = useNavigate();

    // Estados de UI
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados de datos
    const [consumos, setConsumos] = useState(mockConsumos);
    const [abonos, setAbonos] = useState(mockAbonos);
    const [devoluciones, setDevoluciones] = useState(mockDevoluciones);
    const [notasDeCredito, setNotasDeCredito] = useState(mockNotasDeCredito);

    // Estados de datos filtrados
    const [consumosFiltrados, setConsumosFiltrados] = useState(mockConsumos);
    const [abonosFiltrados, setAbonosFiltrados] = useState(mockAbonos);
    const [devolucionesFiltradas, setDevolucionesFiltradas] = useState(mockDevoluciones);
    const [notasDeCreditoFiltradas, setNotasDeCreditoFiltradas] = useState(mockNotasDeCredito);

    // Estados de filtros
    const [filtrosConsumos, setFiltrosConsumos] = useState({ 
        fechaDesde: null,
        fechaHasta: null,
        producto: 'Todos',
        formaPago: 'Todos',
        medioPago: 'Todos'
    });
    const [filtrosAbonos, setFiltrosAbonos] = useState({ 
        fechaDesde: null,
        fechaHasta: null,
        banco: 'Todos',
        importeMin: '',
        importeMax: ''
    });
    const [filtrosDevoluciones, setFiltrosDevoluciones] = useState({ 
        fechaDesde: null,
        fechaHasta: null,
        banco: 'Todos',
        importeMin: '',
        importeMax: ''
    });
    const [filtrosNotasCredito, setFiltrosNotasCredito] = useState({ fechaDesde: null, fechaHasta: null });
    
    // Estados de control de filtros
    const [filtrosAplicados, setFiltrosAplicados] = useState({ consumos: false, abonos: false, devoluciones: false, notasCredito: false });

    const filtrosIniciales = {
        fechaDesde: null,
        fechaHasta: null,
        producto: 'Todos',
        formaPago: 'Todos',
        medioPago: 'Todos',
        banco: 'Todos',
        importeMin: '',
        importeMax: ''
    };

    const sonFiltrosIniciales = (filtros) => {
        return filtros.fechaDesde === null && 
               filtros.fechaHasta === null &&
               filtros.producto === 'Todos' &&
               filtros.formaPago === 'Todos' &&
               filtros.medioPago === 'Todos' &&
               filtros.banco === 'Todos' &&
               filtros.importeMin === '' &&
               filtros.importeMax === '';
    };

    const sonFiltrosInicialesAbonos = (filtros) => {
        return filtros.fechaDesde === null && 
               filtros.fechaHasta === null &&
               filtros.banco === 'Todos' &&
               filtros.importeMin === '' &&
               filtros.importeMax === '';
    };

    const sonFiltrosInicialesDevoluciones = (filtros) => {
        return filtros.fechaDesde === null && 
               filtros.fechaHasta === null &&
               filtros.banco === 'Todos' &&
               filtros.importeMin === '' &&
               filtros.importeMax === '';
    };

    const sonFiltrosInicialesNotasCredito = (filtros) => {
        return filtros.fechaDesde === null && filtros.fechaHasta === null;
    };

    // Estados de modales
    const [abonoModalOpen, setAbonoModalOpen] = useState(false);
    const [nuevoAbono, setNuevoAbono] = useState({ fechaAbono: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });
    
    const [devolucionModalOpen, setDevolucionModalOpen] = useState(false);
    const [nuevaDevolucion, setNuevaDevolucion] = useState({ fechaDevolucion: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });

    const [notaCreditoModalOpen, setNotaCreditoModalOpen] = useState(false);
    const [nuevaNotaCredito, setNuevaNotaCredito] = useState({ fecha: null, nroNotaCredito: '', nroComprobanteAfectado: '', importeInafecto: '', importeImponible: '', importeImpuestos: '', importeTotal: '', motivo: '' });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Lógica de Filtros
    const handleAplicarFiltrosConsumos = () => {
        const filtrados = consumos.filter(c => {
            const fechaConsumo = dayjs(c.fechaConsumo, 'DD/MM/YYYY');
            const matchFecha = (!filtrosConsumos.fechaDesde || fechaConsumo.isSame(dayjs(filtrosConsumos.fechaDesde), 'day') || fechaConsumo.isAfter(dayjs(filtrosConsumos.fechaDesde))) &&
                   (!filtrosConsumos.fechaHasta || fechaConsumo.isSame(dayjs(filtrosConsumos.fechaHasta), 'day') || fechaConsumo.isBefore(dayjs(filtrosConsumos.fechaHasta)));
            
            const matchProducto = filtrosConsumos.producto === 'Todos' || c.producto === filtrosConsumos.producto;
            const matchFormaPago = filtrosConsumos.formaPago === 'Todos' || c.formaPago === filtrosConsumos.formaPago;
            const matchMedioPago = filtrosConsumos.medioPago === 'Todos' || c.medioPago === filtrosConsumos.medioPago;
            
            return matchFecha && matchProducto && matchFormaPago && matchMedioPago;
        });
        setConsumosFiltrados(filtrados);
        setFiltrosAplicados(prev => ({...prev, consumos: true}));
    };

    const handleLimpiarFiltrosConsumos = () => {
        setFiltrosConsumos({
            fechaDesde: null,
            fechaHasta: null,
            producto: 'Todos',
            formaPago: 'Todos',
            medioPago: 'Todos'
        });
        setConsumosFiltrados(consumos);
        setFiltrosAplicados(prev => ({...prev, consumos: false}));
    };

    const handleAplicarFiltrosAbonos = () => {
        const filtrados = abonos.filter(a => {
            const fechaAbono = dayjs(a.fechaAbono, 'DD/MM/YYYY');
            const matchFecha = (!filtrosAbonos.fechaDesde || fechaAbono.isSame(dayjs(filtrosAbonos.fechaDesde), 'day') || fechaAbono.isAfter(dayjs(filtrosAbonos.fechaDesde))) &&
                   (!filtrosAbonos.fechaHasta || fechaAbono.isSame(dayjs(filtrosAbonos.fechaHasta), 'day') || fechaAbono.isBefore(dayjs(filtrosAbonos.fechaHasta)));
            
            const matchBanco = filtrosAbonos.banco === 'Todos' || a.banco === filtrosAbonos.banco;
            const importe = parseFloat(a.importe.replace('S/ ', ''));
            const matchMin = !filtrosAbonos.importeMin || importe >= parseFloat(filtrosAbonos.importeMin);
            const matchMax = !filtrosAbonos.importeMax || importe <= parseFloat(filtrosAbonos.importeMax);
            
            return matchFecha && matchBanco && matchMin && matchMax;
        });
        setAbonosFiltrados(filtrados);
        setFiltrosAplicados(prev => ({ ...prev, abonos: true }));
    };

    const handleLimpiarFiltrosAbonos = () => {
        setFiltrosAbonos({
            fechaDesde: null,
            fechaHasta: null,
            banco: 'Todos',
            importeMin: '',
            importeMax: ''
        });
        setAbonosFiltrados(abonos);
        setFiltrosAplicados(prev => ({ ...prev, abonos: false }));
    };

    const handleAplicarFiltrosDevoluciones = () => {
        const filtrados = devoluciones.filter(d => {
            const fechaDevolucion = dayjs(d.fechaDevolucion, 'DD/MM/YYYY');
            const matchFecha = (!filtrosDevoluciones.fechaDesde || fechaDevolucion.isSame(dayjs(filtrosDevoluciones.fechaDesde), 'day') || fechaDevolucion.isAfter(dayjs(filtrosDevoluciones.fechaDesde))) &&
                   (!filtrosDevoluciones.fechaHasta || fechaDevolucion.isSame(dayjs(filtrosDevoluciones.fechaHasta), 'day') || fechaDevolucion.isBefore(dayjs(filtrosDevoluciones.fechaHasta)));
            
            const matchBanco = filtrosDevoluciones.banco === 'Todos' || d.banco === filtrosDevoluciones.banco;
            const importe = parseFloat(d.importe.replace('S/ ', ''));
            const matchMin = !filtrosDevoluciones.importeMin || importe >= parseFloat(filtrosDevoluciones.importeMin);
            const matchMax = !filtrosDevoluciones.importeMax || importe <= parseFloat(filtrosDevoluciones.importeMax);
            
            return matchFecha && matchBanco && matchMin && matchMax;
        });
        setDevolucionesFiltradas(filtrados);
        setFiltrosAplicados(prev => ({ ...prev, devoluciones: true }));
    };

    const handleLimpiarFiltrosDevoluciones = () => {
        setFiltrosDevoluciones({
            fechaDesde: null,
            fechaHasta: null,
            banco: 'Todos',
            importeMin: '',
            importeMax: ''
        });
        setDevolucionesFiltradas(devoluciones);
        setFiltrosAplicados(prev => ({ ...prev, devoluciones: false }));
    };

    const handleAplicarFiltrosNotasCredito = () => {
        const filtrados = notasDeCredito.filter(n => {
            const fechaNota = dayjs(n.fecha, 'DD/MM/YYYY');
            const matchFecha = (!filtrosNotasCredito.fechaDesde || fechaNota.isSame(dayjs(filtrosNotasCredito.fechaDesde), 'day') || fechaNota.isAfter(dayjs(filtrosNotasCredito.fechaDesde))) &&
                   (!filtrosNotasCredito.fechaHasta || fechaNota.isSame(dayjs(filtrosNotasCredito.fechaHasta), 'day') || fechaNota.isBefore(dayjs(filtrosNotasCredito.fechaHasta)));
            return matchFecha;
        });
        setNotasDeCreditoFiltradas(filtrados);
        setFiltrosAplicados(prev => ({ ...prev, notasCredito: true }));
    };

    const handleLimpiarFiltrosNotasCredito = () => {
        setFiltrosNotasCredito(filtrosIniciales);
        setNotasDeCreditoFiltradas(notasDeCredito);
        setFiltrosAplicados(prev => ({ ...prev, notasCredito: false }));
    };

    // Lógica de Modales
    const handleGuardarAbono = () => {
        const nuevo = { ...nuevoAbono, fechaAbono: dayjs(nuevoAbono.fechaAbono).format('DD/MM/YYYY'), importe: `S/ ${parseFloat(nuevoAbono.importe).toFixed(2)}`, registroManual: 'Sí' };
        const actualizados = [...abonos, nuevo];
        setAbonos(actualizados);
        setAbonosFiltrados(actualizados);
        setAbonoModalOpen(false);
        setNuevoAbono({ fechaAbono: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });
    };

    const handleGuardarDevolucion = () => {
        const nuevo = { ...nuevaDevolucion, fechaDevolucion: dayjs(nuevaDevolucion.fechaDevolucion).format('DD/MM/YYYY'), importe: `S/ ${parseFloat(nuevaDevolucion.importe).toFixed(2)}` };
        const actualizados = [...devoluciones, nuevo];
        setDevoluciones(actualizados);
        setDevolucionesFiltradas(actualizados);
        setDevolucionModalOpen(false);
        setNuevaDevolucion({ fechaDevolucion: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });
    };

    const handleGuardarNotaCredito = () => {
        const nuevo = { ...nuevaNotaCredito, fecha: dayjs(nuevaNotaCredito.fecha).format('DD/MM/YYYY') };
        const actualizados = [...notasDeCredito, nuevo];
        setNotasDeCredito(actualizados);
        setNotasDeCreditoFiltradas(actualizados);
        setNotaCreditoModalOpen(false);
        setNuevaNotaCredito({ fecha: null, nroNotaCredito: '', nroComprobanteAfectado: '', importeInafecto: '', importeImponible: '', importeImpuestos: '', importeTotal: '', motivo: '' });
    };

    const nombreCompleto = "Oscar Rodrigo Canez Rodriguez"; // Mock data, replace with actual data fetching

    return (
        <React.Fragment>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}><HomeIcon sx={{ fontSize: 20 }} /></IconButton>
                <IconButton component={RouterLink} to="/admin/clientes" size="small" sx={{ color: 'inherit', p: 0.5 }}><PeopleAltIcon sx={{ fontSize: 20 }} /></IconButton>
                <RouterLink to={`/admin/clientes/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography color="text.primary">{nombreCompleto}</Typography>
                </RouterLink>
                <Typography color="text.primary">Contrato {contratoId}</Typography>
            </Breadcrumbs>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight={600}>Contrato {contratoId}</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="CONSUMOS" />
                    <Tab label="ABONOS" />
                    <Tab label="DEVOLUCIONES" />
                    <Tab label="NOTAS DE CRÉDITO" />
                </Tabs>
            </Box>
            <Divider />

            <TabPanel value={tabValue} index={0}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosConsumos} disabled={sonFiltrosIniciales(filtrosConsumos) || filtrosAplicados.consumos}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosConsumos} disabled={!filtrosAplicados.consumos}>LIMPIAR FILTROS</Button>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosConsumos.fechaDesde ? dayjs(filtrosConsumos.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosConsumos({...filtrosConsumos, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.consumos}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosConsumos.fechaHasta ? dayjs(filtrosConsumos.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosConsumos({...filtrosConsumos, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.consumos}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.consumos}>
                                <InputLabel>Producto</InputLabel>
                                <Select label="Producto" value={filtrosConsumos.producto} onChange={e => setFiltrosConsumos({...filtrosConsumos, producto: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Menú">Menú</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.consumos}>
                                <InputLabel>Forma de pago</InputLabel>
                                <Select label="Forma de pago" value={filtrosConsumos.formaPago} onChange={e => setFiltrosConsumos({...filtrosConsumos, formaPago: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Cargo en cuenta">Cargo en cuenta</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.consumos}>
                                <InputLabel>Medio de pago</InputLabel>
                                <Select label="Medio de pago" value={filtrosConsumos.medioPago} onChange={e => setFiltrosConsumos({...filtrosConsumos, medioPago: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Cargo en cuenta">Cargo en cuenta</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha consumo</TableCell>
                                    <TableCell>Producto</TableCell>
                                    <TableCell>Tipo de comprobante</TableCell>
                                    <TableCell>Numero de documento</TableCell>
                                    <TableCell>Forma de pago</TableCell>
                                    <TableCell>Medio de pago</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Importe total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consumosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((consumo, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{consumo.fechaConsumo}</TableCell>
                                        <TableCell>{consumo.producto}</TableCell>
                                        <TableCell>{consumo.tipoComprobante}</TableCell>
                                        <TableCell>{consumo.numeroDocumento}</TableCell>
                                        <TableCell>{consumo.formaPago}</TableCell>
                                        <TableCell>{consumo.medioPago}</TableCell>
                                        <TableCell>{consumo.cantidad}</TableCell>
                                        <TableCell>{consumo.importeTotal}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={consumosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosAbonos} disabled={sonFiltrosInicialesAbonos(filtrosAbonos) || filtrosAplicados.abonos}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosAbonos} disabled={!filtrosAplicados.abonos}>LIMPIAR FILTROS</Button>
                            </Box>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAbonoModalOpen(true)} disabled={filtrosAplicados.abonos}>REGISTRAR ABONO</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosAbonos.fechaDesde ? dayjs(filtrosAbonos.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosAbonos({...filtrosAbonos, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.abonos}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosAbonos.fechaHasta ? dayjs(filtrosAbonos.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosAbonos({...filtrosAbonos, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.abonos}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.abonos}>
                                <InputLabel>Banco</InputLabel>
                                <Select label="Banco" value={filtrosAbonos.banco} onChange={e => setFiltrosAbonos({...filtrosAbonos, banco: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Banco de Crédito del Perú">Banco de Crédito del Perú</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Importe mínimo S/." variant="outlined" size="small" value={filtrosAbonos.importeMin} onChange={e => setFiltrosAbonos({...filtrosAbonos, importeMin: e.target.value})} disabled={filtrosAplicados.abonos} />
                            <TextField label="Importe máximo S/." variant="outlined" size="small" value={filtrosAbonos.importeMax} onChange={e => setFiltrosAbonos({...filtrosAbonos, importeMax: e.target.value})} disabled={filtrosAplicados.abonos} />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha abono</TableCell>
                                    <TableCell>Banco</TableCell>
                                    <TableCell>Cuenta</TableCell>
                                    <TableCell>Tipo de cuenta</TableCell>
                                    <TableCell>Número recibo</TableCell>
                                    <TableCell>Importe</TableCell>
                                    <TableCell>Registro manual</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {abonosFiltrados.map((abono, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{abono.fechaAbono}</TableCell>
                                        <TableCell>{abono.banco}</TableCell>
                                        <TableCell>{abono.cuenta}</TableCell>
                                        <TableCell>{abono.tipoCuenta}</TableCell>
                                        <TableCell>{abono.numeroRecibo}</TableCell>
                                        <TableCell>{abono.importe}</TableCell>
                                        <TableCell>{abono.registroManual}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={abonosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                     <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosDevoluciones} disabled={sonFiltrosInicialesDevoluciones(filtrosDevoluciones) || filtrosAplicados.devoluciones}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosDevoluciones} disabled={!filtrosAplicados.devoluciones}>LIMPIAR FILTROS</Button>
                            </Box>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDevolucionModalOpen(true)} disabled={filtrosAplicados.devoluciones}>REGISTRAR DEVOLUCIÓN</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosDevoluciones.fechaDesde ? dayjs(filtrosDevoluciones.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosDevoluciones({...filtrosDevoluciones, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.devoluciones}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosDevoluciones.fechaHasta ? dayjs(filtrosDevoluciones.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosDevoluciones({...filtrosDevoluciones, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.devoluciones}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.devoluciones}>
                                <InputLabel>Banco</InputLabel>
                                <Select label="Banco" value={filtrosDevoluciones.banco} onChange={e => setFiltrosDevoluciones({...filtrosDevoluciones, banco: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Banco de Crédito del Perú">Banco de Crédito del Perú</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Importe mínimo S/." variant="outlined" size="small" value={filtrosDevoluciones.importeMin} onChange={e => setFiltrosDevoluciones({...filtrosDevoluciones, importeMin: e.target.value})} disabled={filtrosAplicados.devoluciones} />
                            <TextField label="Importe máximo S/." variant="outlined" size="small" value={filtrosDevoluciones.importeMax} onChange={e => setFiltrosDevoluciones({...filtrosDevoluciones, importeMax: e.target.value})} disabled={filtrosAplicados.devoluciones} />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha devolución</TableCell>
                                    <TableCell>Banco</TableCell>
                                    <TableCell>Cuenta</TableCell>
                                    <TableCell>Tipo de cuenta</TableCell>
                                    <TableCell>Número recibo</TableCell>
                                    <TableCell>Importe</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {devolucionesFiltradas.map((devolucion, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{devolucion.fechaDevolucion}</TableCell>
                                        <TableCell>{devolucion.banco}</TableCell>
                                        <TableCell>{devolucion.cuenta}</TableCell>
                                        <TableCell>{devolucion.tipoCuenta}</TableCell>
                                        <TableCell>{devolucion.numeroRecibo}</TableCell>
                                        <TableCell>{devolucion.importe}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={devolucionesFiltradas.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
             <TabPanel value={tabValue} index={3}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosNotasCredito} disabled={sonFiltrosInicialesNotasCredito(filtrosNotasCredito) || filtrosAplicados.notasCredito}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosNotasCredito} disabled={!filtrosAplicados.notasCredito}>LIMPIAR FILTROS</Button>
                            </Box>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNotaCreditoModalOpen(true)} disabled={filtrosAplicados.notasCredito}>
                                REGISTRAR NOTA DE CRÉDITO
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosNotasCredito.fechaDesde ? dayjs(filtrosNotasCredito.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosNotasCredito({...filtrosNotasCredito, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.notasCredito}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosNotasCredito.fechaHasta ? dayjs(filtrosNotasCredito.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosNotasCredito({...filtrosNotasCredito, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.notasCredito}
                            />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Nro. nota crédito</TableCell>
                                    <TableCell>Nro. comprobante afectado</TableCell>
                                    <TableCell>Importe inafecto</TableCell>
                                    <TableCell>Importe imponible</TableCell>
                                    <TableCell>Importe impuestos</TableCell>
                                    <TableCell>Importe total</TableCell>
                                    <TableCell>Motivo</TableCell>
                                    <TableCell align="center">Detalle</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {notasDeCreditoFiltradas.map((nota, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{nota.fecha}</TableCell>
                                        <TableCell>{nota.nroNotaCredito}</TableCell>
                                        <TableCell>{nota.nroComprobanteAfectado}</TableCell>
                                        <TableCell>{nota.importeInafecto}</TableCell>
                                        <TableCell>{nota.importeImponible}</TableCell>
                                        <TableCell>{nota.importeImpuestos}</TableCell>
                                        <TableCell>{nota.importeTotal}</TableCell>
                                        <TableCell>{nota.motivo}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={notasDeCreditoFiltradas.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            {/* Modal Abono */}
            <Dialog open={abonoModalOpen} onClose={() => setAbonoModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Abono</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Fecha de Abono" value={nuevoAbono.fechaAbono} onChange={date => setNuevoAbono({...nuevoAbono, fechaAbono: date})} renderInput={(params) => <TextField {...params} fullWidth />} /></LocalizationProvider></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Banco" value={nuevoAbono.banco} onChange={e => setNuevoAbono({...nuevoAbono, banco: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Cuenta" value={nuevoAbono.cuenta} onChange={e => setNuevoAbono({...nuevoAbono, cuenta: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Tipo de cuenta" value={nuevoAbono.tipoCuenta} onChange={e => setNuevoAbono({...nuevoAbono, tipoCuenta: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Número de recibo" value={nuevoAbono.numeroRecibo} onChange={e => setNuevoAbono({...nuevoAbono, numeroRecibo: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Importe" value={nuevoAbono.importe} onChange={e => setNuevoAbono({...nuevoAbono, importe: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAbonoModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarAbono} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Devolución */}
            <Dialog open={devolucionModalOpen} onClose={() => setDevolucionModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Devolución</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Fecha de Devolución" value={nuevaDevolucion.fechaDevolucion} onChange={date => setNuevaDevolucion({...nuevaDevolucion, fechaDevolucion: date})} renderInput={(params) => <TextField {...params} fullWidth />} /></LocalizationProvider></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Banco" value={nuevaDevolucion.banco} onChange={e => setNuevaDevolucion({...nuevaDevolucion, banco: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Cuenta" value={nuevaDevolucion.cuenta} onChange={e => setNuevaDevolucion({...nuevaDevolucion, cuenta: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Tipo de cuenta" value={nuevaDevolucion.tipoCuenta} onChange={e => setNuevaDevolucion({...nuevaDevolucion, tipoCuenta: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Número de recibo" value={nuevaDevolucion.numeroRecibo} onChange={e => setNuevaDevolucion({...nuevaDevolucion, numeroRecibo: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Importe" value={nuevaDevolucion.importe} onChange={e => setNuevaDevolucion({...nuevaDevolucion, importe: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDevolucionModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarDevolucion} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Nota de Crédito */}
            <Dialog open={notaCreditoModalOpen} onClose={() => setNotaCreditoModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Registrar Nota de Crédito</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}><LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Fecha" value={nuevaNotaCredito.fecha} onChange={date => setNuevaNotaCredito({...nuevaNotaCredito, fecha: date})} renderInput={(params) => <TextField {...params} fullWidth />} /></LocalizationProvider></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Nro. Nota de Crédito" value={nuevaNotaCredito.nroNotaCredito} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, nroNotaCredito: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Nro. Comprobante Afectado" value={nuevaNotaCredito.nroComprobanteAfectado} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, nroComprobanteAfectado: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Importe Inafecto" value={nuevaNotaCredito.importeInafecto} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, importeInafecto: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Importe Imponible" value={nuevaNotaCredito.importeImponible} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, importeImponible: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Importe Impuestos" value={nuevaNotaCredito.importeImpuestos} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, importeImpuestos: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Importe Total" value={nuevaNotaCredito.importeTotal} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, importeTotal: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Motivo" multiline rows={2} value={nuevaNotaCredito.motivo} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, motivo: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotaCreditoModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarNotaCredito} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default AdminContratoDetalle; 
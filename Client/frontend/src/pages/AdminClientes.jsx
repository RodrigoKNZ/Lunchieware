import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, TextField,
  Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Tooltip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Grid
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import clienteService from '../services/clienteService';

const mockClientes = [
    { id: '20200554', nombre: 'Oscar Rodrigo Canez Rodriguez', saldo: 'Deuda', monto: 20.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200555', nombre: 'Valeria Isabela Torres Mendoza', saldo: 'Deuda', monto: 10.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200556', nombre: 'Santiago Elías Rojas Valverde', saldo: 'Deuda', monto: 60.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200557', nombre: 'Luciana Renata Castillo Paredes', saldo: 'Saldo', monto: 1000.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200558', nombre: 'Matías Joaquín Herrera Guzmán', saldo: 'Deuda', monto: 50.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200559', nombre: 'Camila Alejandra Vargas Quispe', saldo: 'Deuda', monto: 60.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200560', nombre: 'Gabriel Alonso Ramírez Loayza', saldo: 'Deuda', monto: 70.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200561', nombre: 'Daniela Fernanda Morales Zúñiga', saldo: 'Deuda', monto: 80.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200562', nombre: 'Tomás Emiliano Aguirre Salvatierra', saldo: 'Deuda', monto: 90.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
    { id: '20200563', nombre: 'María José León Cárdenas', saldo: 'Deuda', monto: 100.00, nivel: 'Primaria', grado: '5to', seccion: 'C', tipo: 'Estudiante', vigencia: 'Vigente' },
];

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const ListaClientes = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [clientes, setClientes] = useState([]);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Estados para filtros
    const [filtroNombres, setFiltroNombres] = useState('');
    const [filtroApellidoPaterno, setFiltroApellidoPaterno] = useState('');
    const [filtroApellidoMaterno, setFiltroApellidoMaterno] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroNivel, setFiltroNivel] = useState('todos');
    const [filtroGrado, setFiltroGrado] = useState('todos');
    const [filtroSeccion, setFiltroSeccion] = useState('todos');
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroSaldoDeuda, setFiltroSaldoDeuda] = useState('ambos');
    const [filtroSaldoMin, setFiltroSaldoMin] = useState('');
    const [filtroSaldoMax, setFiltroSaldoMax] = useState('');
    const [filtroDeudaMin, setFiltroDeudaMin] = useState('');
    const [filtroDeudaMax, setFiltroDeudaMax] = useState('');
    const [filtroVigencia, setFiltroVigencia] = useState('todos');

    // Control de filtros
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);
    const filtrosIniciales = {
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        tipo: 'todos',
        nivel: 'todos',
        grado: 'todos',
        seccion: 'todos',
        codigo: '',
        saldoDeuda: 'ambos',
        saldoMin: '',
        saldoMax: '',
        deudaMin: '',
        deudaMax: '',
        vigencia: 'todos',
    };
    const filtrosEnEstadoInicial =
        filtroNombres === filtrosIniciales.nombres &&
        filtroApellidoPaterno === filtrosIniciales.apellidoPaterno &&
        filtroApellidoMaterno === filtrosIniciales.apellidoMaterno &&
        filtroTipo === filtrosIniciales.tipo &&
        filtroNivel === filtrosIniciales.nivel &&
        filtroGrado === filtrosIniciales.grado &&
        filtroSeccion === filtrosIniciales.seccion &&
        filtroCodigo === filtrosIniciales.codigo &&
        filtroSaldoDeuda === filtrosIniciales.saldoDeuda &&
        filtroSaldoMin === filtrosIniciales.saldoMin &&
        filtroSaldoMax === filtrosIniciales.saldoMax &&
        filtroDeudaMin === filtrosIniciales.deudaMin &&
        filtroDeudaMax === filtrosIniciales.deudaMax &&
        filtroVigencia === filtrosIniciales.vigencia;

    // Estado y funciones para el modal de nuevo cliente
    const [nuevoClienteOpen, setNuevoClienteOpen] = useState(false);
    const [nuevoCliente, setNuevoCliente] = useState({
        codigoCliente: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        nivel: '',
        grado: '',
        seccion: '',
        tipoCliente: '',
        tipoDocumento: '',
        numDocumento: '',
        telefono1: '',
        telefono2: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const res = await clienteService.obtenerTodos();
            const clientesRaw = Array.isArray(res.data) ? res.data : [];
            const clientesConContrato = await Promise.all(clientesRaw.map(async (cli) => {
                let saldo = '-';
                let monto = '-';
                let vigencia = cli.clienteVigente ? 'Vigente' : 'No vigente';
                if (cli.clienteVigente) {
                    const contratosRes = await clienteService.obtenerContratosPorCliente(cli.idCliente);
                    const contratos = contratosRes.data || [];
                    const contratoActual = contratos.length > 0 ? contratos[0] : null;
                    if (contratoActual) {
                        const saldoNum = Number(contratoActual.importeSaldo);
                        saldo = saldoNum >= 0 ? 'Saldo' : 'Deuda';
                        monto = Math.abs(saldoNum);
                    }
                }
                return {
                    id: cli.codigoCliente,
                    nombre: `${cli.nombres} ${cli.apellidoPaterno} ${cli.apellidoMaterno}`,
                    nombres: cli.nombres,
                    apellidoPaterno: cli.apellidoPaterno,
                    apellidoMaterno: cli.apellidoMaterno,
                    saldo,
                    monto,
                    nivel: cli.nivel || '-',
                    grado: cli.grado || '-',
                    seccion: cli.seccion || '-',
                    tipo: cli.tipoCliente === 'E' ? 'Estudiante' : cli.tipoCliente === 'D' ? 'Docente' : 'General',
                    vigencia,
                    idCliente: cli.idCliente
                };
            }));
            console.log('🟢 clientesConContrato:', clientesConContrato);
            setClientes(clientesConContrato);
            setClientesFiltrados(clientesConContrato);
        } catch (err) {
            setClientes([]);
            setClientesFiltrados([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    // Lógica de filtros
    const handleAplicarFiltros = () => {
        let filtrados = clientes.filter(c => {
            const matchNombres = !filtroNombres || c.nombres.toLowerCase().includes(filtroNombres.toLowerCase());
            const matchApellidoPaterno = !filtroApellidoPaterno || c.apellidoPaterno.toLowerCase().includes(filtroApellidoPaterno.toLowerCase());
            const matchApellidoMaterno = !filtroApellidoMaterno || c.apellidoMaterno.toLowerCase().includes(filtroApellidoMaterno.toLowerCase());
            const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
            const matchNivel = filtroNivel === 'todos' || c.nivel === filtroNivel;
            const matchGrado = filtroGrado === 'todos' || c.grado === filtroGrado;
            const matchSeccion = filtroSeccion === 'todos' || c.seccion === filtroSeccion;
            const matchCodigo = !filtroCodigo || c.id.toLowerCase().includes(filtroCodigo.toLowerCase());
            const matchSaldoDeuda = filtroSaldoDeuda === 'ambos' || c.saldo === filtroSaldoDeuda;
            let matchSaldoMin = true, matchSaldoMax = true, matchDeudaMin = true, matchDeudaMax = true;
            if (c.saldo === 'Saldo' && filtroSaldoMin) matchSaldoMin = c.monto >= parseFloat(filtroSaldoMin);
            if (c.saldo === 'Saldo' && filtroSaldoMax) matchSaldoMax = c.monto <= parseFloat(filtroSaldoMax);
            if (c.saldo === 'Deuda' && filtroDeudaMin) matchDeudaMin = c.monto >= parseFloat(filtroDeudaMin);
            if (c.saldo === 'Deuda' && filtroDeudaMax) matchDeudaMax = c.monto <= parseFloat(filtroDeudaMax);
            const matchVigencia = filtroVigencia === 'todos' || c.vigencia === filtroVigencia;
            return matchNombres && matchApellidoPaterno && matchApellidoMaterno && matchTipo && matchNivel && matchGrado && matchSeccion && matchCodigo && matchSaldoDeuda && matchSaldoMin && matchSaldoMax && matchDeudaMin && matchDeudaMax && matchVigencia;
        });
        setClientesFiltrados(filtrados);
        setFiltrosAplicados(true);
        setPage(0);
    };

    const handleLimpiarFiltros = () => {
        setFiltroNombres(filtrosIniciales.nombres);
        setFiltroApellidoPaterno(filtrosIniciales.apellidoPaterno);
        setFiltroApellidoMaterno(filtrosIniciales.apellidoMaterno);
        setFiltroTipo(filtrosIniciales.tipo);
        setFiltroNivel(filtrosIniciales.nivel);
        setFiltroGrado(filtrosIniciales.grado);
        setFiltroSeccion(filtrosIniciales.seccion);
        setFiltroCodigo(filtrosIniciales.codigo);
        setFiltroSaldoDeuda(filtrosIniciales.saldoDeuda);
        setFiltroSaldoMin(filtrosIniciales.saldoMin);
        setFiltroSaldoMax(filtrosIniciales.saldoMax);
        setFiltroDeudaMin(filtrosIniciales.deudaMin);
        setFiltroDeudaMax(filtrosIniciales.deudaMax);
        setFiltroVigencia(filtrosIniciales.vigencia);
        setClientesFiltrados(clientes);
        setFiltrosAplicados(false);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Función para mostrar el nivel de forma legible
    const mostrarNivel = (nivel) => {
        if (nivel === 'PR') return 'Primaria';
        if (nivel === 'IN') return 'Inicial';
        if (nivel === 'SE') return 'Secundaria';
        return nivel;
    };

    // Función para mostrar el grado de forma legible según el diccionario de datos
    const mostrarGrado = (grado) => {
        if (!grado) return '-';
        if (grado === 'IN4') return '4 años';
        if (grado === 'IN5') return '5 años';
        if (grado === 'PR1') return '1er grado';
        if (grado === 'PR2') return '2do grado';
        if (grado === 'PR3') return '3er grado';
        if (grado === 'PR4') return '4to grado';
        if (grado === 'PR5') return '5to grado';
        if (grado === 'PR6') return '6to grado';
        if (grado === 'SE1') return '1er grado';
        if (grado === 'SE2') return '2do grado';
        if (grado === 'SE3') return '3er grado';
        if (grado === 'SE4') return '4to grado';
        if (grado === 'SE5') return '5to grado';
        return grado;
    };

    const handleNuevoCliente = () => {
        setNuevoCliente({
            codigoCliente: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            nivel: '',
            grado: '',
            seccion: '',
            tipoCliente: '',
            tipoDocumento: '',
            numDocumento: '',
            telefono1: '',
            telefono2: '',
        });
        setNuevoClienteOpen(true);
    };

    const esNuevoClienteValido = () => {
        return (
            nuevoCliente.codigoCliente.trim() &&
            nuevoCliente.nombres.trim() &&
            nuevoCliente.apellidoPaterno.trim() &&
            nuevoCliente.nivel &&
            nuevoCliente.grado &&
            nuevoCliente.tipoCliente &&
            nuevoCliente.tipoDocumento &&
            nuevoCliente.numDocumento.trim() &&
            nuevoCliente.telefono1.trim()
        );
    };

    const handleGuardarNuevoCliente = async () => {
        if (!esNuevoClienteValido()) {
            setSnackbar({ open: true, message: 'Completa todos los campos obligatorios.', severity: 'error' });
            return;
        }
        try {
            await clienteService.crear(nuevoCliente);
            setNuevoClienteOpen(false);
            setSnackbar({ open: true, message: 'Cliente creado exitosamente.', severity: 'success' });
            fetchClientes(); // Recarga la lista completa
        } catch (err) {
            const msg = err?.response?.data?.message || 'Error al crear el cliente.';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const opcionesGrado = () => {
        if (nuevoCliente.nivel === 'IN') return [
            { value: 'IN4', label: '4 años' },
            { value: 'IN5', label: '5 años' },
        ];
        if (nuevoCliente.nivel === 'PR') return [
            { value: 'PR1', label: '1er grado' },
            { value: 'PR2', label: '2do grado' },
            { value: 'PR3', label: '3er grado' },
            { value: 'PR4', label: '4to grado' },
            { value: 'PR5', label: '5to grado' },
            { value: 'PR6', label: '6to grado' },
        ];
        if (nuevoCliente.nivel === 'SE') return [
            { value: 'SE1', label: '1er grado' },
            { value: 'SE2', label: '2do grado' },
            { value: 'SE3', label: '3er grado' },
            { value: 'SE4', label: '4to grado' },
            { value: 'SE5', label: '5to grado' },
        ];
        return [];
    };

    useEffect(() => {
        // Si el grado actual no está en las opciones, límpialo
        const opciones = opcionesGrado().map(opt => opt.value);
        if (nuevoCliente.grado && !opciones.includes(nuevoCliente.grado)) {
            setNuevoCliente(nc => ({ ...nc, grado: '' }));
        }
    }, [nuevoCliente.nivel]);

    console.log('🟡 clientesFiltrados para renderizar:', clientesFiltrados);

    return (
        <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={handleAplicarFiltros} disabled={filtrosEnEstadoInicial || filtrosAplicados}>APLICAR FILTROS</Button>
                    <Button variant="outlined" onClick={handleLimpiarFiltros} disabled={filtrosEnEstadoInicial || !filtrosAplicados}>LIMPIAR FILTROS</Button>
                </Box>
                <Button variant="contained" onClick={handleNuevoCliente}>+ NUEVO CLIENTE</Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
                {/* Campos de Filtro */}
                <TextField label="Nombres" size="small" value={filtroNombres} onChange={e => setFiltroNombres(e.target.value)} disabled={filtrosAplicados} />
                <TextField label="Apellido paterno" size="small" value={filtroApellidoPaterno} onChange={e => setFiltroApellidoPaterno(e.target.value)} disabled={filtrosAplicados} />
                <TextField label="Apellido materno" size="small" value={filtroApellidoMaterno} onChange={e => setFiltroApellidoMaterno(e.target.value)} disabled={filtrosAplicados} />
                <FormControl size="small" disabled={filtrosAplicados}><InputLabel>Tipo</InputLabel><Select label="Tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}><MenuItem value="todos">Todos</MenuItem><MenuItem value="Estudiante">Estudiante</MenuItem><MenuItem value="Docente">Docente</MenuItem><MenuItem value="General">General</MenuItem></Select></FormControl>
                <FormControl size="small" disabled={filtrosAplicados}><InputLabel>Nivel</InputLabel><Select label="Nivel" value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}><MenuItem value="todos">Todos</MenuItem><MenuItem value="Primaria">Primaria</MenuItem><MenuItem value="Secundaria">Secundaria</MenuItem></Select></FormControl>
                <FormControl size="small" disabled={filtrosAplicados}><InputLabel>Grado</InputLabel><Select label="Grado" value={filtroGrado} onChange={e => setFiltroGrado(e.target.value)}><MenuItem value="todos">Todos</MenuItem><MenuItem value="1ro">1ro</MenuItem><MenuItem value="2do">2do</MenuItem><MenuItem value="3ro">3ro</MenuItem><MenuItem value="4to">4to</MenuItem><MenuItem value="5to">5to</MenuItem></Select></FormControl>
                <FormControl size="small" disabled={filtrosAplicados}><InputLabel>Sección</InputLabel><Select label="Sección" value={filtroSeccion} onChange={e => setFiltroSeccion(e.target.value)}><MenuItem value="todos">Todos</MenuItem><MenuItem value="A">A</MenuItem><MenuItem value="B">B</MenuItem><MenuItem value="C">C</MenuItem></Select></FormControl>
                <TextField label="Código" size="small" value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)} disabled={filtrosAplicados} />
                <FormControl size="small" disabled={filtrosAplicados} sx={{ minWidth: 120, maxWidth: 140, mx: 0.5 }}><InputLabel>Saldo o Deuda</InputLabel><Select label="Saldo o Deuda" value={filtroSaldoDeuda} onChange={e => setFiltroSaldoDeuda(e.target.value)}><MenuItem value="ambos">Ambos</MenuItem><MenuItem value="Saldo">Saldo</MenuItem><MenuItem value="Deuda">Deuda</MenuItem></Select></FormControl>
                <TextField label="Saldo mínimo" size="small" value={filtroSaldoMin} onChange={e => setFiltroSaldoMin(e.target.value)} disabled={filtrosAplicados} type="number" />
                <TextField label="Saldo máximo" size="small" value={filtroSaldoMax} onChange={e => setFiltroSaldoMax(e.target.value)} disabled={filtrosAplicados} type="number" />
                <TextField label="Deuda mínima" size="small" value={filtroDeudaMin} onChange={e => setFiltroDeudaMin(e.target.value)} disabled={filtrosAplicados} type="number" />
                <TextField label="Deuda máxima" size="small" value={filtroDeudaMax} onChange={e => setFiltroDeudaMax(e.target.value)} disabled={filtrosAplicados} type="number" />
                <FormControl size="small" disabled={filtrosAplicados}><InputLabel>Vigencia</InputLabel><Select label="Vigencia" value={filtroVigencia} onChange={e => setFiltroVigencia(e.target.value)}><MenuItem value="todos">Todos</MenuItem><MenuItem value="Vigente">Vigente</MenuItem><MenuItem value="No vigente">No vigente</MenuItem></Select></FormControl>
            </Box>
            <Divider sx={{ my: 2 }} />
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell sx={{ minWidth: 110, maxWidth: 150, width: 120 }}>Nombre completo</TableCell>
                            <TableCell>Saldo o Deuda</TableCell>
                            <TableCell sx={{ minWidth: 90, maxWidth: 110, width: 100, p: 0.5 }}>Monto</TableCell>
                            <TableCell>Nivel</TableCell>
                            <TableCell>Grado</TableCell>
                            <TableCell>Sección</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Vigencia</TableCell>
                            <TableCell align="center">Detalle</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={10} align="center">Cargando...</TableCell></TableRow>
                        ) : clientesFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.nombre}</TableCell>
                                <TableCell>
                                    {row.saldo === '-' ? '-' : (
                                        <Box sx={{
                                            color: 'white',
                                            bgcolor: row.saldo === 'Deuda' ? 'error.main' : 'success.main',
                                            px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem'
                                        }}>{row.saldo}</Box>
                                    )}
                                </TableCell>
                                <TableCell>{(typeof row.monto === 'number' && !isNaN(row.monto)) ? `S/. ${row.monto.toFixed(2)}` : '-'}</TableCell>
                                <TableCell>{mostrarNivel(row.nivel)}</TableCell>
                                <TableCell>{mostrarGrado(row.grado)}</TableCell>
                                <TableCell>{row.seccion}</TableCell>
                                <TableCell>
                                    <Box sx={{
                                        color: '#37474f', bgcolor: '#eceff1',
                                        px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem'
                                    }}>{row.tipo}</Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{
                                        color: 'white', bgcolor: row.vigencia === 'Vigente' ? 'success.main' : 'grey.500',
                                        px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem'
                                    }}>{row.vigencia}</Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Ver detalle">
                                        <IconButton onClick={() => navigate(`/admin/clientes/${row.idCliente}`)}><VisibilityIcon /></IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25]}
                component="div"
                count={clientesFiltrados.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
            />
            <Dialog open={nuevoClienteOpen} onClose={() => setNuevoClienteOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nuevo Cliente</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Código" value={nuevoCliente.codigoCliente} onChange={e => setNuevoCliente({ ...nuevoCliente, codigoCliente: e.target.value })} fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField label="Nombres" value={nuevoCliente.nombres} onChange={e => setNuevoCliente({ ...nuevoCliente, nombres: e.target.value })} fullWidth required /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Apellido paterno" value={nuevoCliente.apellidoPaterno} onChange={e => setNuevoCliente({ ...nuevoCliente, apellidoPaterno: e.target.value })} fullWidth required /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Apellido materno" value={nuevoCliente.apellidoMaterno} onChange={e => setNuevoCliente({ ...nuevoCliente, apellidoMaterno: e.target.value })} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Nivel</InputLabel><Select value={nuevoCliente.nivel} label="Nivel" onChange={e => setNuevoCliente({ ...nuevoCliente, nivel: e.target.value, grado: '' })}><MenuItem value="IN">Inicial</MenuItem><MenuItem value="PR">Primaria</MenuItem><MenuItem value="SE">Secundaria</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required disabled={!nuevoCliente.nivel}>
                                <InputLabel>Grado</InputLabel>
                                <Select
                                    value={nuevoCliente.grado}
                                    label="Grado"
                                    onChange={e => setNuevoCliente({ ...nuevoCliente, grado: e.target.value })}
                                >
                                    {opcionesGrado().map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Sección</InputLabel><Select value={nuevoCliente.seccion} label="Sección" onChange={e => setNuevoCliente({ ...nuevoCliente, seccion: e.target.value })}><MenuItem value="A">A</MenuItem><MenuItem value="B">B</MenuItem><MenuItem value="C">C</MenuItem><MenuItem value="D">D</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Tipo de cliente</InputLabel><Select value={nuevoCliente.tipoCliente} label="Tipo de cliente" onChange={e => setNuevoCliente({ ...nuevoCliente, tipoCliente: e.target.value })}><MenuItem value="E">Estudiante</MenuItem><MenuItem value="D">Docente</MenuItem><MenuItem value="G">General</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Tipo de documento</InputLabel><Select value={nuevoCliente.tipoDocumento} label="Tipo de documento" onChange={e => setNuevoCliente({ ...nuevoCliente, tipoDocumento: e.target.value })}><MenuItem value="DNI">DNI</MenuItem><MenuItem value="CEX">Carnet de extranjería</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField label="N° Documento" value={nuevoCliente.numDocumento} onChange={e => setNuevoCliente({ ...nuevoCliente, numDocumento: e.target.value })} fullWidth required /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Teléfono 1" value={nuevoCliente.telefono1} onChange={e => setNuevoCliente({ ...nuevoCliente, telefono1: e.target.value })} fullWidth required /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Teléfono 2" value={nuevoCliente.telefono2} onChange={e => setNuevoCliente({ ...nuevoCliente, telefono2: e.target.value })} fullWidth /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNuevoClienteOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarNuevoCliente} variant="contained" disabled={!esNuevoClienteValido()}>Guardar</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

const CAMPOS_CSV = [
  'codigoCliente','nombres','apellidoPaterno','apellidoMaterno','nivel','grado','seccion','telefono1','telefono2','tipoDocumento','numDocumento','tipoCliente'
];
const VALORES_NIVEL = ['IN','PR','SE',''];
const VALORES_GRADO = ['IN4','IN5','PR1','PR2','PR3','PR4','PR5','PR6','SE1','SE2','SE3','SE4','SE5',''];
const VALORES_SECCION = ['A','B','C','D',''];
const VALORES_TIPO_DOC = ['DNI','CEX'];
const VALORES_TIPO_CLIENTE = ['E','D','G'];

const validarFila = (fila, idx, codigos, documentos) => {
  const errores = {};
  CAMPOS_CSV.forEach(campo => {
    if (fila[campo] === undefined) errores[campo] = 'Falta campo';
  });
  const codigoCliente = (fila.codigoCliente || '').trim();
  const nombres = (fila.nombres || '').trim();
  const apellidoPaterno = (fila.apellidoPaterno || '').trim();
  const apellidoMaterno = (fila.apellidoMaterno || '').trim();
  const nivel = (fila.nivel || '').trim();
  const grado = (fila.grado || '').trim();
  const seccion = (fila.seccion || '').trim();
  const telefono1 = (fila.telefono1 || '').trim();
  const telefono2 = (fila.telefono2 || '').trim();
  const tipoDocumento = (fila.tipoDocumento || '').trim();
  const numDocumento = (fila.numDocumento || '').trim();
  const tipoCliente = (fila.tipoCliente || '').trim();

  if (!codigoCliente) errores.codigoCliente = 'Obligatorio';
  if (!nombres) errores.nombres = 'Obligatorio';
  if (!apellidoPaterno) errores.apellidoPaterno = 'Obligatorio';
  if (!apellidoMaterno) errores.apellidoMaterno = 'Obligatorio';
  if (!telefono1) errores.telefono1 = 'Obligatorio';
  if (!tipoDocumento || !VALORES_TIPO_DOC.includes(tipoDocumento)) errores.tipoDocumento = `DNI o CEX (valor: "${tipoDocumento}")`;
  if (!numDocumento) errores.numDocumento = 'Obligatorio';
  if (!tipoCliente || !VALORES_TIPO_CLIENTE.includes(tipoCliente)) errores.tipoCliente = `E, D o G (valor: "${tipoCliente}")`;
  if (nivel && !VALORES_NIVEL.includes(nivel)) errores.nivel = `IN, PR, SE o vacío (valor: "${nivel}")`;
  if (grado && !VALORES_GRADO.includes(grado)) errores.grado = `Valor no válido (valor: "${grado}")`;
  if (seccion && !VALORES_SECCION.includes(seccion)) errores.seccion = `A, B, C, D o vacío (valor: "${seccion}")`;
  if (codigos.has(codigoCliente)) errores.codigoCliente = 'Duplicado en archivo';
  if (documentos.has(numDocumento)) errores.numDocumento = 'Duplicado en archivo';
  codigos.add(codigoCliente);
  documentos.add(numDocumento);
  return errores;
};

const AdminClientes = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [erroresCSV, setErroresCSV] = useState([]);
    const [resultadosMasivo, setResultadosMasivo] = useState([]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleFileChange = (e) => {
        setErrorMsg('');
        setSuccessMsg('');
        const file = e.target.files[0];
        setSelectedFile(file);
        if (!file) {
            setPreviewData([]);
            setErroresCSV([]);
            return;
        }
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map(row => {
                    const obj = {};
                    CAMPOS_CSV.forEach(campo => {
                        obj[campo] = (row[campo] !== undefined) ? row[campo] : '';
                    });
                    return obj;
                });
                const errores = [];
                const codigos = new Set();
                const documentos = new Set();
                data.forEach((fila, idx) => {
                    const err = validarFila(fila, idx, codigos, documentos);
                    if (Object.keys(err).length > 0) errores.push({ fila: idx+2, errores: err });
                });
                setPreviewData(data);
                setErroresCSV(errores);
            },
            error: () => {
                setPreviewData([]);
                setErroresCSV([]);
                setErrorMsg('Error al leer el archivo CSV');
            }
        });
    };

    const handleUpload = async () => {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        setResultadosMasivo([]);
        try {
            const res = await clienteService.cargaMasiva(previewData);
            setSuccessMsg(res.message);
            setResultadosMasivo(res.resultados);
            setSelectedFile(null);
            setPreviewData([]);
            setErroresCSV([]);
        } catch (err) {
            setErrorMsg('Error al cargar/actualizar clientes');
        } finally {
            setLoading(false);
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
                        <PeopleAltIcon sx={{ mr: 0.5, fontSize: 20 }} />
                        <Typography color="text.primary">Clientes</Typography>
                    </Box>
                </Breadcrumbs>
                <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Clientes</Typography>
                <Divider />
            </Box>

            <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="LISTA DE CLIENTES" />
                    <Tab label="REGISTRO MASIVO / ACTUALIZACIÓN MASIVA" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <ListaClientes />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 2 }} elevation={0}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Carga/Actualización masiva de clientes</Typography>
                    <Button
                        variant="outlined"
                        href="/plantilla_clientes.csv"
                        download
                        sx={{ mb: 2 }}
                    >
                        Descargar plantilla CSV
                    </Button>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <input
                            accept=".csv"
                            style={{ display: 'none' }}
                            id="upload-clientes-csv"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="upload-clientes-csv">
                            <Button variant="contained" component="span" startIcon={<UploadFileIcon />}>Seleccionar archivo CSV</Button>
                            {selectedFile && <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>{selectedFile.name}</Typography>}
                        </label>
                        {previewData.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">Vista previa de datos:</Typography>
                                <TableContainer sx={{ maxHeight: 240 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                {CAMPOS_CSV.map((col) => (
                                                    <TableCell key={col}>{col}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {previewData.slice(0, 5).map((row, idx) => (
                                                <TableRow key={idx}>
                                                    {CAMPOS_CSV.map((col, i) => (
                                                        <TableCell key={i}>{row[col]}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {previewData.length > 5 && <Typography variant="body2" color="text.secondary">...y {previewData.length - 5} más</Typography>}
                            </Box>
                        )}
                        {erroresCSV.length > 0 && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Errores en el archivo CSV:</Typography>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {erroresCSV.slice(0, 5).map((err, idx) => (
                                        <li key={idx}>Fila {err.fila}: {Object.entries(err.errores).map(([campo, msg]) => `${campo}: ${msg}`).join(', ')}</li>
                                    ))}
                                    {erroresCSV.length > 5 && <li>...y {erroresCSV.length - 5} más</li>}
                                </ul>
                            </Alert>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!selectedFile || previewData.length === 0 || erroresCSV.length > 0 || loading}
                            onClick={handleUpload}
                        >
                            {loading ? 'Procesando...' : 'Cargar/Actualizar clientes'}
                        </Button>
                        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
                        {successMsg && <Alert severity="success">{successMsg}</Alert>}
                        {resultadosMasivo.length > 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Resumen de carga masiva:</Typography>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {resultadosMasivo.slice(0, 10).map((r, idx) => (
                                        <li key={idx}>{r.codigoCliente}: {r.accion}</li>
                                    ))}
                                    {resultadosMasivo.length > 10 && <li>...y {resultadosMasivo.length - 10} más</li>}
                                </ul>
                            </Alert>
                        )}
                    </Box>
                </Paper>
            </TabPanel>
        </React.Fragment>
    );
};

export default AdminClientes; 
import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, Grid, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import clienteService from '../services/clienteService';
import Chip from '@mui/material/Chip';

const mockClienteDetalle = {
    '20200554': {
        codigo: '21321312324',
        nombres: 'Oscar Rodrigo',
        paterno: 'Canez',
        materno: 'Rodriguez',
        tipoDoc: 'Documento nacional de identidad (DNI)',
        numDoc: '29381267',
        tipoCliente: 'Estudiante',
        nivel: 'Primaria',
        grado: 'Quinto grado',
        seccion: 'C',
        telefono1: '+51 928 376 234',
        telefono2: '',
        estado: 'Activo',
    }
};

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <Box>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="body1">{value || '-'}</Typography>
    </Box>
);

const AdminClienteDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // const cliente = mockClienteDetalle[id];
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCliente = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await clienteService.obtenerPorId(id);
                
                // Funciones de traducción
                const traducirTipoCliente = (tipo) => {
                    if (tipo === 'E') return 'Estudiante';
                    if (tipo === 'D') return 'Docente';
                    if (tipo === 'G') return 'General';
                    return tipo;
                };

                const traducirTipoDocumento = (tipo) => {
                    if (tipo === 'DNI') return 'Documento nacional de identidad (DNI)';
                    if (tipo === 'CEX') return 'Carnet de extranjería';
                    return tipo;
                };

                const traducirNivel = (nivel) => {
                    if (nivel === 'PR') return 'Primaria';
                    if (nivel === 'IN') return 'Inicial';
                    if (nivel === 'SE') return 'Secundaria';
                    return nivel;
                };

                const traducirGrado = (grado) => {
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

                // Mapear los campos del backend a los nombres que espera el frontend
                const clienteMapeado = {
                    codigo: res.data.codigoCliente,
                    nombres: res.data.nombres,
                    paterno: res.data.apellidoPaterno,
                    materno: res.data.apellidoMaterno,
                    tipoDoc: traducirTipoDocumento(res.data.tipoDocumento),
                    numDoc: res.data.numDocumento,
                    tipoCliente: traducirTipoCliente(res.data.tipoCliente),
                    nivel: traducirNivel(res.data.nivel),
                    grado: traducirGrado(res.data.grado),
                    seccion: res.data.seccion,
                    telefono1: res.data.telefono1,
                    telefono2: res.data.telefono2,
                    vigencia: res.data.clienteVigente ? 'Vigente' : 'No vigente',
                };
                setCliente(clienteMapeado);
                // Cargar contratos reales
                const contratosRes = await clienteService.obtenerContratos(id);
                const contratosData = Array.isArray(contratosRes.data) ? contratosRes.data.map(c => ({
                  codigo: c.codigoContrato,
                  fechaCreacion: c.fechaCreacion,
                  inicioVigencia: c.fechaInicioVigencia,
                  finVigencia: c.fechaFinVigencia,
                  importeAbonos: c.importeAbonos,
                  importeConsumos: c.importeConsumos,
                  importeSaldo: c.importeSaldo
                })) : [];
                setContratos(contratosData);
                setContratosFiltrados(contratosData);
            } catch (err) {
                setError('No se pudo cargar el cliente.');
            } finally {
                setLoading(false);
            }
        };
        fetchCliente();
    }, [id]);

    // Estados de datos
    const [contratos, setContratos] = useState([]);
    const [contratosFiltrados, setContratosFiltrados] = useState([]);

    // Estados de UI
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados de filtros
    const [filtroCodigo, setFiltroCodigo] = useState('');
    
    // Filtros de fecha de creación
    const [fechaCreacionDesde, setFechaCreacionDesde] = useState(null);
    const [fechaCreacionHasta, setFechaCreacionHasta] = useState(null);
    
    // Filtros de fecha de inicio de vigencia
    const [fechaInicioVigenciaDesde, setFechaInicioVigenciaDesde] = useState(null);
    const [fechaInicioVigenciaHasta, setFechaInicioVigenciaHasta] = useState(null);
    
    // Filtros de fecha de fin de vigencia
    const [fechaFinVigenciaDesde, setFechaFinVigenciaDesde] = useState(null);
    const [fechaFinVigenciaHasta, setFechaFinVigenciaHasta] = useState(null);

    // Estado de control de filtros
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);
    const filtrosIniciales = {
        codigo: '',
        fechaCreacionDesde: null,
        fechaCreacionHasta: null,
        fechaInicioVigenciaDesde: null,
        fechaInicioVigenciaHasta: null,
        fechaFinVigenciaDesde: null,
        fechaFinVigenciaHasta: null,
    };
    const filtrosEnEstadoInicial =
        filtroCodigo === filtrosIniciales.codigo &&
        !fechaCreacionDesde &&
        !fechaCreacionHasta &&
        !fechaInicioVigenciaDesde &&
        !fechaInicioVigenciaHasta &&
        !fechaFinVigenciaDesde &&
        !fechaFinVigenciaHasta;

    // Estados de modales
    const [nuevoContratoModalOpen, setNuevoContratoModalOpen] = useState(false);
    const [editarClienteModalOpen, setEditarClienteModalOpen] = useState(false);
    const [editCliente, setEditCliente] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [eliminarClienteModalOpen, setEliminarClienteModalOpen] = useState(false);
    const [eliminarLoading, setEliminarLoading] = useState(false);
    const [eliminarError, setEliminarError] = useState('');

    // Opciones para selects según diccionario de datos
    const opcionesTipoCliente = [
        { value: 'E', label: 'Estudiante' },
        { value: 'D', label: 'Docente' },
        { value: 'G', label: 'General' }
    ];
    const opcionesNivel = [
        { value: 'IN', label: 'Inicial' },
        { value: 'PR', label: 'Primaria' },
        { value: 'SE', label: 'Secundaria' }
    ];
    const opcionesTipoDocumento = [
        { value: 'DNI', label: 'DNI' },
        { value: 'CEX', label: 'Carnet de extranjería' }
    ];
    const opcionesGrado = [
        { value: 'IN4', label: '4 años' },
        { value: 'IN5', label: '5 años' },
        { value: 'PR1', label: '1er grado' },
        { value: 'PR2', label: '2do grado' },
        { value: 'PR3', label: '3er grado' },
        { value: 'PR4', label: '4to grado' },
        { value: 'PR5', label: '5to grado' },
        { value: 'PR6', label: '6to grado' },
        { value: 'SE1', label: '1er grado' },
        { value: 'SE2', label: '2do grado' },
        { value: 'SE3', label: '3er grado' },
        { value: 'SE4', label: '4to grado' },
        { value: 'SE5', label: '5to grado' }
    ];

    if (loading) {
        return <Typography>Cargando cliente...</Typography>;
    }
    if (error) {
        return <Typography color="error">{error}</Typography>;
    }
    if (!cliente) {
        return <Typography>Cliente no encontrado</Typography>;
    }
    
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Lógica de filtros
    const handleAplicarFiltros = () => {
        let filtrados = contratos.filter(c => {
            const matchCodigo = !filtroCodigo || c.codigo.toLowerCase().includes(filtroCodigo.toLowerCase());
            
            const fechaCreacionContrato = dayjs(c.fechaCreacion, 'DD/MM/YYYY');
            const matchFechaCreacion = 
                (!fechaCreacionDesde || fechaCreacionContrato.isSame(dayjs(fechaCreacionDesde), 'day') || fechaCreacionContrato.isAfter(dayjs(fechaCreacionDesde), 'day')) &&
                (!fechaCreacionHasta || fechaCreacionContrato.isSame(dayjs(fechaCreacionHasta), 'day') || fechaCreacionContrato.isBefore(dayjs(fechaCreacionHasta), 'day'));

            const inicioVigenciaContrato = dayjs(c.inicioVigencia, 'DD/MM/YYYY');
            const matchInicioVigencia =
                (!fechaInicioVigenciaDesde || inicioVigenciaContrato.isSame(dayjs(fechaInicioVigenciaDesde), 'day') || inicioVigenciaContrato.isAfter(dayjs(fechaInicioVigenciaDesde), 'day')) &&
                (!fechaInicioVigenciaHasta || inicioVigenciaContrato.isSame(dayjs(fechaInicioVigenciaHasta), 'day') || inicioVigenciaContrato.isBefore(dayjs(fechaInicioVigenciaHasta), 'day'));

            const finVigenciaContrato = dayjs(c.finVigencia, 'DD/MM/YYYY');
            const matchFinVigencia =
                (!fechaFinVigenciaDesde || finVigenciaContrato.isSame(dayjs(fechaFinVigenciaDesde), 'day') || finVigenciaContrato.isAfter(dayjs(fechaFinVigenciaDesde), 'day')) &&
                (!fechaFinVigenciaHasta || finVigenciaContrato.isSame(dayjs(fechaFinVigenciaHasta), 'day') || finVigenciaContrato.isBefore(dayjs(fechaFinVigenciaHasta), 'day'));

            return matchCodigo && matchFechaCreacion && matchInicioVigencia && matchFinVigencia;
        });
        setContratosFiltrados(filtrados);
        setFiltrosAplicados(true);
        setPage(0);
    };

    const handleLimpiarFiltros = () => {
        setFiltroCodigo(filtrosIniciales.codigo);
        setFechaCreacionDesde(null);
        setFechaCreacionHasta(null);
        setFechaInicioVigenciaDesde(null);
        setFechaInicioVigenciaHasta(null);
        setFechaFinVigenciaDesde(null);
        setFechaFinVigenciaHasta(null);
        setContratosFiltrados(contratos);
        setFiltrosAplicados(false);
        setPage(0);
    };

    // Lógica de modales
    const handleGuardarNuevoContrato = () => {
        const nuevo = {
            ...nuevoContrato,
            id: Math.max(...contratos.map(c => c.id || 0)) + 1,
            fechaCreacion: dayjs(nuevoContrato.fechaCreacion).format('DD/MM/YYYY'),
            inicioVigencia: dayjs(nuevoContrato.inicioVigencia).format('DD/MM/YYYY'),
            finVigencia: dayjs(nuevoContrato.finVigencia).format('DD/MM/YYYY'),
            importeAbonos: 'S/ 0.00',
            importeConsumos: 'S/ 0.00',
            importeSaldo: 'S/ 0.00',
        };
        const actualizados = [...contratos, nuevo];
        setContratos(actualizados);
        setContratosFiltrados(actualizados);
        setNuevoContratoModalOpen(false);
        setNuevoContrato({ codigo: '', fechaCreacion: null, inicioVigencia: null, finVigencia: null });
    };

    const nombreCompleto = `${cliente.nombres} ${cliente.paterno} ${cliente.materno}`;

    // Funciones de traducción para mostrar valores legibles en el detalle
    const mostrarTipoCliente = (tipo) => {
        if (tipo === 'E') return 'Estudiante';
        if (tipo === 'D') return 'Docente';
        if (tipo === 'G') return 'General';
        return tipo;
    };
    const mostrarTipoDocumento = (tipo) => {
        if (tipo === 'DNI') return 'Documento nacional de identidad (DNI)';
        if (tipo === 'CEX') return 'Carnet de extranjería';
        return tipo;
    };
    const mostrarNivel = (nivel) => {
        if (nivel === 'IN') return 'Inicial';
        if (nivel === 'PR') return 'Primaria';
        if (nivel === 'SE') return 'Secundaria';
        return nivel;
    };
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

    return (
        <React.Fragment>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}><HomeIcon sx={{ fontSize: 20 }} /></IconButton>
                <IconButton component={RouterLink} to="/admin/clientes" size="small" sx={{ color: 'inherit', p: 0.5 }}><PeopleAltIcon sx={{ fontSize: 20 }} /></IconButton>
                <Typography color="text.primary">{nombreCompleto}</Typography>
            </Breadcrumbs>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight={600}>{nombreCompleto}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="INFORMACIÓN" />
                        <Tab label="CONTRATOS" />
                    </Tabs>
                </Box>
                <Box>
                    <Button variant="contained" sx={{ mr: 1 }} onClick={() => {
                        const tipoClienteCod = cliente.tipoCliente === 'Estudiante' ? 'E' : cliente.tipoCliente === 'Docente' ? 'D' : cliente.tipoCliente === 'General' ? 'G' : cliente.tipoCliente;
                        const tipoDocCod = cliente.tipoDoc === 'Documento nacional de identidad (DNI)' ? 'DNI' : cliente.tipoDoc === 'Carnet de extranjería' ? 'CEX' : cliente.tipoDoc;
                        let nivelCod = cliente.nivel;
                        if (cliente.nivel === 'Inicial') nivelCod = 'IN';
                        if (cliente.nivel === 'Primaria') nivelCod = 'PR';
                        if (cliente.nivel === 'Secundaria') nivelCod = 'SE';
                        let gradoCod = cliente.grado;
                        if (cliente.grado === '4 años') gradoCod = 'IN4';
                        if (cliente.grado === '5 años') gradoCod = 'IN5';
                        if (cliente.grado === '1er grado') gradoCod = nivelCod === 'PR' ? 'PR1' : 'SE1';
                        if (cliente.grado === '2do grado') gradoCod = nivelCod === 'PR' ? 'PR2' : 'SE2';
                        if (cliente.grado === '3er grado') gradoCod = nivelCod === 'PR' ? 'PR3' : 'SE3';
                        if (cliente.grado === '4to grado') gradoCod = nivelCod === 'PR' ? 'PR4' : 'SE4';
                        if (cliente.grado === '5to grado') gradoCod = nivelCod === 'PR' ? 'PR5' : 'SE5';
                        if (cliente.grado === '6to grado') gradoCod = 'PR6';
                        setEditCliente({
                            nombres: cliente.nombres || '',
                            paterno: cliente.paterno || '',
                            materno: cliente.materno || '',
                            telefono1: cliente.telefono1 || '',
                            telefono2: cliente.telefono2 || '',
                            tipoCliente: tipoClienteCod || '',
                            nivel: nivelCod || '',
                            grado: gradoCod || '',
                            numDoc: cliente.numDoc || '',
                            tipoDoc: tipoDocCod || '',
                            codigo: cliente.codigo || '',
                            vigencia: cliente.vigencia || '',
                            seccion: cliente.seccion || ''
                        });
                        setEditarClienteModalOpen(true);
                    }}>EDITAR CLIENTE</Button>
                    <Button variant="outlined" color="error" onClick={() => setEliminarClienteModalOpen(true)}>ELIMINAR CLIENTE</Button>
                </Box>
            </Box>
            <Divider />

            <TabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }} elevation={0}>
                    <InfoItem label="Código de cliente" value={cliente.codigo} />
                </Paper>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }} elevation={0}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}><InfoItem label="Nombres" value={cliente.nombres} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Apellido paterno" value={cliente.paterno} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Apellido materno" value={cliente.materno} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Tipo de documento de identidad" value={mostrarTipoDocumento(cliente.tipoDoc)} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Número de documento" value={cliente.numDoc} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Tipo de cliente" value={mostrarTipoCliente(cliente.tipoCliente)} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Teléfono 1" value={cliente.telefono1} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Teléfono 2" value={cliente.telefono2} /></Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <Paper sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }} elevation={0}>
                             <Grid container spacing={3}>
                                <Grid item xs={12}><InfoItem label="Nivel" value={mostrarNivel(cliente.nivel)} /></Grid>
                                <Grid item xs={12}><InfoItem label="Grado" value={mostrarGrado(cliente.grado)} /></Grid>
                                <Grid item xs={12}><InfoItem label="Sección" value={cliente.seccion} /></Grid>
                                <Grid item xs={12}><InfoItem label="Vigencia" value={cliente.vigencia} /></Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltros} disabled={filtrosEnEstadoInicial || filtrosAplicados}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltros} disabled={!filtrosAplicados}>LIMPIAR FILTROS</Button>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField label="Ingrese el código" variant="outlined" size="small" fullWidth value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)} disabled={filtrosAplicados}/>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Fecha creación desde"
                                            value={fechaCreacionDesde}
                                            onChange={setFechaCreacionDesde}
                                            renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Fecha creación hasta"
                                            value={fechaCreacionHasta}
                                            onChange={setFechaCreacionHasta}
                                            renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Inicio vigencia desde"
                                            value={fechaInicioVigenciaDesde}
                                            onChange={setFechaInicioVigenciaDesde}
                                            renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Inicio vigencia hasta"
                                            value={fechaInicioVigenciaHasta}
                                            onChange={setFechaInicioVigenciaHasta}
                                            renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Fin vigencia desde"
                                            value={fechaFinVigenciaDesde}
                                            onChange={setFechaFinVigenciaDesde}
                                            renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Fin vigencia hasta"
                                            value={fechaFinVigenciaHasta}
                                            onChange={setFechaFinVigenciaHasta}
                                            renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={filtrosAplicados} />}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Código</TableCell>
                                    <TableCell>Fecha creación</TableCell>
                                    <TableCell>Inicio vigencia</TableCell>
                                    <TableCell>Fin vigencia</TableCell>
                                    <TableCell>Saldo o deuda</TableCell>
                                    <TableCell>Importe saldo</TableCell>
                                    <TableCell align="center">Detalle</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contratosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contrato) => (
                                    <TableRow key={contrato.codigo} hover>
                                        <TableCell>{contrato.codigo || '-'}</TableCell>
                                        <TableCell>{contrato.fechaCreacion ? dayjs(contrato.fechaCreacion).format('DD/MM/YYYY') : '-'}</TableCell>
                                        <TableCell>{contrato.inicioVigencia ? dayjs(contrato.inicioVigencia).format('DD/MM/YYYY') : '-'}</TableCell>
                                        <TableCell>{contrato.finVigencia ? dayjs(contrato.finVigencia).format('DD/MM/YYYY') : '-'}</TableCell>
                                        <TableCell>
                                            {(contrato.importeSaldo !== undefined && contrato.importeSaldo !== null) ? (
                                                <Chip
                                                    label={Number(contrato.importeSaldo) < 0 ? 'Deuda' : 'Saldo'}
                                                    color={Number(contrato.importeSaldo) < 0 ? 'error' : 'success'}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ) : '-' }
                                        </TableCell>
                                        <TableCell>
                                            {(contrato.importeSaldo !== undefined && contrato.importeSaldo !== null) ? `S/. ${Number(contrato.importeSaldo).toFixed(2)}` : '-' }
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => navigate(`/admin/clientes/${id}/contrato/${contrato.codigo}`)}>
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
                        count={contratosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            <Dialog open={editarClienteModalOpen} onClose={() => setEditarClienteModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogContent>
                    {editError && <Typography color="error" sx={{ mb: 1 }}>{editError}</Typography>}
                    {editCliente && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Nombres" fullWidth value={editCliente.nombres} onChange={e => setEditCliente({ ...editCliente, nombres: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Apellido paterno" fullWidth value={editCliente.paterno} onChange={e => setEditCliente({ ...editCliente, paterno: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Apellido materno" fullWidth value={editCliente.materno} onChange={e => setEditCliente({ ...editCliente, materno: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Teléfono 1" fullWidth value={editCliente.telefono1} onChange={e => setEditCliente({ ...editCliente, telefono1: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Teléfono 2" fullWidth value={editCliente.telefono2} onChange={e => setEditCliente({ ...editCliente, telefono2: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Tipo de cliente" select fullWidth value={editCliente.tipoCliente} onChange={e => setEditCliente({ ...editCliente, tipoCliente: e.target.value, nivel: '', grado: '', seccion: '' })}>
                                    <MenuItem value="">Seleccione</MenuItem>
                                    {opcionesTipoCliente.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Nivel" select fullWidth value={editCliente.nivel} onChange={e => setEditCliente({ ...editCliente, nivel: e.target.value, grado: '', seccion: '' })} disabled={editCliente.tipoCliente !== 'E'}>
                                    <MenuItem value="">Seleccione</MenuItem>
                                    {opcionesNivel.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Grado" select fullWidth value={editCliente.grado} onChange={e => setEditCliente({ ...editCliente, grado: e.target.value, seccion: '' })} disabled={editCliente.tipoCliente !== 'E' || !editCliente.nivel}>
                                    <MenuItem value="">Seleccione</MenuItem>
                                    {opcionesGrado.filter(opt => (editCliente.nivel === 'IN' && opt.value.startsWith('IN')) || (editCliente.nivel === 'PR' && opt.value.startsWith('PR')) || (editCliente.nivel === 'SE' && opt.value.startsWith('SE'))).map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Número de documento" fullWidth value={editCliente.numDoc} onChange={e => setEditCliente({ ...editCliente, numDoc: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Tipo de documento" select fullWidth value={editCliente.tipoDoc} onChange={e => setEditCliente({ ...editCliente, tipoDoc: e.target.value })}>
                                    <MenuItem value="">Seleccione</MenuItem>
                                    {opcionesTipoDocumento.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Código de cliente" fullWidth value={editCliente.codigo} onChange={e => setEditCliente({ ...editCliente, codigo: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Vigencia" fullWidth value={editCliente.vigencia} disabled />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Sección" select fullWidth value={editCliente.seccion} onChange={e => setEditCliente({ ...editCliente, seccion: e.target.value })} disabled={editCliente.tipoCliente !== 'E' || !editCliente.nivel || !editCliente.grado}>
                                    <MenuItem value="">Seleccione</MenuItem>
                                    <MenuItem value="A">A</MenuItem>
                                    <MenuItem value="B">B</MenuItem>
                                    <MenuItem value="C">C</MenuItem>
                                    <MenuItem value="D">D</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditarClienteModalOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={async () => {
                        setEditLoading(true);
                        setEditError('');
                        try {
                            // Validar campos obligatorios antes de enviar
                            const camposObligatorios = [
                                'nombres','paterno','materno','telefono1','tipoCliente','numDoc','tipoDoc','codigo'
                            ];
                            for (const campo of camposObligatorios) {
                                if (!editCliente[campo] || editCliente[campo].toString().trim() === '') {
                                    setEditError('Todos los campos son obligatorios excepto Teléfono 2.');
                                    setEditLoading(false);
                                    return;
                                }
                            }
                            if (editCliente.tipoCliente === 'E') {
                                if (!editCliente.nivel || !editCliente.grado || !editCliente.seccion) {
                                    setEditError('Nivel, grado y sección son obligatorios para estudiantes.');
                                    setEditLoading(false);
                                    return;
                                }
                                if (!['A','B','C','D'].includes(editCliente.seccion)) {
                                    setEditError('La sección debe ser A, B, C o D.');
                                    setEditLoading(false);
                                    return;
                                }
                            }
                            // Construir objeto para backend con todos los campos requeridos
                            const payload = {
                                codigoCliente: editCliente.codigo,
                                nombres: editCliente.nombres,
                                apellidoPaterno: editCliente.paterno,
                                apellidoMaterno: editCliente.materno,
                                telefono1: editCliente.telefono1,
                                telefono2: editCliente.telefono2,
                                seccion: editCliente.seccion,
                                tipoCliente: editCliente.tipoCliente,
                                nivel: editCliente.nivel,
                                grado: editCliente.grado,
                                numDocumento: editCliente.numDoc,
                                tipoDocumento: editCliente.tipoDoc,
                                clienteVigente: cliente.vigencia === 'Vigente',
                                activo: true
                            };
                            console.log('Payload a enviar al backend:', payload);
                            await clienteService.actualizar(id, payload);
                            setCliente({ ...cliente, ...editCliente });
                            setEditarClienteModalOpen(false);
                        } catch (err) {
                            setEditError('Error al guardar los cambios.');
                            console.error('Error al guardar cliente:', err);
                        } finally {
                            setEditLoading(false);
                        }
                    }} disabled={
                        editLoading ||
                        !editCliente ||
                        Object.entries(editCliente).some(([k, v]) => [
                            'nombres','paterno','materno','telefono1','tipoCliente','numDoc','tipoDoc','codigo'
                        ].includes(k) && (!v || v.toString().trim() === '')) ||
                        (editCliente.tipoCliente === 'E' && (!editCliente.nivel || !editCliente.grado || !editCliente.seccion || !['A','B','C','D'].includes(editCliente.seccion)))
                    }>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={eliminarClienteModalOpen} onClose={() => setEliminarClienteModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Eliminar Cliente</DialogTitle>
                <DialogContent>
                    <Typography>¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.</Typography>
                    {eliminarError && <Typography color="error" sx={{ mt: 1 }}>{eliminarError}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEliminarClienteModalOpen(false)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={async () => {
                        setEliminarLoading(true);
                        setEliminarError('');
                        try {
                            await clienteService.eliminar(id);
                            setEliminarClienteModalOpen(false);
                            navigate('/admin/clientes');
                        } catch (err) {
                            setEliminarError('Error al eliminar el cliente.');
                            console.error('Error al eliminar cliente:', err);
                        } finally {
                            setEliminarLoading(false);
                        }
                    }} disabled={eliminarLoading}>Eliminar</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default AdminClienteDetalle; 
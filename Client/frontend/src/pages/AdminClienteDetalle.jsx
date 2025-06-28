import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, Grid, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Popover, InputAdornment } from '@mui/material';
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
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import es from 'date-fns/locale/es';
import clienteService from '../services/clienteService';

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

const mockContratos = [
    {
        codigo: '000200',
        fechaCreacion: '01/03/2025',
        inicioVigencia: '01/03/2025',
        finVigencia: '31/12/2025',
        importeAbonos: 'S/ 1000.00',
        importeConsumos: 'S/ 500.00',
        importeSaldo: 'S/ 500.00',
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
                    estado: res.data.clienteVigente ? 'Activo' : 'Inactivo'
                };
                setCliente(clienteMapeado);
            } catch (err) {
                setError('No se pudo cargar el cliente.');
            } finally {
                setLoading(false);
            }
        };
        fetchCliente();
    }, [id]);

    // Estados de datos
    const [contratos, setContratos] = useState(mockContratos);
    const [contratosFiltrados, setContratosFiltrados] = useState(mockContratos);

    // Estados de UI
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados de filtros
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [rangoFechaCreacion, setRangoFechaCreacion] = useState([{
        startDate: null,
        endDate: null,
        key: 'selection'
    }]);
    const [rangoInicioVigencia, setRangoInicioVigencia] = useState([{
        startDate: null,
        endDate: null,
        key: 'selection'
    }]);
    const [rangoFinVigencia, setRangoFinVigencia] = useState([{
        startDate: null,
        endDate: null,
        key: 'selection'
    }]);

    // Estados para Popover
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverType, setPopoverType] = useState('');
    
    // Estado de control de filtros
    const [filtrosAplicados, setFiltrosAplicados] = useState(false);
    const filtrosIniciales = {
        codigo: '',
        fechaCreacion: [{ startDate: null, endDate: null, key: 'selection' }],
        inicioVigencia: [{ startDate: null, endDate: null, key: 'selection' }],
        finVigencia: [{ startDate: null, endDate: null, key: 'selection' }],
    };
    const filtrosEnEstadoInicial =
        filtroCodigo === filtrosIniciales.codigo &&
        rangoFechaCreacion[0].startDate === null &&
        rangoFechaCreacion[0].endDate === null &&
        rangoInicioVigencia[0].startDate === null &&
        rangoInicioVigencia[0].endDate === null &&
        rangoFinVigencia[0].startDate === null &&
        rangoFinVigencia[0].endDate === null;

    // Estados de modales
    const [nuevoContratoModalOpen, setNuevoContratoModalOpen] = useState(false);
    const [nuevoContrato, setNuevoContrato] = useState({
        codigo: '',
        fechaCreacion: null,
        inicioVigencia: null,
        finVigencia: null
    });

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
            const [rangoCreacion] = rangoFechaCreacion;
            const matchFechaCreacion = 
                (!rangoCreacion.startDate || fechaCreacionContrato.isSame(dayjs(rangoCreacion.startDate), 'day') || fechaCreacionContrato.isAfter(dayjs(rangoCreacion.startDate), 'day')) &&
                (!rangoCreacion.endDate || fechaCreacionContrato.isSame(dayjs(rangoCreacion.endDate), 'day') || fechaCreacionContrato.isBefore(dayjs(rangoCreacion.endDate), 'day'));

            const inicioVigenciaContrato = dayjs(c.inicioVigencia, 'DD/MM/YYYY');
            const [rangoInicio] = rangoInicioVigencia;
            const matchInicioVigencia =
                (!rangoInicio.startDate || inicioVigenciaContrato.isSame(dayjs(rangoInicio.startDate), 'day') || inicioVigenciaContrato.isAfter(dayjs(rangoInicio.startDate), 'day')) &&
                (!rangoInicio.endDate || inicioVigenciaContrato.isSame(dayjs(rangoInicio.endDate), 'day') || inicioVigenciaContrato.isBefore(dayjs(rangoInicio.endDate), 'day'));

            const finVigenciaContrato = dayjs(c.finVigencia, 'DD/MM/YYYY');
            const [rangoFin] = rangoFinVigencia;
            const matchFinVigencia =
                (!rangoFin.startDate || finVigenciaContrato.isSame(dayjs(rangoFin.startDate), 'day') || finVigenciaContrato.isAfter(dayjs(rangoFin.startDate), 'day')) &&
                (!rangoFin.endDate || finVigenciaContrato.isSame(dayjs(rangoFin.endDate), 'day') || finVigenciaContrato.isBefore(dayjs(rangoFin.endDate), 'day'));

            return matchCodigo && matchFechaCreacion && matchInicioVigencia && matchFinVigencia;
        });
        setContratosFiltrados(filtrados);
        setFiltrosAplicados(true);
        setPage(0);
    };

    const handleLimpiarFiltros = () => {
        setFiltroCodigo(filtrosIniciales.codigo);
        setRangoFechaCreacion(filtrosIniciales.fechaCreacion);
        setRangoInicioVigencia(filtrosIniciales.inicioVigencia);
        setRangoFinVigencia(filtrosIniciales.finVigencia);
        setContratosFiltrados(contratos);
        setFiltrosAplicados(false);
        setPage(0);
    };

    // Handlers Popover
    const handleOpenPopover = (event, type) => {
        setAnchorEl(event.currentTarget);
        setPopoverType(type);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setPopoverType('');
    };

    const open = Boolean(anchorEl);
    const idPopover = open ? 'date-range-popover' : undefined;

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
                    <Button variant="contained" sx={{ mr: 1 }}>EDITAR CLIENTE</Button>
                    <Button variant="outlined" color="error">ELIMINAR CLIENTE</Button>
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
                                <Grid item xs={12} sm={6}><InfoItem label="Tipo de documento de identidad" value={cliente.tipoDoc} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Número de documento" value={cliente.numDoc} /></Grid>
                                <Grid item xs={12} sm={6}><InfoItem label="Tipo de cliente" value={cliente.tipoCliente} /></Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <Paper sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }} elevation={0}>
                             <Grid container spacing={3}>
                                <Grid item xs={12}><InfoItem label="Nivel" value={cliente.nivel} /></Grid>
                                <Grid item xs={12}><InfoItem label="Grado" value={cliente.grado} /></Grid>
                                <Grid item xs={12}><InfoItem label="Sección" value={cliente.seccion} /></Grid>
                                <Grid item xs={12}><InfoItem label="Teléfono 1" value={cliente.telefono1} /></Grid>
                                <Grid item xs={12}><InfoItem label="Teléfono 2" value={cliente.telefono2} /></Grid>
                                <Grid item xs={12}><InfoItem label="Estado" value={cliente.estado} /></Grid>
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
                            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setNuevoContratoModalOpen(true)} disabled={filtrosAplicados}>NUEVO CONTRATO</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField label="Ingrese el código" variant="outlined" size="small" sx={{ width: 150 }} value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)} disabled={filtrosAplicados}/>
                            <TextField
                                label="Fecha de Creación"
                                size="small"
                                value={
                                    rangoFechaCreacion[0].startDate && rangoFechaCreacion[0].endDate
                                    ? `${dayjs(rangoFechaCreacion[0].startDate).format('DD/MM/YYYY')} - ${dayjs(rangoFechaCreacion[0].endDate).format('DD/MM/YYYY')}`
                                    : ''
                                }
                                onClick={(e) => handleOpenPopover(e, 'creacion')}
                                readOnly
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CalendarTodayIcon sx={{ color: 'action.active', cursor: 'pointer' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Inicio Vigencia"
                                size="small"
                                value={
                                    rangoInicioVigencia[0].startDate && rangoInicioVigencia[0].endDate
                                    ? `${dayjs(rangoInicioVigencia[0].startDate).format('DD/MM/YYYY')} - ${dayjs(rangoInicioVigencia[0].endDate).format('DD/MM/YYYY')}`
                                    : ''
                                }
                                onClick={(e) => handleOpenPopover(e, 'inicio')}
                                readOnly
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CalendarTodayIcon sx={{ color: 'action.active', cursor: 'pointer' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Fin Vigencia"
                                size="small"
                                value={
                                    rangoFinVigencia[0].startDate && rangoFinVigencia[0].endDate
                                    ? `${dayjs(rangoFinVigencia[0].startDate).format('DD/MM/YYYY')} - ${dayjs(rangoFinVigencia[0].endDate).format('DD/MM/YYYY')}`
                                    : ''
                                }
                                onClick={(e) => handleOpenPopover(e, 'fin')}
                                readOnly
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CalendarTodayIcon sx={{ color: 'action.active', cursor: 'pointer' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Popover
                                id={idPopover}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClosePopover}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <DateRange
                                    editableDateInputs={true}
                                    onChange={item => {
                                        if (popoverType === 'creacion') setRangoFechaCreacion([item.selection]);
                                        else if (popoverType === 'inicio') setRangoInicioVigencia([item.selection]);
                                        else if (popoverType === 'fin') setRangoFinVigencia([item.selection]);
                                    }}
                                    moveRangeOnFirstSelection={false}
                                    ranges={
                                        popoverType === 'creacion' ? rangoFechaCreacion :
                                        popoverType === 'inicio' ? rangoInicioVigencia :
                                        rangoFinVigencia
                                    }
                                    locale={es}
                                />
                            </Popover>
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
                                    <TableCell>Importe abonos</TableCell>
                                    <TableCell>Importe consumos</TableCell>
                                    <TableCell>Importe saldo</TableCell>
                                    <TableCell align="center">Detalle</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contratosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((contrato) => (
                                    <TableRow key={contrato.codigo} hover>
                                        <TableCell>{contrato.codigo}</TableCell>
                                        <TableCell>{contrato.fechaCreacion}</TableCell>
                                        <TableCell>{contrato.inicioVigencia}</TableCell>
                                        <TableCell>{contrato.finVigencia}</TableCell>
                                        <TableCell>{contrato.importeAbonos}</TableCell>
                                        <TableCell>{contrato.importeConsumos}</TableCell>
                                        <TableCell>{contrato.importeSaldo}</TableCell>
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
            <Dialog open={nuevoContratoModalOpen} onClose={() => setNuevoContratoModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nuevo Contrato</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Código de contrato"
                                fullWidth
                                value={nuevoContrato.codigo}
                                onChange={(e) => setNuevoContrato({ ...nuevoContrato, codigo: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Fecha de creación"
                                    value={nuevoContrato.fechaCreacion}
                                    onChange={(date) => setNuevoContrato({ ...nuevoContrato, fechaCreacion: date })}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Inicio de vigencia"
                                    value={nuevoContrato.inicioVigencia}
                                    onChange={(date) => setNuevoContrato({ ...nuevoContrato, inicioVigencia: date })}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Fin de vigencia"
                                    value={nuevoContrato.finVigencia}
                                    onChange={(date) => setNuevoContrato({ ...nuevoContrato, finVigencia: date })}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNuevoContratoModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarNuevoContrato} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default AdminClienteDetalle; 
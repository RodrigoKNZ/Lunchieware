import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, TextField,
  Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Tooltip
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" disabled>APLICAR FILTROS</Button>
                    <Button variant="outlined" disabled>LIMPIAR FILTROS</Button>
                </Box>
                <Button variant="contained">+ NUEVO CLIENTE</Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
                {/* Campos de Filtro */}
                <TextField label="Nombres" size="small" />
                <TextField label="Apellido paterno" size="small" />
                <TextField label="Apellido materno" size="small" />
                <FormControl size="small"><InputLabel>Tipo</InputLabel><Select label="Tipo" defaultValue="todos"><MenuItem value="todos">Todos</MenuItem></Select></FormControl>
                <FormControl size="small"><InputLabel>Nivel</InputLabel><Select label="Nivel" defaultValue="todos"><MenuItem value="todos">Todos</MenuItem></Select></FormControl>
                <FormControl size="small"><InputLabel>Grado</InputLabel><Select label="Grado" defaultValue="todos"><MenuItem value="todos">Todos</MenuItem></Select></FormControl>
                <FormControl size="small"><InputLabel>Sección</InputLabel><Select label="Sección" defaultValue="todos"><MenuItem value="todos">Todos</MenuItem></Select></FormControl>
                <TextField label="Código" size="small" />
                <FormControl size="small"><InputLabel>Saldo o Deuda</InputLabel><Select label="Saldo o Deuda" defaultValue="ambos"><MenuItem value="ambos">Ambos</MenuItem></Select></FormControl>
                <TextField label="Saldo mínimo" size="small" />
                <TextField label="Saldo máximo" size="small" />
                <TextField label="Deuda mínima" size="small" />
                <TextField label="Deuda máxima" size="small" />
                <FormControl size="small"><InputLabel>Vigencia</InputLabel><Select label="Vigencia" defaultValue="todos"><MenuItem value="todos">Todos</MenuItem></Select></FormControl>
            </Box>
            <Divider sx={{ my: 2 }} />
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Nombre completo</TableCell>
                            <TableCell>Saldo o Deuda</TableCell>
                            <TableCell>Monto</TableCell>
                            <TableCell>Nivel</TableCell>
                            <TableCell>Grado</TableCell>
                            <TableCell>Sección</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Vigencia</TableCell>
                            <TableCell align="center">Detalle</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockClientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.nombre}</TableCell>
                                <TableCell>
                                     <Box sx={{
                                        color: 'white',
                                        bgcolor: row.saldo === 'Deuda' ? 'error.main' : 'success.main',
                                        px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem'
                                    }}>
                                        {row.saldo}
                                    </Box>
                                </TableCell>
                                <TableCell>S/. {row.monto.toFixed(2)}</TableCell>
                                <TableCell>{row.nivel}</TableCell>
                                <TableCell>{row.grado}</TableCell>
                                <TableCell>{row.seccion}</TableCell>
                                <TableCell>
                                    <Box sx={{
                                        color: '#37474f', bgcolor: '#eceff1',
                                        px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem'
                                    }}>
                                        {row.tipo}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                     <Box sx={{
                                        color: 'white', bgcolor: 'success.main',
                                        px: 1.2, py: 0.2, borderRadius: '12px', display: 'inline-block', fontSize: '0.75rem'
                                    }}>
                                        {row.vigencia}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Ver detalle">
                                        <IconButton onClick={() => navigate(`/admin/clientes/${row.id}`)}><VisibilityIcon /></IconButton>
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
                count={mockClientes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
            />
        </Paper>
    );
};

const AdminClientes = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                <Typography>Próximamente: Funcionalidad de registro y actualización masiva.</Typography>
            </TabPanel>
        </React.Fragment>
    );
};

export default AdminClientes; 
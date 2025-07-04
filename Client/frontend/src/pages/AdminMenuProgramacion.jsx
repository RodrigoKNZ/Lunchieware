import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, TextField, useMediaQuery, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import programacionMenuService from '../services/programacionMenuService';
import { esES } from '@mui/x-date-pickers/locales';

// Configurar dayjs para usar español
dayjs.locale('es');

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AdminMenuProgramacion = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [fecha, setFecha] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [menuEditado, setMenuEditado] = useState({});
  const [openImportModal, setOpenImportModal] = useState(false);
  const [importStep, setImportStep] = useState('upload');
  const [errorDetail, setErrorDetail] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuSeleccionado, setMenuSeleccionado] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Cargar menú real del backend al seleccionar fecha
  useEffect(() => {
    const fetchMenu = async () => {
      if (!fecha) {
        setMenuSeleccionado(null);
        return;
      }
      setLoading(true);
      try {
        const fechaStr = dayjs(fecha).format('YYYY-MM-DD');
        console.log('Consultando menú para fecha:', fechaStr, 'tipo:', typeof fecha, fecha);
        const res = await programacionMenuService.obtenerPorFecha(fechaStr);
        setMenuSeleccionado(res.data);
      } catch (err) {
        setMenuSeleccionado(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [fecha]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenEditModal = () => {
    if (menuSeleccionado) {
      setMenuEditado({
        entrada: menuSeleccionado.entrada,
        platoMenu: menuSeleccionado.plato,
        platoCarta: menuSeleccionado.platoALaCarta,
        refresco: menuSeleccionado.refresco,
        postre: menuSeleccionado.postre
      });
    } else {
      setMenuEditado({ entrada: '', platoMenu: '', platoCarta: '', refresco: '', postre: '' });
    }
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleGuardarMenu = async () => {
    try {
      const menuData = {
        fecha: dayjs(fecha).format('YYYY-MM-DD'),
        entrada: menuEditado.entrada,
        plato: menuEditado.platoMenu,
        platoALaCarta: menuEditado.platoCarta,
        refresco: menuEditado.refresco,
        postre: menuEditado.postre
      };
      if (menuSeleccionado) {
        const res = await programacionMenuService.actualizar(menuSeleccionado.idMenu, menuData);
        setSnackbar({ open: true, message: 'Menú actualizado exitosamente', severity: 'success' });
        setMenuSeleccionado(res.data);
      } else {
        const res = await programacionMenuService.crear(menuData);
        setSnackbar({ open: true, message: 'Menú creado exitosamente', severity: 'success' });
        setMenuSeleccionado(res.data);
      }
      setOpenEditModal(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar el menú', severity: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuEditado(prev => ({...prev, [name]: value}));
  };

  const isEditFormInvalid = !menuEditado.entrada || !menuEditado.platoMenu || !menuEditado.platoCarta || !menuEditado.refresco || !menuEditado.postre;

  const handleOpenImportModal = () => {
    setImportStep('upload');
    setOpenImportModal(true);
  };

  const handleCloseImportModal = () => {
    setOpenImportModal(false);
  };

  // Parsear CSV y validar estructura
  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['fecha','entrada','platoMenu','platoCarta','refresco','postre'];
    if (headers.length !== 6 || !expectedHeaders.every((h, i) => headers[i] === h)) {
      return { error: 'structure' };
    }
    const data = [];
    const errors = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length !== 6) {
        errors.push({ row: i+1, error: 'Estructura de fila incorrecta' });
        continue;
      }
      let [fecha, entrada, platoMenu, platoCarta, refresco, postre] = row.map(x => x.trim());
      const rowErrors = {};
      // Validaciones básicas para dd/mm/yyyy
      let fechaISO = '';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        // Convertir a YYYY-MM-DD
        const [dd, mm, yyyy] = fecha.split('/');
        fechaISO = `${yyyy}-${mm}-${dd}`;
      } else {
        rowErrors.fecha = 'Formato inválido (dd/mm/yyyy)';
      }
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,'-]/.test(entrada)) rowErrors.entrada = 'Caracteres no permitidos';
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,'-]/.test(platoMenu)) rowErrors.platoMenu = 'Caracteres no permitidos';
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,'-]/.test(platoCarta)) rowErrors.platoCarta = 'Caracteres no permitidos';
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,'-]/.test(refresco)) rowErrors.refresco = 'Caracteres no permitidos';
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,'-]/.test(postre)) rowErrors.postre = 'Caracteres no permitidos';
      if (Object.keys(rowErrors).length > 0) {
        errors.push({ fecha, entrada, platoMenu, platoCarta, refresco, postre, errors: rowErrors });
      } else {
        data.push({ fecha: fechaISO, entrada, platoMenu, platoCarta, refresco, postre });
      }
    }
    if (errors.length > 0) return { error: 'data', errors };
    return { data };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setImportStep('error_format');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      if (parsed.error === 'structure') {
        setImportStep('error_structure');
      } else if (parsed.error === 'data') {
        setErrorDetail(parsed.errors);
        setImportStep('error_data');
      } else {
        setPreviewData(parsed.data);
        setImportStep('preview');
      }
    };
    reader.readAsText(file);
  };

  const handleImportarMenus = async () => {
    try {
      for (const row of previewData) {
        await programacionMenuService.crear({
          fecha: row.fecha,
          entrada: row.entrada,
          plato: row.platoMenu,
          platoALaCarta: row.platoCarta,
          refresco: row.refresco,
          postre: row.postre
        });
      }
      setSnackbar({ open: true, message: 'Importación exitosa', severity: 'success' });
      setOpenImportModal(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al importar los menús', severity: 'error' });
    }
  };

  const renderImportContent = () => {
    switch(importStep) {
        case 'upload':
            return (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography sx={{ mb: 2 }}>Suba el archivo csv con los datos de la programación del menú</Typography>
                    <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                        SUBIR ARCHIVO
                        <input type="file" hidden accept=".csv" onChange={handleFileChange} />
                    </Button>
                </Box>
            );
        case 'preview':
            return (
                <>
                    <Typography variant="h6" sx={{mb: 2, textAlign: 'center'}}>Vista previa de importación</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Entrada</TableCell>
                                    <TableCell>Plato (Menú)</TableCell>
                                    <TableCell>Plato a la carta</TableCell>
                                    <TableCell>Refresco</TableCell>
                                    <TableCell>Postre</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {previewData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.fecha}</TableCell>
                                        <TableCell>{row.entrada}</TableCell>
                                        <TableCell>{row.platoMenu}</TableCell>
                                        <TableCell>{row.platoCarta}</TableCell>
                                        <TableCell>{row.refresco}</TableCell>
                                        <TableCell>{row.postre}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25]}
                        component="div"
                        count={previewData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </>
            );
        case 'error_format':
            return <Alert severity="error">El archivo subido no es un archivo csv.</Alert>;
        case 'error_structure':
            return <Alert severity="error">El archivo csv subido no cuenta con la estructura adecuada.</Alert>;
        case 'error_data':
             return (
                <>
                    <Alert severity="error" sx={{mb: 2}}>El archivo csv subido tiene errores en los datos.</Alert>
                     <Typography variant="h6" sx={{mb: 2, textAlign: 'center'}}>Detalle de errores</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Entrada</TableCell>
                                    <TableCell>Plato (Menú)</TableCell>
                                    <TableCell>Plato a la carta</TableCell>
                                    <TableCell>Refresco</TableCell>
                                    <TableCell>Postre</TableCell>
                                    <TableCell>Errores</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errorDetail.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ color: row.errors.fecha ? 'error.main' : 'inherit' }}>{row.fecha}</TableCell>
                                        <TableCell sx={{ color: row.errors.entrada ? 'error.main' : 'inherit' }}>{row.entrada}</TableCell>
                                        <TableCell sx={{ color: row.errors.platoMenu ? 'error.main' : 'inherit' }}>{row.platoMenu}</TableCell>
                                        <TableCell sx={{ color: row.errors.platoCarta ? 'error.main' : 'inherit' }}>{row.platoCarta}</TableCell>
                                        <TableCell sx={{ color: row.errors.refresco ? 'error.main' : 'inherit' }}>{row.refresco}</TableCell>
                                        <TableCell sx={{ color: row.errors.postre ? 'error.main' : 'inherit' }}>{row.postre}</TableCell>
                                        <TableCell sx={{ color: 'error.main' }}>{Object.values(row.errors).join(', ')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            );
        default: return null;
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <React.Fragment>
        <Box>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}>
                <HomeIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                <RestaurantMenuIcon sx={{ mr: 0.5, fontSize: 20 }} />
                <Typography color="text.primary">Programación del menú</Typography>
                </Box>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Programación del menú</Typography>
            <Divider />
        </Box>

        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="pestañas de programación de menú">
                <Tab label="Programación por día" />
                <Tab label="Importar programación" />
            </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <LocalizationProvider 
                  dateAdapter={AdapterDayjs} 
                  adapterLocale="es"
                  localeText={{
                    cancelButtonLabel: 'CANCELAR',
                    okButtonLabel: 'ACEPTAR',
                    clearButtonLabel: 'LIMPIAR',
                    todayButtonLabel: 'HOY',
                    ...esES.components.MuiLocalizationProvider.defaultProps.localeText
                  }}
                >
                    <DatePicker
                        label="Seleccione la fecha"
                        value={fecha}
                        onChange={(newDate) => setFecha(newDate)}
                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 250, mb: 2 }} />}
                    />
                </LocalizationProvider>
                {loading && <Typography sx={{ mt: 2 }}>Cargando menú...</Typography>}
                {fecha && !loading && menuSeleccionado ? (
                    <Box sx={{ width: '100%'}}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button variant="contained" onClick={handleOpenEditModal}>EDITAR</Button>
                        </Box>
                        <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Entrada</Typography>
                            <Typography>{menuSeleccionado.entrada}</Typography>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Plato (Menú)</Typography>
                            <Typography>{menuSeleccionado.plato}</Typography>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Plato a la carta</Typography>
                            <Typography>{menuSeleccionado.platoALaCarta}</Typography>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Refresco</Typography>
                            <Typography>{menuSeleccionado.refresco}</Typography>
                        </Paper>
                        <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Postre</Typography>
                            <Typography>{menuSeleccionado.postre}</Typography>
                        </Paper>
                    </Box>
                ) : fecha && !loading ? (
                    <Box sx={{ textAlign: 'center', width: '100%', mt: 4 }}>
                        <Typography variant="h6" color="text.secondary">No hay un menú programado para esta fecha.</Typography>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={handleOpenEditModal}>CREAR MENÚ</Button>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', width: '100%', mt: 4 }}>
                        <Typography variant="h6" color="text.secondary">Seleccione una fecha para gestionar la programación del menú en dicho día.</Typography>
                    </Box>
                )}
            </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
                <Button variant="contained" onClick={handleOpenImportModal}>IMPORTAR</Button>
            </Box>
        </TabPanel>

        <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
            <DialogTitle>Edición del menú</DialogTitle>
            <DialogContent>
                <TextField margin="dense" name="entrada" label="Entrada" type="text" fullWidth value={menuEditado.entrada || ''} onChange={handleInputChange} />
                <TextField margin="dense" name="platoMenu" label="Plato (Menú)" type="text" fullWidth value={menuEditado.platoMenu || ''} onChange={handleInputChange} />
                <TextField margin="dense" name="platoCarta" label="Plato a la carta" type="text" fullWidth value={menuEditado.platoCarta || ''} onChange={handleInputChange} />
                <TextField margin="dense" name="refresco" label="Refresco" type="text" fullWidth value={menuEditado.refresco || ''} onChange={handleInputChange} />
                <TextField margin="dense" name="postre" label="Postre" type="text" fullWidth value={menuEditado.postre || ''} onChange={handleInputChange} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseEditModal}>Cancelar</Button>
                <Button onClick={handleGuardarMenu} disabled={isEditFormInvalid}>Guardar</Button>
            </DialogActions>
        </Dialog>
        
        <Dialog open={openImportModal} onClose={handleCloseImportModal} maxWidth={importStep === 'upload' || importStep.includes('error') ? 'sm' : 'lg'} fullWidth>
            <DialogTitle>Importación</DialogTitle>
            <DialogContent>
                {renderImportContent()}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseImportModal}>
                    {importStep === 'preview' ? 'Cancelar' : 'Cerrar'}
                </Button>
                {importStep === 'preview' && <Button variant="contained" onClick={handleImportarMenus}>Aceptar</Button>}
            </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
    </React.Fragment>
  );
};

export default AdminMenuProgramacion; 
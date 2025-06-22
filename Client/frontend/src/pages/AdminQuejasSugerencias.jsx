import React, { useState } from 'react';
import {
  Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, TextField,
  Select, MenuItem, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Checkbox, Tooltip,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link as RouterLink } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Mock Data
const mockQuejas = [
    { id: '00071', asunto: 'Devolución dinero contrato 2024', fecha: '20/03/2025', cliente: 'Maria Pia Escobar Ramos', estado: 'Sin resolver', detalle: 'Mi hija tiene saldo restante del año pasado (2024), este año le he empezado a enviar almuerzos preparados en casa, por ello solicito que se me haga la devolución del dinero correspondiente a dicho saldo restante.' },
    { id: '0008', asunto: 'Devolución dinero contrato 2024', fecha: '20/03/2025', cliente: 'Juan Carlos Grau Mogrovejo', estado: 'Resuelta', detalle: 'Detalle de la queja resuelta.' },
];

const mockSugerencias = [
    { id: '00071', asunto: 'Microondas adicional', fecha: '20/03/2025', cliente: 'Maria Pia Escobar Ramos', detalle: 'Recomendaría que compraran un microondas adicional, muchas veces, debido a que solo son 3 microondas, se terminan creando colas de espera para usar el microondas.' },
    { id: '0008', asunto: 'Almuerzos más variados', fecha: '20/03/2025', cliente: 'Juan Carlos Grau Mogrovejo', detalle: 'Sería bueno que varíen más los almuerzos.' },
];

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const QuejasSugerenciasContent = ({ data, isQuejas }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openResolveModal, setOpenResolveModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = data.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;
    
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDetail = (item) => {
        setCurrentItem(item);
        setOpenDetailModal(true);
    };

    const handleOpenResolve = () => {
        setOpenResolveModal(true);
    };
    
    return (
        <Paper sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" disabled>APLICAR FILTROS</Button>
                    <Button variant="outlined" disabled>LIMPIAR FILTROS</Button>
                </Box>
                {isQuejas && <Button variant="contained" disabled={selected.length === 0} onClick={handleOpenResolve}>MARCAR COMO RESUELTO</Button>}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField label="Código" size="small" sx={{ width: 120 }}/>
                <TextField label="Asunto" size="small" sx={{flex: 1, minWidth: 220}} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker label="Fecha creación" renderInput={(params) => <TextField {...params} size="small" sx={{ width: 170 }} />} />
                </LocalizationProvider>
                <TextField label="Nombre cliente asociado" size="small" sx={{flex: 1, minWidth: 220}}/>
                {isQuejas && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select label="Estado" defaultValue="todos">
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="resuelta">Resuelta</MenuItem>
                            <MenuItem value="sin_resolver">Sin resolver</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {isQuejas && <TableCell padding="checkbox"><Checkbox onChange={handleSelectAllClick} /></TableCell>}
                            <TableCell>Código</TableCell>
                            <TableCell>Asunto</TableCell>
                            <TableCell>Fecha creación</TableCell>
                            <TableCell>Cliente asociado</TableCell>
                            {isQuejas && <TableCell>Estado</TableCell>}
                            <TableCell align="center">Detalle</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            const isItemSelected = isSelected(row.id);
                            return (
                                <TableRow key={row.id} hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                                    {isQuejas && (
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, row.id)} />
                                        </TableCell>
                                    )}
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.asunto}</TableCell>
                                    <TableCell>{row.fecha}</TableCell>
                                    <TableCell>{row.cliente}</TableCell>
                                    {isQuejas && (
                                        <TableCell>
                                            <Box sx={{
                                                bgcolor: row.estado === 'Resuelta' ? 'success.main' : 'error.main',
                                                color: 'white',
                                                px: 1.2, py: 0.2,
                                                borderRadius: '12px',
                                                display: 'inline-block',
                                                fontSize: '0.75rem'
                                            }}>
                                                {row.estado}
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell align="center">
                                        <Tooltip title="Ver detalle">
                                            <IconButton onClick={() => handleOpenDetail(row)}><VisibilityIcon /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
            />
            {/* Modals */}
            <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Detalle de la {isQuejas ? 'queja' : 'sugerencia'}</DialogTitle>
                <DialogContent><Typography>{currentItem?.detalle}</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailModal(false)}>CERRAR</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openResolveModal} onClose={() => setOpenResolveModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Marcar como resuelto</DialogTitle>
                <DialogContent><Typography>¿Está seguro que desea marcar las quejas seleccionadas como resueltas?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResolveModal(false)}>CANCELAR</Button>
                    <Button onClick={() => setOpenResolveModal(false)} variant="contained">ACEPTAR</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

const AdminQuejasSugerencias = () => {
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
            <ChatBubbleOutlineIcon sx={{ mr: 0.5, fontSize: 20 }} />
            <Typography color="text.primary">Quejas y sugerencias</Typography>
          </Box>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>Quejas y sugerencias</Typography>
        <Divider />
      </Box>

      <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Quejas" />
          <Tab label="Sugerencias" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <QuejasSugerenciasContent data={mockQuejas} isQuejas={true} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <QuejasSugerenciasContent data={mockSugerencias} isQuejas={false} />
      </TabPanel>
    </React.Fragment>
  );
};

export default AdminQuejasSugerencias; 
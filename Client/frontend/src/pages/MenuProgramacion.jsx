import { Box, Typography, Breadcrumbs, TextField, Divider, IconButton, useMediaQuery } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import programacionMenuService from '../services/programacionMenuService';
import { esES } from '@mui/x-date-pickers/locales';

// Configurar dayjs para usar español
dayjs.locale('es');

const MenuProgramacion = () => {
  const [fecha, setFecha] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Cargar menú real del backend al seleccionar fecha
  useEffect(() => {
    const fetchMenu = async () => {
      if (!fecha) {
        setMenuData(null);
        return;
      }
      setLoading(true);
      try {
        const fechaStr = dayjs(fecha).format('YYYY-MM-DD');
        console.log('Consultando menú para fecha:', fechaStr);
        const res = await programacionMenuService.obtenerPorFecha(fechaStr);
        setMenuData(res.data);
      } catch (err) {
        console.error('Error al cargar menú:', err);
        setMenuData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [fecha]);

  return (
    <Box sx={{ width: '100%', p: 0, pl: isMobile ? 1 : 3, pb: { xs: 7, md: 0 }, minHeight: isMobile ? 'calc(100vh - 56px)' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: isMobile ? 'flex-start' : 'flex-start', alignItems: 'flex-start' }}>
      {!isMobile && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/inicio" size="small" sx={{ color: 'inherit', p: 0.5 }}>
            <HomeIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <RestaurantIcon sx={{ mr: 0.5, fontSize: 20 }} />
            <Typography color="text.primary">Programación del menú</Typography>
          </Box>
        </Breadcrumbs>
      )}
      <Typography variant="h4" fontWeight={500} sx={{ mb: 1, textAlign: 'left', mt: isMobile ? 2 : 0 }}>
        Programación del menú
      </Typography>
      <Divider sx={{ mb: 4, width: '100%' }} />
      <Box sx={{ maxWidth: 340, mb: 6, width: '100%', mt: isMobile ? 2 : 0 }}>
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
            onChange={setFecha}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            inputFormat="DD/MM/YYYY"
            shouldDisableDate={(date) => {
              // Desactivar sábados (6) y domingos (0)
              const dayOfWeek = date.day();
              return dayOfWeek === 0 || dayOfWeek === 6;
            }}
          />
        </LocalizationProvider>
      </Box>
      {!fecha && (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', mt: isMobile ? 4 : 0 }}>
          <Typography variant="h5" color="#bdbdbd" align="center" sx={{ fontWeight: 400 }}>
            Seleccione una fecha para ver la programación del menú y plato a la carta en dicho día
          </Typography>
        </Box>
      )}
      {loading && (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', mt: isMobile ? 4 : 0 }}>
          <Typography variant="h6" color="#bdbdbd" align="center" sx={{ fontWeight: 400 }}>
            Cargando menú...
          </Typography>
        </Box>
      )}
      {fecha && !loading && !menuData && (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', mt: isMobile ? 4 : 0 }}>
          <Typography variant="h6" color="#bdbdbd" align="center" sx={{ fontWeight: 400 }}>
            No hay programación registrada para esta fecha
          </Typography>
        </Box>
      )}
      {fecha && !loading && menuData && (
        <Box sx={{
          mt: { xs: 2, md: 4 },
          width: '100%',
          maxWidth: { xs: '100%', md: 600 },
          mx: 'auto',
          p: { xs: 0.5, md: 3 },
          borderRadius: 3,
          boxShadow: 2,
          bgcolor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}>
          <Box sx={{ border: '1.5px dashed #90caf9', borderRadius: 2, mb: 2, width: '100%', maxWidth: { xs: '100%', md: 360 }, p: 1.5, textAlign: 'center', bgcolor: '#f5faff', boxSizing: 'border-box' }}>
            <Typography component="span" sx={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline', display: 'block', mb: 0.5 }}>
              Entrada
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontSize: 16 }}>
              {menuData.entrada}
            </Typography>
          </Box>
          <Box sx={{ border: '1.5px dashed #90caf9', borderRadius: 2, mb: 2, width: '100%', maxWidth: { xs: '100%', md: 360 }, p: 1.5, textAlign: 'center', bgcolor: '#f5faff', boxSizing: 'border-box' }}>
            <Typography component="span" sx={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline', display: 'block', mb: 0.5 }}>
              Plato de fondo
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontSize: 16 }}>
              {menuData.plato}
            </Typography>
          </Box>
          <Box sx={{ border: '1.5px dashed #90caf9', borderRadius: 2, mb: 2, width: '100%', maxWidth: { xs: '100%', md: 360 }, p: 1.5, textAlign: 'center', bgcolor: '#f5faff', boxSizing: 'border-box' }}>
            <Typography component="span" sx={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline', display: 'block', mb: 0.5 }}>
              Plato a la carta
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontSize: 16 }}>
              {menuData.platoALaCarta}
            </Typography>
          </Box>
          <Box sx={{ border: '1.5px dashed #90caf9', borderRadius: 2, mb: 2, width: '100%', maxWidth: { xs: '100%', md: 360 }, p: 1.5, textAlign: 'center', bgcolor: '#f5faff', boxSizing: 'border-box' }}>
            <Typography component="span" sx={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline', display: 'block', mb: 0.5 }}>
              Postre
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontSize: 16 }}>
              {menuData.postre}
            </Typography>
          </Box>
          <Box sx={{ border: '1.5px dashed #90caf9', borderRadius: 2, mb: 2, width: '100%', maxWidth: { xs: '100%', md: 360 }, p: 1.5, textAlign: 'center', bgcolor: '#f5faff', boxSizing: 'border-box' }}>
            <Typography component="span" sx={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline', display: 'block', mb: 0.5 }}>
              Refresco
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', fontSize: 16 }}>
              {menuData.refresco}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MenuProgramacion; 
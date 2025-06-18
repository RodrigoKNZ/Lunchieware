import { Box, Typography, Breadcrumbs, TextField, Divider, IconButton, useMediaQuery } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import React from 'react';
import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

// Datos simulados de ejemplo
const menuData = {
  '2024-06-15': {
    menu: 'Arroz con pollo, Papa a la huancaína, Jugo de maracuyá',
    carta: 'Lomo saltado',
  },
  '2024-06-16': {
    menu: 'Tallarin rojo con pollo, Ensalada fresca, Refresco de piña',
    carta: 'Ají de gallina',
  },
  '2025-08-23': {
    sections: [
      { title: 'Entrada', link: true, name: 'Tequeños de queso' },
      { title: 'Plato de fondo', link: true, name: 'Tallarines verdes con milanesa' },
      { title: 'Plato a la carta', link: true, name: 'Ají de gallina' },
      { title: 'Postre', link: true, name: 'Gelatina' },
      { title: 'Refresco', link: true, name: 'Emoliente' },
    ],
    prices: {
      regular: 'S/. 10.50',
      carta: 'S/. 13.50',
    },
  },
};

const MenuProgramacion = () => {
  const [fecha, setFecha] = React.useState(null);
  const fechaKey = fecha ? dayjs(fecha).format('YYYY-MM-DD') : null;
  const data = fechaKey ? menuData[fechaKey] : null;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Seleccione la fecha"
            value={fecha}
            onChange={setFecha}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            inputFormat="DD/MM/YYYY"
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
      {fecha && !data && (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', mt: isMobile ? 4 : 0 }}>
          <Typography variant="h6" color="#bdbdbd" align="center" sx={{ fontWeight: 400 }}>
            No hay programación registrada para esta fecha
          </Typography>
        </Box>
      )}
      {fecha && data && (
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
          {fechaKey === '2025-08-23' ? (
            <>
              {data.sections.map((section, idx) => (
                <Box key={idx} sx={{ border: '1.5px dashed #90caf9', borderRadius: 2, mb: 2, width: '100%', maxWidth: { xs: '100%', md: 360 }, p: 1.5, textAlign: 'center', bgcolor: '#f5faff', boxSizing: 'border-box' }}>
                  <Typography component="a" href="#" sx={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline', cursor: 'pointer', display: 'block', mb: 0.5 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', fontSize: 16 }}>
                    {section.name}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2, mb: 1, width: '100%', maxWidth: 360, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  Menú regular: {data.prices.regular}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  Plato a la carta: {data.prices.carta}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Menú del día
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {data.menu}
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                Plato a la carta
              </Typography>
              <Typography variant="body1">
                {data.carta}
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MenuProgramacion; 
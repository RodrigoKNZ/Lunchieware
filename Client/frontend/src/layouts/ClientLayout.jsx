import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography, Avatar, useMediaQuery, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { text: 'Programación del Menú', icon: <RestaurantIcon />, path: '/programacion-menu' },
  { text: 'Quejas', icon: <ChatBubbleOutlineIcon />, path: '/quejas' },
  { text: 'Sugerencias', icon: <LightbulbOutlinedIcon />, path: '/sugerencias' },
  { text: 'Mi cuenta', icon: <PersonIcon />, path: '/mi-cuenta' },
];

const ClientLayout = ({ onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [navValue, setNavValue] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const idx = menuItems.findIndex(item => item.path === location.pathname);
    setNavValue(idx === -1 ? 0 : idx);
  }, [location.pathname]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback si no se pasa la función
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: '#fff', flexDirection: isMobile ? 'column' : 'row' }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #f0f0f0',
              bgcolor: 'white',
              height: '100vh',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
          }}
        >
          <Box>
            <Toolbar sx={{ minHeight: 80, display: 'flex', alignItems: 'center', px: 2 }}>
              <Avatar src="/LogoLunchieware.png" alt="Logo" sx={{ width: 40, height: 40, mr: 1 }} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Lunchieware
              </Typography>
            </Toolbar>
            <List sx={{ mt: 2 }}>
              {menuItems.map((item, idx) => (
                <ListItem
                  button
                  key={item.text}
                  sx={{ mb: 0.5, borderRadius: 2, mx: 1, backgroundColor: location.pathname === item.path ? '#f5f5f5' : 'inherit' }}
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#757575' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 16 }} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ mb: 3, px: 2 }}>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                mx: 1,
                backgroundColor: 'inherit',
                color: '#d32f2f',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#d32f2f' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 16, fontWeight: 600 }} />
            </ListItem>
          </Box>
        </Drawer>
      )}
      <Box component="main" sx={{
        flex: '1 1 auto',
        height: '100vh',
        p: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        bgcolor: '#fff',
        pb: isMobile ? 7 : 0,
      }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: isMobile ? 340 : 'none',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pt: isMobile ? 4 : 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
      {isMobile && (
        <BottomNavigation
          value={navValue}
          onChange={(event, newValue) => {
            setNavValue(newValue);
            navigate(menuItems[newValue].path);
          }}
          showLabels
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #f0f0f0', zIndex: 1300, bgcolor: '#fff' }}
        >
          {menuItems.map((item) => (
            <BottomNavigationAction key={item.text} label={item.text.split(' ')[0]} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
};

export default ClientLayout; 
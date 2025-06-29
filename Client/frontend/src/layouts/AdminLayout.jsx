import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography, Avatar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WidgetsIcon from '@mui/icons-material/Widgets';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { text: 'Venta', icon: <PointOfSaleIcon />, path: '/admin/venta' },
  { text: 'Clientes', icon: <PeopleAltIcon />, path: '/admin/clientes' },
  { text: 'Caja chica', icon: <AccountBalanceWalletIcon />, path: '/admin/caja-chica' },
  { text: 'Reportes', icon: <AssessmentIcon />, path: '/admin/reportes' },
  { text: 'Cuentas bancarias', icon: <AccountBalanceIcon />, path: '/admin/cuentas-bancarias' },
  { text: 'Productos', icon: <WidgetsIcon />, path: '/admin/productos' },
  { text: 'Programación del menú', icon: <RestaurantMenuIcon />, path: '/admin/programacion-menu' },
  { text: 'Quejas y sugerencias', icon: <ChatBubbleOutlineIcon />, path: '/admin/quejas-sugerencias' },
];

const AdminLayout = ({ onLogout }) => {
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
                  sx={{ mb: 0.5, borderRadius: 2, mx: 1, backgroundColor: location.pathname.startsWith(item.path) ? '#f5f5f5' : 'inherit' }}
                  onClick={() => navigate(item.path)}
                  selected={location.pathname.startsWith(item.path)}
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
      <Box component="main" sx={{ flex: '1 1 auto', height: '100vh', overflowY: 'auto', bgcolor: '#fafbfc', p: { xs: 2, md: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 
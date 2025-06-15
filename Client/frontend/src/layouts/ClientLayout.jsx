import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography, Avatar, useMediaQuery, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PersonIcon from '@mui/icons-material/Person';
import React from 'react';

const drawerWidth = 260;

const menuItems = [
  { text: 'Programación del Menú', icon: <RestaurantIcon /> },
  { text: 'Quejas', icon: <ChatBubbleOutlineIcon /> },
  { text: 'Sugerencias', icon: <LightbulbOutlinedIcon /> },
  { text: 'Mi cuenta', icon: <PersonIcon /> },
];

const ClientLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [navValue, setNavValue] = React.useState(0);

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', bgcolor: '#fff', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
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
            },
          }}
        >
          <Toolbar sx={{ minHeight: 80, display: 'flex', alignItems: 'center', px: 2 }}>
            <Avatar src="/src/assets/LogoLunchieware.png" alt="Logo" sx={{ width: 40, height: 40, mr: 1 }} />
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Lunchieware
            </Typography>
          </Toolbar>
          <List sx={{ mt: 2 }}>
            {menuItems.map((item, idx) => (
              <ListItem button key={item.text} sx={{ mb: 0.5, borderRadius: 2, mx: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: '#757575' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 16 }} />
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}
      <Box component="main" sx={{
        flex: '1 1 auto',
        height: '100vh',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          {children}
        </Box>
      </Box>
      {isMobile && (
        <BottomNavigation
          value={navValue}
          onChange={(event, newValue) => setNavValue(newValue)}
          showLabels
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #f0f0f0', zIndex: 1300, bgcolor: '#fff' }}
        >
          <BottomNavigationAction label="Programación" icon={<RestaurantIcon />} />
          <BottomNavigationAction label="Sugerencias" icon={<LightbulbOutlinedIcon />} />
          <BottomNavigationAction label="Quejas" icon={<ChatBubbleOutlineIcon />} />
          <BottomNavigationAction label="Mi cuenta" icon={<PersonIcon />} />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default ClientLayout; 
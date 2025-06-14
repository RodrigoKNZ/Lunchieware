import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography, Avatar } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 260;

const menuItems = [
  { text: 'Programación del Menú', icon: <RestaurantIcon /> },
  { text: 'Quejas', icon: <ChatBubbleOutlineIcon /> },
  { text: 'Sugerencias', icon: <LightbulbOutlinedIcon /> },
  { text: 'Mi cuenta', icon: <PersonIcon /> },
];

const ClientLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#fff' }}>
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
      <Box component="main" sx={{ flexGrow: 1, width: '100%', height: '100vh', p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
        {children}
      </Box>
    </Box>
  );
};

export default ClientLayout; 
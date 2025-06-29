import { Box } from '@mui/material';

const AdminHome = () => {
  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src="/LogoLunchieware.png"
        alt="Logo grande difuminado"
        style={{
          width: 320,
          height: 320,
          opacity: 0.12,
          filter: 'blur(0.5px)',
          userSelect: 'none',
        }}
      />
    </Box>
  );
};

export default AdminHome; 
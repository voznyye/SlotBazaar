import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Casino as CasinoIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  SportsEsports as GamesIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      setBalance(parseFloat(user.balance) || 0);
    }
  }, [user]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Games', icon: <GamesIcon />, path: '/games' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          borderRight: '1px solid rgba(0, 255, 255, 0.1)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
          width: 280,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CasinoIcon sx={{ color: '#00ffff', mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              fontWeight: 'bold',
            }}
          >
            SlotBazaar
          </Typography>
        </Box>
        {user && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 0.5,
              }}
            >
              Balance
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              }}
            >
              ${Number(balance).toFixed(2)}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileMenuOpen(false);
            }}
            sx={{
              backgroundColor: isActiveRoute(item.path)
                ? 'rgba(0, 255, 255, 0.1)'
                : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#00ffff' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                color: isActiveRoute(item.path) ? '#00ffff' : 'rgba(255, 255, 255, 0.7)',
                textShadow: isActiveRoute(item.path)
                  ? '0 0 10px rgba(0, 255, 255, 0.5)'
                  : 'none',
              }}
            />
          </ListItem>
        ))}
      </List>
      {user && (
        <>
          <Divider sx={{ borderColor: 'rgba(0, 255, 255, 0.1)' }} />
          <List>
            <ListItem
              button
              onClick={() => {
                navigate('/deposit');
                setMobileMenuOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: '#00ffff' }}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText
                primary="Deposit"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate('/withdraw');
                setMobileMenuOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: '#00ffff' }}>
                <RemoveIcon />
              </ListItemIcon>
              <ListItemText
                primary="Withdraw"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: '#00ffff' }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon sx={{ color: '#00ffff' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </ListItem>
          </List>
        </>
      )}
    </Drawer>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(90deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.95))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2, color: '#00ffff' }}
              >
                <MenuIcon />
              </IconButton>
              {renderMobileMenu()}
            </>
          ) : (
            <>
              <CasinoIcon
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  mr: 1,
                  color: '#00ffff',
                }}
              />
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  color: '#00ffff',
                  textDecoration: 'none',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                }}
              >
                SlotBazaar
              </Typography>
            </>
          )}

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  my: 2,
                  mx: 1,
                  color: isActiveRoute(item.path) ? '#00ffff' : 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  textShadow: isActiveRoute(item.path)
                    ? '0 0 10px rgba(0, 255, 255, 0.5)'
                    : 'none',
                  '&:hover': {
                    color: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Badge
                  badgeContent={`$${Number(balance).toFixed(2)}`}
                  color="primary"
                  sx={{
                    mr: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: 'rgba(0, 255, 255, 0.2)',
                      color: '#00ffff',
                      border: '1px solid rgba(0, 255, 255, 0.3)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <AccountBalanceIcon sx={{ color: '#00ffff' }} />
                </Badge>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/deposit')}
                  sx={{
                    mr: 1,
                    borderColor: 'rgba(0, 255, 255, 0.3)',
                    color: '#00ffff',
                    '&:hover': {
                      borderColor: '#00ffff',
                      backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    },
                  }}
                >
                  Deposit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RemoveIcon />}
                  onClick={() => navigate('/withdraw')}
                  sx={{
                    mr: 2,
                    borderColor: 'rgba(0, 255, 255, 0.3)',
                    color: '#00ffff',
                    '&:hover': {
                      borderColor: '#00ffff',
                      backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    },
                  }}
                >
                  Withdraw
                </Button>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user.username}
                      // Use initial of username instead of an external image
                      sx={{
                        border: '2px solid rgba(0, 255, 255, 0.3)',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
                        bgcolor: '#00cfcf',
                      }}
                    >
                      {user.username ? user.username[0].toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{
                    mt: '45px',
                    '& .MuiPaper-root': {
                      background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
                      border: '1px solid rgba(0, 255, 255, 0.1)',
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate('/profile');
                    }}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(45deg, #00ffff, #0066ff)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00cccc, #0055cc)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;

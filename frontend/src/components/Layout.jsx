import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Box, Toolbar, Typography, IconButton, Menu, MenuItem, Container, Drawer, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip, Avatar, Button, useMediaQuery, Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Logout, Dashboard as DashboardIcon, Person, Assessment, TrendingUp, Work, Category, MenuBook, Menu as MenuIcon,
    DarkMode, LightMode, Search, Insights as InsightsIcon, ManageAccounts,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ColorModeContext';
import NotificationBell from './NotificationBell';
import CommandPalette from './CommandPalette';
import ErrorBoundary from './ErrorBoundary';

const drawerWidth = 252;
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

const ROLE_LABEL = { EMPLOYEE: 'Employee', MANAGER: 'Manager', HR_ADMIN: 'HR Admin' };

const Layout = () => {
    const { user, logout } = useAuth();
    const { mode, toggle } = useColorMode();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);

    const menuItems = useMemo(() => {
        let items = [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'My Skills', icon: <Person />, path: '/my-skills' },
            { text: 'Skill Gaps', icon: <Assessment />, path: '/my-gaps' },
        ];
        if (user.role === 'MANAGER' || user.role === 'HR_ADMIN') {
            items = [...items, { divider: true },
                { text: 'Team Matrix', icon: <TrendingUp />, path: '/team-matrix' },
                { text: 'Roles & Projects', icon: <Work />, path: '/roles-projects' }];
        }
        if (user.role === 'HR_ADMIN') {
            items = [...items, { divider: true },
                { text: 'Insights', icon: <InsightsIcon />, path: '/insights' },
                { text: 'Skill Catalog', icon: <Category />, path: '/skill-catalog' },
                { text: 'Learning Resources', icon: <MenuBook />, path: '/learning-resources' },
                { text: 'Employee Management', icon: <ManageAccounts />, path: '/employee-management' }];
        }
        return items;
    }, [user.role]);

    const paletteItems = useMemo(
        () => [...menuItems.filter((i) => !i.divider), { text: 'Profile & password', icon: <Person />, path: '/profile' }],
        [menuItems],
    );

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen((o) => !o);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleLogout = () => {
        setAnchorEl(null);
        logout();
        navigate('/login');
    };

    const drawerContent = (
        <Box sx={{ overflow: 'auto', py: 1 }}>
            <List>
                {menuItems.map((item, index) => {
                    if (item.divider) return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                                selected={isActive}
                                sx={{ borderRadius: 2, mb: 0.25 }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'action.active' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
                <Toolbar>
                    {!isDesktop && (
                        <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)} aria-label="Open navigation" sx={{ mr: 1 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 800, letterSpacing: -0.3 }}
                        onClick={() => navigate('/dashboard')}
                    >
                        Skill<Box component="span" sx={{ color: 'primary.main' }}>Bridge</Box>
                    </Typography>

                    <Button
                        color="inherit"
                        onClick={() => setPaletteOpen(true)}
                        startIcon={<Search />}
                        sx={{ display: { xs: 'none', sm: 'inline-flex' }, mr: 1, color: 'text.secondary', border: 1, borderColor: 'divider', px: 1.5 }}
                    >
                        Search
                        <Chip size="small" label={isMac ? '⌘K' : 'Ctrl K'} sx={{ ml: 1.5, height: 20 }} />
                    </Button>
                    <IconButton color="inherit" onClick={() => setPaletteOpen(true)} aria-label="Search" sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
                        <Search />
                    </IconButton>
                    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                        <IconButton color="inherit" onClick={toggle} aria-label="Toggle colour mode">
                            {mode === 'dark' ? <LightMode /> : <DarkMode />}
                        </IconButton>
                    </Tooltip>
                    <NotificationBell />
                    <Tooltip title="Account">
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu" sx={{ ml: 0.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15 }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography fontWeight={700}>{user?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{ROLE_LABEL[user?.role]} · {user?.email}</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                            <Person fontSize="small" sx={{ mr: 1 }} /> Profile & password
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Drawer
                    variant={isDesktop ? 'permanent' : 'temporary'}
                    open={isDesktop || mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        width: isDesktop ? drawerWidth : 0,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', mt: isDesktop ? '64px' : 0 },
                    }}
                >
                    {!isDesktop && <Toolbar />}
                    {drawerContent}
                </Drawer>

                <Box
                    component="main"
                    sx={{ flexGrow: 1, minWidth: 0, bgcolor: 'background.default', p: { xs: 2, md: 3 }, mt: '64px' }}
                >
                    <Container maxWidth="xl" disableGutters>
                        <ErrorBoundary key={location.pathname}>
                            <Outlet />
                        </ErrorBoundary>
                    </Container>
                </Box>
            </Box>

            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
        </Box>
    );
};

export default Layout;

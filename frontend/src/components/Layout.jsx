import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    AccountCircle,
    Logout,
    Dashboard as DashboardIcon,
    Person,
    Assessment,
    School,
    TrendingUp,
    Work,
    Category,
    MenuBook,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define menu items based on user role
    const getMenuItems = () => {
        const employeeItems = [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'My Skills', icon: <Person />, path: '/my-skills' },
            { text: 'Skill Gaps', icon: <Assessment />, path: '/my-gaps' },
        ];

        const managerItems = [
            { text: 'Explore Resources', icon: <TrendingUp />, path: '/team-matrix' },
            { text: 'Roles & Projects', icon: <Work />, path: '/roles-projects' },
        ];

        const hrItems = [
            { text: 'Skill Catalog', icon: <Category />, path: '/skill-catalog' },
            { text: 'Learning Resources', icon: <MenuBook />, path: '/learning-resources' },
            { text: 'Employee Management', icon: <Person />, path: '/employee-management' },
        ];

        let items = [...employeeItems];

        if (user.role === 'MANAGER' || user.role === 'HR_ADMIN') {
            items.push({ divider: true });
            items = [...items, ...managerItems];
        }

        if (user.role === 'HR_ADMIN') {
            items.push({ divider: true });
            items = [...items, ...hrItems];
        }

        return items;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/dashboard')}
                    >
                        SkillBridge
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">
                            {user?.name} ({user?.role?.replace('_', ' ')})
                        </Typography>
                        <Tooltip title="Account">
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                                Dashboard
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <Logout fontSize="small" sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                {/* Left Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            marginTop: '64px', // Height of AppBar
                        },
                    }}
                >
                    <Box sx={{ overflow: 'auto' }}>
                        <List>
                            {getMenuItems().map((item, index) => {
                                if (item.divider) {
                                    return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
                                }

                                const isActive = location.pathname === item.path;

                                return (
                                    <ListItem key={item.text} disablePadding>
                                        <ListItemButton
                                            onClick={() => navigate(item.path)}
                                            selected={isActive}
                                            sx={{
                                                '&.Mui-selected': {
                                                    backgroundColor: 'primary.light',
                                                    color: 'primary.contrastText',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.main',
                                                    },
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'primary.contrastText',
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color: isActive ? 'inherit' : 'action.active',
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Drawer>

                {/* Main Content Area */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.default',
                        p: 3,
                        marginTop: '64px', // Height of AppBar
                        minHeight: 'calc(100vh - 64px - 60px)', // Viewport height - AppBar - Footer
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            <Box component="footer" sx={{ py: 2, px: 2, mt: 'auto', bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © 2024 SkillBridge - Employee Skill Matrix & Learning Recommender
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;

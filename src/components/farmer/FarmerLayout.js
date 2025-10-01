import React, { useState, useEffect } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    CalendarToday as CalendarIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountCircleIcon,
    Dashboard as DashboardIcon,
    Work as WorkIcon,
     Logout as LogoutIcon
} from '@mui/icons-material';
import EngineeringIcon   from '@mui/icons-material/Engineering';

import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const FarmerLayout = ({ children, currentPage = "Dashboard" }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [farmerInfo, setFarmerInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy thông tin nông dân từ localStorage
        const farmerData = localStorage.getItem('farmer_user');
        if (farmerData) {
            setFarmerInfo(JSON.parse(farmerData));
        } else {
            // Nếu không có thông tin đăng nhập, redirect về trang chủ
            navigate('/');
        }
    }, [navigate]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('farmer_user');
        localStorage.removeItem('user_role');
        navigate('/');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/farmer/Dashboard' },
        { text: 'Quản lí lịch làm', icon: <CalendarIcon />, path: '/farmer/WorkSchedule' },
        { text: 'Công việc của tôi', icon: <WorkIcon />, path: '/farmer/MyTasks' },
        { text: 'Đề xuất kĩ thuật', icon: <EngineeringIcon />, path: '/farmer/Technical'}
    ];

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    YenSon Farm
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{
                            backgroundColor: currentPage === item.text || (currentPage === 'Lịch làm việc' && item.text === 'Quản lí lịch làm') ? 'primary.light' : 'transparent',
                            color: currentPage === item.text || (currentPage === 'Lịch làm việc' && item.text === 'Quản lí lịch làm') ? 'primary.contrastText' : 'text.primary',
                            '&:hover': {
                                backgroundColor: currentPage === item.text || (currentPage === 'Lịch làm việc' && item.text === 'Quản lí lịch làm') ? 'primary.light' : 'action.hover'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: currentPage === item.text || (currentPage === 'Lịch làm việc' && item.text === 'Quản lí lịch làm') ? 'primary.contrastText' : 'text.primary' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    if (!farmerInfo) {
        return <Box>Đang tải...</Box>;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {currentPage}
                    </Typography>

                    <IconButton color="inherit">
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-controls="primary-search-account-menu"
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 32, height: 32 }}>
                            {farmerInfo.full_name?.charAt(0) || 'N'}
                        </Avatar>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                        {farmerInfo.full_name}
                    </Typography>
                </MenuItem>
                <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                        {farmerInfo.so_dien_thoai}
                    </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
            </Menu>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default FarmerLayout;

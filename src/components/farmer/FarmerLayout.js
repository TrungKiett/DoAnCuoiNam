import React, { useEffect, useState } from "react";
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
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useMediaQuery,
} from "@mui/material";
import {
    Menu as MenuIcon,
    CalendarToday as CalendarIcon,
    Dashboard as DashboardIcon,
    Work as WorkIcon,
    Logout as LogoutIcon,
} from "@mui/icons-material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const drawerWidth = 240;

const FarmerLayout = ({ children, currentPage = "Dashboard" }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [farmerInfo, setFarmerInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 👈 kiểm tra mobile

    // Lấy thông tin farmer
    useEffect(() => {
        const farmerData = localStorage.getItem("farmer_user");
        if (farmerData) setFarmerInfo(JSON.parse(farmerData));
        else navigate("/");
    }, [navigate]);

    // Lấy thông báo
    useEffect(() => {
        fetch(
                "http://yensonfarm.io.vn/khoi_api/acotor/admin/admin_danh_sach_de_xuat_ki_thuat.php", { credentials: "include" }
            )
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    const notifs = data.data.map((n) => ({...n, read: false }));
                    setNotifications(notifs);
                    setUnreadCount(notifs.length);
                }
            })
            .catch(console.error);
    }, []);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleLogout = () => {
        localStorage.removeItem("farmer_user");
        localStorage.removeItem("user_role");
        navigate("/");
    };

    const handleNotifOpen = (event) => {
        setNotifAnchorEl(event.currentTarget);
        setNotifications((prev) => prev.map((n) => ({...n, read: true })));
        setUnreadCount(0);
    };

    const handleNotifClose = () => setNotifAnchorEl(null);
    const handleNotifClick = (notif) => {
        setSelectedNotif(notif);
        handleNotifClose();
    };
    const handleDialogClose = () => setSelectedNotif(null);

    const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
    const handleProfileClose = () => setProfileAnchorEl(null);

    const menuItems = [
        { text: "Dashboard", icon: < DashboardIcon / > , path: "/farmer/Dashboard" },
        {
            text: "Quản lí lịch làm",
            icon: < CalendarIcon / > ,
            path: "/farmer/WorkSchedule",
        },
        {
            text: "Đề xuất kĩ thuật",
            icon: < EngineeringIcon / > ,
            path: "/farmer/Technical",
        },
        {
            text: "Thu hoạch",
            icon: < AgricultureIcon / > ,
            path: "/farmer/Agricultural-Harvest",
        },
        // {
        //   text: "Lương",
        //   icon: <AttachMoneyIcon />,
        //   path: "/farmer/Payroll",
        //   hidden:true
        // },
        {
            text: "Lương nhân công",
            icon: < AttachMoneyIcon / > ,
            path: "/farmer/FarmerPayroll_User",
        },
    ];

    if (!farmerInfo) return <Box p = { 3 } > Đang tải... < /Box>;

    const drawer = ( <
        Box sx = {
            { height: "100%", display: "flex", flexDirection: "column" }
        } >
        <
        Toolbar >
        <
        Typography variant = "h6"
        sx = {
            { color: "primary.main", fontWeight: "bold", flexGrow: 1 }
        } >
        YenSon Farm <
        /Typography> < /
        Toolbar > <
        Divider / >
        <
        List sx = {
            { flex: 1 }
        } > {
            menuItems.map((item) => ( <
                ListItem button key = { item.text }
                onClick = {
                    () => {
                        navigate(item.path);
                        if (isMobile) setMobileOpen(false); // đóng drawer trên mobile
                    }
                }
                sx = {
                    {
                        backgroundColor: currentPage === item.text ||
                            (currentPage === "Lịch làm việc" && item.text === "Quản lí lịch làm") ?
                            "primary.main" : "transparent",
                        color: currentPage === item.text ||
                            (currentPage === "Lịch làm việc" && item.text === "Quản lí lịch làm") ?
                            "#fff" : "text.primary",
                        transition: "none",
                        cursor: "pointer",
                    }
                }

                >
                <
                ListItemIcon sx = {
                    {
                        color: currentPage === item.text ? "#fff" : "text.primary",
                    }
                } > { item.icon } <
                /ListItemIcon> <
                ListItemText primary = { item.text }
                /> < /
                ListItem >
            ))
        } <
        /List> <
        Divider / >
        <
        ListItem button onClick = { handleLogout } >
        <
        ListItemIcon >
        <
        LogoutIcon color = "error" / >
        <
        /ListItemIcon> <
        ListItemText primary = "Đăng xuất" / >
        <
        /ListItem> < /
        Box >
    );

    return ( <
        Box sx = {
            { display: "flex", minHeight: "100vh", bgcolor: "#fafafa" }
        } > { /* AppBar */ } <
        AppBar position = "fixed"
        color = "primary"
        sx = {
            {
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
            }
        } >
        <
        Toolbar sx = {
            { display: "flex", justifyContent: "space-between" }
        } > { /* Nút menu (chỉ hiện ở mobile) */ } <
        IconButton color = "inherit"
        edge = "start"
        onClick = { handleDrawerToggle }
        sx = {
            { display: { sm: "none" } }
        } >
        <
        MenuIcon / >
        <
        /IconButton>

        { /* Tiêu đề */ } <
        Typography variant = "h6"
        noWrap component = "div"
        sx = {
            { flexGrow: 1, textAlign: { xs: "center", sm: "left" } }
        } > { currentPage } <
        /Typography>

        { /* Thông báo + Hồ sơ */ } <
        Box sx = {
            { display: "flex", alignItems: "center", gap: 1 }
        } >
        <
        IconButton color = "inherit"
        onClick = { handleNotifOpen } >
        <
        Badge badgeContent = { unreadCount }
        color = "error" >
        <
        NotificationsIcon / >
        <
        /Badge> < /
        IconButton >

        <
        Menu anchorEl = { notifAnchorEl }
        open = { Boolean(notifAnchorEl) }
        onClose = { handleNotifClose }
        PaperProps = {
            { style: { maxHeight: 350, width: 360 } }
        } > {
            notifications.length > 0 ? (
                notifications.map((item) => ( <
                    MenuItem key = { item.ma_de_xuat }
                    onClick = {
                        () => handleNotifClick(item)
                    }
                    sx = {
                        { flexDirection: "column", alignItems: "flex-start" }
                    } >
                    <
                    Typography variant = "subtitle1"
                    fontWeight = "bold" > { item.noi_dung_de_xuat } <
                    /Typography> <
                    Typography variant = "body2"
                    color = "text.secondary" >
                    Mã lô: { item.ma_lo_trong } | { " " } { new Date(item.ngay_de_xuat).toLocaleDateString("vi-VN") } <
                    /Typography> < /
                    MenuItem >
                ))
            ) : ( <
                MenuItem >
                <
                Typography variant = "body2"
                color = "text.secondary" >
                Không có thông báo <
                /Typography> < /
                MenuItem >
            )
        } <
        /Menu>

        <
        IconButton onClick = { handleProfileOpen }
        color = "inherit" >
        <
        Avatar sx = {
            { width: 32, height: 32 }
        } > { farmerInfo.full_name ?.charAt(0) || "N" } <
        /Avatar> < /
        IconButton >

        <
        Menu anchorEl = { profileAnchorEl }
        open = { Boolean(profileAnchorEl) }
        onClose = { handleProfileClose }
        anchorOrigin = {
            { vertical: "bottom", horizontal: "right" }
        }
        transformOrigin = {
            { vertical: "top", horizontal: "right" }
        } >
        <
        MenuItem disabled >
        <
        Typography variant = "body2" > { farmerInfo.full_name } < /Typography> < /
        MenuItem > <
        MenuItem disabled >
        <
        Typography variant = "body2" > { farmerInfo.so_dien_thoai } <
        /Typography> < /
        MenuItem > <
        Divider / >
        <
        MenuItem onClick = { handleLogout } >
        <
        LogoutIcon fontSize = "small"
        sx = {
            { mr: 1 }
        }
        /> Đăng xuất < /
        MenuItem > <
        /Menu> < /
        Box > <
        /Toolbar> < /
        AppBar >

        { /* Drawer (menu trái) */ } <
        Box component = "nav"
        sx = {
            { width: { sm: drawerWidth }, flexShrink: { sm: 0 } }
        } > { /* Drawer mobile */ } <
        Drawer variant = "temporary"
        open = { mobileOpen }
        onClose = { handleDrawerToggle }
        ModalProps = {
            { keepMounted: true }
        }
        sx = {
            {
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: drawerWidth,
                },
            }
        } > { drawer } <
        /Drawer>

        { /* Drawer desktop */ } <
        Drawer variant = "permanent"
        sx = {
            {
                display: { xs: "none", sm: "block" },
                "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: drawerWidth,
                },
            }
        }
        open > { drawer } <
        /Drawer> < /
        Box >

        { /* Nội dung chính */ } <
        Box component = "main"
        sx = {
            {
                flexGrow: 1,
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                p: { xs: 2, sm: 3 },
                mt: 8,
            }
        } > { children } <
        /Box>

        { /* Dialog chi tiết thông báo */ } {
            selectedNotif && ( <
                Dialog open onClose = { handleDialogClose }
                maxWidth = "sm"
                fullWidth >
                <
                DialogTitle > Chi tiết thông báo < /DialogTitle> <
                DialogContent dividers >
                <
                Typography variant = "h6"
                gutterBottom > 🌱Lô: { selectedNotif.ma_lo_trong } <
                /Typography> <
                Typography variant = "body2"
                gutterBottom > 📝Nội dung: { selectedNotif.noi_dung_de_xuat } <
                /Typography> <
                Typography variant = "body2"
                gutterBottom > 📂Tài liệu: { selectedNotif.tai_lieu || "Không có" } <
                /Typography> <
                Typography variant = "body2"
                gutterBottom > 💬Ghi chú: { selectedNotif.chi_tiet || "Không có" } <
                /Typography> <
                Typography variant = "body2"
                color = "text.secondary" > 📅Ngày: { " " } { new Date(selectedNotif.ngay_de_xuat).toLocaleDateString("vi-VN") } <
                /Typography> < /
                DialogContent > <
                DialogActions >
                <
                Button onClick = { handleDialogClose } > Đóng < /Button> < /
                DialogActions > <
                /Dialog>
            )
        } <
        /Box>
    );
};

export default FarmerLayout;
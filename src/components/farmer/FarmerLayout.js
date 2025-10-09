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
    Button
} from "@mui/material";
import {
    Menu as MenuIcon,
    CalendarToday as CalendarIcon,
    Dashboard as DashboardIcon,
    Work as WorkIcon,
    Logout as LogoutIcon
} from "@mui/icons-material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import AgricultureIcon from "@mui/icons-material/Agriculture";
const drawerWidth = 240;

const FarmerLayout = ({ children, currentPage = "Dashboard" }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [farmerInfo, setFarmerInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [selectedNotif, setSelectedNotif] = useState(null); // State lưu thông báo đang xem

    const navigate = useNavigate();

    // Lấy thông tin farmer
    useEffect(() => {
        const farmerData = localStorage.getItem("farmer_user");
        if (farmerData) setFarmerInfo(JSON.parse(farmerData));
        else navigate("/");
    }, [navigate]);

    // Lấy thông báo đề xuất kĩ thuật từ backend
    useEffect(() => {
        fetch(
                "http://localhost/doancuoinam/src/be_management/acotor/admin/admin_danh_sach_de_xuat_ki_thuat.php", { credentials: "include" }
            )
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    const notifs = data.data.map((n) => ({...n, read: false }));
                    setNotifications(notifs);
                    setUnreadCount(notifs.length);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleLogout = () => {
        localStorage.removeItem("farmer_user");
        localStorage.removeItem("user_role");
        navigate("/");
    };

    const handleNotifOpen = (event) => {
        setNotifAnchorEl(event.currentTarget);
        // Đánh dấu tất cả đã đọc để badge về 0
        setNotifications((prev) => prev.map((n) => ({...n, read: true })));
        setUnreadCount(0);
    };

    const handleNotifClose = () => setNotifAnchorEl(null);

    const handleNotifClick = (notif) => {
        setSelectedNotif(notif); // mở dialog hiển thị chi tiết
        handleNotifClose(); // đóng menu
    };

    const handleDialogClose = () => setSelectedNotif(null);

    const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
    const handleProfileClose = () => setProfileAnchorEl(null);

    const menuItems = [
        { text: "Dashboard", icon: < DashboardIcon / > , path: "/farmer/Dashboard" },
        { text: "Quản lí lịch làm", icon: < CalendarIcon / > , path: "/farmer/WorkSchedule" },
        { text: "Công việc của tôi", icon: < WorkIcon / > , path: "/farmer/MyTasks" },
        { text: "Đề xuất kĩ thuật", icon: < EngineeringIcon / > , path: "/farmer/Technical" },
        { text: "Thu hoạch", icon: < AgricultureIcon / > , path: "/farmer/Agricultural-Harvest" }

    ];

    if (!farmerInfo) return <Box > Đang tải... < /Box>;

    const drawer = ( <
        Box >
        <
        Toolbar >
        <
        Typography variant = "h6"
        sx = {
            { color: "primary.main", fontWeight: "bold" } } >
        YenSon Farm <
        /Typography> <
        /Toolbar> <
        Divider / >
        <
        List > {
            menuItems.map((item) => ( <
                ListItem button key = { item.text }
                onClick = {
                    () => navigate(item.path) }
                sx = {
                    {
                        backgroundColor: currentPage === item.text ||
                            (currentPage === "Lịch làm việc" && item.text === "Quản lí lịch làm") ?
                            "primary.light" :
                            "transparent",
                        color: currentPage === item.text ||
                            (currentPage === "Lịch làm việc" && item.text === "Quản lí lịch làm") ?
                            "primary.contrastText" :
                            "text.primary",
                        "&:hover": {
                            backgroundColor: currentPage === item.text ||
                                (currentPage === "Lịch làm việc" && item.text === "Quản lí lịch làm") ?
                                "primary.light" :
                                "action.hover"
                        }
                    }
                } >
                <
                ListItemIcon sx = {
                    {
                        color: currentPage === item.text ||
                            (currentPage === "Lịch làm việc" && item.text === "Quản lí lịch làm") ?
                            "primary.contrastText" :
                            "text.primary"
                    }
                } >
                { item.icon } <
                /ListItemIcon> <
                ListItemText primary = { item.text }
                /> <
                /ListItem>
            ))
        } <
        /List> <
        /Box>
    );

    return ( <
        Box sx = {
            { display: "flex" } } > { /* AppBar */ } <
        AppBar position = "fixed"
        sx = {
            { width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } } } >
        <
        Toolbar >
        <
        IconButton color = "inherit"
        edge = "start"
        onClick = { handleDrawerToggle }
        sx = {
            { mr: 2, display: { sm: "none" } } } >
        <
        MenuIcon / >
        <
        /IconButton> <
        Typography variant = "h6"
        sx = {
            { flexGrow: 1 } } > { currentPage } <
        /Typography>

        { /* Notifications */ } <
        IconButton color = "inherit"
        onClick = { handleNotifOpen } >
        <
        Badge badgeContent = { unreadCount }
        color = "error" >
        <
        NotificationsIcon / >
        <
        /Badge> <
        /IconButton>

        { /* Menu tóm tắt thông báo */ } <
        Menu anchorEl = { notifAnchorEl }
        open = { Boolean(notifAnchorEl) }
        onClose = { handleNotifClose }
        PaperProps = {
            { style: { maxHeight: 350, width: 360 } } } >
        {
            notifications.length > 0 ? (
                notifications.map((item) => ( <
                    MenuItem key = { item.ma_de_xuat }
                    sx = {
                        { flexDirection: "column", alignItems: "flex-start", whiteSpace: "normal", mb: 1 } }
                    onClick = {
                        () => handleNotifClick(item) } >
                    <
                    Typography variant = "subtitle1"
                    sx = {
                        { fontWeight: "bold", mb: 0.5 } } > { item.noi_dung_de_xuat } <
                    /Typography> <
                    Typography variant = "body2"
                    color = "text.secondary" >
                    Mã lô: { item.ma_lo_trong } | Ngày: { new Date(item.ngay_de_xuat).toLocaleDateString("vi-VN") } <
                    /Typography> <
                    /MenuItem>
                ))
            ) : ( <
                MenuItem >
                <
                Typography variant = "body2"
                color = "text.secondary" >
                Không có thông báo <
                /Typography> <
                /MenuItem>
            )
        } <
        /Menu>

        {
            selectedNotif && ( <
                Dialog open = { true }
                onClose = { handleDialogClose }
                maxWidth = "sm"
                fullWidth >
                <
                DialogTitle > Chi tiết thông báo < /DialogTitle> <
                DialogContent dividers >
                <
                Typography variant = "h6"
                gutterBottom > 🌱Lô: { selectedNotif.ma_lo_trong } < /Typography> <
                Typography variant = "body2"
                color = "text.secondary"
                gutterBottom > 📝Nội dung: { selectedNotif.noi_dung_de_xuat } <
                /Typography>

                <
                Typography variant = "body2"
                sx = {
                    { mt: 1 } } > 📂Tài liệu: { selectedNotif.tai_lieu || "''_''" } <
                /Typography> <
                Typography variant = "body2"
                sx = {
                    { mt: 1 } } > 💬Ghi chú: { selectedNotif.chi_tiet || "''_''" } <
                /Typography> <
                Typography sx = {
                    { mt: 1 } }
                variant = "body2"
                color = "text.secondary"
                gutterBottom > 📅Ngày: { new Date(selectedNotif.ngay_de_xuat).toLocaleDateString("vi-VN") } <
                /Typography> <
                /DialogContent> <
                DialogActions >
                <
                Button onClick = { handleDialogClose }
                color = "primary" > Đóng < /Button> <
                /DialogActions> <
                /Dialog>
            )
        }

        { /* Profile */ } <
        IconButton size = "large"
        edge = "end"
        color = "inherit"
        onClick = { handleProfileOpen } >
        <
        Avatar sx = {
            { width: 32, height: 32 } } > { farmerInfo.full_name?.charAt(0) || "N" } < /Avatar> <
        /IconButton> <
        Menu anchorEl = { profileAnchorEl }
        open = { Boolean(profileAnchorEl) }
        onClose = { handleProfileClose }
        anchorOrigin = {
            { vertical: "bottom", horizontal: "right" } }
        transformOrigin = {
            { vertical: "top", horizontal: "right" } } >
        <
        MenuItem disabled >
        <
        Typography variant = "body2"
        color = "text.secondary" > { farmerInfo.full_name } < /Typography> <
        /MenuItem> <
        MenuItem disabled >
        <
        Typography variant = "body2"
        color = "text.secondary" > { farmerInfo.so_dien_thoai } < /Typography> <
        /MenuItem> <
        Divider / >
        <
        MenuItem onClick = { handleLogout } >
        <
        ListItemIcon > < LogoutIcon fontSize = "small" / > < /ListItemIcon> <
        ListItemText > Đăng xuất < /ListItemText> <
        /MenuItem> <
        /Menu> <
        /Toolbar> <
        /AppBar>

        { /* Drawer */ } <
        Box component = "nav"
        sx = {
            { width: { sm: drawerWidth }, flexShrink: { sm: 0 } } } >
        <
        Drawer variant = "temporary"
        open = { mobileOpen }
        onClose = { handleDrawerToggle }
        ModalProps = {
            { keepMounted: true } }
        sx = {
            { display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } } } >
        { drawer } <
        /Drawer> <
        Drawer variant = "permanent"
        sx = {
            { display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth } } }
        open >
        { drawer } <
        /Drawer> <
        /Box>

        { /* Main Content */ } <
        Box component = "main"
        sx = {
            { flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 } } > { children } <
        /Box> <
        /Box>
    );
};

export default FarmerLayout;
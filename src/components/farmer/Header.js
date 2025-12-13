// Header.jsx
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuItem from "@mui/material/MenuItem";
import MenuMui from "@mui/material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link, useNavigate, Outlet } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation = { 6 }
    ref = { ref }
    variant = "filled" {...props }
    />;
});

export default function Header() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [notifAnchor, setNotifAnchor] = React.useState(null);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [notifications, setNotifications] = React.useState([]);

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = async() => {
        try {
            const response = await fetch(
                "http://yensonfarm.io.vn/khoi_api/controller/components/auth/logout.php", {
                    method: "POST",
                    credentials: "include",
                }
            );

            const result = await response.json().catch(() => null);

            if (result && result.success) {
                localStorage.clear();
                sessionStorage.clear();
                setAnchorEl(null);
                setSnackbar({
                    open: true,
                    message: "Đăng xuất thành công!",
                    severity: "success",
                });
                setTimeout(() => navigate("/pages/auth/Login"), 1000);
            } else {
                setSnackbar({
                    open: true,
                    message: result?.message || "Đăng xuất thất bại",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
            setSnackbar({
                open: true,
                message: "Có lỗi xảy ra khi đăng xuất!",
                severity: "error",
            });
        }
    };

    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("farmer_notifications") || "[]");
        const unread = stored.filter((n) => !n.read).length;
        setNotifications(stored);
        setUnreadCount(unread);
    }, []);

    const handleSnackbarClose = () =>
        setSnackbar({...snackbar, open: false });

    const openNotifMenu = (event) => {
        setNotifAnchor(event.currentTarget);
        const updated = notifications.map((n) => ({...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);
        localStorage.setItem("farmer_notifications", JSON.stringify(updated));
    };
    const closeNotifMenu = () => setNotifAnchor(null);

    const menuItems = [
        { text: "Quản lí lịch làm", path: "/manager-role/WorkSchedule" },
        { text: "Starred" },
        { text: "Send email" },
        { text: "Drafts" },
    ];

    return ( <
        Box sx = {
            { display: "flex" }
        } >
        <
        CssBaseline / >
        <
        AppBar position = "fixed"
        open = { open } >
        <
        Toolbar >
        <
        IconButton color = "inherit"
        aria - label = "open drawer"
        onClick = { handleDrawerOpen }
        edge = "start"
        sx = {
            { marginRight: 5, ...(open && { display: "none" }) }
        } >
        <
        MenuIcon sx = {
            { fontSize: 32 }
        }
        /> < /
        IconButton >

        <
        Box sx = {
            { display: "flex", justifyContent: "space-between", flexGrow: 1, alignItems: "center" } } >
        <
        Typography variant = "h5"
        noWrap component = "div"
        sx = {
            { fontWeight: "bold" } } >
        YenSon Farm <
        /Typography>

        <
        Typography variant = "h5"
        noWrap component = "div"
        sx = {
            { fontWeight: "medium" }
        } >
        Dashboard <
        /Typography>

        <
        Box sx = {
            { display: "flex", gap: 2, alignItems: "center" } } >
        <
        IconButton sx = {
            { width: 50, height: 50 } }
        aria - label = "notifications"
        color = "inherit"
        onClick = { openNotifMenu } >
        <
        Badge badgeContent = { unreadCount }
        color = "error"
        invisible = { unreadCount === 0 } >
        <
        NotificationsIcon sx = {
            { fontSize: 32 } }
        /> <
        /Badge> <
        /IconButton>

        <
        MenuMui anchorEl = { notifAnchor }
        open = { Boolean(notifAnchor) }
        onClose = { closeNotifMenu }
        anchorOrigin = {
            { vertical: "bottom", horizontal: "right" } }
        transformOrigin = {
            { vertical: "top", horizontal: "right" } } >
        {
            notifications.length === 0 ? ( <
                MenuItem disabled > Không có thông báo < /MenuItem>
            ) : (
                notifications.slice(0, 10).map((n, i) => ( <
                    MenuItem key = { i }
                    onClick = { closeNotifMenu } > { n.message || "Bạn có công việc mới" } <
                    /MenuItem>
                ))
            )
        } <
        /MenuMui>

        <
        IconButton sx = {
            { width: 50, height: 50 } }
        aria - label = "account menu"
        onClick = { handleMenu }
        color = "inherit" >
        <
        AccountCircle sx = {
            { fontSize: 42 } }
        /> <
        /IconButton>

        <
        MenuMui anchorEl = { anchorEl }
        open = { Boolean(anchorEl) }
        onClose = { handleClose }
        anchorOrigin = {
            { vertical: "top", horizontal: "right" } }
        transformOrigin = {
            { vertical: "top", horizontal: "right" } } >
        <
        MenuItem disabled > {
            (() => {
                const keys = ["farmer_user", "user", "current_user", "userInfo"];
                const candidates = [];
                for (const k of keys) {
                    try {
                        const raw = localStorage.getItem(k);
                        if (!raw) continue;
                        const obj = JSON.parse(raw);
                        if (obj && typeof obj === "object") candidates.push(obj);
                    } catch (e) {}
                }
                const pick = (fieldNames) => {
                    for (const f of fieldNames) {
                        for (const obj of candidates) {
                            if (obj && obj[f]) return obj[f];
                        }
                    }
                    return "";
                };
                return pick(["ho_ten", "full_name", "username"]) || pick(["so_dien_thoai", "phone"]) || "Người dùng";
            })()
        } <
        /MenuItem> <
        MenuItem onClick = { handleClose } > Tài khoản < /MenuItem> <
        MenuItem onClick = { handleLogout } > Đăng xuất < /MenuItem> <
        /MenuMui> <
        /Box> <
        /Box> <
        /Toolbar> <
        /AppBar>

        <
        Drawer variant = "permanent"
        open = { open } >
        <
        DrawerHeader >
        <
        IconButton onClick = { handleDrawerClose } > { theme.direction === "rtl" ? < ChevronRightIcon / > : < ChevronLeftIcon / > } <
        /IconButton> <
        /DrawerHeader> <
        Divider / >
        <
        List > {
            menuItems.map((item, index) => ( <
                ListItem key = { item.text }
                disablePadding sx = {
                    { display: "block" } } >
                <
                ListItemButton component = { Link }
                to = { item.path || "#" }
                sx = {
                    {
                        minHeight: 48,
                        px: 2.5,
                        justifyContent: open ? "initial" : "center",
                    }
                } >
                <
                ListItemIcon sx = {
                    {
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                    }
                } >
                { index % 2 === 0 ? < CalendarMonthIcon / > : < MailIcon / > } <
                /ListItemIcon> <
                ListItemText primary = { item.text }
                sx = {
                    { opacity: open ? 1 : 0 } }
                /> <
                /ListItemButton> <
                /ListItem>
            ))
        } <
        /List> <
        Divider / >
        <
        /Drawer>

        <
        Box component = "main"
        sx = {
            { flexGrow: 1, p: 3 }
        } >
        <
        DrawerHeader / >
        <
        Outlet / >
        <
        /Box>

        <
        Snackbar open = { snackbar.open }
        autoHideDuration = { 2000 }
        onClose = { handleSnackbarClose } >
        <
        Alert onClose = { handleSnackbarClose }
        severity = { snackbar.severity }
        sx = {
            { width: "100%" } } > { snackbar.message } <
        /Alert> <
        /Snackbar> <
        /Box>
    );
}
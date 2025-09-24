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
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "success" });

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  //  Hàm đăng xuất
 const handleLogout = async () => {
  try {
    const response = await fetch(
      "http://localhost/doancuoinam/src/be_management/controller/components/auth/logout.php",
      {
        method: "POST",
        credentials: "include", // giữ cookie/session
      }
    );

    // Trường hợp API không trả JSON chuẩn thì nên kiểm tra
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


  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const menuItems = [
    { text: "Quản lí lịch làm", path: "/manager-role/WorkSchedule" },
    { text: "Starred" },
    { text: "Send email" },
    { text: "Drafts" },
  ];

  return (
    <Box sx={{ display: "flex", }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ background:
            "linear-gradient(to right, #000000 0%, #0a3d91 50%, #000000 100%)",
          boxShadow: "none",
          paddingX: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: "none" }) }}
          >
            <MenuIcon sx={{ fontSize: 32 }} />
          </IconButton>

          <div className="flex flex-1 justify-between items-center">
            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: "bold" }}>
              YenSon Farm
            </Typography>

            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: "medium" }}>
              Dashboard
            </Typography>

            <div className="flex items-center gap-2">
              <IconButton sx={{ width: 50, height: 50 }} aria-label="notifications" color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon sx={{ fontSize: 32 }} />
                </Badge>
              </IconButton>

              <IconButton
                sx={{ width: 50, height: 50 }}
                aria-label="account menu"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle sx={{ fontSize: 42 }} />
              </IconButton>

              <MenuMui
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleClose}>Tài khoản</MenuItem>
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </MenuMui>
            </div>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={item.path || "#"}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  justifyContent: open ? "initial" : "center",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {index % 2 === 0 ? <CalendarMonthIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>

      {/* Snackbar thông báo */}
      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

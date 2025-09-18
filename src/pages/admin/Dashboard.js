import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Divider, Button, Menu, MenuItem, Fade, Snackbar, Alert } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { AccountCircle } from "@mui/icons-material";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const toggleDrawer = (state) => () => setOpen(state);

  const [anchorEl, setAnchorEl] = useState(null);
  const open1 = Boolean(anchorEl);
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const drawerWidth = 240;
  const navigate = useNavigate();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Hàm đăng xuất
  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/kltn_management/src/be_management/controller/components/auth/logout.php",
        {
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

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background:
            "linear-gradient(to right, #000000 0%, #0a3d91 50%, #000000 100%)",
          boxShadow: "none",
          paddingX: 2,
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <Button color="inherit">Trang chủ</Button>
          <div style={{ display: "inline-block", cursor: "pointer" }} onMouseLeave={handleClose}>
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ background: "inherit", color: "white", cursor: "pointer" }}
              id="fade-button"
              aria-controls={open1 ? "fade-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open1 ? "true" : undefined}
              onMouseEnter={handleOpen}
            >
              Dịch vụ
            </Button>
            {/* <Menu
              id="fade-menu"
              anchorEl={anchorEl}
              open={open1}
              TransitionComponent={Fade}
              MenuListProps={{ onMouseLeave: handleClose }}
            >
              <MenuItem onClick={handleClose}>Quản lí đồng hồ</MenuItem>
              <MenuItem onClick={handleClose}>Thống kê - Phân tích</MenuItem>
              <MenuItem onClick={handleClose}>Cảnh báo thông minh</MenuItem>
            </Menu> */}
          </div>
          <Button color="inherit">Liên hệ</Button>

          <div style={{ marginLeft: "auto" }}>
            <IconButton
              sx={{ width: 50, height: 50 }}
              aria-label="notifications"
              color="inherit"
            >
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

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleClose}>Tài khoản</MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#173047",
            color: "white",
          },
        }}
        open
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem
              component={Link}
              to="/admin/dashboard"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <DashboardIcon sx={{ mr: 2 }} />
              <ListItemText
                primaryTypographyProps={{ fontWeight: 600 }}
                primary="Dashboard"
              />
            </ListItem>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
            <ListItem
              component={Link}
              to="/admin/accounts"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <PeopleIcon sx={{ mr: 2 }} />
              <ListItemText primary="Quản lý tài khoản" />
            </ListItem>
            <ListItem
              component={Link}
              to="/admin/work-schedule"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ScheduleIcon sx={{ mr: 2 }} />
              <ListItemText primary="Lịch làm việc" />
            </ListItem>
            <ListItem
              component={Link}
              to="/admin/plans"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <CalendarMonthIcon sx={{ mr: 2 }} />
              <ListItemText primary="Kế hoạch sản xuất" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: `${drawerWidth}px`,
          p: 3,
          bgcolor: "#f3f4f6",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        <Outlet />
      </Box>

      {/* ✅ Snackbar hiển thị thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

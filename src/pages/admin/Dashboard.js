import React, { useState, useEffect } from "react";
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
import { Divider, Button, Menu, MenuItem, Fade, Avatar, Typography, ListItemIcon } from "@mui/material";
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
import AgricultureIcon from "@mui/icons-material/Agriculture";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import ConstructionIcon from "@mui/icons-material/Construction";
import LogoutIcon from "@mui/icons-material/Logout";
import { Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
 
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const toggleRightDrawer = (state) => () => setRightDrawerOpen(state);

  const [anchorEl, setAnchorEl] = useState(null);
  const servicesMenuOpen = Boolean(anchorEl);
  const handleServicesOpen = (event) => setAnchorEl(event.currentTarget);
  const handleServicesClose = () => setAnchorEl(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  const drawerWidth = 240;

  useEffect(() => {
    const keys = ["admin_user", "user", "current_user", "userInfo", "farmer_user"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj?.ma_nguoi_dung || obj?.id) {
          setAdminInfo({ id: obj?.ma_nguoi_dung || obj?.id });
          setFarmerInfo(obj);
          break;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // thông báo
  const [notifications, setNotifications] = useState([]);
  const [anchorNotifEl, setAnchorNotifEl] = useState(null);
  const notifMenuOpen = Boolean(anchorNotifEl);

  const handleNotifOpen = (event) => setAnchorNotifEl(event.currentTarget);
  const handleNotifClose = () => setAnchorNotifEl(null);

  // useEffect fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("http://localhost/doancuoinam/src/be_management/acotor/admin/list_ki_thuat.php", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setNotifications(data.data);
      } catch (err) {
        console.error("❌ Lỗi loadNotifications:", err);
      }
    };
    loadNotifications();
  }, []);


  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
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
        <Toolbar sx={{ minHeight: 56, display: "flex", justifyContent: "space-between" }}>
          {/* Menu trái */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit">Trang chủ</Button>
            <div
              style={{ display: "inline-block", cursor: "pointer" }}
              onMouseLeave={handleServicesClose}
            >
              <Button
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ background: "inherit", color: "white", cursor: "pointer" }}
                id="fade-button"
                aria-controls={servicesMenuOpen ? "fade-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={servicesMenuOpen ? "true" : undefined}
                onMouseEnter={handleServicesOpen}
              >
                Dịch vụ
              </Button>
              <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                open={servicesMenuOpen}
                TransitionComponent={Fade}
                MenuListProps={{ onMouseLeave: handleServicesClose }}
              >
                <MenuItem onClick={handleServicesClose}>Quản lí đồng hồ</MenuItem>
                <MenuItem onClick={handleServicesClose}>Thống kê - Phân tích</MenuItem>
                <MenuItem onClick={handleServicesClose}>Cảnh báo thông minh</MenuItem>
              </Menu>
            </div>
            {/* <Button color="inherit">Liên hệ</Button> */}
          </Box>

          {/* Menu thông tin người dùng ở góc phải */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 2 }}>
            <Box>
              <IconButton color="inherit" onClick={handleNotifOpen}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={anchorNotifEl}
                open={notifMenuOpen}
                onClose={handleNotifClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    width: 320,
                    maxHeight: 400,
                    bgcolor: "#1e2a38", // nền tối giống AppBar
                    color: "white",
                    p: 1,
                    borderRadius: 2,
                  },
                }}
              >
                {notifications.length === 0 ? (
                  <MenuItem disabled sx={{ justifyContent: "center", color: "gray" }}>
                    Không có thông báo
                  </MenuItem>
                ) : (
                  notifications.map((notif) => (
                    <MenuItem
                      key={notif.ma_van_de}
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        mb: 1,
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#ff6b6b" }}>
                        Loại vấn đề: {notif.loai_van_de}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {notif.noi_dung}
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 0.5, color: "gray" }}>
                        Ngày: {new Date(notif.ngay_bao_cao).toLocaleString()}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </Menu>
            </Box>

            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleProfileOpen}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {farmerInfo?.full_name?.charAt(0) || "N"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {farmerInfo?.full_name}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {farmerInfo?.so_dien_thoai}
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

            {/* Nút mở Right Drawer */}
            <IconButton
              sx={{ bgcolor: "white", color: "black", "&:hover": { bgcolor: "#eee" } }}
              onClick={toggleRightDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

          </Box>

        </Toolbar>

      </AppBar>

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
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
            <ListItem component={Link} to="/admin/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              <DashboardIcon sx={{ mr: 2 }} />
              <ListItemText primaryTypographyProps={{ fontWeight: 600 }} primary="Dashboard" />
            </ListItem>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
            <ListItem component={Link} to="/admin/accounts" style={{ textDecoration: "none", color: "inherit" }}>
              <PeopleIcon sx={{ mr: 2 }} />
              <ListItemText primary="Quản lý tài khoản" />
            </ListItem>
            <ListItem component={Link} to="/admin/work-schedule" style={{ textDecoration: "none", color: "inherit" }}>
              <ScheduleIcon sx={{ mr: 2 }} />
              <ListItemText primary="Lịch làm việc" />
            </ListItem>
            <ListItem component={Link} to="/admin/attendance" style={{ textDecoration: "none", color: "inherit" }}>
              <AssignmentTurnedInIcon sx={{ mr: 2 }} />
              <ListItemText primary="Quản lý chấm công" />
            </ListItem>
            <ListItem component={Link} to="/admin/plans" style={{ textDecoration: "none", color: "inherit" }}>
              <CalendarMonthIcon sx={{ mr: 2 }} />
              <ListItemText primary="Kế hoạch sản xuất" />
            </ListItem>
            <ListItem component={Link} to="/admin/crops-supplies" style={{ textDecoration: "none", color: "inherit" }}>
              <AgricultureIcon sx={{ mr: 2 }} />
              <ListItemText primary="Quản lí gieo trồng & vật tư" />
            </ListItem>
            <ListItem component={Link} to="/admin/care-monitoring" style={{ textDecoration: "none", color: "inherit" }}>
              <LocalFloristIcon sx={{ mr: 2 }} />
              <ListItemText primary="Chăm sóc & theo dõi" />
            </ListItem>
            <ListItem component={Link} to="/admin/technical-processing" style={{ textDecoration: "none", color: "inherit" }}>
              <ConstructionIcon sx={{ mr: 2 }} />
              <ListItemText primary="Xử lí kĩ thuật" />
            </ListItem>
            <ListItem component={Link} to="/admin/product-qrcode" style={{ textDecoration: "none", color: "inherit" }}>
              <Inventory2Icon sx={{ mr: 2 }} />
              <ListItemText primary="Sản phẩm" />
            </ListItem>
            <ListItem>
              <ShoppingCartIcon sx={{ mr: 2 }} />
              <ListItemText primary="Đơn hàng" />
            </ListItem>
            <ListItem>
              <AssessmentIcon sx={{ mr: 2 }} />
              <ListItemText primary="Báo cáo" />
            </ListItem>
            <ListItem>
              <SettingsIcon sx={{ mr: 2 }} />
              <ListItemText primary="Cài đặt" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ ml: `${drawerWidth}px`, p: 3, bgcolor: "#f3f4f6", minHeight: "calc(100vh - 56px)" }}>
        <Outlet />
      </Box>

      <Drawer anchor="right" open={rightDrawerOpen} onClose={toggleRightDrawer(false)}>
        <Box
          sx={{ width: 360, backgroundColor: "#040404", minHeight: "100%", color: "white" }}
          role="presentation"
          onClick={toggleRightDrawer(false)}
        >
          <List>
            <ListItem>
              <ListItemText primaryTypographyProps={{ fontSize: "23px" }} primary="Trang chủ" />
            </ListItem>
            <Divider sx={{ borderColor: "#ccc" }} />
            <ListItem>
              <ListItemText primaryTypographyProps={{ fontSize: "23px" }} primary="Dịch vụ" />
            </ListItem>
            <Divider sx={{ borderColor: "#ccc" }} />
            <ListItem>
              <ListItemText primaryTypographyProps={{ fontSize: "23px" }} primary="Liên hệ" />
            </ListItem>
          </List>

          <Box sx={{ p: 2 }}>
            <ul className="text-sm space-y-2" style={{ fontSize: "20px", listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <LanguageIcon style={{ color: "white" }} />
                <a href="mailto:support@farmer.vn" className="text-blue-400 hover:underline" style={{ marginLeft: 8 }}>
                  support@farmer.vn
                </a>
              </li>
              <li>
                <PhoneIcon style={{ color: "white" }} />
                <a href="tel:19001234" className="text-blue-400 hover:underline" style={{ marginLeft: 8 }}>
                  1900 1234
                </a>
              </li>
              <li>
                <LocationOnIcon style={{ color: "white" }} />
                <span style={{ marginLeft: 8 }}>12 Nguyễn Văn Bảo, Q.Gò Vấp, TP.HCM</span>
              </li>
            </ul>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
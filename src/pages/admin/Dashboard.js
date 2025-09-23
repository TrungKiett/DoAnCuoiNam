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
import { Divider, Button, Menu, MenuItem, Fade } from "@mui/material";
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
import { Link, Outlet } from "react-router-dom";

export default function Dashboard() {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const toggleRightDrawer = (state) => () => setRightDrawerOpen(state);

  const [anchorEl, setAnchorEl] = useState(null);
  const servicesMenuOpen = Boolean(anchorEl);
  const handleServicesOpen = (event) => setAnchorEl(event.currentTarget);
  const handleServicesClose = () => setAnchorEl(null);

  const drawerWidth = 240;

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
          <Button color="inherit">Liên hệ</Button>
          <IconButton
            sx={{ bgcolor: "white", color: "black", ml: 2, "&:hover": { bgcolor: "#eee" } }}
            onClick={toggleRightDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
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
            <ListItem>
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
                <a href="mailto:support@donghonuoc.vn" className="text-blue-400 hover:underline" style={{ marginLeft: 8 }}>
                  support@donghonuoc.vn
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
                <span style={{ marginLeft: 8 }}>614 Điện Biên Phủ, Quận 10, TP.HCM</span>
              </li>
            </ul>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
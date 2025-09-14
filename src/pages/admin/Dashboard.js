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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Divider, Button, Menu, MenuItem, Fade } from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Link, Outlet } from "react-router-dom";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const toggleDrawer = (state) => () => setOpen(state);

  const [anchorEl, setAnchorEl] = useState(null);
  const open1 = Boolean(anchorEl);
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const drawerWidth = 240;

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(to right, #000000 0%, #0a3d91 50%, #000000 100%)",
          boxShadow: "none",
          paddingX: 2
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
            <Menu 
              id="fade-menu" 
              anchorEl={anchorEl} 
              open={open1} 
              TransitionComponent={Fade} 
              MenuListProps={{ onMouseLeave: handleClose }}
            >
              <MenuItem onClick={handleClose}>Quản lí đồng hồ</MenuItem>
              <MenuItem onClick={handleClose}>Thống kê - Phân tích</MenuItem>
              <MenuItem onClick={handleClose}>Cảnh báo thông minh</MenuItem>
            </Menu>
          </div>
          <Button color="inherit">Liên hệ</Button>
          <IconButton 
            sx={{ bgcolor: "white", color: "black", ml: 2, "&:hover": { bgcolor: "#eee" } }} 
            onClick={toggleDrawer(true)}
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
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#173047',
            color: 'white'
          }
        }}
        open
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem component={Link} to="/admin/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <DashboardIcon sx={{ mr: 2 }} />
              <ListItemText primaryTypographyProps={{ fontWeight: 600 }} primary="Dashboard" />
            </ListItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
            <ListItem component={Link} to="/admin/accounts" style={{ textDecoration: 'none', color: 'inherit' }}>
              <PeopleIcon sx={{ mr: 2 }} />
              <ListItemText primary="Quản lý tài khoản" />
            </ListItem>
            <ListItem component={Link} to="/admin/work-schedule" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ScheduleIcon sx={{ mr: 2 }} />
              <ListItemText primary="Lịch làm việc" />
            </ListItem>
            <ListItem component={Link} to="/admin/plans" style={{ textDecoration: 'none', color: 'inherit' }}>
              <CalendarMonthIcon sx={{ mr: 2 }} />
              <ListItemText primary="Kế hoạch sản xuất" />
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

      <Box component="main" sx={{ ml: `${drawerWidth}px`, p: 3, bgcolor: '#f3f4f6', minHeight: 'calc(100vh - 56px)' }}>
        <Outlet />
      </Box>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 'full', backgroundColor: '#040404', height: '180%', color: 'white' }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            <ListItem>
              <ListItemText primaryTypographyProps={{ fontSize: '23px' }} primary="Trang chủ" />
            </ListItem>
            <Divider sx={{ borderColor: '#ccc' }} />
            <ListItem>
              <ListItemText primaryTypographyProps={{ fontSize: '23px' }} primary="Dịch vụ" />
            </ListItem>
            <Divider sx={{ borderColor: '#ccc' }} />
            <ListItem>
              <ListItemText primaryTypographyProps={{ fontSize: '23px' }} primary="Liên hệ" />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ backgroundColor: '#040404', height: '100%', color: 'white' }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            <ListItem>
              <ul className="text-sm space-y-2" style={{ fontSize: '20px' }}>
                <li><LanguageIcon style={{ color: 'white' }} />  <a href="mailto:support@donghonuoc.vn" className="text-blue-400 hover:underline">support@donghonuoc.vn</a></li>
                <li><PhoneIcon style={{ color: 'white' }} />   <a href="tel:19001234" className="text-blue-400 hover:underline">1900 1234</a></li>
                <li><LocationOnIcon style={{ color: 'white' }} /><a href="614 Điện Biên Phủ, Quận 10, TP.HCM" className="text-blue-400 hover:underline">614 Điện Biên Phủ, Quận 10, TP.HCM</a> </li>
              </ul>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
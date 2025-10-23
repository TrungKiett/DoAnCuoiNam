import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FarmerLayout from "../../components/farmer/FarmerLayout";

function resolveApiBase() {
  if (typeof window === "undefined") return { base: "", root: "" };
  const { origin, pathname } = window.location;
  const isDevServer = origin.includes(":3000");
  const root = isDevServer
    ? "/doancuoinam"
    : pathname.includes("/doancuoinam")
      ? "/doancuoinam"
      : "";
  return { base: isDevServer ? "http://localhost" : "", root };
}

const FarmerDashboard = () => {
  const { base, root } = resolveApiBase();
  const getLoggedFarmer = () => {
    const keys = ["farmer_user", "user", "current_user", "userInfo"];
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const obj = JSON.parse(raw);
        if (obj && (obj.id || obj.ma_nguoi_dung)) {
          return {
            id: obj.id || obj.ma_nguoi_dung,
            full_name: obj.full_name || obj.ho_ten || obj.username || "",
            phone: obj.so_dien_thoai || obj.phone || "",
            role: obj.vai_tro || obj.role || "",
          };
        }
      } catch (e) {}
    }
    return null;
  };
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const farmer = getLoggedFarmer();
    if (farmer) {
      setFarmerInfo(farmer);
      loadFarmerData(farmer.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadFarmerData = async (farmerId) => {
    try {
      // Load tasks for this farmer
      const response = await fetch(
        `${base}${root}/src/be_management/api/farmer_tasks.php?farmer_id=${farmerId}`
      );
      const data = await response.json();
      const tasks = Array.isArray(data) ? data : data?.data || [];

      if (tasks) {
        const today = new Date().toISOString().split("T")[0];

        // Sắp xếp tất cả công việc theo thứ tự thời gian
        const sortedTasks = tasks.sort((a, b) => {
          const dateA = new Date(a.ngay_bat_dau);
          const dateB = new Date(b.ngay_bat_dau);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }

          const timeA = a.thoi_gian_bat_dau || "00:00:00";
          const timeB = b.thoi_gian_bat_dau || "00:00:00";

          return timeA.localeCompare(timeB);
        });

        // Filter today's tasks
        const todayTasksList = sortedTasks.filter(
          (task) =>
            task.ngay_bat_dau === today ||
            (task.ngay_bat_dau <= today && task.ngay_ket_thuc >= today)
        );

        // Filter upcoming tasks
        const upcomingTasksList = sortedTasks
          .filter((task) => task.ngay_bat_dau > today)
          .slice(0, 5);

        setTodayTasks(todayTasksList);
        setUpcomingTasks(upcomingTasksList);

        // Calculate stats
        setStats({
          totalTasks: sortedTasks.length,
          completedTasks: sortedTasks.filter(
            (t) => t.trang_thai === "hoan_thanh"
          ).length,
          pendingTasks: sortedTasks.filter((t) => t.trang_thai !== "hoan_thanh")
            .length,
        });
      }
    } catch (error) {
      console.error("Error loading farmer data:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "hoan_thanh":
        return "success";
      case "dang_lam":
        return "warning";
      case "bao_loi":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "hoan_thanh":
        return "Hoàn thành";
      case "dang_lam":
        return "Đang làm";
      case "bao_loi":
        return "Báo lỗi";
      case "chua_lam":
        return "Chưa làm";
      default:
        return status;
    }
  };

  if (!farmerInfo) {
    return (
      <FarmerLayout>
        {" "}
        <Box> Đang tải... </Box>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout currentPage="Dashboard">
      <Box>
        {" "}
        {/* Welcome Section */}{" "}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Chào mừng, {farmerInfo.full_name}!
          </Typography>{" "}
          <Typography variant="body1">
            Hôm nay là{" "}
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
          </Typography>{" "}
        </Paper>
        {/* Stats Cards */}{" "}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <WorkIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />{" "}
                  <Box>
                    <Typography variant="h4"> {stats.totalTasks} </Typography>{" "}
                    <Typography color="text.secondary">
                      {" "}
                      Tổng công việc{" "}
                    </Typography>{" "}
                  </Box>{" "}
                </Box>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </Grid>{" "}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon
                    color="success"
                    sx={{ mr: 2, fontSize: 40 }}
                  />{" "}
                  <Box>
                    <Typography variant="h4">
                      {" "}
                      {stats.completedTasks}{" "}
                    </Typography>{" "}
                    <Typography color="text.secondary">
                      {" "}
                      Đã hoàn thành{" "}
                    </Typography>{" "}
                  </Box>{" "}
                </Box>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </Grid>{" "}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ScheduleIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />{" "}
                  <Box>
                    <Typography variant="h4"> {stats.pendingTasks} </Typography>{" "}
                    <Typography color="text.secondary">
                      {" "}
                      Chờ thực hiện{" "}
                    </Typography>{" "}
                  </Box>{" "}
                </Box>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </Grid>{" "}
        </Grid>
        <Grid container spacing={3}>
          {" "}
          {/* Today's Tasks */}{" "}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />{" "}
                <Typography variant="h6"> Công việc hôm nay </Typography>{" "}
              </Box>{" "}
              {todayTasks.length > 0 ? (
                <List>
                  {" "}
                  {todayTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem>
                        <ListItemIcon>
                          <WorkIcon color="primary" />
                        </ListItemIcon>{" "}
                        <ListItemText
                          primary={task.ten_cong_viec}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {" "}
                                {task.mo_ta}{" "}
                              </Typography>{" "}
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={getStatusLabel(task.trang_thai)}
                                  color={getStatusColor(task.trang_thai)}
                                  size="small"
                                />
                              </Box>{" "}
                            </Box>
                          }
                        />{" "}
                      </ListItem>{" "}
                      {index < todayTasks.length - 1 && <Divider />}{" "}
                    </React.Fragment>
                  ))}{" "}
                </List>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 3 }}
                >
                  Không có công việc nào hôm nay{" "}
                </Typography>
              )}{" "}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/farmer/WorkSchedule")}
                >
                  Xem lịch làm việc{" "}
                </Button>{" "}
              </Box>{" "}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/farmer/Technical")}
                >
                  Đề xuất kĩ thuật{" "}
                </Button>{" "}
              </Box>{" "}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/farmer/Agricultural-Harvest")}
                >
                  Thu hoạch{" "}
                </Button>{" "}
              </Box>{" "}
            </Paper>{" "}
          </Grid>
          {/* Upcoming Tasks */}{" "}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />{" "}
                <Typography variant="h6"> Công việc sắp tới </Typography>{" "}
              </Box>{" "}
              {upcomingTasks.length > 0 ? (
                <List>
                  {" "}
                  {upcomingTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon color="warning" />
                        </ListItemIcon>{" "}
                        <ListItemText
                          primary={task.ten_cong_viec}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {" "}
                                {task.mo_ta}{" "}
                              </Typography>{" "}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Bắt đầu: {task.ngay_bat_dau}{" "}
                              </Typography>{" "}
                            </Box>
                          }
                        />{" "}
                      </ListItem>{" "}
                      {index < upcomingTasks.length - 1 && <Divider />}{" "}
                    </React.Fragment>
                  ))}{" "}
                </List>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 3 }}
                >
                  Không có công việc sắp tới{" "}
                </Typography>
              )}{" "}
            </Paper>{" "}
          </Grid>{" "}
        </Grid>{" "}
      </Box>{" "}
    </FarmerLayout>
  );
};

export default FarmerDashboard;

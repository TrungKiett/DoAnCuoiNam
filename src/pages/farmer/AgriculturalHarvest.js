import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  ViewList as ViewListIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import FarmerLayout from "../../components/farmer/FarmerLayout";
import FarmerCalenderHarvest from "../../components/farmer/FarmerCalenderHarvest";
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

const AgriculturalHarvest = () => {
  const { base, root } = resolveApiBase();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [farmerInfo, setFarmerInfo] = useState(null);
  const [workTasks, setWorkTasks] = useState([]);
  const [issueTasks, setIssueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("calendar");

  // Dialog cập nhật trạng thái
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  // 🔹 Lấy thông tin farmer từ localStorage
  useEffect(() => {
    const keys = ["farmer_user", "user", "current_user", "userInfo"];
    let farmer = null;
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const obj = JSON.parse(raw);
        if (obj && (obj.id || obj.ma_nguoi_dung)) {
          farmer = {
            id: obj.id || obj.ma_nguoi_dung,
            full_name: obj.full_name || obj.ho_ten || obj.username || "",
          };
          break;
        }
      } catch { }
    }
    if (farmer) {
      setFarmerInfo(farmer);
      loadWorkTasks(farmer.id);
      loadIssueTasks(farmer.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  // 🔹 Load công việc
  const loadWorkTasks = async (farmerId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${base}${root}/khoi_api/acotor/farmer/farmer_tasks_thuhoach.php?farmer_id=${farmerId}`
      );
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      if (list) {
        const sortedTasks = list.sort((a, b) => {
          const dateA = new Date(a.ngay_bat_dau);
          const dateB = new Date(b.ngay_bat_dau);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          return (a.thoi_gian_bat_dau || "00:00:00").localeCompare(
            b.thoi_gian_bat_dau || "00:00:00"
          );
        });
        setWorkTasks(sortedTasks);
      } else {
        setError(data.message || "Lỗi tải dữ liệu");
      }
    } catch (err) {
      setError("Lỗi kết nối API công việc");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load vấn đề báo cáo
  const loadIssueTasks = async (farmerId) => {
    try {
      const res = await fetch(
        `${base}${root}/khoi_api/acotor/farmer/list_thu_hoach.php?ma_nong_dan=${farmerId}`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setIssueTasks(data.data);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("Lỗi loadIssueTasks:", err);
    }
  };

  const handleOpen = (task) => {
    setSelectedTask(task);
    setStatus(task.trang_thai || "chua_xu_ly");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
  };

 

  if (!farmerInfo) {
    return (
      <FarmerLayout>
        <Box>Đang tải...</Box>
      </FarmerLayout>
    );
  }

  if (loading) {
    return (
      <FarmerLayout currentPage="Lịch làm việc">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout currentPage="Quản lý thu hoạch">
      <Box sx={{ px: isMobile ? 1 : 3, pb: 5 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            mb: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
        

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size={isMobile ? "small" : "medium"}
          >
            <ToggleButton value="calendar">
              <CalendarMonthIcon sx={{ mr: 1 }} />
              Lịch
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1 }} />
              Danh sách
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {viewMode === "calendar" ? (
          <FarmerCalenderHarvest
            tasks={workTasks}
            farmerInfo={farmerInfo}
            onUpdateTask={loadWorkTasks}
          />
        ) : (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                textAlign: "center",
                color: "#25BA08",
              }}
            >
              Quản lí thu hoạch
            </Typography>

            <Grid container spacing={2}>
              {issueTasks.length > 0 ? (
                issueTasks.map((task) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={task.ma_lo_trong}
                    sx={{ display: "flex" }}
                  >
                    <Card
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" },
                      }}
                      onClick={() => handleOpen(task)}
                    >
                      <CardContent>
             
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Ngày thu hoạch"
                              secondary={task.ngay_thu_hoach || "—"}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Sản lượng"
                              secondary={task.san_luong || "—"}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Chất lượng"
                              secondary={task.chat_luong || "—"}
                            />
                          </ListItem>
                    
                
                        </List>
          
                 
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography align="center">Không có báo cáo nào</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

    
      </Box>
    </FarmerLayout>
  );
};

export default AgriculturalHarvest;

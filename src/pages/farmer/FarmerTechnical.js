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
import FarmerCalendarTechnical from "../../components/farmer/FarmerCalenderTechnical";

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

const FarmerTechnical = () => {
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
    const farmerData = localStorage.getItem("farmer_user");
   if (farmerData) {
      const farmer = JSON.parse(farmerData);
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
        `${base}${root}/khoi_api/api/farmer_tasks.php?farmer_id=${farmerId}`
      );
     const data = await response.json();

      if (data.success) {
        const workerId = String(farmerId);
        const workerCode = 'ND' + String(farmerId).padStart(3, '0');
        const isAssignedToWorker = (ma) => {
          if (ma === null || ma === undefined) return false;
          const raw = String(ma);
          if (raw === workerId || raw === workerCode) return true;
          const cleaned = raw.replace(/[\[\]\"']/g, '');
          const tokens = cleaned.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
          return tokens.includes(workerId) || tokens.includes(workerCode);
        };

        // Lọc chỉ những công việc được phân cho nông dân hiện tại
        const assigned = (data.data || []).filter(t => isAssignedToWorker(t.ma_nguoi_dung));

        // Sắp xếp công việc theo thứ tự thời gian từ gần nhất đến xa nhất
        const sortedTasks = assigned.sort((a, b) => {
          // So sánh theo ngày bắt đầu
          const dateA = new Date(a.ngay_bat_dau);
          const dateB = new Date(b.ngay_bat_dau);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }

          // Nếu cùng ngày, sắp xếp theo thời gian bắt đầu
          const timeA = a.thoi_gian_bat_dau || "00:00:00";
          const timeB = b.thoi_gian_bat_dau || "00:00:00";

          return timeA.localeCompare(timeB);
        });

        setWorkTasks(sortedTasks);
      } else {
        setError(data.message || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load vấn đề báo cáo
  const loadIssueTasks = async (farmerId) => {
    try {
      const res = await fetch(
        `${base}${root}/khoi_api/acotor/farmer/list_ki_thuat.php?ma_nong_dan=${farmerId}`,
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

  const handleSave = async () => {
    if (!selectedTask) return;
    try {
      const res = await fetch(
        `${base}${root}/khoi_api/acotor/farmer/update_trang_thai_ki_thuat.php?ma_nong_dan=${farmerInfo.id}&ma_van_de=${selectedTask.ma_van_de}&trang_thai=${status}`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        alert("Cập nhật trạng thái thành công!");
        setIssueTasks((prev) =>
          prev.map((task) =>
            task.ma_van_de === selectedTask.ma_van_de
              ? { ...task, trang_thai: status }
              : task
          )
        );
      } else {
        alert("Cập nhật thất bại: " + (data.message || "Không rõ nguyên nhân"));
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi cập nhật!");
    } finally {
      handleClose();
    }
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
    <FarmerLayout currentPage="Đề xuất kỹ thuật">
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
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", color: "#25BA08" }}
          >
            Đề xuất kỹ thuật
          </Typography>

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
          <FarmerCalendarTechnical
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
              Phản hồi báo cáo
            </Typography>

            <Grid container spacing={2}>
              {issueTasks.length > 0 ? (
                issueTasks.map((task) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={task.ma_van_de}
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Loại vấn đề: {task.loai_van_de || "Chưa xác định"}
                        </Typography>
                        <List dense>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Ngày báo cáo"
                              secondary={task.ngay_bao_cao || "—"}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Mã lô trồng"
                              secondary={task.ma_lo_trong || "—"}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Tài liệu"
                              secondary={task.tai_lieu || "—"}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Nội dung đề xuất"
                              secondary={task.noi_dung_de_xuat || "—"}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary="Ngày phản hồi"
                              secondary={task.ngay_de_xuat || "—"}
                            />
                          </ListItem>
                        </List>
                        {task.hinh_anh && (
                          <Box sx={{ mt: 1 }}>
                            <img
                              src={task.hinh_anh}
                              alt="Ảnh minh họa"
                              style={{
                                width: "30%",
                                height: "30%",
                                borderRadius: 8,
                              }}
                            />
                          </Box>
                        )}
                        {task.ghi_chu && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Ghi chú: {task.ghi_chu}
                          </Typography>
                        )}
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

        {/* Dialog cập nhật trạng thái */}
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth={isMobile ? "xs" : "sm"}
        >
          <DialogTitle textAlign="center">Cập nhật trạng thái</DialogTitle>
          <DialogContent dividers>
            {selectedTask && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Mã vấn đề: {selectedTask.ma_van_de}
                </Typography>
                <TextField
                  margin="dense"
                  select
                  label="Trạng thái"
                  fullWidth
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="dang_xu_ly">Đang xử lý</MenuItem>
                  <MenuItem value="da_xu_ly">Đã hoàn thành</MenuItem>
                </TextField>
              </>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              px: isMobile ? 1 : 3,
            }}
          >
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#25BA08" }}
              onClick={handleSave}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FarmerLayout>
  );
};

export default FarmerTechnical;

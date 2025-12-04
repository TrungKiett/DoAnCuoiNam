import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  Update as UpdateIcon,
  Photo as PhotoIcon,
  ViewList as ViewListIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FarmerLayout from "../../components/farmer/FarmerLayout";
import FarmerCalendarView from "../../components/farmer/FarmerCalendarView";

const FarmerWorkSchedule = () => {
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    trang_thai: "",
    ket_qua: "",
    ghi_chu: "",
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    const farmerData = localStorage.getItem("farmer_user");
    if (farmerData) {
      const farmer = JSON.parse(farmerData);
      setFarmerInfo(farmer);
      loadTasks(farmer.id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadTasks = async (farmerId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost/doancuoinam/src/be_management/api/farmer_tasks.php?farmer_id=${farmerId}`
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

        setTasks(sortedTasks);
      } else {
        setError(data.message || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "cao":
        return "error";
      case "trung_binh":
        return "warning";
      case "thap":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "cao":
        return "Cao";
      case "trung_binh":
        return "Trung bình";
      case "thap":
        return "Thấp";
      default:
        return priority;
    }
  };

  const handleUpdateTask = (task) => {
    setSelectedTask(task);
    setUpdateForm({
      trang_thai: task.trang_thai,
      ket_qua: task.ket_qua || "",
      ghi_chu: task.ghi_chu || "",
    });
    setOpenUpdateDialog(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedTask || !farmerInfo) return;

    try {
      setUpdating(true);
      const response = await fetch(
        "http://localhost/doancuoinam/src/be_management/api/update_task_status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task_id: selectedTask.id,
            trang_thai: updateForm.trang_thai,
            ket_qua: updateForm.ket_qua,
            ghi_chu: updateForm.ghi_chu,
            ma_nguoi_dung: farmerInfo.id, // Gửi ID của nông dân đang cập nhật
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Cập nhật local state
        setTasks(
          tasks.map((task) =>
            task.id === selectedTask.id ? { ...task, ...updateForm } : task
          )
        );
        setOpenUpdateDialog(false);
        setSelectedTask(null);
      } else {
        setError(data.message || "Lỗi cập nhật");
      }
    } catch (error) {
      setError("Lỗi kết nối");
    } finally {
      setUpdating(false);
    }
  };

  // Function để handle update từ calendar view
  const handleCalendarUpdateTask = async (taskId, updateData) => {
    if (!farmerInfo) {
      throw new Error("Không tìm thấy thông tin nông dân");
    }

    try {
      const response = await fetch(
        "http://localhost/doancuoinam/src/be_management/api/update_task_status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task_id: taskId,
            trang_thai: updateData.trang_thai,
            ket_qua: updateData.ket_qua,
            ghi_chu: updateData.ghi_chu,
            ma_nguoi_dung: farmerInfo.id, // Gửi ID của nông dân đang cập nhật
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Cập nhật local state
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, ...updateData } : task
          )
        );
        return true;
      } else {
        throw new Error(data.message || "Lỗi cập nhật");
      }
    } catch (error) {
      throw error;
    }
  };

const canUpdateTask = (task) => {
  if (!task || !task.ngay_bat_dau) return false;

  const today = new Date().toISOString().split('T')[0];
  // Chỉ cho phép khi hôm nay trùng ngày bắt đầu
  return today === task.ngay_bat_dau;
};


  const getTaskTimeStatus = (task) => {
    if (!task || !task.ngay_bat_dau || !task.ngay_ket_thuc) {
      return { status: "unknown", label: "Không xác định", color: "default" };
    }
    const today = new Date().toISOString().split("T")[0];
    const startDate = task.ngay_bat_dau;
    const endDate = task.ngay_ket_thuc;

    if (today < startDate) {
      return { status: "upcoming", label: "Sắp tới", color: "info" };
    } else if (today >= startDate && today <= endDate) {
      return { status: "current", label: "Đang thực hiện", color: "warning" };
    } else {
      return { status: "overdue", label: "Quá hạn", color: "error" };
    }
  };

  const getDaysUntilStart = (task) => {
    if (!task || !task.ngay_bat_dau) {
      return "";
    }
    const today = new Date();
    const startDate = new Date(task.ngay_bat_dau);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Ngày mai";
    if (diffDays > 1) return `${diffDays} ngày nữa`;
    if (diffDays < 0) return `${Math.abs(diffDays)} ngày trước`;
    return "";
  };

  const getUpdateStatusMessage = (task) => {
    if (!task || !task.ngay_bat_dau || !task.ngay_ket_thuc) {
      return "Không thể cập nhật";
    }

    const today = new Date().toISOString().split("T")[0];

    if (today < task.ngay_bat_dau) {
      const startDate = new Date(task.ngay_bat_dau);
      const todayDate = new Date();
      const diffTime = startDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Có thể cập nhật từ ngày mai";
      if (diffDays > 1) return `Có thể cập nhật sau ${diffDays} ngày nữa`;
      return "Chưa đến ngày làm việc";
    } else if (today > task.ngay_bat_dau) {
      return "Đã qua ngày bắt đầu";
    } else if (today === task.ngay_bat_dau) {
      return "Có thể cập nhật ngay bây giờ";
    } else {
      return "Không thể cập nhật";
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
    <FarmerLayout currentPage="Lịch làm việc">
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Lịch làm việc của tôi</Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
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
          <FarmerCalendarView
            tasks={tasks}
            farmerInfo={farmerInfo}
            onUpdateTask={handleCalendarUpdateTask}
          />
        ) : (
          <Box>
            {tasks.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  Chưa có công việc nào được phân công
                </Typography>
              </Paper>
            ) : (
              <Box>
                {/* Thống kê tổng quan */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    background:
                      "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {
                            tasks.filter(
                              (t) => getTaskTimeStatus(t).status === "current"
                            ).length
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đang thực hiện
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="info.main">
                          {
                            tasks.filter(
                              (t) => getTaskTimeStatus(t).status === "upcoming"
                            ).length
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sắp tới
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="success.main">
                          {
                            tasks.filter((t) => t.trang_thai === "hoan_thanh")
                              .length
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đã hoàn thành
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Grid container spacing={3}>
                  {tasks.map((task) => (
                    <Grid item xs={12} md={6} lg={4} key={task.id}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{ flexGrow: 1 }}
                            >
                              {task.ten_cong_viec}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Chip
                                label={getStatusLabel(task.trang_thai)}
                                color={getStatusColor(task.trang_thai)}
                                size="small"
                              />
                              <Chip
                                label={getTaskTimeStatus(task).label}
                                color={getTaskTimeStatus(task).color}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {task.mo_ta}
                          </Typography>

                          <List dense>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <ScheduleIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Thời gian"
                                secondary={
                                  <Box>
                                    <Typography variant="body2">
                                      {task.ngay_bat_dau} - {task.ngay_ket_thuc}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {getDaysUntilStart(task)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>

                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <WorkIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Loại công việc"
                                secondary={task.loai_cong_viec}
                              />
                            </ListItem>

                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <CheckCircleIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Ưu tiên"
                                secondary={
                                  <Chip
                                    label={getPriorityLabel(task.uu_tien)}
                                    color={getPriorityColor(task.uu_tien)}
                                    size="small"
                                  />
                                }
                              />
                            </ListItem>
                          </List>

                          {task.ket_qua && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Kết quả: {task.ket_qua}
                              </Typography>
                            </Box>
                          )}

                          {task.ghi_chu && (
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Ghi chú: {task.ghi_chu}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>

                        <Box sx={{ p: 2, pt: 0 }}>
                          {canUpdateTask(task) ? (
                            <Button
                              variant="contained"
                              startIcon={<UpdateIcon />}
                              onClick={() => handleUpdateTask(task)}
                              fullWidth
                            >
                              Cập nhật trạng thái
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              disabled
                              fullWidth
                              startIcon={<UpdateIcon />}
                            >
                              {getUpdateStatusMessage(task)}
                            </Button>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}

        {/* Update Task Dialog */}
        <Dialog
          open={openUpdateDialog}
          onClose={() => setOpenUpdateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cập nhật trạng thái công việc</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTask?.ten_cong_viec}
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={updateForm.trang_thai}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, trang_thai: e.target.value })
                  }
                  label="Trạng thái"
                >
                  <MenuItem value="chua_lam">Chưa làm</MenuItem>
                  <MenuItem value="dang_lam">Đang làm</MenuItem>
                  <MenuItem value="hoan_thanh">Hoàn thành</MenuItem>
                  <MenuItem value="bao_loi">Báo lỗi</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Kết quả"
                multiline
                rows={3}
                value={updateForm.ket_qua}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, ket_qua: e.target.value })
                }
                sx={{ mb: 2 }}
                placeholder="Mô tả kết quả thực hiện..."
              />

              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={2}
                value={updateForm.ghi_chu}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, ghi_chu: e.target.value })
                }
                placeholder="Ghi chú thêm..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpdateDialog(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleUpdateSubmit}
              disabled={updating}
              startIcon={
                updating ? <CircularProgress size={20} /> : <UpdateIcon />
              }
            >
              {updating ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FarmerLayout>
  );
};

export default FarmerWorkSchedule;

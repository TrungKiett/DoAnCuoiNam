import React, { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
// import FarmerTechnical from '../../be_management/uploads/khoi';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Event as EventIcon,
  CloudUpload as CloudUploadIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";

export default function FarmerCalendarTech({
  tasks = [],
  farmerInfo = null,
  onUpdateTask,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [updateForm, setUpdateForm] = useState({
    trang_thai: "",
    ket_qua: "",
    ghi_chu: "",
  });
  const [updating, setUpdating] = useState(false);

  const taskTypes = [
    { value: "chuan_bi_dat", label: "Chuẩn bị đất", color: "#4caf50" },
    { value: "gieo_trong", label: "Gieo trồng", color: "#2196f3" },
    { value: "cham_soc", label: "Chăm sóc", color: "#ff9800" },
    { value: "tuoi_nuoc", label: "Tưới nước", color: "#00bcd4" },
    { value: "bon_phan", label: "Bón phân", color: "#9c27b0" },
    { value: "thu_hoach", label: "Thu hoạch", color: "#f44336" },
    { value: "khac", label: "Khác", color: "#795548" },
  ];

  const priorities = [
    { value: "thap", label: "Thấp", color: "#4caf50" },
    { value: "trung_binh", label: "Trung bình", color: "#ff9800" },
    { value: "cao", label: "Cao", color: "#f44336" },
    { value: "khan_cap", label: "Khẩn cấp", color: "#e91e63" },
  ];

  const statuses = [
    { value: "chua_lam", label: "Chưa làm", color: "#9e9e9e" },
    { value: "dang_lam", label: "Đang làm", color: "#2196f3" },
    { value: "hoan_thanh", label: "Hoàn thành", color: "#4caf50" },
    { value: "bao_loi", label: "Báo lỗi", color: "#f44336" },
  ];

  // Format Date to local YYYY-MM-DD to avoid UTC shifting issues
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Lấy tuần hiện tại
  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 là ngày đầu tuần
    startOfWeek.setDate(diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  // Lấy các slot thời gian trong ngày
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push({
      hour: hour,
      label: `${hour.toString().padStart(2, "0")}:00`,
      endLabel: `${(hour + 1).toString().padStart(2, "0")}:00`,
    });
  }

  // Lấy công việc cho ngày cụ thể
  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = formatLocalDate(date);
    return tasks.filter(
      (task) =>
        task.ngay_bat_dau === dateStr ||
        (task.ngay_ket_thuc &&
          task.ngay_ket_thuc >= dateStr &&
          task.ngay_bat_dau <= dateStr)
    );
  };

  // Lấy công việc cho slot thời gian cụ thể
  const getTasksForTimeSlot = (date, hour) => {
    const dayTasks = getTasksForDate(date);
    return dayTasks.filter((task) => {
      if (!task) return false;
      if (task.thoi_gian_bat_dau) {
        const taskStartHour = parseInt(task.thoi_gian_bat_dau.split(":")[0]);
        return taskStartHour === hour;
      } else {
        const taskIndex = dayTasks.indexOf(task);
        const taskHour = 8 + ((taskIndex * 2) % 12); // Từ 8h đến 20h
        return taskHour === hour;
      }
    });
  };

  // Tính toán thông tin hiển thị cho công việc
  const getTaskDisplayInfo = (task) => {
    if (!task || !task.thoi_gian_bat_dau || !task.thoi_gian_ket_thuc) {
      return {
        startHour: 8,
        duration: 2,
        height: 60,
      };
    }

    const startTime = task.thoi_gian_bat_dau.split(":");
    const endTime = task.thoi_gian_ket_thuc.split(":");

    const startHour = parseInt(startTime[0]);
    const startMinute = parseInt(startTime[1]);
    const endHour = parseInt(endTime[0]);
    const endMinute = parseInt(endTime[1]);

    // Tính độ dài công việc theo giờ
    const duration = endHour - startHour + (endMinute - startMinute) / 60;

    // Mỗi slot = 1 giờ, mỗi slot cao 60px
    const height = Math.max(duration * 60, 30); // Tối thiểu 30px

    return {
      startHour,
      startMinute,
      duration,
      height,
    };
  };

  // Định dạng ngày
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Định dạng ngày cho mini calendar
  const formatMiniDate = (date) => {
    return date.getDate();
  };

  // Lấy màu cho loại công việc
  const getTaskTypeColor = (type) => {
    const taskType = taskTypes.find((t) => t.value === type);
    return taskType?.color || "#FDFF9A";
  };

  // Lấy màu cho trạng thái
  const getStatusColor = (status) => {
    const statusOption = statuses.find((s) => s.value === status);
    return statusOption?.color || "#9e9e9e";
  };

  // Kiểm tra xem có thể cập nhật công việc không
  const canUpdateTask = (task) => {
    if (!task || !task.ngay_bat_dau || !task.ngay_ket_thuc) {
      return false;
    }
    const today = new Date().toISOString().split("T")[0];
    // Chỉ cho phép cập nhật khi đã đến đúng ngày bắt đầu (không phải trước đó)
    return task.ngay_bat_dau === today;
  };

  // Xử lý click vào công việc
  const handleTaskClick = (task, date) => {
    setViewingTask(task);
    // lưu ngày ô lịch nơi task được click (để so sánh với "hôm nay")
    if (date) setSelectedDate(date);
    setOpenViewDialog(true);
  };

  // Xử lý cập nhật trạng thái
  const handleUpdateTask = (task) => {
    setSelectedTask(task);
    setUpdateForm({
      trang_thai: task.trang_thai,
      ket_qua: task.ket_qua || "",
      ghi_chu: task.ghi_chu || "",
    });
    setOpenUpdateDialog(true);
  };

  // Xử lý submit cập nhật
  const handleUpdateSubmit = async () => {
    if (!selectedTask) return;

    try {
      setUpdating(true);
      if (onUpdateTask) {
        await onUpdateTask(selectedTask.id, updateForm);
        setSnackbar({
          open: true,
          message: "Cập nhật trạng thái thành công!",
          severity: "success",
        });
      }
      setOpenUpdateDialog(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi cập nhật: " + error.message,
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Điều hướng tuần
  const navigateWeek = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  // Về hôm nay
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Lấy thống kê cho ngày
  const getDayStats = (date) => {
    const dayTasks = getTasksForDate(date);
    const today = new Date().toISOString().split("T")[0];
    const dateStr = formatLocalDate(date);

    return {
      total: dayTasks.length,
      completed: dayTasks.filter((t) => t && t.trang_thai === "hoan_thanh")
        .length,
      inProgress: dayTasks.filter((t) => t && t.trang_thai === "dang_lam")
        .length,
      pending: dayTasks.filter((t) => t && t.trang_thai === "chua_lam").length,
      isToday: dateStr === today,
      isPast: dateStr < today,
      isFuture: dateStr > today,
    };
  };

  // lập model đê xuất xử lí kĩ thuật
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    noi_dung: "",
    loai_van_de: "",
    ngay_bao_cao: new Date().toISOString().slice(0, 10),
    ma_nong_dan: "",
    ma_lo_trong: "",
    hinh_anh: "",
    file: null,
    trang_thai: "",
    ghi_chu: "",
  });

  // Lấy ma_nong_dan từ localStorage
  useEffect(() => {
    const keys = ["user", "farmer_user", "current_user", "userInfo"];
    let found = false;
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj?.ma_nguoi_dung || obj?.id) {
          setForm((prev) => ({
            ...prev,
            ma_nong_dan: obj?.ma_nguoi_dung || obj?.id,
          }));
          found = true;
          break;
        }
      } catch {}
    }
    if (!found) alert("Không tìm thấy mã nông dân. Vui lòng đăng nhập lại.");
    setLoading(false);
  }, []);
  // lấy mã lô trồng
  useEffect(() => {
    if (viewingTask) {
      const lot = viewingTask.ma_lo_trong ?? viewingTask.id ?? "";
      setForm((prev) => ({ ...prev, ma_lo_trong: lot }));
    }
  }, [viewingTask]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file)
      setForm((prev) => ({
        ...prev,
        hinh_anh: URL.createObjectURL(file),
        file,
      }));
  };

  const handleSubmit = async () => {
    if (!form.noi_dung) {
      alert("Vui lòng nhập nội dung!");
      return;
    }
    if (!form.ma_nong_dan) {
      alert("Không tìm thấy mã nông dân!");
      return;
    }

    try {
      const formData = new FormData();
      [
        "noi_dung",
        "loai_van_de",
        "ngay_bao_cao",
        "ma_lo_trong",
        "ma_nong_dan",
        "trang_thai",
        "ghi_chu",
      ].forEach((key) => formData.append(key, form[key] || ""));
      if (form.file) formData.append("hinh_anh", form.file);

      const res = await fetch(
        "http://yensonfarm.io.vn/khoi_api/acotor/farmer/de_xuat_xu_li_ki_thuat.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Đã lưu thành công!");
        setForm((prev) => ({
          ...prev,
          noi_dung: "",
          ngay_bao_cao: "",
          ghi_chu: "",
          trang_thai: "",
          loai_van_de: "",
          file: null,
        }));
        setOpen(false);
      } else alert("Lỗi: " + data.message);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi gửi dữ liệu!");
    }
  };

  // ----- HÀM CHUẨN HÓA NGÀY VỀ YYYY-MM-DD (LOCAL) -----

  // ---- handleOpen: chỉ mở khi hôm nay nằm trong khoảng [ngay_bat_dau, ngay_ket_thuc] ----
  const handleOpen = () => {
    if (!viewingTask) {
      alert("Vui lòng chọn công việc để thu hoạch!");
      return;
    }

    if (!selectedDate) {
      alert(
        "Không xác định được ngày ô lịch bạn đang xem. Vui lòng click lại vào ô ngày chứa công việc."
      );
      return;
    }

    // ngày ô lịch mà người dùng click (YYYY-MM-DD)
    const clickedDateYMD = formatLocalDate(selectedDate);
    // ngày hôm nay (YYYY-MM-DD)
    const todayYMD = formatLocalDate(new Date());

    console.log("So sánh ngày ô clicked với hôm nay:", {
      clickedDateYMD,
      todayYMD,
    });

    if (todayYMD !== clickedDateYMD) {
      alert(
        `Chỉ có thể thực hiện thu hoạch vào NGÀY HIỆN TẠI.\n` +
          `Ngày bạn đang xem: ${clickedDateYMD}\nHôm nay: ${todayYMD}`
      );
      return;
    }

    // Nếu trùng -> mở form
    setForm((prev) => ({
      ...prev,
      ma_lo_trong:
        viewingTask.ma_lo_trong ?? viewingTask.id ?? prev.ma_lo_trong,
    }));

    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  if (loading) return <CircularProgress />;

  return (
    <Box
      className="calendar-weekly-container"
      sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}
    >
      {/* Sidebar bên trái */}
      <Paper
        className="calendar-sidebar"
        sx={{
          width: 280,
          minWidth: 280,
          height: "100vh",
          overflow: "auto",
          borderRadius: 0,
          borderRight: "1px solid #e0e0e0",
        }}
      >
        {/* Header sidebar */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <MenuIcon />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Lịch làm việc
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chào mừng, {farmerInfo?.full_name || "Nông dân"}!
          </Typography>
        </Box>

        {/* Mini Calendar */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            {currentDate.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
            }}
          >
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <Typography
                key={day}
                variant="caption"
                sx={{ textAlign: "center", p: 0.5 }}
              >
                {day}
              </Typography>
            ))}
            {getWeekDates(currentDate).map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected =
                date.toDateString() === selectedDate.toDateString();
              const stats = getDayStats(date);

              return (
                <Box
                  key={index}
                  sx={{
                    aspectRatio: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    borderRadius: "50%",
                    bgcolor: isSelected
                      ? "#1976d2"
                      : isToday
                        ? "#ff9800"
                        : "transparent",
                    color: isSelected || isToday ? "white" : "text.primary",
                    "&:hover": { bgcolor: isSelected ? "#1976d2" : "#f5f5f5" },
                    position: "relative",
                  }}
                  onClick={() => setSelectedDate(date)}
                >
                  <Typography variant="caption">
                    {formatMiniDate(date)}
                  </Typography>
                  {stats.total > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor:
                          stats.completed === stats.total
                            ? "#4caf50"
                            : "#ff9800",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Thống kê tuần */}
        {/* <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Thống kê tuần
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Tổng công việc:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {weekDates.reduce((sum, date) => sum + getDayStats(date).total, 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="warning.main">Tổng đề xuất:</Typography>
              <Typography variant="body2" fontWeight="bold" color="warning.main">
                {weekDates.reduce((sum, date) => sum + getDayStats(date).inProgress, 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="warning.main">Chưa xử lí:</Typography>
              <Typography variant="body2" fontWeight="bold" color="warning.main">
                {weekDates.reduce((sum, date) => sum + getDayStats(date).inProgress, 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="success.main">Đã xử lí:</Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
              </Typography>
            </Box>
          </Box>
        </Box> */}

        {/* Danh sách loại công việc */}
      </Paper>

      {/* Main Calendar Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header Calendar */}
        <Paper
          sx={{ p: 2, borderRadius: 0, borderBottom: "1px solid #e0e0e0" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                startIcon={<TodayIcon />}
                onClick={goToToday}
                variant="outlined"
                size="small"
              >
                Hôm nay
              </Button>
              <Tooltip title="Tuần trước">
                <IconButton onClick={() => navigateWeek(-1)}>
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
              <Typography
                variant="h6"
                sx={{ minWidth: 200, textAlign: "center" }}
              >
                {weekDates[0].toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                -{" "}
                {weekDates[6].toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              <Tooltip title="Tuần sau">
                <IconButton onClick={() => navigateWeek(1)}>
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button variant="outlined" size="small">
                Tuần
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Calendar Grid */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ display: "flex", height: "100%" }}>
            {/* Time column */}
            <Box sx={{ width: 60, borderRight: "1px solid #e0e0e0" }}>
              <Box sx={{ height: 40, borderBottom: "1px solid #e0e0e0" }} />
              {timeSlots.map((slot) => (
                <Box
                  key={slot.hour}
                  sx={{
                    height: 60,
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "flex-start",
                    pt: 0.5,
                    px: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {slot.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Days columns */}
            {weekDates.map((date, dayIndex) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected =
                date.toDateString() === selectedDate.toDateString();
              const stats = getDayStats(date);

              return (
                <Box
                  key={dayIndex}
                  sx={{
                    flex: 1,
                    borderRight: dayIndex < 6 ? "1px solid #e0e0e0" : "none",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#F2DEDE" },
                  }}
                  onClick={() => setSelectedDate(date)}
                >
                  {/* Day header */}
                  <Box
                    sx={{
                      height: 40,
                      borderBottom: "1px solid #e0e0e0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isToday
                        ? "#7CC1F0"
                        : isSelected
                          ? "#f5f5f5"
                          : "white",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: isToday ? "bold" : "normal" }}
                    >
                      {formatDate(date)}
                    </Typography>
                    {stats.total > 0 && (
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                        {stats.completed > 0 && (
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#4caf50",
                            }}
                          />
                        )}
                        {stats.inProgress > 0 && (
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#ff9800",
                            }}
                          />
                        )}
                        {stats.pending > 0 && (
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              bgcolor: "#9e9e9e",
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Time slots for this day */}
                  {timeSlots.map((slot) => {
                    const tasksForSlot = getTasksForTimeSlot(date, slot.hour);

                    return (
                      <Box
                        key={slot.hour}
                        sx={{
                          height: 60,
                          borderBottom: "1px solid #f0f0f0",
                          position: "relative",
                          "&:hover": { bgcolor: "#f9f9f9" },
                        }}
                      >
                        {tasksForSlot.map((task, taskIndex) => {
                          const displayInfo = getTaskDisplayInfo(task);
                          const topOffset = task.thoi_gian_bat_dau
                            ? (parseInt(task.thoi_gian_bat_dau.split(":")[1]) /
                                60) *
                              60
                            : 0;

                          return (
                            //  trò vào task công việc
                            <Tooltip
                              key={taskIndex}
                              title={`${task.ten_cong_viec} (${task.thoi_gian_bat_dau || "N/A"} - ${task.thoi_gian_ket_thuc || "N/A"})`}
                              arrow
                            >
                              <Box
                                className={`task-block priority-${task.uu_tien} status-${task.trang_thai}`}
                                sx={{
                                  position: "absolute",
                                  top: 2 + topOffset,
                                  left: 2,
                                  right: 2,
                                  height: displayInfo.height - 4,
                                  bgcolor: getTaskTypeColor(
                                    task.loai_cong_viec
                                  ),
                                  borderRadius: 1,
                                  p: 0.5,
                                  cursor: "pointer",
                                  zIndex: 10,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  "&:hover": {
                                    bgcolor: getTaskTypeColor(
                                      task.loai_cong_viec
                                    ),
                                    opacity: 0.8,
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskClick(task, date);
                                }}
                              >
                                {" "}
                                <Typography
                                  className="task-block-title"
                                  variant="caption"
                                  sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    marginBottom: "2px",
                                    display: "none",
                                  }}
                                >
                                  {task.id}
                                </Typography>
                                <Typography
                                  className="task-block-title"
                                  variant="caption"
                                  sx={{
                                    color: "black",
                                    fontWeight: "bold",
                                    display: "block",
                                    overflowWrap: "break-word",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    lineHeight: 1.2,
                                    marginBottom: "2px",
                                  }}
                                >
                                  {task.ten_cong_viec}
                                </Typography>
                                <Typography
                                  className="task-block-time"
                                  variant="caption"
                                  sx={{
                                    color: "black",
                                    opacity: 0.9,
                                    fontSize: "0.65rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {task.thoi_gian_bat_dau &&
                                  task.thoi_gian_ket_thuc
                                    ? `${task.thoi_gian_bat_dau} - ${task.thoi_gian_ket_thuc}`
                                    : slot.label}
                                </Typography>
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Dialog xem chi tiết công việc */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết công việc</DialogTitle>
        <DialogContent>
          {viewingTask && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  {viewingTask.ten_cong_viec}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loại công việc:
                </Typography>
                <Chip
                  label={
                    taskTypes.find(
                      (t) => t.value === viewingTask.loai_cong_viec
                    )?.label
                  }
                  sx={{
                    bgcolor: getTaskTypeColor(viewingTask.loai_cong_viec),
                    color: "white",
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái:
                </Typography>
                <Chip
                  label={
                    statuses.find((s) => s.value === viewingTask.trang_thai)
                      ?.label
                  }
                  sx={{
                    bgcolor: getStatusColor(viewingTask.trang_thai),
                    color: "white",
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ưu tiên:
                </Typography>
                <Chip
                  label={
                    priorities.find((p) => p.value === viewingTask.uu_tien)
                      ?.label
                  }
                  sx={{
                    bgcolor: priorities.find(
                      (p) => p.value === viewingTask.uu_tien
                    )?.color,
                    color: "white",
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thời gian dự kiến:
                </Typography>
                <Typography variant="body1">
                  {viewingTask.thoi_gian_du_kien} ngày
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày bắt đầu:
                </Typography>
                <Typography variant="body1">
                  {viewingTask.ngay_bat_dau}
                  {viewingTask.thoi_gian_bat_dau &&
                    ` - ${viewingTask.thoi_gian_bat_dau}`}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày kết thúc:
                </Typography>
                <Typography variant="body1">
                  {viewingTask.ngay_ket_thuc}
                  {viewingTask.thoi_gian_ket_thuc &&
                    ` - ${viewingTask.thoi_gian_ket_thuc}`}
                </Typography>
              </Grid>

              {viewingTask.mo_ta && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả:
                  </Typography>
                  <Typography variant="body1">{viewingTask.mo_ta}</Typography>
                </Grid>
              )}

              {viewingTask.ghi_chu && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ghi chú:
                  </Typography>
                  <Typography variant="body1">{viewingTask.ghi_chu}</Typography>
                </Grid>
              )}

              {/* {viewingTask.ket_qua && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Kết quả:</Typography>
                  <Typography variant="body1">{viewingTask.ket_qua}</Typography>
                </Grid>
              )} */}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpen}>Đề xuất kĩ thuật</Button>
        </DialogActions>
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Đề xuất kĩ thuật</DialogTitle>
          <Button
            onClick={() => setOpen(true)}
            variant="contained"
            color="primary"
          >
            Đề xuất kĩ thuật
          </Button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Đề xuất kĩ thuật</DialogTitle>
            <DialogContent dividers>
              <TextField
                margin="dense"
                label="Mã lô trồng"
                name="ma_lo_trong"
                value={form.ma_lo_trong}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="dense"
                label="Nội dung"
                name="noi_dung"
                value={form.noi_dung}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
              <TextField
                margin="dense"
                label="Loại vấn đề"
                name="loai_van_de"
                value={form.loai_van_de}
                onChange={handleChange}
                fullWidth
                select
              >
                <MenuItem value="cay_trong">Cây trồng</MenuItem>
                <MenuItem value="thiet_bi">Thiết bị</MenuItem>
                <MenuItem value="thoi_tiet">Thời tiết</MenuItem>
                <MenuItem value="nhan_su">Nhân sự</MenuItem>
                <MenuItem value="khac">Khác</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="Ngày báo cáo"
                type="date"
                name="ngay_bao_cao"
                value={form.ngay_bao_cao}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                margin="dense"
                label="Mã nông dân"
                name="ma_nong_dan"
                value={form.ma_nong_dan}
                fullWidth
                InputProps={{ readOnly: true }}
                style={{ display: "none" }}
              />

              {/* ../../be_management/uploads/ */}
              <TextField
                margin="dense"
                type="file"
                inputProps={{ accept: "image/*" }}
                onChange={handleFileChange}
                fullWidth
              />
              {form.hinh_anh && (
                <Box mt={2}>
                  <img
                    src={form.hinh_anh}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                </Box>
              )}
              <TextField
                margin="dense"
                select
                label="Trạng thái"
                name="trang_thai"
                value={form.trang_thai}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="cho_xu_ly">Chưa xử lý</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="Ghi chú"
                name="ghi_chu"
                value={form.ghi_chu}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </DialogContent>
            <DialogActions>
              <Button color="error" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Gửi
              </Button>
            </DialogActions>
          </Dialog>
        </Dialog>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

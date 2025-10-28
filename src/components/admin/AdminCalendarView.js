import React, { useMemo, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Update as UpdateIcon,
  Add as AddIcon,
} from "@mui/icons-material";

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function AdminCalendarView({
  tasks = [],
  farmers = [],
  plans = [],
  onCreateTask,
  onUpdateTask,
  onDeleteRange,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [updating, setUpdating] = useState(false);
  const [filterFrom, setFilterFrom] = useState(""); // YYYY-MM-DD
  const [filterTo, setFilterTo] = useState("");
  const [filterPlan, setFilterPlan] = useState(""); // ma_ke_hoach
  const [conflictWarning, setConflictWarning] = useState("");

  // Khi chọn ngày lọc, điều hướng tuần hiển thị tới ngày bắt đầu lọc
  React.useEffect(() => {
    if (filterFrom) {
      const d = new Date(filterFrom);
      if (!isNaN(d.getTime())) {
        setCurrentDate(d);
        setSelectedDate(d);
      }
    }
  }, [filterFrom]);

  const taskTypes = [
    { value: "chuan_bi_dat", label: "Chuẩn bị đất", color: "#4caf50" },
    { value: "gieo_trong", label: "Gieo trồng", color: "#2196f3" },
    { value: "cham_soc", label: "Chăm sóc", color: "#ff9800" },
    { value: "tuoi_nuoc", label: "Tưới nước", color: "#00bcd4" },
    { value: "bon_phan", label: "Bón phân", color: "#9c27b0" },
    { value: "thu_hoach", label: "Thu hoạch", color: "#f44336" },
    { value: "khac", label: "Khác", color: "#795548" },
  ];

  const statuses = [
    { value: "chua_bat_dau", label: "Chưa bắt đầu", color: "#9e9e9e" },
    { value: "dang_thuc_hien", label: "Đang thực hiện", color: "#2196f3" },
    { value: "hoan_thanh", label: "Hoàn thành", color: "#4caf50" },
    { value: "bi_hoan", label: "Bị hoãn", color: "#f44336" },
  ];

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const timeSlots = Array.from({ length: 22 - 6 + 1 }).map((_, idx) => 6 + idx);

  // Hàm kiểm tra xung đột thời gian
  const checkTimeConflict = (
    workerIds,
    taskDate,
    startTime,
    endTime,
    excludeTaskId = null
  ) => {
    if (!Array.isArray(workerIds) || workerIds.length === 0) return [];

    const conflicts = [];
    const taskStart = startTime || "08:00";
    const taskEnd = endTime || "17:00";

    // Chuyển đổi thời gian thành phút để so sánh
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const taskStartMinutes = timeToMinutes(taskStart);
    const taskEndMinutes = timeToMinutes(taskEnd);

    // Kiểm tra tất cả tasks hiện có
    const allTasks = Array.isArray(tasks) ? tasks : [];

    for (const task of allTasks) {
      // Bỏ qua task hiện tại đang chỉnh sửa
      if (excludeTaskId && task.id === excludeTaskId) continue;

      // Kiểm tra cùng ngày
      if (task.ngay_bat_dau !== taskDate) continue;

      // Kiểm tra nhân công có trong danh sách được phân công không
      const taskWorkers = task.ma_nguoi_dung
        ? String(task.ma_nguoi_dung)
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

      const hasWorkerConflict = workerIds.some((workerId) =>
        taskWorkers.includes(String(workerId))
      );

      if (!hasWorkerConflict) continue;

      // Kiểm tra xung đột thời gian
      const existingStart = task.thoi_gian_bat_dau || "08:00";
      const existingEnd = task.thoi_gian_ket_thuc || "17:00";
      const existingStartMinutes = timeToMinutes(existingStart);
      const existingEndMinutes = timeToMinutes(existingEnd);

      // Kiểm tra xung đột: (start1 < end2) && (start2 < end1)
      const hasTimeConflict =
        taskStartMinutes < existingEndMinutes &&
        existingStartMinutes < taskEndMinutes;

      if (hasTimeConflict) {
        const conflictingWorkers = workerIds.filter((workerId) =>
          taskWorkers.includes(String(workerId))
        );

        conflicts.push({
          taskId: task.id,
          taskName: task.ten_cong_viec,
          conflictingWorkers,
          existingStart,
          existingEnd,
          newStart: taskStart,
          newEnd: taskEnd,
        });
      }
    }

    return conflicts;
  };

  const tasksByDate = useMemo(() => {
    const map = new Map();
    for (const d of weekDays) map.set(formatLocalDate(d), []);
    const filtered = (Array.isArray(tasks) ? tasks : []).filter((t) => {
      const d = t?.ngay_bat_dau ? String(t.ngay_bat_dau).slice(0, 10) : null;

      // Lọc theo ngày
      if (filterFrom && d && d < filterFrom) return false;
      if (filterTo && d && d > filterTo) return false;

      // Lọc theo kế hoạch sản xuất
      if (filterPlan && t?.ma_ke_hoach !== filterPlan) return false;

      return true;
    });
    for (const t of filtered) {
      if (!t || !t.ngay_bat_dau) continue;
      if (map.has(t.ngay_bat_dau)) map.get(t.ngay_bat_dau).push(t);
    }
    return map;
  }, [tasks, weekDays, filterFrom, filterTo, filterPlan]);

  const [form, setForm] = useState({
    ten_cong_viec: "",
    loai_cong_viec: "chuan_bi_dat",
    ngay_bat_dau: formatLocalDate(new Date()),
    thoi_gian_bat_dau: "",
    ngay_ket_thuc: formatLocalDate(new Date()),
    thoi_gian_ket_thuc: "",
    trang_thai: "chua_bat_dau",
    uu_tien: "trung_binh",
    ma_nguoi_dung: "",
    ghi_chu: "",
  });

  function openCreateFor(date) {
    setForm((prev) => ({
      ...prev,
      ngay_bat_dau: formatLocalDate(date),
      ngay_ket_thuc: formatLocalDate(date),
    }));
    setOpenCreate(true);
  }

  function formatHeader(date) {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
    });
  }

  const getBlockStyle = (task) => {
    const start = task.thoi_gian_bat_dau || "08:00";
    const end = task.thoi_gian_ket_thuc || "09:00";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const top = (sh - 6) * 60 + (sm / 60) * 60;
    const height = Math.max(eh * 60 + em - (sh * 60 + sm), 30) - 4;
    return { top: 2 + top, height };
  };

  // Hàm phân bổ vị trí cho nhiều tasks cùng thời gian
  const getTasksLayout = (tasks) => {
    if (!tasks.length) return [];

    // Sort tasks by start time
    const sortedTasks = [...tasks].sort((a, b) => {
      const timeA = a.thoi_gian_bat_dau || "08:00";
      const timeB = b.thoi_gian_bat_dau || "08:00";
      return timeA.localeCompare(timeB);
    });

    // Group overlapping tasks
    const columns = [];

    sortedTasks.forEach((task) => {
      const taskStart = task.thoi_gian_bat_dau || "08:00";
      const taskEnd = task.thoi_gian_ket_thuc || "09:00";
      const [tsh, tsm] = taskStart.split(":").map(Number);
      const [teh, tem] = taskEnd.split(":").map(Number);
      const taskStartTime = tsh * 60 + tsm;
      const taskEndTime = teh * 60 + tem;

      // Find a column where this task doesn't overlap
      let assignedColumn = -1;
      for (let col = 0; col < columns.length; col++) {
        const lastTaskInColumn = columns[col][columns[col].length - 1];
        if (lastTaskInColumn) {
          const lastEnd = lastTaskInColumn.thoi_gian_ket_thuc || "09:00";
          const [leh, lem] = lastEnd.split(":").map(Number);
          const lastEndTime = leh * 60 + lem;

          // If this task starts after the last task in this column ends
          if (taskStartTime >= lastEndTime) {
            assignedColumn = col;
            break;
          }
        }
      }

      // If no suitable column found, create a new one
      if (assignedColumn === -1) {
        assignedColumn = columns.length;
        columns.push([]);
      }

      columns[assignedColumn].push(task);
    });

    // Calculate layout for each task
    const layout = [];
    const totalColumns = columns.length;

    columns.forEach((column, colIndex) => {
      column.forEach((task) => {
        const style = getBlockStyle(task);
        const width = totalColumns > 1 ? `${100 / totalColumns}%` : "100%";
        const left =
          totalColumns > 1 ? `${(colIndex * 100) / totalColumns}%` : "0";

        layout.push({
          task,
          style: {
            ...style,
            width,
            left,
          },
        });
      });
    });

    return layout;
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f5f5f5" }}>
      {" "}
      {/* Sidebar */}{" "}
      <Paper
        sx={{
          width: 280,
          minWidth: 280,
          height: "100vh",
          overflow: "auto",
          borderRight: "1px solid #e0e0e0",
          borderRadius: 0,
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            {" "}
            Lịch làm việc{" "}
          </Typography>{" "}
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => openCreateFor(new Date())}
          >
            {" "}
            Thêm lịch làm việc{" "}
          </Button>{" "}
        </Box>
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            {" "}
            {currentDate.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}{" "}
          </Typography>{" "}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
            }}
          >
            {" "}
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <Typography
                key={d}
                variant="caption"
                sx={{ textAlign: "center", p: 0.5 }}
              >
                {" "}
                {d}{" "}
              </Typography>
            ))}{" "}
            {weekDays.map((d, idx) => (
              <Box
                key={idx}
                sx={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
                onClick={() => setSelectedDate(d)}
              >
                <Typography variant="caption"> {d.getDate()} </Typography>{" "}
              </Box>
            ))}{" "}
          </Box>{" "}
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            {" "}
            Loại công việc{" "}
          </Typography>{" "}
          <List dense>
            {" "}
            {taskTypes.map((t) => (
              <ListItem key={t.value} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Checkbox
                    defaultChecked
                    size="small"
                    sx={{ color: t.color, "&.Mui-checked": { color: t.color } }}
                  />{" "}
                </ListItemIcon>{" "}
                <ListItemText
                  primary={t.label}
                  primaryTypographyProps={{ variant: "body2" }}
                />{" "}
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: t.color,
                    ml: 1,
                  }}
                />{" "}
              </ListItem>
            ))}{" "}
          </List>{" "}
        </Box>{" "}
      </Paper>
      {/* Main Calendar */}{" "}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(new Date());
                }}
                variant="outlined"
                size="small"
              >
                {" "}
                Hôm nay{" "}
              </Button>{" "}
              <IconButton
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      currentDate.getDate() - 7
                    )
                  )
                }
              >
                {" "}
                <ChevronLeftIcon />{" "}
              </IconButton>{" "}
              <Typography
                variant="h6"
                sx={{ minWidth: 220, textAlign: "center" }}
              >
                {" "}
                {weekDays[0].toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                -{" "}
                {weekDays[6].toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
              </Typography>{" "}
              <IconButton
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      currentDate.getDate() + 7
                    )
                  )
                }
              >
                {" "}
                <ChevronRightIcon />{" "}
              </IconButton>{" "}
            </Box>{" "}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                type="date"
                size="small"
                label="Từ ngày"
                InputLabelProps={{ shrink: true }}
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
              />{" "}
              <TextField
                type="date"
                size="small"
                label="Đến ngày"
                InputLabelProps={{ shrink: true }}
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
              />{" "}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel> Kế hoạch sản xuất </InputLabel>{" "}
                <Select
                  label="Kế hoạch sản xuất"
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                >
                  <MenuItem value=""> Tất cả kế hoạch </MenuItem>{" "}
                  {plans.map((plan) => (
                    <MenuItem key={plan.ma_ke_hoach} value={plan.ma_ke_hoach}>
                      KH# {plan.ma_ke_hoach} - Lô {plan.ma_lo_trong} -{" "}
                      {plan.ten_giong || "Chưa xác định"} -{" "}
                      {plan.trang_thai === "chuan_bi"
                        ? "Chuẩn bị"
                        : plan.trang_thai === "dang_trong"
                          ? "Đang trồng"
                          : "Đã thu hoạch"}{" "}
                    </MenuItem>
                  ))}{" "}
                </Select>{" "}
              </FormControl>{" "}
              <Button
                size="small"
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                  setFilterPlan("");
                }}
              >
                {" "}
                Xóa lọc{" "}
              </Button>{" "}
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const month = currentDate.getMonth();
                  const year = currentDate.getFullYear();
                  const first = new Date(year, month, 1);
                  const last = new Date(year, month + 1, 0);
                  const inMonth = (Array.isArray(tasks) ? tasks : []).filter(
                    (t) => {
                      const d = t?.ngay_bat_dau
                        ? new Date(t.ngay_bat_dau)
                        : null;
                      return d && d >= first && d <= last;
                    }
                  );
                  const statusLabel = (v) =>
                    statuses.find((s) => s.value === v)?.label || v;
                  const typeLabel = (v) =>
                    taskTypes.find((s) => s.value === v)?.label || v;
                  const header = [
                    "Ngày bắt đầu",
                    "Giờ bắt đầu",
                    "Ngày kết thúc",
                    "Giờ kết thúc",
                    "Công việc",
                    "Loại",
                    "Trạng thái",
                    "Ưu tiên",
                    "Nhân công",
                    "Ghi chú",
                  ];
                  const rows = inMonth.map((t) => [
                    t.ngay_bat_dau || "",
                    t.thoi_gian_bat_dau || "",
                    t.ngay_ket_thuc || "",
                    t.thoi_gian_ket_thuc || "",
                    (t.ten_cong_viec || "").replaceAll("\n", " "),
                    typeLabel(t.loai_cong_viec),
                    statusLabel(t.trang_thai),
                    t.uu_tien || "",
                    t.ma_nguoi_dung || "",
                    (t.ghi_chu || "").replaceAll("\n", " "),
                  ]);
                  const toCsv = (arr) =>
                    arr
                      .map((r) =>
                        r
                          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
                          .join(",")
                      )
                      .join("\n");
                  const csv = [toCsv([header]), toCsv(rows)]
                    .filter(Boolean)
                    .join("\n");
                  const blob = new Blob(["\uFEFF" + csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `lich-lam-viec_${String(year)}-${String(month + 1).padStart(2, "0")}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                {" "}
                Xuất tháng{" "}
              </Button>{" "}
            </Box>{" "}
          </Box>{" "}
        </Paper>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ display: "flex", height: "100%" }}>
            {" "}
            {/* Time column */}{" "}
            <Box sx={{ width: 60, borderRight: "1px solid #e0e0e0" }}>
              <Box sx={{ height: 40, borderBottom: "1px solid #e0e0e0" }} />{" "}
              {timeSlots.map((h) => (
                <Box
                  key={h}
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
                    {" "}
                    {String(h).padStart(2, "0")}: 00{" "}
                  </Typography>{" "}
                </Box>
              ))}{" "}
            </Box>
            {/* Days */}{" "}
            {weekDays.map((date, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  borderRight: idx < 6 ? "1px solid #e0e0e0" : "none",
                }}
              >
                {" "}
                {/* Header */}{" "}
                <Box
                  sx={{
                    height: 40,
                    borderBottom: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      date.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight:
                        date.toDateString() === new Date().toDateString()
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {" "}
                    {formatHeader(date)}{" "}
                  </Typography>{" "}
                </Box>
                {/* Grid */}{" "}
                <Box sx={{ position: "relative", height: (22 - 6) * 60 }}>
                  {" "}
                  {timeSlots.map((h) => (
                    <Box
                      key={h}
                      sx={{
                        position: "absolute",
                        top: (h - 6) * 60,
                        left: 0,
                        right: 0,
                        height: 1,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    />
                  ))}{" "}
                  {(() => {
                    const dayTasks =
                      tasksByDate.get(formatLocalDate(date)) || [];
                    const tasksLayout = getTasksLayout(dayTasks);

                    return tasksLayout.map((taskInfo, i) => {
                      const { task, style } = taskInfo;

                      // Tạo màu sắc khác nhau cho từng task
                      const colors = [
                        { bg: "#90caf9", text: "#0d47a1" },
                        { bg: "#a5d6a7", text: "#1b5e20" },
                        { bg: "#ffcc80", text: "#e65100" },
                        { bg: "#f48fb1", text: "#880e4f" },
                        { bg: "#ce93d8", text: "#4a148c" },
                        { bg: "#80cbc4", text: "#004d40" },
                      ];
                      const colorIndex = i % colors.length;
                      const color = colors[colorIndex];

                      return (
                        <Box
                          key={`${task.id}-${i}`}
                          onClick={() => {
                            setViewingTask(task);
                            setOpenView(true);
                          }}
                          sx={{
                            position: "absolute",
                            left: style.left,
                            width: style.width,
                            top: style.top,
                            height: style.height,
                            bgcolor: color.bg,
                            color: color.text,
                            borderRadius: 1,
                            p: 0.5,
                            cursor: "pointer",
                            boxShadow: 1,
                            border: "1px solid rgba(255,255,255,0.3)",
                            "&:hover": {
                              boxShadow: 2,
                              transform: "scale(1.02)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: "0.7rem",
                            }}
                          >
                            {task.ten_cong_viec}{" "}
                          </Typography>{" "}
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.9,
                              fontSize: "0.65rem",
                              display: style.height > 40 ? "block" : "none",
                            }}
                          >
                            {task.thoi_gian_bat_dau || "08:00"} -{" "}
                            {task.thoi_gian_ket_thuc || "09:00"}{" "}
                          </Typography>{" "}
                        </Box>
                      );
                    });
                  })()}{" "}
                </Box>{" "}
                {/* Footer per day (đã bỏ nút Thêm) */}{" "}
                <Box sx={{ p: 1, textAlign: "right" }} />{" "}
              </Box>
            ))}{" "}
          </Box>{" "}
        </Box>{" "}
      </Box>
      {/* Create dialog (khôi phục) */}{" "}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle> Thêm công việc </DialogTitle>{" "}
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            label="Tên công việc"
            value={form.ten_cong_viec}
            onChange={(e) =>
              setForm({ ...form, ten_cong_viec: e.target.value })
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel> Loại công việc </InputLabel>{" "}
            <Select
              label="Loại công việc"
              value={form.loai_cong_viec}
              onChange={(e) =>
                setForm({ ...form, loai_cong_viec: e.target.value })
              }
            >
              {" "}
              {taskTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {" "}
                  {t.label}{" "}
                </MenuItem>
              ))}{" "}
            </Select>{" "}
          </FormControl>{" "}
          <TextField
            label="Ngày bắt đầu"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.ngay_bat_dau}
            onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
            fullWidth
          />
          <TextField
            label="Thời gian bắt đầu"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.thoi_gian_bat_dau}
            onChange={(e) =>
              setForm({ ...form, thoi_gian_bat_dau: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Ngày kết thúc"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.ngay_ket_thuc}
            onChange={(e) =>
              setForm({ ...form, ngay_ket_thuc: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Thời gian kết thúc"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={form.thoi_gian_ket_thuc}
            onChange={(e) =>
              setForm({ ...form, thoi_gian_ket_thuc: e.target.value })
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel> Trạng thái </InputLabel>{" "}
            <Select
              label="Trạng thái"
              value={form.trang_thai}
              onChange={(e) => setForm({ ...form, trang_thai: e.target.value })}
            >
              {" "}
              {statuses.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {" "}
                  {s.label}{" "}
                </MenuItem>
              ))}{" "}
            </Select>{" "}
          </FormControl>{" "}
          <TextField
            label="Ghi chú"
            value={form.ghi_chu}
            onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })}
            multiline
            minRows={2}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel> Nhân công </InputLabel>{" "}
            <Select
              label="Nhân công"
              value={form.ma_nguoi_dung}
              onChange={(e) =>
                setForm({ ...form, ma_nguoi_dung: e.target.value })
              }
            >
              {" "}
              {farmers.map((f) => (
                <MenuItem key={f.id} value={String(f.id)}>
                  {" "}
                  {f.full_name || `ID ${f.id}`}{" "}
                </MenuItem>
              ))}{" "}
            </Select>{" "}
          </FormControl>{" "}
        </DialogContent>{" "}
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}> Hủy </Button>{" "}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={async () => {
              try {
                await onCreateTask({ ...form });
                setSnackbar({
                  open: true,
                  message: "Tạo công việc thành công!",
                  severity: "success",
                });
                setOpenCreate(false);
              } catch (e) {
                setSnackbar({
                  open: true,
                  message: e.message,
                  severity: "error",
                });
              }
            }}
          >
            {" "}
            Tạo mới{" "}
          </Button>{" "}
        </DialogActions>{" "}
      </Dialog>
      {/* View dialog */}{" "}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle> Chi tiết công việc </DialogTitle>{" "}
        <DialogContent sx={{ pt: 1 }}>
          {" "}
          {viewingTask ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {" "}
                {viewingTask.ten_cong_viec}{" "}
              </Typography>{" "}
              <Typography variant="body2">
                {" "}
                {viewingTask.ngay_bat_dau}{" "}
                {viewingTask.thoi_gian_bat_dau &&
                  `- ${viewingTask.thoi_gian_bat_dau}`}{" "}
              </Typography>{" "}
              <Typography variant="body2">
                {" "}
                Đến: {viewingTask.ngay_ket_thuc}{" "}
                {viewingTask.thoi_gian_ket_thuc &&
                  `- ${viewingTask.thoi_gian_ket_thuc}`}{" "}
              </Typography>{" "}
              <Chip
                label={
                  taskTypes.find((t) => t.value === viewingTask.loai_cong_viec)
                    ?.label
                }
                sx={{
                  bgcolor: "#90caf9",
                  color: "#0d47a1",
                  width: "fit-content",
                }}
                size="small"
              />{" "}
              {(() => {
                const resolveNames = (idsStr) => {
                  if (!idsStr) return "-";
                  // Bỏ ND#4 khỏi hiển thị
                  const ids = String(idsStr)
                    .split(",")
                    .map((s) => s.trim())
                    .filter((id) => id && id !== "4");
                  if (ids.length === 0) return "-";
                  const names = ids.map((id) => {
                    const f = Array.isArray(farmers)
                      ? farmers.find(
                          (x) => String(x.ma_nguoi_dung || x.id) === String(id)
                        )
                      : null;
                    return f
                      ? f.ho_ten || f.full_name || `ND#${id}`
                      : `ND#${id}`;
                  });
                  return names.join(", ");
                };
                return (
                  <Typography variant="body2">
                    {" "}
                    Người phụ trách:{" "}
                    {resolveNames(viewingTask.ma_nguoi_dung)}{" "}
                  </Typography>
                );
              })()}{" "}
              {viewingTask.ghi_chu && (
                <Typography variant="body2">
                  {" "}
                  Ghi chú: {viewingTask.ghi_chu}{" "}
                </Typography>
              )}{" "}
            </Box>
          ) : (
            <Typography> Không có dữ liệu </Typography>
          )}{" "}
        </DialogContent>{" "}
        <DialogActions>
          <Button onClick={() => setOpenView(false)}> Đóng </Button>{" "}
          <Button
            variant="contained"
            startIcon={<UpdateIcon />}
            onClick={() => {
              const taskWithArrayWorkers = {
                ...viewingTask,
                ma_nguoi_dung: viewingTask.ma_nguoi_dung
                  ? typeof viewingTask.ma_nguoi_dung === "string"
                    ? viewingTask.ma_nguoi_dung
                        .split(",")
                        .map((id) => id.trim())
                        .filter(Boolean)
                    : viewingTask.ma_nguoi_dung
                  : [],
              };
              setSelectedTask(taskWithArrayWorkers);
              setOpenView(false);
              setOpenUpdate(true);
            }}
          >
            {" "}
            Cập nhật{" "}
          </Button>{" "}
        </DialogActions>{" "}
      </Dialog>
      {/* Update dialog */}{" "}
      <Dialog
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle> Cập nhật trạng thái </DialogTitle>{" "}
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel> Trạng thái </InputLabel>{" "}
            <Select
              label="Trạng thái"
              value={selectedTask?.trang_thai || "chua_bat_dau"}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, trang_thai: e.target.value })
              }
            >
              {" "}
              {statuses.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {" "}
                  {s.label}{" "}
                </MenuItem>
              ))}{" "}
            </Select>{" "}
          </FormControl>{" "}
          <FormControl fullWidth>
            <InputLabel> Nhân công </InputLabel>{" "}
            <Select
              label="Nhân công"
              value={selectedTask?.ma_nguoi_dung || ""}
              onChange={(e) => {
                const newWorkers = e.target.value;
                setSelectedTask({ ...selectedTask, ma_nguoi_dung: newWorkers });

                // Kiểm tra xung đột thời gian
                if (Array.isArray(newWorkers) && newWorkers.length > 0) {
                  const conflicts = checkTimeConflict(
                    newWorkers,
                    selectedTask?.ngay_bat_dau,
                    selectedTask?.thoi_gian_bat_dau,
                    selectedTask?.thoi_gian_ket_thuc,
                    selectedTask?.id
                  );

                  if (conflicts.length > 0) {
                    const conflictMessages = conflicts.map((conflict) => {
                      const workerNames = conflict.conflictingWorkers
                        .map((workerId) => {
                          const farmer = farmers.find(
                            (f) => String(f.id) === String(workerId)
                          );
                          return farmer
                            ? farmer.full_name ||
                                farmer.ho_ten ||
                                `ND#${workerId}`
                            : `ND#${workerId}`;
                        })
                        .join(", ");

                      return `${workerNames} đã có công việc "${conflict.taskName}" từ ${conflict.existingStart} đến ${conflict.existingEnd}`;
                    });

                    setConflictWarning(conflictMessages.join("; "));
                  } else {
                    setConflictWarning("");
                  }
                } else {
                  setConflictWarning("");
                }
              }}
              multiple
            >
              {farmers.map((farmer) => (
                <MenuItem key={farmer.id} value={String(farmer.id)}>
                  {" "}
                  {farmer.full_name ||
                    farmer.ho_ten ||
                    `Nông dân #${farmer.id}`}{" "}
                </MenuItem>
              ))}{" "}
            </Select>{" "}
          </FormControl>{" "}
          {conflictWarning && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {" "}
                ⚠️ <strong> Cảnh báo xung đột thời gian: </strong>
                <br /> {conflictWarning}{" "}
              </Typography>{" "}
            </Alert>
          )}{" "}
          <TextField
            label="Ghi chú"
            value={selectedTask?.ghi_chu || ""}
            onChange={(e) =>
              setSelectedTask({ ...selectedTask, ghi_chu: e.target.value })
            }
            multiline
            minRows={2}
            fullWidth
          />
        </DialogContent>{" "}
        <DialogActions>
          <Button
            onClick={() => {
              setOpenUpdate(false);
              setConflictWarning("");
            }}
          >
            {" "}
            Hủy{" "}
          </Button>{" "}
          <Button
            variant="contained"
            startIcon={
              updating ? <CircularProgress size={18} /> : <UpdateIcon />
            }
            disabled={updating || !!conflictWarning}
            onClick={async () => {
              if (conflictWarning) {
                setSnackbar({
                  open: true,
                  message:
                    "Không thể lưu do xung đột thời gian. Vui lòng chọn nhân công khác.",
                  severity: "error",
                });
                return;
              }

              try {
                setUpdating(true);
                const ma_nguoi_dung = Array.isArray(selectedTask.ma_nguoi_dung)
                  ? selectedTask.ma_nguoi_dung.join(",")
                  : selectedTask.ma_nguoi_dung;
                console.log(
                  "Updating task:",
                  selectedTask.id,
                  "with ma_nguoi_dung:",
                  ma_nguoi_dung
                );
                await onUpdateTask?.(selectedTask.id, {
                  trang_thai: selectedTask.trang_thai,
                  ghi_chu: selectedTask.ghi_chu,
                  ma_nguoi_dung: ma_nguoi_dung,
                });
                setOpenUpdate(false);
                setConflictWarning("");
                setSnackbar({
                  open: true,
                  message: "Cập nhật thành công!",
                  severity: "success",
                });
              } catch (e) {
                console.error("Update error:", e);
                setSnackbar({
                  open: true,
                  message: e.message,
                  severity: "error",
                });
              } finally {
                setUpdating(false);
              }
            }}
          >
            {conflictWarning ? "Có xung đột" : "Lưu"}{" "}
          </Button>{" "}
        </DialogActions>{" "}
      </Dialog>
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
          {" "}
          {snackbar.message}{" "}
        </Alert>{" "}
      </Snackbar>{" "}
    </Box>
  );
}

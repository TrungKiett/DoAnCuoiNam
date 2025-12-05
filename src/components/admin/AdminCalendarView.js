import React, { useMemo, useState, useEffect } from 'react';
import { deleteTask as apiDeleteTask, logTimesheet, lotsList } from '../../services/api';
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
    SnackbarContent,
    Alert,
    FormControl,
    InputLabel,
    Select,
    CircularProgress
} from '@mui/material';
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

// Convert any value (including RegExp/object) to a safe text node
const toDisplay = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number") return value;
  try {
    return String(value);
  } catch {
    return fallback;
  }
};

// Defensive sanitization for incoming props (tasks/farmers/plans)
const sanitizeTasks = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean).map((t) => ({
    ...t,
    id: toDisplay(t.id),
    ten_cong_viec: toDisplay(t.ten_cong_viec),
    thoi_gian_bat_dau: toDisplay(t.thoi_gian_bat_dau),
    thoi_gian_ket_thuc: toDisplay(t.thoi_gian_ket_thuc),
    ngay_bat_dau: toDisplay(t.ngay_bat_dau),
    ngay_ket_thuc: toDisplay(t.ngay_ket_thuc),
    ghi_chu: toDisplay(t.ghi_chu),
    loai_cong_viec: toDisplay(t.loai_cong_viec),
    trang_thai: toDisplay(t.trang_thai),
    ma_nguoi_dung: toDisplay(t.ma_nguoi_dung),
    uu_tien: toDisplay(t.uu_tien),
    ma_ke_hoach: toDisplay(t.ma_ke_hoach),
  }));
};

const sanitizeFarmers = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean).map((f) => ({
    ...f,
    id: toDisplay(f.id || f.ma_nguoi_dung),
    full_name: toDisplay(f.full_name || f.ho_ten),
    ho_ten: toDisplay(f.ho_ten),
    ma_nguoi_dung: toDisplay(f.ma_nguoi_dung),
  }));
};

const sanitizePlans = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean).map((p) => ({
    ...p,
    ma_ke_hoach: toDisplay(p.ma_ke_hoach),
    ma_lo_trong: toDisplay(p.ma_lo_trong),
    ten_giong: toDisplay(p.ten_giong),
    trang_thai: toDisplay(p.trang_thai),
  }));
};

export default function AdminCalendarView({ tasks = [], farmers = [], plans = [], onCreateTask, onUpdateTask, onDeleteRange }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [viewingTask, setViewingTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [updating, setUpdating] = useState(false);
    const [filterFrom, setFilterFrom] = useState(''); // YYYY-MM-DD
    const [filterTo, setFilterTo] = useState('');
    const [filterPlan, setFilterPlan] = useState(''); // ma_ke_hoach
    const [conflictWarning, setConflictWarning] = useState('');
    const [createConflictWarning, setCreateConflictWarning] = useState('');
    const [deletedTaskIds, setDeletedTaskIds] = useState(new Set());
    const [lots, setLots] = useState([]);
    const [availableWorkersDate, setAvailableWorkersDate] = useState(formatLocalDate(new Date()));
    const [availableWorkersShift, setAvailableWorkersShift] = useState('all'); // 'morning', 'afternoon', 'all'

  // Load danh sách lô khi component mount
  useEffect(() => {
    (async () => {
      try {
        const res = await lotsList();
        if (res?.success && Array.isArray(res.data)) {
          setLots(res.data.filter(Boolean));
        }
      } catch (e) {
        console.error('Error loading lots:', e);
      }
    })();
  }, []);

  // Sanitize incoming props once to avoid rendering non-serializable (e.g., RegExp)
  const safeTasks = useMemo(() => sanitizeTasks(tasks), [tasks]);
  const safeFarmers = useMemo(() => sanitizeFarmers(farmers), [farmers]);
  const safePlans = useMemo(() => sanitizePlans(plans), [plans]);

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

    // Kiểm tra tất cả tasks hiện có (đã được sanitize)
    const allTasks = Array.isArray(safeTasks) ? safeTasks : [];

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
        const filtered = (Array.isArray(tasks) ? tasks : []).filter(t => {
            const d = t?.ngay_bat_dau ? String(t.ngay_bat_dau).slice(0, 10) : null;

            // Bỏ qua các task đã bị xóa
            if (deletedTaskIds.has(t?.id)) return false;

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
    }, [tasks, weekDays, filterFrom, filterTo, filterPlan, deletedTaskIds]);

    const [form, setForm] = useState({
        ten_cong_viec: '',
        loai_cong_viec: 'chuan_bi_dat',
        ngay_bat_dau: formatLocalDate(new Date()),
        thoi_gian_bat_dau: '07:00',
        ngay_ket_thuc: formatLocalDate(new Date()),
        thoi_gian_ket_thuc: '11:00',
        timeSlot: 'morning',
        trang_thai: 'chua_bat_dau',
        uu_tien: 'trung_binh',
        ma_nguoi_dung: [],
        ma_lo_trong: '',
        ghi_chu: ''
    });

    React.useEffect(() => {
        const slots = {
            morning: { start: '07:00', end: '11:00' },
            afternoon: { start: '13:00', end: '17:00' },
            full: { start: '07:00', end: '17:00' }
        };
        const picked = slots[form.timeSlot] || slots.morning;
        if (form.thoi_gian_bat_dau !== picked.start || form.thoi_gian_ket_thuc !== picked.end) {
            setForm(prev => ({ ...prev, thoi_gian_bat_dau: picked.start, thoi_gian_ket_thuc: picked.end }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.timeSlot]);

    // Tự động kiểm tra lại xung đột khi ngày hoặc ca làm việc thay đổi
    React.useEffect(() => {
        if (form.ma_nguoi_dung && Array.isArray(form.ma_nguoi_dung) && form.ma_nguoi_dung.length > 0 && form.ngay_bat_dau) {
            const startTime = form.thoi_gian_bat_dau || '07:00';
            const endTime = form.thoi_gian_ket_thuc || '11:00';
            const conflicts = checkTimeConflict(
                form.ma_nguoi_dung,
                form.ngay_bat_dau,
                startTime,
                endTime
            );
            
            if (conflicts.length > 0) {
                const conflictMessages = conflicts.map(conflict => {
                    const workerNames = conflict.conflictingWorkers.map(workerId => {
                        const farmer = safeFarmers.find(f => String(f.id || f.ma_nguoi_dung) === String(workerId));
                        return farmer ? (farmer.full_name || farmer.ho_ten || `ND#${workerId}`) : `ND#${workerId}`;
                    }).join(', ');
                    return `${workerNames} đã có công việc "${toDisplay(conflict.taskName)}" từ ${conflict.existingStart} đến ${conflict.existingEnd}`;
                });
                setCreateConflictWarning(conflictMessages.join('; '));
            } else {
                setCreateConflictWarning('');
            }
        } else {
            setCreateConflictWarning('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.ngay_bat_dau, form.thoi_gian_bat_dau, form.thoi_gian_ket_thuc, form.ma_nguoi_dung]);

    // Hàm lấy danh sách nhân công rảnh trong khoảng thời gian
    const getAvailableWorkers = useMemo(() => {
        if (!form.ngay_bat_dau || !form.thoi_gian_bat_dau || !form.thoi_gian_ket_thuc) {
            return safeFarmers; // Nếu chưa chọn ngày/giờ thì hiển thị tất cả
        }

        const startTime = form.thoi_gian_bat_dau || '07:00';
        const endTime = form.thoi_gian_ket_thuc || '11:00';
        
        // Kiểm tra từng nhân công xem có rảnh không
        return safeFarmers.filter(farmer => {
            const workerId = String(farmer.id || farmer.ma_nguoi_dung);
            const conflicts = checkTimeConflict(
                [workerId],
                form.ngay_bat_dau,
                startTime,
                endTime
            );
            return conflicts.length === 0; // Rảnh nếu không có xung đột
        });
    }, [form.ngay_bat_dau, form.thoi_gian_bat_dau, form.thoi_gian_ket_thuc, safeFarmers, safeTasks]);

    // Danh sách nhân công rảnh theo ngày và ca đã chọn (để hiển thị ở sidebar)
    const availableWorkers = useMemo(() => {
        const selectedDate = availableWorkersDate || formatLocalDate(new Date());
        const morningStart = '07:00';
        const morningEnd = '11:00';
        const afternoonStart = '13:00';
        const afternoonEnd = '17:00';
        
        return safeFarmers.filter(farmer => {
            const workerId = String(farmer.id || farmer.ma_nguoi_dung);
            
            if (availableWorkersShift === 'morning') {
                // Chỉ kiểm tra ca sáng
                const morningConflicts = checkTimeConflict([workerId], selectedDate, morningStart, morningEnd);
                return morningConflicts.length === 0;
            } else if (availableWorkersShift === 'afternoon') {
                // Chỉ kiểm tra ca chiều
                const afternoonConflicts = checkTimeConflict([workerId], selectedDate, afternoonStart, afternoonEnd);
                return afternoonConflicts.length === 0;
            } else {
                // Kiểm tra cả ca sáng và ca chiều (cả ngày)
                const morningConflicts = checkTimeConflict([workerId], selectedDate, morningStart, morningEnd);
                const afternoonConflicts = checkTimeConflict([workerId], selectedDate, afternoonStart, afternoonEnd);
                return morningConflicts.length === 0 && afternoonConflicts.length === 0;
            }
        });
    }, [safeFarmers, safeTasks, availableWorkersDate, availableWorkersShift]);

  function openCreateFor(date) {
    setForm((prev) => ({
      ...prev,
      ngay_bat_dau: formatLocalDate(date),
      ngay_ket_thuc: formatLocalDate(date),
    }));
    setCreateConflictWarning('');
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
            column.forEach(task => {
                if (!task) return;
                const style = getBlockStyle(task) || {};
                const width = totalColumns > 1 ? `${100 / totalColumns}%` : '100%';
                const left = totalColumns > 1 ? `${(colIndex * 100) / totalColumns}%` : '0';

                const topVal = Number(style.top ?? 0);
                const heightVal = Number(style.height ?? 40);
                if (!isFinite(topVal) || !isFinite(heightVal)) return;

                layout.push({
                    task,
                    style: {
                        ...style,
                        width,
                        left,
                        top: topVal,
                        height: heightVal
                    }
                });
            });
        });

        return layout.filter(it => it && typeof it === 'object' && it.style && typeof it.style === 'object');
    };

    return ( <
            Box sx = {
                { display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }
            } > { /* Sidebar */ } <
            Paper sx = {
                { width: 280, minWidth: 280, height: '100vh', overflow: 'auto', borderRight: '1px solid #e0e0e0', borderRadius: 0 }
            } >
            <
            Box sx = {
                { p: 2, borderBottom: '1px solid #e0e0e0' }
            } >
            <
            Typography variant = "h6"
            sx = {
                { fontWeight: 'bold', mb: 1 }
            } > Lịch làm việc < /Typography> <
            Button startIcon = { < AddIcon / > }
            variant = "contained"
            size = "small"
            onClick = {
                () => openCreateFor(new Date())
            } > Thêm lịch làm việc < /Button> < /
            Box >

            <
            Box sx = {
                { p: 2, borderBottom: '1px solid #e0e0e0' }
            } >
            <
            Typography variant = "subtitle2"
            sx = {
                { mb: 1, fontWeight: 'bold' }
            } > { currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) } < /Typography> <
            Box sx = {
                { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }
            } > {
                ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => ( <
                    Typography key = { d }
                    variant = "caption"
                    sx = {
                        { textAlign: 'center', p: 0.5 }
                    } > { d } < /Typography>
                ))
            } {
                weekDays.map((d, idx) => ( <
                    Box key = { idx }
                    sx = {
                        { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }
                    }
                    onClick = {
                        () => setSelectedDate(d)
                    } >
                    <
                    Typography variant = "caption" > { d.getDate() } < /Typography> < /
                    Box >
                ))
            } <
            /Box> < /
            Box >

            <
            Box sx = {
                { p: 2 }
            } >
            <
            Typography variant = "subtitle2"
            sx = {
                { mb: 1.5, fontWeight: 'bold' }
            } > Nhân công rảnh < /Typography>
            
            <TextField 
                type="date"
                size="small"
                fullWidth
                label="Ngày"
                InputLabelProps={{ shrink: true }}
                value={availableWorkersDate}
                onChange={(e) => setAvailableWorkersDate(e.target.value)}
                sx={{ mb: 1.5 }}
            />
            
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>Ca làm việc</InputLabel>
                <Select 
                    label="Ca làm việc"
                    value={availableWorkersShift}
                    onChange={(e) => setAvailableWorkersShift(e.target.value)}
                >
                    <MenuItem value="morning">Ca sáng (07:00 - 11:00)</MenuItem>
                    <MenuItem value="afternoon">Ca chiều (13:00 - 17:00)</MenuItem>
                    <MenuItem value="all">Cả ngày</MenuItem>
                </Select>
            </FormControl>
            
            {
                availableWorkers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Không có nhân công rảnh
                    </Typography>
                ) : (
                    <List dense> {
                        availableWorkers.map((farmer) => ( <
                            ListItem key = { farmer.id || farmer.ma_nguoi_dung }
                            sx = {
                                { 
                                    px: 0,
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&:hover': { bgcolor: '#f5f5f5' }
                                }
                            }
                            onClick = {
                                () => {
                                    const selectedDateObj = availableWorkersDate ? new Date(availableWorkersDate) : new Date();
                                    const timeSlot = availableWorkersShift === 'afternoon' ? 'afternoon' : 
                                                    availableWorkersShift === 'all' ? 'full' : 'morning';
                                    const startTime = availableWorkersShift === 'afternoon' ? '13:00' : '07:00';
                                    const endTime = availableWorkersShift === 'afternoon' ? '17:00' : 
                                                   availableWorkersShift === 'all' ? '17:00' : '11:00';
                                    
                                    setForm({
                                        ten_cong_viec: '',
                                        loai_cong_viec: 'chuan_bi_dat',
                                        ngay_bat_dau: formatLocalDate(selectedDateObj),
                                        thoi_gian_bat_dau: startTime,
                                        ngay_ket_thuc: formatLocalDate(selectedDateObj),
                                        thoi_gian_ket_thuc: endTime,
                                        timeSlot: timeSlot,
                                        trang_thai: 'chua_bat_dau',
                                        uu_tien: 'trung_binh',
                                        ma_nguoi_dung: [String(farmer.id || farmer.ma_nguoi_dung)],
                                        ma_lo_trong: '',
                                        ghi_chu: ''
                                    });
                                    setCreateConflictWarning('');
                                    setOpenCreate(true);
                                }
                            } >
                            <
                            ListItemIcon sx = {
                                { minWidth: 32 }
                            } >
                            <
                            Box sx = {
                                { 
                                    width: 10, 
                                    height: 10, 
                                    borderRadius: '50%', 
                                    bgcolor: '#4caf50',
                                    border: '2px solid #4caf50'
                                }
                            }
                            /> < /
                            ListItemIcon > <
                            ListItemText 
                                primary = { farmer.full_name || farmer.ho_ten || `ND#${farmer.id || farmer.ma_nguoi_dung}` }
                                primaryTypographyProps = {
                                    { variant: 'body2', fontWeight: 500 }
                                }
                                secondary = { "Click để phân công" }
                                secondaryTypographyProps = {
                                    { variant: 'caption', fontSize: '0.7rem' }
                                }
                            /> < /
                            ListItem >
                        ))
                    } <
                    /List>
                )
            } < /
            Box > <
            /Paper>

            { /* Main Calendar */ } <
            Box sx = {
                { flex: 1, display: 'flex', flexDirection: 'column' }
            } >
            <
            Paper sx = {
                { p: 2, borderRadius: 0, borderBottom: '1px solid #e0e0e0' }
            } >
            <
            Box sx = {
                { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            } >
            <
            Box sx = {
                { display: 'flex', alignItems: 'center', gap: 2 }
            } >
            <
            Button startIcon = { < TodayIcon / > }
            onClick = {
                () => {
                    setCurrentDate(new Date());
                    setSelectedDate(new Date());
                }
            }
            variant = "outlined"
            size = "small" > Hôm nay < /Button> <
            IconButton onClick = {
                () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))
            } > < ChevronLeftIcon / > < /IconButton> <
            Typography variant = "h6"
            sx = {
                { minWidth: 220, textAlign: 'center' }
            } > { weekDays[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' }) } - { weekDays[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) } <
            /Typography> <
            IconButton onClick = {
                () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))
            } > < ChevronRightIcon / > < /IconButton> < /
            Box > <
            Box sx = {
                { display: 'flex', alignItems: 'center', gap: 1 }
            } >
            <
            TextField type = "date"
            size = "small"
            label = "Từ ngày"
            InputLabelProps = {
                { shrink: true }
            }
            value = { filterFrom }
            onChange = { e => setFilterFrom(e.target.value) }
            /> <
            TextField type = "date"
            size = "small"
            label = "Đến ngày"
            InputLabelProps = {
                { shrink: true }
            }
            value = { filterTo }
            onChange = { e => setFilterTo(e.target.value) }
            /> <
            FormControl size = "small"
            sx = {
                { minWidth: 200 }
            } >
            <
            InputLabel > Kế hoạch sản xuất < /InputLabel> <
            Select label = "Kế hoạch sản xuất"
            value = { filterPlan }
            onChange = { e => setFilterPlan(e.target.value) } >
            <
            MenuItem value = "" > Tất cả kế hoạch < /MenuItem> {
            plans.map(plan => ( <
                MenuItem key = { plan.ma_ke_hoach }
                value = { plan.ma_ke_hoach } >
                KH# { plan.ma_ke_hoach } - Lô { plan.ma_lo_trong } - { plan.ten_giong || 'Chưa xác định' } - { plan.trang_thai === 'chuan_bi' ? 'Chuẩn bị' : plan.trang_thai === 'dang_trong' ? 'Đang trồng' : 'Đã thu hoạch' } <
                /MenuItem>
            ))
        } <
        /Select> < /
    FormControl > <
        Button size = "small"
    onClick = {
        () => {
            setFilterFrom('');
            setFilterTo('');
            setFilterPlan('');
        }
    } > Xóa lọc < /Button> <
    Button variant = "outlined"
    size = "small"
    onClick = {
        () => {
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();
            const first = new Date(year, month, 1);
            const last = new Date(year, month + 1, 0);
            const inMonth = (Array.isArray(tasks) ? tasks : []).filter(t => {
                const d = t?.ngay_bat_dau ? new Date(t.ngay_bat_dau) : null;
                return d && d >= first && d <= last;
            });


            const statusLabel = (v) => (statuses.find(s => s.value === v)?.label || v);
            const typeLabel = (v) => (taskTypes.find(s => s.value === v)?.label || v);
            const header = ['Ngày bắt đầu', 'Giờ bắt đầu', 'Ngày kết thúc', 'Giờ kết thúc', 'Công việc', 'Loại', 'Trạng thái', 'Ưu tiên', 'Nhân công', 'Ghi chú'];
            const rows = inMonth.map(t => [
                t.ngay_bat_dau || '',
                t.thoi_gian_bat_dau || '',
                t.ngay_ket_thuc || '',
                t.thoi_gian_ket_thuc || '',
                (t.ten_cong_viec || '').replaceAll('\n', ' '),
                typeLabel(t.loai_cong_viec),
                statusLabel(t.trang_thai),
                t.uu_tien || '',
                t.ma_nguoi_dung || '',
                (t.ghi_chu || '').replaceAll('\n', ' ')
            ]);
            const toCsv = (arr) => arr.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
            const csv = [toCsv([header]), toCsv(rows)].filter(Boolean).join('\n');
            const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lich-lam-viec_${String(year)}-${String(month+1).padStart(2,'0')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } > Xuất tháng < /Button> < /
    Box > <
        /Box> < /
    Paper >

        <
        Box sx = {
            { flex: 1, overflow: 'auto' }
        } >
        <
        Box sx = {
            { display: 'flex', height: '100%' }
        } > { /* Time column */ } <
        Box sx = {
            { width: 60, borderRight: '1px solid #e0e0e0' }
        } >
        <
        Box sx = {
            { height: 40, borderBottom: '1px solid #e0e0e0' }
        }
    /> {
    timeSlots.map((h) => ( <
        Box key = { h }
        sx = {
            { height: 60, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', pt: 0.5, px: 1 }
        } >
        <
        Typography variant = "caption"
        color = "text.secondary" > { String(h).padStart(2, '0') }: 00 < /Typography> < /
        Box >
    ))
} <
/Box>

{ /* Days */ } {
    weekDays.map((date, idx) => ( <
        Box key = { idx }
        sx = {
            { flex: 1, borderRight: idx < 6 ? '1px solid #e0e0e0' : 'none' }
        } > { /* Header */ } <
        Box sx = {
            { height: 40, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: date.toDateString() === new Date().toDateString() ? '#e3f2fd' : 'white' }
        } >
        <
        Typography variant = "body2"
        sx = {
            { fontWeight: date.toDateString() === new Date().toDateString() ? 'bold' : 'normal' }
        } > { formatHeader(date) } < /Typography> < /
        Box >

        { /* Grid */ } <
        Box sx = {
            { position: 'relative', height: (22 - 6) * 60 }
        } > {
            timeSlots.map((h) => ( <
                Box key = { h }
                sx = {
                    { position: 'absolute', top: (h - 6) * 60, left: 0, right: 0, height: 1, borderTop: '1px solid #f0f0f0' }
                }
                />
            ))
        } {
            (() => {
                const dayTasks = tasksByDate.get(formatLocalDate(date)) || [];
                const tasksLayout = getTasksLayout(dayTasks);
                const safeLayout = (Array.isArray(tasksLayout) ? tasksLayout : []).filter(ti => ti && typeof ti === 'object' && ti.style && typeof ti.style === 'object');

                return safeLayout.map((taskInfo, i) => {
                    const { task, style } = taskInfo;

                    // Tạo màu sắc khác nhau cho từng task
                    const colors = [
                        { bg: '#90caf9', text: '#0d47a1' },
                        { bg: '#a5d6a7', text: '#1b5e20' },
                        { bg: '#ffcc80', text: '#e65100' },
                        { bg: '#f48fb1', text: '#880e4f' },
                        { bg: '#ce93d8', text: '#4a148c' },
                        { bg: '#80cbc4', text: '#004d40' }
                    ];
                    const colorIndex = i % colors.length;
                    const color = colors[colorIndex];

                    return ( <
                        Box key = { `${task?.id ?? i}` }
                        onClick = {
                            () => {
                                if (!task) return;
                                setViewingTask(task);
                                setOpenView(true);
                            }
                        }
                        sx = {
                            {
                                position: 'absolute',
                                left: (style && style.left) || 0,
                                width: (style && style.width) || '100%',
                                top: (style && style.top) || 0,
                                height: (style && style.height) || 40,
                                bgcolor: color.bg,
                                color: color.text,
                                borderRadius: 1,
                                p: 0.5,
                                cursor: 'pointer',
                                boxShadow: 1,
                                border: '1px solid rgba(255,255,255,0.3)',
                                '&:hover': {
                                    boxShadow: 2,
                                    transform: 'scale(1.02)'
                                },
                                transition: 'all 0.2s ease'
                            }
                        } >
                        <
                        Typography variant = "caption"
                        sx = {
                            {
                                fontWeight: 700,
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '0.7rem'
                            }
                        } > { task.ten_cong_viec } <
                        /Typography> <
                        Typography variant = "caption"
                        sx = {
                            {
                                opacity: 0.9,
                                fontSize: '0.65rem',
                                display: (style && style.height > 40) ? 'block' : 'none'
                            }
                        } > { task.thoi_gian_bat_dau || '08:00' } - { task.thoi_gian_ket_thuc || '09:00' } <
                        /Typography> < /
                        Box >
                    );
                });
            })()
        } <
        /Box> {/* Footer per day (đã bỏ nút Thêm) */} <
        Box sx = {
            { p: 1, textAlign: 'right' }
        }
        /> < /
        Box >
    ))
} <
/Box> < /
Box > <
    /Box>

{ /* Create dialog (khôi phục) */ } <
Dialog open = { openCreate }
TransitionComponent = { React.Fragment }
onClose = {
    () => setOpenCreate(false)
}
maxWidth = "sm"
fullWidth >
    <
    DialogTitle > Thêm công việc < /DialogTitle> <
DialogContent sx = {
        { display: 'grid', gap: 2, pt: 1 }
    } >
    <
    TextField label = "Tên công việc"
value = { form.ten_cong_viec }
onChange = {
    (e) => setForm({...form, ten_cong_viec: e.target.value })
}
fullWidth / >
    <
    FormControl fullWidth >
    <
    InputLabel > Loại công việc < /InputLabel> <
Select label = "Loại công việc"
value = { form.loai_cong_viec }
onChange = {
        (e) => setForm({...form, loai_cong_viec: e.target.value })
    } > {
        taskTypes.map(t => < MenuItem key = { t.value }
            value = { t.value } > { t.label } < /MenuItem>)} < /
            Select > <
            /FormControl> <
            TextField label = "Ngày bắt đầu"
            type = "date"
            InputLabelProps = {
                { shrink: true }
            }
            value = { form.ngay_bat_dau }
            inputProps = {
                { min: new Date().toISOString().slice(0, 10) }
            }
            helperText = "Ngày bắt đầu phải từ hôm nay trở đi"
            onChange = {
                (e) => setForm({...form, ngay_bat_dau: e.target.value })
            }
            fullWidth / >
            <
            TextField label = "Ngày kết thúc"
            type = "date"
            InputLabelProps = {
                { shrink: true }
            }
            value = { form.ngay_ket_thuc }
            onChange = {
                (e) => setForm({...form, ngay_ket_thuc: e.target.value })
            }
            fullWidth / >
            <
            FormControl fullWidth >
            <
            InputLabel > Ca làm việc < /InputLabel> <
            Select label = "Ca làm việc"
            value = { form.timeSlot }
            onChange = {
                (e) => setForm({...form, timeSlot: e.target.value })
            } >
            <
            MenuItem value = "morning" > Ca sáng (07:00 - 11:00) < /MenuItem> <
            MenuItem value = "afternoon" > Ca chiều (13:00 - 17:00) < /MenuItem> <
            MenuItem value = "full" > Cả ngày (07:00 - 17:00) < /MenuItem> <
            /Select> <
            /FormControl>
            <
            FormControl fullWidth >
            <
            InputLabel > Trạng thái < /InputLabel> <
            Select label = "Trạng thái"
            value = { form.trang_thai }
            onChange = {
                (e) => setForm({...form, trang_thai: e.target.value })
            } > {
                statuses.map(s => < MenuItem key = { s.value }
                    value = { s.value } > { s.label } < /MenuItem>)} < /
                    Select > <
                    /FormControl> <
                    FormControl fullWidth >
                    <
                    InputLabel > Lô < /InputLabel> <
                    Select label = "Lô"
                    value = { form.ma_lo_trong }
                    onChange = {
                        (e) => setForm({...form, ma_lo_trong: e.target.value })
                    } >
                    <
                    MenuItem value = "" > Chưa chọn < /MenuItem> {
                        lots.map(lot => (
                            <MenuItem key={lot.ma_lo_trong || lot.id} value={String(lot.ma_lo_trong || lot.id)}>
                                {lot.id || `Lô ${lot.ma_lo_trong || lot.id}`}
                            </MenuItem>
                        ))
                    } <
                    /Select> <
                    /FormControl> <
                    TextField label = "Ghi chú"
                    value = { form.ghi_chu }
                    onChange = {
                        (e) => setForm({...form, ghi_chu: e.target.value })
                    }
                    multiline minRows = { 2 }
                    fullWidth / >
            {
                form.ngay_bat_dau && form.thoi_gian_bat_dau && form.thoi_gian_ket_thuc && (
                    <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            📋 Nhân công rảnh: {getAvailableWorkers.length}/{safeFarmers.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {getAvailableWorkers.length > 0 
                                ? getAvailableWorkers.slice(0, 5).map(f => f.full_name || f.ho_ten || `ND#${f.id}`).join(', ') + (getAvailableWorkers.length > 5 ? '...' : '')
                                : 'Không có nhân công rảnh trong thời gian này'
                            }
                        </Typography>
                    </Box>
                )
            }
            <
            FormControl fullWidth >
            <
            InputLabel > Nhân công < /InputLabel> <
            Select label = "Nhân công"
            value = { form.ma_nguoi_dung }
            multiple
            renderValue = { (selected) => Array.isArray(selected) ? selected.join(', ') : selected }
            onChange = {
                (e) => {
                    const newWorkers = Array.isArray(e.target.value) ? e.target.value : [];
                    setForm({...form, ma_nguoi_dung: newWorkers });
                    
                    // Kiểm tra xung đột thời gian
                    if (newWorkers.length > 0 && form.ngay_bat_dau) {
                        const startTime = form.thoi_gian_bat_dau || '07:00';
                        const endTime = form.thoi_gian_ket_thuc || '11:00';
                        const conflicts = checkTimeConflict(
                            newWorkers,
                            form.ngay_bat_dau,
                            startTime,
                            endTime
                        );
                        
                        if (conflicts.length > 0) {
                            const conflictMessages = conflicts.map(conflict => {
                                const workerNames = conflict.conflictingWorkers.map(workerId => {
                                    const farmer = safeFarmers.find(f => String(f.id || f.ma_nguoi_dung) === String(workerId));
                                    return farmer ? (farmer.full_name || farmer.ho_ten || `ND#${workerId}`) : `ND#${workerId}`;
                                }).join(', ');
                                return `${workerNames} đã có công việc "${toDisplay(conflict.taskName)}" từ ${conflict.existingStart} đến ${conflict.existingEnd}`;
                            });
                            setCreateConflictWarning(conflictMessages.join('; '));
                        } else {
                            setCreateConflictWarning('');
                        }
                    } else {
                        setCreateConflictWarning('');
                    }
                }
            } > {
                        // Hiển thị nhân công rảnh trước
                        getAvailableWorkers.map(f => {
                            const isSelected = Array.isArray(form.ma_nguoi_dung) && form.ma_nguoi_dung.indexOf(String(f.id || f.ma_nguoi_dung)) > -1;
                            return (
                                <MenuItem key={f.id || f.ma_nguoi_dung} value={String(f.id || f.ma_nguoi_dung)}>
                                    <Checkbox checked={isSelected} />
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{f.full_name || f.ho_ten || `ND#${f.id || f.ma_nguoi_dung}`}</span>
                                                <Chip label="Rảnh" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                                            </Box>
                                        } 
                                    />
                                </MenuItem>
                            );
                        })
                    }
                    {
                        // Hiển thị nhân công bận sau
                        safeFarmers.filter(f => {
                            const workerId = String(f.id || f.ma_nguoi_dung);
                            return !getAvailableWorkers.some(af => String(af.id || af.ma_nguoi_dung) === workerId);
                        }).map(f => {
                            const isSelected = Array.isArray(form.ma_nguoi_dung) && form.ma_nguoi_dung.indexOf(String(f.id || f.ma_nguoi_dung)) > -1;
                            return (
                                <MenuItem key={f.id || f.ma_nguoi_dung} value={String(f.id || f.ma_nguoi_dung)} disabled={!isSelected}>
                                    <Checkbox checked={isSelected} />
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{f.full_name || f.ho_ten || `ND#${f.id || f.ma_nguoi_dung}`}</span>
                                                <Chip label="Bận" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                                            </Box>
                                        } 
                                    />
                                </MenuItem>
                            );
                        })
                    } 
            </Select> <
            /FormControl> {
                createConflictWarning && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            ⚠️ <strong>Cảnh báo xung đột thời gian:</strong><br/>
                            {toDisplay(createConflictWarning, '')}
                        </Typography>
                    </Alert>
                )
            } < /
                            DialogContent > <
                            DialogActions >
                            <
                            Button onClick = {
                                () => {
                                    setOpenCreate(false);
                                    setCreateConflictWarning('');
                                }
                            } > Hủy < /Button> <
                            Button variant = "contained"
                            startIcon = { < AddIcon / > }
                            disabled = { !!createConflictWarning }
                            onClick = {
                                async() => {
                                    if (createConflictWarning) {
                                        setSnackbar({ open: true, message: 'Không thể tạo công việc do xung đột thời gian. Vui lòng chọn nhân công khác.', severity: 'error' });
                                        return;
                                    }
                                    try {
                                        const base = {
                                            ten_cong_viec: form.ten_cong_viec,
                                            loai_cong_viec: form.loai_cong_viec,
                                            ngay_bat_dau: form.ngay_bat_dau,
                                            ngay_ket_thuc: form.ngay_ket_thuc,
                                            trang_thai: form.trang_thai,
                                            uu_tien: form.uu_tien,
                                            ma_nguoi_dung: form.ma_nguoi_dung,
                                            ma_lo_trong: form.ma_lo_trong || null,
                                            ghi_chu: form.ghi_chu
                                        };

                                        if (form.timeSlot === 'full') {
                                            // Tạo 2 ca: sáng và chiều (nghỉ trưa)
                                            const ma_nguoi_dung = Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.join(',') : (form.ma_nguoi_dung || '');
                                            const morning = { ...base, ma_nguoi_dung, thoi_gian_bat_dau: '07:00', thoi_gian_ket_thuc: '11:00' };
                                            const afternoon = { ...base, ma_nguoi_dung, thoi_gian_bat_dau: '13:00', thoi_gian_ket_thuc: '17:00' };
                                            if (onCreateTask) {
                                                await onCreateTask(morning);
                                                await onCreateTask(afternoon);
                                            }
                                        } else if (form.timeSlot === 'afternoon') {
                                            const payload = { ...base, ma_nguoi_dung: Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.join(',') : form.ma_nguoi_dung, thoi_gian_bat_dau: '13:00', thoi_gian_ket_thuc: '17:00' };
                                            if (onCreateTask) await onCreateTask(payload);
                                        } else { // morning mặc định
                                            const payload = { ...base, ma_nguoi_dung: Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.join(',') : form.ma_nguoi_dung, thoi_gian_bat_dau: '07:00', thoi_gian_ket_thuc: '11:00' };
                                            if (onCreateTask) await onCreateTask(payload);
                                        }

                                        setSnackbar({ open: true, message: 'Tạo công việc thành công!', severity: 'success' });
                                        setCreateConflictWarning('');
                                        setOpenCreate(false);
                                    } catch (e) { setSnackbar({ open: true, message: e.message, severity: 'error' }); }
                                }
                            } > Tạo mới < /Button> < /
                            DialogActions > <
                            /Dialog>

                            { /* View dialog */ } <
Dialog open = { openView }
TransitionComponent = { React.Fragment }
                            onClose = {
                                () => setOpenView(false)
                            }
                            maxWidth = "sm"
                            fullWidth >
                            <
                            DialogTitle > Chi tiết công việc < /DialogTitle> <
                            DialogContent sx = {
                                { pt: 1 }
                            } > {
                                viewingTask ? ( <
                                    Box sx = {
                                        { display: 'grid', gap: 1.5 }
                                    } >
                                    <
                                    Typography variant = "h6"
                                    sx = {
                                        { fontWeight: 700 }
                                    } > { viewingTask.ten_cong_viec } < /Typography> <
                                    Typography variant = "body2" > { viewingTask.ngay_bat_dau } { viewingTask.thoi_gian_bat_dau && `- ${viewingTask.thoi_gian_bat_dau}` } < /Typography> <
                                    Typography variant = "body2" > Đến: { viewingTask.ngay_ket_thuc } { viewingTask.thoi_gian_ket_thuc && `- ${viewingTask.thoi_gian_ket_thuc}` } < /Typography> <
                                    Chip label = { taskTypes.find(t => t.value === viewingTask.loai_cong_viec)?.label }
                                    sx = {
                                        { bgcolor: '#90caf9', color: '#0d47a1', width: 'fit-content' }
                                    }
                                    size = "small" / > {
                                        (() => {
                                            // Tìm thông tin lô
                                            const lotInfo = viewingTask.ma_lo_trong ? 
                                                (Array.isArray(lots) ? lots.find(l => String(l.ma_lo_trong || l.id) === String(viewingTask.ma_lo_trong)) : null) : null;
                                            
                                            // Tìm thông tin kế hoạch
                                            const planInfo = viewingTask.ma_ke_hoach ? 
                                                (Array.isArray(safePlans) ? safePlans.find(p => String(p.ma_ke_hoach) === String(viewingTask.ma_ke_hoach)) : null) : null;
                                            
                                            return (
                                                <>
                                                    {lotInfo && (
                                                        <Typography variant="body2">
                                                            Lô: {toDisplay(lotInfo.ten_lo || lotInfo.ma_lo_trong || viewingTask.ma_lo_trong)}
                                                        </Typography>
                                                    )}
                                                    {planInfo && (
                                                        <Typography variant="body2">
                                                            Kế hoạch: KH#{toDisplay(planInfo.ma_ke_hoach)} - {toDisplay(planInfo.ten_giong || 'Chưa xác định')}
                                                        </Typography>
                                                    )}
                                                </>
                                            );
                                        })()
                                    } {
                                        (() => {
                                            const resolveNames = (idsStr) => {
                                                if (!idsStr) return '-';
                                                // Bỏ ND#4 khỏi hiển thị
                                                const ids = String(idsStr).split(',').map(s => s.trim()).filter(id => id && id !== '4');
                                                if (ids.length === 0) return '-';
                                                const names = ids.map(id => {
                                                    const f = Array.isArray(farmers) ? farmers.find(x => String(x.ma_nguoi_dung || x.id) === String(id)) : null;
                                                    return f ? (f.ho_ten || f.full_name || `ND#${id}`) : `ND#${id}`;
                                                });
                                                return names.join(', ');
                                            };
                                            return ( <
                                                Typography variant = "body2" > Người phụ trách: { resolveNames(viewingTask.ma_nguoi_dung) } < /Typography>
                                            );
                                        })()
                                    } {
                                        viewingTask.ghi_chu && < Typography variant = "body2" > Ghi chú: { viewingTask.ghi_chu } < /Typography>} < /
                                        Box >
                                    ): < Typography > Không có dữ liệu < /Typography>} < /
                                    DialogContent > <
                                    DialogActions >
                                    <
                                    Button onClick = { () => setOpenView(false) } > Đóng < /Button>
                                    <
                                    Button color = "success"
                                    onClick = { async () => {
                                        try {
                                            if (!viewingTask) throw new Error('Thiếu dữ liệu công việc');
                                            const start = String(viewingTask.thoi_gian_bat_dau || '').slice(0,5);
                                            const end = String(viewingTask.thoi_gian_ket_thuc || '').slice(0,5);
                                            const [sh, sm] = (start || '07:00').split(':').map(Number);
                                            const [eh, em] = (end || '11:00').split(':').map(Number);
                                            const hours = Math.max(0, (eh + em/60) - (sh + sm/60));
                                            const date = String(viewingTask.ngay_bat_dau || '').slice(0,10);
                                            const assignees = String(viewingTask.ma_nguoi_dung || '').split(',').map(s => s.trim()).filter(Boolean);
                                            for (const wid of assignees) {
                                                await logTimesheet({ worker_id: Number(wid), date, hours, task_id: viewingTask.id });
                                            }
                                            setSnackbar({ open: true, message: `Đã chấm công ${hours}h cho ${assignees.length} nhân công`, severity: 'success' });
                                        } catch (e) {
                                            setSnackbar({ open: true, message: e.message || 'Chấm công thất bại', severity: 'error' });
                                        }
                                    }} > Chấm công < /Button>
                                    <
                                    Button color = "error"
                                    onClick = { async () => {
                                        try {
                                            if (!viewingTask || viewingTask.id == null) throw new Error('Thiếu ID công việc');
                                            await apiDeleteTask(viewingTask.id);
                                            setDeletedTaskIds(prev => new Set([...prev, viewingTask.id]));
                                            setSnackbar({ open: true, message: 'Đã xóa công việc', severity: 'success' });
                                            setOpenView(false);
                                        } catch (e) {
                                            setSnackbar({ open: true, message: e.message || 'Xóa thất bại', severity: 'error' });
                                        }
                                    }} > Xóa < /Button>
                                    <
                                    Button variant = "contained"
                                    startIcon = { < UpdateIcon / > }
                                    onClick = {
                                        () => {
                                            const taskWithArrayWorkers = {
                                                ...viewingTask,
                                                ma_nguoi_dung: viewingTask.ma_nguoi_dung ?
                                                    (typeof viewingTask.ma_nguoi_dung === 'string' ?
                                                        viewingTask.ma_nguoi_dung.split(',').map(id => id.trim()).filter(Boolean) :
                                                        viewingTask.ma_nguoi_dung) : []
                                            };
                                            setSelectedTask(taskWithArrayWorkers);
                                            setOpenView(false);
                                            setOpenUpdate(true);
                                        }
                                    } > Cập nhật < /Button> < /
                                    DialogActions > <
                                    /Dialog>

                                    { /* Update dialog */ } <
Dialog open = { openUpdate }
TransitionComponent = { React.Fragment }
                                    onClose = {
                                        () => setOpenUpdate(false)
                                    }
                                    maxWidth = "sm"
                                    fullWidth >
                                    <
                                    DialogTitle > Cập nhật trạng thái < /DialogTitle> <
                                    DialogContent sx = {
                                        { display: 'grid', gap: 2, pt: 1 }
                                    } >
                                    <
                                    FormControl fullWidth >
                                    <
                                    InputLabel > Trạng thái < /InputLabel> <
                                    Select label = "Trạng thái"
                                    value = { selectedTask?.trang_thai || 'chua_bat_dau' }
                                    onChange = {
                                        (e) => setSelectedTask({...selectedTask, trang_thai: e.target.value })
                                    } > {
                                        statuses.map(s => < MenuItem key = { s.value }
                                            value = { s.value } > { s.label } < /MenuItem>)} < /
                                            Select > <
                                            /FormControl> <
                                            FormControl fullWidth >
                                            <
                                            InputLabel > Nhân công < /InputLabel> <
                                            Select label = "Nhân công"
                                            value = { selectedTask?.ma_nguoi_dung || '' }
                                            onChange = {
                                                (e) => {
                                                    const newWorkers = e.target.value;
                                                    setSelectedTask({...selectedTask, ma_nguoi_dung: newWorkers });

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
                                                            const conflictMessages = conflicts.map(conflict => {
                                                                const workerNames = conflict.conflictingWorkers.map(workerId => {
                                                                    const farmer = farmers.find(f => String(f.id) === String(workerId));
                                                                    return farmer ? (farmer.full_name || farmer.ho_ten || `ND#${workerId}`) : `ND#${workerId}`;
                                                                }).join(', ');

                                                                return `${workerNames} đã có công việc "${conflict.taskName}" từ ${conflict.existingStart} đến ${conflict.existingEnd}`;
                                                            });

                                                            setConflictWarning(conflictMessages.join('; '));
                                                        } else {
                                                            setConflictWarning('');
                                                        }
                                                    } else {
                                                        setConflictWarning('');
                                                    }
                                                }
                                            }
                                            multiple > {
                                                farmers.map(farmer => ( <
                                                    MenuItem key = { farmer.id }
                                                    value = { String(farmer.id) } > { farmer.full_name || farmer.ho_ten || `Nông dân #${farmer.id}` } <
                                                    /MenuItem>
                                                ))
                                            } <
                                            /Select> < /
                                            FormControl > {
                                                conflictWarning && ( <
                                                    Alert severity = "warning"
                                                    sx = {
                                                        { mt: 1 }
                                                    } >
                                                    <
                                                    Typography variant = "body2" > ⚠️ < strong > Cảnh báo xung đột thời gian: < /strong><br/ > { conflictWarning } <
                                                    /Typography> < /
                                                    Alert >
                                                )
                                            } <
                                            TextField label = "Ghi chú"
                                            value = { selectedTask?.ghi_chu || '' }
                                            onChange = {
                                                (e) => setSelectedTask({...selectedTask, ghi_chu: e.target.value })
                                            }
                                            multiline minRows = { 2 }
                                            fullWidth / >
                                            <
                                            /DialogContent> <
                                            DialogActions >
                                            <
                                            Button onClick = {
                                                () => {
                                                    setOpenUpdate(false);
                                                    setConflictWarning('');
                                                }
                                            } > Hủy < /Button> <
                                            Button variant = "contained"
                                            startIcon = { updating ? < CircularProgress size = { 18 } /> : <UpdateIcon / > }
                                            disabled = { updating || !!conflictWarning }
                                            onClick = {
                                                async() => {
                                                    if (conflictWarning) {
                                                        setSnackbar({ open: true, message: 'Không thể lưu do xung đột thời gian. Vui lòng chọn nhân công khác.', severity: 'error' });
                                                        return;
                                                    }

                                                    try {
                                                        setUpdating(true);
                                                        const ma_nguoi_dung = Array.isArray(selectedTask.ma_nguoi_dung) ? selectedTask.ma_nguoi_dung.join(',') : selectedTask.ma_nguoi_dung;
                                                        console.log('Updating task:', selectedTask.id, 'with ma_nguoi_dung:', ma_nguoi_dung);
                                                        await onUpdateTask?.(selectedTask.id, { trang_thai: selectedTask.trang_thai, ghi_chu: selectedTask.ghi_chu, ma_nguoi_dung: ma_nguoi_dung });
                                                        setOpenUpdate(false);
                                                        setConflictWarning('');
                                                        setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' });
                                                    } catch (e) {
                                                        console.error('Update error:', e);
                                                        setSnackbar({ open: true, message: e.message, severity: 'error' });
                                                    } finally {
                                                        setUpdating(false);
                                                    }
                                                }
                                            } > { conflictWarning ? 'Có xung đột' : 'Lưu' } <
                                            /Button> < /
                                            DialogActions > <
                                            /Dialog>

                                            <
Snackbar open = { snackbar.open }
TransitionComponent = { React.Fragment }
                                            autoHideDuration = { 3000 }
                                            onClose = {
                                                () => setSnackbar({...snackbar, open: false })
                                            }
                                            anchorOrigin = {
                                                { vertical: 'bottom', horizontal: 'right' }
                                            } >
                                            <
                                            Alert onClose = {
                                                () => setSnackbar({...snackbar, open: false })
                                            }
                                            severity = { snackbar.severity }
                                            sx = {
                                                { width: '100%' }
                                            } > { snackbar.message } < /Alert> < /
                                            Snackbar > <
                                            /Box>
                                        );
                                    }
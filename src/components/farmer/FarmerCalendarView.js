import React, { useState, useEffect } from 'react';
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
    CircularProgress
} from '@mui/material';
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
    Update as UpdateIcon
} from '@mui/icons-material';

export default function FarmerCalendarView({ 
    tasks = [], 
    farmerInfo = null,
    onUpdateTask
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [updateForm, setUpdateForm] = useState({
        trang_thai: '',
        ket_qua: '',
        ghi_chu: ''
    });
    const [updating, setUpdating] = useState(false);

    const taskTypes = [
        { value: 'chuan_bi_dat', label: 'Chuẩn bị đất', color: '#4caf50' },
        { value: 'gieo_trong', label: 'Gieo trồng', color: '#2196f3' },
        { value: 'cham_soc', label: 'Chăm sóc', color: '#ff9800' },
        { value: 'tuoi_nuoc', label: 'Tưới nước', color: '#00bcd4' },
        { value: 'bon_phan', label: 'Bón phân', color: '#9c27b0' },
        { value: 'thu_hoach', label: 'Thu hoạch', color: '#f44336' },
        { value: 'khac', label: 'Khác', color: '#795548' }
    ];

    const priorities = [
        { value: 'thap', label: 'Thấp', color: '#4caf50' },
        { value: 'trung_binh', label: 'Trung bình', color: '#ff9800' },
        { value: 'cao', label: 'Cao', color: '#f44336' },
        { value: 'khan_cap', label: 'Khẩn cấp', color: '#e91e63' }
    ];

    const statuses = [
        { value: 'chua_lam', label: 'Chưa làm', color: '#9e9e9e' },
        { value: 'dang_lam', label: 'Đang làm', color: '#2196f3' },
        { value: 'hoan_thanh', label: 'Hoàn thành', color: '#4caf50' },
        { value: 'bao_loi', label: 'Báo lỗi', color: '#f44336' }
    ];

    // Format Date to local YYYY-MM-DD to avoid UTC shifting issues
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
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
            label: `${hour.toString().padStart(2, '0')}:00`,
            endLabel: `${(hour + 1).toString().padStart(2, '0')}:00`
        });
    }

    // Lấy công việc cho ngày cụ thể
    const getTasksForDate = (date) => {
        if (!date) return [];
        const dateStr = formatLocalDate(date);
        return tasks.filter(task => 
            task.ngay_bat_dau === dateStr || 
            (task.ngay_ket_thuc && task.ngay_ket_thuc >= dateStr && task.ngay_bat_dau <= dateStr)
        );
    };

    // Lấy công việc cho slot thời gian cụ thể
    const getTasksForTimeSlot = (date, hour) => {
        const dayTasks = getTasksForDate(date);
        return dayTasks.filter((task) => {
            if (!task) return false;
            if (task.thoi_gian_bat_dau) {
                const taskStartHour = parseInt(task.thoi_gian_bat_dau.split(':')[0]);
                return taskStartHour === hour;
            } else {
                const taskIndex = dayTasks.indexOf(task);
                const taskHour = 8 + (taskIndex * 2) % 12; // Từ 8h đến 20h
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
                height: 60
            };
        }

        const startTime = task.thoi_gian_bat_dau.split(':');
        const endTime = task.thoi_gian_ket_thuc.split(':');
        
        const startHour = parseInt(startTime[0]);
        const startMinute = parseInt(startTime[1]);
        const endHour = parseInt(endTime[0]);
        const endMinute = parseInt(endTime[1]);
        
        // Tính độ dài công việc theo giờ
        const duration = (endHour - startHour) + (endMinute - startMinute) / 60;
        
        // Mỗi slot = 1 giờ, mỗi slot cao 60px
        const height = Math.max(duration * 60, 30); // Tối thiểu 30px
        
        return {
            startHour,
            startMinute,
            duration,
            height
        };
    };

    // Định dạng ngày
    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });
    };

    // Định dạng ngày cho mini calendar
    const formatMiniDate = (date) => {
        return date.getDate();
    };

    // Lấy màu cho loại công việc
    const getTaskTypeColor = (type) => {
        const taskType = taskTypes.find(t => t.value === type);
        return taskType?.color || '#9e9e9e';
    };

    // Lấy màu cho trạng thái
    const getStatusColor = (status) => {
        const statusOption = statuses.find(s => s.value === status);
        return statusOption?.color || '#9e9e9e';
    };

    // Kiểm tra xem có thể cập nhật công việc không
    const canUpdateTask = (task) => {
        if (!task || !task.ngay_bat_dau || !task.ngay_ket_thuc) {
            return false;
        }
        const today = new Date().toISOString().split('T')[0];
        // Chỉ cho phép cập nhật khi đã đến đúng ngày bắt đầu (không phải trước đó)
        return task.ngay_bat_dau === today;
    };

    // Xử lý click vào công việc
    const handleTaskClick = (task) => {
        setViewingTask(task);
        setOpenViewDialog(true);
    };

    // Xử lý cập nhật trạng thái
    const handleUpdateTask = (task) => {
        setSelectedTask(task);
        setUpdateForm({
            trang_thai: task.trang_thai,
            ket_qua: task.ket_qua || '',
            ghi_chu: task.ghi_chu || ''
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
                setSnackbar({ open: true, message: 'Cập nhật trạng thái thành công!', severity: 'success' });
            }
            setOpenUpdateDialog(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
            setSnackbar({ open: true, message: 'Lỗi khi cập nhật: ' + error.message, severity: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    // Điều hướng tuần
    const navigateWeek = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction * 7));
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
        const today = new Date().toISOString().split('T')[0];
        const dateStr = formatLocalDate(date);
        
        return {
            total: dayTasks.length,
            completed: dayTasks.filter(t => t && t.trang_thai === 'hoan_thanh').length,
            inProgress: dayTasks.filter(t => t && t.trang_thai === 'dang_lam').length,
            pending: dayTasks.filter(t => t && t.trang_thai === 'chua_lam').length,
            isToday: dateStr === today,
            isPast: dateStr < today,
            isFuture: dateStr > today
        };
    };

    const getUpdateStatusMessage = (task) => {
        if (!task || !task.ngay_bat_dau || !task.ngay_ket_thuc) {
            return 'Không thể cập nhật';
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        if (today < task.ngay_bat_dau) {
            const startDate = new Date(task.ngay_bat_dau);
            const todayDate = new Date();
            const diffTime = startDate.getTime() - todayDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Có thể cập nhật từ ngày mai';
            if (diffDays > 1) return `Có thể cập nhật sau ${diffDays} ngày nữa`;
            return 'Chưa đến ngày làm việc';
        } else if (today > task.ngay_bat_dau) {
            return 'Đã qua ngày bắt đầu';
        } else if (today === task.ngay_bat_dau) {
            return 'Có thể cập nhật ngay bây giờ';
        } else {
            return 'Không thể cập nhật';
        }
    };

    return (
        <Box className="calendar-weekly-container" sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Sidebar bên trái */}
            <Paper 
                className="calendar-sidebar"
                sx={{ 
                    width: 280, 
                    minWidth: 280,
                    height: '100vh',
                    overflow: 'auto',
                    borderRadius: 0,
                    borderRight: '1px solid #e0e0e0'
                }}
            >
                {/* Header sidebar */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <MenuIcon />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Lịch làm việc
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Chào mừng, {farmerInfo?.full_name || 'Nông dân'}!
                    </Typography>
                </Box>

                {/* Mini Calendar */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                            <Typography key={day} variant="caption" sx={{ textAlign: 'center', p: 0.5 }}>
                                {day}
                            </Typography>
                        ))}
                        {getWeekDates(currentDate).map((date, index) => {
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const stats = getDayStats(date);
                            
                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        bgcolor: isSelected ? '#1976d2' : isToday ? '#ff9800' : 'transparent',
                                        color: isSelected || isToday ? 'white' : 'text.primary',
                                        '&:hover': { bgcolor: isSelected ? '#1976d2' : '#f5f5f5' },
                                        position: 'relative'
                                    }}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <Typography variant="caption">
                                        {formatMiniDate(date)}
                                    </Typography>
                                    {stats.total > 0 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -2,
                                                right: -2,
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: stats.completed === stats.total ? '#4caf50' : '#ff9800'
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Thống kê tuần */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
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
                            <Typography variant="body2" color="success.main">Hoàn thành:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                {weekDates.reduce((sum, date) => sum + getDayStats(date).completed, 0)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="warning.main">Đang làm:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="warning.main">
                                {weekDates.reduce((sum, date) => sum + getDayStats(date).inProgress, 0)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Danh sách loại công việc */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Loại công việc
                    </Typography>
                    <List dense>
                        {taskTypes.map((type) => (
                            <ListItem key={type.value} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Checkbox 
                                        defaultChecked 
                                        size="small"
                                        sx={{ 
                                            color: type.color,
                                            '&.Mui-checked': { color: type.color }
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={type.label}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                                <Box 
                                    sx={{ 
                                        width: 12, 
                                        height: 12, 
                                        borderRadius: '50%', 
                                        bgcolor: type.color,
                                        ml: 1
                                    }} 
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Paper>

            {/* Main Calendar Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header Calendar */}
                <Paper sx={{ p: 2, borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                                {weekDates[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })} - {weekDates[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Typography>
                            <Tooltip title="Tuần sau">
                                <IconButton onClick={() => navigateWeek(1)}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button variant="outlined" size="small">
                                Tuần
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* Calendar Grid */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', height: '100%' }}>
                        {/* Time column */}
                        <Box sx={{ width: 60, borderRight: '1px solid #e0e0e0' }}>
                            <Box sx={{ height: 40, borderBottom: '1px solid #e0e0e0' }} />
                            {timeSlots.map((slot) => (
                                <Box
                                    key={slot.hour}
                                    sx={{
                                        height: 60,
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        pt: 0.5,
                                        px: 1
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
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const stats = getDayStats(date);
                            
                            return (
                                <Box
                                    key={dayIndex}
                                    sx={{
                                        flex: 1,
                                        borderRight: dayIndex < 6 ? '1px solid #e0e0e0' : 'none',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#fafafa' }
                                    }}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    {/* Day header */}
                                    <Box
                                        sx={{
                                            height: 40,
                                            borderBottom: '1px solid #e0e0e0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: isToday ? '#e3f2fd' : isSelected ? '#f5f5f5' : 'white',
                                            position: 'relative'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                                            {formatDate(date)}
                                        </Typography>
                                        {stats.total > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                {stats.completed > 0 && (
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                )}
                                                {stats.inProgress > 0 && (
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                )}
                                                {stats.pending > 0 && (
                                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#9e9e9e' }} />
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
                                                    borderBottom: '1px solid #f0f0f0',
                                                    position: 'relative',
                                                    '&:hover': { bgcolor: '#f9f9f9' }
                                                }}
                                            >
                                                {tasksForSlot.map((task, taskIndex) => {
                                                    const displayInfo = getTaskDisplayInfo(task);
                                                    const topOffset = task.thoi_gian_bat_dau ? 
                                                        (parseInt(task.thoi_gian_bat_dau.split(':')[1]) / 60) * 60 : 0;
                                                    
                                                    return (
                                                        <Tooltip key={taskIndex} title={`${task.ten_cong_viec} (${task.thoi_gian_bat_dau || 'N/A'} - ${task.thoi_gian_ket_thuc || 'N/A'})`} arrow>
                                                            <Box
                                                                className={`task-block priority-${task.uu_tien} status-${task.trang_thai}`}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 2 + topOffset,
                                                                    left: 2,
                                                                    right: 2,
                                                                    height: displayInfo.height - 4,
                                                                    bgcolor: getTaskTypeColor(task.loai_cong_viec),
                                                                    borderRadius: 1,
                                                                    p: 0.5,
                                                                    cursor: 'pointer',
                                                                    zIndex: 10,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    justifyContent: 'center',
                                                                    '&:hover': { 
                                                                        bgcolor: getTaskTypeColor(task.loai_cong_viec),
                                                                        opacity: 0.8
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTaskClick(task);
                                                                }}
                                                            >
                                                                <Typography 
                                                                    className="task-block-title"
                                                                    variant="caption" 
                                                                    sx={{ 
                                                                        color: 'white', 
                                                                        fontWeight: 'bold',
                                                                        display: 'block',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        marginBottom: '2px'
                                                                    }}
                                                                >
                                                                    {task.ten_cong_viec}
                                                                </Typography>
                                                                <Typography 
                                                                    className="task-block-time"
                                                                    variant="caption" 
                                                                    sx={{ 
                                                                        color: 'white', 
                                                                        opacity: 0.9,
                                                                        fontSize: '0.65rem',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    {task.thoi_gian_bat_dau && task.thoi_gian_ket_thuc 
                                                                        ? `${task.thoi_gian_bat_dau} - ${task.thoi_gian_ket_thuc}`
                                                                        : slot.label
                                                                    }
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
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Chi tiết công việc</DialogTitle>
                <DialogContent>
                    {viewingTask && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    {viewingTask.ten_cong_viec}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Loại công việc:</Typography>
                                <Chip 
                                    label={taskTypes.find(t => t.value === viewingTask.loai_cong_viec)?.label}
                                    sx={{ bgcolor: getTaskTypeColor(viewingTask.loai_cong_viec), color: 'white' }}
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                                <Chip 
                                    label={statuses.find(s => s.value === viewingTask.trang_thai)?.label}
                                    sx={{ bgcolor: getStatusColor(viewingTask.trang_thai), color: 'white' }}
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Ưu tiên:</Typography>
                                <Chip 
                                    label={priorities.find(p => p.value === viewingTask.uu_tien)?.label}
                                    sx={{ bgcolor: priorities.find(p => p.value === viewingTask.uu_tien)?.color, color: 'white' }}
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Thời gian dự kiến:</Typography>
                                <Typography variant="body1">{viewingTask.thoi_gian_du_kien} ngày</Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Ngày bắt đầu:</Typography>
                                <Typography variant="body1">
                                    {viewingTask.ngay_bat_dau}
                                    {viewingTask.thoi_gian_bat_dau && ` - ${viewingTask.thoi_gian_bat_dau}`}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Ngày kết thúc:</Typography>
                                <Typography variant="body1">
                                    {viewingTask.ngay_ket_thuc}
                                    {viewingTask.thoi_gian_ket_thuc && ` - ${viewingTask.thoi_gian_ket_thuc}`}
                                </Typography>
                            </Grid>
                            
                            {viewingTask.mo_ta && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Mô tả:</Typography>
                                    <Typography variant="body1">{viewingTask.mo_ta}</Typography>
                                </Grid>
                            )}
                            
                            {viewingTask.ghi_chu && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Ghi chú:</Typography>
                                    <Typography variant="body1">{viewingTask.ghi_chu}</Typography>
                                </Grid>
                            )}
                            
                            {viewingTask.ket_qua && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Kết quả:</Typography>
                                    <Typography variant="body1">{viewingTask.ket_qua}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
                    {canUpdateTask(viewingTask) ? (
                        <Button 
                            variant="contained" 
                            startIcon={<UpdateIcon />}
                            onClick={() => {
                                setOpenViewDialog(false);
                                handleUpdateTask(viewingTask);
                            }}
                        >
                            Cập nhật trạng thái
                        </Button>
                    ) : (
                        <Button 
                            variant="outlined" 
                            disabled
                            startIcon={<UpdateIcon />}
                        >
                            {getUpdateStatusMessage(viewingTask)}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Dialog cập nhật trạng thái */}
            <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
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
                                onChange={(e) => setUpdateForm({...updateForm, trang_thai: e.target.value})}
                                label="Trạng thái"
                            >
                                {statuses.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <TextField
                            fullWidth
                            label="Kết quả"
                            multiline
                            rows={3}
                            value={updateForm.ket_qua}
                            onChange={(e) => setUpdateForm({...updateForm, ket_qua: e.target.value})}
                            sx={{ mb: 2 }}
                            placeholder="Mô tả kết quả thực hiện..."
                        />
                        
                        <TextField
                            fullWidth
                            label="Ghi chú"
                            multiline
                            rows={2}
                            value={updateForm.ghi_chu}
                            onChange={(e) => setUpdateForm({...updateForm, ghi_chu: e.target.value})}
                            placeholder="Ghi chú thêm..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpdateDialog(false)}>
                        Hủy
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUpdateSubmit}
                        disabled={updating}
                        startIcon={updating ? <CircularProgress size={20} /> : <UpdateIcon />}
                    >
                        {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({...snackbar, open: false})} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

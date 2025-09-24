import React, { useState, useEffect } from 'react';
import './CalendarWeeklyView.css';
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
    OutlinedInput
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
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

export default function CalendarWeeklyView({
    tasks = [],
    farmers = [],
    onCreateTask,
    onUpdateTask,
    onViewTask
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [form, setForm] = useState({
        ten_cong_viec: '',
        mo_ta: '',
        loai_cong_viec: 'chuan_bi_dat',
        ngay_bat_dau: '',
        thoi_gian_bat_dau: '',
        ngay_ket_thuc: '',
        thoi_gian_ket_thuc: '',
        thoi_gian_du_kien: 1,
        trang_thai: 'chua_bat_dau',
        uu_tien: 'trung_binh',
        ma_nguoi_dung: [],
        ghi_chu: '',
        ket_qua: '',
        hinh_anh: ''
    });

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
        { value: 'chua_bat_dau', label: 'Chưa bắt đầu', color: '#9e9e9e' },
        { value: 'dang_thuc_hien', label: 'Đang thực hiện', color: '#2196f3' },
        { value: 'hoan_thanh', label: 'Hoàn thành', color: '#4caf50' },
        { value: 'bi_hoan', label: 'Bị hoãn', color: '#f44336' }
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

    // Lấy công việc cho slot thời gian cụ thể (chỉ trả về công việc bắt đầu tại slot này)
    const getTasksForTimeSlot = (date, hour) => {
        const dayTasks = getTasksForDate(date);
        return dayTasks.filter((task) => {
            if (task.thoi_gian_bat_dau) {
                // Nếu có thời gian bắt đầu, sử dụng thời gian thực tế
                const taskStartHour = parseInt(task.thoi_gian_bat_dau.split(':')[0]);
                return taskStartHour === hour;
            } else {
                // Nếu không có thời gian, phân bổ dựa trên index như cũ
                const taskIndex = dayTasks.indexOf(task);
                const taskHour = 8 + (taskIndex * 2) % 12; // Từ 8h đến 20h
                return taskHour === hour;
            }
        });
    };

    // Lấy tất cả công việc đang diễn ra trong slot thời gian (bao gồm cả công việc kéo dài)
    const getActiveTasksForTimeSlot = (date, hour) => {
        const dayTasks = getTasksForDate(date);
        return dayTasks.filter((task) => {
            if (task.thoi_gian_bat_dau && task.thoi_gian_ket_thuc) {
                const taskStartHour = parseInt(task.thoi_gian_bat_dau.split(':')[0]);
                const taskEndHour = parseInt(task.thoi_gian_ket_thuc.split(':')[0]);
                return hour >= taskStartHour && hour < taskEndHour;
            } else if (task.thoi_gian_bat_dau) {
                const taskStartHour = parseInt(task.thoi_gian_bat_dau.split(':')[0]);
                return taskStartHour === hour;
            } else {
                // Nếu không có thời gian, phân bổ dựa trên index như cũ
                const taskIndex = dayTasks.indexOf(task);
                const taskHour = 8 + (taskIndex * 2) % 12; // Từ 8h đến 20h
                return taskHour === hour;
            }
        });
    };

    // Tính toán thông tin hiển thị cho công việc
    const getTaskDisplayInfo = (task) => {
        if (!task.thoi_gian_bat_dau || !task.thoi_gian_ket_thuc) {
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

    // Xử lý click vào ngày
    const handleDateClick = (date) => {
        setSelectedDate(date);
        const formattedDate = formatLocalDate(date);
        setForm(prev => ({
            ...prev,
            ngay_bat_dau: formattedDate,
            ngay_ket_thuc: formattedDate,
            thoi_gian_du_kien: 1,
            thoi_gian_bat_dau: '',
            thoi_gian_ket_thuc: ''
        }));
        setOpenCreateDialog(true);
    };

    // Xử lý click vào công việc
    const handleTaskClick = (task) => {
        console.log('CalendarWeeklyView - Viewing task data:', task);
        console.log('CalendarWeeklyView - ma_nguoi_dung:', task.ma_nguoi_dung, 'type:', typeof task.ma_nguoi_dung);
        setViewingTask(task);
        setOpenViewDialog(true);
    };

    // Xử lý tạo công việc mới
    const handleCreateTask = () => {
        setForm({
            ten_cong_viec: '',
            mo_ta: '',
            loai_cong_viec: 'chuan_bi_dat',
            ngay_bat_dau: formatLocalDate(selectedDate),
            thoi_gian_bat_dau: '',
            ngay_ket_thuc: formatLocalDate(selectedDate),
            thoi_gian_ket_thuc: '',
            thoi_gian_du_kien: 1,
            trang_thai: 'chua_bat_dau',
            uu_tien: 'trung_binh',
            ma_nguoi_dung: '',
            ghi_chu: '',
            ket_qua: '',
            hinh_anh: ''
        });
        setOpenCreateDialog(true);
    };

    // Xử lý submit form
    const handleSubmit = async() => {
        try {
            if (onCreateTask) {
                const formData = {
                    ...form,
                    ma_nguoi_dung: Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.join(',') : form.ma_nguoi_dung
                };
                await onCreateTask(formData);
                setSnackbar({ open: true, message: 'Tạo công việc thành công!', severity: 'success' });
            }
            setOpenCreateDialog(false);
            // Reset form
            setForm({
                ten_cong_viec: '',
                mo_ta: '',
                loai_cong_viec: 'chuan_bi_dat',
                ngay_bat_dau: '',
                ngay_ket_thuc: '',
                thoi_gian_du_kien: 1,
                trang_thai: 'chua_bat_dau',
                uu_tien: 'trung_binh',
                ma_nguoi_dung: [],
                ghi_chu: '',
                ket_qua: '',
                hinh_anh: ''
            });
        } catch (error) {
            console.error('Error creating task:', error);
            setSnackbar({ open: true, message: 'Lỗi khi tạo công việc: ' + error.message, severity: 'error' });
        }
    };

    // Xử lý upload ảnh
    const handleImageUpload = async(event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost/doancuoinam/src/be_management/api/upload_image.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setForm(prev => ({...prev, hinh_anh: result.filePath }));
            } else {
                console.error('Upload error:', result);
                alert(result.error || 'Upload ảnh thất bại');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Lỗi upload ảnh: ${error.message}`);
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

    return ( <
        Box className = "calendar-weekly-container"
        sx = {
            { display: 'flex', height: '100vh', bgcolor: '#f5f5f5' } } > { /* Sidebar bên trái */ } <
        Paper className = "calendar-sidebar"
        sx = {
            {
                width: 280,
                minWidth: 280,
                height: '100vh',
                overflow: 'auto',
                borderRadius: 0,
                borderRight: '1px solid #e0e0e0'
            }
        } >
        { /* Header sidebar */ } <
        Box sx = {
            { p: 2, borderBottom: '1px solid #e0e0e0' } } >
        <
        Box sx = {
            { display: 'flex', alignItems: 'center', gap: 1, mb: 2 } } >
        <
        MenuIcon / >
        <
        Typography variant = "h6"
        sx = {
            { fontWeight: 'bold' } } >
        Lịch làm việc <
        /Typography> <
        /Box> <
        button onClick = { handleCreateTask }
        style = {
            {
                width: '100%',
                marginBottom: '16px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#1976d2',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '8px 16px'
            }
        } >
        <
        AddIcon / >
        <
        span style = {
            { color: 'white', fontWeight: 'bold' } } > Thêm lịch làm việc < /span> <
        /button> <
        Tooltip title = "Tìm kiếm công việc" >
        <
        Button variant = "outlined"
        startIcon = { < SearchIcon / > }
        fullWidth sx = {
            { mb: 1 } } >
        Tìm kiếm <
        /Button> <
        /Tooltip> <
        /Box>

        { /* Mini Calendar */ } <
        Box sx = {
            { p: 2, borderBottom: '1px solid #e0e0e0' } } >
        <
        Typography variant = "subtitle2"
        sx = {
            { mb: 1, fontWeight: 'bold' } } > { currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) } <
        /Typography> <
        Box sx = {
            { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 } } > {
            ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => ( <
                Typography key = { day }
                variant = "caption"
                sx = {
                    { textAlign: 'center', p: 0.5 } } > { day } <
                /Typography>
            ))
        } {
            getWeekDates(currentDate).map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return ( <
                    Box key = { index }
                    sx = {
                        {
                            aspectRatio: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            bgcolor: isSelected ? '#1976d2' : isToday ? '#ff9800' : 'transparent',
                            color: isSelected || isToday ? 'white' : 'text.primary',
                            '&:hover': { bgcolor: isSelected ? '#1976d2' : '#f5f5f5' }
                        }
                    }
                    onClick = {
                        () => setSelectedDate(date) } >
                    <
                    Typography variant = "caption" > { formatMiniDate(date) } <
                    /Typography> <
                    /Box>
                );
            })
        } <
        /Box> <
        /Box>

        { /* Danh sách lịch */ } <
        Box sx = {
            { p: 2 } } >
        <
        Typography variant = "subtitle2"
        sx = {
            { mb: 1, fontWeight: 'bold' } } >
        Lịch của tôi <
        /Typography> <
        List dense > {
            taskTypes.map((type) => ( <
                ListItem key = { type.value }
                sx = {
                    { px: 0 } } >
                <
                ListItemIcon sx = {
                    { minWidth: 32 } } >
                <
                Checkbox defaultChecked size = "small"
                sx = {
                    {
                        color: type.color,
                        '&.Mui-checked': { color: type.color }
                    }
                }
                /> <
                /ListItemIcon> <
                ListItemText primary = { type.label }
                primaryTypographyProps = {
                    { variant: 'body2' } }
                /> <
                Box sx = {
                    {
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: type.color,
                        ml: 1
                    }
                }
                /> <
                /ListItem>
            ))
        } <
        /List> <
        /Box> <
        /Paper>

        { /* Main Calendar Area */ } <
        Box sx = {
            { flex: 1, display: 'flex', flexDirection: 'column' } } > { /* Header Calendar */ } <
        Paper sx = {
            { p: 2, borderRadius: 0, borderBottom: '1px solid #e0e0e0' } } >
        <
        Box sx = {
            { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } } >
        <
        Box sx = {
            { display: 'flex', alignItems: 'center', gap: 2 } } >
        <
        Button startIcon = { < TodayIcon / > }
        onClick = { goToToday }
        variant = "outlined"
        size = "small" >
        Hôm nay <
        /Button> <
        Tooltip title = "Tuần trước" >
        <
        IconButton onClick = {
            () => navigateWeek(-1) } >
        <
        ChevronLeftIcon / >
        <
        /IconButton> <
        /Tooltip> <
        Typography variant = "h6"
        sx = {
            { minWidth: 200, textAlign: 'center' } } > { weekDates[0].toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' }) } - { weekDates[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) } <
        /Typography> <
        Tooltip title = "Tuần sau" >
        <
        IconButton onClick = {
            () => navigateWeek(1) } >
        <
        ChevronRightIcon / >
        <
        /IconButton> <
        /Tooltip> <
        /Box> <
        Box sx = {
            { display: 'flex', alignItems: 'center', gap: 1 } } >
        <
        Button variant = "outlined"
        size = "small" >
        Tuần <
        /Button> <
        Tooltip title = "Cài đặt" >
        <
        IconButton >
        <
        SettingsIcon / >
        <
        /IconButton> <
        /Tooltip> <
        /Box> <
        /Box> <
        /Paper>

        { /* Calendar Grid */ } <
        Box sx = {
            { flex: 1, overflow: 'auto' } } >
        <
        Box sx = {
            { display: 'flex', height: '100%' } } > { /* Time column */ } <
        Box sx = {
            { width: 60, borderRight: '1px solid #e0e0e0' } } >
        <
        Box sx = {
            { height: 40, borderBottom: '1px solid #e0e0e0' } }
        /> {
            timeSlots.map((slot) => ( <
                Box key = { slot.hour }
                sx = {
                    {
                        height: 60,
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        pt: 0.5,
                        px: 1
                    }
                } >
                <
                Typography variant = "caption"
                color = "text.secondary" > { slot.label } <
                /Typography> <
                /Box>
            ))
        } <
        /Box>

        { /* Days columns */ } {
            weekDates.map((date, dayIndex) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();

                return ( <
                    Box key = { dayIndex }
                    sx = {
                        {
                            flex: 1,
                            borderRight: dayIndex < 6 ? '1px solid #e0e0e0' : 'none',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#fafafa' }
                        }
                    }
                    onClick = {
                        () => handleDateClick(date) } >
                    { /* Day header */ } <
                    Box sx = {
                        {
                            height: 40,
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isToday ? '#e3f2fd' : isSelected ? '#f5f5f5' : 'white'
                        }
                    } >
                    <
                    Typography variant = "body2"
                    sx = {
                        { fontWeight: isToday ? 'bold' : 'normal' } } > { formatDate(date) } <
                    /Typography> <
                    /Box>

                    { /* Time slots for this day */ } {
                        timeSlots.map((slot) => {
                            const tasksForSlot = getTasksForTimeSlot(date, slot.hour);

                            return ( <
                                Box key = { slot.hour }
                                sx = {
                                    {
                                        height: 60,
                                        borderBottom: '1px solid #f0f0f0',
                                        position: 'relative',
                                        '&:hover': { bgcolor: '#f9f9f9' }
                                    }
                                } >
                                {
                                    tasksForSlot.map((task, taskIndex) => {
                                        const displayInfo = getTaskDisplayInfo(task);
                                        const topOffset = task.thoi_gian_bat_dau ?
                                            (parseInt(task.thoi_gian_bat_dau.split(':')[1]) / 60) * 60 : 0;

                                        return ( <
                                            Tooltip key = { taskIndex }
                                            title = { `${task.ten_cong_viec} (${task.thoi_gian_bat_dau || 'N/A'} - ${task.thoi_gian_ket_thuc || 'N/A'})` }
                                            arrow >
                                            <
                                            Box className = { `task-block priority-${task.uu_tien} status-${task.trang_thai}` }
                                            sx = {
                                                {
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
                                                }
                                            }
                                            onClick = {
                                                (e) => {
                                                    e.stopPropagation();
                                                    handleTaskClick(task);
                                                }
                                            } >
                                            <
                                            Typography className = "task-block-title"
                                            variant = "caption"
                                            sx = {
                                                {
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    marginBottom: '2px'
                                                }
                                            } >
                                            { task.ten_cong_viec } <
                                            /Typography> <
                                            Typography className = "task-block-time"
                                            variant = "caption"
                                            sx = {
                                                {
                                                    color: 'white',
                                                    opacity: 0.9,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 500
                                                }
                                            } >
                                            {
                                                task.thoi_gian_bat_dau && task.thoi_gian_ket_thuc ?
                                                `${task.thoi_gian_bat_dau} - ${task.thoi_gian_ket_thuc}` :
                                                    slot.label
                                            } <
                                            /Typography> <
                                            /Box> <
                                            /Tooltip>
                                        );
                                    })
                                } <
                                /Box>
                            );
                        })
                    } <
                    /Box>
                );
            })
        } <
        /Box> <
        /Box> <
        /Box>

        { /* Dialog tạo công việc mới */ } <
        Dialog open = { openCreateDialog }
        onClose = {
            () => setOpenCreateDialog(false) }
        maxWidth = "md"
        fullWidth >
        <
        DialogTitle > Tạo công việc mới < /DialogTitle> <
        DialogContent >
        <
        Grid container spacing = { 2 }
        sx = {
            { mt: 1 } } >
        <
        Grid item xs = { 12 } >
        <
        TextField label = "Tên công việc"
        value = { form.ten_cong_viec }
        onChange = {
            (e) => setForm({...form, ten_cong_viec: e.target.value }) }
        fullWidth required /
        >
        <
        /Grid> <
        Grid item xs = { 12 } >
        <
        TextField label = "Mô tả"
        value = { form.mo_ta }
        onChange = {
            (e) => setForm({...form, mo_ta: e.target.value }) }
        fullWidth multiline rows = { 3 }
        /> <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField select label = "Loại công việc"
        value = { form.loai_cong_viec }
        onChange = {
            (e) => setForm({...form, loai_cong_viec: e.target.value }) }
        fullWidth required >
        {
            taskTypes.map((type) => ( <
                MenuItem key = { type.value }
                value = { type.value } > { type.label } <
                /MenuItem>
            ))
        } <
        /TextField> <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField label = "Thời gian dự kiến (ngày)"
        type = "number"
        value = { form.thoi_gian_du_kien }
        fullWidth InputProps = {
            { readOnly: true } }
        helperText = "Tự động tính dựa trên ngày bắt đầu và kết thúc" /
        >
        <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField label = "Ngày bắt đầu"
        type = "date"
        value = { form.ngay_bat_dau }
        onChange = {
            (e) => {
                const startDate = e.target.value;
                const endDate = form.ngay_ket_thuc;

                // Tính thời gian dự kiến dựa trên ngày bắt đầu và kết thúc
                let estimatedDays = 1;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const diffTime = end - start;
                    estimatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
                }

                setForm({
                    ...form,
                    ngay_bat_dau: startDate,
                    thoi_gian_du_kien: estimatedDays
                });
            }
        }
        fullWidth required InputLabelProps = {
            { shrink: true } }
        inputProps = {
            { min: new Date().toISOString().split('T')[0] } }
        helperText = "Ngày bắt đầu phải từ hôm nay trở đi" /
        >
        <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField label = "Thời gian bắt đầu"
        type = "time"
        value = { form.thoi_gian_bat_dau }
        onChange = {
            (e) => setForm({...form, thoi_gian_bat_dau: e.target.value }) }
        fullWidth InputLabelProps = {
            { shrink: true } }
        /> <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField label = "Ngày kết thúc"
        type = "date"
        value = { form.ngay_ket_thuc }
        onChange = {
            (e) => {
                const endDate = e.target.value;
                const startDate = form.ngay_bat_dau;

                // Tính thời gian dự kiến dựa trên ngày bắt đầu và kết thúc
                let estimatedDays = 1;
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const diffTime = end - start;
                    estimatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
                }

                setForm({
                    ...form,
                    ngay_ket_thuc: endDate,
                    thoi_gian_du_kien: estimatedDays
                });
            }
        }
        fullWidth required InputLabelProps = {
            { shrink: true } }
        inputProps = {
            {
                min: form.ngay_bat_dau || new Date().toISOString().split('T')[0]
            }
        }
        helperText = "Ngày kết thúc phải >= ngày bắt đầu" /
        >
        <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField label = "Thời gian kết thúc"
        type = "time"
        value = { form.thoi_gian_ket_thuc }
        onChange = {
            (e) => setForm({...form, thoi_gian_ket_thuc: e.target.value }) }
        fullWidth InputLabelProps = {
            { shrink: true } }
        /> <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField select label = "Trạng thái"
        value = { form.trang_thai }
        onChange = {
            (e) => setForm({...form, trang_thai: e.target.value }) }
        fullWidth >
        {
            statuses.map((status) => ( <
                MenuItem key = { status.value }
                value = { status.value } > { status.label } <
                /MenuItem>
            ))
        } <
        /TextField> <
        /Grid> <
        Grid item xs = { 6 } >
        <
        TextField select label = "Ưu tiên"
        value = { form.uu_tien }
        onChange = {
            (e) => setForm({...form, uu_tien: e.target.value }) }
        fullWidth >
        {
            priorities.map((priority) => ( <
                MenuItem key = { priority.value }
                value = { priority.value } > { priority.label } <
                /MenuItem>
            ))
        } <
        /TextField> <
        /Grid> <
        Grid item xs = { 12 } >
        <
        FormControl fullWidth >
        <
        InputLabel id = "farmers-select-label" > Nhân công làm việc < /InputLabel> <
        Select labelId = "farmers-select-label"
        multiple value = { Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung : [] }
        onChange = {
            (e) => setForm({...form, ma_nguoi_dung: e.target.value }) }
        input = { < OutlinedInput label = "Nhân công làm việc" / > }
        renderValue = {
            (selected) => ( <
                Box sx = {
                    { display: 'flex', flexWrap: 'wrap', gap: 0.5 } } > {
                    selected.map((value) => {
                        const farmer = farmers.find(f => f.id === value);
                        return ( <
                            Chip key = { value }
                            label = { farmer ? farmer.full_name : value }
                            size = "small" /
                            >
                        );
                    })
                } <
                /Box>
            )
        } >
        {
            farmers.map((farmer) => ( <
                MenuItem key = { farmer.id }
                value = { farmer.id } >
                <
                Checkbox checked = { Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.indexOf(farmer.id) > -1 : false }
                /> <
                ListItemText primary = { <
                    Box sx = {
                        { display: 'flex', alignItems: 'center', gap: 1 } } >
                    <
                    Box sx = {
                        {
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                            flexShrink: 0
                        }
                    }
                    /> <
                    Typography variant = "body2" > { farmer.full_name } <
                    /Typography> <
                    /Box>
                }
                /> <
                /MenuItem>
            ))
        } <
        /Select> <
        /FormControl> <
        Typography variant = "caption"
        color = "text.secondary"
        sx = {
            { mt: 1, display: 'block' } } >
        Chọn một hoặc nhiều nông dân sẽ thực hiện công việc này <
        /Typography> <
        /Grid> <
        Grid item xs = { 12 } >
        <
        TextField label = "Ghi chú"
        value = { form.ghi_chu }
        onChange = {
            (e) => setForm({...form, ghi_chu: e.target.value }) }
        fullWidth multiline rows = { 2 }
        /> <
        /Grid> <
        Grid item xs = { 12 } >
        <
        Box sx = {
            { display: 'flex', alignItems: 'center', gap: 2 } } >
        <
        input accept = "image/*"
        style = {
            { display: 'none' } }
        id = "image-upload"
        type = "file"
        onChange = { handleImageUpload }
        /> <
        label htmlFor = "image-upload" >
        <
        Button variant = "outlined"
        component = "span"
        startIcon = { < CloudUploadIcon / > } >
        Chọn ảnh <
        /Button> <
        /label> {
            form.hinh_anh && ( <
                Typography variant = "body2"
                color = "text.secondary" >
                Đã chọn ảnh: { form.hinh_anh.split('/').pop() } <
                /Typography>
            )
        } <
        /Box> <
        /Grid> <
        /Grid> <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            () => setOpenCreateDialog(false) } > Hủy < /Button> <
        Button variant = "contained"
        onClick = { handleSubmit }
        disabled = {!form.ten_cong_viec || !form.ngay_bat_dau || !form.ngay_ket_thuc } >
        Tạo mới <
        /Button> <
        /DialogActions> <
        /Dialog>

        { /* Dialog xem chi tiết công việc */ } <
        Dialog open = { openViewDialog }
        onClose = {
            () => setOpenViewDialog(false) }
        maxWidth = "md"
        fullWidth >
        <
        DialogTitle > Chi tiết công việc < /DialogTitle> <
        DialogContent > {
            viewingTask && ( <
                Grid container spacing = { 2 }
                sx = {
                    { mt: 1 } } >
                <
                Grid item xs = { 12 } >
                <
                Typography variant = "h6"
                sx = {
                    { fontWeight: 'bold', mb: 2 } } > { viewingTask.ten_cong_viec } <
                /Typography> <
                /Grid>

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Loại công việc: < /Typography> <
                Chip label = { taskTypes.find(t => t.value === viewingTask.loai_cong_viec)?.label }
                sx = {
                    { bgcolor: getTaskTypeColor(viewingTask.loai_cong_viec), color: 'white' } }
                size = "small" /
                >
                <
                /Grid>

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Trạng thái: < /Typography> <
                Chip label = { statuses.find(s => s.value === viewingTask.trang_thai)?.label }
                sx = {
                    { bgcolor: getStatusColor(viewingTask.trang_thai), color: 'white' } }
                size = "small" /
                >
                <
                /Grid>

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Ưu tiên: < /Typography> <
                Chip label = { priorities.find(p => p.value === viewingTask.uu_tien)?.label }
                sx = {{ bgcolor: (priorities.find(p => p.value === viewingTask.uu_tien)?.color) || '#9e9e9e', color: 'white' }}
                size = "small" /
                >
                <
                /Grid>

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Thời gian dự kiến: < /Typography> <
                Typography variant = "body1" > { viewingTask.thoi_gian_du_kien }
                ngày < /Typography> <
                /Grid>

                {
                    viewingTask.ma_nguoi_dung && ( <
                        Grid item xs = { 12 } >
                        <
                        Typography variant = "subtitle2"
                        color = "text.secondary"
                        sx = {
                            { mb: 1 } } > 👷Nhân công làm việc:
                        <
                        /Typography> <
                        Box sx = {
                            {
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0'
                            }
                        } > {
                            (() => {
                                console.log('CalendarWeeklyView - Rendering workers for task:', viewingTask.ma_nguoi_dung);

                                // Xử lý cả string và array
                                let workerIds = [];

                                if (typeof viewingTask.ma_nguoi_dung === 'string') {
                                    if (viewingTask.ma_nguoi_dung.includes(',')) {
                                        // String có dấu phẩy - split thành array
                                        workerIds = viewingTask.ma_nguoi_dung.split(',').map(id => id.trim()).filter(id => id);
                                    } else {
                                        // String đơn lẻ
                                        workerIds = viewingTask.ma_nguoi_dung.trim() ? [viewingTask.ma_nguoi_dung.trim()] : [];
                                    }
                                } else if (Array.isArray(viewingTask.ma_nguoi_dung)) {
                                    workerIds = viewingTask.ma_nguoi_dung;
                                } else if (viewingTask.ma_nguoi_dung) {
                                    workerIds = [viewingTask.ma_nguoi_dung];
                                }

                                console.log('CalendarWeeklyView - Processed workerIds:', workerIds);

                                if (workerIds.length === 0) {
                                    return ( <
                                        Typography variant = "body2"
                                        color = "text.secondary" >
                                        Chưa có nhân công được phân công <
                                        /Typography>
                                    );
                                }

                                return ( <
                                    Box sx = {
                                        { display: 'flex', flexDirection: 'column', gap: 1.5 } } > {
                                        workerIds.map((workerId, index) => {
                                            const farmer = farmers.find(f => f.id == workerId);
                                            if (farmer) {
                                                return ( <
                                                    Box key = { workerId }
                                                    sx = {
                                                        { display: 'flex', alignItems: 'center', gap: 2 } } >
                                                    <
                                                    Box sx = {
                                                        {
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: '#4caf50',
                                                            flexShrink: 0
                                                        }
                                                    }
                                                    /> <
                                                    Box >
                                                    <
                                                    Typography variant = "body1"
                                                    sx = {
                                                        { fontWeight: 500 } } > { farmer.full_name } <
                                                    /Typography> <
                                                    Typography variant = "body2"
                                                    color = "text.secondary" > 📞{ farmer.phone || 'Không có SĐT' } <
                                                    /Typography> <
                                                    /Box> <
                                                    /Box>
                                                );
                                            } else {
                                                return ( <
                                                    Box key = { workerId }
                                                    sx = {
                                                        { display: 'flex', alignItems: 'center', gap: 2 } } >
                                                    <
                                                    Box sx = {
                                                        {
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: '#f44336',
                                                            flexShrink: 0
                                                        }
                                                    }
                                                    /> <
                                                    Typography variant = "body2"
                                                    color = "text.secondary" >
                                                    ID: { workerId }(Không tìm thấy thông tin) <
                                                    /Typography> <
                                                    /Box>
                                                );
                                            }
                                        })
                                    } <
                                    /Box>
                                );
                            })()
                        } <
                        /Box> <
                        /Grid>
                    )
                }

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Ngày bắt đầu: < /Typography> <
                Typography variant = "body1" > { viewingTask.ngay_bat_dau } { viewingTask.thoi_gian_bat_dau && ` - ${viewingTask.thoi_gian_bat_dau}` } <
                /Typography> <
                /Grid>

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Ngày kết thúc: < /Typography> <
                Typography variant = "body1" > { viewingTask.ngay_ket_thuc } { viewingTask.thoi_gian_ket_thuc && ` - ${viewingTask.thoi_gian_ket_thuc}` } <
                /Typography> <
                /Grid>

                {
                    viewingTask.mo_ta && ( <
                        Grid item xs = { 12 } >
                        <
                        Typography variant = "subtitle2"
                        color = "text.secondary" > Mô tả: < /Typography> <
                        Typography variant = "body1" > { viewingTask.mo_ta } < /Typography> <
                        /Grid>
                    )
                }

                {
                    viewingTask.ghi_chu && ( <
                        Grid item xs = { 12 } >
                        <
                        Typography variant = "subtitle2"
                        color = "text.secondary" > Ghi chú: < /Typography> <
                        Typography variant = "body1" > { viewingTask.ghi_chu } < /Typography> <
                        /Grid>
                    )
                }

                {
                    viewingTask.ket_qua && ( <
                        Grid item xs = { 12 } >
                        <
                        Typography variant = "subtitle2"
                        color = "text.secondary" > Kết quả: < /Typography> <
                        Typography variant = "body1" > { viewingTask.ket_qua } < /Typography> <
                        /Grid>
                    )
                }

                {
                    viewingTask.hinh_anh && viewingTask.hinh_anh.trim() !== '' && ( <
                        Grid item xs = { 12 } >
                        <
                        Typography variant = "subtitle2"
                        color = "text.secondary" > Hình ảnh: < /Typography> <
                        Box sx = {
                            { mt: 1 } } >
                        <
                        img src = { `http://localhost/doancuoinam/${viewingTask.hinh_anh}` }
                        alt = "Hình ảnh công việc"
                        style = {
                            {
                                maxWidth: '100%',
                                maxHeight: '300px',
                                objectFit: 'contain',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px'
                            }
                        }
                        onError = {
                            (e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }
                        }
                        /> <
                        Typography variant = "body2"
                        color = "text.secondary"
                        style = {
                            { display: 'none' } } >
                        Không thể tải hình ảnh <
                        /Typography> <
                        /Box> <
                        /Grid>
                    )
                }

                {
                    (!viewingTask.hinh_anh || viewingTask.hinh_anh.trim() === '') && ( <
                        Grid item xs = { 12 } >
                        <
                        Typography variant = "subtitle2"
                        color = "text.secondary" > Hình ảnh: < /Typography> <
                        Typography variant = "body2"
                        color = "text.secondary"
                        sx = {
                            { fontStyle: 'italic' } } >
                        Không có hình ảnh <
                        /Typography> <
                        /Grid>
                    )
                }

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Ngày tạo: < /Typography> <
                Typography variant = "body2" > { viewingTask.created_at } < /Typography> <
                /Grid>

                <
                Grid item xs = { 6 } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Cập nhật lần cuối: < /Typography> <
                Typography variant = "body2" > { viewingTask.updated_at } < /Typography> <
                /Grid> <
                /Grid>
            )
        } <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            () => setOpenViewDialog(false) } > Đóng < /Button> <
        Button variant = "contained"
        onClick = {
            () => {
                setOpenViewDialog(false);
                setForm(viewingTask);
                setOpenCreateDialog(true);
            }
        } >
        Chỉnh sửa <
        /Button> <
        /DialogActions> <
        /Dialog>

        { /* Snackbar for notifications */ } <
        Snackbar open = { snackbar.open }
        autoHideDuration = { 3000 }
        onClose = {
            () => setSnackbar({...snackbar, open: false }) }
        anchorOrigin = {
            { vertical: 'bottom', horizontal: 'right' } } >
        <
        Alert onClose = {
            () => setSnackbar({...snackbar, open: false }) }
        severity = { snackbar.severity }
        sx = {
            { width: '100%' } } >
        { snackbar.message } <
        /Alert> <
        /Snackbar> <
        /Box>
    );
}
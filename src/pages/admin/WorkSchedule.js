import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    Alert,
    Grid,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText
} from '@mui/material';
import {
    CalendarViewMonth as CalendarViewIcon,
    ViewList as ViewListIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Today as TodayIcon,
    CloudUpload as CloudUploadIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { listTasks, createTask, updateTask, fetchFarmers } from '../../services/api';
import CalendarWeeklyView from '../../components/admin/CalendarWeeklyView';

export default function WorkSchedule() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('weekly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [viewingTask, setViewingTask] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [farmers, setFarmers] = useState([]);

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
        { value: 'chuan_bi_dat', label: 'Chuẩn bị đất' },
        { value: 'gieo_trong', label: 'Gieo trồng' },
        { value: 'cham_soc', label: 'Chăm sóc' },
        { value: 'tuoi_nuoc', label: 'Tưới nước' },
        { value: 'bon_phan', label: 'Bón phân' },
        { value: 'thu_hoach', label: 'Thu hoạch' },
        { value: 'khac', label: 'Khác' }
    ];

    const priorities = [
        { value: 'thap', label: 'Thấp', color: 'default' },
        { value: 'trung_binh', label: 'Trung bình', color: 'primary' },
        { value: 'cao', label: 'Cao', color: 'warning' },
        { value: 'khan_cap', label: 'Khẩn cấp', color: 'error' }
    ];

    const statuses = [
        { value: 'chua_bat_dau', label: 'Chưa bắt đầu', color: 'default' },
        { value: 'dang_thuc_hien', label: 'Đang thực hiện', color: 'primary' },
        { value: 'hoan_thanh', label: 'Hoàn thành', color: 'success' },
        { value: 'bi_hoan', label: 'Bị hoãn', color: 'error' }
    ];

    // Format a Date object to local YYYY-MM-DD (avoid UTC shift from toISOString)
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        loadTasks();
        loadFarmers();
    }, []);

    const loadFarmers = async () => {
        try {
            const response = await fetchFarmers();
            if (response?.success) {
                setFarmers(response.data || []);
            }
        } catch (e) {
            console.error('Failed to load farmers:', e.message);
        }
    };

    const loadTasks = async () => {
            try {
                setLoading(true);
            const response = await listTasks();
            if (response?.success) {
                setTasks(response.data || []);
            }
        } catch (e) {
            setError(e.message);
            } finally {
                setLoading(false);
            }
        };

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
        setOpenDialog(true);
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setSnackbar({ open: true, message: 'Vui lòng chọn file ảnh', severity: 'error' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: 'Kích thước file không được vượt quá 5MB', severity: 'error' });
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost/doancuoinam/src/be_management/api/upload_image.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setForm(prev => ({ ...prev, hinh_anh: result.filePath }));
                setSnackbar({ open: true, message: 'Upload ảnh thành công', severity: 'success' });
                } else {
                console.error('Upload error:', result);
                setSnackbar({ 
                    open: true, 
                    message: result.error || 'Upload ảnh thất bại', 
                    severity: 'error' 
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setSnackbar({ 
                open: true, 
                message: `Lỗi upload ảnh: ${error.message}`, 
                severity: 'error' 
            });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (taskData = null) => {
        try {
            const data = taskData || {
                ...form,
                ma_nguoi_dung: Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.join(',') : form.ma_nguoi_dung,
                ma_ke_hoach: null
            };

            if (editingTask) {
                await updateTask({ ...data, id: editingTask.id });
                setSnackbar({ open: true, message: 'Cập nhật công việc thành công', severity: 'success' });
            } else {
                await createTask(data);
                setSnackbar({ open: true, message: 'Tạo công việc thành công', severity: 'success' });
            }

            setOpenDialog(false);
            setEditingTask(null);
            resetForm();
            await loadTasks(); // Đảm bảo load lại dữ liệu sau khi tạo/cập nhật
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        }
    };

    const resetForm = () => {
            setForm({
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
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getTasksForDate = (date) => {
        if (!date) return [];
        const dateStr = formatLocalDate(date);
        return tasks.filter(task => 
            task.ngay_bat_dau === dateStr || 
            (task.ngay_ket_thuc && task.ngay_ket_thuc >= dateStr && task.ngay_bat_dau <= dateStr)
        );
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const getStatusColor = (status) => {
        const statusOption = statuses.find(s => s.value === status);
        return statusOption?.color || 'default';
    };

    const getPriorityColor = (priority) => {
        const priorityOption = priorities.find(p => p.value === priority);
        return priorityOption?.color || 'default';
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Đang tải dữ liệu...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', overflow: 'hidden' }}>
            {viewMode === 'weekly' ? (
                <CalendarWeeklyView
                    tasks={tasks}
                    farmers={farmers}
                    onCreateTask={handleSubmit}
                    onUpdateTask={handleSubmit}
                    onViewTask={(task) => {
                        setViewingTask(task);
                        setOpenViewDialog(true);
                    }}
                    key={tasks.length} // Force re-render when tasks change
                />
            ) : (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Xây dựng lịch làm việc
                        </Typography>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                        >
                            <ToggleButton value="weekly">
                                <CalendarViewIcon sx={{ mr: 1 }} />
                                Tuần
                            </ToggleButton>
                            <ToggleButton value="calendar">
                                <CalendarViewIcon sx={{ mr: 1 }} />
                                Tháng
                            </ToggleButton>
                            <ToggleButton value="list">
                                <ViewListIcon sx={{ mr: 1 }} />
                                Danh sách
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

            {viewMode === 'calendar' && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => navigateMonth(-1)}>
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', minWidth: 200, textAlign: 'center' }}>
                                {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                            </Typography>
                            <IconButton onClick={() => navigateMonth(1)}>
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>
                        <Button startIcon={<TodayIcon />} onClick={goToToday} variant="outlined">
                            Hôm nay
                        </Button>
                    </Box>

                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e0e0e0' }}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                <Box
                                    key={day}
                                    sx={{
                                p: 2,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                bgcolor: '#f5f5f5',
                                borderRight: '1px solid #e0e0e0',
                                '&:last-child': { borderRight: 'none' }
                                    }}
                                >
                                    {day}
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                            {getDaysInMonth(currentDate).map((day, index) => {
                        const isToday = day && day.toDateString() === new Date().toDateString();
                        const isSelected = day && day.toDateString() === selectedDate.toDateString();
                        const dayTasks = getTasksForDate(day);

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                    minHeight: 120,
                                    borderRight: '1px solid #e0e0e0',
                                    borderBottom: '1px solid #e0e0e0',
                                    p: 1,
                                    cursor: day ? 'pointer' : 'default',
                                    bgcolor: isSelected ? '#e3f2fd' : isToday ? '#fff3e0' : 'white',
                                    '&:hover': day ? { bgcolor: '#f5f5f5' } : {},
                                    '&:nth-child(7n)': { borderRight: 'none' }
                                        }}
                                        onClick={() => day && handleDateClick(day)}
                                    >
                                        {day && (
                                            <>
                                                <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                                                    {day.getDate()}
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    {dayTasks.slice(0, 3).map((task, taskIndex) => (
                                                        <Chip
                                                            key={taskIndex}
                                                            label={task.ten_cong_viec}
                                                            size="small"
                                                            color={getStatusColor(task.trang_thai)}
                                                            sx={{ 
                                                                fontSize: '0.7rem', 
                                                                height: 20, 
                                                                mb: 0.5,
                                                                display: 'block',
                                                                '& .MuiChip-label': { px: 1 }
                                                            }}
                                                        />
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            +{dayTasks.length - 3} công việc khác
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Paper>
            )}

            {viewMode === 'list' && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên công việc</TableCell>
                                <TableCell>Loại</TableCell>
                                <TableCell>Nhân công</TableCell>
                                <TableCell>Ngày bắt đầu</TableCell>
                                <TableCell>Ngày kết thúc</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Ưu tiên</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.ten_cong_viec}</TableCell>
                                    <TableCell>
                                        {taskTypes.find(t => t.value === task.loai_cong_viec)?.label}
                                    </TableCell>
                                    <TableCell>
                                        {task.ma_nguoi_dung ? (
                                            (() => {
                                                const farmer = farmers.find(f => f.id == task.ma_nguoi_dung);
                                                return farmer ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ 
                                                            width: 6, 
                                                            height: 6, 
                                                            borderRadius: '50%', 
                                                            bgcolor: '#4caf50',
                                                            flexShrink: 0
                                                        }} />
                                                        <Typography variant="body2">
                                                            {farmer.full_name}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        ID: {task.ma_nguoi_dung}
                                                    </Typography>
                                                );
                                            })()
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Chưa giao
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{task.ngay_bat_dau}</TableCell>
                                    <TableCell>{task.ngay_ket_thuc}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={statuses.find(s => s.value === task.trang_thai)?.label}
                                            color={getStatusColor(task.trang_thai)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={priorities.find(p => p.value === task.uu_tien)?.label}
                                            color={getPriorityColor(task.uu_tien)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => {
                                            console.log('Viewing task data:', task);
                                            console.log('ma_nguoi_dung:', task.ma_nguoi_dung, 'type:', typeof task.ma_nguoi_dung);
                                            setViewingTask(task);
                                            setOpenViewDialog(true);
                                        }}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => {
                                            setEditingTask(task);
                                            setForm({
                                                ...task,
                                                ma_nguoi_dung: task.ma_nguoi_dung ? 
                                                    (Array.isArray(task.ma_nguoi_dung) ? task.ma_nguoi_dung : [task.ma_nguoi_dung]) : 
                                                    []
                                            });
                                            setOpenDialog(true);
                                        }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tên công việc"
                                value={form.ten_cong_viec}
                                onChange={(e) => setForm({...form, ten_cong_viec: e.target.value})}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả"
                                value={form.mo_ta}
                                onChange={(e) => setForm({...form, mo_ta: e.target.value})}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Loại công việc"
                                value={form.loai_cong_viec}
                                onChange={(e) => setForm({...form, loai_cong_viec: e.target.value})}
                                fullWidth
                                required
                            >
                                {taskTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Thời gian dự kiến (ngày)"
                                type="number"
                                value={form.thoi_gian_du_kien}
                                fullWidth
                                InputProps={{ readOnly: true }}
                                helperText="Tự động tính dựa trên ngày bắt đầu và kết thúc"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Ngày bắt đầu"
                                type="date"
                                value={form.ngay_bat_dau}
                                onChange={(e) => {
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
                                }}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                helperText="Ngày bắt đầu phải từ hôm nay trở đi"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Thời gian bắt đầu"
                                type="time"
                                value={form.thoi_gian_bat_dau}
                                onChange={(e) => setForm({...form, thoi_gian_bat_dau: e.target.value})}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Ngày kết thúc"
                                type="date"
                                value={form.ngay_ket_thuc}
                                onChange={(e) => {
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
                                }}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ 
                                    min: form.ngay_bat_dau || new Date().toISOString().split('T')[0] 
                                }}
                                helperText="Ngày kết thúc phải >= ngày bắt đầu"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Thời gian kết thúc"
                                type="time"
                                value={form.thoi_gian_ket_thuc}
                                onChange={(e) => setForm({...form, thoi_gian_ket_thuc: e.target.value})}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Trạng thái"
                                value={form.trang_thai}
                                onChange={(e) => setForm({...form, trang_thai: e.target.value})}
                                fullWidth
                            >
                                {statuses.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                select
                                label="Ưu tiên"
                                value={form.uu_tien}
                                onChange={(e) => setForm({...form, uu_tien: e.target.value})}
                                fullWidth
                            >
                                {priorities.map((priority) => (
                                    <MenuItem key={priority.value} value={priority.value}>
                                        {priority.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="farmers-select-label">Nhân công làm việc</InputLabel>
                                <Select
                                    labelId="farmers-select-label"
                                    multiple
                                    value={Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung : []}
                                onChange={(e) => setForm({...form, ma_nguoi_dung: e.target.value})}
                                    input={<OutlinedInput label="Nhân công làm việc" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const farmer = farmers.find(f => f.id === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={farmer ? farmer.full_name : value}
                                                        size="small"
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#1976d2',
                                        },
                                    },
                                }}
                            >
                                {farmers.map((farmer) => (
                                    <MenuItem key={farmer.id} value={farmer.id}>
                                            <Checkbox checked={Array.isArray(form.ma_nguoi_dung) ? form.ma_nguoi_dung.indexOf(farmer.id) > -1 : false} />
                                            <ListItemText 
                                                primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                bgcolor: '#4caf50',
                                                flexShrink: 0
                                            }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {farmer.full_name}
                                                </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    📞 {farmer.phone || 'Không có SĐT'}
                                                </Typography>
                                                }
                                            />
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Chọn một hoặc nhiều nông dân sẽ thực hiện công việc này
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Ghi chú"
                                value={form.ghi_chu}
                                onChange={(e) => setForm({...form, ghi_chu: e.target.value})}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageUpload}
                                />
                                <label htmlFor="image-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<CloudUploadIcon />}
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? 'Đang upload...' : 'Chọn ảnh'}
                                    </Button>
                                </label>
                                {form.hinh_anh && (
                                    <Typography variant="body2" color="text.secondary">
                                        Đã chọn ảnh: {form.hinh_anh.split('/').pop()}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!form.ten_cong_viec || !form.ngay_bat_dau || !form.ngay_ket_thuc}
                    >
                        {editingTask ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Task Details Dialog */}
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
                                <Typography variant="body1">{viewingTask.loai_cong_viec}</Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                                <Chip 
                                    label={viewingTask.trang_thai}
                                    color={getStatusColor(viewingTask.trang_thai)}
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Ưu tiên:</Typography>
                                <Chip 
                                    label={viewingTask.uu_tien}
                                    color={getPriorityColor(viewingTask.uu_tien)}
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Thời gian dự kiến:</Typography>
                                <Typography variant="body1">{viewingTask.thoi_gian_du_kien} ngày</Typography>
                            </Grid>
                            
                            {viewingTask.ma_nguoi_dung && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        👷 Nhân công làm việc:
                                    </Typography>
                                    <Box sx={{ 
                                        p: 2, 
                                        bgcolor: '#f5f5f5', 
                                        borderRadius: 1, 
                                        border: '1px solid #e0e0e0' 
                                    }}>
                                        {(() => {
                                            console.log('Rendering workers for task:', viewingTask.ma_nguoi_dung);
                                            
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
                                            
                                            console.log('Processed workerIds:', workerIds);
                                            
                                            if (workerIds.length === 0) {
                                                return (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Chưa có nhân công được phân công
                                                    </Typography>
                                                );
                                            }

                                            return (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    {workerIds.map((workerId, index) => {
                                                        const farmer = farmers.find(f => f.id == workerId);
                                            if (farmer) {
                                                return (
                                                                <Box key={workerId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            bgcolor: '#4caf50',
                                                            flexShrink: 0
                                                        }} />
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                {farmer.full_name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                📞 {farmer.phone || 'Không có SĐT'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            } else {
                                                return (
                                                                <Box key={workerId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Box sx={{ 
                                                                        width: 12, 
                                                                        height: 12, 
                                                                        borderRadius: '50%', 
                                                                        bgcolor: '#f44336',
                                                                        flexShrink: 0
                                                                    }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                                        ID: {workerId} (Không tìm thấy thông tin)
                                                    </Typography>
                                                                </Box>
                                                );
                                            }
                                                    })}
                                                </Box>
                                            );
                                        })()}
                                    </Box>
                                </Grid>
                            )}
                            
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
                            
                            {viewingTask.hinh_anh && viewingTask.hinh_anh.trim() !== '' && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Hình ảnh:</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <img 
                                            src={`http://localhost/doancuoinam/${viewingTask.hinh_anh}`}
                                            alt="Hình ảnh công việc"
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '300px', 
                                                objectFit: 'contain',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '4px'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            style={{ display: 'none' }}
                                        >
                                            Không thể tải hình ảnh
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                            
                            {(!viewingTask.hinh_anh || viewingTask.hinh_anh.trim() === '') && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Hình ảnh:</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        Không có hình ảnh
                                    </Typography>
                                </Grid>
                            )}
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Ngày tạo:</Typography>
                                <Typography variant="body2">{viewingTask.created_at}</Typography>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Cập nhật lần cuối:</Typography>
                                <Typography variant="body2">{viewingTask.updated_at}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            setOpenViewDialog(false);
                            setEditingTask(viewingTask);
                            setForm(viewingTask);
                            setOpenDialog(true);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                </DialogActions>
            </Dialog>

                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
                        onClose={() => setSnackbar({...snackbar, open: false})}
                    >
                        <Alert 
                            onClose={() => setSnackbar({...snackbar, open: false})} 
                            severity={snackbar.severity}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            )}
        </Box>
    );
}

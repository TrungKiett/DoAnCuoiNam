import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    IconButton,
    Tooltip,
    Badge,
    Stack,
    Divider,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Person as PersonIcon,
    Work as WorkIcon,
    Event as EventIcon,
    AccessTime as AccessTimeIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Assignment as AssignmentIcon,
    LocationOn as LocationIcon,
    Schedule as ScheduleIcon,
    Today as TodayIcon,
    Timeline as TimelineIcon,
    Speed as SpeedIcon
} from '@mui/icons-material';
import { 
    fetchFarmers, 
    listTasks, 
    fetchLeaveRequests, 
    createTask,
    lotsList
} from '../../services/api';

export default function WorkerManagement() {
    const [farmers, setFarmers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateRange, setDateRange] = useState(14); // 14 days
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchLocation, setSearchLocation] = useState('');
    const [quickAssignDialog, setQuickAssignDialog] = useState(false);
    const [quickTask, setQuickTask] = useState({
        title: '',
        startTime: '',
        location: '',
        duration: 8
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [farmersRes, tasksRes, leaveRes, lotsRes] = await Promise.all([
                fetchFarmers(),
                listTasks(),
                fetchLeaveRequests().catch(() => ({ data: [] })),
                lotsList().catch(() => ({ data: [] }))
            ]);
            
            setFarmers(farmersRes?.data || []);
            setTasks(tasksRes?.data || []);
            setLeaveRequests(leaveRes?.data || []);
            setLots(lotsRes?.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Tính toán trạng thái nhân công cho ngày cụ thể
    const getWorkerStatusForDate = (workerId, date) => {
        // Kiểm tra nghỉ phép
        const onLeave = leaveRequests.some(req => 
            String(req.worker_id) === String(workerId) && 
            req.status === 'approved' &&
            req.start_date <= date && 
            req.end_date >= date
        );

        if (onLeave) return { 
            status: 'leave', 
            label: 'Nghỉ phép', 
            color: 'error',
            hours: 0,
            maxHours: 8 
        };

        // Tính tổng giờ làm việc trong ngày
        const dayTasks = tasks.filter(task => {
            if (!task.ma_nguoi_dung) return false;
            const assignedWorkers = String(task.ma_nguoi_dung).split(',').map(id => id.trim());
            return assignedWorkers.includes(String(workerId)) && 
                   task.ngay_bat_dau <= date && 
                   task.ngay_ket_thuc >= date;
        });

        let totalHours = 0;
        dayTasks.forEach(task => {
            const startTime = task.thoi_gian_bat_dau || '08:00';
            const endTime = task.thoi_gian_ket_thuc || '17:00';
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const hours = (endH + endM/60) - (startH + startM/60);
            totalHours += Math.max(0, hours);
        });

        totalHours = Math.min(totalHours, 8); // Cap at 8 hours

        if (totalHours >= 8) return { 
            status: 'busy', 
            label: 'Bận hoàn toàn', 
            color: 'error',
            hours: totalHours,
            maxHours: 8,
            tasks: dayTasks 
        };
        
        if (totalHours >= 4) return { 
            status: 'partial', 
            label: 'Bận một phần', 
            color: 'warning',
            hours: totalHours,
            maxHours: 8,
            tasks: dayTasks 
        };
        
        return { 
            status: 'free', 
            label: 'Rảnh', 
            color: 'success',
            hours: totalHours,
            maxHours: 8,
            tasks: dayTasks 
        };
    };

    // 2. Thống kê cho ngày được chọn
    const getDailyStats = () => {
        let free = 0, partial = 0, busy = 0, leave = 0;
        
        farmers.forEach(worker => {
            const status = getWorkerStatusForDate(worker.id, selectedDate);
            switch (status.status) {
                case 'free': free++; break;
                case 'partial': partial++; break;
                case 'busy': busy++; break;
                case 'leave': leave++; break;
            }
        });

        return { free, partial, busy, leave };
    };

    // 3. Lọc nhân công theo điều kiện
    const getFilteredWorkers = () => {
        let filtered = farmers;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(worker => {
                const status = getWorkerStatusForDate(worker.id, selectedDate);
                return status.status === filterStatus;
            });
        }

        if (searchLocation) {
            // Simple location filter - would need more sophisticated logic
            filtered = filtered.filter(worker => 
                worker.full_name?.toLowerCase().includes(searchLocation.toLowerCase())
            );
        }

        return filtered;
    };

    // 4. Đề xuất nhân công cho nhiệm vụ khẩn cấp
    const getSuggestedWorkers = () => {
        return farmers
            .map(worker => {
                const status = getWorkerStatusForDate(worker.id, selectedDate);
                const availableHours = status.maxHours - status.hours;
                
                return {
                    ...worker,
                    status,
                    availableHours,
                    priority: status.status === 'free' ? 3 : 
                             status.status === 'partial' ? 2 : 0
                };
            })
            .filter(worker => worker.availableHours >= quickTask.duration)
            .sort((a, b) => b.priority - a.priority || b.availableHours - a.availableHours)
            .slice(0, 5);
    };

    // 5. Phân công nhanh
    const handleQuickAssign = async (workerId) => {
        try {
            const startTime = quickTask.startTime || '08:00';
            const [hour, minute] = startTime.split(':').map(Number);
            const endHour = hour + quickTask.duration;
            const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            await createTask({
                ten_cong_viec: quickTask.title,
                mo_ta: `Nhiệm vụ khẩn cấp - ${quickTask.location}`,
                loai_cong_viec: 'khac',
                ngay_bat_dau: selectedDate,
                ngay_ket_thuc: selectedDate,
                thoi_gian_bat_dau: startTime,
                thoi_gian_ket_thuc: endTime,
                trang_thai: 'chua_bat_dau',
                uu_tien: 'cao',
                ma_nguoi_dung: workerId,
                ghi_chu: 'Phân công khẩn cấp qua hệ thống'
            });

            setQuickAssignDialog(false);
            setQuickTask({ title: '', startTime: '', location: '', duration: 8 });
            await loadData(); // Reload data
            alert('Phân công thành công!');
        } catch (error) {
            console.error('Error assigning task:', error);
            alert('Lỗi phân công: ' + error.message);
        }
    };

    const stats = getDailyStats();
    const filteredWorkers = getFilteredWorkers();

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Đang tải dữ liệu...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                Dashboard Quản lí Nhân công 
            </Typography>
            

            <Grid container spacing={3}>
                {/* 1. TỔNG QUAN SẴNG SÀNG THEO NGÀY */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: 'fit-content' }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            📅 <Box sx={{ ml: 1 }}>Tổng quan Sẵn sàng Theo Ngày</Box>
                        </Typography>

                        {/* Date Picker */}
                        <TextField
                            label="Chọn ngày"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            fullWidth
                            sx={{ mb: 3 }}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* KPI Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {stats.free}
                                        </Typography>
                                        <Typography variant="body2">Đang rảnh</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {stats.partial}
                                        </Typography>
                                        <Typography variant="body2">Bận 1 phần</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {stats.busy}
                                        </Typography>
                                        <Typography variant="body2">Bận toàn bộ</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'grey.600', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {stats.leave}
                                        </Typography>
                                        <Typography variant="body2">Nghỉ phép</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Filters */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Lọc trạng thái</InputLabel>
                                <Select
                                    value={filterStatus}
                                    label="Lọc trạng thái"
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    <MenuItem value="free">Đang rảnh</MenuItem>
                                    <MenuItem value="partial">Bận 1 phần</MenuItem>
                                    <MenuItem value="busy">Bận hoàn toàn</MenuItem>
                                    <MenuItem value="leave">Nghỉ phép</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        {/* Worker List */}
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Danh sách nhân công ({filteredWorkers.length})
                            </Typography>
                            <List dense>
                                {filteredWorkers.map((worker) => {
                                    const status = getWorkerStatusForDate(worker.id, selectedDate);
                                    return (
                                        <ListItem key={worker.id} sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ 
                                                    bgcolor: status.color === 'success' ? 'success.main' :
                                                             status.color === 'warning' ? 'warning.main' :
                                                             status.color === 'error' ? 'error.main' : 'grey.500',
                                                    width: 32, height: 32 
                                                }}>
                                                    {(worker.full_name || 'N')[0]}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={worker.full_name || `ND-${worker.id}`}
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip 
                                                            label={status.label}
                                                            color={status.color}
                                                            size="small"
                                                        />
                                                        <Typography variant="caption">
                                                            {status.hours}h/{status.maxHours}h
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </Paper>
                </Grid>

                {/* 2. BIỂU ĐỒ TẢI CÔNG VIỆC */}
                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 3, height: 'fit-content' }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            📊 <Box sx={{ ml: 1 }}>Biểu đồ Tải công việc & Sẵn sàng</Box>
                        </Typography>

                        <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
                            <InputLabel>Phạm vi</InputLabel>
                            <Select
                                value={dateRange}
                                label="Phạm vi"
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <MenuItem value={7}>7 ngày</MenuItem>
                                <MenuItem value={14}>14 ngày</MenuItem>
                                <MenuItem value={30}>30 ngày</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Timeline Chart */}
                        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                            {farmers.slice(0, 20).map((worker) => { // Show first 20 for demo
                                const dates = [];
                                for (let i = 0; i < dateRange; i++) {
                                    const date = new Date();
                                    date.setDate(date.getDate() + i);
                                    dates.push(date.toISOString().split('T')[0]);
                                }

                                return (
                                    <Box key={worker.id} sx={{ mb: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                                            {worker.full_name || `ND-${worker.id}`}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {dates.map((date) => {
                                                const status = getWorkerStatusForDate(worker.id, date);
                                                const percentage = (status.hours / status.maxHours) * 100;
                                                
                                                return (
                                                    <Tooltip 
                                                        key={date}
                                                        title={
                                                            <Box>
                                                                <Typography variant="body2">{date}</Typography>
                                                                <Typography variant="body2">{status.label}</Typography>
                                                                <Typography variant="body2">{status.hours}h/{status.maxHours}h</Typography>
                                                                {status.tasks && status.tasks.length > 0 && (
                                                                    <Box sx={{ mt: 1 }}>
                                                                        {status.tasks.map((task, idx) => (
                                                                            <Typography key={idx} variant="caption" display="block">
                                                                                • {task.ten_cong_viec} ({task.thoi_gian_bat_dau}-{task.thoi_gian_ket_thuc})
                                                                            </Typography>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        }
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                bgcolor: status.status === 'free' ? 'success.light' :
                                                                        status.status === 'partial' ? 'warning.light' :
                                                                        status.status === 'busy' ? 'error.light' :
                                                                        'grey.400',
                                                                border: '1px solid #ccc',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                '&:hover': { transform: 'scale(1.2)' }
                                                            }}
                                                        >
                                                            {status.status !== 'leave' && status.status !== 'free' && (
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        bottom: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        height: `${percentage}%`,
                                                                        bgcolor: 'rgba(0,0,0,0.3)',
                                                                        transition: 'height 0.2s'
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* 3. CÔNG CỤ PHÂN CÔNG NHANH */}
                <Grid item xs={12} lg={3}>
                    <Paper sx={{ p: 3, height: 'fit-content' }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            🔍 <Box sx={{ ml: 1 }}>Công cụ Phân công Nhanh</Box>
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<AddIcon />}
                            onClick={() => setQuickAssignDialog(true)}
                            sx={{ mb: 3 }}
                        >
                            Tạo nhiệm vụ khẩn cấp
                        </Button>

                        <Divider sx={{ mb: 2 }} />

                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                            🏆 TOP Nhân công sẵn sàng
                        </Typography>

                        <List dense>
                            {getSuggestedWorkers().map((worker, index) => (
                                <ListItem key={worker.id} sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                        <Badge badgeContent={index + 1} color="primary">
                                            <Avatar sx={{ 
                                                bgcolor: 'primary.main',
                                                width: 32, height: 32 
                                            }}>
                                                {(worker.full_name || 'N')[0]}
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={worker.full_name || `ND-${worker.id}`}
                                        secondary={
                                            <Box>
                                                <Chip 
                                                    label={worker.status.label}
                                                    color={worker.status.color}
                                                    size="small"
                                                />
                                                <Typography variant="caption" display="block">
                                                    Rảnh: {worker.availableHours}h
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => {
                                            setQuickTask({...quickTask, assignTo: worker.id});
                                            setQuickAssignDialog(true);
                                        }}
                                    >
                                        <AssignmentIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog Phân công nhanh */}
            <Dialog 
                open={quickAssignDialog} 
                onClose={() => setQuickAssignDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>⚡ Tạo nhiệm vụ khẩn cấp</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
                        <TextField
                            label="Tên nhiệm vụ"
                            value={quickTask.title}
                            onChange={(e) => setQuickTask({...quickTask, title: e.target.value})}
                            fullWidth
                        />
                        
                        <TextField
                            label="Thời gian bắt đầu"
                            type="time"
                            value={quickTask.startTime}
                            onChange={(e) => setQuickTask({...quickTask, startTime: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel>Địa điểm (Lô)</InputLabel>
                            <Select
                                value={quickTask.location}
                                label="Địa điểm (Lô)"
                                onChange={(e) => setQuickTask({...quickTask, location: e.target.value})}
                            >
                                {lots.map((lot) => (
                                    <MenuItem key={lot.id} value={lot.location || `Lô ${lot.id}`}>
                                        {lot.location || `Lô ${lot.id}`}
                                    </MenuItem>
                                ))}
                                <MenuItem value="Khác">Khác</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <TextField
                            label="Thời lượng (giờ)"
                            type="number"
                            value={quickTask.duration}
                            onChange={(e) => setQuickTask({...quickTask, duration: parseInt(e.target.value)})}
                            fullWidth
                            inputProps={{ min: 1, max: 8 }}
                        />

                        <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                            Đề xuất nhân công phù hợp:
                        </Typography>
                        
                        <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                            {getSuggestedWorkers().map((worker, index) => (
                                <ListItem 
                                    key={worker.id} 
                                    secondaryAction={
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleQuickAssign(worker.id)}
                                            disabled={!quickTask.title || !quickTask.startTime}
                                        >
                                            Phân công
                                        </Button>
                                    }
                                >
                                    <ListItemText
                                        primary={`${index + 1}. ${worker.full_name || `ND-${worker.id}`}`}
                                        secondary={`${worker.status.label} - Rảnh ${worker.availableHours}h`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuickAssignDialog(false)}>Hủy</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
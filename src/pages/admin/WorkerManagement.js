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
    Edit as EditIcon,
    Delete as DeleteIcon,
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
    lotsList,
    listUrgentTasks,
    deleteUrgentTask,
    updateUrgentTask,
    createUrgentTask
} from '../../services/api';

export default function WorkerManagement() {
    const [farmers, setFarmers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [lots, setLots] = useState([]);
    const [availableLots, setAvailableLots] = useState([]);
    const [urgentTasks, setUrgentTasks] = useState([]);
    const [editUrgentDialog, setEditUrgentDialog] = useState(false);
    const [deleteUrgentDialog, setDeleteUrgentDialog] = useState(false);
    const [selectedUrgentTask, setSelectedUrgentTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateRange, setDateRange] = useState(14); // 14 days
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchLocation, setSearchLocation] = useState('');
    const [quickAssignDialog, setQuickAssignDialog] = useState(false);
    const [quickTask, setQuickTask] = useState({
        title: '',
        date: '', // No default date
        timeSlot: '', // 'morning', 'afternoon', 'full'
        location: '',
        assignedWorkers: [] // Array of worker IDs
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [farmersRes, tasksRes, leaveRes, lotsRes, urgentTasksRes] = await Promise.all([
                fetchFarmers(),
                listTasks(),
                fetchLeaveRequests().catch(() => ({ data: [] })),
                lotsList().catch(() => ({ data: [] })),
                listUrgentTasks().catch((error) => {
                    console.error('Error loading urgent tasks:', error);
                    return { data: [] };
                })
            ]);
            
            console.log('Urgent tasks response:', urgentTasksRes);
            
            setFarmers(farmersRes?.data || []);
            setTasks(tasksRes?.data || []);
            setLeaveRequests(leaveRes?.data || []);
            setLots(lotsRes?.data || []);
            setAvailableLots(lotsRes?.data || []);
            setUrgentTasks(urgentTasksRes?.data || []);
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
            .filter(worker => worker.availableHours >= 4) // Minimum 4 hours available
            .sort((a, b) => b.priority - a.priority || b.availableHours - a.availableHours)
            .slice(0, 5);
    };

    // 5. Phân công nhanh - thêm người vào danh sách
    const handleQuickAssign = (workerId) => {
        if (!quickTask.assignedWorkers.includes(workerId)) {
            setQuickTask(prev => ({
                ...prev,
                assignedWorkers: [...prev.assignedWorkers, workerId]
            }));
        }
    };

    // 6. Xóa người khỏi danh sách
    const removeAssignedWorker = (workerId) => {
        setQuickTask(prev => ({
            ...prev,
            assignedWorkers: prev.assignedWorkers.filter(id => id !== workerId)
        }));
    };

    // 7. Lấy toàn bộ lô có mã hợp lệ từ bảng lo_trong (không lọc theo trạng thái)
    const getAllLots = () => {
        return (Array.isArray(availableLots) ? availableLots : [])
            .filter(lot => lot && lot.ma_lo_trong)
            .map(lot => ({
                ma_lo_trong: String(lot.ma_lo_trong),
                status: lot.status || lot.trang_thai || lot.trang_thai_lo || ''
            }))
            .sort((a, b) => Number(a.ma_lo_trong) - Number(b.ma_lo_trong));
    };

    // 8. Lấy danh sách nhiệm vụ khẩn cấp từ bảng nhiem_vu_khan_cap
    const getUrgentTasks = () => {
        return (Array.isArray(urgentTasks) ? urgentTasks : [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    // 10. Xử lý edit nhiệm vụ khẩn cấp
    const handleEditUrgentTask = (task) => {
        setSelectedUrgentTask(task);
        setEditUrgentDialog(true);
    };

    // 11. Xử lý delete nhiệm vụ khẩn cấp
    const handleDeleteUrgentTask = (task) => {
        setSelectedUrgentTask(task);
        setDeleteUrgentDialog(true);
    };

    // 12. Xác nhận xóa nhiệm vụ khẩn cấp
    const confirmDeleteUrgentTask = async () => {
        if (!selectedUrgentTask) return;
        
        try {
            await deleteUrgentTask(selectedUrgentTask.ma_cong_viec);
            alert('Nhiệm vụ khẩn cấp đã được xóa thành công');
            setDeleteUrgentDialog(false);
            setSelectedUrgentTask(null);
            await loadData();
        } catch (error) {
            console.error('Error deleting urgent task:', error);
            alert('Không thể xóa nhiệm vụ khẩn cấp: ' + error.message);
        }
    };

    // 9. Tạo nhiệm vụ cho tất cả người đã chọn
    const createUrgentTasks = async () => {
        if (quickTask.assignedWorkers.length === 0) {
            alert('Vui lòng chọn ít nhất một người để phân công');
            return;
        }

        try {
            const timeSlots = {
                'morning': { start: '07:00', end: '11:00' },
                'afternoon': { start: '13:00', end: '17:00' },
                'full': { start: '07:00', end: '17:00' }
            };

            const selectedSlot = timeSlots[quickTask.timeSlot];
            if (!selectedSlot) {
                alert('Vui lòng chọn ca làm việc');
                return;
            }

            // Tạo nhiệm vụ khẩn cấp và lưu vào bảng nhiem_vu_khan_cap
            const assignedWorkerNames = quickTask.assignedWorkers.map(workerId => {
                const worker = farmers.find(f => f.id === workerId);
                return worker?.full_name || `ND-${workerId}`;
            }).join(', ');

            const urgentTaskData = {
                ten_nhiem_vu: quickTask.title,
                ngay_thuc_hien: quickTask.date,
                thoi_gian_bat_dau: selectedSlot.start,
                thoi_gian_ket_thuc: selectedSlot.end,
                ma_lo_trong: quickTask.location,
                nguoi_tham_gia: quickTask.assignedWorkers.join(','),
                mo_ta: `Nhiệm vụ khẩn cấp - Lô ${quickTask.location}`,
                ghi_chu: `Phân công khẩn cấp qua hệ thống - Người tham gia: ${assignedWorkerNames}`
            };

            console.log('Sending urgent task data:', urgentTaskData);
            
            const result = await createUrgentTask(urgentTaskData);
            
            console.log('API response:', result);
            
            if (result.success) {
                // Tạo 1 nhiệm vụ chung trong lịch làm việc cho tất cả người được phân công
                try {
                    await createTask({
                        ten_cong_viec: quickTask.title,
                        mo_ta: `Nhiệm vụ khẩn cấp - Lô ${quickTask.location}`,
                        loai_cong_viec: 'khac',
                        ngay_bat_dau: quickTask.date,
                        ngay_ket_thuc: quickTask.date,
                        thoi_gian_bat_dau: selectedSlot.start,
                        thoi_gian_ket_thuc: selectedSlot.end,
                        trang_thai: 'chua_bat_dau',
                        uu_tien: 'cao',
                        ma_nguoi_dung: quickTask.assignedWorkers.join(','), // Nhiều người cùng làm 1 việc
                        ghi_chu: `Nhiệm vụ khẩn cấp - Người tham gia: ${assignedWorkerNames}`
                    });
                    
                    alert(`Đã tạo nhiệm vụ khẩn cấp thành công! ID: ${result.ma_cong_viec}\nNhiệm vụ đã được thêm vào Lịch làm việc (${quickTask.assignedWorkers.length} người làm chung).`);
                    
                } catch (scheduleError) {
                    console.error('Error creating schedule task:', scheduleError);
                    alert(`Đã tạo nhiệm vụ khẩn cấp thành công! ID: ${result.ma_cong_viec}\nTuy nhiên có lỗi khi thêm vào Lịch làm việc: ${scheduleError.message}`);
                }
                
                // Reset form
                setQuickTask({ 
                    title: '', 
                    date: '', 
                    timeSlot: '', 
                    location: '', 
                    assignedWorkers: [] 
                });
                
                setQuickAssignDialog(false);
                
                // Reload data để hiển thị nhiệm vụ mới
                await loadData();
            } else {
                console.error('Create urgent task failed:', result);
                alert('Không thể tạo nhiệm vụ khẩn cấp: ' + (result.error || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Error creating urgent tasks:', error);
            alert('Không thể tạo nhiệm vụ khẩn cấp');
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
                            label="Ngày thực hiện"
                            type="date"
                            value={quickTask.date}
                            onChange={(e) => setQuickTask({...quickTask, date: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        
                        <FormControl fullWidth>
                            <InputLabel>Ca làm việc</InputLabel>
                            <Select
                                value={quickTask.timeSlot}
                                label="Ca làm việc"
                                onChange={(e) => setQuickTask({...quickTask, timeSlot: e.target.value})}
                            >
                                <MenuItem value="morning">Ca sáng (7h-11h)</MenuItem>
                                <MenuItem value="afternoon">Ca chiều (13h-17h)</MenuItem>
                                <MenuItem value="full">Cả ngày (7h-17h)</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel>Địa điểm (Lô)</InputLabel>
                            <Select
                                value={quickTask.location}
                                label="Địa điểm (Lô)"
                                onChange={(e) => setQuickTask({...quickTask, location: e.target.value})}
                            >
                                {getAllLots().map((lot) => (
                                    <MenuItem key={lot.ma_lo_trong} value={lot.ma_lo_trong}>
                                        Lô {lot.ma_lo_trong}{lot.status ? ` - ${lot.status}` : ''}
                                    </MenuItem>
                                ))}
                                <MenuItem value="Khác">Khác</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Hiển thị người đã chọn */}
                        {quickTask.assignedWorkers.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Người đã chọn ({quickTask.assignedWorkers.length}):
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {quickTask.assignedWorkers.map(workerId => {
                                        const worker = farmers.find(f => f.id === workerId);
                                        return (
                                            <Chip
                                                key={workerId}
                                                label={worker?.full_name || `ND-${workerId}`}
                                                onDelete={() => removeAssignedWorker(workerId)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}

                        <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                            Đề xuất nhân công phù hợp:
                        </Typography>
                        
                        <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                            {getSuggestedWorkers().map((worker, index) => {
                                const isAssigned = quickTask.assignedWorkers.includes(worker.id);
                                return (
                                    <ListItem 
                                        key={worker.id} 
                                        secondaryAction={
                                            <Button
                                                size="small"
                                                variant={isAssigned ? "outlined" : "contained"}
                                                color={isAssigned ? "success" : "primary"}
                                                onClick={() => isAssigned ? removeAssignedWorker(worker.id) : handleQuickAssign(worker.id)}
                                                disabled={!quickTask.title || !quickTask.timeSlot || !quickTask.location}
                                            >
                                                {isAssigned ? "Đã chọn" : "Phân công"}
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={`${index + 1}. ${worker.full_name || `ND-${worker.id}`}`}
                                            secondary={`${worker.status.label} - Rảnh ${worker.availableHours}h`}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuickAssignDialog(false)}>Hủy</Button>
                    <Button 
                        variant="contained" 
                        onClick={createUrgentTasks}
                        disabled={quickTask.assignedWorkers.length === 0}
                        color="success"
                    >
                        Tạo nhiệm vụ chung ({quickTask.assignedWorkers.length} người)
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Danh sách nhiệm vụ khẩn cấp */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    ⚡ Danh sách nhiệm vụ khẩn cấp
                </Typography>
                
                {getUrgentTasks().length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography variant="body2" color="text.secondary">
                            Chưa có nhiệm vụ khẩn cấp nào
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={2}>
                        {getUrgentTasks().map((task, index) => {
                            const assignedWorkers = task.nguoi_tham_gia ? task.nguoi_tham_gia.split(',') : [];
                            const workerNames = assignedWorkers.map(workerId => {
                                // Xử lý cả ID số và format "ND-X"
                                let actualId = workerId.trim();
                                if (actualId.startsWith('ND-')) {
                                    actualId = actualId.replace('ND-', '');
                                }
                                
                                const worker = farmers.find(f => f.id == actualId || f.id === actualId);
                                return worker?.full_name || `ND-${actualId}`;
                            }).join(', ');

                            return (
                                <Grid item xs={12} md={6} lg={4} key={task.ma_cong_viec || index}>
                                    <Card sx={{ 
                                        border: '1px solid', 
                                        borderColor: 'error.main',
                                        bgcolor: 'error.50',
                                        '&:hover': {
                                            boxShadow: 3,
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                    {task.ten_nhiem_vu}
                                                </Typography>
                                                <Chip 
                                                    label="Khẩn cấp" 
                                                    color="error" 
                                                    size="small"
                                                />
                                            </Box>
                                            
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                📅 Ngày: {task.ngay ? new Date(task.ngay).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                                            </Typography>
                                            
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                ⏰ Thời gian: {task.thoi_gian || `${task.thoi_gian_bat_dau} - ${task.thoi_gian_ket_thuc}`}
                                            </Typography>
                                            
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                📍 Địa điểm: {task.dia_diem || `Lô ${task.ma_lo_trong}`}
                                            </Typography>
                                            
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                👥 Người tham gia ({assignedWorkers.length}): {workerNames}
                                            </Typography>
                                            
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                📝 Mô tả: {task.mo_ta}
                                            </Typography>
                                            
                                            {task.ghi_chu && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                                                    💬 Ghi chú: {task.ghi_chu}
                                                </Typography>
                                            )}
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip 
                                                        label={task.trang_thai === 'chua_bat_dau' ? 'Chưa bắt đầu' : 
                                                               task.trang_thai === 'dang_thuc_hien' ? 'Đang thực hiện' : 
                                                               task.trang_thai === 'hoan_thanh' ? 'Hoàn thành' : task.trang_thai}
                                                        color={task.trang_thai === 'chua_bat_dau' ? 'default' : 
                                                               task.trang_thai === 'dang_thuc_hien' ? 'warning' : 
                                                               task.trang_thai === 'hoan_thanh' ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                    <IconButton 
                                                        size="small" 
                                                        color="primary"
                                                        onClick={() => handleEditUrgentTask(task)}
                                                        title="Sửa nhiệm vụ"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDeleteUrgentTask(task)}
                                                        title="Xóa nhiệm vụ"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {task.ma_cong_viec}
                                                </Typography>
                                            </Box>
                                            
                                            {task.created_at && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                    Tạo lúc: {new Date(task.created_at).toLocaleString('vi-VN')}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

            {/* Dialog xác nhận xóa nhiệm vụ khẩn cấp */}
            <Dialog 
                open={deleteUrgentDialog} 
                onClose={() => setDeleteUrgentDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Xác nhận xóa nhiệm vụ khẩn cấp</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa nhiệm vụ "{selectedUrgentTask?.ten_nhiem_vu}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteUrgentDialog(false)}>
                        Hủy
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={confirmDeleteUrgentTask}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog sửa nhiệm vụ khẩn cấp */}
            <Dialog 
                open={editUrgentDialog} 
                onClose={() => setEditUrgentDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Sửa nhiệm vụ khẩn cấp</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Chức năng sửa nhiệm vụ khẩn cấp sẽ được implement sau.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUrgentDialog(false)}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
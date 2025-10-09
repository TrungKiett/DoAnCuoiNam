import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
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
    Chip,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    LinearProgress,
    Stack,
    Checkbox
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    Assessment as AssessmentIcon,
    WorkHistory as WorkHistoryIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    PriceCheck as PriceCheckIcon,
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { 
    fetchFarmers, 
    listTasks, 
    fetchLeaveRequests
} from '../../services/api';

export default function PayrollReports() {
    const [farmers, setFarmers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payrollPeriod, setPayrollPeriod] = useState('weekly');
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [cutoffDate, setCutoffDate] = useState(new Date().toISOString().split('T')[0]);
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Payroll settings
    const HOURLY_RATE = 30000; // 30,000 VND per hour
    const OVERTIME_MULTIPLIER = 1.5;
    const STANDARD_HOURS_PER_DAY = 8;
    const STANDARD_HOURS_PER_WEEK = 40;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [farmersRes, tasksRes, leaveRes] = await Promise.all([
                fetchFarmers(),
                listTasks(),
                fetchLeaveRequests().catch(() => ({ data: [] }))
            ]);
            
            setFarmers(farmersRes?.data || []);
            setTasks(tasksRes?.data || []);
            setLeaveRequests(leaveRes?.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Tính toán ngày bắt đầu và kết thúc của kỳ lương
    const getPayrollPeriodDates = () => {
        const currentDate = new Date();
        let startDate, endDate;

        if (payrollPeriod === 'weekly') {
            // Tính tuần (giả sử tuần 1 bắt đầu từ đầu tháng)
            const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
            const firstMonday = new Date(firstDayOfMonth);
            firstMonday.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + 1);
            
            startDate = new Date(firstMonday);
            startDate.setDate(firstMonday.getDate() + (selectedWeek - 1) * 7);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else {
            // Monthly
            startDate = new Date(selectedYear, selectedMonth - 1, 1);
            endDate = new Date(selectedYear, selectedMonth, 0); // Last day of month
        }

        return { startDate, endDate };
    };

    // 2. Tính toán giờ làm việc cho nhân công trong kỳ
    const calculateWorkerHours = (workerId, startDate, endDate) => {
        const workerTasks = tasks.filter(task => {
            if (!task.ma_nguoi_dung) return false;
            const assignedWorkers = String(task.ma_nguoi_dung).split(',').map(id => id.trim());
            const taskDate = new Date(task.ngay_bat_dau);
            return assignedWorkers.includes(String(workerId)) && 
                   taskDate >= startDate && 
                   taskDate <= endDate;
        });

        let regularHours = 0;
        let overtimeHours = 0;
        const dailyHours = {};

        workerTasks.forEach(task => {
            const taskDate = task.ngay_bat_dau;
            const startTime = task.thoi_gian_bat_dau || '08:00';
            const endTime = task.thoi_gian_ket_thuc || '17:00';
            
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const hours = (endH + endM/60) - (startH + startM/60);

            if (!dailyHours[taskDate]) {
                dailyHours[taskDate] = 0;
            }
            dailyHours[taskDate] += Math.max(0, hours);
        });

        // Tính regular và overtime hours
        Object.values(dailyHours).forEach(dayHours => {
            if (dayHours <= STANDARD_HOURS_PER_DAY) {
                regularHours += dayHours;
            } else {
                regularHours += STANDARD_HOURS_PER_DAY;
                overtimeHours += dayHours - STANDARD_HOURS_PER_DAY;
            }
        });

        return { 
            regularHours: Math.round(regularHours * 100) / 100, 
            overtimeHours: Math.round(overtimeHours * 100) / 100,
            tasks: workerTasks,
            dailyHours
        };
    };

    // 3. Tính toán bảng lương cho tất cả nhân công
    const getPayrollData = () => {
        const { startDate, endDate } = getPayrollPeriodDates();
        
        return farmers.map(worker => {
            const { regularHours, overtimeHours, tasks: workerTasks, dailyHours } = calculateWorkerHours(worker.id, startDate, endDate);
            
            const totalHours = regularHours + overtimeHours;
            const totalPay = totalHours * HOURLY_RATE;

            return {
                ...worker,
                totalHours,
                hourlyRate: HOURLY_RATE,
                totalPay,
                status: 'pending', // pending, approved, paid
                tasks: workerTasks,
                dailyHours
            };
        });
    };

    // 4. Tính toán KPIs tổng quan
    const getPayrollSummary = () => {
        const payrollData = getPayrollData();
        
        const totalHours = payrollData.reduce((sum, worker) => sum + worker.totalHours, 0);
        const totalCost = payrollData.reduce((sum, worker) => sum + worker.totalPay, 0);

        // Giả sử tính chi phí trên kg sản phẩm (cần dữ liệu sản lượng thực tế)
        const estimatedOutput = 10000; // 10,000 kg (giả định)
        const costPerKg = totalCost / estimatedOutput;

        return {
            totalHours: Math.round(totalHours),
            totalCost,
            costPerKg: Math.round(costPerKg),
            workerCount: payrollData.length
        };
    };

    // 5. Phát hiện cảnh báo
    const getAlerts = () => {
        const payrollData = getPayrollData();
        const alerts = [];

        payrollData.forEach(worker => {
            const totalWeeklyHours = worker.totalHours;
            
            // Cảnh báo quá tải
            if (totalWeeklyHours > 50) {
                alerts.push({
                    type: 'overwork',
                    severity: 'error',
                    worker: worker.full_name || `ND-${worker.id}`,
                    message: `Làm việc ${totalWeeklyHours.toFixed(1)}h (vượt 50h/tuần)`,
                    value: totalWeeklyHours
                });
            }

            // Cảnh báo chi phí cao
            if (worker.totalPay > 2000000) { // > 2M VND
                alerts.push({
                    type: 'high_cost',
                    severity: 'warning',
                    worker: worker.full_name || `ND-${worker.id}`,
                    message: `Chi phí lương cao: ${worker.totalPay.toLocaleString('vi-VN')} VND`,
                    value: worker.totalPay
                });
            }

            // Cảnh báo giờ làm việc thấp
            if (totalWeeklyHours < 20 && totalWeeklyHours > 0) {
                alerts.push({
                    type: 'underwork',
                    severity: 'info',
                    worker: worker.full_name || `ND-${worker.id}`,
                    message: `Giờ làm việc thấp: ${totalWeeklyHours.toFixed(1)}h`,
                    value: totalWeeklyHours
                });
            }
        });

        return alerts.sort((a, b) => {
            const severityOrder = { error: 3, warning: 2, info: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    };

    // 6. Xử lý duyệt lương
    const handleSelectWorker = (workerId) => {
        setSelectedWorkers(prev => {
            if (prev.includes(workerId)) {
                return prev.filter(id => id !== workerId);
            } else {
                return [...prev, workerId];
            }
        });
    };

    const handleSelectAll = () => {
        const payrollData = getPayrollData();
        if (selectAll) {
            setSelectedWorkers([]);
        } else {
            setSelectedWorkers(payrollData.filter(w => w.status === 'pending').map(w => w.id));
        }
        setSelectAll(!selectAll);
    };

    const handleApproveSelected = () => {
        if (selectedWorkers.length === 0) {
            alert('Vui lòng chọn ít nhất một nhân công để duyệt lương');
            return;
        }
        
        if (window.confirm(`Xác nhận duyệt lương cho ${selectedWorkers.length} nhân công được chọn?`)) {
            // TODO: Call API to update status
            console.log('Approved workers:', selectedWorkers);
            alert(`Đã duyệt lương cho ${selectedWorkers.length} nhân công`);
            setSelectedWorkers([]);
            setSelectAll(false);
        }
    };

    const handleRejectSelected = () => {
        if (selectedWorkers.length === 0) {
            alert('Vui lòng chọn ít nhất một nhân công để từ chối');
            return;
        }
        
        if (window.confirm(`Xác nhận từ chối lương cho ${selectedWorkers.length} nhân công được chọn?`)) {
            // TODO: Call API to update status
            console.log('Rejected workers:', selectedWorkers);
            alert(`Đã từ chối lương cho ${selectedWorkers.length} nhân công`);
            setSelectedWorkers([]);
            setSelectAll(false);
        }
    };

    // 7. Export CSV
    const exportPayroll = () => {
        const payrollData = getPayrollData();
        const { startDate, endDate } = getPayrollPeriodDates();
        
        const headers = [
            'STT',
            'Tên nhân công',
            'Tổng giờ làm việc',
            'Mức lương/giờ (VND)',
            'Tổng thu nhập (VND)',
            'Trạng thái'
        ];

        const csvContent = [
            headers.join(','),
            ...payrollData.map((worker, index) => [
                index + 1,
                `"${worker.full_name || `ND-${worker.id}`}"`,
                worker.totalHours,
                worker.hourlyRate.toLocaleString('vi-VN'),
                worker.totalPay.toLocaleString('vi-VN'),
                worker.status === 'pending' ? 'Chờ duyệt' : 
                worker.status === 'approved' ? 'Đã duyệt' : 'Đã thanh toán'
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `BangLuong_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const payrollData = getPayrollData();
    const summary = getPayrollSummary();
    const alerts = getAlerts();

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
                💰 Báo cáo Tính Lương và Giờ Công
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                📊 Tính lương theo kỳ với dữ liệu chấm công tự động từ lịch làm việc
            </Typography>

            <Grid container spacing={3}>
                {/* 1. KHU VỰC BỘ LỌC & TỔNG QUAN KỲ LƯƠNG */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            📅 <Box sx={{ ml: 1 }}>Bộ lọc & Tổng quan Kỳ Lương</Box>
                        </Typography>

                        {/* Period Selection */}
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Phạm vi tính toán</InputLabel>
                                <Select
                                    value={payrollPeriod}
                                    label="Phạm vi tính toán"
                                    onChange={(e) => setPayrollPeriod(e.target.value)}
                                >
                                    <MenuItem value="weekly">Theo tuần</MenuItem>
                                    <MenuItem value="monthly">Theo tháng</MenuItem>
                                </Select>
                            </FormControl>

                            {payrollPeriod === 'weekly' ? (
                                <Stack direction="row" spacing={1}>
                                    <FormControl size="small" sx={{ minWidth: 80 }}>
                                        <InputLabel>Tuần</InputLabel>
                                        <Select
                                            value={selectedWeek}
                                            label="Tuần"
                                            onChange={(e) => setSelectedWeek(e.target.value)}
                                        >
                                            {[1,2,3,4,5].map(week => (
                                                <MenuItem key={week} value={week}>Tuần {week}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ minWidth: 80 }}>
                                        <InputLabel>Tháng</InputLabel>
                                        <Select
                                            value={selectedMonth}
                                            label="Tháng"
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                        >
                                            {Array.from({length: 12}, (_, i) => (
                                                <MenuItem key={i+1} value={i+1}>T{i+1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            ) : (
                                <Stack direction="row" spacing={1}>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>Tháng</InputLabel>
                                        <Select
                                            value={selectedMonth}
                                            label="Tháng"
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                        >
                                            {Array.from({length: 12}, (_, i) => (
                                                <MenuItem key={i+1} value={i+1}>Tháng {i+1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ minWidth: 80 }}>
                                        <InputLabel>Năm</InputLabel>
                                        <Select
                                            value={selectedYear}
                                            label="Năm"
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                        >
                                            {[2024, 2025, 2026].map(year => (
                                                <MenuItem key={year} value={year}>{year}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            )}

                            <TextField
                                label="Ngày khóa sổ"
                                type="date"
                                value={cutoffDate}
                                onChange={(e) => setCutoffDate(e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>

                        {/* KPI Cards */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <ScheduleIcon sx={{ mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {summary.totalHours.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2">Tổng giờ làm việc</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <MoneyIcon sx={{ mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {(summary.totalCost / 1000000).toFixed(1)}M
                                        </Typography>
                                        <Typography variant="body2">Tổng chi phí lương</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <PriceCheckIcon sx={{ mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {summary.costPerKg.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2">VND/kg sản phẩm</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                                    <CardContent sx={{ py: 2 }}>
                                        <PersonIcon sx={{ mb: 1 }} />
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {summary.workerCount}
                                        </Typography>
                                        <Typography variant="body2">Số nhân công</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* 3. BÁO CÁO BIẾN ĐỘNG VÀ CẢNH BÁO */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            ⚠️ <Box sx={{ ml: 1 }}>Báo cáo Biến động & Cảnh báo</Box>
                        </Typography>

                        {alerts.length === 0 ? (
                            <Alert severity="success" icon={<CheckCircleIcon />}>
                                Không có cảnh báo nào trong kỳ này
                            </Alert>
                        ) : (
                            <List dense>
                                {alerts.slice(0, 10).map((alert, index) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            {alert.severity === 'error' ? 
                                                <ErrorIcon color="error" /> :
                                                alert.severity === 'warning' ?
                                                <WarningIcon color="warning" /> :
                                                <ErrorIcon color="info" />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={alert.worker}
                                            secondary={alert.message}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        <Divider sx={{ my: 2 }} />
                        
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<DownloadIcon />}
                            onClick={exportPayroll}
                            sx={{ mb: 1 }}
                        >
                            Xuất Bảng Lương (CSV)
                        </Button>
                    </Paper>
                </Grid>

                {/* 2. CHI TIẾT BẢNG LƯƠNG */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                📋 <Box sx={{ ml: 1 }}>Chi tiết Bảng lương - {payrollPeriod === 'weekly' ? `Tuần ${selectedWeek}` : `Tháng ${selectedMonth}`}/{selectedYear}</Box>
                            </Typography>
                            
                            {selectedWorkers.length > 0 && (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<CheckIcon />}
                                        onClick={handleApproveSelected}
                                    >
                                        Duyệt ({selectedWorkers.length})
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        startIcon={<CloseIcon />}
                                        onClick={handleRejectSelected}
                                    >
                                        Từ chối ({selectedWorkers.length})
                                    </Button>
                                </Stack>
                            )}
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                indeterminate={selectedWorkers.length > 0 && selectedWorkers.length < payrollData.filter(w => w.status === 'pending').length}
                                            />
                                        </TableCell>
                                        <TableCell>STT</TableCell>
                                        <TableCell>Tên Nhân công</TableCell>
                                        <TableCell align="right">Tổng giờ làm việc</TableCell>
                                        <TableCell align="right">Mức lương/Giờ</TableCell>
                                        <TableCell align="right">Tổng Thu nhập</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payrollData.map((worker, index) => (
                                        <TableRow key={worker.id} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedWorkers.includes(worker.id)}
                                                    onChange={() => handleSelectWorker(worker.id)}
                                                    disabled={worker.status !== 'pending'}
                                                />
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                                                    {worker.full_name || `ND-${worker.id}`}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{worker.totalHours}h</TableCell>
                                            <TableCell align="right">{worker.hourlyRate.toLocaleString('vi-VN')} ₫</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {worker.totalPay.toLocaleString('vi-VN')} ₫
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={worker.status === 'pending' ? 'Chờ duyệt' : 
                                                           worker.status === 'approved' ? 'Đã duyệt' : 'Đã thanh toán'}
                                                    color={worker.status === 'pending' ? 'warning' : 
                                                           worker.status === 'approved' ? 'primary' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Xem chi tiết chấm công">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedWorker(worker);
                                                            setDetailDialog(true);
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Summary Row */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        TỔNG CỘNG
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="body1">
                                        Tổng giờ: <strong>{summary.totalHours.toLocaleString()} giờ</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="body1">
                                        Tổng chi phí: <strong>{summary.totalCost.toLocaleString('vi-VN')} ₫</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography variant="body1">
                                        Số người: <strong>{summary.workerCount}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography variant="body1">
                                        TB/người: <strong>{(summary.totalCost / summary.workerCount).toLocaleString('vi-VN')} ₫</strong>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog Chi tiết Chấm công */}
            <Dialog 
                open={detailDialog} 
                onClose={() => setDetailDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    📋 Chi tiết chấm công - {selectedWorker?.full_name || `ND-${selectedWorker?.id}`}
                </DialogTitle>
                <DialogContent>
                    {selectedWorker && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Nhật ký làm việc trong kỳ
                            </Typography>
                            
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ngày</TableCell>
                                            <TableCell>Công việc</TableCell>
                                            <TableCell>Thời gian</TableCell>
                                            <TableCell align="right">Số giờ</TableCell>
                                            <TableCell>Địa điểm</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedWorker.tasks?.map((task, index) => {
                                            const startTime = task.thoi_gian_bat_dau || '08:00';
                                            const endTime = task.thoi_gian_ket_thuc || '17:00';
                                            const [startH, startM] = startTime.split(':').map(Number);
                                            const [endH, endM] = endTime.split(':').map(Number);
                                            const hours = (endH + endM/60) - (startH + startM/60);

                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{task.ngay_bat_dau}</TableCell>
                                                    <TableCell>{task.ten_cong_viec}</TableCell>
                                                    <TableCell>{startTime} - {endTime}</TableCell>
                                                    <TableCell align="right">{hours.toFixed(1)}h</TableCell>
                                                    <TableCell>{task.ghi_chu || 'Không ghi'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Daily Hours Summary */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Tổng hợp giờ theo ngày
                                </Typography>
                                <Grid container spacing={1}>
                                    {Object.entries(selectedWorker.dailyHours || {}).map(([date, hours]) => (
                                        <Grid item xs={3} key={date}>
                                            <Card sx={{ p: 1, textAlign: 'center', bgcolor: hours > 8 ? 'warning.light' : 'grey.100' }}>
                                                <Typography variant="caption" display="block">{date}</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    {hours.toFixed(1)}h
                                                </Typography>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

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
    fetchLeaveRequests,
    fetchPayrollData,
    updateHourlyRate,
    upsertPayrollRecord
} from '../../services/api';

// Helper: get week-of-month index (1..5) where weeks start on Monday
function getWeekOfMonthIndex(year, monthIndexOneBased, dayOfMonth) {
    const monthIndexZeroBased = monthIndexOneBased - 1;
    const firstOfMonth = new Date(year, monthIndexZeroBased, 1);
    // getDay(): 0=Sun, 1=Mon, ... 6=Sat -> convert to Monday-based offset
    const firstDay = firstOfMonth.getDay();
    const offsetToMonday = ((firstDay + 6) % 7); // 0 if Monday, 6 if Sunday
    const adjustedDate = dayOfMonth + offsetToMonday;
    return Math.min(5, Math.floor((adjustedDate - 1) / 7) + 1);
}

export default function PayrollReports() {
    const [farmers, setFarmers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payrollPeriod, setPayrollPeriod] = useState('weekly');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWeek, setSelectedWeek] = useState(() => {
        const today = new Date();
        return getWeekOfMonthIndex(today.getFullYear(), today.getMonth() + 1, today.getDate());
    });
    const [cutoffDate, setCutoffDate] = useState(new Date().toISOString().split('T')[0]);
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [editingRateValue, setEditingRateValue] = useState('');
    const [sortOption, setSortOption] = useState('hours_desc'); // hours_desc | hours_asc | income_desc | income_asc

    // Payroll settings
    const HOURLY_RATE = 30000; // 30,000 VND per hour
    const OVERTIME_MULTIPLIER = 1.5;
    const STANDARD_HOURS_PER_DAY = 8;
    const STANDARD_HOURS_PER_WEEK = 40;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadPayrollData();
    }, [payrollPeriod, selectedWeek, selectedMonth, selectedYear]);

    // If user switches month/year while on weekly mode, auto-jump to the week that contains today (if same month/year) or to week 1 otherwise
    useEffect(() => {
        if (payrollPeriod !== 'weekly') return;
        const today = new Date();
        if (selectedYear === today.getFullYear() && selectedMonth === (today.getMonth() + 1)) {
            const weekNow = getWeekOfMonthIndex(today.getFullYear(), today.getMonth() + 1, today.getDate());
            setSelectedWeek(weekNow);
        } else {
            setSelectedWeek(1);
        }
    }, [payrollPeriod, selectedMonth, selectedYear]);

    // Build completed task list for a worker within current payroll period
    const buildCompletedTasksForWorker = (workerId) => {
        const { startDate, endDate } = getPayrollPeriodDates();
        const start = new Date(startDate.toISOString().split('T')[0]);
        const end = new Date(endDate.toISOString().split('T')[0]);

        const workerCode = 'ND' + String(workerId).padStart(3, '0');
        const isCompleted = (status) => status === 'hoan_thanh' || status === 'da_hoan_thanh';

        const filtered = (tasks || []).filter(t => {
            if (!isCompleted(t.trang_thai || '')) return false;
            if (!t.ngay_bat_dau) return false;
            const d = new Date(t.ngay_bat_dau);
            if (d < start || d > end) return false;
            const assigned = String(t.ma_nguoi_dung || '')
                .split(',')
                .map(s => s.trim());
            return assigned.includes(String(workerId)) || assigned.includes(workerCode);
        });

        // Build daily hours
        const daily = {};
        filtered.forEach(t => {
            const startStr = t.thoi_gian_bat_dau || null;
            const endStr = t.thoi_gian_ket_thuc || null;
            let hours = 0;
            if (startStr && endStr) {
                const [sh, sm = 0] = startStr.split(':').map(Number);
                const [eh, em = 0] = endStr.split(':').map(Number);
                let startMin = sh * 60 + sm;
                let endMin = eh * 60 + em;
                if (endMin < startMin) endMin += 24 * 60;
                hours = (endMin - startMin) / 60;
            }
            if (hours <= 0 && t.thoi_gian_du_kien) {
                hours = parseFloat(t.thoi_gian_du_kien) || 0;
            }
            const key = t.ngay_bat_dau;
            daily[key] = (daily[key] || 0) + Math.max(0, hours);
        });

        return { tasks: filtered, dailyHours: daily };
    };

    const loadData = async () => {
        try {
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
        }
    };

    const loadPayrollData = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getPayrollPeriodDates();
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            console.log('Loading payroll for date range:', startDateStr, 'to', endDateStr);
            console.log('Selected period:', payrollPeriod, 'Week:', selectedWeek, 'Month:', selectedMonth, 'Year:', selectedYear);
            
            const response = await fetchPayrollData(startDateStr, endDateStr, payrollPeriod === 'weekly' ? selectedWeek : undefined, selectedYear);
            console.log('Payroll data received:', response);
            setPayrollData(response?.data || []);
        } catch (error) {
            console.error('Error loading payroll data:', error);
            setPayrollData([]);
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

    // 3. Get payroll data from API
    const getPayrollData = () => {
        // Use the payrollData loaded from API
        return payrollData.map(item => ({
            id: item.worker_id,
            full_name: item.full_name || `Worker-${item.worker_id}`,
            totalHours: parseFloat(item.total_hours) || 0,
            hourlyRate: parseFloat(item.hourly_rate) || HOURLY_RATE,
            totalPay: parseFloat(item.total_income) || 0,
            status: item.status || 'pending',
            tasks: [],
            dailyHours: {}
        }));
    };

    // 4. Tính toán KPIs tổng quan
    const getPayrollSummary = () => {
        const processedData = getPayrollData();
        
        const totalHours = processedData.reduce((sum, worker) => sum + worker.totalHours, 0);
        const totalCost = processedData.reduce((sum, worker) => sum + worker.totalPay, 0);

        // Giả sử tính chi phí trên kg sản phẩm (cần dữ liệu sản lượng thực tế)
        const estimatedOutput = 10000; // 10,000 kg (giả định)
        const costPerKg = totalCost / estimatedOutput;

        return {
            totalHours: Math.round(totalHours),
            totalCost,
            costPerKg: Math.round(costPerKg),
            workerCount: processedData.length
        };
    };

    // 5. Phát hiện cảnh báo
    const getAlerts = () => {
        const processedData = getPayrollData();
        const alerts = [];

        processedData.forEach(worker => {
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
        const processedData = getPayrollData();
        if (selectAll) {
            setSelectedWorkers([]);
        } else {
            setSelectedWorkers(processedData
                .filter(w => w.status === 'pending' && (w.totalHours || 0) > 0)
                .map(w => w.id));
        }
        setSelectAll(!selectAll);
    };

    const handleApproveSelected = () => {
        if (selectedWorkers.length === 0) {
            alert('Vui lòng chọn ít nhất một nhân công để duyệt lương');
            return;
        }
        const processedData = getPayrollData();
        const zeroHourSelected = processedData.some(w => selectedWorkers.includes(w.id) && ((w.totalHours || 0) === 0));
        if (zeroHourSelected) {
            alert('Không thể duyệt nhân công có tổng giờ làm việc = 0h');
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
        const processedData = getPayrollData();
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
            ...processedData.map((worker, index) => [
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

    // Export all farmers list
    const exportAllFarmers = async () => {
        try {
            const response = await fetchFarmers();
            const farmersList = response?.data || [];
            
            const headers = ['STT', 'Mã Nhân công', 'Tên Nhân công', 'Số điện thoại', 'Email', 'Vai trò'];
            
            const csvContent = [
                headers.join(','),
                ...farmersList.map((farmer, index) => [
                    index + 1,
                    farmer.id,
                    `"${farmer.full_name || ''}"`,
                    farmer.phone || '',
                    farmer.email || '',
                    farmer.vai_tro || 'nong_dan'
                ].join(','))
            ].join('\n');
            
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `DanhSachNongDan_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error('Error exporting farmers:', error);
            alert('Không thể xuất danh sách nông dân: ' + error.message);
        }
    };

    const processedPayrollData = React.useMemo(() => {
        const data = getPayrollData();
        const arr = [...data];
        switch (sortOption) {
            case 'hours_asc':
                arr.sort((a, b) => (a.totalHours || 0) - (b.totalHours || 0));
                break;
            case 'income_desc':
                arr.sort((a, b) => (b.totalPay || 0) - (a.totalPay || 0));
                break;
            case 'income_asc':
                arr.sort((a, b) => (a.totalPay || 0) - (b.totalPay || 0));
                break;
            case 'hours_desc':
            default:
                arr.sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0));
        }
        return arr;
    }, [payrollData, sortOption]);
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
                        
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<DownloadIcon />}
                            onClick={exportAllFarmers}
                            sx={{ mb: 1 }}
                            color="secondary"
                        >
                            Xuất Danh Sách Nông Dân (CSV)
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
                            
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel>Sắp xếp</InputLabel>
                                    <Select
                                        label="Sắp xếp"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                    >
                                        <MenuItem value="hours_desc">Giờ làm - Giảm dần</MenuItem>
                                        <MenuItem value="hours_asc">Giờ làm - Tăng dần</MenuItem>
                                        <MenuItem value="income_desc">Thu nhập - Giảm dần</MenuItem>
                                        <MenuItem value="income_asc">Thu nhập - Tăng dần</MenuItem>
                                    </Select>
                                </FormControl>

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
                            </Stack>
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                indeterminate={selectedWorkers.length > 0 && selectedWorkers.length < processedPayrollData.filter(w => w.status === 'pending').length}
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
                                    {processedPayrollData.map((worker, index) => (
                                        <TableRow key={worker.id} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedWorkers.includes(worker.id)}
                                                    onChange={() => handleSelectWorker(worker.id)}
                                                    disabled={(['pending', 'Chờ duyệt'].includes(worker.status) ? false : true) || (worker.totalHours || 0) === 0}
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
                                            <TableCell align="right">
                                                {editingRate === worker.id ? (
                                                    <TextField
                                                        size="small"
                                                        value={editingRateValue}
                                                        onChange={(e) => setEditingRateValue(e.target.value)}
                                                        onBlur={async () => {
                                                            try {
                                                                const { startDate, endDate } = getPayrollPeriodDates();
                                                                await updateHourlyRate(worker.id, parseFloat(editingRateValue), startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                                                                await loadPayrollData();
                                                                setEditingRate(null);
                                                            } catch (e) {
                                                                console.error('Error updating rate:', e);
                                                                setEditingRate(null);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.target.blur();
                                                            } else if (e.key === 'Escape') {
                                                                setEditingRate(null);
                                                            }
                                                        }}
                                                        sx={{ width: 100 }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <Box 
                                                        onClick={() => {
                                                            setEditingRate(worker.id);
                                                            setEditingRateValue(worker.hourlyRate.toString());
                                                        }}
                                                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'grey.100' }, px: 1, py: 0.5, borderRadius: 1 }}
                                                    >
                                                        {worker.hourlyRate.toLocaleString('vi-VN')} ₫
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {worker.totalPay.toLocaleString('vi-VN')} ₫
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={(['pending', 'Chờ duyệt'].includes(worker.status)) ? 'Chờ duyệt' : 'Đã duyệt'}
                                                    color={(['pending', 'Chờ duyệt'].includes(worker.status)) ? 'warning' : 'primary'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Xem chi tiết chấm công">
                                                <IconButton 
                                                        size="small"
                                                        onClick={() => {
                                                            const built = buildCompletedTasksForWorker(worker.id);
                                                            setSelectedWorker({ ...worker, ...built });
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
                    <Button
                        variant="contained"
                        onClick={async () => {
                            if (!selectedWorker) return;
                            if ((selectedWorker.totalHours || 0) === 0) {
                                alert('Không thể duyệt khi Tổng giờ làm việc = 0h');
                                return;
                            }
                            try {
                                const period = getPayrollPeriodDates();
                                const week = payrollPeriod === 'weekly' ? selectedWeek : 1;
                                const year = selectedYear;
                                const periodName = `Chi tiết Bảng lương - ${payrollPeriod === 'weekly' ? `Tuần ${week}` : `Tháng ${selectedMonth}`}/${year}`;
                                await upsertPayrollRecord({
                                    worker_id: selectedWorker.id,
                                    total_hours: selectedWorker.totalHours || 0,
                                    hourly_rate: selectedWorker.hourlyRate || HOURLY_RATE,
                                    status: 'Đã duyệt',
                                    week,
                                    year,
                                    period_name: periodName
                                });
                                await loadPayrollData();
                                setDetailDialog(false);
                            } catch (e) {
                                console.error('Approve error:', e);
                                alert('Không thể duyệt bảng lương: ' + e.message);
                            }
                        }}
                        color="primary"
                        disabled={(selectedWorker?.totalHours || 0) === 0}
                    >
                        Duyệt
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={async () => {
                            if (!selectedWorker) return;
                            try {
                                const week = payrollPeriod === 'weekly' ? selectedWeek : 1;
                                const year = selectedYear;
                                const periodName = `Chi tiết Bảng lương - ${payrollPeriod === 'weekly' ? `Tuần ${week}` : `Tháng ${selectedMonth}`}/${year}`;
                                await upsertPayrollRecord({
                                    worker_id: selectedWorker.id,
                                    total_hours: selectedWorker.totalHours || 0,
                                    hourly_rate: selectedWorker.hourlyRate || HOURLY_RATE,
                                    status: 'Chờ duyệt',
                                    week,
                                    year,
                                    period_name: periodName
                                });
                                await loadPayrollData();
                                setDetailDialog(false);
                            } catch (e) {
                                console.error('Revoke approval error:', e);
                                alert('Không thể thu hồi duyệt: ' + e.message);
                            }
                        }}
                        color="warning"
                    >
                        Thu hồi duyệt
                    </Button>
                    <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


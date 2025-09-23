import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip } from "@mui/material";
import RoomIcon from '@mui/icons-material/Room';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { createPlan, listPlans, fetchFarmers, testConnection, ensureLoTrong, listGiongCay } from "../../services/api";

// CSS animation cho hiệu ứng pulse
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Thêm CSS vào document
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = pulseKeyframes;
    document.head.appendChild(style);
}

const STATUS_COLORS = {
    'Sẵn sàng': 'success',
    'Đang chuẩn bị': 'warning',
    'Chuẩn bị': 'warning',
    'Chưa bắt đầu': 'default',
    'Đang canh tác': 'info',
    'Hoàn thành': 'success',
    'Cần bảo trì': 'error'
};

export default function ProductionPlans() {
    const [lots, setLots] = useState([]);
    const [giongs, setGiongs] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [plans, setPlans] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [openMap, setOpenMap] = useState(false);
    const [selectedLotForMap, setSelectedLotForMap] = useState(null);

    // Chuẩn hóa hiển thị nhãn lô: thêm tiền tố "Lô " nếu chưa có, tránh trùng lặp
    const formatLotLabel = (id) => {
        const raw = String(id || '').trim();
        if (raw.toLowerCase().startsWith('lô')) return raw;
        return `Lô ${raw}`;
    };

    const handleOpenMapWithLot = (lot) => {
        setSelectedLotForMap(lot);
        setOpenMap(true);
    };

    const [form, setForm] = useState({
        ma_lo_trong: '',
        dien_tich_trong: '',
        ngay_du_kien_thu_hoach: '',
        trang_thai: 'chuan_bi',
        so_luong_nhan_cong: '',
        ghi_chu: '',
        ma_giong: ''
    });

    // Function to calculate workers based on area (1 ha = 5 workers)
    const calculateWorkers = (area) => {
        const areaNum = parseFloat(area) || 0;
        return Math.ceil(areaNum * 5); // Round up to ensure enough workers
    };

    const handleOpen = (lot) => {
        setEditing({...lot });
        const dienTich = lot.area || '';
        setForm({
            ma_lo_trong: lot.ma_lo_trong || '',
            dien_tich_trong: dienTich,
            ngay_du_kien_thu_hoach: lot.season ? new Date(lot.season.split('/').reverse().join('-')).toISOString().split('T')[0] : '',
            trang_thai: (() => {
                const plan = findPlanForLot(lot);
                if (!plan) return 'chuan_bi'; // Default for lots without plans
                return plan.trang_thai || 'chuan_bi';
            })(),
            so_luong_nhan_cong: lot.so_luong_nhan_cong || calculateWorkers(dienTich).toString(),
            ghi_chu: lot.crop || '',
            ma_giong: ''
        });
        setOpen(true);
    };

    const handleSave = async() => {
        try {
            // First ensure lo_trong exists
            if (form.ma_lo_trong) {
                await ensureLoTrong(Number(form.ma_lo_trong));
            }

            const payload = {
                ma_lo_trong: form.ma_lo_trong === '' ? null : Number(form.ma_lo_trong),
                dien_tich_trong: form.dien_tich_trong === '' ? null : Number(form.dien_tich_trong),
                ngay_bat_dau: form.ngay_bat_dau || null,
                ngay_du_kien_thu_hoach: form.ngay_du_kien_thu_hoach || null,
                trang_thai: form.trang_thai,
                so_luong_nhan_cong: form.so_luong_nhan_cong === '' ? null : Number(form.so_luong_nhan_cong),
                ghi_chu: form.ghi_chu || null,
                ma_giong: form.ma_giong === '' ? null : Number(form.ma_giong)
            };
            console.log('Sending payload:', payload);
            const res = await createPlan(payload);
            console.log('API response:', res);
            if (!res ? .success) throw new Error(res ? .error || 'Tạo kế hoạch thất bại');

            // Update lot status
            try {
                const updateResponse = await fetch('/src/be_management/api/lo_trong_update.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ma_lo_trong: form.ma_lo_trong,
                        trang_thai: form.trang_thai
                    })
                });
                const updateData = await updateResponse.json();
                console.log('Lot status update:', updateData);
            } catch (e) {
                console.error('Error updating lot status:', e);
            }

            // Refresh lots from database after creating plan
            try {
                const lotsResponse = await fetch('/src/be_management/api/lo_trong_list.php');
                const lotsData = await lotsResponse.json();
                if (lotsData ? .success) {
                    setLots(lotsData.data || []);
                }
            } catch (e) {
                console.error('Error refreshing lots:', e);
            }

            setOpen(false);
            // refresh list
            try {
                const r = await listPlans();
                if (r ? .success) {
                    setPlans(r.data || []);
                    // Show details of the newly created plan
                    if (res ? .id) {
                        const newPlan = r.data.find(p => p.ma_ke_hoach === res.id);
                        if (newPlan) {
                            setSelectedPlan(newPlan);
                            setOpenDetails(true);
                        }
                    }
                }
            } catch {}
            alert('Đã lưu kế hoạch sản xuất thành công!');
        } catch (e) {
            console.error('Save error:', e);
            const errorMsg = e.message.includes('Failed to create plan') ?
                'Lỗi kết nối server. Vui lòng kiểm tra console để xem chi tiết.' :
                e.message;
            alert(`Lỗi: ${errorMsg}`);
        }
    };

    // Load data from database on mount - OPTIMIZED with parallel loading
    useEffect(() => {
        (async() => {
            // Fallback data for lots
            const fallbackLots = [
                { id: 'Lô 1', ma_lo_trong: 1, status: 'Sẵn sàng', location: 'Khu vực Bắc', area: 2.5, crop: '', season: '', lat: 10.8245, lng: 106.6302 },
                { id: 'Lô 2', ma_lo_trong: 2, status: 'Đang chuẩn bị', location: 'Khu vực Đông', area: 3.2, crop: '', season: '', lat: 10.8235, lng: 106.6315 },
                { id: 'Lô 3', ma_lo_trong: 3, status: 'Chưa bắt đầu', location: 'Khu vực Nam', area: 1.8, crop: '', season: '', lat: 10.8225, lng: 106.6305 },
                { id: 'Lô 4', ma_lo_trong: 4, status: 'Đang canh tác', location: 'Khu vực Tây', area: 4.1, crop: '', season: '', lat: 10.8238, lng: 106.6285 },
                { id: 'Lô 5', ma_lo_trong: 5, status: 'Hoàn thành', location: 'Khu vực Trung tâm', area: 2.8, crop: '', season: '', lat: 10.8232, lng: 106.6295 },
                { id: 'Lô 6', ma_lo_trong: 6, status: 'Cần bảo trì', location: 'Khu vực Đông Bắc', area: 3.5, crop: '', season: '', lat: 10.8242, lng: 106.6312 },
            ];

            try {
                setLoading(true);
                // Load all data in parallel for better performance
                const [lotsResponse, plansResponse, farmersResponse, giongsResponse] = await Promise.allSettled([
                    fetch('/src/be_management/api/lo_trong_list.php').then(res => res.json()),
                    listPlans(),
                    fetchFarmers(),
                    listGiongCay()
                ]);

                // Handle lots data
                if (lotsResponse.status === 'fulfilled' && lotsResponse.value ? .success && lotsResponse.value.data ? .length > 0) {
                    setLots(lotsResponse.value.data);
                    console.log('Lots loaded from database:', lotsResponse.value.data);
                } else {
                    setLots(fallbackLots);
                    console.log('Using fallback lots data');
                }

                // Handle plans data
                if (plansResponse.status === 'fulfilled' && plansResponse.value ? .success) {
                    setPlans(plansResponse.value.data || []);
                    console.log('Plans loaded:', plansResponse.value.data);
                } else {
                    console.error('List plans failed:', plansResponse.value);
                }

                // Handle farmers data
                if (farmersResponse.status === 'fulfilled' && farmersResponse.value ? .success) {
                    setFarmers(farmersResponse.value.data || []);
                    console.log('Farmers loaded:', farmersResponse.value.data);
                } else {
                    console.error('Error loading farmers:', farmersResponse.value);
                }

                // Handle giong cay data
                if (giongsResponse.status === 'fulfilled' && giongsResponse.value ? .success) {
                    setGiongs(giongsResponse.value.data || []);
                    console.log('Giong cay loaded:', giongsResponse.value.data);
                } else {
                    console.error('Error loading giong_cay:', giongsResponse.value);
                }

            } catch (e) {
                console.error('Error loading data:', e);
                // Set fallback data on any error
                setLots(fallbackLots);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Helper: normalize Vietnamese text for robust matching
    const normalizeText = (text) => (text || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    // Auto-calc harvest date based on selected variety and start date
    useEffect(() => {
        if (!form.ma_giong || !form.ngay_bat_dau) return;
        const selected = giongs.find(g => String(g.id) === String(form.ma_giong));
        if (!selected) return;

        const name = normalizeText(selected.ten_giong);

        const start = new Date(form.ngay_bat_dau);
        if (Number.isNaN(start.getTime())) return;

        let harvest = new Date(start);

        if (name.includes('ca phe') && name.includes('tr4')) {
            // +3 years for Cà phê TR4
            harvest.setFullYear(harvest.getFullYear() + 3);
        } else if (name.includes('st25') || name.includes('lvn10') || name.includes('ngo lvn10') || name.includes('lua st25')) {
            // +100 days for Lúa ST25 or Ngô LVN10
            harvest.setDate(harvest.getDate() + 100);
        } else {
            return; // Unknown variety -> do not override
        }

        const y = harvest.getFullYear();
        const m = String(harvest.getMonth() + 1).padStart(2, '0');
        const d = String(harvest.getDate()).padStart(2, '0');
        const formatted = `${y}-${m}-${d}`;
        setForm(prev => ({...prev, ngay_du_kien_thu_hoach: formatted }));
    }, [form.ma_giong, form.ngay_bat_dau, giongs]);


    const findPlanForLot = (lot) => {
        // Use ma_lo_trong directly from lot data
        const maLoTrong = lot.ma_lo_trong;
        console.log(`Finding plan for lot ${lot.id}, ma_lo_trong: ${maLoTrong}, total plans: ${plans.length}`);
        console.log('Available plans:', plans.map(p => ({ id: p.ma_ke_hoach, ma_lo_trong: p.ma_lo_trong })));

        // Find plan by ma_lo_trong
        let plan = plans.find(p => p.ma_lo_trong === maLoTrong);

        console.log(`Found plan for lot ${lot.id}:`, plan);
        return plan;
    };

    // Function to determine lot status based on plan existence
    const getLotStatus = (lot) => {
        const plan = findPlanForLot(lot);

        // If no plan exists, status should be "Chưa bắt đầu"
        if (!plan) {
            return 'Chưa bắt đầu';
        }

        // If plan exists, use the plan's status
        const statusMap = {
            'chuan_bi': 'Chuẩn bị',
            'dang_trong': 'Đang canh tác',
            'da_thu_hoach': 'Hoàn thành'
        };

        return statusMap[plan.trang_thai] || 'Chưa bắt đầu';
    };

    if (loading) {
        return ( <
            Box sx = {
                { p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' } } >
            <
            Typography variant = "h6"
            sx = {
                { mb: 2 } } > Đang tải dữ liệu... < /Typography> <
            Box sx = {
                {
                    width: 40,
                    height: 40,
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #1976d2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            }
            /> <
            style > { `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          ` } <
            /style> <
            /Box>
        );
    }

    return ( <
        Box sx = {
            { p: 3 } } >
        <
        Box sx = {
            { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 } } >
        <
        Typography variant = "h6"
        sx = {
            { fontWeight: 700 } } > Các lô canh tác < /Typography> <
        Box sx = {
            { display: 'flex', gap: 1 } } >
        <
        Button size = "small"
        onClick = {
            async() => {
                try {
                    const test = await testConnection();
                    alert(`Kết nối thành công: ${test.message}`);
                } catch (e) {
                    alert(`Lỗi kết nối: ${e.message}`);
                }
            }
        } > Test kết nối < /Button> <
        Button size = "small"
        onClick = {
            async() => {
                try {
                    // Refresh plans
                    const r = await listPlans();
                    if (r ? .success) {
                        setPlans(r.data || []);
                    }

                    // Refresh lots
                    const lotsResponse = await fetch('/src/be_management/api/lo_trong_list.php');
                    const lotsData = await lotsResponse.json();
                    if (lotsData ? .success) {
                        setLots(lotsData.data || []);
                    }

                    alert(`Đã refresh dữ liệu. Có ${r.data?.length || 0} kế hoạch và ${lotsData.data?.length || 0} lô trồng.`);
                } catch (e) {
                    alert(`Lỗi refresh: ${e.message}`);
                }
            }
        } > Refresh dữ liệu < /Button> <
        Button size = "small"
        onClick = {
            async() => {
                try {
                    const lotsResponse = await fetch('/src/be_management/api/lo_trong_list.php');
                    const lotsData = await lotsResponse.json();
                    if (lotsData ? .success) {
                        setLots(lotsData.data || []);
                        alert('Đã reset dữ liệu từ database');
                    }
                } catch (e) {
                    alert(`Lỗi reset: ${e.message}`);
                }
            }
        } > Reset dữ liệu < /Button> <
        /Box> <
        /Box> <
        Box sx = {
            {
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                alignItems: 'stretch'
            }
        } > {
            lots.map((lot) => ( <
                Paper key = { lot.id }
                sx = {
                    { p: 2, height: '100%', display: 'flex', flexDirection: 'column' } } >
                <
                Box sx = {
                    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 } } >
                <
                Typography variant = "subtitle1"
                sx = {
                    { fontWeight: 700 } } > { formatLotLabel(lot.id) } < /Typography> <
                Box sx = {
                    { display: 'flex', gap: 1, alignItems: 'center' } } > {
                    findPlanForLot(lot) && ( <
                        Chip label = "Đã có KH"
                        color = "success"
                        size = "small"
                        variant = "outlined" / >
                    )
                } <
                Chip label = { getLotStatus(lot) }
                color = { STATUS_COLORS[getLotStatus(lot)] || 'default' }
                size = "small" / >
                <
                /Box> <
                /Box> <
                Box sx = {
                    { display: 'grid', gap: 0.5, color: 'text.secondary', flexGrow: 1 } } >
                <
                Box sx = {
                    { display: 'flex', alignItems: 'center', gap: 1 } } > < RoomIcon fontSize = "small" / > < span > Vị trí: { lot.location || 'Mặc định' } < /span></Box >
                <
                Box sx = {
                    { display: 'flex', alignItems: 'center', gap: 1 } } > < AgricultureIcon fontSize = "small" / > < span > Diện tích: {
                    (() => { const p = findPlanForLot(lot); return p ? .dien_tich_trong ? ? 'Chưa có dữ liệu'; })() } {
                    (() => { const p = findPlanForLot(lot); return p ? .dien_tich_trong ? 'ha' : ''; })() } < /span></Box >
                <
                Box sx = {
                    { display: 'flex', alignItems: 'center', gap: 1 } } > < CategoryIcon fontSize = "small" / > < span > Loại cây: {
                    (() => { const p = findPlanForLot(lot); if (p ? .ma_giong && Array.isArray(giongs)) { const g = giongs.find(x => x.id === p.ma_giong); return g ? g.ten_giong : p.ma_giong; } return 'Chưa có dữ liệu'; })() } < /span></Box >
                <
                Box sx = {
                    { display: 'flex', alignItems: 'center', gap: 1 } } > < EventIcon fontSize = "small" / > < span > Số lượng nhân công: {
                    (() => { const p = findPlanForLot(lot); return p ? .so_luong_nhan_cong ? ? 'Chưa có dữ liệu'; })() } {
                    (() => { const p = findPlanForLot(lot); return p ? .so_luong_nhan_cong ? 'người' : ''; })() } < /span></Box >
                <
                /Box> <
                Box sx = {
                    { mt: 1.5, display: 'flex', gap: 1, alignItems: 'center' } } >
                <
                Button variant = "contained"
                onClick = {
                    () => handleOpen(lot) }
                sx = {
                    { flex: 1 } } > Điền thông tin < /Button> <
                Tooltip title = "Xem chi tiết thông tin lô" >
                <
                IconButton size = "small"
                color = "primary"
                onClick = {
                    () => {
                        const plan = findPlanForLot(lot);
                        if (plan) {
                            setSelectedPlan(plan);
                            setOpenDetails(true);
                        } else {
                            alert(`Chưa có thông tin kế hoạch cho ${formatLotLabel(lot.id)}. Có ${plans.length} kế hoạch trong hệ thống.`);
                        }
                    }
                } >
                <
                VisibilityIcon / >
                <
                /IconButton> <
                /Tooltip> <
                Tooltip title = "Xem vị trí trên bản đồ" >
                <
                IconButton size = "small"
                color = "secondary"
                onClick = {
                    () => handleOpenMapWithLot(lot) } >
                🗺️
                <
                /IconButton> <
                /Tooltip> <
                /Box> <
                /Paper>
            ))
        } <
        /Box>

        { /* Danh sách kế hoạch đã lưu */ } <
        Box sx = {
            { mt: 4 } } >
        <
        Typography variant = "subtitle1"
        sx = {
            { fontWeight: 700, mb: 1 } } > Kế hoạch đã lưu trong hệ thống < /Typography> {
            plans.length === 0 ? ( <
                Typography variant = "body2"
                color = "text.secondary" > Chưa có kế hoạch nào. < /Typography>
            ) : ( <
                Box sx = {
                    { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 } } > {
                    plans.map((p) => ( <
                        Paper key = { p.ma_ke_hoach }
                        sx = {
                            { p: 2 } } >
                        <
                        Box sx = {
                            { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 } } >
                        <
                        Typography variant = "subtitle2"
                        sx = {
                            { fontWeight: 700 } } > Mã KH: { p.ma_ke_hoach } < /Typography> <
                        Button size = "small"
                        variant = "outlined"
                        onClick = {
                            () => {
                                setSelectedPlan(p);
                                setOpenDetails(true);
                            }
                        } > Xem chi tiết < /Button> <
                        /Box> <
                        Box sx = {
                            { color: 'text.secondary', mt: 0.5 } } >
                        <
                        div > Mã lô trồng: { p.ma_lo_trong ? ? '-' } < /div> <
                        div > Diện tích trồng: { p.dien_tich_trong ? ? '-' }
                        ha < /div> <
                        div > Ngày dự kiến thu hoạch: { p.ngay_du_kien_thu_hoach ? ? '-' } < /div> <
                        div > Loại cây: {
                            (() => {
                                if (p.ma_giong && Array.isArray(giongs)) {
                                    const giong = giongs.find(g => g.id === p.ma_giong);
                                    return giong ? giong.ten_giong : p.ma_giong;
                                }
                                return 'Chưa có dữ liệu';
                            })()
                        } < /div> <
                        div > Trạng thái: { p.trang_thai } < /div> <
                        div > Số lượng nhân công: { p.so_luong_nhan_cong ? ? '-' }
                        người < /div> <
                        div > Ghi chú: { p.ghi_chu ? ? '-' } < /div> <
                        /Box> <
                        /Paper>
                    ))
                } <
                /Box>
            )
        } <
        /Box>

        <
        Dialog open = { open }
        onClose = {
            () => setOpen(false) }
        maxWidth = "sm"
        fullWidth >
        <
        DialogTitle sx = {
            { pb: 2 } } > Điền thông tin kế hoạch cho { formatLotLabel(editing ? .id) } < /DialogTitle> <
        DialogContent sx = {
            { display: 'grid', gap: 2, pt: 3 } } >
        <
        TextField label = "Mã lô trồng"
        type = "number"
        value = { form.ma_lo_trong }
        onChange = {
            (e) => setForm({...form, ma_lo_trong: e.target.value }) }
        helperText = "Nhập mã lô trồng (sẽ tự động tạo nếu chưa tồn tại)"
        fullWidth / >
        <
        TextField label = "Diện tích trồng (ha)"
        type = "number"
        value = { form.dien_tich_trong }
        onChange = {
            (e) => {
                const newArea = e.target.value;
                const workers = calculateWorkers(newArea);
                setForm({...form, dien_tich_trong: newArea, so_luong_nhan_cong: workers.toString() });
            }
        }
        helperText = "Tự động tính số lượng nhân công: 1 ha = 5 người"
        fullWidth / >
        <
        TextField select label = "Loại cây"
        value = { form.ma_giong || '' }
        onChange = {
            (e) => setForm({...form, ma_giong: e.target.value }) }
        fullWidth >
        <
        MenuItem value = "" > --Chọn giống cây-- < /MenuItem> {
            giongs.map(g => ( <
                MenuItem key = { g.id }
                value = { g.id } > { g.ten_giong } < /MenuItem>
            ))
        } <
        /TextField> <
        TextField label = "Ngày bắt đầu"
        type = "date"
        InputLabelProps = {
            { shrink: true } }
        value = { form.ngay_bat_dau || '' }
        onChange = {
            (e) => setForm({...form, ngay_bat_dau: e.target.value }) }
        fullWidth / >
        <
        TextField label = "Ngày dự kiến thu hoạch"
        type = "date"
        InputLabelProps = {
            { shrink: true } }
        value = { form.ngay_du_kien_thu_hoach }
        onChange = {
            (e) => setForm({...form, ngay_du_kien_thu_hoach: e.target.value }) }
        fullWidth / >
        <
        TextField select label = "Trạng thái"
        value = { form.trang_thai }
        onChange = {
            (e) => setForm({...form, trang_thai: e.target.value }) }
        fullWidth >
        <
        MenuItem value = "chuan_bi" > Chuẩn bị < /MenuItem> <
        MenuItem value = "dang_trong" > Đang trồng < /MenuItem> <
        MenuItem value = "da_thu_hoach" > Đã thu hoạch < /MenuItem> <
        /TextField> <
        TextField label = "Số lượng nhân công"
        type = "number"
        value = { form.so_luong_nhan_cong }
        onChange = {
            (e) => setForm({...form, so_luong_nhan_cong: e.target.value }) }
        helperText = "Tự động tính từ diện tích (1 ha = 5 người)"
        fullWidth / >
        <
        TextField label = "Ghi chú"
        multiline minRows = { 3 }
        value = { form.ghi_chu }
        onChange = {
            (e) => setForm({...form, ghi_chu: e.target.value }) }
        fullWidth / >
        <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            () => setOpen(false) } > Hủy < /Button> <
        Button onClick = {
            () => setOpenMap(true) } > Hình ảnh trên gg map < /Button> <
        Button onClick = {
            () => {
                console.log('Testing map with lot A1');
                const lotA1 = lots.find(lot => lot.id === 'A1');
                if (lotA1) {
                    handleOpenMapWithLot(lotA1);
                }
            }
        } > Test A1 < /Button> <
        Button variant = "contained"
        onClick = { handleSave } > Lưu < /Button> <
        /DialogActions> <
        /Dialog>

        { /* Chi tiết kế hoạch */ } <
        Dialog open = { openDetails }
        onClose = {
            () => setOpenDetails(false) }
        maxWidth = "sm"
        fullWidth >
        <
        DialogTitle sx = {
            { pb: 2 } } > Chi tiết kế hoạch sản xuất < /DialogTitle> <
        DialogContent sx = {
            { pt: 3 } } > {
            selectedPlan && ( <
                Box sx = {
                    { display: 'grid', gap: 2 } } >
                <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Mã kế hoạch: < /Typography> <
                Typography variant = "body1"
                sx = {
                    { fontWeight: 600 } } > { selectedPlan.ma_ke_hoach } < /Typography> <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Mã lô trồng: < /Typography> <
                Typography variant = "body1" > { selectedPlan.ma_lo_trong ? ? '-' } < /Typography> <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Diện tích trồng: < /Typography> <
                Typography variant = "body1" > { selectedPlan.dien_tich_trong ? ? '-' }
                ha < /Typography> <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Ngày dự kiến thu hoạch: < /Typography> <
                Typography variant = "body1" > { selectedPlan.ngay_du_kien_thu_hoach ? ? '-' } < /Typography> <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Loại cây: < /Typography> <
                Typography variant = "body1" > {
                    (() => {
                        if (selectedPlan.ma_giong && Array.isArray(giongs)) {
                            const giong = giongs.find(g => g.id === selectedPlan.ma_giong);
                            return giong ? giong.ten_giong : selectedPlan.ma_giong;
                        }
                        return 'Chưa có dữ liệu';
                    })()
                } <
                /Typography> <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Trạng thái: < /Typography> <
                Chip label = {
                    selectedPlan.trang_thai === 'chuan_bi' ? 'Chuẩn bị' : selectedPlan.trang_thai === 'dang_trong' ? 'Đang trồng' : selectedPlan.trang_thai === 'da_thu_hoach' ? 'Đã thu hoạch' : selectedPlan.trang_thai
                }
                color = {
                    selectedPlan.trang_thai === 'chuan_bi' ? 'warning' : selectedPlan.trang_thai === 'dang_trong' ? 'info' : selectedPlan.trang_thai === 'da_thu_hoach' ? 'success' : 'default'
                }
                size = "small" /
                >
                <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Số lượng nhân công: < /Typography> <
                Typography variant = "body1" > { selectedPlan.so_luong_nhan_cong ? ? '-' }
                người < /Typography> <
                /Box> <
                Box sx = {
                    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } } >
                <
                Typography variant = "subtitle2"
                color = "text.secondary" > Ghi chú: < /Typography> <
                Typography variant = "body1"
                sx = {
                    { maxWidth: '60%', textAlign: 'right' } } > { selectedPlan.ghi_chu ? ? '-' } <
                /Typography> <
                /Box> <
                /Box>
            )
        } <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            () => setOpenDetails(false) } > Đóng < /Button> <
        /DialogActions> <
        /Dialog>

        { /* Bản đồ Google Maps với các lô canh tác */ } <
        Dialog open = { openMap }
        onClose = {
            () => {
                setOpenMap(false);
                setSelectedLotForMap(null);
            }
        }
        maxWidth = "lg"
        fullWidth >
        <
        DialogTitle sx = {
            { pb: 2 } } > { selectedLotForMap ? `Vị trí ${formatLotLabel(selectedLotForMap.id)}` : 'Bản đồ các lô canh tác' } <
        /DialogTitle> <
        DialogContent sx = {
            { p: 0, height: '600px' } } >
        <
        Box sx = {
            { position: 'relative', width: '100%', height: '100%' } } > { /* Bản đồ OpenStreetMap */ } <
        iframe title = "farm-map"
        width = "100%"
        height = "100%"
        style = {
            { border: 0 } }
        loading = "lazy"
        allowFullScreen referrerPolicy = "no-referrer-when-downgrade"
        src = "https://www.openstreetmap.org/export/embed.html?bbox=106.6280%2C10.8220%2C106.6320%2C10.8250&layer=mapnik&marker=10.8235%2C106.6300" /
        >

        { /* Overlay với các ô vuông tượng trưng cho lô - zoom theo bản đồ */ } <
        Box sx = {
            {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000
            }
        } >

        { /* Chỉ hiển thị lô được chọn */ } {
            selectedLotForMap && (() => {
                const lot = selectedLotForMap;
                const index = lots.findIndex(l => l.id === lot.id);

                // Sử dụng tọa độ thực tế từ dữ liệu lô
                const lotLat = lot.lat;
                const lotLng = lot.lng;

                // Tính toán vị trí pixel trên bản đồ dựa trên tọa độ thực tế
                const mapWidth = 800;
                const mapHeight = 600;
                const centerLat = 10.8235; // Tọa độ trung tâm mới
                const centerLng = 106.6300;
                const latRange = 0.015; // Phạm vi hiển thị rộng hơn
                const lngRange = 0.015;

                // Chuyển đổi lat/lng thành pixel position
                const x = ((lotLng - (centerLng - lngRange / 2)) / lngRange) * mapWidth;
                const y = ((lotLat - (centerLat - latRange / 2)) / latRange) * mapHeight;

                console.log(`Lot ${lot.id}: lat=${lotLat}, lng=${lotLng}, x=${x}, y=${y}`);

                const hasPlan = findPlanForLot(lot);

                return ( <
                    React.Fragment key = { lot.id } > { /* Ô vuông xanh bọc xung quanh điểm chấm */ } <
                    Box sx = {
                        {
                            position: 'absolute',
                            left: `${x - 50}px`, // Trung tâm ô vuông
                            top: `${y - 35}px`,
                            width: '100px',
                            height: '70px',
                            backgroundColor: hasPlan ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 152, 0, 0.4)',
                            border: `3px solid ${hasPlan ? '#4caf50' : '#ff9800'}`,
                            borderRadius: '8px',
                            pointerEvents: 'none',
                            zIndex: 998,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }
                    } >
                    { lot.id } <
                    /Box>

                    { /* Điểm định vị GPS pin ở trung tâm */ } <
                    Box sx = {
                        {
                            position: 'absolute',
                            left: `${x - 8}px`, // Trung tâm chính xác
                            top: `${y - 20}px`,
                            width: '16px',
                            height: '16px',
                            backgroundColor: '#1976d2',
                            border: '2px solid #fff',
                            borderRadius: '50% 50% 50% 0',
                            transform: 'rotate(-45deg)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            pointerEvents: 'none',
                            zIndex: 1002,
                            // Hiệu ứng pulse
                            animation: 'pulse 2s infinite'
                        }
                    }
                    />

                    { /* Chấm trắng ở giữa điểm định vị */ } <
                    Box sx = {
                        {
                            position: 'absolute',
                            left: `${x - 3}px`,
                            top: `${y - 15}px`,
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            zIndex: 1003,
                            transform: 'rotate(45deg)'
                        }
                    }
                    /> <
                    /React.Fragment>
                );
            })()
        }

        { /* Popup thông tin chi tiết lô */ } {
            selectedLotForMap && (() => {
                const lot = selectedLotForMap;
                const index = lots.findIndex(l => l.id === lot.id);
                const lotLat = lot.lat || (10.8231 + (index % 3) * 0.001);
                const lotLng = lot.lng || (106.6297 + Math.floor(index / 3) * 0.001);

                const mapWidth = 800;
                const mapHeight = 600;
                const centerLat = 10.8235;
                const centerLng = 106.6300;
                const latRange = 0.015;
                const lngRange = 0.015;

                const x = ((lotLng - (centerLng - lngRange / 2)) / lngRange) * mapWidth;
                const y = ((lotLat - (centerLat - latRange / 2)) / latRange) * mapHeight;

                return ( <
                    Box sx = {
                        {
                            position: 'absolute',
                            left: `${x - 100}px`,
                            top: `${y - 120}px`,
                            width: '200px',
                            backgroundColor: '#fff',
                            border: '2px solid #1976d2',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 1004,
                            pointerEvents: 'auto',
                            // Mũi tên chỉ xuống điểm chấm
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: '-8px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid #1976d2'
                            }
                        }
                    } >
                    <
                    Box sx = {
                        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 } } >
                    <
                    Typography variant = "h6"
                    sx = {
                        { fontWeight: 'bold', color: '#1976d2' } } > { lot.id } <
                    /Typography> <
                    IconButton size = "small"
                    onClick = {
                        () => {
                            setOpenMap(false);
                            setSelectedLotForMap(null);
                        }
                    }
                    sx = {
                        { color: '#666' } } >
                    ×
                    <
                    /IconButton> <
                    /Box>

                    <
                    Box sx = {
                        { mb: 1 } } >
                    <
                    Typography variant = "body2"
                    sx = {
                        { fontWeight: 'bold' } } > Vị trí: < /Typography> <
                    Typography variant = "body2"
                    sx = {
                        { color: '#666' } } > { lotLat.toFixed(6) }, { lotLng.toFixed(6) } <
                    /Typography> <
                    /Box>

                    <
                    Box sx = {
                        { mb: 1 } } >
                    <
                    Typography variant = "body2"
                    sx = {
                        { fontWeight: 'bold' } } > Trạng thái: < /Typography> <
                    Typography variant = "body2"
                    sx = {
                        { color: '#666' } } > { lot.status } <
                    /Typography> <
                    /Box>

                    <
                    Box sx = {
                        { mb: 1 } } >
                    <
                    Typography variant = "body2"
                    sx = {
                        { fontWeight: 'bold' } } > Loại cây: < /Typography> <
                    Typography variant = "body2"
                    sx = {
                        { color: '#666' } } > { lot.crop || 'Chưa chọn' } <
                    /Typography> <
                    /Box>

                    <
                    Box sx = {
                        { mb: 1 } } >
                    <
                    Typography variant = "body2"
                    sx = {
                        { fontWeight: 'bold' } } > Diện tích: < /Typography> <
                    Typography variant = "body2"
                    sx = {
                        { color: '#666' } } > { lot.area }
                    ha <
                    /Typography> <
                    /Box>

                    <
                    Box >
                    <
                    Typography variant = "body2"
                    sx = {
                        { fontWeight: 'bold' } } > Vị trí: < /Typography> <
                    Typography variant = "body2"
                    sx = {
                        { color: '#666' } } > { lot.location } <
                    /Typography> <
                    /Box> <
                    /Box>
                );
            })()
        } <
        /Box>

        { /* Legend */ } <
        Box sx = {
            {
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: 2,
                borderRadius: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }
        } >
        <
        Typography variant = "subtitle2"
        sx = {
            { fontWeight: 700, mb: 1 } } > Chú thích: < /Typography> <
        Box sx = {
            { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 } } >
        <
        Box sx = {
            { width: 20, height: 15, backgroundColor: '#4caf50', borderRadius: 1 } } > < /Box> <
        Typography variant = "body2" > Đã có kế hoạch < /Typography> <
        /Box> <
        Box sx = {
            { display: 'flex', alignItems: 'center', gap: 1 } } >
        <
        Box sx = {
            { width: 20, height: 15, backgroundColor: '#ff9800', borderRadius: 1 } } > < /Box> <
        Typography variant = "body2" > Chưa có kế hoạch < /Typography> <
        /Box> <
        /Box> <
        /Box> <
        /DialogContent> <
        DialogActions >
        <
        Button onClick = {
            () => {
                setOpenMap(false);
                setSelectedLotForMap(null);
            }
        } > Đóng < /Button> <
        /DialogActions> <
        /Dialog> <
        /Box>
    );
}
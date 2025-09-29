import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper, Chip, IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import RoomIcon from '@mui/icons-material/Room';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import { createPlan, ensureLoTrong, listPlans, deletePlan, createTask, deleteTasksByPlan, listTasks, fetchFarmers, updatePlan } from "../../services/api";

export default function ProductionPlans() {
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lots, setLots] = useState([]);
    const [giongs, setGiongs] = useState([]);
    const [savedFilter, setSavedFilter] = useState('all'); // all | chuan_bi | dang_trong | da_thu_hoach
    const [savedFrom, setSavedFrom] = useState(""); // YYYY-MM-DD
    const [savedTo, setSavedTo] = useState("");
    const [form, setForm] = useState({
        ma_lo_trong: "",
        ngay_bat_dau: "",
        ngay_du_kien_thu_hoach: "",
        ma_giong: "",
        dien_tich_trong: "30",
        so_luong_nhan_cong: ""
    });
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [openMap, setOpenMap] = useState(false);
    const [selectedLotForMap, setSelectedLotForMap] = useState(null);
    const [minStartDate, setMinStartDate] = useState(""); // YYYY-MM-DD khi lô đã có KH: ngày bắt đầu mới phải >= ngày thu hoạch cũ + 10
    const [dateError, setDateError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const API_BASE = 'http://localhost/doancuoinam/src/be_management/api';
                const [plansRes, lotsRes, giongRes] = await Promise.all([
                    listPlans(),
                    fetch(`${API_BASE}/lo_trong_list.php`).then(r=>r.json()).catch(()=>({})),
                    fetch(`${API_BASE}/giong_cay_list.php`).then(r=>r.json()).catch(()=>({}))
                ]);
                if (plansRes?.success) setPlans(plansRes.data || []);
                // Bảo đảm luôn hiển thị tối thiểu 6 lô (1..6)
                if (lotsRes?.success) {
                    const apiLots = Array.isArray(lotsRes.data) ? lotsRes.data : [];
                    const byId = new Map(apiLots.map(x => [String(x.id), x]));
                    const defaultSix = Array.from({ length: 6 }, (_, i) => {
                        const id = String(i + 1);
                        return byId.get(id) || { id };
                    });
                    setLots(defaultSix);
                }
                if (giongRes?.success) setGiongs(giongRes.data || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const DEFAULT_AREA_PER_LOT_HA = 30; // Mặc định mỗi lô = 30ha

    function toYmd(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function addDays(dateStr, days) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return "";
        d.setDate(d.getDate() + days);
        return toYmd(d);
    }

    function normalizeText(input) {
        const s = (input || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return s.replace(/đ/gi, 'd').toLowerCase();
    }

    // Sinh lịch trình công việc cho giống Lúa (ngô LVN10 ở UI yêu cầu hiện) dựa vào mẫu đã cung cấp
    function generateRiceSchedule(plan) {
        const start = plan?.ngay_bat_dau ? String(plan.ngay_bat_dau).slice(0,10) : "";
        const harvest = plan?.ngay_du_kien_thu_hoach ? String(plan.ngay_du_kien_thu_hoach).slice(0,10) : "";
        if (!start) return [];
        const workforceHint = plan?.so_luong_nhan_cong ? `${plan.so_luong_nhan_cong} người` : '2-3 người';
        const items = [];

        // Ngày 1-3: Làm đất
        items.push({
            title: 'Làm đất',
            desc: 'Sáng: Cày bừa, làm tơi đất. Chiều: Làm luống, rạch hàng.',
            from: start,
            to: addDays(start, 2),
            workers: workforceHint
        });
        // Ngày 4: Bón lót & Gieo hạt
        const d4 = addDays(start, 3);
        items.push({
            title: 'Bón lót & Gieo hạt',
            desc: 'Sáng: Bón lót (phân chuồng, NPK), rải hạt đều; Chiều: Tưới nhẹ, gieo phủ vỉ lấp đất.',
            from: d4,
            to: d4,
            workers: '2-3 người'
        });
        // Ngày 5-10: Nảy mầm, theo dõi
        items.push({
            title: 'Nảy mầm – Chăm sóc ban đầu',
            desc: 'Thăm đồng, kiểm tra độ ẩm, phát hiện sâu bệnh sớm. Nghỉ nếu không có vấn đề.',
            from: addDays(start, 4),
            to: addDays(start, 9),
            workers: '1 người/điểm'
        });
        // Ngày 11-13: Tỉa dặm & làm cỏ lần 1
        items.push({
            title: 'Tỉa dặm & Làm cỏ lần 1',
            desc: 'Bổ cây, dặm cây, làm cỏ nhẹ, vun gốc sơ bộ.',
            from: addDays(start, 10),
            to: addDays(start, 12),
            workers: '3-4 người'
        });
        // Ngày 24-25: Bón thúc lần 1
        items.push({
            title: 'Bón thúc lần 1',
            desc: 'Bón phân thúc, vun gốc, kiểm tra sinh trưởng.',
            from: addDays(start, 23),
            to: addDays(start, 24),
            workers: '2-3 người'
        });
        // Ngày 40-42: Bón thúc lần 2
        items.push({
            title: 'Bón thúc lần 2',
            desc: 'Bón phân (Urê + Kali), vun gốc cao, làm cỏ lại nếu cần.',
            from: addDays(start, 39),
            to: addDays(start, 41),
            workers: '2-3 người'
        });
        // Hàng tuần đến trước thu hoạch ~ tưới/bảo vệ thực vật
        if (harvest) {
            let cur = addDays(start, 11);
            while (cur < harvest) {
                items.push({
                    title: 'Tưới nước/Phòng trừ sâu bệnh (định kỳ)',
                    desc: 'Tưới nước khi cần; kiểm tra sâu bệnh; phun thuốc khi cần.',
                    from: cur,
                    to: cur,
                    workers: '1-2 người'
                });
                cur = addDays(cur, 7);
            }
        }
        // Thu hoạch
        if (harvest) {
            items.push({
                title: 'Thu hoạch',
                desc: 'Bẻ bắp/cắt lúa, vận chuyển, tập kết.',
                from: harvest,
                to: harvest,
                workers: workforceHint
            });
        }
        return items;
    }

    // Sinh lịch trình cho Đậu tương ĐT2000
    function generateSoySchedule(plan) {
        const start = plan?.ngay_bat_dau ? String(plan.ngay_bat_dau).slice(0,10) : "";
        const harvest = plan?.ngay_du_kien_thu_hoach ? String(plan.ngay_du_kien_thu_hoach).slice(0,10) : "";
        if (!start) return [];
        const workforceHint = plan?.so_luong_nhan_cong ? `${plan.so_luong_nhan_cong} người` : '2-3 người';
        const items = [];

        // Ngày 1-3: Làm đất
        items.push({
            title: 'Làm đất',
            desc: 'Sáng: Cày bừa, làm tơi đất. Chiều: Làm luống, rạch hàng.',
            from: start,
            to: addDays(start, 2),
            workers: workforceHint
        });
        // Ngày 4: Bón lót & Gieo hạt
        const d4 = addDays(start, 3);
        items.push({
            title: 'Bón lót & Gieo hạt',
            desc: 'Sáng: Bón lót (phân chuồng, NPK), rải hạt đều; Chiều: Tưới nhẹ, gieo phủ và lấp đất.',
            from: d4,
            to: d4,
            workers: '2-5 người'
        });
        // Ngày 5-10: Nảy mầm – Chăm sóc ban đầu
        items.push({
            title: 'Nảy mầm – Chăm sóc ban đầu',
            desc: 'Thăm đồng, kiểm tra độ ẩm, phát hiện sâu bệnh sớm. Nghỉ nếu không có vấn đề.',
            from: addDays(start, 4),
            to: addDays(start, 9),
            workers: '1 người/điểm'
        });
        // Ngày 12-14: Tỉa dặm & làm cỏ lần 1
        items.push({
            title: 'Tỉa dặm & Làm cỏ lần 1',
            desc: 'Tỉa cây, dặm cây vào chỗ trống; làm cỏ nhẹ; vun gốc.',
            from: addDays(start, 11),
            to: addDays(start, 13),
            workers: '3-4 người'
        });
        // Ngày 25-27: Bón thúc lần 1 & vun gốc
        items.push({
            title: 'Bón thúc lần 1 & Vun gốc',
            desc: 'Bón phân thúc; vun gốc; kiểm tra sinh trưởng.',
            from: addDays(start, 24),
            to: addDays(start, 26),
            workers: '2-3 người'
        });
        // Ngày 40-45: Bón thúc lần 2 (bón nuôi quả)
        items.push({
            title: 'Bón thúc lần 2 (nuôi quả)',
            desc: 'Bón phân (Urê + Kali), vun gốc cao, kiểm tra sâu bệnh.',
            from: addDays(start, 39),
            to: addDays(start, 44),
            workers: '2 người'
        });
        // Hàng tuần đến trước thu hoạch ~ tưới/bảo vệ thực vật
        if (harvest) {
            let cur = addDays(start, 12);
            while (cur < harvest) {
                items.push({
                    title: 'Tưới nước/Phòng trừ sâu bệnh (định kỳ)',
                    desc: 'Tưới nước khi cần; kiểm tra sâu bệnh; phun thuốc khi cần.',
                    from: cur,
                    to: cur,
                    workers: '1-2 người'
                });
                cur = addDays(cur, 7);
            }
        }
        // Thu hoạch
        if (harvest) {
            items.push({
                title: 'Thu hoạch',
                desc: 'Cắt hoặc nhổ cây khi đủ già, gom cây; vận chuyển về nơi tập kết.',
                from: harvest,
                to: harvest,
                workers: '6-8 người'
            });
            // Sơ chế & tách hạt
            items.push({
                title: 'Sơ chế & Tách hạt',
                desc: 'Phơi sơ chế, tách hạt (nếu cần), bảo quản khô để an toàn.',
                from: addDays(harvest, 1),
                to: addDays(harvest, 2),
                workers: '4-5 người'
            });
        }
        return items;
    }

    function isOverlap(aStart, aEnd, bStart, bEnd) {
        return !(aEnd < bStart || bEnd < aStart);
    }

    async function activatePlan(plan) {
        // Hiện tại chỉ hỗ trợ giống lúa. Sẽ mở rộng sau cho đậu tương.
        const cropName = (() => {
            const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(plan.ma_giong)) : null;
            return (g?.ten_giong || '');
        })();
        const norm = normalizeText(cropName);
        const isSoy = norm.includes('dau');
        const isDT2000 = isSoy && norm.includes('dt2000');
        const schedule = isDT2000 ? generateSoySchedule(plan) : generateRiceSchedule(plan);
        if (!schedule.length) {
            alert('Không thể sinh lịch: thiếu ngày bắt đầu.');
            return;
        }
        if (!window.confirm('Kích hoạt kế hoạch và tạo lịch làm việc tự động?')) return;
        try {
            // Auto assign farmers who are free (simple greedy)
            const [farmersRes, tasksRes] = await Promise.all([fetchFarmers(), listTasks()]);
            const farmers = farmersRes?.data || farmersRes || [];
            const existingTasks = tasksRes?.data || [];
            const farmerIds = farmers.map(f => String(f.ma_nguoi_dung || f.id)).filter(Boolean);

            for (const item of schedule) {
                const startKey = `${item.from}T07:00:00`;
                const endKey = `${item.to}T17:00:00`;
                const sTime = new Date(startKey).getTime();
                const eTime = new Date(endKey).getTime();

                let assignedId = null;
                for (const fid of farmerIds) {
                    const hasConflict = existingTasks.some(t => {
                        if (!t.ma_nguoi_dung) return false;
                        const ids = String(t.ma_nguoi_dung).split(',').map(x=>x.trim());
                        if (!ids.includes(String(fid))) return false;
                        const ts = new Date(`${t.ngay_bat_dau}T${t.thoi_gian_bat_dau||'00:00:00'}`).getTime();
                        const te = new Date(`${t.ngay_ket_thuc}T${t.thoi_gian_ket_thuc||'23:59:59'}`).getTime();
                        return isOverlap(sTime, eTime, ts, te);
                    });
                    if (!hasConflict) { assignedId = fid; break; }
                }
                await createTask({
                    ma_ke_hoach: plan.ma_ke_hoach,
                    ten_cong_viec: item.title,
                    mo_ta: `${item.desc}\nNhân công: ${item.workers}`,
                    loai_cong_viec: 'san_xuat',
                    ngay_bat_dau: item.from,
                    thoi_gian_bat_dau: '07:00',
                    ngay_ket_thuc: item.to,
                    thoi_gian_ket_thuc: '17:00',
                    thoi_gian_du_kien: 1,
                    trang_thai: 'chua_bat_dau',
                    uu_tien: 'trung_binh',
                    ma_nguoi_dung: assignedId,
                    ghi_chu: null,
                    ket_qua: null,
                    hinh_anh: null
                });
                    // push into existingTasks to prevent later conflicts in same activation
                    existingTasks.push({ ma_nguoi_dung: assignedId, ngay_bat_dau: item.from, thoi_gian_bat_dau: '07:00', ngay_ket_thuc: item.to, thoi_gian_ket_thuc: '17:00' });
            }
            // Lưu tóm tắt lịch trình vào cột chi_tiet_cong_viec
            const summary = [
                isDT2000 ? 'Tóm tắt lịch trình (Đậu tương ĐT2000):' : 'Tóm tắt lịch trình (Ngô LVN10):',
                ...schedule.map(it => `- ${it.title}: ${it.from}${it.to && it.to !== it.from ? ` → ${it.to}` : ''} — ${it.desc} (Nhân công: ${it.workers})`)
            ].join('\n');
            try { await updatePlan({ ma_ke_hoach: plan.ma_ke_hoach, chi_tiet_cong_viec: summary }); } catch(_) {}
            alert('Đã kích hoạt kế hoạch và tạo lịch làm việc.');
        } catch (e) {
            alert(e.message || 'Không thể kích hoạt kế hoạch');
        }
    }

    function calculateHarvestDate(startDateStr, cropName) {
        if (!startDateStr) return "";
        const start = new Date(startDateStr);
        if (Number.isNaN(start.getTime())) return "";
        const name = (cropName || "").toLowerCase();
        const result = new Date(start);
        if (name.includes("ngô") && name.includes("lvn10")) {
            // +3 months
            const m = result.getMonth();
            result.setMonth(m + 3);
        } else if ((name.includes("đậu") || name.includes("dau")) && name.includes("dt2000")) {
            // +90 days
            result.setDate(result.getDate() + 90);
        } else {
            // fallback: +60 days nếu chưa khớp giống
            result.setDate(result.getDate() + 60);
        }
        const yyyy = result.getFullYear();
        const mm = String(result.getMonth() + 1).padStart(2, '0');
        const dd = String(result.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function calculateWorkers(cropName, areaHa) {
        const name = (cropName || "").toLowerCase();
        const area = Number(areaHa) || 0;
        if (name.includes("ngô")) return Math.ceil(area * 4);
        if (name.includes("đậu") || name.includes("dau")) return Math.ceil(area * 3);
        return Math.ceil(area * 3); // mặc định tương tự đậu
    }

    const handleSave = async () => {
        try {
            if (form.ma_lo_trong) {
                await ensureLoTrong(Number(form.ma_lo_trong));
            }
            // Xác định tên giống để tính toán
            const giongName = (() => {
                const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(form.ma_giong)) : null;
                return g?.ten_giong || '';
            })();

            // Diện tích mặc định mỗi lô
            const areaHa = DEFAULT_AREA_PER_LOT_HA;

            const payload = {
                ma_lo_trong: form.ma_lo_trong === "" ? null : Number(form.ma_lo_trong),
                dien_tich_trong: form.dien_tich_trong === "" ? areaHa : Number(form.dien_tich_trong),
                ngay_bat_dau: form.ngay_bat_dau || null,
                ngay_du_kien_thu_hoach: form.ngay_du_kien_thu_hoach || null,
                trang_thai: 'chuan_bi',
                so_luong_nhan_cong: form.so_luong_nhan_cong === "" ? null : Number(form.so_luong_nhan_cong),
                ghi_chu: null,
                ma_giong: form.ma_giong === "" ? null : Number(form.ma_giong)
            };
            const res = await createPlan(payload);
            if (!res?.success) throw new Error(res?.error || "Tạo kế hoạch thất bại");
            alert("Đã lưu kế hoạch sản xuất thành công!");
            setOpen(false);
            // refresh
            const r = await listPlans();
            if (r?.success) setPlans(r.data || []);
        } catch (e) {
            alert(e.message);
        }
    };

    // Helpers for card view
    const planByLotId = useMemo(() => {
        const map = new Map();
        for (const p of plans) {
            if (p && p.ma_lo_trong != null) map.set(String(p.ma_lo_trong), p);
        }
        return map;
    }, [plans]);

    function findPlanForLot(lot) {
        return planByLotId.get(String(lot.id)) || null;
    }

    const [activatedPlanIds, setActivatedPlanIds] = useState(new Set());

    useEffect(() => {
        (async () => {
            try {
                const r = await listTasks();
                if (r?.success) {
                    const s = new Set();
                    (r.data || []).forEach(t => { if (t.ma_ke_hoach != null) s.add(String(t.ma_ke_hoach)); });
                    setActivatedPlanIds(s);
                }
            } catch (_) {}
        })();
    }, [plans.length]);

    function formatLotLabel(id) {
        return `Lô ${id}`;
    }

    function getLotStatus(lot) {
        const p = findPlanForLot(lot);
        if (!p) return "Chưa bắt đầu";
        if (p.trang_thai === 'dang_trong') return 'Đang canh tác';
        if (p.trang_thai === 'da_thu_hoach') return 'Hoàn thành';
        if (p.trang_thai === 'chuan_bi') return 'Đang chuẩn bị';
        return p.trang_thai || 'Chưa bắt đầu';
    }

    const STATUS_COLORS = {
        'Đang canh tác': 'info',
        'Hoàn thành': 'success',
        'Đang chuẩn bị': 'warning',
        'Chưa bắt đầu': 'default'
    };

    function handleOpenCreateForLot(lot) {
        const existingPlan = findPlanForLot(lot);
        const existingHarvest = existingPlan?.ngay_du_kien_thu_hoach ? String(existingPlan.ngay_du_kien_thu_hoach).slice(0,10) : "";
        const minDate = existingHarvest ? addDays(existingHarvest, 10) : "";
        setMinStartDate(minDate);
        setDateError("");
        setForm({
            ma_lo_trong: lot?.id || "",
            ngay_bat_dau: "",
            ngay_du_kien_thu_hoach: "",
            ma_giong: "",
            dien_tich_trong: "30",
            so_luong_nhan_cong: ""
        });
        setOpen(true);
    }

    function handleOpenMapWithLot(lot) {
        setSelectedLotForMap(lot);
        setOpenMap(true);
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Các lô canh tác</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button size="small" variant="text" onClick={async ()=>{ try{ const ping = await fetch('http://localhost/doancuoinam/src/be_management/api/test_connection.php').then(r=>r.json()); alert(ping?.message || 'Kết nối OK'); } catch(e){ alert('Không thể kết nối: '+e.message); } }}>TEST KẾT NỐI</Button>
                <Button size="small" variant="text" onClick={async ()=>{ const [r, l] = await Promise.all([listPlans(), fetch('http://localhost/doancuoinam/src/be_management/api/lo_trong_list.php').then(r=>r.json())]); if(r?.success) setPlans(r.data||[]); if(l?.success) setLots(l.data||[]); }}>REFRESH DỮ LIỆU</Button>
                <Button size="small" variant="text" onClick={async ()=>{ try{ const l = await fetch('http://localhost/doancuoinam/src/be_management/api/lo_trong_list.php').then(r=>r.json()); if(l?.success) setLots(l.data||[]); alert('Đã reset dữ liệu từ database'); } catch(e){ alert('Lỗi reset: '+e.message); } }}>RESET DỮ LIỆU</Button>
            </Box>

            {/* Grid các lô canh tác */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                {lots.map((lot) => {
                    const plan = findPlanForLot(lot);
                    const status = plan ? getLotStatus(lot) : 'Sẵn sàng';
                    const giongName = (() => {
                        if (plan?.ma_giong && Array.isArray(giongs)) {
                            const g = giongs.find(x => x.id === plan.ma_giong);
                            return g ? g.ten_giong : plan.ma_giong;
                        }
                        return 'Chưa chọn';
                    })();
                    const imageUrl = plan?.hinh_anh || lot.image || "";
                    const resolvedImage = imageUrl && (imageUrl.startsWith("http") ? imageUrl : `http://localhost/doancuoinam/${imageUrl.replace(/^\/+/, '')}`);
                    return (
                        <Paper key={lot.id} sx={{ p: 0, border: '1px solid #eaeaea', borderRadius: 2, overflow: 'hidden', transition: 'box-shadow .2s ease', '&:hover': { boxShadow: 3 } }}>
                            <Box sx={{ position: 'relative', height: 120, bgcolor: '#f5f7fb' }}>
                                {resolvedImage ? (
                                    <img src={resolvedImage} alt={formatLotLabel(lot.id)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                                ) : (
                                    <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#90a4ae', fontSize: 24 }}>🗺️</Box>
                                )}
                                <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1 }}>
                                    {plan && (<Chip label="Đã có KH" color="success" size="small" />)}
                                </Box>
                            </Box>
                            <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{formatLotLabel(lot.id)}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip label={status} color={STATUS_COLORS[status] || 'default'} size="small" />
                            </Box>
                            <Box sx={{ display: 'grid', gap: 0.5, color: 'text.secondary', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <RoomIcon fontSize="small" /> <span>Vị trí: {lot.location || 'Khu vực mặc định'}</span></Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <AgricultureIcon fontSize="small" /> <span>Diện tích: {plan?.dien_tich_trong ?? 'Chưa có'} {plan?.dien_tich_trong ? 'ha' : ''}</span></Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <CategoryIcon fontSize="small" /> <span>Loại cây: {giongName}</span></Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <EventIcon fontSize="small" /> <span>Mùa vụ: {plan?.mua_vu || 'Chưa xác định'}</span></Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> <EventIcon fontSize="small" /> <span>Thu hoạch: {plan?.ngay_du_kien_thu_hoach ?? 'Chưa có'}</span></Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Button variant="contained" onClick={() => handleOpenCreateForLot(lot)} sx={{ flex: 1, fontWeight: 700 }}>ĐIỀN THÔNG TIN</Button>
                                <Tooltip title="Xem chi tiết">
                                    <IconButton size="small" color="primary" onClick={() => { if (plan) { setSelectedPlan(plan); setOpenDetails(true); } }}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Xem bản đồ">
                                    <IconButton size="small" color="secondary" onClick={() => handleOpenMapWithLot(lot)}>🗺️</IconButton>
                                </Tooltip>
                            </Box>
                            </Box>
                        </Paper>
                    );
                })}
                {(!lots || lots.length === 0) && (
                    <Typography variant="body2" color="text.secondary">Chưa có dữ liệu lô trồng.</Typography>
                )}
            </Box>

            {/* Kế hoạch đã lưu trong hệ thống (lọc theo trạng thái) */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Kế hoạch đã lưu trong hệ thống</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label="Tất cả" color={savedFilter==='all'?'primary':'default'} onClick={()=>setSavedFilter('all')} />
                    <Chip label="Chuẩn bị" color={savedFilter==='chuan_bi'?'primary':'default'} onClick={()=>setSavedFilter('chuan_bi')} />
                    <Chip label="Đang trồng" color={savedFilter==='dang_trong'?'primary':'default'} onClick={()=>setSavedFilter('dang_trong')} />
                    <Chip label="Đã thu hoạch" color={savedFilter==='da_thu_hoach'?'primary':'default'} onClick={()=>setSavedFilter('da_thu_hoach')} />
                    <Box sx={{ display:'flex', gap:1, ml: { xs: 0, md: 2 } }}>
                        <TextField type="date" size="small" label="Từ ngày" InputLabelProps={{ shrink: true }} value={savedFrom} onChange={e=>setSavedFrom(e.target.value)} />
                        <TextField type="date" size="small" label="Đến ngày" InputLabelProps={{ shrink: true }} value={savedTo} onChange={e=>setSavedTo(e.target.value)} />
                        <Button variant="text" onClick={()=>{ setSavedFrom(""); setSavedTo(""); }}>Xóa lọc ngày</Button>
                    </Box>
                </Box>
                {(() => {
                    const allPlans = Array.isArray(plans) ? plans : [];
                    const byStatus = savedFilter==='all' ? allPlans : allPlans.filter(p => p?.trang_thai === savedFilter);
                    const filtered = byStatus.filter(p => {
                        const d = p?.ngay_du_kien_thu_hoach ? String(p.ngay_du_kien_thu_hoach).slice(0,10) : null;
                        if (!savedFrom && !savedTo) return true;
                        if (!d) return false;
                        if (savedFrom && d < savedFrom) return false;
                        if (savedTo && d > savedTo) return false;
                        return true;
                    });
                    if (filtered.length === 0) {
                        return <Typography variant="body2" color="text.secondary">Không có kế hoạch phù hợp bộ lọc.</Typography>;
                    }
                    const statusLabel = (t)=> t==='da_thu_hoach' ? 'Đã thu hoạch' : t==='dang_trong' ? 'Đang trồng' : 'Chuẩn bị';
                    const statusColor = (t)=> t==='da_thu_hoach' ? 'success' : t==='dang_trong' ? 'info' : 'warning';
                    const resolveGiongName = (id)=> {
                        if (!id) return '-';
                        const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(id)) : null;
                        return g?.ten_giong || `Giống #${id}`;
                    };
                    return (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                            {filtered.map(p => (
                                <Paper key={p.ma_ke_hoach} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
                                    {activatedPlanIds.has(String(p.ma_ke_hoach)) && (
                                        <Chip label="Đã lên lịch" color="success" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
                                    )}
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Kế hoạch #{p.ma_ke_hoach}</Typography>
                                    <Box sx={{ display: 'grid', gap: .5, mt: 1 }}>
                                        <span>Mã lô trồng: {p.ma_lo_trong ?? '-'}</span>
                                        <span>Diện tích: {p.dien_tich_trong ?? '-'} {p.dien_tich_trong ? 'ha' : ''}</span>
                                        <span>Giống cây: {resolveGiongName(p.ma_giong)}</span>
                                        <span>Ngày dự kiến thu hoạch: {p.ngay_du_kien_thu_hoach ?? '-'}</span>
                                        <Chip label={statusLabel(p.trang_thai)} color={statusColor(p.trang_thai)} size="small" sx={{ mt: 1, width: 'fit-content' }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mt: .5 }}>
                                        <Button size="small" variant="outlined" onClick={() => { setSelectedPlan(p); setOpenDetails(true); }}>Xem</Button>
                                        <Button size="small" color="error" variant="outlined" onClick={async ()=>{
                                            if (!window.confirm(`Xóa kế hoạch #${p.ma_ke_hoach}?`)) return;
                                            try {
                                                await deletePlan(p.ma_ke_hoach);
                                                const r = await listPlans();
                                                if (r?.success) setPlans(r.data || []);
                                            } catch (e) {
                                                alert(e.message || 'Không thể xóa kế hoạch');
                                            }
                                        }}>Xóa</Button>
                                        {activatedPlanIds.has(String(p.ma_ke_hoach)) ? (
                                            <>
                                                <Button size="small" color="warning" variant="outlined" onClick={async ()=>{
                                                    if (!window.confirm('Thu hồi kích hoạt? Tất cả lịch đã tạo sẽ bị xóa.')) return;
                                                    try {
                                                        await deleteTasksByPlan(p.ma_ke_hoach);
                                                        const r = await listTasks();
                                                        if (r?.success) {
                                                            const s = new Set();
                                                            (r.data || []).forEach(t => { if (t.ma_ke_hoach != null) s.add(String(t.ma_ke_hoach)); });
                                                            setActivatedPlanIds(s);
                                                        }
                                                    } catch (e) { alert(e.message); }
                                                }}>Thu hồi kích hoạt</Button>
                                            </>
                                        ) : (
                                            <Button size="small" color="success" variant="contained" onClick={async ()=>{ await activatePlan(p); const r = await listTasks(); if (r?.success){ const s=new Set(); (r.data||[]).forEach(t=>{ if(t.ma_ke_hoach!=null) s.add(String(t.ma_ke_hoach)); }); setActivatedPlanIds(s);} }}>Kích hoạt kế hoạch</Button>
                                        )}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    );
                })()}
            </Box>

            {/* Chi tiết kế hoạch */}
            <Dialog open={openDetails} onClose={()=>setOpenDetails(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Chi tiết kế hoạch sản xuất</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {selectedPlan ? (
                        <Box sx={{ display: 'grid', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" color="text.secondary">Mã kế hoạch:</Typography>
                                <Typography fontWeight={600}>{selectedPlan.ma_ke_hoach}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" color="text.secondary">Mã lô trồng:</Typography>
                                <Typography>{selectedPlan.ma_lo_trong ?? '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" color="text.secondary">Diện tích trồng:</Typography>
                                <Typography>{selectedPlan.dien_tich_trong ?? '-'} ha</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" color="text.secondary">Ngày dự kiến thu hoạch:</Typography>
                                <Typography>{selectedPlan.ngay_du_kien_thu_hoach ?? '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                                <Typography>{selectedPlan.trang_thai}</Typography>
                            </Box>
                            {selectedPlan.ghi_chu && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Ghi chú:</Typography>
                                    <Typography>{selectedPlan.ghi_chu}</Typography>
                                </Box>
                            )}
                            {(() => {
                                const cropName = (() => {
                                    const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(selectedPlan.ma_giong)) : null;
                                    return (g?.ten_giong || '');
                                })();
                                const norm = normalizeText(cropName);
                                const isSoy = norm.includes('dau');
                                const isDT2000 = isSoy && norm.includes('dt2000');
                                const preview = isDT2000 ? generateSoySchedule(selectedPlan) : generateRiceSchedule(selectedPlan);
                                if (!preview.length) return null;
                                return (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{isDT2000 ? 'Tóm tắt lịch trình (Đậu tương ĐT2000)' : 'Tóm tắt lịch trình (Ngô LVN10)'}</Typography>
                                        <Box sx={{ display: 'grid', gap: .75 }}>
                                            {preview.map((it, idx) => (
                                                <Box key={idx} sx={{ fontSize: 14, color: 'text.secondary' }}>
                                                    <b>{it.title}</b>: {it.from}{it.to && it.to !== it.from ? ` → ${it.to}` : ''} — {it.desc} (Nhân công: {it.workers})
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                );
                            })()}
                        </Box>
                    ) : (
                        <Typography>Không có dữ liệu.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setOpenDetails(false)}>Đóng</Button>
                    <Button variant="outlined" onClick={()=>{ setOpenDetails(false); setOpenMap(true); }}>Xem bản đồ</Button>
                </DialogActions>
            </Dialog>

            {/* Bản đồ lô trồng (OpenStreetMap) */}
            <Dialog open={openMap} onClose={()=>{ setOpenMap(false); setSelectedLotForMap(null); }} maxWidth="lg" fullWidth>
                <DialogTitle>{selectedLotForMap ? `Vị trí ${formatLotLabel(selectedLotForMap.id)}` : 'Bản đồ khu vực canh tác'}</DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ position: 'relative', width: '100%', height: 500 }}>
                        <iframe
                            title="farm-map"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=106.6280%2C10.8220%2C106.6320%2C10.8250&layer=mapnik&marker=10.8235%2C106.6300`}
                        />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt: 1 }}>
                        Ghi chú: Chưa có tọa độ thực của lô, đang hiển thị khu vực mặc định. Khi API trả về lat/lng theo mã lô, bản đồ sẽ định vị chính xác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{ setOpenMap(false); setSelectedLotForMap(null); }}>Đóng</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo kế hoạch</DialogTitle>
                <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
                    <TextField label="Mã lô trồng" value={form.ma_lo_trong} fullWidth disabled />
                    <TextField
                        label="Diện tích (ha)"
                        type="number"
                        inputProps={{ step: 0.01, min: 0 }}
                        value={form.dien_tich_trong}
                        onChange={(e) => {
                            const newArea = e.target.value;
                            // Recalculate workers with current crop selection
                            const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(form.ma_giong)) : null;
                            const cropName = g?.ten_giong || '';
                            const workers = calculateWorkers(cropName, newArea === '' ? DEFAULT_AREA_PER_LOT_HA : Number(newArea));
                            setForm(prev => ({ ...prev, dien_tich_trong: newArea, so_luong_nhan_cong: String(workers) }));
                        }}
                        fullWidth
                    />
                    <TextField 
                        label="Ngày bắt đầu" 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        value={form.ngay_bat_dau} 
                        inputProps={{ min: minStartDate || undefined }}
                        error={Boolean(dateError)}
                        helperText={dateError || (minStartDate ? `Yêu cầu: không sớm hơn ${minStartDate}` : '')}
                        onChange={(e) => {
                            const newStart = e.target.value;
                            const cropName = (() => {
                                const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(form.ma_giong)) : null;
                                return g?.ten_giong || '';
                            })();
                            if (minStartDate && newStart && newStart < minStartDate) {
                                setDateError(`Ngày bắt đầu phải sau ngày thu hoạch trước 10 ngày (${minStartDate}).`);
                            } else {
                                setDateError("");
                            }
                            setForm(prev => ({
                                ...prev,
                                ngay_bat_dau: newStart,
                                ngay_du_kien_thu_hoach: calculateHarvestDate(newStart, cropName)
                            }));
                        }}
                        fullWidth 
                    />
                    {/* Loại cây: chọn từ danh sách giống nếu có */}
                    <TextField select label="Loại cây (giống)" value={form.ma_giong} onChange={(e) => {
                            const value = e.target.value;
                            const g = Array.isArray(giongs) ? giongs.find(x => String(x.id) === String(value)) : null;
                            const cropName = g?.ten_giong || '';
                            const harvest = calculateHarvestDate(form.ngay_bat_dau, cropName);
                            const areaForCalc = form.dien_tich_trong === '' ? DEFAULT_AREA_PER_LOT_HA : Number(form.dien_tich_trong);
                            const workers = calculateWorkers(cropName, areaForCalc);
                            setForm(prev => ({ ...prev, ma_giong: value, ngay_du_kien_thu_hoach: harvest, so_luong_nhan_cong: String(workers) }));
                        }} fullWidth>
                        <MenuItem value="">Chưa chọn</MenuItem>
                        {Array.isArray(giongs) && giongs.map(g => (
                            <MenuItem key={g.id} value={g.id}>{g.ten_giong || `Giống #${g.id}`}</MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Ngày dự kiến thu hoạch" type="date" InputLabelProps={{ shrink: true }} value={form.ngay_du_kien_thu_hoach} fullWidth disabled />
                    <TextField label="Số lượng nhân công (tự tính)" type="number" value={form.so_luong_nhan_cong} fullWidth disabled />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button variant="contained" onClick={async ()=>{
                        // Kiểm tra ràng buộc 10 ngày nếu lô đã có KH
                        if (minStartDate) {
                            if (!form.ngay_bat_dau) {
                                alert(`Vui lòng chọn ngày bắt đầu không sớm hơn ${minStartDate}.`);
                                return;
                            }
                            if (form.ngay_bat_dau < minStartDate) {
                                alert(`Ngày bắt đầu phải sau ngày thu hoạch trước 10 ngày (${minStartDate}).`);
                                return;
                            }
                        }
                        await handleSave();
                    }}>Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}



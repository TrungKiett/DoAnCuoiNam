import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper, Chip, IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import RoomIcon from '@mui/icons-material/Room';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import { createPlan, ensureLoTrong, listPlans } from "../../services/api";

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
        ngay_du_kien_thu_hoach: "",
        trang_thai: "chuan_bi",
        ma_giong: "",
        mua_vu: "",
        so_luong_nhan_cong: ""
    });
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [openMap, setOpenMap] = useState(false);
    const [selectedLotForMap, setSelectedLotForMap] = useState(null);

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

    const handleSave = async () => {
        try {
            if (form.ma_lo_trong) {
                await ensureLoTrong(Number(form.ma_lo_trong));
            }
            const payload = {
                ma_lo_trong: form.ma_lo_trong === "" ? null : Number(form.ma_lo_trong),
                ngay_bat_dau: null,
                ngay_du_kien_thu_hoach: form.ngay_du_kien_thu_hoach || null,
                trang_thai: form.trang_thai,
                so_luong_nhan_cong: form.so_luong_nhan_cong === "" ? null : Number(form.so_luong_nhan_cong),
                ghi_chu: null,
                ma_giong: form.ma_giong === "" ? null : Number(form.ma_giong),
                mua_vu: form.mua_vu || null
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
        setForm({
            ma_lo_trong: lot?.id || "",
            ngay_du_kien_thu_hoach: "",
            trang_thai: "chuan_bi",
            ma_giong: "",
            mua_vu: "",
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
                    return (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                            {filtered.map(p => (
                                <Paper key={p.ma_ke_hoach} sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Kế hoạch #{p.ma_ke_hoach}</Typography>
                                    <Box sx={{ display: 'grid', gap: .5, mt: 1 }}>
                                        <span>Mã lô trồng: {p.ma_lo_trong ?? '-'}</span>
                                        <span>Diện tích: {p.dien_tich_trong ?? '-'} {p.dien_tich_trong ? 'ha' : ''}</span>
                                        <span>Ngày dự kiến thu hoạch: {p.ngay_du_kien_thu_hoach ?? '-'}</span>
                                        <Chip label={statusLabel(p.trang_thai)} color={statusColor(p.trang_thai)} size="small" sx={{ mt: 1, width: 'fit-content' }} />
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
                    <TextField label="Mã lô trồng" value={form.ma_lo_trong} onChange={(e) => setForm({ ...form, ma_lo_trong: e.target.value })} fullWidth />
                    <TextField label="Ngày dự kiến thu hoạch" type="date" InputLabelProps={{ shrink: true }} value={form.ngay_du_kien_thu_hoach} onChange={(e) => setForm({ ...form, ngay_du_kien_thu_hoach: e.target.value })} fullWidth />
                    <TextField label="Mùa vụ thu hoạch" value={form.mua_vu} onChange={(e) => setForm({ ...form, mua_vu: e.target.value })} fullWidth />
                    <TextField label="Số lượng nhân công" type="number" value={form.so_luong_nhan_cong} onChange={(e) => setForm({ ...form, so_luong_nhan_cong: e.target.value })} fullWidth />
                    <TextField select label="Trạng thái" value={form.trang_thai} onChange={(e) => setForm({ ...form, trang_thai: e.target.value })} fullWidth>
                        <MenuItem value="chuan_bi">Chuẩn bị</MenuItem>
                        <MenuItem value="dang_trong">Đang trồng</MenuItem>
                        <MenuItem value="da_thu_hoach">Đã thu hoạch</MenuItem>
                    </TextField>
                    {/* Loại cây: chọn từ danh sách giống nếu có */}
                    <TextField select label="Loại cây (giống)" value={form.ma_giong} onChange={(e) => setForm({ ...form, ma_giong: e.target.value })} fullWidth>
                        <MenuItem value="">Chưa chọn</MenuItem>
                        {Array.isArray(giongs) && giongs.map(g => (
                            <MenuItem key={g.id} value={g.id}>{g.ten_giong || `Giống #${g.id}`}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleSave}>Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}



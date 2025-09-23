import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { createPlan, ensureLoTrong, listPlans } from "../../services/api";

export default function ProductionPlans() {
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        ma_lo_trong: "",
        dien_tich_trong: "",
        ngay_du_kien_thu_hoach: "",
        trang_thai: "chuan_bi"
    });

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await listPlans();
                if (res?.success) setPlans(res.data || []);
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
                dien_tich_trong: form.dien_tich_trong === "" ? null : Number(form.dien_tich_trong),
                ngay_bat_dau: null,
                ngay_du_kien_thu_hoach: form.ngay_du_kien_thu_hoach || null,
                trang_thai: form.trang_thai,
                so_luong_nhan_cong: null,
                ghi_chu: null,
                ma_giong: null
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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Kế hoạch sản xuất</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button variant="contained" onClick={() => setOpen(true)}>Tạo kế hoạch</Button>
                <Button variant="outlined" onClick={async ()=>{ const r=await listPlans(); if(r?.success) setPlans(r.data||[]);}}>Tải lại</Button>
            </Box>

            <Paper sx={{ p: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã KH</TableCell>
                            <TableCell>Mã lô</TableCell>
                            <TableCell>Diện tích (ha)</TableCell>
                            <TableCell>Ngày thu hoạch</TableCell>
                            <TableCell>Trạng thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map(p=> (
                            <TableRow key={p.ma_ke_hoach}>
                                <TableCell>{p.ma_ke_hoach}</TableCell>
                                <TableCell>{p.ma_lo_trong ?? '-'}</TableCell>
                                <TableCell>{p.dien_tich_trong ?? '-'}</TableCell>
                                <TableCell>{p.ngay_du_kien_thu_hoach ?? '-'}</TableCell>
                                <TableCell>{p.trang_thai}</TableCell>
                            </TableRow>
                        ))}
                        {(!plans || plans.length===0) && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">{loading ? 'Đang tải...' : 'Chưa có kế hoạch'}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo kế hoạch</DialogTitle>
                <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
                    <TextField label="Mã lô trồng" value={form.ma_lo_trong} onChange={(e) => setForm({ ...form, ma_lo_trong: e.target.value })} fullWidth />
                    <TextField label="Diện tích trồng (ha)" value={form.dien_tich_trong} onChange={(e) => setForm({ ...form, dien_tich_trong: e.target.value })} fullWidth />
                    <TextField label="Ngày dự kiến thu hoạch" type="date" InputLabelProps={{ shrink: true }} value={form.ngay_du_kien_thu_hoach} onChange={(e) => setForm({ ...form, ngay_du_kien_thu_hoach: e.target.value })} fullWidth />
                    <TextField select label="Trạng thái" value={form.trang_thai} onChange={(e) => setForm({ ...form, trang_thai: e.target.value })} fullWidth>
                        <MenuItem value="chuan_bi">Chuẩn bị</MenuItem>
                        <MenuItem value="dang_trong">Đang trồng</MenuItem>
                        <MenuItem value="da_thu_hoach">Đã thu hoạch</MenuItem>
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



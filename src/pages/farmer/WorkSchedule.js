import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Header from "../../components/farmer/Header";
import { listTasks, updateTask } from "../../services/api";

// Map admin status -> label/color
const STATUS_LABELS = { chua_bat_dau: "Chưa bắt đầu", dang_lam: "Đang làm", hoan_thanh: "Hoàn thành", bao_loi: "Báo lỗi" };
const STATUS_COLOR = { chua_bat_dau: "default", dang_lam: "warning", hoan_thanh: "success", bao_loi: "error" };

export default function FarmerWorkSchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);

  // TODO: replace with real logged-in farmer id when auth is added
  const farmerId = localStorage.getItem("farmer_id") || "";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await listTasks();
        if (!mounted) return;
        setTasks(res?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Lỗi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const myTasks = useMemo(() => tasks.filter(t => String(t.ma_nguoi_dung || "") === String(farmerId)), [tasks, farmerId]);

  const groupedByDate = useMemo(() => {
    const map = {};
    for (const t of myTasks) {
      const key = t.ngay_bat_dau || "Khác";
      (map[key] = map[key] || []).push(t);
    }
    return map;
  }, [myTasks]);

  async function changeStatus(task, status) {
    try {
      await updateTask({ id: task.id, trang_thai: status });
      setTasks(prev => prev.map(x => x.id === task.id ? { ...x, trang_thai: status } : x));
      setSelected(null);
    } catch (e) {
      alert(e.message || "Không thể cập nhật trạng thái");
    }
  }

  return (
    <Box>
      <Header />
      <Box sx={{ p: 3, ml: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Lịch làm của tôi</Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {loading ? (
          <Typography>Đang tải…</Typography>
        ) : (
          <Stack spacing={2}>
            {Object.keys(groupedByDate).sort().map(date => (
              <Paper key={date} elevation={0} sx={{ p: 2, pb: 1, bgcolor: "white", border: "1px solid #eee" }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>{date}</Typography>
                <Stack spacing={1.5}>
                  {groupedByDate[date].map(t => (
                    <Box key={t.id} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" }, gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{t.ten_cong_viec}</Typography>
                        <Typography variant="body2" color="text.secondary">{t.mo_ta || ""}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Thời gian</Typography>
                        <Typography>{t.ngay_bat_dau} → {t.ngay_ket_thuc}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                        <Chip label={STATUS_LABELS[t.trang_thai] || t.trang_thai} color={STATUS_COLOR[t.trang_thai]} size="small" />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0 }}>
                        <Button variant="outlined" size="small" sx={{ mb: 0 }} onClick={() => setSelected(t)}>Cập nhật</Button>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>{selected?.ten_cong_viec}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => changeStatus(selected, "dang_lam")} color="warning">Đang làm</Button>
          <Button onClick={() => changeStatus(selected, "hoan_thanh")} color="success">Hoàn thành</Button>
          <Button onClick={() => changeStatus(selected, "bao_loi")} color="error">Báo lỗi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



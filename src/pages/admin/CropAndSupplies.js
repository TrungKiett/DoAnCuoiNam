import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Divider,
  Button,
  TextField,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from "@mui/material";
import {
  listPlans,
  listTasks,
  createTask,
  materialsList,
  upsertMaterialUsage,
  cropLogsForLot,
  alertsList
} from "../../services/api";

export default function CropAndSupplies() {
  const [plans, setPlans] = useState([]);
  const [selectedLots, setSelectedLots] = useState([]);
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ ma_lo_trong: "", ngay: "", ten: "", don_vi: "kg", so_luong: "" });

  const [logsByLot, setLogsByLot] = useState({});
  const [newLog, setNewLog] = useState({ ma_lo_trong: "", ngay: "", hoat_dong: "", ghi_chu: "" });

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [plansRes, materialsRes, alertsRes] = await Promise.all([
          listPlans(),
          materialsList(),
          alertsList()
        ]);
        setPlans(plansRes.data || []);
        setMaterials(materialsRes.data || []);
        setAlerts(alertsRes.data || []);
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      }
    })();
  }, []);

  const lots = useMemo(() => {
    const ids = new Set();
    const arr = [];
    (plans || []).forEach(p => {
      if (!ids.has(p.ma_lo_trong)) {
        ids.add(p.ma_lo_trong);
        arr.push({ ma_lo_trong: p.ma_lo_trong, dien_tich_trong: p.dien_tich_trong, ngay_du_kien_thu_hoach: p.ngay_du_kien_thu_hoach });
      }
    });
    return arr;
  }, [plans]);

  const toggleLot = (ma_lo_trong) => {
    setSelectedLots(prev => prev.includes(ma_lo_trong) ? prev.filter(x => x !== ma_lo_trong) : [...prev, ma_lo_trong]);
  };

  const handleBulkSow = async () => {
    if (selectedLots.length === 0) {
      setSnack({ open: true, message: "Chọn ít nhất một lô để ghi nhật ký gieo trồng.", severity: "warning" });
      return;
    }
    try {
      const today = new Date().toISOString().slice(0,10);
      await Promise.all(selectedLots.map(ma => createTask({
        ma_ke_hoach: plans.find(p => p.ma_lo_trong === ma)?.ma_ke_hoach || plans[0]?.ma_ke_hoach,
        ten_cong_viec: "Gieo trồng",
        mo_ta: "Gieo đồng loạt",
        ngay_bat_dau: today,
        ngay_ket_thuc: today,
        trang_thai: "dang_thuc_hien"
      })));
      setSnack({ open: true, message: "Đã tạo nhật ký gieo trồng cho các lô đã chọn", severity: "success" });
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const handleAddMaterial = async (applyBulk) => {
    try {
      if (applyBulk) {
        if (selectedLots.length === 0) throw new Error("Chọn lô để áp dụng đồng loạt");
        await Promise.all(selectedLots.map(ma => upsertMaterialUsage({ ...newMaterial, ma_lo_trong: ma })));
      } else {
        if (!newMaterial.ma_lo_trong) throw new Error("Chọn lô trồng");
        await upsertMaterialUsage(newMaterial);
      }
      const refreshed = await materialsList();
      setMaterials(refreshed.data || []);
      setSnack({ open: true, message: "Cập nhật thành công", severity: "success" });
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const loadLogsForLot = async (ma) => {
    try {
      const res = await cropLogsForLot(ma);
      setLogsByLot(prev => ({ ...prev, [ma]: res.data || [] }));
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Quản lí gieo trồng và vật tư
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight={600} gutterBottom>
          Danh sách lô đang canh tác
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {lots.map(lot => (
            <Chip key={lot.ma_lo_trong}
              color={selectedLots.includes(lot.ma_lo_trong) ? "primary" : "default"}
              onClick={() => toggleLot(lot.ma_lo_trong)}
              label={`Lô ${lot.ma_lo_trong} (${lot.dien_tich_trong || "?"} ha)`} />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button variant="contained" onClick={handleBulkSow}>Ghi nhật ký gieo đồng loạt</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Vật tư" />
          <Tab label="Nhật ký trồng" />
          <Tab label="Cảnh báo" />
        </Tabs>
        <Divider sx={{ mb: 2 }} />

        {tab === 0 && (
          <Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Lô trồng</InputLabel>
                <Select
                  label="Lô trồng"
                  value={newMaterial.ma_lo_trong}
                  onChange={(e) => setNewMaterial({ ...newMaterial, ma_lo_trong: e.target.value })}
                >
                  {lots.map(l => (<MenuItem key={l.ma_lo_trong} value={l.ma_lo_trong}>Lô {l.ma_lo_trong}</MenuItem>))}
                </Select>
              </FormControl>
              <TextField type="date" label="Ngày" InputLabelProps={{ shrink: true }} value={newMaterial.ngay} onChange={e => setNewMaterial({ ...newMaterial, ngay: e.target.value })} />
              <TextField label="Tên vật tư" value={newMaterial.ten} onChange={e => setNewMaterial({ ...newMaterial, ten: e.target.value })} />
              <TextField label="Đơn vị" value={newMaterial.don_vi} onChange={e => setNewMaterial({ ...newMaterial, don_vi: e.target.value })} />
              <TextField type="number" label="Số lượng" value={newMaterial.so_luong} onChange={e => setNewMaterial({ ...newMaterial, so_luong: e.target.value })} />
              <Button variant="contained" onClick={() => handleAddMaterial(false)}>Lưu</Button>
              <Button variant="outlined" onClick={() => handleAddMaterial(true)}>Áp dụng cho lô đã chọn</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={600} gutterBottom>Vật tư đã ghi nhận</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ width: 'fit-content' }}>
              <Table size="small" sx={{ tableLayout: 'auto', '& .MuiTableCell-root': { py: 0.5, px: 1.5 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 70, fontWeight: 600 }}>Lô</TableCell>
                    <TableCell sx={{ fontWeight: 600, maxWidth: 260 }}>Tên</TableCell>
                    <TableCell sx={{ width: 110, fontWeight: 600 }} align="right">Số lượng</TableCell>
                    <TableCell sx={{ width: 80, fontWeight: 600 }}>Đơn vị</TableCell>              
                          <TableCell sx={{ width: 130, fontWeight: 600 }}>Ngày</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map(m => (
                    <TableRow key={m.id} hover>
                      
                      <TableCell>{m.ma_lo_trong}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.ten}</TableCell>
                      <TableCell align="right">{Number(m.so_luong).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{m.don_vi}</TableCell>
                      <TableCell>{m.ngay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Lô trồng</InputLabel>
                <Select label="Lô trồng" value={newLog.ma_lo_trong} onChange={e => setNewLog({ ...newLog, ma_lo_trong: e.target.value })}>
                  {lots.map(l => (<MenuItem key={l.ma_lo_trong} value={l.ma_lo_trong}>Lô {l.ma_lo_trong}</MenuItem>))}
                </Select>
              </FormControl>
              <TextField type="date" label="Ngày" InputLabelProps={{ shrink: true }} value={newLog.ngay} onChange={e => setNewLog({ ...newLog, ngay: e.target.value })} />
              <TextField label="Hoạt động" placeholder="Tưới nước, bón phân..." value={newLog.hoat_dong} onChange={e => setNewLog({ ...newLog, hoat_dong: e.target.value })} />
              <TextField label="Ghi chú" value={newLog.ghi_chu} onChange={e => setNewLog({ ...newLog, ghi_chu: e.target.value })} />
              <Button variant="contained" onClick={async () => {
                try {
                  if (!newLog.ma_lo_trong) throw new Error("Chọn lô trồng");
                  const today = newLog.ngay || new Date().toISOString().slice(0,10);
                  await createTask({
                    ma_ke_hoach: plans.find(p => p.ma_lo_trong === newLog.ma_lo_trong)?.ma_ke_hoach || plans[0]?.ma_ke_hoach,
                    ten_cong_viec: newLog.hoat_dong || "Nhật ký trồng",
                    mo_ta: newLog.ghi_chu || "",
                    ngay_bat_dau: today,
                    ngay_ket_thuc: today,
                    trang_thai: "dang_thuc_hien"
                  });
                  await loadLogsForLot(newLog.ma_lo_trong);
                  setSnack({ open: true, message: "Cập nhật thành công", severity: "success" });
                } catch (e) {
                  setSnack({ open: true, message: e.message, severity: "error" });
                }
              }}>Ghi nhật ký</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}>
              {lots.map(l => (
                <Button key={l.ma_lo_trong} variant="outlined" onClick={() => loadLogsForLot(l.ma_lo_trong)}>Xem lô {l.ma_lo_trong}</Button>
              ))}
            </Stack>
            <Box sx={{ mt: 2 }}>
              {Object.entries(logsByLot).map(([ma, logs]) => (
                <Paper key={ma} sx={{ p: 1, mb: 1 }}>
                  <Typography fontWeight={600}>Nhật ký lô {ma}</Typography>
                  <ul>
                    {logs.map(t => (
                      <li key={t.id}>{t.ngay_bat_dau} - {t.ten_cong_viec} ({t.trang_thai})</li>
                    ))}
                  </ul>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography fontWeight={600} gutterBottom>Cảnh báo mùa vụ</Typography>
            <ul>
              {alerts.map(a => (
                <li key={a.id}>{a.message}</li>
              ))}
            </ul>
          </Box>
        )}
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}



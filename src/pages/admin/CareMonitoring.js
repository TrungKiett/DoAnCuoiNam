import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, Stack, TextField, MenuItem, Chip, Divider, Button, CircularProgress } from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SendIcon from "@mui/icons-material/Send";
import { lotsList, listTasks, materialsList, alertsList, weatherSuggestion } from "../../services/api";

export default function CareMonitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lots, setLots] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedLot, setSelectedLot] = useState("");
  const [manualSuggestion, setManualSuggestion] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [weather, setWeather] = useState({ loading: false, error: "", suggestions: [], alerts: [] });

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [lotsRes, tasksRes, matsRes, alertsRes] = await Promise.all([
          lotsList(),
          listTasks(),
          materialsList(),
          alertsList()
        ]);
        if (!alive) return;
        setLots(lotsRes?.data || []);
        setTasks(tasksRes?.data || []);
        setMaterials(matsRes?.data || []);
        setAlerts(alertsRes?.data || []);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Lỗi tải dữ liệu");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const lotTasks = useMemo(() => {
    return tasks.filter(t => selectedLot ? String(t.ma_lo_trong) === String(selectedLot) : true);
  }, [tasks, selectedLot]);

  const lotMaterials = useMemo(() => {
    return materials.filter(m => selectedLot ? String(m.ma_lo_trong) === String(selectedLot) : true);
  }, [materials, selectedLot]);

  const lotAlerts = useMemo(() => {
    return alerts.filter(a => selectedLot ? String(a.ma_lo_trong) === String(selectedLot) : true);
  }, [alerts, selectedLot]);

  function sendSuggestion() {
    // Stub: simulate sending to farmer
    if (!manualSuggestion.trim()) {
      setSendStatus("Vui lòng nhập đề xuất trước khi gửi.");
      return;
    }
    setSendStatus("Đang gửi...");
    setTimeout(() => {
      setSendStatus("Gửi thành công");
      setManualSuggestion("");
    }, 600);
  }

  async function handleWeatherSuggestion() {
    setWeather(prev => ({ ...prev, loading: true, error: "" }));
    try {
      const res = await weatherSuggestion(selectedLot || null);
      const data = res?.data || {};
      setWeather({ loading: false, error: "", suggestions: data.suggestions || [], alerts: data.alerts || [] });
    } catch (e) {
      setWeather({ loading: false, error: e.message || "Lỗi lấy gợi ý thời tiết", suggestions: [], alerts: [] });
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Chăm sóc & theo dõi</Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            label="Chọn lô"
            select
            size="small"
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="">Tất cả lô</MenuItem>
            {lots.map(l => (
              <MenuItem key={l.ma_lo_trong || l.id} value={l.ma_lo_trong || l.id}>
                {l.ma_lo_trong || l.id}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" startIcon={<CloudIcon />} onClick={handleWeatherSuggestion}>Gợi ý dựa trên thời tiết</Button>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>
      ) : error ? (
        <Paper elevation={0} sx={{ p: 3, color: "error.main", bgcolor: "#ffebee" }}>{error}</Paper>
      ) : (
        <Stack spacing={2}>
          {/* Tasks / care logs */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Nhật ký chăm sóc</Typography>
              <Typography variant="body2" color="text.secondary">({lotTasks.length} mục)</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {lotTasks.length === 0 ? (
              <Typography>không có dữ liệu</Typography>
            ) : (
              <Stack spacing={1.5}>
                {lotTasks.map(t => (
                  <Box key={t.id} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{t.ten_cong_viec}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.mo_ta || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Lô</Typography>
                      <Typography>{t.ma_lo_trong || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Thời gian</Typography>
                      <Typography>{t.ngay_bat_dau || ""} → {t.ngay_ket_thuc || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                      <Typography>{t.trang_thai}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Materials */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Vật tư đã sử dụng</Typography>
              <Typography variant="body2" color="text.secondary">({lotMaterials.length} mục)</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {lotMaterials.length === 0 ? (
              <Typography>không có dữ liệu</Typography>
            ) : (
              <Stack spacing={1.5}>
                {lotMaterials.map((m, idx) => (
                  <Box key={`${m.id || idx}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{m.ten_vat_tu || m.ma_vat_tu || "Vật tư"}</Typography>
                      <Typography variant="body2" color="text.secondary">{m.ghi_chu || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Lô</Typography>
                      <Typography>{m.ma_lo_trong || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Số lượng</Typography>
                      <Typography>{m.so_luong || m.dinh_luong || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ngày</Typography>
                      <Typography>{m.ngay_su_dung || m.created_at || ""}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Alerts (AI/Weather/etc.) */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Cảnh báo & gợi ý</Typography>
              <Typography variant="body2" color="text.secondary">({lotAlerts.length} mục)</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {weather.loading && <Typography>Đang lấy gợi ý thời tiết...</Typography>}
            {weather.error && <Typography color="error">{weather.error}</Typography>}
            {weather.suggestions.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Gợi ý từ thời tiết</Typography>
                <Stack spacing={1}>
                  {weather.suggestions.map((s, idx) => (
                    <Typography key={idx} variant="body2">- {s}</Typography>
                  ))}
                </Stack>
              </Box>
            )}
            {weather.alerts.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Cảnh báo thời tiết</Typography>
                <Stack spacing={1}>
                  {weather.alerts.map((s, idx) => (
                    <Typography key={idx} variant="body2">- {s}</Typography>
                  ))}
                </Stack>
              </Box>
            )}
            {lotAlerts.length === 0 ? (
              <Typography>không có dữ liệu</Typography>
            ) : (
              <Stack spacing={1.5}>
                {lotAlerts.map((a, idx) => (
                  <Box key={`${a.id || idx}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}><WarningAmberIcon fontSize="small" style={{ verticalAlign: "middle" }} /> {a.title || a.type || "Cảnh báo"}</Typography>
                      <Typography variant="body2" color="text.secondary">{a.message || a.noi_dung || a.mo_ta || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Lô</Typography>
                      <Typography>{a.ma_lo_trong || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Thời gian</Typography>
                      <Typography>{a.created_at || a.thoi_gian || ""}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Manual suggestion */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Đề xuất thủ công</Typography>
            <TextField
              multiline
              minRows={3}
              fullWidth
              placeholder="Nhập đề xuất xử lý (ví dụ: tưới bổ sung 2 ngày tới do nắng nóng)"
              value={manualSuggestion}
              onChange={(e) => setManualSuggestion(e.target.value)}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button variant="contained" endIcon={<SendIcon />} onClick={sendSuggestion}>Gửi đề xuất</Button>
              {sendStatus && <Chip label={sendStatus} color={sendStatus === "Gửi thành công" ? "success" : "default"} />}
            </Stack>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}



import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import Weather from "../../components/admin/Weather_AI";
import {
  lotsList,
  listTasks,
  materialsList,
  alertsList,
  weatherSuggestion,
} from "../../services/api";
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
  const [weather, setWeather] = useState({
    loading: false,
    error: "",
    suggestions: [],
    alerts: [],
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError("");

      // Fallback data for lots
      const fallbackLots = [
        {
          id: "Lô 1",
          ma_lo_trong: "1",
          status: "Sẵn sàng",
          location: "Khu A",
          area: 0.5,
          crop: "",
          season: "",
          lat: 10.8242,
          lng: 106.6312,
        },
        {
          id: "Lô 2",
          ma_lo_trong: "2",
          status: "Chưa bắt đầu",
          location: "Khu B",
          area: 0.3,
          crop: "",
          season: "",
          lat: 10.825,
          lng: 106.632,
        },
      ];

      try {
        const [lotsRes, tasksRes, matsRes, alertsRes] =
          await Promise.allSettled([
            lotsList(),
            listTasks(),
            materialsList(),
            alertsList(),
          ]);

        if (!alive) return;

        // Handle lots data with fallback
        if (lotsRes.status === "fulfilled" && lotsRes.value?.success) {
          setLots(lotsRes.value.data || fallbackLots);
        } else {
          console.warn(
            "Failed to load lots, using fallback data:",
            lotsRes.value
          );
          setLots(fallbackLots);
        }

        // Handle other data
        if (tasksRes.status === "fulfilled" && tasksRes.value?.success) {
          setTasks(tasksRes.value.data || []);
        } else {
          console.warn("Failed to load tasks:", tasksRes.value);
          setTasks([]);
        }

        if (matsRes.status === "fulfilled" && matsRes.value?.success) {
          setMaterials(matsRes.value.data || []);
        } else {
          console.warn("Failed to load materials:", matsRes.value);
          setMaterials([]);
        }

        if (alertsRes.status === "fulfilled" && alertsRes.value?.success) {
          setAlerts(alertsRes.value.data || []);
        } else {
          console.warn("Failed to load alerts:", alertsRes.value);
          setAlerts([]);
        }
      } catch (e) {
        if (!alive) return;
        console.error("Error loading data:", e);
        // Use fallback data instead of showing error
        setLots(fallbackLots);
        setTasks([]);
        setMaterials([]);
        setAlerts([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const lotTasks = useMemo(() => {
    return tasks.filter((t) =>
      selectedLot ? String(t.ma_lo_trong) === String(selectedLot) : true
    );
  }, [tasks, selectedLot]);

  const lotMaterials = useMemo(() => {
    return materials.filter((m) =>
      selectedLot ? String(m.ma_lo_trong) === String(selectedLot) : true
    );
  }, [materials, selectedLot]);

  const lotAlerts = useMemo(() => {
    return alerts.filter((a) =>
      selectedLot ? String(a.ma_lo_trong) === String(selectedLot) : true
    );
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

  return (
    <Box>
      <Weather />
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {" "}
        Chăm sóc & theo dõi{" "}
      </Typography>
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <TextField
            label="Chọn lô"
            select
            size="small"
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value=""> Tất cả lô </MenuItem>{" "}
            {lots.map((l) => (
              <MenuItem
                key={l.ma_lo_trong || l.id}
                value={l.ma_lo_trong || l.id}
              >
                {" "}
                {l.ma_lo_trong || l.id}{" "}
              </MenuItem>
            ))}{" "}
          </TextField>{" "}
          <Box sx={{ flex: 1 }} />{" "}
        </Stack>{" "}
      </Paper>{" "}
      {/* Alerts (AI/Weather/etc.) */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          {" "}
          <CircularProgress />{" "}
        </Box>
      ) : (
        <Stack spacing={2}>
          {" "}
          {/* Tasks / care logs */}{" "}
          <Paper
            elevation={0}
            sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6"> Nhật ký chăm sóc </Typography>{" "}
              <Typography variant="body2" color="text.secondary">
                {" "}
                ({lotTasks.length}
                mục){" "}
              </Typography>{" "}
            </Stack>{" "}
            <Divider sx={{ mb: 2 }} />{" "}
            {lotTasks.length === 0 ? (
              <Typography> không có dữ liệu </Typography>
            ) : (
              <Stack spacing={1.5}>
                {" "}
                {lotTasks.map((t) => (
                  <Box
                    key={t.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {" "}
                        {t.ten_cong_viec}{" "}
                      </Typography>{" "}
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        {t.mo_ta || ""}{" "}
                      </Typography>{" "}
                    </Box>{" "}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        Lô{" "}
                      </Typography>{" "}
                      <Typography> {t.ma_lo_trong || ""} </Typography>{" "}
                    </Box>{" "}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        Thời gian{" "}
                      </Typography>{" "}
                      <Typography>
                        {" "}
                        {t.ngay_bat_dau || ""}→ {t.ngay_ket_thuc || ""}{" "}
                      </Typography>{" "}
                    </Box>{" "}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        Trạng thái{" "}
                      </Typography>{" "}
                      <Typography> {t.trang_thai} </Typography>{" "}
                    </Box>{" "}
                  </Box>
                ))}{" "}
              </Stack>
            )}{" "}
          </Paper>
          {/* Materials */}{" "}
          <Paper
            elevation={0}
            sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6"> Vật tư đã sử dụng </Typography>{" "}
              <Typography variant="body2" color="text.secondary">
                {" "}
                ({lotMaterials.length}
                mục){" "}
              </Typography>{" "}
            </Stack>{" "}
            <Divider sx={{ mb: 2 }} />{" "}
            {lotMaterials.length === 0 ? (
              <Typography> không có dữ liệu </Typography>
            ) : (
              <Stack spacing={1.5}>
                {" "}
                {lotMaterials.map((m, idx) => (
                  <Box
                    key={`${m.id || idx}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {" "}
                        {m.ten_vat_tu || m.ma_vat_tu || "Vật tư"}{" "}
                      </Typography>{" "}
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        {m.ghi_chu || ""}{" "}
                      </Typography>{" "}
                    </Box>{" "}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        Lô{" "}
                      </Typography>{" "}
                      <Typography> {m.ma_lo_trong || ""} </Typography>{" "}
                    </Box>{" "}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        Số lượng{" "}
                      </Typography>{" "}
                      <Typography>
                        {" "}
                        {m.so_luong || m.dinh_luong || ""}{" "}
                      </Typography>{" "}
                    </Box>{" "}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {" "}
                        Ngày{" "}
                      </Typography>{" "}
                      <Typography>
                        {" "}
                        {m.ngay_su_dung || m.created_at || ""}{" "}
                      </Typography>{" "}
                    </Box>{" "}
                  </Box>
                ))}{" "}
              </Stack>
            )}{" "}
          </Paper>
          {/* Manual suggestion */}{" "}
          <Paper
            elevation={0}
            sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {" "}
              Đề xuất thủ công{" "}
            </Typography>{" "}
            <TextField
              multiline
              minRows={3}
              fullWidth
              placeholder="Nhập đề xuất xử lý (ví dụ: tưới bổ sung 2 ngày tới do nắng nóng)"
              value={manualSuggestion}
              onChange={(e) => setManualSuggestion(e.target.value)}
            />{" "}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={sendSuggestion}
              >
                {" "}
                Gửi đề xuất{" "}
              </Button>{" "}
              {sendStatus && (
                <Chip
                  label={sendStatus}
                  color={
                    sendStatus === "Gửi thành công" ? "success" : "default"
                  }
                />
              )}{" "}
            </Stack>{" "}
          </Paper>{" "}
        </Stack>
      )}{" "}
    </Box>
  );
}

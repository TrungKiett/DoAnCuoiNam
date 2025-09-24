import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { fetchFarmers, listTasks } from "../../services/api";

function formatDateInput(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function withinRange(dateStr, startStr, endStr) {
  if (!startStr && !endStr) return true;
  const t = new Date(dateStr).getTime();
  if (!Number.isFinite(t)) return false;
  if (startStr) {
    const s = new Date(startStr).getTime();
    if (t < s) return false;
  }
  if (endStr) {
    const e = new Date(endStr).getTime();
    if (t > e + 24 * 60 * 60 * 1000 - 1) return false; // inclusive end date
  }
  return true;
}

const STATUS_LABELS = {
  chua_lam: "Chưa bắt đầu",
  dang_lam: "Đang thực hiện",
  hoan_thanh: "Hoàn thành",
  bao_loi: "Báo lỗi"
};

const STATUS_COLOR = {
  chua_lam: "default",
  dang_lam: "warning",
  hoan_thanh: "success",
  bao_loi: "error"
};

export default function AttendanceManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [farmers, setFarmers] = useState([]);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFarmers, setSelectedFarmers] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [tasksRes, farmersRes] = await Promise.all([listTasks(), fetchFarmers()]);
        if (!isMounted) return;
        const taskData = tasksRes?.data || [];
        const farmerData = farmersRes?.data || [];
        setTasks(taskData);
        setFarmers(farmerData);
        // Default date range: this month
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(formatDateInput(first));
        setEndDate(formatDateInput(last));
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || "Lỗi tải dữ liệu");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesFarmer = selectedFarmers.length > 0 
        ? selectedFarmers.includes(String(t.ma_nguoi_dung)) 
        : true;
      const matchesText = searchText
        ? (t.ten_cong_viec || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (t.mo_ta || "").toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchesDate = withinRange(t.ngay_bat_dau || t.created_at, startDate, endDate);
      return matchesFarmer && matchesText && matchesDate;
    });
  }, [tasks, selectedFarmers, searchText, startDate, endDate]);

  const groupedByStatus = useMemo(() => {
    const groups = { chua_lam: [], dang_lam: [], hoan_thanh: [], bao_loi: [] };
    for (const t of filtered) {
      const key = STATUS_LABELS[t.trang_thai] ? t.trang_thai : "chua_lam";
      groups[key].push(t);
    }
    return groups;
  }, [filtered]);

  function exportCSV() {
    const rows = [
      [
        "ID",
        "Công việc",
        "Mô tả",
        "Người phụ trách",
        "Ngày bắt đầu",
        "Ngày kết thúc",
        "Trạng thái"
      ],
      ...filtered.map((t) => [
        t.id,
        t.ten_cong_viec,
        (t.mo_ta || "").replace(/\n/g, " "),
        t.ma_nguoi_dung || "",
        t.ngay_bat_dau || "",
        t.ngay_ket_thuc || "",
        STATUS_LABELS[t.trang_thai] || STATUS_LABELS.chua_lam
      ])
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao_cao_cham_cong_${startDate || "all"}_${endDate || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    // Simple print-to-PDF using browser dialog; for real PDF integrate a library later
    window.print();
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Quản lý chấm công</Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            label="Từ ngày"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => {
              const now = new Date();
              const first = new Date(now.getFullYear(), now.getMonth(), 1);
              const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              setStartDate(formatDateInput(first));
              setEndDate(formatDateInput(last));
            }}>Tháng này</Button>
            <Button variant="outlined" size="small" onClick={() => {
              const d = new Date();
              const s = formatDateInput(d);
              setStartDate(s); setEndDate(s);
            }}>Hôm nay</Button>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="farmers-select-label">Nhân công</InputLabel>
            <Select
              labelId="farmers-select-label"
              multiple
              value={selectedFarmers}
              onChange={(e) => setSelectedFarmers(e.target.value)}
              input={<OutlinedInput label="Nhân công" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const farmer = farmers.find(f => String(f.id) === value);
                    return (
                      <Chip 
                        key={value} 
                        label={farmer ? (farmer.full_name || farmer.username || `ND-${farmer.id}`) : value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {farmers.map((f) => (
                <MenuItem key={f.id} value={String(f.id)}>
                  {f.full_name || f.username || `ND-${f.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tìm kiếm công việc"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 240 }}
          />
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>Xuất CSV</Button>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={exportPDF}>Xuất PDF</Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>
      ) : error ? (
        <Paper elevation={0} sx={{ p: 3, color: "error.main", bgcolor: "#ffebee" }}>
          {error}
        </Paper>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, bgcolor: "#fff3e0" }}>
          <Typography>Chưa có dữ liệu trong khoảng thời gian này</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {(["chua_lam", "dang_lam", "hoan_thanh", "bao_loi"]).map((statusKey) => (
            <Paper key={statusKey} elevation={0} sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label={STATUS_LABELS[statusKey]} color={STATUS_COLOR[statusKey]} />
                <Typography variant="body2" color="text.secondary">{groupedByStatus[statusKey].length} công việc</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {groupedByStatus[statusKey].map((t) => (
                  <Box key={t.id} sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr 120px" },
                    gap: 2,
                    p: 1.5,
                    border: "1px solid #eee",
                    borderRadius: 1,
                    bgcolor: "#fafafa",
                    '&:hover': { bgcolor: 'white', boxShadow: 1 }
                  }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{t.ten_cong_viec}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.mo_ta || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Người phụ trách</Typography>
                      {t.ma_nguoi_dung ? (
                        (() => {
                          const farmer = farmers.find(f => f.id == t.ma_nguoi_dung);
                          return farmer ? (
                            <Typography>{farmer.full_name}</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">ID: {t.ma_nguoi_dung}</Typography>
                          );
                        })()
                      ) : (
                        <Typography></Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Bắt đầu</Typography>
                      <Typography>{t.ngay_bat_dau || ""}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Kết thúc</Typography>
                      <Typography>{t.ngay_ket_thuc || ""}</Typography>
                    </Box>
                    <Box sx={{ display:"flex", alignItems:"center", justifyContent:{ xs:'flex-start', md:'flex-end' } }}>
                      <Chip size="small" label={STATUS_LABELS[t.trang_thai] || STATUS_LABELS.chua_lam} color={STATUS_COLOR[t.trang_thai] || 'default'} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}



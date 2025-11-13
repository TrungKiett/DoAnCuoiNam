import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import FarmerLayout from "../../components/farmer/FarmerLayout";
import { fetchPayrollData, listTasks, updateHourlyRate } from "../../services/api";

const DEFAULT_RATE = 30000;

export default function FarmerPayroll() {
  const [farmer, setFarmer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [period, setPeriod] = useState("all"); // all | weekly | monthly
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [week, setWeek] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_RATE);
  const [payrollStatus, setPayrollStatus] = useState(null);
  const [dbTotals, setDbTotals] = useState({ hours: 0, income: 0, rate: DEFAULT_RATE });
  const isApproved = (s) => {
    if (!s) return false;
    const v = String(s).trim().toLowerCase();
    return v === "approved" || v === "da_duyet" || v === "đã duyệt" || v === "da duyet";
  };

  useEffect(() => {
    const farmerData = localStorage.getItem("farmer_user");
    if (farmerData) setFarmer(JSON.parse(farmerData));
  }, []);

  useEffect(() => {
    if (!farmer) return;
    (async () => {
      try {
        const res = await listTasks();
        setTasks(res?.data || []);
      } catch (_) {
        setTasks([]);
      }
    })();
  }, [farmer]);

  const { startDate, endDate } = useMemo(() => {
    if (period === "all") {
      return { startDate: null, endDate: null };
    }
    if (period === "weekly") {
      const firstDay = new Date(year, month - 1, 1);
      const monday = new Date(firstDay);
      monday.setDate(firstDay.getDate() - firstDay.getDay() + 1);
      const s = new Date(monday);
      s.setDate(monday.getDate() + (week - 1) * 7);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      return { startDate: s, endDate: e };
    }
    const s = new Date(year, month - 1, 1);
    const e = new Date(year, month, 0);
    return { startDate: s, endDate: e };
  }, [period, week, month, year]);

  // Also load tasks via payroll_list for this worker to ensure parity with admin filtering
  useEffect(() => {
    (async () => {
      try {
        if (!farmer || !startDate || !endDate) return;
        const s = startDate.toISOString().split("T")[0];
        const e = endDate.toISOString().split("T")[0];
        const weekParam = period === "weekly" ? week : undefined;
        const yearParam = period === "weekly" ? year : undefined;
        const res = await fetchPayrollData(s, e, weekParam, yearParam, farmer.id, false);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const me = String(farmer.id);
        const match = rows.find((r) => String(r.worker_id) === me);
        if (match && Array.isArray(match.tasks)) {
          setTasks(match.tasks);
        }
      } catch (_) {
        // ignore fallback to previous fetch
      }
    })();
  }, [farmer, startDate, endDate, period, week, year]);

  // Load approved payroll (hourly rate/status) for the selected period
  useEffect(() => {
    (async () => {
      try {
        if (!farmer || !startDate || !endDate) return;
        const s = startDate.toISOString().split("T")[0];
        const e = endDate.toISOString().split("T")[0];
        const weekParam = period === "weekly" ? week : undefined;
        const yearParam = period === "weekly" ? year : undefined;
        const res = await fetchPayrollData(s, e, weekParam, yearParam, farmer.id, false);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const me = String(farmer.id);
        const match = rows.find((r) => String(r.worker_id) === me);
        if (match) {
          if (Number(match.hourly_rate) > 0) setHourlyRate(Number(match.hourly_rate));
          setPayrollStatus(match.status || null);
          setDbTotals({
            hours: Number(match.total_hours) || 0,
            income: Number(match.total_income) || 0,
            rate: Number(match.hourly_rate) || DEFAULT_RATE,
          });
        } else {
          setPayrollStatus(null);
          setHourlyRate(DEFAULT_RATE);
          setDbTotals({ hours: 0, income: 0, rate: DEFAULT_RATE });
        }
      } catch (_) {
        // keep defaults on failure
        setPayrollStatus(null);
        setDbTotals({ hours: 0, income: 0, rate: DEFAULT_RATE });
      }
    })();
  }, [farmer, startDate, endDate, period, week, year]);

  // Nhiệm vụ hoàn thành trong kỳ (dùng cho bảng liệt kê theo ngày)
  const viewTasks = useMemo(() => {
    const s = startDate ? new Date(startDate.toISOString().split("T")[0]) : null;
    const e = endDate ? new Date(endDate.toISOString().split("T")[0]) : null;
    const workerId = farmer?.id ? String(farmer.id) : null;
    const workerCode = farmer?.id ? 'ND' + String(farmer.id).padStart(3, '0') : null;
    const isAssignedToWorker = (ma) => {
      if (!workerId && !workerCode) return false;
      if (ma === null || ma === undefined) return false;
      const raw = String(ma);
      // direct exact match
      if (raw === workerId || raw === workerCode) return true;
      // normalize: remove brackets/quotes, split by comma/semicolon/whitespace
      const cleaned = raw.replace(/[\[\]\"']/g, '');
      const tokens = cleaned
        .split(/[,;\s]+/)
        .map((x) => x.trim())
        .filter(Boolean);
      return tokens.includes(workerId) || tokens.includes(workerCode);
    };

    return (tasks || []).filter((t) => {
      const d = new Date(t.ngay_bat_dau);
      return (
        (t.trang_thai === "hoan_thanh" || t.trang_thai === "da_hoan_thanh") &&
        (!s || d >= s) &&
        (!e || d <= e) &&
        isAssignedToWorker(t.ma_nguoi_dung)
      );
    });
  }, [tasks, startDate, endDate]);

  const totalHours = useMemo(() => {
    let h = 0;
    viewTasks.forEach((t) => {
      const st = t.thoi_gian_bat_dau;
      const et = t.thoi_gian_ket_thuc;
      let add = 0;
      if (st && et) {
        const [sh, sm = 0] = st.split(":").map(Number);
        const [eh, em = 0] = et.split(":").map(Number);
        let a = sh * 60 + sm;
        let b = eh * 60 + em;
        if (b < a) b += 24 * 60;
        add = (b - a) / 60;
      }
      if (add <= 0 && t.thoi_gian_du_kien) add = parseFloat(t.thoi_gian_du_kien) || 0;
      h += Math.max(0, add);
    });
    return Math.round(h * 10) / 10;
  }, [viewTasks]);

  const totalIncome = totalHours * hourlyRate;

  const saveHourlyRate = async () => {
    try {
      if (!farmer) return;
      if (!startDate || !endDate) return; // only save for a concrete period
      const s = startDate.toISOString().split("T")[0];
      const e = endDate.toISOString().split("T")[0];
      await updateHourlyRate(farmer.id, Number(hourlyRate), s, e);
    } catch (_) {
      // ignore for now
    }
  };

  return (
    <FarmerLayout currentPage="Lương">
      <Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Lương của tôi
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Phạm vi</InputLabel>
              <Select value={period} label="Phạm vi" onChange={(e) => setPeriod(e.target.value)}>
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="weekly">Theo tuần</MenuItem>
                <MenuItem value="monthly">Theo tháng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {period === "weekly" ? (
            <>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Tuần</InputLabel>
                  <Select value={week} label="Tuần" onChange={(e) => setWeek(e.target.value)}>
                    {[1, 2, 3, 4, 5].map((w) => (
                      <MenuItem key={w} value={w}>{`Tuần ${w}`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Tháng</InputLabel>
                  <Select value={month} label="Tháng" onChange={(e) => setMonth(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{`T${i + 1}`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : period === "monthly" ? (
            <>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Tháng</InputLabel>
                  <Select value={month} label="Tháng" onChange={(e) => setMonth(e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Năm</InputLabel>
                  <Select value={year} label="Năm" onChange={(e) => setYear(e.target.value)}>
                    {[2024, 2025, 2026].map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : null}

          <Grid item>
            <TextField
              size="small"
 InputProps={{
    readOnly: true,
  }}              label="Mức lương/Giờ"
              value={hourlyRate}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setHourlyRate(v === "" ? 0 : Number(v));
              }}
              onBlur={saveHourlyRate}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await saveHourlyRate();
                  e.currentTarget.blur();
                }
              }}
              sx={{ width: 140 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          </Grid>
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <Chip label={`Tổng giờ: ${totalHours.toLocaleString()}h`} color="info" />
          </Grid>
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <Chip label={`Tổng thu nhập: ${Math.round(totalIncome).toLocaleString("vi-VN")} ₫`} color="success" />
          </Grid>
          {payrollStatus && (
            <Grid item sx={{ display: "flex", alignItems: "center" }}>
              <Chip label={`Trạng thái: ${payrollStatus}`} color={isApproved(payrollStatus) ? "primary" : "warning"} />
            </Grid>
          )}
        </Grid>

        {/* Bảng chi tiết công việc theo ngày */}

        <TableContainer component={Paper}>
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
              {viewTasks.map((t, idx) => {
                const st = t.thoi_gian_bat_dau || "08:00";
                const et = t.thoi_gian_ket_thuc || "17:00";
                const [sh, sm = 0] = st.split(":").map(Number);
                const [eh, em = 0] = et.split(":").map(Number);
                let a = sh * 60 + sm;
                let b = eh * 60 + em;
                if (b < a) b += 24 * 60;
                let hours = (b - a) / 60;
                if (hours <= 0 && t.thoi_gian_du_kien)
                  hours = parseFloat(t.thoi_gian_du_kien) || 0;
                return (
                  <TableRow key={idx}>
                    <TableCell>{t.ngay_bat_dau}</TableCell>
                    <TableCell>{t.ten_cong_viec}</TableCell>
                    <TableCell>
                      {st} - {et}
                    </TableCell>
                    <TableCell align="right">{hours.toFixed(1)}h</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </FarmerLayout>
  );
}



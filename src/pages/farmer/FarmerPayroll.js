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

const DEFAULT_RATE = 30000;

export default function FarmerPayroll() {
  const [farmer, setFarmer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [period, setPeriod] = useState("monthly"); // weekly | monthly
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [week, setWeek] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_RATE);

  useEffect(() => {
    const farmerData = localStorage.getItem("farmer_user");
    if (farmerData) setFarmer(JSON.parse(farmerData));
  }, []);

  useEffect(() => {
    if (!farmer) return;
    fetch(
      `http://localhost/doancuoinam/src/be_management/api/farmer_tasks.php?farmer_id=${farmer.id}`
    )
      .then((r) => r.json())
      .then((d) => setTasks(d.data || []))
      .catch(() => setTasks([]));
  }, [farmer]);

  const { startDate, endDate } = useMemo(() => {
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

  const completedTasks = useMemo(() => {
    const s = new Date(startDate.toISOString().split("T")[0]);
    const e = new Date(endDate.toISOString().split("T")[0]);
    const workerId = farmer?.id ? String(farmer.id) : null;
    const workerCode = farmer?.id ? 'ND' + String(farmer.id).padStart(3, '0') : null;
    return (tasks || []).filter((t) => {
      const d = new Date(t.ngay_bat_dau);
      // must be assigned to this farmer
      const assigned = String(t.ma_nguoi_dung || '')
        .split(',')
        .map((x) => x.trim());
      return (
        (t.trang_thai === "hoan_thanh" || t.trang_thai === "da_hoan_thanh") &&
        d >= s &&
        d <= e &&
        (assigned.includes(workerId) || assigned.includes(workerCode))
      );
    });
  }, [tasks, startDate, endDate]);

  const totalHours = useMemo(() => {
    let h = 0;
    completedTasks.forEach((t) => {
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
  }, [completedTasks]);

  const totalIncome = totalHours * hourlyRate;

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
          ) : (
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
          )}

          <Grid item>
            <TextField
              size="small"
              label="Mức lương/Giờ"
              value={hourlyRate}
              sx={{ width: 140 }}
              disabled
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <Chip label={`Tổng giờ: ${totalHours}h`} color="info" />
          </Grid>
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <Chip label={`Tổng thu nhập: ${totalIncome.toLocaleString("vi-VN")} ₫`} color="success" />
          </Grid>
        </Grid>

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
              {completedTasks.map((t, idx) => {
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



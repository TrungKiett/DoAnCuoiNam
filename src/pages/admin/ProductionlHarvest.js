import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function resolveApiBase() {
  if (typeof window === "undefined") return { base: "", root: "" };
  const { origin, pathname } = window.location;
  const isDevServer = origin.includes(":3000");
  const root = isDevServer
    ? "/doancuoinam"
    : pathname.includes("/doancuoinam")
      ? "/doancuoinam"
      : "";
  return { base: isDevServer ? "http://localhost" : "", root };
}

export default function ProductionHarvest() {
  const { base, root } = resolveApiBase();
  const [proposalTasks, setProposalTasks] = useState([]); // dữ liệu thu hoạch
  const [tongSanLuong, setTongSanLuong] = useState([]); // dữ liệu tổng sản lượng theo lô
  const [loading, setLoading] = useState(true);
  const [loadingTong, setLoadingTong] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  // Bộ lọc cho danh sách thu hoạch
  const [selectedLo, setSelectedLo] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [selectedThuHoach, setSelectedThuHoach] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // 🔹 Load danh sách thu hoạch
  const loadIssueTasks = async () => {
    try {
      const res = await fetch(
        `${base}${root}/src/be_management/acotor/admin/list_thu_hoach.php`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProposalTasks(data.data);
      }
    } catch (err) {
      console.error("❌ Lỗi loadIssueTasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // tổng sản lượng của lô được lọc theo ngày và ngày bắt đầu trồng cây
  const loadTongSanLuong = async () => {
    try {
      const res = await fetch(
        `${base}${root}/src/be_management/acotor/admin/list_tong_san_luong.php`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      console.log("📦 Tổng sản lượng theo lô:", data);

      if (data.success && Array.isArray(data.data)) {
        setTongSanLuong(data.data);
      }
    } catch (err) {
      console.error("❌ Lỗi loadTongSanLuong:", err);
    } finally {
      setLoadingTong(false);
    }
  };

  useEffect(() => {
    const keys = [
      "admin_user",
      "user",
      "current_user",
      "userInfo",
      "farmer_user",
    ];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj?.ma_nguoi_dung || obj?.id) {
          setAdminInfo({ id: obj?.ma_nguoi_dung || obj?.id });
          break;
        }
      } catch {}
    }

    loadIssueTasks();
    loadTongSanLuong();
  }, []);

  // 🔹 Lọc danh sách thu hoạch
  const filteredTasks = proposalTasks.filter((task) => {
    const matchLo = selectedLo ? task.ma_lo_trong === selectedLo : true;
    const matchFarmer = selectedFarmer ? task.ho_ten === selectedFarmer : true;
    const matchThuHoach = selectedThuHoach
      ? task.ngay_thu_hoach === selectedThuHoach
      : true;
    const matchDateRange =
      (!startDate && !endDate) ||
      (new Date(task.ngay_ket_thuc) >= new Date(startDate || "1900-01-01") &&
        new Date(task.ngay_bat_dau) <= new Date(endDate || "9999-12-31"));

    return matchLo && matchFarmer && matchThuHoach && matchDateRange;
  });

  if (loading || loadingTong)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      {/* 🔹 BẢNG: Tổng sản lượng theo lô */}
      <Box sx={{ mb: 6, px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          sx={{ fontSize: { xs: 20, sm: 26 } }}
          color="primary"
        >
          Tổng sản lượng theo lô
        </Typography>

        <Box sx={{ mt: 2, overflowX: "auto" }}>
          {tongSanLuong.length > 0 ? (
            <TableContainer component={Paper} sx={{ minWidth: 650 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                    <TableCell>
                      <b>Mã lô</b>
                    </TableCell>
                    <TableCell>
                      <b>Giống cây</b>
                    </TableCell>
                    <TableCell>
                      <b>Ngày gieo</b>
                    </TableCell>
                    <TableCell>
                      <b>Ngày thu hoạch</b>
                    </TableCell>
                    <TableCell>
                      <b>Tổng sản lượng (kg)</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tongSanLuong.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.ma_lo_trong || "—"}</TableCell>
                      <TableCell>{item.ten_giong || "—"}</TableCell>
                      <TableCell>{item.ngay_gieo || "—"}</TableCell>
                      <TableCell>{item.ngay_thu_hoach || "—"}</TableCell>
                      <TableCell>{item.tong_san_luong || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" sx={{ m: 2 }}>
              Không có dữ liệu tổng sản lượng.
            </Typography>
          )}
        </Box>
      </Box>

      {/* 🔹 Thanh lọc dữ liệu */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          p: 2,
          bgcolor: "#f5f9ff",
          borderRadius: 2,
        }}
      >
        <TextField
          label="Từ ngày"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        />

        <TextField
          label="Đến ngày"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        />

        <TextField
          label="Lô trồng"
          select
          size="small"
          value={selectedLo}
          onChange={(e) => setSelectedLo(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 160 } }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {[...new Set(proposalTasks.map((i) => i.ma_lo_trong))].map((lo) => (
            <MenuItem key={lo} value={lo}>
              {lo}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Ngày thu hoạch"
          select
          size="small"
          value={selectedThuHoach}
          onChange={(e) => setSelectedThuHoach(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 160 } }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {[...new Set(proposalTasks.map((i) => i.ngay_thu_hoach))].map(
            (ngay) => (
              <MenuItem key={ngay} value={ngay}>
                {ngay}
              </MenuItem>
            )
          )}
        </TextField>

        <TextField
          label="Nông dân"
          select
          size="small"
          value={selectedFarmer}
          onChange={(e) => setSelectedFarmer(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 180 } }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {[...new Set(proposalTasks.map((i) => i.ho_ten))].map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained">Lọc</Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedLo("");
              setSelectedFarmer("");
              setStartDate("");
              setEndDate("");
              setSelectedThuHoach("");
            }}
          >
            Làm mới
          </Button>
        </Box>
      </Box>

      {/* 🔹 Danh sách thu hoạch */}
      <Box sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{ mt: 4, mb: 2, fontSize: { xs: 20, sm: 26 } }}
          color="primary"
        >
          Quản lý thu hoạch
        </Typography>

        <Grid container spacing={2}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.ma_thu_hoach}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="primary"
                    >
                      Thu hoạch #{task.ma_thu_hoach}
                    </Typography>

                    <Typography variant="body2">
                      Lô: {task.ma_lo_trong}
                    </Typography>
                    <Typography variant="body2">
                      Nông dân: {task.ho_ten}
                    </Typography>
                    <Typography variant="body2">
                      Ngày bắt đầu: {task.ngay_bat_dau}
                    </Typography>
                    <Typography variant="body2">
                      Ngày kết thúc: {task.ngay_ket_thuc}
                    </Typography>
                    <Typography variant="body2">
                      Ngày thu hoạch: {task.ngay_thu_hoach}
                    </Typography>
                    <Typography variant="body2">
                      Sản lượng: {task.san_luong} kg
                    </Typography>
                    <Typography variant="body2">
                      Chất lượng: {task.chat_luong}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography sx={{ m: 2 }}>Không có dữ liệu phù hợp.</Typography>
          )}
        </Grid>
      </Box>
    </>
  );
}

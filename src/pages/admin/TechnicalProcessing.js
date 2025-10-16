import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { TableContainer } from "@mui/material";
import { Chip } from "@mui/material";
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

export default function TechnicalProcessing() {
  const { base, root } = resolveApiBase();
  const [issueTasks, setIssueTasks] = useState([]);
  const [proposalTasks, setProposalTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  const navigate = useNavigate();

  // xuất cách danh sách đề xuất kĩ thuật từ nông dân
  const loadIssueTasks = async () => {
    try {
      const res = await fetch(
        `${base}${root}/src/be_management/acotor/admin/list_ki_thuat.php`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) setIssueTasks(data.data);
    } catch (err) {
      console.error("❌ Lỗi loadIssueTasks:", err);
    }
  };

  // Dialog & form hiển thị chi tiết bắt theo ma_de_xuat
  const loadProposalTasks = async () => {
    try {
      const res = await fetch(
        `${base}${root}/src/be_management/acotor/admin/update_de_xuat_ki_thuat.php`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.status === "success") setProposalTasks(data.data);
    } catch (err) {
      console.error("❌ Lỗi loadProposalTasks:", err);
    }
  };

  useEffect(() => {
    Promise.all([loadIssueTasks(), loadProposalTasks()]).finally(() =>
      setLoading(false)
    );
  }, []);

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
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ma_van_de: "",
    noi_dung_de_xuat: "",
    ma_quan_ly: "",
    ma_nong_dan: "",
    ten_nong_dan: "",
    tai_lieu: "",
    trang_thai: "",
    ghi_chu: "",
  });

  const handleOpen = (task) => {
    setForm({
      ma_van_de: task.ma_van_de || "",
      noi_dung_de_xuat: "",
      ma_quan_ly: adminInfo?.id || "",
      ma_nong_dan: task.ma_nong_dan || "",
      ten_nong_dan: task.ho_ten || "",
      tai_lieu: "",
      trang_thai: "",
      ghi_chu: "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    let newErrors = {};
    if (!form.noi_dung_de_xuat.trim()) {
      newErrors.noi_dung_de_xuat = "Vui lòng nhập nội dung đề xuất";
    }
    if (!form.trang_thai) {
      newErrors.trang_thai = "Vui lòng chọn trạng thái";
    }
    if (!form.tai_lieu) {
      newErrors.tai_lieu = "Vui lòng chọn tài liệu";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(
        `${base}${root}/src/be_management/acotor/admin/de_xuat_xu_li.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        // load lại danh sách đề xuất
        await loadProposalTasks();

        setIssueTasks((prev) =>
          prev.filter((item) => item.ma_van_de !== form.ma_van_de)
        );

        handleClose();
      } else {
        alert("Thông báo: " + (data.message || "Có lỗi xảy ra"));
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu đề xuất:", err);
    }
  };
  // Dialog & form hiển thị chi tiết bắt theo ma_de_xuat
  // const handleViewDetails = async (ma_de_xuat) => {
  //   try {
  //     const res = await fetch(
  //       `${base}${root}/src/be_management/acotor/admin/update_de_xuat_ki_thuat_id.php?ma_de_xuat=${ma_de_xuat}`,
  //       { method: "GET", credentials: "include" }
  //     );
  //     const data = await res.json();
  //     if (data.status === "success" && data.data.length > 0) {
  //       setForm(data.data[0]);
  //       setOpen(true);
  //     } else {
  //       alert("Không tìm thấy dữ liệu chi tiết");
  //     }
  //   } catch (err) {
  //     console.error("❌ Lỗi khi tải chi tiết:", err);
  //   }
  // };
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
          Xử lý kỹ thuật
        </Typography>

        <Paper sx={{ p: 2, mb: 3, bgcolor: "#f9fafb" }}>
          <Typography fontWeight={600} variant="h6">
            Danh sách vấn đề kỹ thuật
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chọn một vấn đề để nhập đề xuất xử lý
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {issueTasks.length > 0 ? (
            issueTasks.map((task) => (
              <Grid item xs={12} md={6} lg={4} key={task.ma_van_de}>
                <Card
                  onClick={() => handleOpen(task)}
                  sx={{
                    cursor: "pointer",
                    height: "100%",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      {task.loai_van_de}
                    </Typography>
                    <Typography variant="body2">
                      👤 Nông dân: <b>{task.ho_ten}</b>
                    </Typography>
                    <Typography variant="body2">
                      📝 Vấn đề: {task.noi_dung}
                    </Typography>
                    <Typography variant="body2">
                      📅 Ngày báo cáo: {task.ngay_bao_cao}
                    </Typography>
                    <Typography variant="body2">
                      🌱 Mã lô trồng: {task.ma_lo_trong}
                    </Typography>

                    <img
                      src={
                        task.hinh_anh?.startsWith("http")
                          ? task.hinh_anh
                          : task.hinh_anh
                            ? `http://localhost/doancuoinam/src/be_management/uploads/${task.hinh_anh}`
                            : "/default-image.png"
                      }
                      alt="Ảnh minh họa"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" sx={{ m: 2 }}>
              Không có vấn đề nào
            </Typography>
          )}
        </Grid>
      </Box>

      {/* Modal nhập đề xuất */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          📌 Nhập thông tin đề xuất xử lý
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Mã vấn đề"
            value={form.ma_van_de}
            fullWidth
            disabled
            margin="dense"
          />
          <TextField
            label="Tên nông dân"
            value={form.ten_nong_dan}
            fullWidth
            disabled
            margin="dense"
          />
          <TextField
            label="Nội dung đề xuất"
            name="noi_dung_de_xuat"
            value={form.noi_dung_de_xuat}
            onChange={handleChange}
            fullWidth
            multiline
            margin="dense"
            error={!!errors.noi_dung_de_xuat}
            helperText={errors.noi_dung_de_xuat}
          />
          <TextField
            label="Tài liệu"
            name="tai_lieu"
            value={form.tai_lieu}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!errors.tai_lieu}
            helperText={errors.tai_lieu}
          />
          <TextField
            select
            label="Trạng thái"
            name="trang_thai"
            value={form.trang_thai}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!errors.trang_thai}
            helperText={errors.trang_thai}
          >
            <MenuItem value="da_gui">Đã gửi</MenuItem>
            {/* <MenuItem value="da_thuc_hien">Đã thực hiện</MenuItem> */}
            <MenuItem value="tu_choi">Từ chối</MenuItem>
            {/* <MenuItem value="cho_phan_hoi">Chờ phản hồi</MenuItem> */}
          </TextField>
          <TextField
            label="Ghi chú"
            name="ghi_chu"
            value={form.ghi_chu}
            onChange={handleChange}
            fullWidth
            multiline
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>❌ Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            💾 Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DANH SÁCH ĐỀ XUẤT ĐÃ GỬI --- */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#f9fafb" }}>
          <Typography fontWeight={600} variant="h6">
            Danh sách đề xuất kỹ thuật
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý, lọc và xem chi tiết các đề xuất đã gửi
          </Typography>
        </Paper>

        {/* Bộ lọc nhanh */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="🔍 Tìm kiếm theo nội dung"
              size="small"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                const filtered = proposalTasks.filter(
                  (t) =>
                    t.noi_dung_de_xuat.toLowerCase().includes(value) ||
                    t.loai_van_de.toLowerCase().includes(value)
                );
                setProposalTasks(filtered.length ? filtered : []);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Trạng thái"
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  loadProposalTasks();
                  return;
                }
                setProposalTasks((prev) =>
                  prev.filter((t) => t.trang_thai === value)
                );
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="da_gui">Đã gửi</MenuItem>
              <MenuItem value="tu_choi">Từ chối</MenuItem>
              <MenuItem value="da_thuc_hien">Đã thực hiện</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Lọc theo ngày đề xuất"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  loadProposalTasks();
                  return;
                }
                setProposalTasks((prev) =>
                  prev.filter((t) => t.ngay_de_xuat.startsWith(value))
                );
              }}
            />
          </Grid>
        </Grid>

        {/* Bảng dữ liệu */}
        {proposalTasks.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: 2, maxHeight: 500 }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell width="8%">
                    <b>Mã</b>
                  </TableCell>
                  <TableCell width="15%">
                    <b>Loại vấn đề</b>
                  </TableCell>
                  <TableCell width="20%">
                    <b>Nội dung đề xuất</b>
                  </TableCell>
                  <TableCell width="10%">
                    <b>Tài liệu</b>
                  </TableCell>
                  <TableCell width="10%">
                    <b>Ngày đề xuất</b>
                  </TableCell>
                  <TableCell width="12%" align="center">
                    <b>Trạng thái</b>
                  </TableCell>
                  <TableCell width="10%" align="center">
                    <b>Chi tiết</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposalTasks.map((task) => (
                  <TableRow
                    key={task.ma_de_xuat}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f5f9ff", cursor: "pointer" },
                      transition: "0.2s",
                    }}
                  >
                    <TableCell>#{task.ma_de_xuat}</TableCell>
                    <TableCell>{task.loai_van_de}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 220,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.noi_dung_de_xuat}
                    </TableCell>
                    <TableCell>{task.tai_lieu || "—"}</TableCell>
                    <TableCell>{task.ngay_de_xuat}</TableCell>
                    <TableCell align="center">
                      {task.trang_thai === "da_gui" && (
                        <Chip label="Đã gửi" color="info" size="small" />
                      )}
                      {task.trang_thai === "tu_choi" && (
                        <Chip label="Từ chối" color="error" size="small" />
                      )}
                      {task.trang_thai === "da_thuc_hien" && (
                        <Chip label="Hoàn tất" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setForm(task) || setOpen(true)}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" sx={{ m: 2 }}>
            Không có đề xuất nào phù hợp
          </Typography>
        )}
      </Box>
      {/* --- Dialog chi tiết --- */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          Thông tin chi tiết đề xuất
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Mã vấn đề"
            value={form.ma_van_de || ""}
            fullWidth
            margin="dense"
            disabled
            style={{ display: "none" }}
          />
          <TextField
            label="Tên nông dân"
            value={form.ho_ten || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Loại vấn đề"
            value={form.loai_van_de || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Vấn đề"
            value={form.noi_dung || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Lô trồng"
            value={form.ma_lo_trong || ""}
            fullWidth
            margin="dense"
            disabled
          />

          <TextField
            label="Ngày đề xuất"
            value={form.ngay_bao_cao || ""}
            fullWidth
            margin="dense"
            disabled
          />

          <TextField
            select
            label="Trạng thái"
            value={form.trang_thai || ""}
            fullWidth
            margin="dense"
            disabled
          >
            <MenuItem value="da_gui">Đã gửi</MenuItem>
            <MenuItem value="tu_choi">Từ chối</MenuItem>
            <MenuItem value="da_thuc_hien">Đã thực hiện</MenuItem>
          </TextField>
          {/* <TextField
            label="Ghi chú"
            value={form.ghi_chu || ""}
            fullWidth
            multiline
            margin="dense"
            disabled
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>❌ Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

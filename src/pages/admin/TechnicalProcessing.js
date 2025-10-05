import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Card, CardContent, Grid, List, ListItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, CircularProgress, MenuItem, Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function resolveApiBase() {
  if (typeof window === "undefined") return { base: "", root: "" };
  const { origin, pathname } = window.location;
  const isDevServer = origin.includes(":3000");
  const root = isDevServer
    ? "/doancuoinam"
    : pathname.includes("/doancuoinam") ? "/doancuoinam" : "";
  return { base: isDevServer ? "http://localhost" : "", root };
}

export default function TechnicalProcessing() {
  const { base, root } = resolveApiBase();
  const [issueTasks, setIssueTasks] = useState([]);
  const [proposalTasks, setProposalTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  const navigate = useNavigate();

  const loadIssueTasks = async () => {
    try {
      const res = await fetch(`${base}${root}/src/be_management/acotor/admin/list_ki_thuat.php`,
        { method: "GET", credentials: "include" });
      const data = await res.json();
      if (data.success) setIssueTasks(data.data);
    } catch (err) {
      console.error("❌ Lỗi loadIssueTasks:", err);
    }
  };

  const loadProposalTasks = async () => {
    try {
      const res = await fetch(`${base}${root}/src/be_management/acotor/admin/admin_danh_sach_de_xuat_ki_thuat.php`,
        { method: "GET", credentials: "include" });
      const data = await res.json();
      if (data.status === "success") setProposalTasks(data.data);
    } catch (err) {
      console.error("❌ Lỗi loadProposalTasks:", err);
    }
  };

  useEffect(() => {
    Promise.all([loadIssueTasks(), loadProposalTasks()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const keys = ["admin_user", "user", "current_user", "userInfo", "farmer_user"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj?.ma_nguoi_dung || obj?.id) {
          setAdminInfo({ id: obj?.ma_nguoi_dung || obj?.id });
          break;
        }
      } catch { }
    }
  }, []);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ma_van_de: "", noi_dung_de_xuat: "", ma_quan_ly: "", ma_nong_dan: "",
    ten_nong_dan: "", tai_lieu: "", trang_thai: "", ghi_chu: ""
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
      ghi_chu: ""
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      const res = await fetch(`${base}${root}/src/be_management/acotor/admin/de_xuat_xu_li.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.status === "success") {
        // load lại danh sách đề xuất
        await loadProposalTasks();

        // ✅ ẩn vấn đề vừa nhập ra khỏi danh sách issueTasks
        setIssueTasks(prev => prev.filter(item => item.ma_van_de !== form.ma_van_de));

        handleClose();
      } else {
        alert("Thông báo: " + (data.message || "Có lỗi xảy ra"));
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu đề xuất:", err);
    }
  };

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
          <Typography fontWeight={600} variant="h6">Danh sách vấn đề kỹ thuật</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chọn một vấn đề để nhập đề xuất xử lý
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {issueTasks.length > 0 ? issueTasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.ma_van_de}>
              <Card
                onClick={() => handleOpen(task)}
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6, transform: "translateY(-4px)" }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {task.loai_van_de}
                  </Typography>
                  <Typography variant="body2">👤 Nông dân: <b>{task.ho_ten}</b></Typography>
                  <Typography variant="body2">📝 Vấn đề: {task.noi_dung}</Typography>
                  <Typography variant="body2">📅 Ngày báo cáo: {task.ngay_bao_cao}</Typography>
                  <Typography variant="body2">🌱 Mã lô trồng: {task.ma_lo_trong}</Typography>

                  <img
                    src={
                      task.hinh_anh?.startsWith("http")
                        ? task.hinh_anh
                        : task.hinh_anh
                          ? `http://localhost/doancuoinam/src/be_management/uploads/${task.hinh_anh}`
                          : "/default-image.png" // ảnh mặc định nếu không có hình
                    }
                    alt="Ảnh minh họa"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: 8, marginTop: 8 }}
                  />


                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Typography variant="body2" sx={{ m: 2 }}>Không có vấn đề nào</Typography>
          )}
        </Grid>

      </Box>

      {/* Modal nhập đề xuất */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
          📌 Nhập thông tin đề xuất xử lý
        </DialogTitle>
        <DialogContent dividers>
          <TextField label="Mã vấn đề" value={form.ma_van_de} fullWidth disabled margin="dense" />
          <TextField label="Tên nông dân" value={form.ten_nong_dan} fullWidth disabled margin="dense" />
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
          <Button variant="contained" onClick={handleSave}>💾 Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Danh sách đề xuất đã gửi */}
      <Box sx={{ mt: 5 }}>
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#f9fafb" }}>
          <Typography fontWeight={600} variant="h6">Danh sách đề xuất đã gửi</Typography>
        </Paper>
        <Grid container spacing={3}>
          {proposalTasks.length > 0 ? proposalTasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.ma_de_xuat}>
              <Card sx={{ height: "100%", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                    Đề xuất #{task.ma_de_xuat}
                  </Typography>
                  <Typography variant="body2">🔧 Loại vấn đề: {task.loai_van_de}</Typography>
                  <Typography variant="body2">📝 Nội dung: {task.noi_dung_de_xuat}</Typography>
                  <Typography variant="body2">📅 Ngày đề xuất: {task.ngay_de_xuat}</Typography>
                  <Typography variant="body2">🌱 Lô: {task.ma_lo_trong}</Typography>
                  <Typography variant="body2">📂 Tài liệu: {task.tai_lieu || "—"}</Typography>
                  <Typography variant="body2">📌 Trạng thái: <b>{task.trang_thai}</b></Typography>
                  <Typography variant="body2">💬 Ghi chú: {task.ghi_chu || "—"}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Typography variant="body2" sx={{ m: 2 }}>Không có đề xuất nào</Typography>
          )}
        </Grid>
      </Box>
    </>
  );
}

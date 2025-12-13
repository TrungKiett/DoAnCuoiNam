import React, { useEffect, useState } from "react";
import ChatGemini from "./ChatBox";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
} from "@mui/material";

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
  const [allProposalTasks, setAllProposalTasks] = useState([]); // dữ liệu gốc

  const [filteredProposals, setFilteredProposals] = useState([]); // dữ liệu hiển thị (sau lọc)
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  // === 1️⃣ Load dữ liệu ===
  const loadIssueTasks = async () => {
    try {
      const res = await fetch(
        `${base}${root}/khoi_api/acotor/admin/list_ki_thuat.php`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) setIssueTasks(data.data || []);
    } catch (err) {
      console.error("❌ Lỗi loadIssueTasks:", err);
    }
  };

  const loadProposalTasks = async () => {
    try {
      const res = await fetch(
        `${base}${root}/khoi_api/acotor/admin/update_de_xuat_ki_thuat.php`
      );
      const data = await res.json();
      if (data.status === "success") {
        setProposalTasks(data.data);
        setAllProposalTasks(data.data); // lưu dữ liệu gốc
      }
    } catch (err) {
      console.error("❌ Lỗi loadProposalTasks:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadIssueTasks(), loadProposalTasks()]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line
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

  // === 2️⃣ State cho form đề xuất ===
  const [openForm, setOpenForm] = useState(false);
  const [formAdd, setFormAdd] = useState({
    ma_van_de: "",
    noi_dung_de_xuat: "",
    ma_quan_ly: "",
    ma_nong_dan: "",
    ten_nong_dan: "",
    tai_lieu: "",
    trang_thai: "",
    ghi_chu: "",
  });

  const [errors, setErrors] = useState({});

  const handleOpenForm = (task) => {
    setFormAdd({
      ma_van_de: task.ma_van_de || "",
      noi_dung_de_xuat: "",
      ma_quan_ly: adminInfo?.id || "",
      ma_nong_dan: task.ma_nong_dan || "",
      ten_nong_dan: task.ho_ten || "",
      tai_lieu: "",
      trang_thai: "",
      ghi_chu: "",
    });
    setErrors({});
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  const handleChangeAdd = (e) =>
    setFormAdd((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    let newErrors = {};
    if (!formAdd.noi_dung_de_xuat.trim())
      newErrors.noi_dung_de_xuat = "Vui lòng nhập nội dung đề xuất";
    if (!formAdd.trang_thai) newErrors.trang_thai = "Vui lòng chọn trạng thái";
    if (!formAdd.tai_lieu) newErrors.tai_lieu = "Vui lòng nhập tài liệu";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(
        `${base}${root}/khoi_api/acotor/admin/de_xuat_xu_li.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formAdd),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        // reload full lists (gốc + filtered)
        await loadProposalTasks();
        setIssueTasks((prev) =>
          prev.filter((i) => i.ma_van_de !== formAdd.ma_van_de)
        );
        handleCloseForm();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu đề xuất:", err);
    }
  };

  // === 3️⃣ State cho xem chi tiết ===
  const [openView, setOpenView] = useState(false);
  const [formView, setFormView] = useState({});

  const handleViewDetails = (task) => {
    setFormView(task);
    setOpenView(true);
  };

  const handleCloseView = () => setOpenView(false);

  // === 4️⃣ Filter / search handlers (không ghi đè dữ liệu gốc) ===
  const handleSearch = (value) => {
    const s = (value || "").trim().toLowerCase();
    if (!s) {
      setFilteredProposals(proposalTasks);
      return;
    }
    setFilteredProposals(
      proposalTasks.filter(
        (t) =>
          (t.noi_dung_de_xuat || "").toLowerCase().includes(s) ||
          (t.loai_van_de || "").toLowerCase().includes(s) ||
          (t.ho_ten || "").toLowerCase().includes(s)
      )
    );
  };

  const handleFilterStatus = (status) => {
    if (!status) {
      setFilteredProposals(proposalTasks);
      return;
    }
    setFilteredProposals(proposalTasks.filter((t) => t.trang_thai === status));
  };

  const handleFilterDate = (dateValue) => {
    if (!dateValue) {
      setFilteredProposals(proposalTasks);
      return;
    }
    setFilteredProposals(
      proposalTasks.filter((t) => (t.ngay_de_xuat || "").startsWith(dateValue))
    );
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  // === 4️⃣ Render UI ===
  return (
    <>
      {/* DANH SÁCH VẤN ĐỀ KỸ THUẬT */}
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
                  onClick={() => handleOpenForm(task)}
                  sx={{
                    cursor: "pointer",
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
                            ? `http://yensonfarm.io.vn/khoi_api/uploads/${task.hinh_anh}`
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
            <Typography sx={{ m: 2 }}>Không có vấn đề nào</Typography>
          )}
        </Grid>
      </Box>

      {/* 🔹 Dialog thêm đề xuất */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>📌 Nhập thông tin đề xuất xử lý</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Mã vấn đề"
            value={formAdd.ma_van_de}
            fullWidth
            disabled
            margin="dense"
          />

          <TextField
            label="Tên nông dân"
            value={formAdd.ten_nong_dan}
            fullWidth
            disabled
            margin="dense"
          />
          <TextField
            label="Nội dung đề xuất"
            name="noi_dung_de_xuat"
            value={formAdd.noi_dung_de_xuat}
            onChange={handleChangeAdd}
            fullWidth
            multiline
            margin="dense"
            error={!!errors.noi_dung_de_xuat}
            helperText={errors.noi_dung_de_xuat}
          />
          <TextField
            label="Tài liệu"
            name="tai_lieu"
            value={formAdd.tai_lieu}
            onChange={handleChangeAdd}
            fullWidth
            margin="dense"
            error={!!errors.tai_lieu}
            helperText={errors.tai_lieu}
          />
          <TextField
            select
            label="Trạng thái"
            name="trang_thai"
            value={formAdd.trang_thai}
            onChange={handleChangeAdd}
            fullWidth
            margin="dense"
            error={!!errors.trang_thai}
            helperText={errors.trang_thai}
          >
            <MenuItem value="da_gui">Đã gửi</MenuItem>
            <MenuItem value="tu_choi">Từ chối</MenuItem>
          </TextField>
          <TextField
            label="Ghi chú"
            name="ghi_chu"
            value={formAdd.ghi_chu}
            onChange={handleChangeAdd}
            fullWidth
            multiline
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Dialog xem chi tiết */}
      <Dialog open={openView} onClose={handleCloseView} maxWidth="sm" fullWidth>
        <DialogTitle>🔍 Chi tiết đề xuất</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Loại vấn đề"
            value={formView.loai_van_de || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Tên nông dân"
            value={formView.ho_ten || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Loại vấn đề"
            value={formView.loai_van_de || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Vấn đề"
            value={formView.noi_dung || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Lô trồng"
            value={formView.ma_lo_trong || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Ngày đề xuất"
            value={formView.ngay_bao_cao || ""}
            fullWidth
            margin="dense"
            disabled
          />
          <TextField
            label="Trạng thái"
            value={formView.trang_thai || ""}
            fullWidth
            margin="dense"
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Bảng danh sách đề xuất */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#f9fafb" }}>
          <Typography fontWeight={600} variant="h6">
            Danh sách đề xuất kỹ thuật
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý, lọc và xem chi tiết các đề xuất đã gửi
          </Typography>
        </Paper>{" "}
        {/* Bộ lọc nhanh */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="🔍 Tìm kiếm theo nội dung"
              size="small"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                if (!value) {
                  setProposalTasks(allProposalTasks); // trả về toàn bộ nếu rỗng
                  return;
                }
                const filtered = allProposalTasks.filter(
                  (t) =>
                    t.noi_dung_de_xuat.toLowerCase().includes(value) ||
                    t.loai_van_de.toLowerCase().includes(value)
                );
                setProposalTasks(filtered);
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
                  setProposalTasks(allProposalTasks);
                  return;
                }
                const filtered = allProposalTasks.filter(
                  (t) => t.trang_thai === value
                );
                setProposalTasks(filtered);
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
                  setProposalTasks(allProposalTasks);
                  return;
                }
                const filtered = allProposalTasks.filter((t) =>
                  t.ngay_de_xuat.startsWith(value)
                );
                setProposalTasks(filtered);
              }}
            />
          </Grid>
        </Grid>
        {/* Bảng hiển thị */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Loại vấn đề</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proposalTasks.map((task) => (
                <TableRow key={task.ma_de_xuat}>
                  <TableCell>#{task.ma_de_xuat}</TableCell>
                  <TableCell>{task.loai_van_de}</TableCell>
                  <TableCell>{task.noi_dung_de_xuat}</TableCell>
                  <TableCell>{task.ngay_de_xuat}</TableCell>
                  <TableCell>
                    <Chip label={task.trang_thai} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(task)}
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <ChatGemini />
    </>
  );
}

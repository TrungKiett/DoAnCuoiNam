import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemText,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
} from "@mui/material";
import {
    ViewList as ViewListIcon,
    CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FarmerLayout from "../../components/farmer/FarmerLayout";
import FarmerCalendarTechnical from "../../components/farmer/FarmerCalenderTechnical";

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

const FarmerTechnical = () => {
    const { base, root } = resolveApiBase();
    const [farmerInfo, setFarmerInfo] = useState(null);

    const [workTasks, setWorkTasks] = useState([]);
    const [issueTasks, setIssueTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState("calendar");

    // State dialog cập nhật trạng thái
    const [open, setOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [status, setStatus] = useState("");

    const navigate = useNavigate();

    // 🔹 Lấy thông tin farmer từ localStorage
    useEffect(() => {
        const keys = ["farmer_user", "user", "current_user", "userInfo"];
        let farmer = null;
        for (const k of keys) {
            try {
                const raw = localStorage.getItem(k);
                if (!raw) continue;
                const obj = JSON.parse(raw);
                if (obj && (obj.id || obj.ma_nguoi_dung)) {
                    farmer = {
                        id: obj.id || obj.ma_nguoi_dung,
                        full_name: obj.full_name || obj.ho_ten || obj.username || "",
                    };
                    break;
                }
            } catch { }
        }
        if (farmer) {
            setFarmerInfo(farmer);
            loadWorkTasks(farmer.id);
            loadIssueTasks(farmer.id);
        } else {
            navigate("/");
        }
    }, [navigate]);

    // 🔹 Load công việc
    const loadWorkTasks = async (farmerId) => {
        try {
            setLoading(true);
            const response = await fetch(
                `${base}${root}/src/be_management/api/farmer_tasks.php?farmer_id=${farmerId}`
            );
            const data = await response.json();
            const list = Array.isArray(data) ? data : data?.data || [];

            if (list) {
                const sortedTasks = list.sort((a, b) => {
                    const dateA = new Date(a.ngay_bat_dau);
                    const dateB = new Date(b.ngay_bat_dau);
                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateA.getTime() - dateB.getTime();
                    }
                    return (a.thoi_gian_bat_dau || "00:00:00").localeCompare(
                        b.thoi_gian_bat_dau || "00:00:00"
                    );
                });
                setWorkTasks(sortedTasks);
            } else {
                setError(data.message || "Lỗi tải dữ liệu");
            }
        } catch (err) {
            setError("Lỗi kết nối API công việc");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Load vấn đề báo cáo
    const loadIssueTasks = async (farmerId) => {
        try {
            const res = await fetch(
                `${base}${root}/src/be_management/acotor/farmer/list_ki_thuat.php?ma_nong_dan=${farmerId}`,
                { method: "GET", credentials: "include" }
            );
            const data = await res.json();
            if (data.success) {
                setIssueTasks(data.data);
            } else {
                console.error(data.message);
            }
        } catch (err) {
            console.error("Lỗi loadIssueTasks:", err);
        }
    };

    // Dialog handlers
    const handleOpen = (task) => {
        setSelectedTask(task);
        setStatus(task.trang_thai || "chua_xu_ly");
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedTask(null);
    };

const handleSave = async () => {
    if (!selectedTask) return;

    try {
        console.log("Cập nhật trạng thái:", selectedTask?.ma_van_de, "=>", status);

        const res = await fetch(
            `${base}${root}/src/be_management/acotor/farmer/update_trang_thai_ki_thuat.php?ma_nong_dan=${farmerInfo.id}&ma_van_de=${selectedTask.ma_van_de}&trang_thai=${status}`,
            { method: "GET", credentials: "include" }
        );

        const data = await res.json();
        console.log("Kết quả cập nhật:", data);

        if (data.success) {
            alert("Cập nhật trạng thái thành công!");
            // Cập nhật danh sách tại chỗ (không cần reload toàn bộ)
            setIssueTasks((prev) =>
                prev.map((task) =>
                    task.ma_van_de === selectedTask.ma_van_de
                        ? { ...task, trang_thai: status }
                        : task
                )
            );
        } else {
            alert("Cập nhật thất bại: " + (data.message || "Không rõ nguyên nhân"));
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        alert("Đã xảy ra lỗi khi cập nhật!");
    } finally {
        handleClose();
    }
};



    if (!farmerInfo) {
        return (
            <FarmerLayout>
                <Box>Đang tải...</Box>
            </FarmerLayout>
        );
    }

    if (loading) {
        return (
            <FarmerLayout currentPage="Lịch làm việc">
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            </FarmerLayout>
        );
    }

    return (
        <FarmerLayout currentPage="Đề xuất kỹ thuật">
            <Box>
                {/* Header + nút chuyển chế độ */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4">Đề xuất kỹ thuật</Typography>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                    >
                        <ToggleButton value="calendar">
                            <CalendarMonthIcon sx={{ mr: 1 }} />
                            Lịch
                        </ToggleButton>
                        <ToggleButton value="list">
                            <ViewListIcon sx={{ mr: 1 }} />
                            Danh sách
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {viewMode === "calendar" ? (
                    <FarmerCalendarTechnical
                        tasks={workTasks}
                        farmerInfo={farmerInfo}
                        onUpdateTask={loadWorkTasks}
                    />
                ) : (
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 2,
                                fontWeight: "bold",
                                color: "#25BA08",
                                textAlign: "center",
                            }}
                        >
                            Phản hồi báo cáo
                        </Typography>

                        <Grid container spacing={3}>
                            {issueTasks.length > 0 ? (
                                issueTasks.map((task) => (
                                    <Grid item xs={12} md={6} lg={4} key={task.ma_van_de}>
                                        <Card
                                            sx={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                cursor: "pointer",
                                                transition: "transform 0.2s",
                                                "&:hover": { transform: "scale(1.02)" },
                                            }}
                                            onClick={() => handleOpen(task)}
                                        >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 2 }}
                                                >
                                                    Loại vấn đề: {task.loai_van_de || "Chưa xác định"}
                                                </Typography>

                                                <List dense>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemText
                                                            primary="Ngày báo cáo"
                                                            secondary={task.ngay_bao_cao || "—"}
                                                        />
                                                    </ListItem>
                                                    <ListItem sx={{ px: 0 }}>
                                                        <ListItemText
                                                            primary="Mã lô trồng"
                                                            secondary={task.ma_lo_trong || "—"}
                                                        />
                                                    </ListItem>
                                                    <ListItem
                                                        sx={{
                                                            px: 0,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "flex-start",
                                                        }}
                                                    >
                                                        <ListItemText primary="Hình ảnh" />
                                                        {task.hinh_anh && (
                                                            <img
                                                                src={task.hinh_anh}
                                                                alt="Ảnh minh họa"
                                                                style={{
                                                                    width: "100%",
                                                                    maxHeight: "200px",
                                                                    objectFit: "cover",
                                                                    borderRadius: 8,
                                                                    marginTop: 8,
                                                                }}
                                                            />
                                                        )}
                                                    </ListItem>
                                                </List>

                                                {task.ghi_chu && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Ghi chú: {task.ghi_chu}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Typography align="center" variant="body1" sx={{ mt: 2 }}>
                                        Không có vấn đề nào được báo cáo
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

                {/* Dialog cập nhật trạng thái */}
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                    <DialogTitle>Cập nhật trạng thái báo cáo</DialogTitle>
                    <DialogContent dividers>
                        {selectedTask && (
                            <>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                    Mã vấn đề: {selectedTask.ma_van_de}
                                </Typography>

                                <TextField
                                    margin="dense"
                                    select
                                    label="Trạng thái"
                                    fullWidth
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                     <MenuItem value="da_xu_ly">Đang xử lý</MenuItem>
                                    <MenuItem value="dang_xu_ly">Đã hoàn thành</MenuItem>
                                 </TextField>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#25BA08" }}>
                            Lưu thay đổi
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </FarmerLayout>
    );
};

export default FarmerTechnical;

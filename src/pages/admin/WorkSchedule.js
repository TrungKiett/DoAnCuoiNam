import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Typography,
	Paper,
	Button,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Grid,
	TextField,
	MenuItem,
	Select,
	InputLabel,
	FormControl
} from "@mui/material";
import { listTasks, createTask, updateTask, fetchFarmers } from "../../services/api";

function formatLocalDate(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function startOfWeek(date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
	d.setDate(diff);
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function WorkSchedule() {
	const [tasks, setTasks] = useState([]);
	const [farmers, setFarmers] = useState([]);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Dialog state
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		ten_cong_viec: "",
		loai_cong_viec: "chuan_bi_dat",
		ngay_bat_dau: formatLocalDate(new Date()),
		thoi_gian_bat_dau: "",
		ngay_ket_thuc: formatLocalDate(new Date()),
		thoi_gian_ket_thuc: "",
		trang_thai: "chua_bat_dau",
		uu_tien: "trung_binh",
		ma_nguoi_dung: "",
		ghi_chu: ""
	});

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const [t, f] = await Promise.all([listTasks(), fetchFarmers()]);
				if (t?.success) setTasks(t.data || []);
				if (f?.success) setFarmers(f.data || []);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const weekDays = useMemo(() => {
		const start = startOfWeek(currentDate);
		return Array.from({ length: 7 }).map((_, i) => {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			return d;
		});
	}, [currentDate]);

	const tasksByDate = useMemo(() => {
		const map = new Map();
		for (const d of weekDays) {
			map.set(formatLocalDate(d), []);
		}
		for (const t of tasks) {
			const dateStr = t.ngay_bat_dau;
			if (map.has(dateStr)) map.get(dateStr).push(t);
		}
		return map;
	}, [tasks, weekDays]);

	function openCreateDialog(date) {
		setEditing(null);
		setForm((prev) => ({
			...prev,
			ngay_bat_dau: formatLocalDate(date),
			ngay_ket_thuc: formatLocalDate(date)
		}));
		setOpen(true);
	}

	async function saveTask() {
		const payload = { ...form };
		try {
			if (editing) {
				await updateTask({ ...payload, id: editing.id });
			} else {
				await createTask(payload);
			}
			const t = await listTasks();
			if (t?.success) setTasks(t.data || []);
			setOpen(false);
		} catch (e) {
			alert(e.message);
		}
	}

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
				<Typography variant="h5" sx={{ fontWeight: 700 }}>Lịch làm việc</Typography>
				<Box>
					<Button sx={{ mr: 1 }} variant="outlined" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))}>Tuần trước</Button>
					<Button sx={{ mr: 1 }} variant="outlined" onClick={() => setCurrentDate(new Date())}>Hôm nay</Button>
					<Button variant="outlined" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))}>Tuần sau</Button>
				</Box>
			</Box>

			{error && (
				<Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
			)}

			<Paper sx={{ p: 2 }}>
				<Grid container spacing={2}>
					{weekDays.map((date) => (
						<Grid item xs={12} sm={6} md={3} lg={12/7} key={formatLocalDate(date)}>
							<Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 1, minHeight: 180 }}>
								<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										{date.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}
									</Typography>
									<Button size="small" variant="text" onClick={() => openCreateDialog(date)}>Thêm</Button>
								</Box>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
									{(tasksByDate.get(formatLocalDate(date)) || []).map((t) => (
										<Chip key={t.id}
											label={`${t.ten_cong_viec}${t.thoi_gian_bat_dau ? ` (${t.thoi_gian_bat_dau})` : ""}`}
											color="primary"
											variant="outlined"
											sx={{ justifyContent: "flex-start" }}
											onClick={() => { setEditing(t); setForm({ ...t }); setOpen(true); }}
										/>
									))}
									{(tasksByDate.get(formatLocalDate(date)) || []).length === 0 && (
										<Typography variant="caption" color="text.secondary">Không có công việc</Typography>
									)}
								</Box>
							</Box>
						</Grid>
					))}
				</Grid>
			</Paper>

			<Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{editing ? "Chỉnh sửa công việc" : "Thêm công việc"}</DialogTitle>
				<DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
					<TextField label="Tên công việc" value={form.ten_cong_viec} onChange={(e)=>setForm({ ...form, ten_cong_viec: e.target.value })} fullWidth />
					<TextField label="Ngày bắt đầu" type="date" InputLabelProps={{ shrink: true }} value={form.ngay_bat_dau} onChange={(e)=>setForm({ ...form, ngay_bat_dau: e.target.value })} fullWidth />
					<TextField label="Thời gian bắt đầu" type="time" InputLabelProps={{ shrink: true }} value={form.thoi_gian_bat_dau} onChange={(e)=>setForm({ ...form, thoi_gian_bat_dau: e.target.value })} fullWidth />
					<TextField label="Ngày kết thúc" type="date" InputLabelProps={{ shrink: true }} value={form.ngay_ket_thuc} onChange={(e)=>setForm({ ...form, ngay_ket_thuc: e.target.value })} fullWidth />
					<TextField label="Thời gian kết thúc" type="time" InputLabelProps={{ shrink: true }} value={form.thoi_gian_ket_thuc} onChange={(e)=>setForm({ ...form, thoi_gian_ket_thuc: e.target.value })} fullWidth />
					<FormControl fullWidth>
						<InputLabel id="status-label">Trạng thái</InputLabel>
						<Select labelId="status-label" label="Trạng thái" value={form.trang_thai} onChange={(e)=>setForm({ ...form, trang_thai: e.target.value })}>
							<MenuItem value="chua_bat_dau">Chưa bắt đầu</MenuItem>
							<MenuItem value="dang_thuc_hien">Đang thực hiện</MenuItem>
							<MenuItem value="hoan_thanh">Hoàn thành</MenuItem>
							<MenuItem value="bi_hoan">Bị hoãn</MenuItem>
						</Select>
					</FormControl>
					<TextField label="Ghi chú" value={form.ghi_chu} onChange={(e)=>setForm({ ...form, ghi_chu: e.target.value })} multiline minRows={2} fullWidth />
				</DialogContent>
				<DialogActions>
					<Button onClick={()=>setOpen(false)}>Hủy</Button>
					<Button variant="contained" onClick={saveTask}>{editing ? "Lưu" : "Tạo mới"}</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

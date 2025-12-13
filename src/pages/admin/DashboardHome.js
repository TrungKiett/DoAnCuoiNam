import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, TextField, InputAdornment, CircularProgress, Grid, Card, CardContent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function DashboardHome() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				const response = await fetch("http://yensonfarm.io.vn/khoi_api/api/dashboard_stats.php");
				const data = await response.json();
				if (data?.success) {
					setStats(data.data);
				} else {
					setStats({
						total_users: 11,
						total_lots: 0,
						total_plans: 0,
						today_tasks: 0,
						lot_status: [{ status: "Chưa có dữ liệu", count: 0 }],
						upcoming_tasks: [],
						plan_status: [{ status: "Chưa có dữ liệu", count: 0 }],
					});
				}
			} catch (err) {
				setError("Lỗi kết nối: " + err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography color="error">Lỗi: {error}</Typography>
			</Box>
		);
	}

	const statCards = [
		{ label: "Tổng người dùng", value: stats?.total_users || 0, icon: <PeopleIcon />, color: "#1e88e5" },
		{ label: "Tổng lô trồng", value: stats?.total_lots || 0, icon: <AgricultureIcon />, color: "#43a047" },
		{ label: "Kế hoạch sản xuất", value: stats?.total_plans || 0, icon: <CalendarMonthIcon />, color: "#fb8c00" },
		{ label: "Công việc hôm nay", value: stats?.today_tasks || 0, icon: <AssignmentIcon />, color: "#8e24aa" },
	];

	return (
		<Box>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
					<div>
						<Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Xin chào, Quản trị viên!</Typography>
						<Typography variant="body2" color="text.secondary">Theo dõi hoạt động nông trại, lô trồng và kế hoạch sản xuất tại đây.</Typography>
					</div>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<TextField size="small" placeholder="Tìm kiếm..."
							InputProps={{ startAdornment: (
								<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
							) }}
						/>
						<Button variant="outlined">Bộ lọc</Button>
					</Box>
				</Box>
			</Box>

			<Paper elevation={0} sx={{ bgcolor: "#e3f2fd", p: 2, borderRadius: 2, mb: 2 }}>
				<Typography sx={{ fontWeight: 600, color: "#0d47a1" }}>Tổng quan hệ thống</Typography>
			</Paper>

			<Grid container spacing={2} sx={{ mb: 3 }}>
				{statCards.map(card => (
					<Grid item xs={12} sm={6} md={3} key={card.label}>
						<Card elevation={1} sx={{ p: 2, textAlign: "center", borderTop: `4px solid ${card.color}` }}>
							<CardContent sx={{ p: 2 }}>
								<Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
								<Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: card.color }}>{card.value}</Typography>
								<Typography variant="body2" color="text.secondary">{card.label}</Typography>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Card elevation={1}>
						<CardContent>
							<Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
								<TrendingUpIcon /> Trạng thái lô trồng
							</Typography>
							{stats?.lot_status?.length > 0 ? (
								<Box>
									{stats.lot_status.map((item, idx) => (
										<Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
											<Typography variant="body2">{item.status}</Typography>
											<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.count} lô</Typography>
										</Box>
									))}
								</Box>
							) : (
								<Typography color="text.secondary">Chưa có dữ liệu</Typography>
							)}
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={6}>
					<Card elevation={1}>
						<CardContent>
							<Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
								<ScheduleIcon /> Công việc sắp tới
							</Typography>
							{stats?.upcoming_tasks?.length > 0 ? (
								<Box sx={{ maxHeight: 300, overflow: "auto" }}>
									{stats.upcoming_tasks.slice(0, 5).map((task, idx) => (
										<Box key={idx} sx={{ p: 1.5, mb: 1, bgcolor: "#f5f5f5", borderRadius: 1, border: "1px solid #e0e0e0" }}>
											<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{task.ten_cong_viec}</Typography>
											<Typography variant="caption" color="text.secondary">{task.ngay_bat_dau}{task.thoi_gian_bat_dau && ` - ${task.thoi_gian_bat_dau}`}</Typography>
											{task.ten_lo && (
												<Typography variant="caption" display="block" color="text.secondary">Lô: {task.ten_lo} ({task.vi_tri})</Typography>
											)}
										</Box>
									))}
								</Box>
							) : (
								<Typography color="text.secondary">Không có công việc sắp tới</Typography>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
}
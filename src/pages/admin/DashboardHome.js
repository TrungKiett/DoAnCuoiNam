import React from "react";
import { Box, Typography, Paper, Button, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function DashboardHome() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Xin chào, Quản trị viên!</Typography>
          <Typography variant="body2" color="text.secondary">Theo dõi hoạt động bán hàng, khách hàng và đơn hàng tại đây.</Typography>
        </div>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <Button variant="outlined">Bộ lọc</Button>
          <Button variant="contained">+ Thêm tài khoản</Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 2 }}>
        <Typography sx={{ fontWeight: 600, color: '#0d47a1' }}>Hôm nay</Typography>
      </Paper>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 3
      }}>
        {[{
          label: 'Tổng người dùng',
          value: 8
        }, {
          label: 'Sản phẩm',
          value: 0
        }, {
          label: 'Đơn hàng',
          value: 0
        }, {
          label: 'Doanh thu',
          value: '$0'
        }].map((card, idx) => (
          <Paper key={card.label} elevation={1} sx={{ p: 3, textAlign: 'center', borderTop: '4px solid', borderColor: ['#1e88e5','#43a047','#fb8c00','#8e24aa'][idx] }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{card.value}</Typography>
            <Typography variant="body2" color="text.secondary">{card.label}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ height: 400, borderRadius: 2, border: '1px solid #e0e0e0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        Nội dung dashboard khác sẽ đặt ở đây
      </Box>
    </Box>
  );
}



import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';

export default function DatabaseTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/khoi_api/api/update_database.php');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
        details: ['Failed to connect to database update endpoint']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Database Test & Update</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Cập nhật cấu trúc database</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Nhấn nút bên dưới để kiểm tra và cập nhật cấu trúc bảng ke_hoach_san_xuat.
          Thao tác này sẽ thêm cột so_luong_nhan_cong nếu chưa có.
        </Typography>
        <Button 
          variant="contained" 
          onClick={testDatabase}
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật Database'}
        </Button>
      </Paper>

      {result && (
        <Paper sx={{ p: 2 }}>
          <Alert 
            severity={result.success ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {result.success ? 'Cập nhật thành công!' : 'Có lỗi xảy ra!'}
          </Alert>
          
          {result.message && (
            <Typography variant="body1" sx={{ mb: 1 }}>
              {result.message}
            </Typography>
          )}
          
          {result.error && (
            <Typography variant="body1" color="error" sx={{ mb: 1 }}>
              Lỗi: {result.error}
            </Typography>
          )}
          
          {result.details && result.details.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Chi tiết:</Typography>
              {result.details.map((detail, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                  {detail}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

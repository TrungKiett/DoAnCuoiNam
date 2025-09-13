import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchUsers, createUser } from "../../services/api";

export default function UserManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', phone: '', role: 'Nông dân' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        // data fields: id, username, full_name, phone, role, status, created_at
        const mapped = (data || []).map((u) => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          phone: u.phone,
          role: u.role,
          status: u.status || "Hoạt động",
          createdAt: u.created_at,
        }));
        setRows(mapped);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Quản lý tài khoản</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined">Hôm nay</Button>
          <Button variant="outlined">Tháng này</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm..."
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined">Bộ lọc</Button>
          <Button variant="contained" onClick={() => setOpenAdd(true)}>+ Thêm tài khoản</Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Quyền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8}>Đang tải dữ liệu...</TableCell>
              </TableRow>
            )}
            {error && !loading && (
              <TableRow>
                <TableCell colSpan={8} sx={{ color: 'error.main' }}>Lỗi: {error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>Không có dữ liệu</TableCell>
              </TableRow>
            )}
            {rows.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Chip size="small" color="success" label={u.status} />
                </TableCell>
                <TableCell>{u.createdAt}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    {/* Add User Dialog (MUI) */}
    <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} maxWidth="xs" fullWidth>
      <DialogTitle>+ Thêm tài khoản</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
        <TextField label="Tên đăng nhập" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} fullWidth />
        <TextField label="Mật khẩu" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
        <TextField label="Họ và tên" value={form.full_name} onChange={e=>setForm({...form, full_name: e.target.value})} fullWidth />
        <TextField label="Số điện thoại" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} fullWidth />
        <TextField select label="Quyền truy cập" value={form.role} onChange={e=>setForm({...form, role: e.target.value})} fullWidth>
          <MenuItem value="Nông dân">Nông dân</MenuItem>
          <MenuItem value="Quản trị">Quản trị</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setOpenAdd(false)}>Hủy</Button>
        <Button variant="contained" onClick={async ()=>{
          try {
            await createUser(form);
            setOpenAdd(false);
            setLoading(true);
            const data = await fetchUsers();
            const mapped = (data || []).map((u) => ({
              id: u.id,
              username: u.username,
              fullName: u.full_name,
              phone: u.phone,
              role: u.role || 'Nông dân',
              status: u.status || "Hoạt động",
              createdAt: u.created_at,
            }));
            setRows(mapped);
            setSnack({ open: true, message: 'Thêm tài khoản thành công', severity: 'success' });
          } catch (e) {
            setSnack({ open: true, message: e.message, severity: 'error' });
          } finally {
            setLoading(false);
          }
        }}>Lưu</Button>
      </DialogActions>
    </Dialog>
    <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack({...snack, open:false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={()=>setSnack({...snack, open:false})} severity={snack.severity} sx={{ width: '100%' }}>
        {snack.message}
      </Alert>
    </Snackbar>
    </>
  );
}



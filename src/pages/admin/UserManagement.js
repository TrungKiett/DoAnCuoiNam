import React, { useEffect, useState } from "react";
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Chip, 
    IconButton, 
    Button, 
    TextField, 
    InputAdornment, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    MenuItem, 
    Snackbar, 
    Alert 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../services/api";

export default function UserManagement() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [form, setForm] = useState({ 
        username: '', 
        password: '', 
        full_name: '', 
        phone: '', 
        role: 'Nông dân' 
    });
    const [snack, setSnack] = useState({ 
        open: false, 
        message: '', 
        severity: 'success' 
    });
    const [openEdit, setOpenEdit] = useState(false);
    const [editForm, setEditForm] = useState({ 
        id: null, 
        username: '', 
        password: '', 
        full_name: '', 
        phone: '', 
        role: 'Nông dân' 
    });

    useEffect(() => {
        fetchUsers()
            .then((data) => {
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

    const handleSearch = (e) => {
        const q = e.target.value.toLowerCase();
        fetchUsers().then((data) => {
            const mapped = (data || []).map((u) => ({
                id: u.id,
                username: u.username,
                fullName: u.full_name,
                phone: u.phone,
                role: u.role || 'Nông dân',
                status: u.status || 'Hoạt động',
                createdAt: u.created_at,
            })).filter((u) =>
                (u.username || '').toLowerCase().includes(q) ||
                (u.fullName || '').toLowerCase().includes(q) ||
                (u.phone || '').toLowerCase().includes(q)
            );
            setRows(mapped);
        });
    };

    const handleAddUser = async () => {
        try {
            await createUser(form);
            setOpenAdd(false);
            setSnack({ open: true, message: 'Thêm tài khoản thành công', severity: 'success' });
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
            setForm({ username: '', password: '', full_name: '', phone: '', role: 'Nông dân' });
        } catch (e) {
            setSnack({ open: true, message: e.message, severity: 'error' });
        }
    };

    const handleEditUser = async () => {
        try {
            await updateUser(editForm);
            setOpenEdit(false);
            setSnack({ open: true, message: 'Đã cập nhật tài khoản', severity: 'success' });
            const data = await fetchUsers();
            const mapped = (data || []).map((u) => ({
                id: u.id,
                username: u.username,
                fullName: u.full_name,
                phone: u.phone,
                role: u.role || 'Nông dân',
                status: u.status || 'Hoạt động',
                createdAt: u.created_at,
            }));
            setRows(mapped);
        } catch (e) {
            setSnack({ open: true, message: e.message, severity: 'error' });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Xóa tài khoản này?')) return;
        try {
            await deleteUser(id);
            setSnack({ open: true, message: 'Đã xóa tài khoản', severity: 'success' });
            const data = await fetchUsers();
            const mapped = (data || []).map((u) => ({
                id: u.id,
                username: u.username,
                fullName: u.full_name,
                phone: u.phone,
                role: u.role || 'Nông dân',
                status: u.status || 'Hoạt động',
                createdAt: u.created_at,
            }));
            setRows(mapped);
        } catch (e) {
            setSnack({ open: true, message: e.message, severity: 'error' });
        }
    };

    return (
        <>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Quản lý tài khoản
                    </Typography>
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
                        onChange={handleSearch}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined">Bộ lọc</Button>
                        <Button 
                            variant="contained"
                            onClick={() => setOpenAdd(true)}
                        >
                            +Thêm tài khoản
                        </Button>
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
                                    <TableCell colSpan={8} sx={{ color: 'error.main' }}>
                                        Lỗi: {error}
                                    </TableCell>
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
                                        <Chip 
                                            size="small"
                                            color="success"
                                            label={u.status}
                                        />
                                    </TableCell>
                                    <TableCell>{u.createdAt}</TableCell>
                                    <TableCell align="right">
                                        <IconButton 
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                                setEditForm({
                                                    id: u.id,
                                                    username: u.username,
                                                    password: '',
                                                    full_name: u.fullName,
                                                    phone: u.phone,
                                                    role: u.role || 'Nông dân'
                                                });
                                                setOpenEdit(true);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteUser(u.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Add User Dialog */}
            <Dialog 
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>+Thêm tài khoản</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
                    <TextField 
                        label="Tên đăng nhập"
                        value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        label="Mật khẩu"
                        type="password"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        label="Họ và tên"
                        value={form.full_name}
                        onChange={e => setForm({...form, full_name: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        label="Số điện thoại"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        select 
                        label="Quyền truy cập"
                        value={form.role}
                        onChange={e => setForm({...form, role: e.target.value})}
                        fullWidth
                    >
                        <MenuItem value="Nông dân">Nông dân</MenuItem>
                        <MenuItem value="Quản trị">Quản trị</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Hủy</Button>
                    <Button 
                        variant="contained"
                        onClick={handleAddUser}
                    >
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog 
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
                    <TextField 
                        label="Tên đăng nhập"
                        value={editForm.username}
                        onChange={e => setEditForm({...editForm, username: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        label="Mật khẩu (để trống nếu giữ nguyên)"
                        type="password"
                        value={editForm.password}
                        onChange={e => setEditForm({...editForm, password: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        label="Họ và tên"
                        value={editForm.full_name}
                        onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        label="Số điện thoại"
                        value={editForm.phone}
                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                        fullWidth
                    />
                    <TextField 
                        select 
                        label="Quyền truy cập"
                        value={editForm.role}
                        onChange={e => setEditForm({...editForm, role: e.target.value})}
                        fullWidth
                    >
                        <MenuItem value="Nông dân">Nông dân</MenuItem>
                        <MenuItem value="Quản trị">Quản trị</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
                    <Button 
                        variant="contained"
                        onClick={handleEditUser}
                    >
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack({...snack, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnack({...snack, open: false})}
                    severity={snack.severity}
                    sx={{ width: '100%' }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
}

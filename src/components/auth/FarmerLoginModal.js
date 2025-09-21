import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Phone as PhoneIcon
} from '@mui/icons-material';

const FarmerLoginModal = ({ open, onClose, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        so_dien_thoai: '',
        mat_khau: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.so_dien_thoai || !formData.mat_khau) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost/doancuoinam/src/be_management/api/simple_login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Lưu thông tin đăng nhập vào localStorage
                localStorage.setItem('farmer_user', JSON.stringify(result.data));
                localStorage.setItem('user_role', 'nong_dan');
                
                // Gọi callback thành công
                onLoginSuccess(result.data);
                
                // Reset form
                setFormData({ so_dien_thoai: '', mat_khau: '' });
                onClose();
            } else {
                setError(result.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Lỗi kết nối, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ so_dien_thoai: '', mat_khau: '' });
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6">Đăng nhập Nông dân</Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        
                        <TextField
                            name="so_dien_thoai"
                            label="Số điện thoại"
                            type="tel"
                            value={formData.so_dien_thoai}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            placeholder="Nhập số điện thoại đăng ký"
                            helperText="Số điện thoại đã đăng ký tài khoản nông dân"
                        />
                        
                        <TextField
                            name="mat_khau"
                            label="Mật khẩu"
                            type="password"
                            value={formData.mat_khau}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            placeholder="Nhập mật khẩu"
                        />
                        
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Lưu ý:</strong> Sử dụng số điện thoại và mật khẩu đã đăng ký tài khoản nông dân.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FarmerLoginModal;

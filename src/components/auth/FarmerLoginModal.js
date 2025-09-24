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
    const [vaiTro, setVaiTro] = useState('nong_dan'); // 'nong_dan' | 'quan_ly'
    const [mode, setMode] = useState('login'); // login | forgot | verify | reset_success
    const [forgotValue, setForgotValue] = useState(''); // email or phone
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
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
                body: JSON.stringify({ ...formData, vai_tro_expect: vaiTro })
            });

            const result = await response.json();

            if (result.success) {
                // Lưu thông tin đăng nhập vào localStorage
                localStorage.setItem('farmer_user', JSON.stringify(result.data));
                localStorage.setItem('user_role', result.data?.vai_tro || vaiTro);
                
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
            setError('Lỗi kết nối, vui lòng thử lại 1');
        } finally {
            setLoading(false);
        }
    };

    async function handleSendOtp() {
        try {
            setLoading(true);
            setError('');
            const res = await fetch('http://localhost/doancuoinam/src/be_management/controller/components/auth/forgot.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotValue, vai_tro: vaiTro })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setMode('verify');
            } else {
                setError(data.message || 'Không thể gửi OTP');
            }
        } catch (err) {
            setError('Lỗi kết nối, vui lòng thử lại 2');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtpAndReset() {
        try {
            setLoading(true);
            setError('');
            const res = await fetch('http://localhost/doancuoinam/src/be_management/controller/components/auth/reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp, email: forgotValue, vai_tro: vaiTro, new_password: newPassword })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setMode('reset_success');
            } else {
                setError(data.message || 'OTP không hợp lệ');
            }
        } catch (err) {
            setError('Lỗi kết nối, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    }

    const handleClose = () => {
        setFormData({ so_dien_thoai: '', mat_khau: '' });
        setError('');
        setForgotValue('');
        setOtp('');
        setNewPassword('');
        setMode('login');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6">Đăng nhập</Typography>
                    </Box>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <form onSubmit={mode==='login' ? handleSubmit : (e)=>{ e.preventDefault(); }}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box sx={{ display:'flex', gap:1 }}>
                            <Button variant={vaiTro==='quan_ly'?'contained':'outlined'} size="small" onClick={()=>setVaiTro('quan_ly')}>Admin</Button>
                            <Button variant={vaiTro==='nong_dan'?'contained':'outlined'} size="small" onClick={()=>setVaiTro('nong_dan')}>Nông dân</Button>
                        </Box>
                        
                        {mode==='login' && (
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
                        />)}
                        
                        {mode==='login' && (
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
                        />)}

                        {mode==='forgot' && (
                            <>
                                <TextField label="Email hoặc số điện thoại" value={forgotValue} onChange={(e)=>setForgotValue(e.target.value)} fullWidth />
                                <Button variant="contained" onClick={handleSendOtp} disabled={loading}>{loading ? 'Đang gửi OTP...' : 'Gửi OTP'}</Button>
                            </>
                        )}

                        {mode==='verify' && (
                            <>
                                <TextField label="Mã OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} fullWidth />
                                <TextField label="Mật khẩu mới" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} fullWidth />
                                <Button variant="contained" onClick={handleVerifyOtpAndReset} disabled={loading}>{loading ? 'Đang xác minh...' : 'Đổi mật khẩu'}</Button>
                            </>
                        )}
                        
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Lưu ý:</strong> Vai trò quyết định trang truy cập sau đăng nhập.
                            </Typography>
                        </Box>
                        {mode==='login' && (
                        <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
                            <Button size="small" onClick={()=>{ setError(''); setForgotValue(''); setMode('forgot'); }}>Quên mật khẩu?</Button>
                        </Box>)}
                        {mode==='reset_success' && (
                            <Alert severity="success">Đổi mật khẩu thành công! Vui lòng đăng nhập lại.</Alert>
                        )}
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleClose} disabled={loading}>
                        Hủy
                    </Button>
                    {mode==='login' ? (
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    ) : mode==='forgot' ? (
                        <Button variant="outlined" onClick={()=>setMode('login')}>Quay lại đăng nhập</Button>
                    ) : mode==='verify' ? (
                        <Button variant="outlined" onClick={()=>setMode('login')}>Quay lại đăng nhập</Button>
                    ) : null}
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FarmerLoginModal;

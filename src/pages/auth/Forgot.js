import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import Background from "../../components/Back_ground";



function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('nong_dan'); // quan_ly | nong_dan

  // --- Gửi OTP ---
  const sendOTP = async () => {
    setMessage("");
    setError("");
    if (!emailOrPhone) {
      setError("Vui lòng nhập email hoặc số điện thoại");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://yensonfarm.io.vn/khoi_api/controller/components/auth/forgot.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailOrPhone, vai_tro: role }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setMessage(data.message);
        setStep(2);
      } else {
        setError(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  // --- Xác minh OTP ---
  const verifyOTP = async () => {
    setMessage("");
    setError("");
    if (!otp) {
      setError("Vui lòng nhập OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://yensonfarm.io.vn/khoi_api/controller/components/auth/reset_password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp, email: emailOrPhone, vai_tro: role }), // xác minh otp
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setMessage(data.message);
        setStep(3);
      } else {
        setError(data.message || "OTP không hợp lệ");
      }
    } catch (err) {
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  // --- Đặt lại mật khẩu ---
  const resetPassword = async () => {
    setMessage("");
    setError("");
    if (!password) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://yensonfarm.io.vn/khoi_api/controller/components/auth/reset_password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp,
            email: emailOrPhone,
            vai_tro: role,
            new_password: password,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setMessage(data.message);
        setTimeout(() => {
          window.location.href = "/pages/auth/Login";
        }, 2000);
      } else {
        setError(data.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <Background >
        <Container maxWidth="sm">
          <Box
            sx={{
              marginTop: 8,
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: 3,
              borderRadius: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom color="primary">
              Quên mật khẩu
            </Typography>

            {step === 1 && (
              <>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant={role==='quan_ly'?'contained':'outlined'} size="small" onClick={()=>setRole('quan_ly')}>Admin</Button>
                  <Button variant={role==='nong_dan'?'contained':'outlined'} size="small" onClick={()=>setRole('nong_dan')}>Nông dân</Button>
                </Box>
                <TextField
                  fullWidth
                  label="Email hoặc số điện thoại"
                  variant="outlined"
                  margin="normal"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={sendOTP}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Gửi OTP"}
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <TextField
                  fullWidth
                  label="Nhập mã OTP"
                  variant="outlined"
                  margin="normal"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={verifyOTP}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Xác minh OTP"}
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <TextField
                  fullWidth
                  type="password"
                  label="Mật khẩu mới"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={resetPassword}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Đặt lại mật khẩu"}
                </Button>
              </>
            )}

            {message && (
              <Alert severity="success" sx={{ mt: 3, width: "100%" }}>
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 3, width: "100%" }}>
                {error}
              </Alert>
            )}
          </Box>
        </Container>
      </Background>
    </div>
  );
}

export default ForgotPassword;

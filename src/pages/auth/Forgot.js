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

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: nhập email/phone, 2: nhập OTP, 3: nhập password
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Gửi OTP
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
        "http://localhost:8080/kltn_management/src/be_management/controller/components/auth/forgot.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailOrPhone }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setMessage(data.message);
        setStep(2); // chuyển sang bước nhập OTP
      } else {
        setError(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  // Xác minh OTP
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
        "http://localhost:8080/kltn_management/src/be_management/controller/components/auth/verify_otp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailOrPhone, otp }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setMessage(data.message);
        setStep(3); // chuyển sang bước nhập mật khẩu mới
      } else {
        setError(data.message || "OTP không hợp lệ");
      }
    } catch (err) {
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu
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
        "http://localhost:8080/kltn_management/src/be_management/controller/components/auth/reset_password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailOrPhone, password }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setMessage(data.message);
        setStep(1); // quay lại bước đầu (nếu muốn)
        setEmailOrPhone("");
        setOtp("");
        setPassword("");
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
            <TextField
              fullWidth
              label="Email hoặc số điện thoại của bạn"
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
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Gửi OTP"
              )}
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
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Xác minh OTP"
              )}
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
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đặt lại mật khẩu"
              )}
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
  );
}

export default ForgotPassword;

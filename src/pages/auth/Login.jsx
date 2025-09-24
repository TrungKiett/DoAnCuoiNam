import * as React from "react";
import Header from "../../components/customer/Header";
import {
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Link,
  Alert,
  IconButton,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AppProvider } from "@toolpad/core/AppProvider";
import { SignInPage } from "@toolpad/core/SignInPage";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
 import Background from "../../components/Back_ground";

// ✅ Field nhập số điện thoại
function CustomPhoneField() {
  return (
    <TextField
      label="Số điện thoại"
      name="username"
      type="text"
      size="small"
      required
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <AccountCircle fontSize="inherit" />
          </InputAdornment>
        ),
      }}
      variant="outlined"
    />
  );
}

// ✅ Field nhập mật khẩu
function CustomPasswordField() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Mật khẩu
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        name="password"
        size="small"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword((show) => !show)}
              edge="end"
              size="small"
            >
              {showPassword ? (
                <VisibilityOff fontSize="inherit" />
              ) : (
                <Visibility fontSize="inherit" />
              )}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

// ✅ Nút đăng nhập
function CustomButton() {
  return (
    <Button
      type="submit"
      variant="outlined"
      color="info"
      size="small"
      disableElevation
      fullWidth
      sx={{ my: 2 }}
    >
      Đăng nhập
    </Button>
  );
}

// ✅ Link đăng ký
function SignUpLink() {
  return (
    <Link href="/register" variant="body2">
      Đăng kí
    </Link>
  );
}

// ✅ Link quên mật khẩu
function ForgotPasswordLink() {
  return (
    <Link href="Forgot" variant="body2">
      Quên mật khẩu?
    </Link>
  );
}

// ✅ Checkbox lưu mật khẩu
function RememberMeCheckbox() {
  return (
    <FormControlLabel
      label="Lưu mật khẩu"
      control={<Checkbox name="remember" value="true" color="primary" />}
    />
  );
}

export default function LoginPhone() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // ✅ Xử lý đăng nhập
  const handleSignIn = async (provider, formData) => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(
        "http://localhost/doancuoinam/src/be_management/controller/components/auth/login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username: formData.get("username"),
            password: formData.get("password"),
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        setSuccessMsg(data.message);

        // ✅ Phân quyền điều hướng
        switch (data.user.vai_tro) {
          case "quan_ly":
            navigate("/admin/Dashboard");
            break;

          case "nong_dan":
            navigate("/farmer/Dashboard");
            break;
          default:
            navigate("/"); // fallback
            break;
        }
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối server");
    }
  };

  return (
    <div>
      <Header />
      <Background >

        <AppProvider theme={theme}>
          <SignInPage
            signIn={handleSignIn}
            slots={{
              title: () => <h2 style={{ marginBottom: 8 }}>Đăng nhập</h2>,
              subtitle: () =>
                errorMsg ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMsg}
                  </Alert>
                ) : successMsg ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {successMsg}
                  </Alert>
                ) : null,
              emailField: CustomPhoneField,
              passwordField: CustomPasswordField,
              submitButton: CustomButton,
              signUpLink: SignUpLink,
              rememberMe: RememberMeCheckbox,
              forgotPasswordLink: ForgotPasswordLink,
            }}
            slotProps={{ form: { noValidate: true } }}
            providers={[{ id: "credentials", name: "Phone and Password" }]}
          />
        </AppProvider>
      </Background >

    </div>
  );
}

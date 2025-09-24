// src/components/TechnicalProposalForm.js
import React, { useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import Header from "../../../components/farmer/Header";

const TechnicalProposal = () => {
  const [tieuDe, setTieuDe] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [loaiVanDe, setLoaiVanDe] = useState("");
  const [ngayBaoCao, setNgayBaoCao] = useState("");
  const [maNongDan, setMaNongDan] = useState("");
  const [maLoTrong, setMaLoTrong] = useState("");
  const [hinhAnh, setHinhAnh] = useState(null);
  const [trangThai, setTrangThai] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [location, setLocation] = useState(null);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  // Bật camera
  const startCamera = async () => {
    setCameraOn(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Lỗi bật camera:", err);
    }
  };

  // Chụp ảnh
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setHinhAnh(blob);
      getLocation();
    }, "image/jpeg");
  };

  // Lấy vị trí GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation không được hỗ trợ");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Lỗi lấy vị trí:", err);
      }
    );
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tieuDe || !noiDung || !loaiVanDe || !ngayBaoCao) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("tieu_de", tieuDe);
    formData.append("noi_dung", noiDung);
    formData.append("loai_van_de", loaiVanDe);
    formData.append("ngay_bao_cao", ngayBaoCao);
    formData.append("ma_nong_dan", maNongDan);
    formData.append("ma_lo_trong", maLoTrong);
    if (hinhAnh) formData.append("hinh_anh", hinhAnh);
    formData.append("trang_thai", trangThai);
    formData.append("ghi_chu", ghiChu);
    if (location) {
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
    }

    setTimeout(() => {
      console.log("Dữ liệu gửi:", {
        tieuDe,
        noiDung,
        loaiVanDe,
        ngayBaoCao,
        maNongDan,
        maLoTrong,
        hinhAnh,
        trangThai,
        ghiChu,
        location,
      });
      setSuccess(true);
      // reset form
      setTieuDe("");
      setNoiDung("");
      setLoaiVanDe("");
      setNgayBaoCao("");
      setMaNongDan("");
      setMaLoTrong("");
      setHinhAnh(null);
      setTrangThai("");
      setGhiChu("");
      setLocation(null);
      setCameraOn(false);
    }, 1000);
  };
 
  
    <> 
    <Header />
    <Container maxWidth="md">
      <Box sx={{ mt: 4, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Báo cáo vấn đề kỹ thuật
        </Typography>

        {success && <Alert severity="success">Gửi thành công!</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Box
          component="form"
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Tiêu đề"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
            required
          />

          <TextField
            label="Nội dung"
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            multiline
            rows={4}
            required
          />

          <TextField
            label="Loại vấn đề"
            value={loaiVanDe}
            onChange={(e) => setLoaiVanDe(e.target.value)}
            select
            required
          >
            <MenuItem value="Kỹ thuật">Kỹ thuật</MenuItem>
            <MenuItem value="Vật tư">Vật tư</MenuItem>
            <MenuItem value="Khác">Khác</MenuItem>
          </TextField>

          <TextField
            label="Ngày báo cáo"
            type="date"
            value={ngayBaoCao}
            onChange={(e) => setNgayBaoCao(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Mã nông dân"
            value={maNongDan}
            onChange={(e) => setMaNongDan(e.target.value)}
          />

          <TextField
            label="Mã lô trồng"
            value={maLoTrong}
            onChange={(e) => setMaLoTrong(e.target.value)}
          />

          {/* Chụp ảnh trực tiếp */}
          {!cameraOn && (
            <Button variant="contained" onClick={startCamera}>
              Mở camera để chụp ảnh
            </Button>
          )}
          {cameraOn && (
            <>
              <video
                ref={videoRef}
                autoPlay
                style={{ width: "100%", borderRadius: 8 }}
              />
              <Button variant="contained" onClick={capturePhoto}>
                Chụp ảnh
              </Button>
            </>
          )}
          {hinhAnh && <Typography>Ảnh đã chụp sẵn.</Typography>}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <TextField
            label="Trạng thái"
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
          />

          <TextField
            label="Ghi chú"
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            multiline
            rows={2}
          />

          <Button type="submit" variant="contained" color="primary">
            Gửi
          </Button>
        </Box>
      </Box>
    </Container>
    </>
 };

export default TechnicalProposal;

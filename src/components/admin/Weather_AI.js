import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import axios from "axios";

export default function Weather() {
  const [weather, setWeather] = useState({
    loading: false,
    error: "",
    suggestions: [],
    alerts: [],
    location: null,
  });

  const [selectedLot, setSelectedLot] = useState(null);
  const [lotAlerts, setLotAlerts] = useState([]);

  // Lấy địa chỉ theo IP Wi-Fi
  const getLocationByIP = async () => {
    try {
      const res = await axios.get("https://ipwho.is/");
      const data = res.data;
      return {
        city: data.city,
        region: data.region,
        country: data.country,
        lat: data.latitude,
        lon: data.longitude,
      };
    } catch {
      return { city: "TP.HCM", region: "", country: "VN", lat: 10.7769, lon: 106.7009 };
    }
  };

  // Lấy dự báo thời tiết
  const handleWeatherSuggestion = async () => {
    setWeather((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      let latitude, longitude, locationName;

      if (selectedLot?.latitude && selectedLot?.longitude) {
        latitude = selectedLot.latitude;
        longitude = selectedLot.longitude;
        locationName = selectedLot.ten_lo || selectedLot.ma_lo_trong || "Lô đã chọn";
      } else {
        const loc = await getLocationByIP();
        latitude = loc.lat;
        longitude = loc.lon;
        locationName = `${loc.city}, ${loc.region}, ${loc.country}`;
      }

      const res = await axios.get(
        "http://localhost/doancuoinam/src/be_management/controller/components/auth/thoitiet_api.php",
        { params: { action: "forecast", lat: latitude, lon: longitude } }
      );

      const data = res.data;
      if (!data?.success || !data?.data?.length) throw new Error("Dữ liệu thời tiết không hợp lệ");

      // Gộp dữ liệu theo ngày
      const groupedByDay = {};
      data.data.forEach((item) => {
        const date = item.date.split(" ")[0];
        if (!groupedByDay[date]) groupedByDay[date] = [];
        groupedByDay[date].push(item);
      });

      const dailyForecast = Object.keys(groupedByDay)
        .slice(0, 5)
        .map((date) => {
          const dayItems = groupedByDay[date];
          const avgTemp =
            dayItems.reduce((sum, i) => sum + Number(i.temperature || 0), 0) / dayItems.length;
          const descriptions = dayItems.map((i) => i.description);
          const commonWeather = descriptions.sort(
            (a, b) => descriptions.filter((v) => v === b).length - descriptions.filter((v) => v === a).length
          )[0];
          return {
            date,
            avgTemp: avgTemp.toFixed(1),
            weather: commonWeather,
            suggestion: commonWeather.toLowerCase().includes("mưa") || commonWeather.toLowerCase().includes("rain")
              ? "🌧 Có khả năng mưa – nên che chắn hoặc tạm ngưng canh tác ngoài trời."
              : "☀ Thời tiết thuận lợi – có thể tiếp tục hoạt động đồng ruộng.",
          };
        });

      setWeather({
        loading: false,
        error: "",
        suggestions: dailyForecast,
        alerts: [], // nếu muốn alert mặt trời có thể thêm
        location: { name: locationName, isCurrentLocation: !selectedLot },
      });
    } catch (e) {
      setWeather({
        loading: false,
        error: e.message || "⚠️ Lỗi lấy gợi ý thời tiết",
        suggestions: [],
        alerts: [],
        location: null,
      });
    }
  };

  useEffect(() => {
    handleWeatherSuggestion();
  }, [selectedLot]);

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: "white", border: "1px solid #eee" }}>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mx-auto">
        {/* Cột địa chỉ */}
        <div className="flex-1">
          {weather.location && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "#e3f2fd",
                borderColor: "#2196f3",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",  
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {weather.location.isCurrentLocation ? (
                  <MyLocationIcon sx={{ color: "#1976d2" }} />
                ) : (
                  <LocationOnIcon sx={{ color: "#1976d2" }} />
                )}
                <Typography sx={{ fontWeight: 600, color: "#1976d2" }}>
                  {weather.location.name}
                </Typography>
              </Stack>
            </Paper>
          )}
        </div>

         <div className="flex-1">
          <Button
            variant="outlined"
            startIcon={<CloudIcon />}
            onClick={handleWeatherSuggestion}
            disabled={weather.loading}
            fullWidth
            sx={{
              height: "100%", // cân bằng chiều cao với cột địa chỉ
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Làm mới dự báo thời tiết
          </Button>
        </div>
      </div>



      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">🌤 Dự báo 5 ngày tới</Typography>
        <Typography variant="body2" color="text.secondary">({lotAlerts.length} mục)</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />



      {weather.loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Đang lấy gợi ý thời tiết...</Typography>
        </Box>
      )}

      {weather.error && <Typography color="error" sx={{ mb: 2 }}>{weather.error}</Typography>}

      {weather.suggestions.length > 0 && (
        <Box sx={{ mb: 2 }}>
           <Stack spacing={1.2}>
            {weather.suggestions.map((s, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f9f9f9" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  📅 {new Date(s.date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                </Typography>
                <Typography variant="body2">🌡 Trung bình: {s.avgTemp}°C</Typography>
                <Typography variant="body2">🌤 {s.weather}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>💡 {s.suggestion}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}


    </Paper>
  );
}

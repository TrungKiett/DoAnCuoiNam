import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FarmerLayout from "../../components/farmer/FarmerLayout";

export default function FarmerPayroll_User() {
  const [payroll, setPayroll] = useState([]);
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  const [farmerInfo, setFarmerInfo] = useState(null);

  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Lấy thông tin Farmer từ localStorage
  useEffect(() => {
    const keys = ["farmer_user", "user", "current_user", "userInfo"];
    let farmer = null;

    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const obj = JSON.parse(raw);
        if (obj && (obj.id || obj.ma_nguoi_dung)) {
          farmer = {
            id: obj.id || obj.ma_nguoi_dung,
            full_name: obj.full_name || obj.ho_ten || "",
          };
          break;
        }
      } catch {}
    }
    if (farmer) setFarmerInfo(farmer);
  }, []);

  // Fetch dữ liệu payroll
  useEffect(() => {
    if (!farmerInfo) return;

    const fetchPayrollData = async () => {
      try {
        const url = `http://yensonfarm.io.vn/khoi_api/acotor/farmer/payroll_list1.php?ma_nong_dan=${farmerInfo.id}`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        if (data.success) setPayroll(data.data);
        else setPayroll([]);
      } catch (err) {
        console.error("Fetch payroll lỗi:", err);
        setPayroll([]);
      }
    };

    fetchPayrollData();
  }, [farmerInfo]);

  // Hàm parse ngày tạo hỗ trợ nhiều format
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;

    if (dateStr.includes("-")) {
      const parts = dateStr.split(" ")[0].split("-"); // Lấy phần date, bỏ phần time
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        return { year, month };
      }
    }

    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[2], 10);
        return { year, month };
      }
    }

    return null;
  };

  // Lấy danh sách tháng và năm có sẵn từ dữ liệu
  const availableMonths = React.useMemo(() => {
    const months = new Set();
    payroll.forEach((row) => {
      const parsed = parseDateString(row.ngay_tao);
      if (parsed && parsed.month >= 1 && parsed.month <= 12) {
        months.add(parsed.month);
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [payroll]);

  const availableYears = React.useMemo(() => {
    const years = new Set();
    payroll.forEach((row) => {
      const parsed = parseDateString(row.ngay_tao);
      if (parsed && parsed.year) {
        years.add(parsed.year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [payroll]);

  // Lọc dữ liệu theo tháng và năm
  useEffect(() => {
    const filtered = payroll.filter((row) => {
      const parsed = parseDateString(row.ngay_tao);
      if (!parsed) return false;

      const { month, year } = parsed;

      // Validate month và year
      if (isNaN(month) || isNaN(year)) return false;
      if (month < 1 || month > 12) return false;

      // Áp dụng filter - chỉ hiển thị dòng phù hợp
      const matchMonth = monthFilter === "" || month === Number(monthFilter);
      const matchYear = yearFilter === "" || year === Number(yearFilter);

      return matchMonth && matchYear;
    });

    setFilteredPayroll(filtered);
  }, [payroll, monthFilter, yearFilter]);

  // Thống kê số lượng kết quả
  const totalRecords = payroll.length;
  const filteredRecords = filteredPayroll.length;

  return (
    <FarmerLayout currentPage="Lương">
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div>
          <h2
            style={{
              marginBottom: "20px",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            Lương của tôi
          </h2>

          {/* Hiển thị thông tin lọc */}
          {(monthFilter || yearFilter) && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              Đang lọc: {monthFilter && `Tháng ${monthFilter}`}{" "}
              {monthFilter && yearFilter && "- "}{" "}
              {yearFilter && `Năm ${yearFilter}`} ({filteredRecords} /{" "}
              {totalRecords} kết quả)
              <button
                onClick={() => {
                  setMonthFilter("");
                  setYearFilter("");
                }}
                style={{
                  marginLeft: "12px",
                  padding: "4px 12px",
                  backgroundColor: "#fff",
                  border: "1px solid #1976d2",
                  borderRadius: "4px",
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Bộ lọc tháng và năm */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <div style={{ minWidth: "120px" }}>
              <label
                htmlFor="month-select"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Tháng
              </label>
              <select
                id="month-select"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <option value="">Tất cả</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: "120px" }}>
              <label
                htmlFor="year-select"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Năm
              </label>
              <select
                id="year-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <option value="">Tất cả</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bảng lương */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f5f5f5" }}>
                <tr>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    STT
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Họ tên
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Số giờ làm
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Mức lương/giờ
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Ngày tạo
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    Tổng thu nhập
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.length > 0 ? (
                  filteredPayroll.map((row, index) => (
                    <tr
                      key={row.id || index}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px" }}>{row.ten_dang_nhap}</td>
                      <td style={{ padding: "12px" }}>{row.tong_gio_lam}</td>
                      <td style={{ padding: "12px" }}>
                        {row.muc_luong_gio?.toLocaleString()} đ
                      </td>
                      <td style={{ padding: "12px" }}>{row.ngay_tao}</td>
                      <td style={{ padding: "12px" }}>
                        {row.tong_thu_nhap?.toLocaleString()} đ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}

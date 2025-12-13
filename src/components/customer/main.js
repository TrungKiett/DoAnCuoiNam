import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  Typography,
  Divider,
  CardContent,
  Box,
  Avatar,
} from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress,
} from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const Main = () => {
  const services = [
    {
      title: "Rau củ sạch",
      desc: "Cung cấp rau củ tươi ngon, an toàn, đạt chuẩn VietGAP.",
      img: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg",
    },
    {
      title: "Trái cây hữu cơ",
      desc: "Trái cây chín tự nhiên, ngọt thanh, không chất bảo quản.",
      img: "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg",
    },
    {
      title: "Gạo sạch",
      desc: "Hạt gạo dẻo thơm, giàu dinh dưỡng, tốt cho sức khỏe.",
      img: "https://images.pexels.com/photos/4110255/pexels-photo-4110255.jpeg",
    },
  ];

const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // ✅ Gọi API lấy danh sách sản phẩm
  useEffect(() => {
    fetch(
      "http://yensonfarm.io.vn/khoi_api/acotor/customer/list_san_pham.php",
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === "success" && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.warn("Dữ liệu sản phẩm không hợp lệ:", data);
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Mở Dialog hiển thị QR
  const handleShowQR = (product) => {
    setSelectedQR(product);
    setOpenDialog(true);
  };

  // ✅ Đóng Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQR(null);
  };

  if (loading)
    return (
      <div className="text-center py-6">
        <CircularProgress />
        <p>Đang tải dữ liệu...</p>
      </div>
    );


  return (
    <>
      {/* Giới thiệu hoạt động */}
      <div className="relative w-full min-h-screen bg-green-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
            alt="farm background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-green-900 opacity-70"></div>
        </div>

        {/* Nội dung chính */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6 lg:px-12 py-16">
          <span className="bg-white/20 px-4 py-1 rounded-full mt-4 text-xs sm:text-sm mb-4 sm:mb-6">
            Ăn thực phẩm tự nhiên mỗi ngày
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Handlee',cursive] font-bold leading-snug mb-6">
            Canh tác{" "}
            <span className="bg-yellow-400 text-black px-2 rounded-2xl">
              Thông minh
            </span>
            <br />
            <span className="mt-5 text-base sm:text-lg md:text-xl lg:text-2xl">
              Nông nghiệp bền vững
            </span>
          </h1>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded shadow">
              Khám phá thêm
            </button>
            <button className="bg-white hover:bg-yellow-400 text-black px-6 py-3 rounded shadow">
              Về chúng tôi
            </button>
          </div>

          {/* Service boxes */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {[
              { icon: "🚜", text: "Ứng dụng công nghệ mới" },
              { icon: "🌱", text: "Dịch vụ nông nghiệp thông minh" },
              { icon: "🏅", text: "Tiêu chuẩn chất lượng cao nhất" },
              { icon: "🍃", text: "100% sản phẩm tự nhiên, an toàn" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#F8F7F0] text-center p-4 sm:p-6 rounded shadow"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-yellow-400 rounded-full mb-4 sm:mb-6 text-2xl sm:text-3xl">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-black">
                  {item.text}
                </h3>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* Giới thiệu các mặt hàng */}
      <section className="py-16 text-center">
        <span className="px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
          🌿Dịch vụ phổ biến nhất
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Các sản phẩm hàng đầu trong nông nghiệp bền vững
        </h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <div
              key={i}
              className="relative rounded overflow-hidden shadow-lg group"
              style={{ minHeight: "288px" }}
            >
              <img
                src={service.img}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white p-4 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="text-sm">{service.desc}</p>
                </div>
                <div className="w-10 h-10 bg-green-900 flex items-center justify-center rounded-full">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 🛒 Sản phẩm nổi bật */}
        <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-green-800">
        🛒 Sản phẩm nông nghiệp nổi bật
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          Hiện chưa có sản phẩm nào được hiển thị.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
            >
              <img
                src={
                  product.img && product.img.trim() !== ""
                    ? product.img
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={product.ma_qr || "Sản phẩm"}
                className="w-full h-48 object-cover rounded"
              />

              <h3 className="text-lg font-semibold mt-3 text-green-700">
                {product.ten_giong || "Tên sản phẩm"}
              </h3>
              <h3 className="text-lg font-semibold mt-3 text-green-700">
                Ngày trồng: {product.ngay_gieo || "Chưa cập nhật"}
              </h3>
              <p className="text-sm text-gray-600">
                {product.desc || "Mô tả sản phẩm đang cập nhật..."}
              </p>

              <button
                className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() => handleShowQR(product)}
              >
                Tìm hiểu thêm || QR sản phẩm
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Dialog hiển thị QR nằm ngoài vòng map */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle className="text-center font-semibold">
          Mã QR sản phẩm
        </DialogTitle>
        <DialogContent className="flex flex-col items-center">
          {selectedQR && (
            <>
 <img
        src={`http://yensonfarm.io.vn/khoi_api/acotor/uploads/${selectedQR.ma_qr}`}
        alt="QR sản phẩm"
        className="mx-auto w-48 h-48 border rounded shadow"
      />
              <p className="text-sm text-gray-500 mt-2" >
                Cây trồng: {selectedQR.ten_giong}
              </p>
              <Button
                variant="contained"
                color="success"
                onClick={handleCloseDialog}
                sx={{ mt: 2 }}
              >
                Đóng
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default Main;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductQRCode = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/doancuoinam/src/be_management/acotor/admin/xuat_list_sanpham.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setCrops(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch:", err);
        setLoading(false);
      });
  }, []);

  // 👉 Xem hoặc tạo QR
  const handleCreateQR = (ma_giong) => {
    navigate(`/admin/qrcode/${ma_giong}`);
  };

  const handleViewQR = (ma_giong) => {
    navigate(`/admin/qrcode/${ma_giong}`);
  };

  // 👉 Hàm xóa QR
  const handleDeleteQR = (ma_giong) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã QR cho giống này không?")) {
      fetch(
        `http://localhost/doancuoinam/src/be_management/acotor/admin/xoa_qrcode.php?ma_giong=${ma_giong}`
      )
        .then((res) => res.json())
        .then((data) => {
          alert(data.message);
          if (data.status === "success") {
            // Cập nhật lại danh sách mà không cần reload
            setCrops((prev) =>
              prev.map((c) =>
                c.ma_giong === ma_giong ? { ...c, ma_qr: null } : c
              )
            );
          }
        })
        .catch((err) => console.error("Lỗi xóa QR:", err));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Danh sách loại cây trồng
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-3 py-2 text-center w-12">STT</th>
              <th className="border border-gray-300 px-3 py-2">Tên giống</th>
               <th className="border border-gray-300 px-3 py-2">Nhà cung cấp</th>
              <th className="border border-gray-300 px-3 py-2">Số lượng (Kg)</th>
              <th className="border border-gray-300 px-3 py-2">Ngày mua</th>
              <th className="border border-gray-300 px-3 py-2 text-center w-48">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, index) => (
              <tr
                key={crop.ma_giong}
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(`/admin/qrcode/${crop.ma_giong}`)}
              >
                <td className="border border-gray-300 px-3 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-3 py-2">{crop.ten_giong}</td>
                 <td className="border border-gray-300 px-3 py-2">{crop.nha_cung_cap}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{crop.so_luong_ton}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{crop.ngay_mua}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  {crop.ma_qr ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewQR(crop.ma_giong);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Xem QR
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQR(crop.ma_giong);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateQR(crop.ma_giong);
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Tạo QR
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductQRCode;

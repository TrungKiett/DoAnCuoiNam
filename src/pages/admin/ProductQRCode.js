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

const handleRowClick = (ma_giong) => {
  navigate(`/admin/qrcode/${ma_giong}`);
};

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Danh sách loại cây trồng
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2 text-center">STT</th>
              <th className="border border-gray-300 px-4 py-2">Tên giống</th>
              <th className="border border-gray-300 px-4 py-2">Mã loại cây</th>
              <th className="border border-gray-300 px-4 py-2">Nhà cung cấp</th>
              <th className="border border-gray-300 px-4 py-2">Số lượng(Kg)</th>
              <th className="border border-gray-300 px-4 py-2">Ngày mua</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, index) => (
              <tr
                key={crop.ma_giong}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(crop.ma_giong)}
              >
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{crop.ten_giong}</td>
                <td className="border border-gray-300 px-4 py-2">{crop.ma_loai_cay}</td>
                <td className="border border-gray-300 px-4 py-2">{crop.nha_cung_cap}</td>
                <td className="border border-gray-300 px-4 py-2">{crop.so_luong_ton}</td>
                <td className="border border-gray-300 px-4 py-2">{crop.ngay_mua}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductQRCode;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const QR_Code = () => {
  const { ma_giong } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://yensonfarm.io.vn/khoi_api/acotor/admin/tao_qrcode_sanpham.php?ma_giong=${ma_giong}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" || data.status === "exists") {
          setQrData(data);
        } else {
          alert(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch:", err);
        setLoading(false);
      });
  }, [ma_giong]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Đang tải dữ liệu QR Code...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6 text-center text-green-700">
        MÃ QR CHO GIỐNG: {ma_giong}
      </h2>

      {qrData ? (
        <>
          {/* Hiển thị thông tin từng dòng đẹp hơn */}
          <div className="space-y-2 mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            {qrData.thong_tin.split("\n").map((line, index) => {
              const [label, value] = line.split(":");
              return (
                <div key={index} className="flex justify-between text-gray-700">
                  <span className="font-semibold">{label?.trim()}:</span>
                  <span>{value?.trim()}</span>
                </div>
              );
            })}
          </div>

          {/* Hiển thị hình QR */}
          <div className="text-center">
            <img
              src={qrData.qr_url}
              alt="QR Code"
              className="mx-auto mt-4 border rounded-lg shadow-lg w-56 h-56 object-contain"
            />
            <p className="text-gray-500 mt-2 text-sm">Mã QR: {qrData.ma_qr}</p>
          </div>
        </>
      ) : (
        <p className="text-center text-red-500">Không có dữ liệu QR để hiển thị.</p>
      )}
    </div>
  );
};

export default QR_Code;

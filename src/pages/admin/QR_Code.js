import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const QR_Code = () => {
  const { ma_giong } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost/doancuoinam/src/be_management/acotor/admin/tao_qrcode_sanpham.php?ma_giong=${ma_giong}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setQrData(data);
        } else {
          alert(data.message);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch:", err);
        setLoading(false);
      });
  }, [ma_giong]);

  if (loading) return <p className="text-center">Đang tạo QR Code...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Mã QR cho giống: {ma_giong}</h2>
      {qrData && (
        <>
          <p className="mb-2 whitespace-pre-line">{qrData.thong_tin}</p>
          <img src={qrData.qr_url} alt="QR Code" className="mx-auto mt-4" />
        </>
      )}
    </div>
  );
};

export default QR_Code;

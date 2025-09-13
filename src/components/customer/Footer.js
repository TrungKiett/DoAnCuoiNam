import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPinterestP } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white">
      {/* Grid content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        {/* Logo + mô tả */}
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <span className="text-yellow-400 text-2xl">🌱</span> Yenson Farm
          </h2>
          <p className="text-sm leading-6 mb-6">
            Yenson Farm hướng tới nền nông nghiệp sạch, ứng dụng công nghệ để mang
            đến nông sản tươi ngon, an toàn và bền vững cho cộng đồng.
          </p>
          <div className="flex gap-3">
            <a href="#" className="p-2 border rounded-full hover:bg-yellow-400">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-yellow-400">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-yellow-400">
              <FaLinkedinIn />
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-yellow-400">
              <FaPinterestP />
            </a>
          </div>
        </div>

        {/* Our Link */}
        <div>
          <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Sản phẩm</a></li>
            <li><a href="#">Dịch vụ</a></li>
            <li><a href="#">Hỏi đáp</a></li>
          </ul>
        </div>

        {/* Address */}
        <div>
          <h3 className="font-bold text-lg mb-4">Địa chỉ</h3>
          <ul className="space-y-4 text-sm">
            <li>
              <span className="block font-semibold">Trang trại</span>
              Xã Yên Sơn, Huyện X, Tỉnh Y
            </li>
            <li>
              <span className="block font-semibold">Email</span>
              contact@yensonfarm.com
            </li>
            <li>
              <span className="block font-semibold">Hotline</span>
              +84 987 654 321
            </li>
          </ul>
        </div>

        {/* Recent News */}
        <div>
          <h3 className="font-bold text-lg mb-4">Tin tức mới</h3>
          <ul className="space-y-5 text-sm">
            <li className="flex gap-3">
              <img
                src="https://via.placeholder.com/60"
                alt="news1"
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="text-xs text-gray-400">Tháng 7, 2025</p>
                <a href="#" className="hover:text-yellow-400">
                  Giải pháp canh tác hữu cơ bền vững
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <img
                src="https://via.placeholder.com/60"
                alt="news2"
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="text-xs text-gray-400">Tháng 7, 2025</p>
                <a href="#" className="hover:text-yellow-400">
                  Công nghệ IoT trong quản lý nông trại thông minh
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 py-6 text-sm flex flex-col md:flex-row justify-between items-center px-6">
        <p>©2025 Yenson Farm. Tất cả bản quyền đã được bảo lưu.</p>
        <div className="flex gap-6 mt-3 md:mt-0">
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản sử dụng</a>
          <a href="#">Pháp lý</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa";
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
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
const Footer = () => {
  return (
    <>
      {/* Phản hồi khách hàng */}
      <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-3 mt-8 text-center md:text-left"
          initial={{ y: -100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Phản hồi
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-black relative inline-block">
            khách hàng
            <span className="absolute left-0 bottom-1 w-full h-3 bg-yellow-300 -z-10"></span>
          </h3>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1588px] mx-auto bg-white p-6 lg:p-12 rounded-md">
          {[
            {
              text: "Sản phẩm nông sản tươi ngon, chất lượng vượt trội. Giao hàng nhanh và đóng gói cẩn thận, rất hài lòng.",
              name: "Trần Thị B",
              address: "Huyện Bình Chánh, HCM",
              avatar: "https://via.placeholder.com/80",
              bgColor: "#FFFFFF",
              textColor: "#000000",
              iconColor: "#16A34A",
              dividerColor: "rgba(0,0,0,0.1)",
            },
            {
              text: "Tôi rất ấn tượng với rau củ hữu cơ, hoàn toàn không hóa chất. Đặt lần đầu đã muốn đặt tiếp lần hai.",
              name: "Nguyễn Văn C",
              address: "Quận 1, HCM",
              avatar: "https://via.placeholder.com/80",
              bgColor: "#4F9CF9",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
              dividerColor: "rgba(255,255,255,0.6)",
            },
            {
              text: "Dịch vụ tư vấn nhiệt tình, nông sản đảm bảo chất lượng và đúng cam kết. Cảm ơn đội ngũ!",
              name: "Lê Thị D",
              address: "Quận 7, HCM",
              avatar: "https://via.placeholder.com/80",
              bgColor: "#FFFFFF",
              textColor: "#000000",
              iconColor: "#16A34A",
              dividerColor: "rgba(0,0,0,0.1)",
            },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-10px)" },
                p: 2,
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 420,
                  bgcolor: item.bgColor,
                  color: item.textColor,
                  borderRadius: 4,
                  boxShadow: 5,
                  p: 3,
                }}
              >
                <CardContent sx={{ textAlign: "left", p: 0 }}>
                  <FormatQuoteIcon
                    sx={{
                      fontSize: { xs: 40, md: 50 },
                      color: item.iconColor,
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ mb: 2, fontSize: { xs: 16, md: 18 } }}
                  >
                    {item.text}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: item.dividerColor }} />
                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <Avatar
                      src={item.avatar}
                      sx={{
                        width: { xs: 50, md: 56 },
                        height: { xs: 50, md: 56 },
                        mr: 2,
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.address}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </div>
      </div>{" "}
      <footer className="bg-green-900 text-white">
        {" "}
        {/* Grid content */}{" "}
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
          {" "}
          {/* Logo + mô tả */}{" "}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
              <span className="text-yellow-400 text-2xl"> 🌱 </span> Yenson
              Farm{" "}
            </h2>{" "}
            <p className="text-sm leading-6 mb-6">
              Yenson Farm hướng tới nền nông nghiệp sạch, ứng dụng công nghệ để
              mang đến nông sản tươi ngon, an toàn và bền vững cho cộng
              đồng.{" "}
            </p>{" "}
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 border rounded-full hover:bg-yellow-400"
              >
                <FaFacebookF />
              </a>{" "}
              <a
                href="#"
                className="p-2 border rounded-full hover:bg-yellow-400"
              >
                <FaTwitter />
              </a>{" "}
              <a
                href="#"
                className="p-2 border rounded-full hover:bg-yellow-400"
              >
                <FaLinkedinIn />
              </a>{" "}
              <a
                href="#"
                className="p-2 border rounded-full hover:bg-yellow-400"
              >
                <FaPinterestP />
              </a>{" "}
            </div>{" "}
          </div>
          {/* Our Link */}{" "}
          <div>
            <h3 className="font-bold text-lg mb-4"> Liên kết nhanh </h3>{" "}
            <ul className="space-y-3 text-sm">
              <li>
                {" "}
                <a href="#"> Về chúng tôi </a>
              </li>
              <li>
                {" "}
                <a href="#"> Liên hệ </a>
              </li>
              <li>
                {" "}
                <a href="#"> Sản phẩm </a>
              </li>
              <li>
                {" "}
                <a href="#"> Dịch vụ </a>
              </li>
              <li>
                {" "}
                <a href="#"> Hỏi đáp </a>
              </li>
            </ul>{" "}
          </div>
          {/* Address */}{" "}
          <div>
            <h3 className="font-bold text-lg mb-4"> Địa chỉ </h3>{" "}
            <ul className="space-y-4 text-sm">
              <li>
                <span className="block font-semibold"> Trang trại </span>
                Xã Yên Sơn, Huyện X, Tỉnh Y{" "}
              </li>{" "}
              <li>
                <span className="block font-semibold"> Email </span>
                contact @yensonfarm.com{" "}
              </li>{" "}
              <li>
                <span className="block font-semibold"> Hotline </span> + 84 987
                654 321{" "}
              </li>{" "}
            </ul>{" "}
          </div>
          {/* Recent News */}{" "}
          <div>
            <h3 className="font-bold text-lg mb-4"> Tin tức mới </h3>{" "}
            <ul className="space-y-5 text-sm">
              <li className="flex gap-3">
                <img
                  src="https://via.placeholder.com/60"
                  alt="news1"
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-400"> Tháng 7, 2025 </p>{" "}
                  <a href="#" className="hover:text-yellow-400">
                    Giải pháp canh tác hữu cơ bền vững{" "}
                  </a>{" "}
                </div>{" "}
              </li>{" "}
              <li className="flex gap-3">
                <img
                  src="https://via.placeholder.com/60"
                  alt="news2"
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-400"> Tháng 7, 2025 </p>{" "}
                  <a href="#" className="hover:text-yellow-400">
                    Công nghệ IoT trong quản lý nông trại thông minh{" "}
                  </a>{" "}
                </div>{" "}
              </li>{" "}
            </ul>{" "}
          </div>{" "}
        </div>
        {/* Bottom */}{" "}
        <div className="border-t border-gray-700 py-6 text-sm flex flex-col md:flex-row justify-between items-center px-6">
          <p> ©2025 Yenson Farm.Tất cả bản quyền đã được bảo lưu. </p>{" "}
          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="#"> Chính sách bảo mật </a>{" "}
            <a href="#"> Điều khoản sử dụng </a> <a href="#"> Pháp lý </a>{" "}
          </div>{" "}
        </div>{" "}
      </footer>
    </>
  );
};

export default Footer;

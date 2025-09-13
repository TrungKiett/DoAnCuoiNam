import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card, CardActionArea, CardActions, Typography, Divider } from "@mui/material";
import {
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Box,
    Rating,
    Avatar
} from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const Main = () => {
    const services = [{
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
    const products = [{
            name: "Rau củ sạch",
            desc: "Rau củ tươi ngon, an toàn, đạt chuẩn VietGAP.",
            price: "35.000đ / kg",
            img: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg",
        },
        {
            name: "Trái cây hữu cơ",
            desc: "Ngọt thanh, chín tự nhiên, không hóa chất.",
            price: "55.000đ / kg",
            img: "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg",
        },
        {
            name: "Gạo sạch",
            desc: "Hạt gạo dẻo thơm, giàu dinh dưỡng, tốt cho sức khỏe.",
            price: "25.000đ / kg",
            img: "https://images.pexels.com/photos/4110255/pexels-photo-4110255.jpeg",
        },
        {
            name: "Mật ong thiên nhiên",
            desc: "100% nguyên chất, tốt cho sức khỏe.",
            price: "120.000đ / lít",
            img: "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg",
        },
        {
            name: "Trà xanh sạch",
            desc: "Hái tận gốc, hương vị đậm đà, an toàn.",
            price: "70.000đ / hộp",
            img: "https://images.pexels.com/photos/461430/pexels-photo-461430.jpeg",
        },
    ];
    return ( <
        > { /* giới thiệu các hoạt động */ } <
        div className = "relative w-full min-h-screen bg-green-900" >
        <
        div className = "absolute inset-0" >
        <
        img src = "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
        alt = "farm background"
        className = "w-full h-full object-cover" /
        >
        <
        div className = "absolute inset-0 bg-green-900 opacity-70" > < /div> <
        /div>

        { /* Nội dung */ } <
        div className = "relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6 lg:px-12 py-16" > { /* Subtitle */ } <
        span className = "bg-white/20 px-4 py-1 rounded-full mt-4 text-xs sm:text-sm mb-4 sm:mb-6" >
        Ăn thực phẩm tự nhiên mỗi ngày <
        /span>

        { /* Title */ } <
        h1 className = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Handlee',cursive] font-bold leading-snug mb-6" >
        Canh tác { " " } <
        span className = "bg-yellow-400 text-black px-2 rounded-2xl" >
        Thông minh <
        /span>{" "} <
        br / >
        <
        h1 className = "mt-5 text-base sm:text-lg md:text-xl lg:text-2xl" >
        Nông nghiệp bền vững <
        /h1> <
        /h1>

        { /* Buttons */ } <
        div className = "flex flex-col sm:flex-row gap-4 mb-16" >
        <
        button className = "bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded shadow" >
        Khám phá thêm <
        /button> <
        button className = "bg-white hover:bg-yellow-400 text-black px-6 py-3 rounded shadow" >
        Về chúng tôi <
        /button> <
        /div>

        { /* Service boxes */ } <
        motion.div className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full"
        initial = {
            { y: 100, opacity: 0 } }
        whileInView = {
            { y: 0, opacity: 1 } }
        transition = {
            { duration: 0.8, ease: "easeOut" } }
        viewport = {
            { once: true } } >
        <
        div className = "bg-[#F8F7F0] text-center p-4 sm:p-6 rounded shadow" >
        <
        div className = "w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-yellow-400 rounded-full mb-4 sm:mb-6 text-2xl sm:text-3xl" > 🚜
        <
        /div> <
        h3 className = "font-semibold text-sm sm:text-base md:text-lg text-black" >
        Ứng dụng công nghệ mới <
        /h3> <
        /div>

        <
        div className = "bg-[#F8F7F0] text-center p-4 sm:p-6 rounded shadow" >
        <
        div className = "w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-yellow-400 rounded-full mb-4 sm:mb-6 text-2xl sm:text-3xl" > 🌱
        <
        /div> <
        h3 className = "font-semibold text-sm sm:text-base md:text-lg text-black" >
        Dịch vụ nông nghiệp thông minh <
        /h3> <
        /div>

        <
        div className = "bg-[#F8F7F0] text-center p-4 sm:p-6 rounded shadow" >
        <
        div className = "w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-yellow-400 rounded-full mb-4 sm:mb-6 text-2xl sm:text-3xl" > 🏅
        <
        /div> <
        h3 className = "font-semibold text-sm sm:text-base md:text-lg text-black" >
        Tiêu chuẩn chất lượng cao nhất <
        /h3> <
        /div>

        <
        div className = "bg-[#F8F7F0] text-center p-4 sm:p-6 rounded shadow" >
        <
        div className = "w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-yellow-400 rounded-full mb-4 sm:mb-6 text-2xl sm:text-3xl" > 🍃
        <
        /div> <
        h3 className = "font-semibold text-sm sm:text-base md:text-lg text-black" >
        100 % sản phẩm tự nhiên, an toàn <
        /h3> <
        /div> <
        /motion.div> <
        /div> <
        /div>


        { /* Giới thiệu các mặt hàng */ } <
        section className = "py-16 text-center" >
        <
        span className = "px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium" > 🌿Dịch vụ phổ biến nhất <
        /span> <
        h2 className = "text-3xl font-bold text-gray-900 mt-4" >
        Các sản phẩm hàng đầu trong nông nghiệp bền vững <
        /h2>

        <
        div className = "mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto" > {
            services.map((service, i) => ( <
                div key = { i }
                className = "relative rounded overflow-hidden shadow-lg group"
                style = {
                    { minHeight: '288px' } } // giữ chiều cao tối thiểu bằng h-72
                >
                <
                img src = { service.img }
                alt = { service.title }
                className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /
                >
                <
                div className = "absolute bottom-0 left-0 right-0 bg-green-600 text-white p-4 flex items-center justify-between" >
                <
                div className = "text-left" >
                <
                h3 className = "font-semibold" > { service.title } < /h3> <
                p className = "text-sm" > { service.desc } < /p> <
                /div> <
                div className = "w-10 h-10 bg-green-900 flex items-center justify-center rounded-full" >
                <
                ArrowUpRight className = "w-5 h-5" / >
                <
                /div> <
                /div> <
                /div>
            ))
        } <
        /div> <
        /section>

        { /* sản phẩm giới thiệu */ } <
        div className = "max-w-7xl mx-auto px-4 py-10" >
        <
        h2 className = "text-3xl font-bold text-center mb-8 text-green-800" > 🛒Sản phẩm nông nghiệp nổi bật <
        /h2> <
        div className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" > {
            products.map((product, index) => ( <
                div key = { index }
                className = "bg-white rounded-lg shadow hover:shadow-lg transition p-4" >
                <
                img src = { product.img }
                alt = { product.name }
                className = "w-full h-48 object-cover rounded" /
                >
                <
                h3 className = "text-lg font-semibold mt-3 text-green-700" > { product.name } <
                /h3> <
                p className = "text-sm text-gray-600" > { product.desc } < /p> <
                p className = "text-red-600 font-bold mt-2" > { product.price } < /p> <
                button className = "mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700" >
                Mua ngay <
                /button> <
                /div>
            ))
        } <
        /div> <
        /div> { /* phản hồi khác hàng */ } <
        div className = "max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8" >

        { /* Heading */ } <
        motion.div className = "flex flex-col md:flex-row items-center justify-center gap-3 mt-8 text-center md:text-left"
        initial = {
            { y: -100, opacity: 0 } }
        whileInView = {
            { y: 0, opacity: 1 } }
        transition = {
            { duration: 0.8, ease: "easeOut" } }
        viewport = {
            { once: true, amount: 0.5 } } >
        <
        h2 className = "text-4xl md:text-5xl font-bold text-black" >
        Phản hồi <
        /h2> <
        h3 className = "text-4xl md:text-5xl font-bold text-black relative inline-block" >
        khách hàng <
        span className = "absolute left-0 bottom-1 w-full h-3 bg-yellow-300 -z-10" > < /span> <
        /h3> <
        /motion.div>

        { /* Testimonials */ } <
        div className = "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1588px] mx-auto bg-white p-6 lg:p-12 rounded-md" > {
            [{
                    text: "Sản phẩm nông sản tươi ngon, chất lượng vượt trội. Giao hàng nhanh và đóng gói cẩn thận, rất hài lòng.",
                    name: "Trần Thị B",
                    address: "Huyện Bình Chánh, HCM",
                    avatar: "https://via.placeholder.com/80",
                    bgColor: "#FFFFFF",
                    textColor: "#000000",
                    iconColor: "#16A34A",
                    dividerColor: "rgba(0,0,0,0.1)"
                },
                {
                    text: "Tôi rất ấn tượng với rau củ hữu cơ, hoàn toàn không hóa chất. Đặt lần đầu đã muốn đặt tiếp lần hai.",
                    name: "Nguyễn Văn C",
                    address: "Quận 1, HCM",
                    avatar: "https://via.placeholder.com/80",
                    bgColor: "#4F9CF9",
                    textColor: "#FFFFFF",
                    iconColor: "#FFFFFF",
                    dividerColor: "rgba(255,255,255,0.6)"
                },
                {
                    text: "Dịch vụ tư vấn nhiệt tình, nông sản đảm bảo chất lượng và đúng cam kết. Cảm ơn đội ngũ!",
                    name: "Lê Thị D",
                    address: "Quận 7, HCM",
                    avatar: "https://via.placeholder.com/80",
                    bgColor: "#FFFFFF",
                    textColor: "#000000",
                    iconColor: "#16A34A",
                    dividerColor: "rgba(0,0,0,0.1)"
                }
            ].map((item, i) => ( <
                Box key = { i }
                sx = {
                    {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "translateY(-10px)" },
                        p: 2,
                    }
                } >
                <
                Card sx = {
                    {
                        width: "100%",
                        maxWidth: 420,
                        bgcolor: item.bgColor,
                        color: item.textColor,
                        borderRadius: 4,
                        boxShadow: 5,
                        p: 3,
                    }
                } >
                <
                CardContent sx = {
                    { textAlign: "left", p: 0 } } >
                <
                FormatQuoteIcon sx = {
                    { fontSize: { xs: 40, md: 50 }, color: item.iconColor, mb: 1 } }
                /> <
                Typography variant = "body1"
                sx = {
                    { mb: 2, fontSize: { xs: 16, md: 18 } } } > { item.text } <
                /Typography> <
                Divider sx = {
                    { my: 2, borderColor: item.dividerColor } }
                /> <
                Box sx = {
                    { display: "flex", alignItems: "center", mt: 2 } } >
                <
                Avatar src = { item.avatar }
                sx = {
                    { width: { xs: 50, md: 56 }, height: { xs: 50, md: 56 }, mr: 2 } }
                /> <
                Box >
                <
                Typography variant = "subtitle1"
                sx = {
                    { fontWeight: "bold" } } > { item.name } <
                /Typography> <
                Typography variant = "body2"
                color = "text.secondary" > { item.address } <
                /Typography> <
                /Box> <
                /Box> <
                /CardContent> <
                /Card> <
                /Box>
            ))
        } <
        /div> <
        /div>

        <
        />
    );
};

export default Main;
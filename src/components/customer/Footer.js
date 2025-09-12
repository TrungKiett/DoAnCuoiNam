import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPinterestP } from "react-icons/fa";

const Footer = () => {
    return ( <
        footer className = "bg-green-950 text-white" >
        <
        div className = "max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10" > { /* Logo + mô tả */ } <
        div >
        <
        h2 className = "flex items-center gap-2 text-xl font-bold mb-4" >
        <
        span className = "text-yellow-400 text-2xl" > ◉ < /span> Agricko <
        /h2> <
        p className = "text-sm leading-6 mb-6" >
        Leading sustainable agriculture with innovative solutions
        for efficient, eco - friendly farming practices khoi 12 <
        /p> <
        div className = "flex gap-3" >
        <
        a href = "#"
        className = "p-2 border rounded-full hover:bg-yellow-400" >
        <
        FaFacebookF / >
        <
        /a> <
        a href = "#"
        className = "p-2 border rounded-full hover:bg-yellow-400" >
        <
        FaTwitter / >
        <
        /a> <
        a href = "#"
        className = "p-2 border rounded-full hover:bg-yellow-400" >
        <
        FaLinkedinIn / >
        <
        /a> <
        a href = "#"
        className = "p-2 border rounded-full hover:bg-yellow-400" >
        <
        FaPinterestP / >
        <
        /a> <
        /div> <
        /div>

        { /* Our Link */ } <
        div >
        <
        h3 className = "font-bold text-lg mb-4" > Our Link < /h3> <
        ul className = "space-y-3 text-sm" >
        <
        li > < a href = "#" > About us < /a></li >
        <
        li > < a href = "#" > Contact us < /a></li >
        <
        li > < a href = "#" > Products < /a></li >
        <
        li > < a href = "#" > Services < /a></li >
        <
        li > < a href = "#" > FAQ < /a></li >
        <
        /ul> <
        /div>

        { /* Address */ } <
        div >
        <
        h3 className = "font-bold text-lg mb-4" > Address < /h3> <
        ul className = "space-y-4 text-sm" >
        <
        li >
        <
        span className = "block font-semibold" > Location < /span>
        11 Wall Street, New York, NY <
        /li> <
        li >
        <
        span className = "block font-semibold" > Email < /span>
        info @validagricor.com <
        /li> <
        li >
        <
        span className = "block font-semibold" > Phone < /span> +
        123 76599854 <
        /li> <
        /ul> <
        /div>

        { /* Recent News */ } <
        div >
        <
        h3 className = "font-bold text-lg mb-4" > Recent News < /h3> <
        ul className = "space-y-5 text-sm" >
        <
        li className = "flex gap-3" >
        <
        img src = "https://via.placeholder.com/60"
        alt = "news1"
        className = "w-16 h-16 object-cover rounded" /
        >
        <
        div >
        <
        p className = "text-xs text-gray-400" > July 14, 2025 < /p> <
        a href = "#"
        className = "hover:text-yellow-400" >
        Current Trends in our new Agriculture Solution <
        /a> <
        /div> <
        /li> <
        li className = "flex gap-3" >
        <
        img src = "https://via.placeholder.com/60"
        alt = "news2"
        className = "w-16 h-16 object-cover rounded" /
        >
        <
        div >
        <
        p className = "text-xs text-gray-400" > July 14, 2025 < /p> <
        a href = "#"
        className = "hover:text-yellow-400" >
        Recent Developments in New Farming Idea <
        /a> <
        /div> <
        /li> <
        /ul> <
        /div> <
        /div>

        { /* Bottom */ } <
        div className = "border-t border-gray-700 py-6 text-sm flex flex-col md:flex-row justify-between items-center px-6" >
        <
        p > ©2025 All rights reserved by Pixelfit < /p> <
        div className = "flex gap-6 mt-3 md:mt-0" >
        <
        a href = "#" > Privacy Policy < /a> <
        a href = "#" > Terms & Condition < /a> <
        a href = "#" > Legal < /a> <
        /div> <
        /div> <
        /footer>
    );
};

export default Footer;
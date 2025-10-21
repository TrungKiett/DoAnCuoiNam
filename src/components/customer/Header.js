 import { useState, useEffect } from "react";
import { ChevronDown, Search, ShoppingCart, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MenuMui from "@mui/material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import FarmerLoginModal from "../auth/FarmerLoginModal";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFarmerLogin, setShowFarmerLogin] = useState(false);
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Trang chủ", hasDropdown: false },
    { name: "Sản phẩm", hasDropdown: true },
    { name: "Giới thiệu", hasDropdown: false },
    { name: "Tin tức", hasDropdown: true },
    { name: "Liên hệ", hasDropdown: false },
  ];

  // MUI menu handler
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Handle farmer login
  const handleFarmerClick = () => {
    setAnchorEl(null);
    setShowFarmerLogin(true);
  };

  const handleFarmerLoginSuccess = (userData) => {
    const role = userData?.vai_tro || localStorage.getItem('user_role');
    if (role === 'quan_ly') {
      navigate('/admin/dashboard');
    } else if (role === 'nong_dan') {
      navigate('/farmer/Dashboard');
    } else {
      navigate('/');
    }
  };

  // Toggle dropdown mobile
  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200"
        : "bg-white shadow-sm border-b border-gray-100"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="relative1 ">
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">YenSon Farm</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors duration-200 py-2">
                  <span className="font-medium">{item.name}</span>
                  {item.hasDropdown && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === index ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </button>

                {item.hasDropdown && activeDropdown === index && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {item.name === "Sản phẩm" && (
                      <>
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-green-50">
                          Rau củ sạch
                        </a>
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-green-50">
                          Trái cây hữu cơ
                        </a>
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-green-50">
                          Ngũ cốc & hạt
                        </a>
                      </>
                    )}

                    {item.name === "Tin tức" && (
                      <>
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-green-50">
                          Xu hướng nông nghiệp
                        </a>
                        <a href="#" className="block px-4 py-2 text-sm hover:bg-green-50">
                          Bí quyết trồng trọt
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white bg-gray-800 hover:bg-gray-700 rounded-full">
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-white bg-gray-800 hover:bg-gray-700 rounded-full relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* <button className="hidden md:block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
              Đặt hàng ngay
            </button> */}

            {/* User Login Menu */}
            <div>
              <IconButton
                sx={{ width: 40, height: 40 }}
                aria-label="account menu"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle sx={{ fontSize: 35 }} />
              </IconButton>

              <MenuMui
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleFarmerClick}>Admin</MenuItem>
                <MenuItem onClick={handleFarmerClick}>Nông dân</MenuItem>

                {/* <MenuItem onClick={handleClose}>Khách hàng</MenuItem> */}
              </MenuMui>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-sm">
            <nav className="space-y-2">
              {navItems.map((item, index) => (
                <div key={item.name}>
                  <button
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => toggleDropdown(index)}
                  >
                    <span className="font-medium">{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${activeDropdown === index ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>

                  {item.hasDropdown && activeDropdown === index && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.name === "Sản phẩm" && (
                        <>
                          <a href="#" className="block px-3 py-2 text-sm hover:bg-green-50">
                            Rau củ sạch
                          </a>
                          <a href="#" className="block px-3 py-2 text-sm hover:bg-green-50">
                            Trái cây hữu cơ
                          </a>
                          <a href="#" className="block px-3 py-2 text-sm hover:bg-green-50">
                            Ngũ cốc & hạt
                          </a>
                        </>
                      )}

                      {item.name === "Tin tức" && (
                        <>
                          <a href="#" className="block px-3 py-2 text-sm hover:bg-green-50">
                            Xu hướng nông nghiệp
                          </a>
                          <a href="#" className="block px-3 py-2 text-sm hover:bg-green-50">
                            Bí quyết trồng trọt
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
                  Đặt hàng ngay
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Farmer Login Modal */}
      <FarmerLoginModal
        open={showFarmerLogin}
        onClose={() => setShowFarmerLogin(false)}
        onLoginSuccess={handleFarmerLoginSuccess}
      />
    </header>
  );
}

-- Database schema cho hệ thống quản lý nông trại
-- Tạo database
CREATE DATABASE IF NOT EXISTS farm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farm;

-- Bảng nông dân
CREATE TABLE IF NOT EXISTS nong_dan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng lô trồng
CREATE TABLE IF NOT EXISTS lo_trong (
    ma_lo_trong INT PRIMARY KEY,
    ten_lo VARCHAR(100) NOT NULL,
    vi_tri VARCHAR(255),
    dien_tich DECIMAL(10,2),
    toa_do_lat DECIMAL(10,6),
    toa_do_lng DECIMAL(10,6),
    trang_thai ENUM('san_sang', 'dang_chuan_bi', 'chua_bat_dau', 'dang_canh_tac', 'hoan_thanh', 'can_bao_tri') DEFAULT 'san_sang',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng kế hoạch sản xuất
CREATE TABLE IF NOT EXISTS ke_hoach_san_xuat (
    ma_ke_hoach INT AUTO_INCREMENT PRIMARY KEY,
    ma_lo_trong INT NOT NULL,
    dien_tich_trong DECIMAL(10,2) NOT NULL,
    ngay_du_kien_thu_hoach DATE,
    trang_thai ENUM('chuan_bi', 'dang_trong', 'da_thu_hoach') NOT NULL,
    ma_nong_dan INT,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_lo_trong) REFERENCES lo_trong(ma_lo_trong) ON DELETE CASCADE,
    FOREIGN KEY (ma_nong_dan) REFERENCES nong_dan(id) ON DELETE SET NULL
);

-- Bảng lịch làm việc
CREATE TABLE IF NOT EXISTS lich_lam_viec (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_ke_hoach INT NOT NULL,
    ten_cong_viec VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    trang_thai ENUM('chua_bat_dau', 'dang_thuc_hien', 'hoan_thanh', 'bi_hoan') DEFAULT 'chua_bat_dau',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_ke_hoach) REFERENCES ke_hoach_san_xuat(ma_ke_hoach) ON DELETE CASCADE
);

-- Bảng người dùng hệ thống
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'farmer', 'customer') DEFAULT 'customer',
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu
-- Thêm nông dân mẫu
INSERT INTO nong_dan (id, full_name, phone, email, address) VALUES
(1, 'Nguyễn Văn An', '0123456789', 'an.nguyen@email.com', '123 Đường ABC, Quận 1, TP.HCM'),
(2, 'Trần Thị Bình', '0987654321', 'binh.tran@email.com', '456 Đường XYZ, Quận 2, TP.HCM'),
(3, 'Lê Văn Cường', '0369852147', 'cuong.le@email.com', '789 Đường DEF, Quận 3, TP.HCM');

-- Thêm lô trồng mẫu
INSERT INTO lo_trong (ma_lo_trong, ten_lo, vi_tri, dien_tich, toa_do_lat, toa_do_lng, trang_thai) VALUES
(1, 'Lô A1', 'Khu vực Bắc', 2.5, 10.8245, 106.6302, 'san_sang'),
(2, 'Lô A2', 'Khu vực Đông', 3.2, 10.8235, 106.6315, 'dang_chuan_bi'),
(3, 'Lô A3', 'Khu vực Nam', 1.8, 10.8225, 106.6305, 'chua_bat_dau'),
(4, 'Lô B1', 'Khu vực Tây', 4.1, 10.8238, 106.6285, 'dang_canh_tac'),
(5, 'Lô B2', 'Khu vực Trung tâm', 2.8, 10.8232, 106.6295, 'hoan_thanh'),
(6, 'Lô B3', 'Khu vực Đông Bắc', 3.5, 10.8242, 106.6312, 'can_bao_tri');

-- Thêm kế hoạch sản xuất mẫu
INSERT INTO ke_hoach_san_xuat (ma_lo_trong, dien_tich_trong, ngay_du_kien_thu_hoach, trang_thai, ma_nong_dan, ghi_chu) VALUES
(1, 2.5, '2024-06-15', 'chuan_bi', 1, 'Trồng ngô vụ hè'),
(2, 3.2, '2024-07-20', 'dang_trong', 2, 'Trồng lúa chất lượng cao'),
(4, 4.1, '2024-05-30', 'dang_trong', 3, 'Trồng rau xanh hữu cơ');

-- Thêm lịch làm việc mẫu
INSERT INTO lich_lam_viec (ma_ke_hoach, ten_cong_viec, mo_ta, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES
(1, 'Chuẩn bị đất', 'Cày bừa và bón phân lót', '2024-03-01', '2024-03-05', 'hoan_thanh'),
(1, 'Gieo hạt', 'Gieo hạt ngô theo hàng', '2024-03-06', '2024-03-08', 'dang_thuc_hien'),
(2, 'Chuẩn bị đất', 'Cày bừa và bón phân lót', '2024-03-10', '2024-03-15', 'chua_bat_dau'),
(3, 'Chuẩn bị đất', 'Cày bừa và bón phân lót', '2024-02-20', '2024-02-25', 'hoan_thanh');

-- Thêm user admin mẫu
INSERT INTO users (username, password, full_name, role, phone, email) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', '0123456789', 'admin@farm.com'),
('farmer1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nông dân 1', 'farmer', '0987654321', 'farmer1@farm.com');

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX idx_ke_hoach_ma_lo_trong ON ke_hoach_san_xuat(ma_lo_trong);
CREATE INDEX idx_ke_hoach_ma_nong_dan ON ke_hoach_san_xuat(ma_nong_dan);
CREATE INDEX idx_ke_hoach_trang_thai ON ke_hoach_san_xuat(trang_thai);
CREATE INDEX idx_lich_lam_viec_ma_ke_hoach ON lich_lam_viec(ma_ke_hoach);
CREATE INDEX idx_lo_trong_trang_thai ON lo_trong(trang_thai);

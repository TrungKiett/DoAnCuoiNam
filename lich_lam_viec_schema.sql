-- Bảng lịch làm việc cho hệ thống quản lý nông trại
-- Tạo bảng lich_lam_viec với cấu trúc phù hợp

CREATE TABLE IF NOT EXISTS lich_lam_viec (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ma_ke_hoach INT NOT NULL,
    ten_cong_viec VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    loai_cong_viec ENUM('chuan_bi_dat', 'gieo_trong', 'cham_soc', 'tuoi_tieu', 'bon_phan', 'phun_thuoc', 'thu_hoach', 'bao_tri', 'khac') NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    thoi_gian_du_kien INT DEFAULT 1 COMMENT 'Số ngày dự kiến hoàn thành',
    trang_thai ENUM('chua_bat_dau', 'dang_thuc_hien', 'hoan_thanh', 'bi_hoan', 'huy_bo') DEFAULT 'chua_bat_dau',
    uu_tien ENUM('thap', 'trung_binh', 'cao', 'khan_cap') DEFAULT 'trung_binh',
    ma_nhan_vien_thuc_hien INT,
    ghi_chu TEXT,
    ket_qua TEXT COMMENT 'Kết quả thực hiện công việc',
    hinh_anh TEXT COMMENT 'Đường dẫn hình ảnh minh chứng',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ma_ke_hoach) REFERENCES ke_hoach_san_xuat(ma_ke_hoach) ON DELETE CASCADE,
    FOREIGN KEY (ma_nhan_vien_thuc_hien) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_ma_ke_hoach (ma_ke_hoach),
    INDEX idx_ngay_bat_dau (ngay_bat_dau),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_loai_cong_viec (loai_cong_viec)
);

-- Thêm dữ liệu mẫu cho lịch làm việc
INSERT INTO lich_lam_viec (
    ma_ke_hoach, 
    ten_cong_viec, 
    mo_ta, 
    loai_cong_viec, 
    ngay_bat_dau, 
    ngay_ket_thuc, 
    thoi_gian_du_kien, 
    trang_thai, 
    uu_tien, 
    ghi_chu
) VALUES 
-- Lịch làm việc cho kế hoạch 1 (Lô 1 - Trồng ngô)
(1, 'Chuẩn bị đất trồng', 'Cày bừa, làm sạch cỏ dại, bón phân lót', 'chuan_bi_dat', '2024-03-01', '2024-03-05', 5, 'hoan_thanh', 'cao', 'Đã hoàn thành đúng tiến độ'),
(1, 'Gieo hạt ngô', 'Gieo hạt ngô theo hàng, khoảng cách 25cm', 'gieo_trong', '2024-03-06', '2024-03-08', 3, 'hoan_thanh', 'cao', 'Gieo 2.5ha, sử dụng máy gieo hạt'),
(1, 'Tưới nước lần 1', 'Tưới nước sau khi gieo hạt', 'tuoi_tieu', '2024-03-09', '2024-03-09', 1, 'hoan_thanh', 'trung_binh', 'Tưới đủ ẩm cho hạt nảy mầm'),
(1, 'Bón phân lần 1', 'Bón phân NPK 16-16-8', 'bon_phan', '2024-03-20', '2024-03-20', 1, 'dang_thuc_hien', 'cao', 'Bón khi cây có 3-4 lá'),
(1, 'Phun thuốc trừ sâu', 'Phun thuốc trừ sâu bệnh', 'phun_thuoc', '2024-04-15', '2024-04-15', 1, 'chua_bat_dau', 'trung_binh', 'Phun thuốc phòng bệnh'),
(1, 'Thu hoạch ngô', 'Thu hoạch khi ngô chín', 'thu_hoach', '2024-06-10', '2024-06-15', 6, 'chua_bat_dau', 'cao', 'Dự kiến thu hoạch 2.5ha'),

-- Lịch làm việc cho kế hoạch 2 (Lô 2 - Trồng lúa)
(2, 'Chuẩn bị ruộng lúa', 'Cày bừa, san phẳng ruộng, tạo luống', 'chuan_bi_dat', '2024-03-10', '2024-03-15', 6, 'hoan_thanh', 'cao', 'Ruộng đã sẵn sàng'),
(2, 'Gieo mạ', 'Gieo mạ trong khay ươm', 'gieo_trong', '2024-03-16', '2024-03-18', 3, 'dang_thuc_hien', 'cao', 'Gieo mạ giống lúa ST25'),
(2, 'Cấy lúa', 'Cấy lúa từ mạ ra ruộng', 'gieo_trong', '2024-04-01', '2024-04-05', 5, 'chua_bat_dau', 'cao', 'Cấy với mật độ 20x20cm'),
(2, 'Tưới nước định kỳ', 'Tưới nước duy trì mực nước 5-7cm', 'tuoi_tieu', '2024-04-06', '2024-07-15', 100, 'chua_bat_dau', 'trung_binh', 'Tưới nước hàng ngày'),
(2, 'Bón phân lần 1', 'Bón phân đạm sau cấy 15 ngày', 'bon_phan', '2024-04-20', '2024-04-20', 1, 'chua_bat_dau', 'cao', 'Bón 50kg Urea/ha'),
(2, 'Bón phân lần 2', 'Bón phân đạm khi lúa đẻ nhánh', 'bon_phan', '2024-05-15', '2024-05-15', 1, 'chua_bat_dau', 'cao', 'Bón 30kg Urea/ha'),
(2, 'Phun thuốc trừ sâu', 'Phun thuốc trừ sâu bệnh', 'phun_thuoc', '2024-06-01', '2024-06-01', 1, 'chua_bat_dau', 'trung_binh', 'Phun thuốc phòng bệnh đạo ôn'),
(2, 'Thu hoạch lúa', 'Thu hoạch khi lúa chín 85%', 'thu_hoach', '2024-07-20', '2024-07-25', 6, 'chua_bat_dau', 'cao', 'Dự kiến thu hoạch 3.2ha'),

-- Lịch làm việc cho kế hoạch 3 (Lô 4 - Trồng rau)
(3, 'Chuẩn bị đất trồng rau', 'Cày bừa, bón phân hữu cơ', 'chuan_bi_dat', '2024-02-20', '2024-02-25', 6, 'hoan_thanh', 'cao', 'Đã chuẩn bị xong'),
(3, 'Gieo hạt rau', 'Gieo hạt rau xà lách, cải bó xôi', 'gieo_trong', '2024-02-26', '2024-02-28', 3, 'hoan_thanh', 'cao', 'Gieo theo luống'),
(3, 'Tưới nước hàng ngày', 'Tưới nước sáng và chiều', 'tuoi_tieu', '2024-03-01', '2024-05-25', 85, 'dang_thuc_hien', 'cao', 'Tưới đều đặn'),
(3, 'Bón phân hữu cơ', 'Bón phân hữu cơ vi sinh', 'bon_phan', '2024-03-15', '2024-03-15', 1, 'dang_thuc_hien', 'trung_binh', 'Bón phân hữu cơ 2 tuần/lần'),
(3, 'Thu hoạch rau', 'Thu hoạch rau non', 'thu_hoach', '2024-04-01', '2024-05-30', 60, 'dang_thuc_hien', 'cao', 'Thu hoạch liên tục'),
(3, 'Bảo trì hệ thống tưới', 'Kiểm tra và sửa chữa hệ thống tưới', 'bao_tri', '2024-06-01', '2024-06-02', 2, 'chua_bat_dau', 'trung_binh', 'Bảo trì định kỳ');

-- Tạo view để dễ dàng truy vấn lịch làm việc
CREATE VIEW v_lich_lam_viec_chi_tiet AS
SELECT 
    llv.id,
    llv.ten_cong_viec,
    llv.mo_ta,
    llv.loai_cong_viec,
    llv.ngay_bat_dau,
    llv.ngay_ket_thuc,
    llv.thoi_gian_du_kien,
    llv.trang_thai,
    llv.uu_tien,
    llv.ghi_chu,
    llv.ket_qua,
    llv.hinh_anh,
    llv.created_at,
    llv.updated_at,
    khs.ma_ke_hoach,
    khs.ma_lo_trong,
    lt.ten_lo,
    lt.vi_tri,
    u.full_name as nhan_vien_thuc_hien
FROM lich_lam_viec llv
LEFT JOIN ke_hoach_san_xuat khs ON llv.ma_ke_hoach = khs.ma_ke_hoach
LEFT JOIN lo_trong lt ON khs.ma_lo_trong = lt.ma_lo_trong
LEFT JOIN users u ON llv.ma_nhan_vien_thuc_hien = u.id;

-- Tạo stored procedure để lấy lịch làm việc theo kế hoạch
DELIMITER //
CREATE PROCEDURE GetLichLamViecByKeHoach(IN p_ma_ke_hoach INT)
BEGIN
    SELECT 
        llv.*,
        lt.ten_lo,
        lt.vi_tri,
        u.full_name as nhan_vien_thuc_hien
    FROM lich_lam_viec llv
    LEFT JOIN ke_hoach_san_xuat khs ON llv.ma_ke_hoach = khs.ma_ke_hoach
    LEFT JOIN lo_trong lt ON khs.ma_lo_trong = lt.ma_lo_trong
    LEFT JOIN users u ON llv.ma_nhan_vien_thuc_hien = u.id
    WHERE llv.ma_ke_hoach = p_ma_ke_hoach
    ORDER BY llv.ngay_bat_dau ASC;
END //
DELIMITER ;

-- Tạo stored procedure để cập nhật trạng thái công việc
DELIMITER //
CREATE PROCEDURE UpdateTrangThaiCongViec(
    IN p_id INT,
    IN p_trang_thai VARCHAR(20),
    IN p_ket_qua TEXT,
    IN p_ghi_chu TEXT
)
BEGIN
    UPDATE lich_lam_viec 
    SET 
        trang_thai = p_trang_thai,
        ket_qua = p_ket_qua,
        ghi_chu = p_ghi_chu,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- Tạo trigger để tự động cập nhật thời gian
DELIMITER //
CREATE TRIGGER tr_lich_lam_viec_update
BEFORE UPDATE ON lich_lam_viec
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Tạo index để tối ưu hiệu suất
CREATE INDEX idx_lich_lam_viec_ngay ON lich_lam_viec(ngay_bat_dau, ngay_ket_thuc);
CREATE INDEX idx_lich_lam_viec_trang_thai_uu_tien ON lich_lam_viec(trang_thai, uu_tien);
CREATE INDEX idx_lich_lam_viec_loai_cong_viec ON lich_lam_viec(loai_cong_viec);

-- Thêm comment cho bảng
ALTER TABLE lich_lam_viec COMMENT = 'Bảng quản lý lịch làm việc chi tiết cho từng kế hoạch sản xuất';

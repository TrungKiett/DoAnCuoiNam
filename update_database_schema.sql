-- Cập nhật database schema để cho phép ma_ke_hoach có thể NULL
USE farm;

-- Cập nhật bảng lich_lam_viec để cho phép ma_ke_hoach có thể NULL
ALTER TABLE lich_lam_viec MODIFY COLUMN ma_ke_hoach INT NULL;

-- Thêm các cột mới cho chức năng lịch làm việc
ALTER TABLE lich_lam_viec 
ADD COLUMN IF NOT EXISTS loai_cong_viec ENUM('chuan_bi_dat', 'gieo_trong', 'cham_soc', 'tuoi_nuoc', 'bon_phan', 'thu_hoach', 'khac') DEFAULT 'khac' AFTER mo_ta,
ADD COLUMN IF NOT EXISTS thoi_gian_du_kien INT DEFAULT 1 COMMENT 'Số ngày dự kiến hoàn thành' AFTER ngay_ket_thuc,
ADD COLUMN IF NOT EXISTS uu_tien ENUM('thap', 'trung_binh', 'cao', 'khan_cap') DEFAULT 'trung_binh' AFTER trang_thai,
ADD COLUMN IF NOT EXISTS ma_nhan_vien_thuc_hien INT NULL COMMENT 'Mã nhân viên thực hiện' AFTER uu_tien,
ADD COLUMN IF NOT EXISTS ket_qua TEXT NULL COMMENT 'Kết quả thực hiện công việc' AFTER ghi_chu,
ADD COLUMN IF NOT EXISTS hinh_anh TEXT NULL COMMENT 'Đường dẫn hình ảnh minh chứng' AFTER ket_qua;

-- Cập nhật comment cho bảng
ALTER TABLE lich_lam_viec COMMENT = 'Bảng lịch làm việc - cho phép tạo công việc độc lập không cần kế hoạch sản xuất';

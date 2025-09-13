# Hướng dẫn cài đặt Database cho hệ thống quản lý nông trại

## Bước 1: Tạo Database

1. Mở phpMyAdmin (http://localhost/phpmyadmin)
2. Tạo database mới tên `farm`
3. Import file `database_schema.sql` vào database `farm`

## Bước 2: Cấu hình kết nối

File `api/config.php` đã được cấu hình sẵn:
- Host: localhost
- Database: farm
- Username: root
- Password: (để trống)

## Bước 3: Kiểm tra kết nối

1. Chạy ứng dụng React: `npm start`
2. Vào trang "Lập kế hoạch sản xuất"
3. Nhấn nút "Test kết nối" để kiểm tra

## Cấu trúc Database

### Bảng `lo_trong` (Lô trồng)
- `ma_lo_trong`: Mã lô trồng (Primary Key)
- `ten_lo`: Tên lô
- `vi_tri`: Vị trí lô
- `dien_tich`: Diện tích (ha)
- `toa_do_lat`, `toa_do_lng`: Tọa độ GPS
- `trang_thai`: Trạng thái lô

### Bảng `ke_hoach_san_xuat` (Kế hoạch sản xuất)
- `ma_ke_hoach`: Mã kế hoạch (Auto Increment)
- `ma_lo_trong`: Mã lô trồng (Foreign Key)
- `dien_tich_trong`: Diện tích trồng
- `ngay_du_kien_thu_hoach`: Ngày dự kiến thu hoạch
- `trang_thai`: Trạng thái kế hoạch
- `ma_nong_dan`: Mã nông dân
- `ghi_chu`: Ghi chú

### Bảng `nong_dan` (Nông dân)
- `id`: Mã nông dân (Auto Increment)
- `full_name`: Họ tên
- `phone`: Số điện thoại
- `email`: Email
- `address`: Địa chỉ

## Dữ liệu mẫu

Database đã có sẵn dữ liệu mẫu:
- 6 lô trồng (A1-A3, B1-B3)
- 3 nông dân
- 3 kế hoạch sản xuất mẫu

## Lưu ý

- Dữ liệu sẽ được lưu trữ vĩnh viễn trong database
- Khi nhấn F5, dữ liệu sẽ không bị mất
- Có thể thêm/sửa/xóa dữ liệu thông qua giao diện web

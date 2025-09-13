# Hướng dẫn sử dụng giao diện Calendar cho chức năng "Xây dựng lịch làm việc"

## Tổng quan

Giao diện calendar mới được thiết kế dựa trên Google Calendar với các tính năng chính:

### 🎯 Tính năng chính

1. **Giao diện tuần (Weekly View)**
   - Hiển thị 7 ngày trong tuần từ thứ 2 đến chủ nhật
   - Khung giờ làm việc từ 6:00 - 22:00
   - Công việc được hiển thị dưới dạng blocks màu sắc

2. **Sidebar bên trái**
   - Mini calendar để điều hướng tháng
   - Nút "Tạo" để tạo công việc mới
   - Danh sách các loại lịch với checkbox
   - Nút tìm kiếm

3. **Hiển thị công việc**
   - Mỗi loại công việc có màu sắc riêng
   - Tooltip hiển thị tên công việc khi hover
   - Click vào công việc để xem chi tiết

4. **Form tạo/chỉnh sửa công việc**
   - Popup form đầy đủ các trường thông tin
   - Upload hình ảnh
   - Chọn nhân công thực hiện
   - Thiết lập ưu tiên và trạng thái

## 🚀 Cách sử dụng

### 1. Chuyển đổi chế độ xem
- **Tuần**: Giao diện calendar tuần mới (mặc định)
- **Tháng**: Giao diện calendar tháng cũ
- **Danh sách**: Hiển thị dạng bảng

### 2. Tạo công việc mới
1. Click nút "Tạo" ở sidebar bên trái
2. Hoặc click vào ngày bất kỳ trong calendar
3. Điền thông tin trong form popup
4. Click "Tạo mới" để lưu

### 3. Xem chi tiết công việc
1. Click vào block công việc trong calendar
2. Xem thông tin đầy đủ trong popup
3. Click "Chỉnh sửa" để sửa đổi

### 4. Điều hướng
- **Mũi tên trái/phải**: Chuyển tuần
- **Nút "Hôm nay"**: Về tuần hiện tại
- **Click ngày trong mini calendar**: Chuyển đến ngày đó

## 🎨 Màu sắc công việc

| Loại công việc | Màu sắc |
|----------------|---------|
| Chuẩn bị đất | 🟢 Xanh lá |
| Gieo trồng | 🔵 Xanh dương |
| Chăm sóc | 🟠 Cam |
| Tưới nước | 🔵 Xanh cyan |
| Bón phân | 🟣 Tím |
| Thu hoạch | 🔴 Đỏ |
| Khác | 🟤 Nâu |

## 📱 Responsive Design

- Giao diện được tối ưu cho màn hình desktop
- Sidebar có thể thu gọn
- Calendar tự động điều chỉnh kích thước

## 🔧 Cấu hình

### Thay đổi khung giờ làm việc
Sửa trong file `CalendarWeeklyView.js`:
```javascript
// Thay đổi từ 6:00-22:00 thành 8:00-20:00
for (let hour = 8; hour <= 20; hour++) {
    // ...
}
```

### Thay đổi màu sắc loại công việc
Sửa trong file `CalendarWeeklyView.js`:
```javascript
const taskTypes = [
    { value: 'chuan_bi_dat', label: 'Chuẩn bị đất', color: '#your-color' },
    // ...
];
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Calendar không hiển thị**
   - Kiểm tra console để xem lỗi
   - Đảm bảo API trả về đúng format

2. **Không tạo được công việc**
   - Kiểm tra kết nối API
   - Xem log trong Network tab

3. **Hình ảnh không hiển thị**
   - Kiểm tra đường dẫn file upload
   - Đảm bảo file tồn tại trong thư mục uploads

## 📁 Cấu trúc file

```
src/
├── components/admin/
│   └── CalendarWeeklyView.js    # Component calendar chính
├── pages/admin/
│   ├── WorkSchedule.js          # Trang quản lý lịch làm việc
│   └── CalendarDemo.js          # Trang demo calendar
└── services/
    └── api.js                   # API calls
```

## 🔄 Cập nhật

Để cập nhật giao diện calendar:

1. Sửa file `CalendarWeeklyView.js` cho component chính
2. Sửa file `WorkSchedule.js` để tích hợp
3. Test trên trang demo trước khi deploy

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console log
2. Xem Network tab để debug API
3. Liên hệ team phát triển

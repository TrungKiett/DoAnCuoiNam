# Hướng dẫn Setup Dự án Quản lý Nông trại

## Các lỗi đã được sửa

✅ **Router Issues**: Đã sửa lỗi import và export trong các file router
✅ **JSX Syntax**: Đã sửa lỗi cú pháp JSX trong Footer component
✅ **Component Structure**: Đã kiểm tra và sửa cấu trúc components

## Yêu cầu hệ thống

- **XAMPP** (Apache + MySQL + PHP)
- **Node.js** (phiên bản 16 trở lên)
- **npm** hoặc **yarn**

## Bước 1: Khởi động XAMPP

1. Mở **XAMPP Control Panel**
2. Khởi động **Apache** và **MySQL**
3. Kiểm tra:
   - Apache chạy trên port 80
   - MySQL chạy trên port 3306

## Bước 2: Setup Database

### Cách 1: Tự động (Khuyến nghị)
```bash
# Mở trình duyệt và truy cập:
http://localhost/doancuoinam/setup_database.php
```

### Cách 2: Thủ công
1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Tạo database mới tên `farm`
3. Import file `database_schema.sql`

## Bước 3: Khởi động React App

```bash
# Cài đặt dependencies (nếu chưa có)
npm install

# Khởi động development server
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Bước 4: Kiểm tra hoạt động

1. **Trang chủ**: http://localhost:3000
2. **Admin Dashboard**: http://localhost:3000/admin/dashboard
3. **Quản lý tài khoản**: http://localhost:3000/admin/accounts
4. **Lập kế hoạch sản xuất**: http://localhost:3000/admin/plans
5. **Lịch làm việc**: http://localhost:3000/admin/work-schedule

## Cấu trúc dự án

```
doancuoinam/
├── api/                    # Backend API (PHP)
│   ├── config.php         # Cấu hình database
│   ├── users.php          # API quản lý users
│   ├── farmers.php        # API quản lý nông dân
│   └── ...
├── src/                   # Frontend (React)
│   ├── components/        # React components
│   ├── pages/            # Các trang
│   ├── router/           # React Router
│   └── services/         # API services
├── database_schema.sql    # Schema database
└── setup_database.php    # Script setup tự động
```

## API Endpoints

- `GET /api/users.php` - Lấy danh sách users
- `POST /api/create_user.php` - Tạo user mới
- `POST /api/update_user.php` - Cập nhật user
- `POST /api/delete_user.php` - Xóa user
- `GET /api/farmers.php` - Lấy danh sách nông dân
- `GET /api/lo_trong_list.php` - Lấy danh sách lô trồng
- `POST /api/ke_hoach_san_xuat_create.php` - Tạo kế hoạch sản xuất

## Troubleshooting

### Lỗi PowerShell Execution Policy
```powershell
# Nếu gặp lỗi "running scripts is disabled on this system"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Lỗi "Cannot connect to database"
- Kiểm tra XAMPP có đang chạy không
- Kiểm tra MySQL service trong XAMPP Control Panel
- Kiểm tra port 3306 có bị chiếm dụng không

### Lỗi "API connection failed"
- Kiểm tra Apache có đang chạy không
- Kiểm tra file `api/config.php` có đúng cấu hình không
- Kiểm tra database `farm` có tồn tại không

### Lỗi React build
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
npm start
```

## Dữ liệu mẫu

Database đã có sẵn:
- **6 lô trồng** với tọa độ GPS
- **3 nông dân** mẫu
- **3 kế hoạch sản xuất** mẫu
- **4 công việc** trong lịch làm việc

## Tính năng chính

1. **Quản lý tài khoản**: Thêm/sửa/xóa users
2. **Lập kế hoạch sản xuất**: Tạo kế hoạch cho từng lô trồng
3. **Lịch làm việc**: Quản lý công việc theo kế hoạch
4. **Dashboard**: Thống kê tổng quan
5. **Responsive Design**: Hỗ trợ mobile và desktop

## Liên hệ hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. XAMPP có đang chạy đầy đủ không
2. Database `farm` có tồn tại không
3. Port 3000 và 80 có bị chiếm dụng không
4. Console browser có lỗi gì không

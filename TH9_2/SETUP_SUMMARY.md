# 📚 API Quản Lý Sinh Viên - Tóm Tắt & Hướng Dẫn

## 📁 Cấu Trúc Dự Án

```
TH9_2/
├── app.js                          # Main application
├── package.json                    # Dependencies
├── test.http                       # REST API tests
├── TESTING_GUIDE.md               # Detailed testing instructions
├── SETUP_SUMMARY.md               # This file
│
├── controllers/
│   ├── authController.js          # Login/Logout logic
│   ├── studentController.js       # CRUD + Stats
│   └── syncAsyncController.js     # Sync/Async demo
│
├── middlewares/
│   ├── authMiddleware.js          # API protection (requireLogin)
│   ├── errorHandler.js            # Global error handling
│   └── logger.js                  # Request logging
│
├── models/
│   ├── studentModel.js            # Data model
│   └── students.json              # (if needed)
│
└── routes/
    ├── authRoutes.js              # Login/Logout endpoints
    ├── studentRoutes.js           # CRUD endpoints
    └── syncAsyncRoutes.js         # Async demo endpoints
```

---

## 🚀 Khởi Động Nhanh

### 1️⃣ Cài đặt dependencies
```bash
npm install
```

### 2️⃣ Khởi động server
```bash
npm start
```
Server chạy tại: **http://localhost:3000**

### 3️⃣ Test API
- Mở file `test.http` trong VS Code
- Cài extension **REST Client** (Huachao Mao)
- Click "Send Request" trên các endpoint

---

## 🔐 Authentication & API Protection

### Credentials
- **Username:** `admin`
- **Password:** `123456`

### Protected Routes (yêu cầu đăng nhập)
```
GET    /students
GET    /students/:id
POST   /students
PUT    /students/:id
DELETE /students/:id
GET    /students/stats
GET    /students/stats/class
```

### Public Routes (không yêu cầu đăng nhập)
```
POST   /login
POST   /logout
GET    /heavy-sync     (demo)
GET    /heavy-async    (demo)
```

---

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Đăng nhập | ❌ |
| POST | `/logout` | Đăng xuất | ❌ |

### Students CRUD
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/students` | Lấy danh sách (hỗ trợ filter, sort, pagination) | ✅ |
| GET | `/students/:id` | Lấy chi tiết sinh viên | ✅ |
| POST | `/students` | Tạo mới sinh viên | ✅ |
| PUT | `/students/:id` | Cập nhật sinh viên | ✅ |
| DELETE | `/students/:id` | Xóa sinh viên (soft delete) | ✅ |

### Statistics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/students/stats` | Thống kê chung | ✅ |
| GET | `/students/stats/class` | Thống kê theo lớp | ✅ |

---

## ✨ Tính Năng Chính

### 1️⃣ Authentication & Authorization
- ✅ Login/Logout với session
- ✅ API protection middleware
- ✅ Session-based authentication

### 2️⃣ CRUD Operations
- ✅ Create: POST `/students` (với validation)
- ✅ Read: GET `/students` & GET `/students/:id`
- ✅ Update: PUT `/students/:id`
- ✅ Delete: DELETE `/students/:id` (soft delete)

### 3️⃣ Filtering
- ✅ Lọc theo tên: `?name=keyword`
- ✅ Lọc theo lớp: `?class=CNTT1`
- ✅ Kết hợp lọc: `?name=Van&class=CNTT1`

### 4️⃣ Sorting
- ✅ Sắp xếp tuổi giảm dần: `?sort=age_desc`

### 5️⃣ Pagination
- ✅ Phân trang: `?page=1&limit=10`
- ✅ Mặc định: page=1, limit=10

### 6️⃣ Soft Delete
- ✅ Dữ liệu không bị xóa vật lý, chỉ đánh dấu `isDeleted: true`
- ✅ Không hiển thị trong danh sách nhưng vẫn có trong database

### 7️⃣ Statistics
- ✅ Thống kê tổng, active, deleted, tuổi trung bình
- ✅ Thống kê theo lớp

### 8️⃣ Middleware
- ✅ Logger: ghi log mỗi request
- ✅ Auth Middleware: bảo vệ các route
- ✅ Error Handler: xử lý lỗi toàn cục
- ✅ Body Parser: đọc JSON

---

## 🧪 Validation Rules

### Tên (name)
- Bắt buộc
- Tối thiểu 2 ký tự

### Email (email)
- Bắt buộc
- Phải chứa '@'
- Không được trùng lặp

### Tuổi (age)
- Bắt buộc
- Từ 16 đến 60 tuổi

### Lớp (className)
- Bắt buộc

---

## 📊 Dữ Liệu Mẫu Ban Đầu

```json
[
    {
        "id": 1,
        "name": "Nguyen Van A",
        "email": "a@gmail.com",
        "age": 20,
        "class": "CNTT1",
        "isDeleted": false
    },
    {
        "id": 2,
        "name": "Tran Thi B",
        "email": "b@gmail.com",
        "age": 21,
        "class": "CNTT1",
        "isDeleted": false
    },
    {
        "id": 3,
        "name": "Le Van C",
        "email": "c@gmail.com",
        "age": 22,
        "class": "CNTT2",
        "isDeleted": false
    }
]
```

---

## 📋 Test Checklist

### ✅ Login & API Protection
- [ ] Đăng nhập thành công
- [ ] Login sai mật khẩu → 401
- [ ] Truy cập API không có session → 401
- [ ] Đăng xuất thành công

### ✅ CRUD Operations
- [ ] GET /students → danh sách
- [ ] GET /students/:id → chi tiết
- [ ] GET /students/999 → 404
- [ ] POST /students → tạo mới
- [ ] PUT /students/:id → cập nhật
- [ ] DELETE /students/:id → soft delete

### ✅ Validation
- [ ] Tên < 2 ký tự → 400
- [ ] Email không '@' → 400
- [ ] Email trùng → 400
- [ ] Tuổi < 16 hoặc > 60 → 400

### ✅ Filter & Sort & Pagination
- [ ] ?name=keyword → lọc tên
- [ ] ?class=CNTT1 → lọc lớp
- [ ] ?sort=age_desc → sắp xếp
- [ ] ?page=1&limit=2 → phân trang

### ✅ Soft Delete
- [ ] Xóa sinh viên → isDeleted=true
- [ ] Sinh viên xóa không xuất hiện
- [ ] Không thể lấy sinh viên đã xóa → 404

### ✅ Statistics
- [ ] /stats → tổng, active, deleted, tuổi TB
- [ ] /stats/class → đếm theo lớp

### ✅ Middleware
- [ ] Logger ghi log mỗi request
- [ ] Error Handler xử lý lỗi
- [ ] Auth Middleware bảo vệ route

---

## 🛠️ Middleware Details

### 1. logger.js
```javascript
// Ghi log format: [timestamp] METHOD URL
// Ví dụ: [2024-04-26T10:30:45.123Z] GET /students
```

### 2. authMiddleware.js (requireLogin)
```javascript
// Kiểm tra req.session.user
// Nếu không có → 401 Unauthorized
```

### 3. errorHandler.js
```javascript
// Bắt các lỗi không xử lý
// Trả về 500 + error message
```

---

## 💾 Data Persistence Note

⚠️ **Lưu ý:** Dữ liệu được lưu trong memory (`let students = [...]`). 
Khi restart server, dữ liệu sẽ reset về trạng thái ban đầu.

Để lưu dữ liệu vĩnh viễn, cần integrate với database (MongoDB, MySQL, etc.)

---

## 🔗 Query Parameters Combinations

### Ví dụ thực tế:
```
GET /students?name=Van&class=CNTT1&sort=age_desc&page=1&limit=5
```

Kết quả:
1. Lọc sinh viên có tên chứa "Van"
2. Lọc lớp CNTT1
3. Sắp xếp tuổi giảm dần
4. Lấy trang 1, 5 kết quả/trang

---

## 📞 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| Port 3000 đã bị dùng | Thay port trong app.js hoặc kill process |
| Lỗi "Cannot find module" | Chạy `npm install` |
| Session mất sau restart | Bình thường, data in-memory |
| CORS error | Không cần cho REST Client |
| Email validation sai | Email phải chứa '@' và không trùng |

---

## 📖 Tham khảo

- **REST Client Extension:** REST Client (Huachao Mao)
- **Express Documentation:** https://expressjs.com
- **Express Session:** https://github.com/expressjs/session
- **Node.js HTTP Methods:** GET, POST, PUT, DELETE

---

## ✅ Kết Luận

Ứng dụng này demonstraste:
- ✅ Authentication & Authorization
- ✅ CRUD Operations
- ✅ Input Validation
- ✅ Filtering, Sorting, Pagination
- ✅ Soft Delete
- ✅ Middleware
- ✅ Statistics
- ✅ Error Handling
- ✅ Session Management

**Bạn đã sẵn sàng test API!** 🚀
Mở `test.http` và bắt đầu gửi requests.

---

**Ngày tạo:** 26/04/2024
**Version:** 1.0

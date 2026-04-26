# 🎓 API Quản Lý Sinh Viên - Node.js/Express

Ứng dụng API REST hoàn chỉnh với xác thực, CRUD, lọc, sắp xếp, phân trang, soft delete và middleware.

---

## 📂 Cấu trúc thư mục

```
TH9_2/
├── app.js                      # Server chính
├── package.json                # Dependencies
├── test.http                   # 50+ test cases (sử dụng REST Client)
│
├── 📚 Tài liệu (READ THESE):
│   ├── README.md              # File này
│   ├── SETUP_SUMMARY.md       # Tóm tắt nhanh
│   ├── QUICK_REFERENCE.md     # Reference API
│   ├── TESTING_GUIDE.md       # Hướng dẫn test chi tiết
│   └── VERIFICATION_CHECKLIST.md # Kiểm định tính năng
│
├── controllers/
│   ├── authController.js      # Login/Logout
│   ├── studentController.js   # CRUD + Stats
│   └── syncAsyncController.js # Async demo
│
├── middlewares/
│   ├── authMiddleware.js      # Bảo vệ API
│   ├── errorHandler.js        # Xử lý lỗi
│   └── logger.js              # Ghi log
│
├── models/
│   ├── studentModel.js        # Data model
│   └── students.json          # (optional)
│
└── routes/
    ├── authRoutes.js          # /login, /logout
    ├── studentRoutes.js       # /students CRUD
    └── syncAsyncRoutes.js     # Async demo
```

---

## 🚀 Khởi Động Nhanh (3 bước)

### 1️⃣ Cài đặt
```bash
npm install
```

### 2️⃣ Chạy
```bash
npm start
```
> Server sẽ chạy tại `http://localhost:3000`

### 3️⃣ Test
- Mở file `test.http`
- Cài extension **REST Client** (Huachao Mao)
- Click "Send Request" trên các endpoint

---

## 📋 Tính Năng Chính

✅ **Xác thực & Bảo vệ**
- Login/Logout session-based
- API protection middleware
- 401 errors khi không đăng nhập

✅ **CRUD Operations**
- Create: `POST /students` (với validation)
- Read: `GET /students`, `GET /students/:id`
- Update: `PUT /students/:id`
- Delete: `DELETE /students/:id` (soft delete)

✅ **Filtering**
- Lọc theo tên: `?name=keyword`
- Lọc theo lớp: `?class=CNTT1`
- Kết hợp: `?name=Van&class=CNTT1`

✅ **Sorting**
- Sắp xếp tuổi: `?sort=age_desc`

✅ **Pagination**
- Phân trang: `?page=1&limit=10`
- Mặc định: page=1, limit=10

✅ **Soft Delete**
- Xóa mềm (`isDeleted: true`)
- Dữ liệu vẫn tồn tại trong DB
- Có thể khôi phục

✅ **Statistics**
- Thống kê chung: total, active, deleted, tuổi TB
- Thống kê theo lớp

✅ **Middleware**
- Logger: ghi log tất cả requests
- Auth Middleware: bảo vệ routes
- Error Handler: xử lý lỗi toàn cục
- Body Parser: đọc JSON

---

## 🔐 Đăng Nhập

**Credentials:**
- Username: `admin`
- Password: `123456`

**Test:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

---

## 📚 Hướng Dẫn & Tài Liệu

### 👉 Bắt Đầu
1. **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - Tóm tắt setup & endpoints
2. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Reference nhanh API

### 📖 Hướng Dẫn Chi Tiết
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Test từng tính năng chi tiết
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Kiểm định hoàn chỉnh

### 🧪 Test Cases
- **[test.http](test.http)** - 50+ test cases sẵn sàng chạy

---

## 📊 API Endpoints

### 🔑 Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | ❌ | Đăng nhập |
| POST | `/logout` | ❌ | Đăng xuất |

### 📚 Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/students` | ✅ | Danh sách (filter, sort, pagination) |
| POST | `/students` | ✅ | Tạo mới (validation) |
| GET | `/students/:id` | ✅ | Chi tiết |
| PUT | `/students/:id` | ✅ | Cập nhật |
| DELETE | `/students/:id` | ✅ | Xóa (soft delete) |

### 📊 Statistics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/students/stats` | ✅ | Thống kê chung |
| GET | `/students/stats/class` | ✅ | Thống kê theo lớp |

---

## 🧪 Ví dụ Test

### 1️⃣ Đăng nhập
```http
POST http://localhost:3000/login
Content-Type: application/json

{
    "username": "admin",
    "password": "123456"
}
```
**Response:** `{ "message": "Đăng nhập thành công" }`

### 2️⃣ Lấy danh sách
```http
GET http://localhost:3000/students
```
**Response:**
```json
{
    "page": 1,
    "limit": 10,
    "total": 3,
    "data": [...]
}
```

### 3️⃣ Tạo mới sinh viên
```http
POST http://localhost:3000/students
Content-Type: application/json

{
    "name": "Pham Van D",
    "email": "d@gmail.com",
    "age": 20,
    "className": "CNTT1"
}
```
**Response:** `201 Created`

### 4️⃣ Lọc, sắp xếp, phân trang
```http
GET http://localhost:3000/students?name=Van&class=CNTT1&sort=age_desc&page=1&limit=5
```

### 5️⃣ Xóa (soft delete)
```http
DELETE http://localhost:3000/students/2
```
**Response:** `{ "message": "Xóa thành công (Soft delete)" }`

---

## ✅ Validation Rules

| Field | Rules | Error Message |
|-------|-------|---------------|
| name | ≥ 2 ký tự | "Tên phải từ 2 ký tự trở lên" |
| email | Chứa '@', không trùng | "Email không hợp lệ hoặc đã tồn tại" |
| age | 16-60 | "Tuổi phải từ 16 đến 60" |
| className | Bắt buộc | (nếu không có) |

---

## 🔍 Test Checklist

- [ ] Login thành công
- [ ] API protected (401 nếu chưa login)
- [ ] CRUD operations (create, read, update, delete)
- [ ] Validation errors
- [ ] Filter by name & class
- [ ] Sort by age
- [ ] Pagination (page & limit)
- [ ] Soft delete
- [ ] Statistics
- [ ] Middleware logging
- [ ] Logout

---

## 💾 Dữ Liệu Mẫu Ban Đầu

```javascript
[
    { id: 1, name: "Nguyen Van A", email: "a@gmail.com", age: 20, class: "CNTT1", isDeleted: false },
    { id: 2, name: "Tran Thi B", email: "b@gmail.com", age: 21, class: "CNTT1", isDeleted: false },
    { id: 3, name: "Le Van C", email: "c@gmail.com", age: 22, class: "CNTT2", isDeleted: false }
]
```

---

## 🛠️ Công nghệ & Dependencies

| Package | Mục đích |
|---------|---------|
| **express** ^5.2.1 | Web framework |
| **express-session** ^1.19.0 | Session management |
| **Node.js** | Runtime |

---

## 📝 Notes Quan Trọng

⚠️ **Data Persistence:**
- Dữ liệu lưu trong memory (`let students = [...]`)
- Restart server → dữ liệu reset
- Để persistent, cần database (MongoDB, MySQL, etc.)

⚠️ **Session:**
- Mỗi browser tab = session riêng
- Mở tab mới → phải login lại
- Session lost khi restart server

⚠️ **Soft Delete:**
- Dữ liệu không bị xóa vật lý
- Chỉ đánh dấu `isDeleted: true`
- Có thể khôi phục

---

## 🆘 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| Port 3000 bị dùng | Kill process hoặc thay port |
| Module not found | Chạy `npm install` |
| Session mất | Bình thường, data in-memory |
| Email validation error | Email phải chứa '@' |

---

## 📞 Support & Learning

- **REST Client Extension:** https://marketplace.visualstudio.com/items?itemName=humao.rest-client
- **Express Docs:** https://expressjs.com
- **Node.js Docs:** https://nodejs.org

---

## 📈 Roadmap (Future Enhancements)

- [ ] Database integration (MongoDB/MySQL)
- [ ] JWT authentication
- [ ] User roles & permissions
- [ ] File upload
- [ ] Email notifications
- [ ] Unit tests
- [ ] API documentation (Swagger)

---

## 👨‍💻 Author

Tạo cho mục đích học tập Node.js/Express

---

## 📄 License

ISC

---

## ✨ Quick Start Command

```bash
# Install
npm install

# Run
npm start

# Test
# Mở test.http và click "Send Request"
```

**Server sẽ chạy tại:** `http://localhost:3000`

---

**Chúc bạn test API thành công!** 🚀

Bắt đầu từ [SETUP_SUMMARY.md](SETUP_SUMMARY.md) hoặc [TESTING_GUIDE.md](TESTING_GUIDE.md)

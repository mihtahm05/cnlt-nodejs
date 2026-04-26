# 📋 Hướng Dẫn Test Chi Tiết - API Quản Lý Sinh Viên

## 🚀 Hướng Dẫn Khởi Động

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Khởi động server:**
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 1️⃣ KIỂM TRA ĐĂNG NHẬP & BẢO VỀ API

### 1.1 ✅ Đăng nhập thành công
**Endpoint:** `POST /login`  
**Credentials:** 
- Username: `admin`
- Password: `123456`

```http
POST http://localhost:3000/login
Content-Type: application/json

{
    "username": "admin",
    "password": "123456"
}
```

**Kỳ vọng:**
- Status: `200 OK`
- Response: `{ "message": "Đăng nhập thành công" }`
- Session được tạo

---

### 1.2 ✅ Đăng nhập sai mật khẩu
```http
POST http://localhost:3000/login
Content-Type: application/json

{
    "username": "admin",
    "password": "wrong"
}
```

**Kỳ vọng:**
- Status: `401 Unauthorized`
- Response: `{ "message": "Sai tài khoản hoặc mật khẩu" }`

---

### 1.3 ✅ BẢO VỀ API - Truy cập KHÔNG có đăng nhập
```http
GET http://localhost:3000/students
```

**Kỳ vọng:**
- Status: `401 Unauthorized`
- Response: `{ "message": "Unauthorized. Vui lòng đăng nhập!" }`

> **Lưu ý:** Bạn PHẢI đăng nhập trước (1.1) để truy cập các endpoint sinh viên

---

### 1.4 ✅ Middleware `requireLogin` hoạt động
**Các route sinh viên yêu cầu authentication:**
- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PUT /students/:id`
- `DELETE /students/:id`
- `GET /students/stats`
- `GET /students/stats/class`

---

### 1.5 ✅ Đăng xuất
```http
POST http://localhost:3000/logout
```

**Kỳ vọng:**
- Status: `200 OK`
- Response: `{ "message": "Đăng xuất thành công" }`
- Session bị hủy

Sau đó, truy cập `GET /students` sẽ bị từ chối.

---

## 2️⃣ CRUD OPERATIONS (Create, Read, Update, Delete)

> **Yêu cầu:** Phải đăng nhập trước (section 1.1)

### 2.1 ✅ Lấy danh sách tất cả sinh viên (READ)
```http
GET http://localhost:3000/students
```

**Kỳ vọng:**
- Status: `200 OK`
- Response:
```json
{
    "page": 1,
    "limit": 10,
    "total": 3,
    "data": [
        {
            "id": 1,
            "name": "Nguyen Van A",
            "email": "a@gmail.com",
            "age": 20,
            "class": "CNTT1",
            "isDeleted": false
        },
        ...
    ]
}
```

---

### 2.2 ✅ Lấy chi tiết sinh viên (READ by ID)
```http
GET http://localhost:3000/students/1
```

**Kỳ vọng:**
- Status: `200 OK`
- Response: Một object sinh viên

---

### 2.3 ✅ Lấy sinh viên không tồn tại (Error handling)
```http
GET http://localhost:3000/students/999
```

**Kỳ vọng:**
- Status: `404 Not Found`
- Response: `{ "message": "Không tìm thấy sinh viên" }`

---

### 2.4 ✅ Tạo sinh viên mới (CREATE)
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

**Kỳ vọng:**
- Status: `201 Created`
- Response:
```json
{
    "message": "Thêm thành công",
    "data": {
        "id": 4,
        "name": "Pham Van D",
        "email": "d@gmail.com",
        "age": 20,
        "class": "CNTT1",
        "isDeleted": false
    }
}
```

---

### 2.5 ✅ Validation - Email trùng (Error handling)
```http
POST http://localhost:3000/students
Content-Type: application/json

{
    "name": "Tung Test",
    "email": "a@gmail.com",
    "age": 20,
    "className": "CNTT1"
}
```

**Kỳ vọng:**
- Status: `400 Bad Request`
- Response: `{ "message": "Email không hợp lệ hoặc đã tồn tại" }`

---

### 2.6 ✅ Validation - Tên quá ngắn
```http
POST http://localhost:3000/students
Content-Type: application/json

{
    "name": "A",
    "email": "test@gmail.com",
    "age": 20,
    "className": "CNTT1"
}
```

**Kỳ vọng:**
- Status: `400 Bad Request`
- Response: `{ "message": "Tên phải từ 2 ký tự trở lên" }`

---

### 2.7 ✅ Validation - Tuổi không hợp lệ
```http
POST http://localhost:3000/students
Content-Type: application/json

{
    "name": "Sinh Vien Test",
    "email": "test2@gmail.com",
    "age": 15,
    "className": "CNTT1"
}
```

**Kỳ vọng:**
- Status: `400 Bad Request`
- Response: `{ "message": "Tuổi phải từ 16 đến 60" }`

---

### 2.8 ✅ Cập nhật sinh viên (UPDATE)
```http
PUT http://localhost:3000/students/1
Content-Type: application/json

{
    "age": 23,
    "email": "a_updated@gmail.com"
}
```

**Kỳ vọng:**
- Status: `200 OK`
- Response:
```json
{
    "message": "Cập nhật thành công",
    "data": {
        "id": 1,
        "name": "Nguyen Van A",
        "email": "a_updated@gmail.com",
        "age": 23,
        "class": "CNTT1",
        "isDeleted": false
    }
}
```

---

### 2.9 ✅ Cập nhật sinh viên không tồn tại
```http
PUT http://localhost:3000/students/999
Content-Type: application/json

{
    "age": 25
}
```

**Kỳ vọng:**
- Status: `404 Not Found`
- Response: `{ "message": "Không tìm thấy sinh viên" }`

---

## 3️⃣ FILTER, SORT, PAGINATION

### 3.1 ✅ Lọc theo tên
```http
GET http://localhost:3000/students?name=Tran
```

**Kỳ vọng:**
- Chỉ hiển thị sinh viên có tên chứa "Tran"
- Ví dụ: "Tran Thi B"

---

### 3.2 ✅ Lọc theo lớp
```http
GET http://localhost:3000/students?class=CNTT1
```

**Kỳ vọng:**
- Chỉ hiển thị sinh viên lớp CNTT1

---

### 3.3 ✅ Lọc kết hợp (tên + lớp)
```http
GET http://localhost:3000/students?name=Van&class=CNTT1
```

**Kỳ vọng:**
- Lọc sinh viên có tên chứa "Van" VÀ lớp CNTT1

---

### 3.4 ✅ Sắp xếp theo tuổi (giảm dần)
```http
GET http://localhost:3000/students?sort=age_desc
```

**Kỳ vọng:**
- Danh sách sắp xếp từ tuổi cao đến tuổi thấp

---

### 3.5 ✅ Kết hợp Lọc + Sắp xếp
```http
GET http://localhost:3000/students?class=CNTT1&sort=age_desc
```

**Kỳ vọng:**
- Lọc lớp CNTT1 rồi sắp xếp theo tuổi giảm dần

---

### 3.6 ✅ Phân trang (trang 1, 2 sinh viên/trang)
```http
GET http://localhost:3000/students?page=1&limit=2
```

**Kỳ vọng:**
- Response:
```json
{
    "page": 1,
    "limit": 2,
    "total": 3,
    "data": [
        { "id": 1, ... },
        { "id": 2, ... }
    ]
}
```

---

### 3.7 ✅ Phân trang (trang 2)
```http
GET http://localhost:3000/students?page=2&limit=2
```

**Kỳ vọng:**
- Hiển thị sinh viên thứ 3 (tuỳ vào dữ liệu)

---

### 3.8 ✅ Kết hợp Filter + Sort + Pagination
```http
GET http://localhost:3000/students?class=CNTT1&sort=age_desc&page=1&limit=10
```

**Kỳ vọng:**
- Lọc lớp CNTT1
- Sắp xếp tuổi giảm dần
- Phân trang (trang 1, 10 kết quả/trang)

---

## 4️⃣ SOFT DELETE

### 4.1 ✅ Xóa sinh viên (Soft Delete)
```http
DELETE http://localhost:3000/students/2
```

**Kỳ vọng:**
- Status: `200 OK`
- Response: `{ "message": "Xóa thành công (Soft delete)" }`
- Dữ liệu không bị xóa khỏi database, chỉ đánh dấu `isDeleted: true`

---

### 4.2 ✅ Xóa sinh viên không tồn tại
```http
DELETE http://localhost:3000/students/999
```

**Kỳ vọng:**
- Status: `404 Not Found`
- Response: `{ "message": "Không tìm thấy sinh viên" }`

---

### 4.3 ✅ Danh sách sau khi Soft Delete
```http
GET http://localhost:3000/students
```

**Kỳ vọng:**
- Sinh viên ID 2 không xuất hiện trong danh sách
- Nhưng vẫn tồn tại trong database (có thể khôi phục)

---

### 4.4 ✅ Cố gắng lấy sinh viên đã xóa
```http
GET http://localhost:3000/students/2
```

**Kỳ vọng:**
- Status: `404 Not Found`
- Response: `{ "message": "Không tìm thấy sinh viên" }`

---

## 5️⃣ THỐNG KÊ

### 5.1 ✅ Lấy thống kê chung
```http
GET http://localhost:3000/students/stats
```

**Kỳ vọng:**
- Response:
```json
{
    "total": 3,
    "active": 2,
    "deleted": 1,
    "averageAge": 21.5
}
```

---

### 5.2 ✅ Lấy thống kê theo lớp
```http
GET http://localhost:3000/students/stats/class
```

**Kỳ vọng:**
- Response:
```json
[
    {
        "class": "CNTT1",
        "count": 2
    },
    {
        "class": "CNTT2",
        "count": 1
    }
]
```

---

## 6️⃣ MIDDLEWARE HOẠT ĐỘNG ĐÚNG

| Middleware | Chức năng | Test |
|------------|----------|------|
| **logger** | Ghi log mỗi request | Kiểm tra terminal khi gửi request |
| **requireLogin** | Bảo vệ API sinh viên | Test 1.3 - không đăng nhập sẽ bị từ chối |
| **errorHandler** | Xử lý lỗi toàn cục | Kiểm tra error message khi gửi dữ liệu sai |
| **express.json()** | Đọc JSON body | Kiểm tra POST/PUT requests |

---

## 📊 KIỂM TRA HOÀN CHỈNH

### ✅ Checklist để đảm bảo tất cả test đều pass:

- [ ] Login thành công (1.1)
- [ ] Login sai mật khẩu nhận error (1.2)
- [ ] Không đăng nhập bị từ chối (1.3)
- [ ] Tất cả CRUD hoạt động (2.1-2.9)
- [ ] Validation lỗi khi dữ liệu sai (2.5-2.7)
- [ ] Filter, sort, pagination hoạt động (3.1-3.8)
- [ ] Soft delete hoạt động (4.1-4.4)
- [ ] Thống kê chính xác (5.1-5.2)
- [ ] Middleware ghi log (6)

---

## 💡 Tips khi Testing

1. **Dùng REST Client trong VS Code:**
   - Cài extension: `REST Client` (Huachao Mao)
   - Click "Send Request" trên mỗi endpoint

2. **Hoặc dùng cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

3. **Hoặc dùng Postman/Thunder Client**

4. **Kiểm tra console server:**
   - Mỗi request sẽ in ra log
   - Giúp verify middleware hoạt động

---

## 📝 Ghi Chú Quan Trọng

- **Session:** Chỉ tồn tại trong 1 tab/client. Nếu bạn mở tab mới, phải đăng nhập lại
- **Soft Delete:** Dữ liệu không bị xóa vật lý, chỉ ẩn khỏi danh sách
- **Validation:** Luôn kiểm tra các ràng buộc (tên, email, tuổi) khi tạo/cập nhật
- **Pagination mặc định:** `page=1`, `limit=10` nếu không chỉ định

---

Chúc bạn test thành công! 🚀

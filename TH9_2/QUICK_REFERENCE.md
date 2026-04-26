# 📇 Quick Reference - API Endpoints

## 🔑 Authentication
```http
POST /login
Content-Type: application/json
{ "username": "admin", "password": "123456" }
→ 200 OK: { "message": "Đăng nhập thành công" }

POST /logout
→ 200 OK: { "message": "Đăng xuất thành công" }
```

---

## 📚 Students - Danh Sách & Filter

### Cơ bản
```http
GET /students
→ { page, limit, total, data: [students] }
```

### Lọc theo tên
```http
GET /students?name=Tran
```

### Lọc theo lớp
```http
GET /students?class=CNTT1
```

### Lọc kết hợp
```http
GET /students?name=Van&class=CNTT1
```

### Sắp xếp tuổi (giảm dần)
```http
GET /students?sort=age_desc
```

### Phân trang
```http
GET /students?page=1&limit=2
GET /students?page=2&limit=2
```

### Kết hợp tất cả
```http
GET /students?name=Van&class=CNTT1&sort=age_desc&page=1&limit=5
```

---

## 👤 Students - Chi Tiết

### Lấy 1 sinh viên
```http
GET /students/1
→ { id, name, email, age, class, isDeleted }

GET /students/999
→ 404: { "message": "Không tìm thấy sinh viên" }
```

---

## ➕ Create - Tạo Sinh Viên

```http
POST /students
Content-Type: application/json

{
    "name": "Pham Van D",
    "email": "d@gmail.com",
    "age": 20,
    "className": "CNTT1"
}

→ 201 Created:
{
    "message": "Thêm thành công",
    "data": { id, name, email, age, class, isDeleted }
}
```

### Validation Errors
```http
Tên < 2 ký tự → 400: "Tên phải từ 2 ký tự trở lên"
Email sai → 400: "Email không hợp lệ hoặc đã tồn tại"
Email trùng → 400: "Email không hợp lệ hoặc đã tồn tại"
Tuổi sai → 400: "Tuổi phải từ 16 đến 60"
```

---

## ✏️ Update - Cập Nhật Sinh Viên

```http
PUT /students/1
Content-Type: application/json

{
    "age": 23,
    "email": "a_updated@gmail.com"
}

→ 200 OK:
{
    "message": "Cập nhật thành công",
    "data": { id, name, email, age, class, isDeleted }
}

PUT /students/999
→ 404: { "message": "Không tìm thấy sinh viên" }
```

---

## 🗑️ Delete - Xóa Sinh Viên (Soft Delete)

```http
DELETE /students/2
→ 200 OK: { "message": "Xóa thành công (Soft delete)" }

DELETE /students/999
→ 404: { "message": "Không tìm thấy sinh viên" }
```

⚠️ Dữ liệu không bị xóa vật lý, chỉ đánh dấu `isDeleted: true`

---

## 📊 Statistics - Thống Kê

### Thống kê chung
```http
GET /students/stats

→ 200 OK:
{
    "total": 3,
    "active": 2,
    "deleted": 1,
    "averageAge": 21.5
}
```

### Thống kê theo lớp
```http
GET /students/stats/class

→ 200 OK:
[
    { "class": "CNTT1", "count": 2 },
    { "class": "CNTT2", "count": 1 }
]
```

---

## 🔒 Authorization

### ❌ Công khai (không cần đăng nhập)
- `POST /login`
- `POST /logout`
- `GET /heavy-sync`
- `GET /heavy-async`

### ✅ Bảo vệ (cần đăng nhập)
- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PUT /students/:id`
- `DELETE /students/:id`
- `GET /students/stats`
- `GET /students/stats/class`

### Lỗi authorization
```http
Không đăng nhập
→ 401: { "message": "Unauthorized. Vui lòng đăng nhập!" }
```

---

## 🧪 Test Order (Khuyến nghị)

1. ✅ `POST /login` - đăng nhập trước
2. ✅ `GET /students` - xem danh sách
3. ✅ `POST /students` - tạo mới
4. ✅ `GET /students/:id` - chi tiết
5. ✅ `PUT /students/:id` - cập nhật
6. ✅ `GET /students?...` - test filter/sort/pagination
7. ✅ `DELETE /students/:id` - soft delete
8. ✅ `GET /students/stats` - thống kê
9. ✅ `POST /logout` - đăng xuất

---

## 💡 Tips

- **Filter/Sort/Pagination kết hợp:**
  ```http
  GET /students?name=Van&class=CNTT1&sort=age_desc&page=1&limit=5
  ```

- **Phân trang:**
  - Mặc định: `page=1, limit=10`
  - Total results = `total` field
  - Next page = `page+1`

- **Soft Delete:**
  - Xóa: `DELETE /students/2`
  - Kiểm tra: `GET /students/2` → 404
  - Kiểm tra danh sách: `GET /students` → không có ID 2

---

## 🔐 Session Management

- Login tạo session trên server
- Session tồn tại trong browser tab
- Mở tab mới → phải login lại
- Logout → hủy session
- Restart server → tất cả session reset

---

**Quick Test Command (PowerShell):**
```powershell
$body = @{username="admin"; password="123456"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/login" -Method POST -ContentType "application/json" -Body $body
```

---

**Última actualización: 26/04/2024** ✨

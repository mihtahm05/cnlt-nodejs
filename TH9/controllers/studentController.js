let { students } = require('../models/studentModel');

// GET /students (Kết hợp Tìm kiếm và Phân trang)
const getStudents = (req, res) => {
    let result = [...students];

    // Tìm kiếm (Mở rộng Bài 1)
    if (req.query.name) {
        result = result.filter(s => s.name.toLowerCase().includes(req.query.name.toLowerCase()));
    }

    // Phân trang (Bài 5)
    if (req.query.page && req.query.limit) {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        result = result.slice(startIndex, endIndex);
        return res.status(200).json({ page, limit, total: students.length, data: result });
    }

    res.status(200).json(result);
};

// GET /students/:id
const getStudentById = (req, res) => {
    const student = students.find(s => s.id == req.params.id);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    res.status(200).json(student);
};

// POST /students (Kèm Validation)
const createStudent = (req, res) => {
    const { name, email, age } = req.body;

    // Validate
    if (!name || name.trim().length < 2) return res.status(400).json({ message: "Tên không rỗng và >= 2 ký tự" });
    if (!email || !email.includes('@') || students.find(s => s.email === email)) {
        return res.status(400).json({ message: "Email sai định dạng hoặc đã trùng" });
    }

    const newStudent = { id: students.length ? students[students.length - 1].id + 1 : 1, name, email, age };
    students.push(newStudent);
    res.status(201).json({ message: "Thêm thành công", data: newStudent });
};

// PUT /students/:id
const updateStudent = (req, res) => {
    const student = students.find(s => s.id == req.params.id);
    if (!student) return res.status(404).json({ message: "Không tìm thấy" });
    Object.assign(student, req.body);
    res.status(200).json({ message: "Cập nhật thành công", data: student });
};

// DELETE /students/:id
const deleteStudent = (req, res) => {
    const index = students.findIndex(s => s.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: "Không tìm thấy" });
    students.splice(index, 1);
    res.status(200).json({ message: "Đã xóa" });
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
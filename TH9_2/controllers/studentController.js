let { students } = require('../models/studentModel');

// [GET] /students (List, Filter, Sort, Pagination)
const getStudents = (req, res) => {
    let result = students.filter(s => !s.isDeleted);

    // Lọc theo name và class
    if (req.query.name) {
        result = result.filter(s => s.name.toLowerCase().includes(req.query.name.toLowerCase()));
    }
    if (req.query.class) {
        result = result.filter(s => s.class === req.query.class);
    }

    // Sắp xếp
    if (req.query.sort === 'age_desc') {
        result.sort((a, b) => b.age - a.age);
    }

    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = result.slice(startIndex, endIndex);

    res.json({
        page,
        limit,
        total: result.length,
        data: paginatedData
    });
};

// [GET] /students/:id
const getStudentById = (req, res) => {
    const student = students.find(s => s.id == req.params.id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    res.json(student);
};

// [POST] /students (Validation)
const createStudent = (req, res) => {
    const { name, email, age, className } = req.body;

    // Validation
    if (!name || name.length < 2) return res.status(400).json({ message: "Tên phải từ 2 ký tự trở lên" });
    if (!email || !email.includes('@') || students.find(s => s.email === email)) {
        return res.status(400).json({ message: "Email không hợp lệ hoặc đã tồn tại" });
    }
    if (!age || age < 16 || age > 60) return res.status(400).json({ message: "Tuổi phải từ 16 đến 60" });

    const newStudent = {
        id: students.length ? students[students.length - 1].id + 1 : 1,
        name, email, age, class: className, isDeleted: false
    };
    students.push(newStudent);
    res.status(201).json({ message: "Thêm thành công", data: newStudent });
};

// [PUT] /students/:id
const updateStudent = (req, res) => {
    const student = students.find(s => s.id == req.params.id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    Object.assign(student, req.body);
    res.json({ message: "Cập nhật thành công", data: student });
};

// [DELETE] /students/:id (Soft delete)
const deleteStudent = (req, res) => {
    const student = students.find(s => s.id == req.params.id && !s.isDeleted);
    if (!student) return res.status(404).json({ message: "Không tìm thấy sinh viên" });

    student.isDeleted = true; // Soft delete
    res.json({ message: "Xóa thành công (Soft delete)" });
};

// --- PHẦN 5: THỐNG KÊ ---

// [GET] /students/stats
const getGeneralStats = (req, res) => {
    const total = students.length;
    const deleted = students.filter(s => s.isDeleted).length;
    const activeStudents = students.filter(s => !s.isDeleted);
    const active = activeStudents.length;

    const totalAge = activeStudents.reduce((sum, s) => sum + s.age, 0);
    const averageAge = active > 0 ? (totalAge / active).toFixed(1) : 0;

    res.json({ total, active, deleted, averageAge: parseFloat(averageAge) });
};

// [GET] /students/stats/class
const getClassStats = (req, res) => {
    const activeStudents = students.filter(s => !s.isDeleted);
    const classCounts = activeStudents.reduce((acc, curr) => {
        acc[curr.class] = (acc[curr.class] || 0) + 1;
        return acc;
    }, {});

    const result = Object.keys(classCounts).map(className => ({
        class: className,
        count: classCounts[className]
    }));

    res.json(result);
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, getGeneralStats, getClassStats };
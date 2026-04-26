const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const requireLogin = require('../middlewares/authMiddleware');

// Áp dụng middleware bảo vệ cho toàn bộ route sinh viên
router.use(requireLogin);

// Cần đặt các route cụ thể lên trước các route có chứa /:id
router.get('/stats', studentController.getGeneralStats);
router.get('/stats/class', studentController.getClassStats);

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
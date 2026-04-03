const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 1. Danh sách bài viết
router.get('/', postController.index);

// 2. Hiển thị form tạo mới  
router.get('/new', postController.newPost);

// 3. Lưu bài viết mới
router.post('/store', postController.store);

// 4. Chi tiết bài viết
router.get('/:id', postController.getDetail);

// 5. Chỉnh sửa (Hiển thị form edit)
router.get('/:id/edit', postController.editPost);

// 6. CẬP NHẬT: Đổi từ .put thành .post và thêm hậu tố /update để tránh trùng với route Chi tiết
router.post('/:id/update', postController.updatePost);

// 7. XÓA: Đổi từ .delete thành .get để thẻ <a> có thể kích hoạt được
router.get('/:id/delete', postController.deletePost);

module.exports = router;
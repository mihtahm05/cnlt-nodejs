const BlogPost = require('../models/BlogPost');

module.exports = {
    // 1. Lấy tất cả bài viết
    index: async (req, res) => {
        const posts = await BlogPost.find({}).sort({ _id: -1 });
        res.render('index', { posts });
    },

    // 2. Trang tạo mới
    newPost: (req, res) => {
        res.render('create');
    },

    // 3. Lưu bài viết
    store: async (req, res) => {
        await BlogPost.create({
            title: req.body.title,
            body: req.body.body
        });
        res.redirect('/');
    },

    // 4. Chi tiết bài viết
    getDetail: async (req, res) => {
        const post = await BlogPost.findById(req.params.id);
        res.render('detail', { post });
    },

    // 5. Xóa bài viết
    deletePost: async (req, res) => {
        await BlogPost.findByIdAndDelete(req.params.id);
        res.redirect('/');
    },

    // 6. Trang chỉnh sửa
    editPost: async (req, res) => {
        const post = await BlogPost.findById(req.params.id);
        res.render('edit', { post });
    },

    // 7. Cập nhật bài viết
    updatePost: async (req, res) => {
        await BlogPost.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body
        });
        res.redirect('/');
    }
};
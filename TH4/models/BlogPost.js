const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bạn đang đặt tên biến là blogPostSchema (chữ b thường)
const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true }
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
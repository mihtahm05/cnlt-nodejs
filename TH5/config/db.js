const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
        .then(() => console.log('Kết nối MongoDB thành công'))
        .catch(err => console.log('Lỗi kết nối:', err));
};

module.exports = connectDB;
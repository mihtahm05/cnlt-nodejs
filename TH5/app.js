const express = require('express');
const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes'); 
// Khởi tạo app và cấu hình thư mục chứa css
const app = express();
app.use(express.static('public'));

// 1. Kết nối Database
connectDB();

// 2. Cấu hình View Engine (Giả sử bạn dùng EJS)
app.set('view engine', 'ejs');
app.set('views', './views');

// 3. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Sử dụng Routes
// Tất cả các route trong postRoutes sẽ bắt đầu bằng dấu /
app.use('/', postRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
const express = require('express');
const session = require('express-session');
const app = express();

// Import Middlewares
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const syncAsyncRoutes = require('./routes/syncAsyncRoutes');

// Cấu hình Middleware hệ thống để đọc JSON
app.use(express.json()); // Đọc dữ liệu JSON gửi từ client [cite: 67]

// Cấu hình Session
app.use(session({
    secret: 'tritech-quy-nhon-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Để false khi chạy localhost HTTP
}));

// Sử dụng Middleware ghi log toàn cục
app.use(logger);

// Khai báo định tuyến (Routing)
app.use('/', authRoutes);
app.use('/students', studentRoutes); // Được bảo vệ bởi requireLogin trong file route
app.use('/', syncAsyncRoutes);

// Middleware xử lý lỗi (luôn để ở cuối)
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ users online và messages
let onlineUsers = new Map();
let messages = [];

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User đăng nhập
    socket.on('login', (username) => {
        if (username && username.trim()) {
            onlineUsers.set(socket.id, {
                id: socket.id,
                username: username.trim(),
                connected: true
            });

            // Gửi danh sách users online cho tất cả
            io.emit('onlineUsers', Array.from(onlineUsers.values()));

            // Gửi lịch sử tin nhắn
            socket.emit('chatHistory', messages);

            console.log(`${username} logged in. Total online: ${onlineUsers.size}`);
        }
    });

    // Chọn user để chat riêng
    socket.on('selectUser', (targetUserId) => {
        socket.selectedUser = targetUserId;
        socket.emit('userSelected', targetUserId);
    });

    // Gửi tin nhắn
    socket.on('sendMessage', (data) => {
        const message = {
            sender: onlineUsers.get(socket.id)?.username || 'Unknown',
            receiver: data.receiver,
            message: data.message,
            time: new Date().toLocaleTimeString('vi-VN'),
            timestamp: Date.now()
        };

        messages.push(message);

        // Giới hạn lịch sử (100 tin nhắn mới nhất)
        if (messages.length > 100) {
            messages = messages.slice(-100);
        }

        // Gửi cho người nhận cụ thể và người gửi
        const receiverSocket = Array.from(onlineUsers.entries())
            .find(([id]) => id === data.receiver)?.[0];

        if (receiverSocket && io.sockets.sockets.has(receiverSocket)) {
            io.to(receiverSocket).emit('newMessage', message);
        }
        socket.emit('newMessage', message);

        // Broadcast cho tất cả (nếu cần hiển thị public)
        // io.emit('newMessage', message);
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            onlineUsers.delete(socket.id);
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
            console.log(`${user.username} disconnected. Total online: ${onlineUsers.size}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const onlineUsers = new Map();
const chatHistories = new Map();

io.on('connection', (socket) => {
    console.log('✅ Kết nối mới:', socket.id);

    socket.on('login', (username) => {
        if (!username || username.length < 2 || username.length > 20) {
            socket.emit('error', 'Tên người dùng không hợp lệ!');
            return;
        }

        const cleanUsername = username.trim();

        // CỐT LÕI: Tham gia vào "Room" mang tên chính user đó để đảm bảo gửi là nhận ngay
        socket.join(cleanUsername);

        onlineUsers.set(socket.id, {
            id: socket.id,
            username: cleanUsername,
            socketId: socket.id
        });

        console.log(`👤 ${cleanUsername} đã đăng nhập`);

        // Cập nhật danh sách online cho TOÀN BỘ user
        io.emit('onlineUsers', Array.from(onlineUsers.values()));

        // Gửi lịch sử chat cho người vừa đăng nhập
        const history = [];
        for (let [key, messages] of chatHistories.entries()) {
            history.push(...messages);
        }
        socket.emit('chatHistory', history);
    });

    socket.on('sendMessage', (data) => {
        const sender = onlineUsers.get(socket.id);
        if (!sender || !data.receiver || !data.message) return;

        const message = {
            sender: sender.username,
            receiver: data.receiver,
            message: data.message,
            type: data.type || 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Lưu lịch sử
        const chatKey = [sender.username, data.receiver].sort().join('_');
        if (!chatHistories.has(chatKey)) {
            chatHistories.set(chatKey, []);
        }
        chatHistories.get(chatKey).push(message);

        console.log(`💬 ${sender.username} -> ${data.receiver}: ${data.type}`);

        // Bắn tin nhắn trực tiếp vào Room của người nhận (Realtime 100%)
        io.to(data.receiver).emit('newMessage', message);

        // Bắn ngược lại hiển thị cho người gửi (Nếu họ không đang tự chat với chính mình)
        if (sender.username !== data.receiver) {
            socket.emit('newMessage', message);
        }
    });

    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            console.log(`👋 ${user.username} đã thoát`);
            onlineUsers.delete(socket.id);
            // Cập nhật lại danh sách ngay lập tức khi có người out
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
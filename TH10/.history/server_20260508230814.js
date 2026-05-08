const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Storage
const onlineUsers = new Map();
const chatHistories = new Map();

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('login', (username) => {
        // Validate username
        if (!username || username.length < 2 || username.length > 20) {
            socket.emit('error', 'Tên người dùng không hợp lệ!');
            return;
        }

        const userId = socket.id;
        onlineUsers.set(userId, {
            id: userId,
            username: username.trim(),
            socketId: socket.id
        });

        console.log(`👤 ${username} logged in`);

        // Send online users to this socket
        socket.emit('onlineUsers', Array.from(onlineUsers.values()));

        // Send chat history to this socket
        const history = [];
        for (let [key, messages] of chatHistories.entries()) {
            history.push(...messages);
        }
        socket.emit('chatHistory', history);

        // Broadcast updated online users to all others
        socket.broadcast.emit('onlineUsers', Array.from(onlineUsers.values()));
    });

    socket.on('sendMessage', (data) => {
        const sender = onlineUsers.get(socket.id);
        if (!sender) {
            socket.emit('error', 'Không tìm thấy người gửi!');
            return;
        }

        if (!data.receiver || !data.message) {
            socket.emit('error', 'Dữ liệu tin nhắn không hợp lệ!');
            return;
        }

        const message = {
            sender: sender.username,
            receiver: data.receiver,
            message: data.message,
            type: data.type || 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Store message
        const chatKey = [sender.username, data.receiver].sort().join('_');
        if (!chatHistories.has(chatKey)) {
            chatHistories.set(chatKey, []);
        }
        chatHistories.get(chatKey).push(message);

        console.log(`💬 ${sender.username} -> ${data.receiver}: ${data.message.substring(0, 30)}...`);

        // Send to receiver if online
        const receiver = Array.from(onlineUsers.values()).find(u => u.username === data.receiver);
        if (receiver && receiver.socketId !== socket.id) {
            io.to(receiver.socketId).emit('newMessage', message);
        }

        // Send back to sender
        socket.emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            console.log(`👋 ${user.username} disconnected`);
            onlineUsers.delete(socket.id);
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in multiple tabs to test!`);
});
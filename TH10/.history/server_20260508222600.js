const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Serve static files
app.use(express.static('public'));

const onlineUsers = new Map();
const chatHistories = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('login', (username) => {
        const userId = socket.id;
        onlineUsers.set(userId, { id: userId, username, socketId: socket.id });

        socket.emit('onlineUsers', Array.from(onlineUsers.values()));

        const history = [];
        for (let [key, messages] of chatHistories.entries()) {
            history.push(...messages);
        }
        socket.emit('chatHistory', history);

        socket.broadcast.emit('onlineUsers', Array.from(onlineUsers.values()));
    });

    socket.on('sendMessage', (data) => {
        const sender = onlineUsers.get(socket.id);
        if (!sender) return;

        const message = {
            sender: sender.username,
            receiver: data.receiver,
            message: data.message,
            type: data.type || 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const chatKey = [sender.username, data.receiver].sort().join('_');
        if (!chatHistories.has(chatKey)) {
            chatHistories.set(chatKey, []);
        }
        chatHistories.get(chatKey).push(message);

        const receiver = Array.from(onlineUsers.values()).find(u => u.id === data.receiver);
        if (receiver && receiver.socketId !== socket.id) {
            io.to(receiver.socketId).emit('newMessage', message);
        }
        socket.emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.values()));
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
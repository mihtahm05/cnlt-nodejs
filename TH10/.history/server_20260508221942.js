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
app.use(express.static('public'));
app.use('/socket.io/socket.io.js', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist/socket.io.js')));

const onlineUsers = new Map(); // userId -> {id, username, socketId}
const chatHistories = new Map(); // chatKey -> [messages]

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Login
    socket.on('login', (username) => {
        const userId = socket.id;
        onlineUsers.set(userId, { id: userId, username, socketId: socket.id });

        // Send online users
        socket.emit('onlineUsers', Array.from(onlineUsers.values()));

        // Send chat history
        const history = [];
        for (let [key, messages] of chatHistories.entries()) {
            history.push(...messages);
        }
        socket.emit('chatHistory', history);

        // Broadcast new user
        socket.broadcast.emit('onlineUsers', Array.from(onlineUsers.values()));
    });

    // Send message (private)
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

        // Save to history
        const chatKey = [sender.username, data.receiver].sort().join('_');
        if (!chatHistories.has(chatKey)) {
            chatHistories.set(chatKey, []);
        }
        chatHistories.get(chatKey).push(message);

        // Send to receiver if online
        const receiver = Array.from(onlineUsers.values()).find(u => u.id === data.receiver);
        if (receiver && receiver.socketId !== socket.id) {
            io.to(receiver.socketId).emit('newMessage', message);
        }

        // Send back to sender
        socket.emit('newMessage', message);
    });

    // Disconnect
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
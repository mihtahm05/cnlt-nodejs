const socket = io();
let currentUser = '';
let selectedUserId = null;

// DOM elements
const loginModal = document.getElementById('loginModal');
const chatApp = document.getElementById('chatApp');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const currentUserSpan = document.getElementById('currentUser');
const onlineCount = document.getElementById('onlineCount');
const onlineCount2 = document.getElementById('onlineCount2');
const onlineUsersList = document.getElementById('onlineUsersList');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Login
loginBtn.addEventListener('click', login);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

function login() {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        socket.emit('login', username);
        loginModal.classList.remove('active');
        chatApp.classList.remove('hidden');
        currentUserSpan.textContent = username;
        usernameInput.value = '';
    }
}

// Socket events
socket.on('onlineUsers', (users) => {
    updateOnlineUsers(users);
});

socket.on('chatHistory', (history) => {
    displayMessages(history);
});

socket.on('newMessage', (message) => {
    displayMessage(message);
});

// Update online users list
function updateOnlineUsers(users) {
    onlineCount.textContent = users.length + ' online';
    onlineCount2.textContent = users.length;

    onlineUsersList.innerHTML = users.map(user => `
        <div class="user-item ${selectedUserId === user.id ? 'selected' : ''}" 
             onclick="selectUser('${user.id}', '${user.username}')">
            <div class="status"></div>
            ${user.username}
        </div>
    `).join('');
}

// Select user to chat
function selectUser(userId, username) {
    selectedUserId = userId;
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

// Send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && selectedUserId) {
        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: message
        });
        messageInput.value = '';
    }
}

// Display messages
function displayMessages(messages) {
    chatMessages.innerHTML = messages.map(msg => createMessageElement(msg)).join('');
    scrollToBottom();
}

function displayMessage(message) {
    chatMessages.innerHTML += createMessageElement(message);
    scrollToBottom();
}

function createMessageElement(message) {
    const isSent = message.sender === currentUser;
    const userClass = isSent ? 'sent' : 'received';

    return `
        <div class="message ${userClass}">
            <div class="message-bubble">
                <strong>${message.sender}:</strong> ${message.message}
            </div>
            <div class="message-meta">${message.time}</div>
        </div>
    `;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-focus message input
messageInput.focus();
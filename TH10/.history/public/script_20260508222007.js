const socket = io();
let currentUser = '';
let selectedUserId = null;
let selectedUsername = null;
let chatHistories = {};

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
const emojiBtn = document.getElementById('emojiBtn');
const stickerBtn = document.getElementById('stickerBtn');
const imageInput = document.getElementById('imageInput');
const emojiPicker = document.getElementById('emojiPicker');
const stickerPicker = document.getElementById('stickerPicker');

// Emoji & Sticker lists
const emojis = ['😀', '😂', '😍', '😘', '😢', '😡', '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊', '😎', '🤔', '😴', '🤓', '🦁', '🐯', '🐻', '🐼'];
const stickers = ['🍕', '🍔', '🍟', '🌮', '🎂', '🍰', '🎁', '🎀', '🎈', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '🦄', '🚀', '⚡'];

// Initialize emoji picker
function initEmojiPicker() {
    emojiPicker.innerHTML = '';
    emojis.forEach(emoji => {
        const el = document.createElement('div');
        el.className = 'emoji-item';
        el.textContent = emoji;
        el.onclick = () => {
            messageInput.value += emoji;
            messageInput.focus();
            emojiPicker.classList.add('hidden');
        };
        emojiPicker.appendChild(el);
    });
}

// Initialize sticker picker
function initStickerPicker() {
    stickerPicker.innerHTML = '';
    stickers.forEach(sticker => {
        const el = document.createElement('div');
        el.className = 'sticker-item';
        el.textContent = sticker;
        el.onclick = () => sendSticker(sticker);
        stickerPicker.appendChild(el);
    });
}

// Login
function login() {
    const username = usernameInput.value.trim();
    if (username && username.length >= 2 && username.length <= 20) {
        currentUser = username;
        socket.emit('login', username);
        loginModal.classList.remove('active');
        chatApp.classList.remove('hidden');
        currentUserSpan.textContent = username;
        usernameInput.value = '';
        messageInput.focus();
    } else {
        alert('⚠️ Tên phải từ 2-20 ký tự!');
    }
}

loginBtn.addEventListener('click', login);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

// Emoji & Sticker buttons
emojiBtn.addEventListener('click', () => {
    emojiPicker.classList.toggle('hidden');
    stickerPicker.classList.add('hidden');
    if (!emojiPicker.classList.contains('hidden')) initEmojiPicker();
});

stickerBtn.addEventListener('click', () => {
    stickerPicker.classList.toggle('hidden');
    emojiPicker.classList.add('hidden');
    if (!stickerPicker.classList.contains('hidden')) initStickerPicker();
});

// Send sticker
function sendSticker(sticker) {
    if (selectedUserId) {
        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: sticker,
            type: 'sticker'
        });
        stickerPicker.classList.add('hidden');
    } else {
        alert('⚠️ Chọn bạn chat trước!');
    }
}

// Image upload - ✅ HOẠT ĐỘNG HOÀN CHỈNH
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedUserId) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('⚠️ Ảnh tối đa 5MB!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            socket.emit('sendMessage', {
                receiver: selectedUserId,
                message: event.target.result,
                type: 'image'
            });
            imageInput.value = '';
        };
        reader.readAsDataURL(file);
    } else if (!selectedUserId) {
        alert('⚠️ Chọn bạn chat trước!');
    }
});

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && selectedUserId) {
        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: message,
            type: 'text'
        });
        messageInput.value = '';
        emojiPicker.classList.add('hidden');
    } else if (!selectedUserId) {
        alert('⚠️ Chọn bạn chat trước!');
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Close pickers when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon-btn') && !e.target.closest('.emoji-picker') && !e.target.closest('.sticker-picker')) {
        emojiPicker.classList.add('hidden');
        stickerPicker.classList.add('hidden');
    }
});

// Socket events
socket.on('onlineUsers', (users) => {
    updateOnlineUsers(users);
});

socket.on('chatHistory', (history) => {
    chatHistories = {};
    history.forEach(msg => {
        const chatKey = [msg.sender, msg.receiver].sort().join('_');
        if (!chatHistories[chatKey]) chatHistories[chatKey] = [];
        chatHistories[chatKey].push(msg);
    });
    if (selectedUserId) {
        displayChatForUser(selectedUserId, selectedUsername);
    }
});

socket.on('newMessage', (message) => {
    const chatKey = [message.sender, message.receiver].sort().join('_');
    if (!chatHistories[chatKey]) chatHistories[chatKey] = [];
    chatHistories[chatKey].push(message);

    // Hiển thị nếu đang chat với người này
    if (selectedUsername === message.sender || selectedUsername === message.receiver) {
        displayMessage(message);
    }

    updateUnreadCount();
});

// Update online users
function updateOnlineUsers(users) {
    onlineCount.textContent = users.length + ' online';
    onlineCount2.textContent = users.length;

    onlineUsersList.innerHTML = users
        .filter(user => user.username !== currentUser)
        .map(user => {
            const unreadCount = getUnreadCount(user.username);
            return `
                <div class="user-item ${selectedUserId === user.id ? 'selected' : ''}" 
                     data-user-id="${user.id}" data-username="${user.username}"
                     onclick="selectUser('${user.id}', '${user.username}')">
                    <div class="status"></div>
                    <span>${user.username}</span>
                    ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
                </div>
            `;
        }).join('');
}

// Select user
function selectUser(userId, username) {
    selectedUserId = userId;
    selectedUsername = username;

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    displayChatForUser(userId, username);
    updateUnreadCount(); // Reset unread for this user
    messageInput.focus();
    emojiPicker.classList.add('hidden');
    stickerPicker.classList.add('hidden');
}

function displayChatForUser(userId, username) {
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];

    chatMessages.innerHTML = messages.map(createMessageElement).join('');
    scrollToBottom();
}

function displayMessage(message) {
    const messageElement = createMessageElement(message);
    chatMessages.insertAdjacentHTML('beforeend', messageElement);
    scrollToBottom();
}

function createMessageElement(message) {
    const isSent = message.sender === currentUser;
    const senderDisplay = isSent ? 'Bạn' : message.sender;
    let content = '';

    switch (message.type) {
        case 'image':
            content = `<img src="${message.message}" alt="Ảnh" class="message-image" onerror="this.style.display='none'">`;
            break;
        case 'sticker':
            content = `<div class="message-sticker">${message.message}</div>`;
            break;
        default:
            content = `<strong>${senderDisplay}:</strong> ${message.message}`;
    }

    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            <div class="message-bubble">${content}</div>
            <div class="message-meta">${message.time}</div>
        </div>
    `;
}

function getUnreadCount(username) {
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];
    return messages.filter(msg => msg.sender !== currentUser && msg.receiver === currentUser).length;
}

function updateUnreadCount() {
    document.querySelectorAll('.user-item').forEach(item => {
        if (item.dataset.userId !== selectedUserId) {
            const username = item.dataset.username;
            const count = getUnreadCount(username);
            const countEl = item.querySelector('.unread-count');
            if (count > 0) {
                if (!countEl) {
                    item.insertAdjacentHTML('beforeend', `<span class="unread-count">${count}</span>`);
                } else {
                    countEl.textContent = count;
                }
            }
        }
    });
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ESC to close chat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedUserId) {
        selectedUserId = null;
        selectedUsername = null;
        chatMessages.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 2rem; font-style: italic;">👆 Chọn bạn chat để bắt đầu...</div>';
        document.querySelectorAll('.user-item').forEach(item => item.classList.remove('selected'));
        messageInput.value = '';
    }
});
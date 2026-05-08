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

// Emoji list
const emojis = ['😀', '😂', '😍', '😘', '😢', '😡', '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊', '😎', '🤔', '😴', '🤐', '😷', '🤒', '🤮', '😷', '🤧', '🤓'];
const stickers = ['🍕', '🍔', '🍟', '🌮', '🎂', '🍰', '🎁', '🎀', '🎈', '🎆', '🎇', '⭐', '🌟', '💫', '✨', '🌈', '☀️', '🌙', '⛅', '🌤', '🦁', '🐯', '🐻', '🐼', '🐨'];

// Khởi tạo emoji picker
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

// Khởi tạo sticker picker
stickers.forEach(sticker => {
    const el = document.createElement('div');
    el.className = 'sticker-item';
    el.textContent = sticker;
    el.onclick = () => {
        if (selectedUserId) {
            socket.emit('sendMessage', {
                receiver: selectedUserId,
                message: el.textContent,
                type: 'sticker'
            });
            stickerPicker.classList.add('hidden');
        } else {
            alert('⚠️ Vui lòng chọn người nhận tin nhắn!');
        }
    };
    stickerPicker.appendChild(el);
});

// Login
loginBtn.addEventListener('click', login);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

// Emoji & Sticker buttons
emojiBtn.addEventListener('click', () => {
    emojiPicker.classList.toggle('hidden');
    stickerPicker.classList.add('hidden');
});

stickerBtn.addEventListener('click', () => {
    stickerPicker.classList.toggle('hidden');
    emojiPicker.classList.add('hidden');
});

// Image upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedUserId) {
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
        alert('⚠️ Vui lòng chọn người nhận tin nhắn!');
    }
});

// Đóng picker khi click ngoài
document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon-btn') && !e.target.closest('.emoji-picker') && !e.target.closest('.sticker-picker')) {
        emojiPicker.classList.add('hidden');
        stickerPicker.classList.add('hidden');
    }
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
    history.forEach(msg => {
        const chatKey = getChatKey(msg.sender, msg.receiver);
        if (!chatHistories[chatKey]) {
            chatHistories[chatKey] = [];
        }
        chatHistories[chatKey].push(msg);
    });
    if (selectedUserId) {
        displayChatForUser(selectedUserId, selectedUsername);
    }
});

socket.on('newMessage', (message) => {
    const chatKey = getChatKey(message.sender, message.receiver);
    if (!chatHistories[chatKey]) {
        chatHistories[chatKey] = [];
    }

    // Lưu tin nhắn vào bộ nhớ
    chatHistories[chatKey].push(message);

    // Kiểm tra xem tin nhắn này có thuộc cửa sổ chat đang mở hay không
    // So sánh với selectedUsername vì bây giờ message.sender và message.receiver là username
    const isChattingWithTarget = (selectedUsername === message.sender || selectedUsername === message.receiver);

    if (isChattingWithTarget) {
        displayMessage(message);
    }

    updateUnreadCount();
});
function getChatKey(user1, user2) {
    return [user1, user2].sort().join('_');
}

function updateOnlineUsers(users) {
    onlineCount.textContent = users.length + ' online';
    onlineCount2.textContent = users.length;

    onlineUsersList.innerHTML = users.map(user => `
        <div class="user-item ${selectedUserId === user.id ? 'selected' : ''}" 
             data-user-id="${user.id}"
             onclick="selectUser('${user.id}', '${user.username}')">
            <div class="status"></div>
            <span>${user.username}</span>
            <span class="unread-count" style="display: none;">0</span>
        </div>
    `).join('');
}

function selectUser(userId, username) {
    selectedUserId = userId;
    selectedUsername = username;  // Lưu username

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Tìm phần tử được click
    const target = event.currentTarget;
    target.classList.add('selected');

    displayChatForUser(userId, username);  // Truyền username

    const unreadCount = target.querySelector('.unread-count');
    if (unreadCount) {
        unreadCount.style.display = 'none';
        unreadCount.textContent = '0';
    }

    messageInput.focus();
    emojiPicker.classList.add('hidden');
    stickerPicker.classList.add('hidden');
}

function displayChatForUser(userId, username) {
    const chatKey = getChatKey(currentUser, username);  // Dùng username
    const messages = chatHistories[chatKey] || [];

    chatMessages.innerHTML = messages.map(msg => createMessageElement(msg)).join('');
    scrollToBottom();
}

// GỬI TIN NHẮN
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

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
        alert('⚠️ Vui lòng chọn người nhận tin nhắn!');
    }
}

function displayMessage(message) {
    const messageElement = createMessageElement(message);
    chatMessages.insertAdjacentHTML('beforeend', messageElement);
    scrollToBottom();
}

function createMessageElement(message) {
    const isSent = message.sender === currentUser;
    const userClass = isSent ? 'sent' : 'received';

    // Nếu tự chat với chính mình
    const senderDisplay = (message.sender === currentUser) ? 'Bạn' : message.sender;

    let content = '';
    const msgType = message.type || 'text';

    if (msgType === 'image') {
        content = `<img src="${message.message}" alt="Image" class="message-image">`;
    } else if (msgType === 'sticker') {
        content = `<div class="message-sticker">${message.message}</div>`;
    } else {
        content = `<strong>${senderDisplay}:</strong> ${message.message}`;
    }

    return `
        <div class="message ${userClass}">
            <div class="message-bubble">
                ${content}
            </div>
            <div class="message-meta">${message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateUnreadCount() {
    document.querySelectorAll('.user-item').forEach(item => {
        const userId = item.dataset.userId;
        // Chỉ đếm nếu tin nhắn đó không thuộc cửa sổ chat đang mở
        if (userId !== selectedUserId) {
            const chatKey = getChatKey(currentUser, userId);
            const messages = chatHistories[chatKey] || [];
            // Đếm tin nhắn mà mình là người nhận và chưa đọc
            const unreadCount = messages.filter(msg => msg.sender !== currentUser).length;

            const countEl = item.querySelector('.unread-count');
            if (unreadCount > 0) {
                countEl.textContent = unreadCount;
                countEl.style.display = 'block';
            }
        }
    });
}

// Xử lý Escape để đóng chat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedUserId) {
        selectedUserId = null;
        chatMessages.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 2rem;">👆 Chọn bạn chat để bắt đầu...</div>';
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
});
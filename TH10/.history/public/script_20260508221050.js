const socket = io();
let currentUser = '';
let currentUserId = '';
let selectedUserId = null;
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
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const stickerBtn = document.getElementById('stickerBtn');
const stickerPanel = document.getElementById('stickerPanel');

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

socket.on('connect', () => {
    currentUserId = socket.id;
});

socket.on('loggedIn', (data) => {
    if (data?.userId) {
        currentUserId = data.userId;
    }
});

// Socket events
socket.on('onlineUsers', (users) => {
    updateOnlineUsers(users);
});

socket.on('chatHistory', (history) => {
    history.forEach(msg => {
        const chatKey = getChatKey(msg.senderId, msg.receiverId);
        if (!chatHistories[chatKey]) {
            chatHistories[chatKey] = [];
        }
        chatHistories[chatKey].push(msg);
    });
    if (selectedUserId) {
        displayChatForUser(selectedUserId);
    }
});

socket.on('newMessage', (message) => {
    const chatKey = getChatKey(message.senderId, message.receiverId);
    if (!chatHistories[chatKey]) {
        chatHistories[chatKey] = [];
    }

    chatHistories[chatKey].push(message);

    const activeChatKey = selectedUserId ? getChatKey(currentUserId, selectedUserId) : null;
    if (activeChatKey === chatKey) {
        displayMessage(message);
    }

    updateUnreadCount();
});

function getChatKey(id1, id2) {
    return [id1 || '', id2 || ''].sort().join('_');
}

function updateOnlineUsers(users) {
    onlineCount.textContent = users.length + ' online';
    onlineCount2.textContent = users.length;

    onlineUsersList.innerHTML = users.map(user => {
        const isSelf = user.id === currentUserId;
        const label = isSelf ? `${user.username} (Bạn)` : user.username;

        return `
            <div class="user-item ${selectedUserId === user.id ? 'selected' : ''} ${isSelf ? 'self' : ''}" 
                 data-user-id="${user.id}"
                 data-username="${user.username}"
                 onclick="${isSelf ? 'void(0)' : `selectUser(event, '${user.id}')`}">
                <div class="status"></div>
                <span>${label}</span>
                <span class="unread-count" style="display: none;">0</span>
            </div>
        `;
    }).join('');
}

function selectUser(event, userId) {
    if (!userId) return;
    selectedUserId = userId;

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });

    const target = event.currentTarget;
    target.classList.add('selected');

    displayChatForUser(userId);

    const unreadCount = target.querySelector('.unread-count');
    if (unreadCount) {
        unreadCount.style.display = 'none';
        unreadCount.textContent = '0';
    }

    messageInput.focus();
}

function displayChatForUser(userId) {
    const chatKey = getChatKey(currentUserId, userId);
    const messages = chatHistories[chatKey] || [];

    chatMessages.innerHTML = messages.map(msg => createMessageElement(msg)).join('');
    if (!messages.length) {
        chatMessages.innerHTML = '<div class="empty-chat">👆 Chọn người để bắt đầu chat</div>';
    }
    scrollToBottom();
}

// GỬI TIN NHẮN
sendBtn.addEventListener('click', () => sendMessage('text'));
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage('text');
});
uploadBtn.addEventListener('click', () => imageInput.click());
stickerBtn.addEventListener('click', toggleStickerPanel);
imageInput.addEventListener('change', handleImageUpload);

function sendMessage(type) {
    if (!selectedUserId) {
        alert('⚠️ Vui lòng chọn người nhận tin nhắn!');
        return;
    }

    if (type === 'text') {
        const text = messageInput.value.trim();
        if (!text) return;

        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: text,
            content: text,
            type: 'text'
        });

        messageInput.value = '';
        return;
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !selectedUserId) {
        imageInput.value = '';
        if (!selectedUserId) alert('⚠️ Vui lòng chọn người nhận trước khi gửi ảnh!');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result;
        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: '📷 Ảnh',
            content: base64,
            type: 'image'
        });
    };
    reader.readAsDataURL(file);
    imageInput.value = '';
}

function toggleStickerPanel() {
    stickerPanel.classList.toggle('hidden');
}

function sendSticker(sticker) {
    if (!selectedUserId) {
        alert('⚠️ Vui lòng chọn người nhận trước khi gửi sticker!');
        return;
    }

    socket.emit('sendMessage', {
        receiver: selectedUserId,
        message: 'Sticker',
        content: sticker,
        type: 'sticker'
    });
    stickerPanel.classList.add('hidden');
}

function displayMessage(message) {
    const messageElement = createMessageElement(message);
    chatMessages.insertAdjacentHTML('beforeend', messageElement);
    scrollToBottom();
}

function createMessageElement(message) {
    const isSent = message.senderId === currentUserId;
    const userClass = isSent ? 'sent' : 'received';
    const senderDisplay = isSent ? 'Bạn' : message.sender;

    let contentHtml = '';
    if (message.type === 'image') {
        contentHtml = `<img src="${message.content}" alt="Ảnh gửi" class="message-image" />`;
    } else if (message.type === 'sticker') {
        contentHtml = `<div class="message-sticker">${message.content}</div>`;
    } else {
        contentHtml = `<p>${escapeHtml(message.content)}</p>`;
    }

    return `
        <div class="message ${userClass}">
            <div class="message-bubble">
                <strong>${senderDisplay}:</strong>
                ${contentHtml}
            </div>
            <div class="message-meta">${message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateUnreadCount() {
    document.querySelectorAll('.user-item').forEach(item => {
        const userId = item.dataset.userId;
        if (userId === selectedUserId || userId === currentUserId) return;

        const chatKey = getChatKey(currentUserId, userId);
        const messages = chatHistories[chatKey] || [];
        const unreadCount = messages.filter(msg => msg.receiverId === currentUserId).length;

        const countEl = item.querySelector('.unread-count');
        if (unreadCount > 0) {
            countEl.textContent = unreadCount;
            countEl.style.display = 'block';
        } else {
            countEl.style.display = 'none';
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

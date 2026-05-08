const socket = io();
let currentUser = '';
let selectedUsername = null; // Chuyển sang dùng Username làm gốc thay vì ID
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
const backBtn = document.getElementById('backBtn');
const chatContainer = document.querySelector('.chat-container');

const emojis = ['😀', '😂', '😍', '😘', '😢', '😡', '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊', '😎', '🤔', '😴', '🤓', '🦁', '🐯', '🐻'];
const stickers = ['🍕', '🍔', '🍟', '🌮', '🎂', '🍰', '🎁', '🎀', '🎈', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '🦄', '🚀', '⚡'];

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

function login() {
    const username = usernameInput.value.trim();
    if (username && username.length >= 2 && username.length <= 20) {
        currentUser = username;
        socket.emit('login', username);
        loginModal.classList.remove('active');
        chatApp.classList.remove('hidden');
        currentUserSpan.textContent = username;
        usernameInput.value = '';
    } else {
        alert('⚠️ Tên phải từ 2-20 ký tự!');
    }
}

loginBtn.addEventListener('click', login);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('hidden');
    stickerPicker.classList.add('hidden');
    if (!emojiPicker.classList.contains('hidden')) initEmojiPicker();
});

stickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stickerPicker.classList.toggle('hidden');
    emojiPicker.classList.add('hidden');
    if (!stickerPicker.classList.contains('hidden')) initStickerPicker();
});

function sendSticker(sticker) {
    if (selectedUsername) {
        socket.emit('sendMessage', {
            receiver: selectedUsername,
            message: sticker,
            type: 'sticker'
        });
        stickerPicker.classList.add('hidden');
    }
}

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedUsername) {
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ Ảnh tối đa 5MB!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            socket.emit('sendMessage', {
                receiver: selectedUsername,
                message: event.target.result,
                type: 'image'
            });
            imageInput.value = '';
        };
        reader.readAsDataURL(file);
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && selectedUsername) {
        socket.emit('sendMessage', {
            receiver: selectedUsername,
            message: message,
            type: 'text'
        });
        messageInput.value = '';
        emojiPicker.classList.add('hidden');
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.picker-container') && !e.target.closest('.icon-btn')) {
        emojiPicker.classList.add('hidden');
        stickerPicker.classList.add('hidden');
    }
});

if (backBtn) {
    backBtn.addEventListener('click', () => {
        chatContainer.classList.remove('chat-active');
        selectedUsername = null;
        document.querySelectorAll('.user-item').forEach(item => item.classList.remove('selected'));
    });
}

socket.on('onlineUsers', (users) => {
    // Lọc bỏ các user trùng lặp tên do mở nhiều tab
    const uniqueUsers = Array.from(new Map(users.map(u => [u.username, u])).values());
    updateOnlineUsers(uniqueUsers);
});

socket.on('chatHistory', (history) => {
    chatHistories = {};
    history.forEach(msg => {
        const chatKey = [msg.sender, msg.receiver].sort().join('_');
        if (!chatHistories[chatKey]) chatHistories[chatKey] = [];
        chatHistories[chatKey].push(msg);
    });
    if (selectedUsername) {
        displayChatForUser(selectedUsername);
    }
});

socket.on('newMessage', (message) => {
    const chatKey = [message.sender, message.receiver].sort().join('_');
    if (!chatHistories[chatKey]) chatHistories[chatKey] = [];
    chatHistories[chatKey].push(message);

    // Nếu tin nhắn thuộc về cuộc hội thoại đang mở -> Hiện ngay lập tức
    if (selectedUsername === message.sender || selectedUsername === message.receiver) {
        displayMessage(message);
    }
    updateUnreadCount();
});

function updateOnlineUsers(users) {
    // Lọc ra các user khác với currentUser
    const otherUsers = users.filter(user => user.username !== currentUser);
    onlineCount.textContent = (otherUsers.length) + ' online';
    onlineCount2.textContent = otherUsers.length;

    onlineUsersList.innerHTML = otherUsers.map(user => {
        const unreadCount = getUnreadCount(user.username);
        // Kiểm tra selected dựa trên Username (KHÔNG dùng ID) để đảm bảo không mất active khi f5
        const isSelected = selectedUsername === user.username ? 'selected' : '';

        return `
            <div class="user-item ${isSelected}" data-username="${user.username}"
                 onclick="selectUser('${user.username}')">
                <div class="status"></div>
                <span>${user.username}</span>
                ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
            </div>
        `;
    }).join('');
}

function selectUser(username) {
    selectedUsername = username;

    if (chatContainer) chatContainer.classList.add('chat-active');

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });

    const selectedNode = document.querySelector(`.user-item[data-username="${username}"]`);
    if (selectedNode) selectedNode.classList.add('selected');

    displayChatForUser(username);
    updateUnreadCount();
    messageInput.focus();
    emojiPicker.classList.add('hidden');
    stickerPicker.classList.add('hidden');
}

function displayChatForUser(username) {
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];

    if (messages.length === 0) {
        chatMessages.innerHTML = `<div class="empty-state">Bắt đầu trò chuyện với ${username}...</div>`;
    } else {
        chatMessages.innerHTML = messages.map(createMessageElement).join('');
    }
    scrollToBottom();
}

function displayMessage(message) {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

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
            content = `${message.message}`;
    }

    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            <div class="message-bubble">
                ${!isSent ? `<strong>${senderDisplay}</strong><br>` : ''}
                ${content}
            </div>
            <div class="message-meta">${message.time}</div>
        </div>
    `;
}

function getUnreadCount(username) {
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];
    // Tính tin nhắn đến chưa đọc
    return messages.filter(msg => msg.sender === username && msg.receiver === currentUser).length;
}

function updateUnreadCount() {
    document.querySelectorAll('.user-item').forEach(item => {
        if (item.dataset.username !== selectedUsername) {
            const username = item.dataset.username;
            const count = getUnreadCount(username);
            let countEl = item.querySelector('.unread-count');

            if (count > 0) {
                if (!countEl) {
                    item.insertAdjacentHTML('beforeend', `<span class="unread-count">${count}</span>`);
                } else {
                    countEl.textContent = count;
                }
            } else if (countEl) {
                countEl.remove();
            }
        }
    });
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
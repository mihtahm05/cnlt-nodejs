const socket = io();
let currentUser = '';
let selectedUserId = null;
let selectedUsername = null;
let chatHistories = {};

// DOM Elements
const elements = {
    loginModal: document.getElementById('loginModal'),
    chatApp: document.getElementById('chatApp'),
    usernameInput: document.getElementById('usernameInput'),
    loginBtn: document.getElementById('loginBtn'),
    currentUserSpan: document.getElementById('currentUser'),
    onlineCount: document.getElementById('onlineCount'),
    onlineCount2: document.getElementById('onlineCount2'),
    onlineUsersList: document.getElementById('onlineUsersList'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    stickerBtn: document.getElementById('stickerBtn'),
    gifBtn: document.getElementById('gifBtn'),
    imageInput: document.getElementById('imageInput'),
    emojiPicker: document.getElementById('emojiPicker'),
    stickerPicker: document.getElementById('stickerPicker'),
    gifPicker: document.getElementById('gifPicker')
};

// Lists
const emojis = ['😀', '😂', '😍', '😘', '😢', '😡', '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊', '😎', '🤔', '😴', '🤓', '🦁', '🐯', '🐻', '🐼'];
const stickers = ['🍕', '🍔', '🍟', '🌮', '🎂', '🍰', '🎁', '🎀', '🎈', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '🦄', '🚀', '⚡'];
const gifs = [
    'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    'https://media.giphy.com/media/26ufnwz3wDUfck3aI/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'https://media.giphy.com/media/3o7btMrD4Y7AAK2DqE/giphy.gif'
];

// Initialize pickers
function initEmojiPicker() {
    elements.emojiPicker.innerHTML = '';
    emojis.forEach(emoji => {
        const el = document.createElement('div');
        el.className = 'picker-item emoji-item';
        el.textContent = emoji;
        el.onclick = () => addToInput(emoji);
        elements.emojiPicker.appendChild(el);
    });
}

function initStickerPicker() {
    elements.stickerPicker.innerHTML = '';
    stickers.forEach(sticker => {
        const el = document.createElement('div');
        el.className = 'picker-item sticker-item';
        el.textContent = sticker;
        el.onclick = () => sendMedia(sticker, 'sticker');
        elements.stickerPicker.appendChild(el);
    });
}

function initGifPicker() {
    elements.gifPicker.innerHTML = '';
    gifs.forEach(gif => {
        const el = document.createElement('div');
        el.className = 'picker-item gif-item';
        el.innerHTML = `<img src="${gif}" alt="GIF" class="gif-preview">`;
        el.onclick = () => sendMedia(gif, 'gif');
        elements.gifPicker.appendChild(el);
    });
}

function addToInput(content) {
    elements.messageInput.value += content;
    elements.messageInput.focus();
    hideAllPickers();
}

function sendMedia(content, type) {
    if (!selectedUserId) {
        showNotification('⚠️ Chọn bạn chat trước!');
        return;
    }
    socket.emit('sendMessage', {
        receiver: selectedUserId,
        message: content,
        type: type
    });
    hideAllPickers();
}

// Login
function login() {
    const username = elements.usernameInput.value.trim();
    if (username && username.length >= 2 && username.length <= 20) {
        currentUser = username;
        socket.emit('login', username);
        elements.loginModal.classList.remove('active');
        elements.chatApp.classList.remove('hidden');
        elements.currentUserSpan.textContent = username;
        elements.usernameInput.value = '';
        showNoChatSelected();
        elements.messageInput.focus();
    } else {
        showNotification('⚠️ Tên phải từ 2-20 ký tự!');
    }
}

elements.loginBtn.addEventListener('click', login);
elements.usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

// Toggle pickers
function togglePicker(type) {
    hideAllPickers();
    const picker = type === 'emoji' ? elements.emojiPicker :
        type === 'sticker' ? elements.stickerPicker : elements.gifPicker;

    picker.classList.toggle('hidden');
    if (!picker.classList.contains('hidden')) {
        if (type === 'emoji') initEmojiPicker();
        else if (type === 'sticker') initStickerPicker();
        else if (type === 'gif') initGifPicker();
    }
}

elements.emojiBtn.onclick = () => togglePicker('emoji');
elements.stickerBtn.onclick = () => togglePicker('sticker');
elements.gifBtn.onclick = () => togglePicker('gif');

function hideAllPickers() {
    [elements.emojiPicker, elements.stickerPicker, elements.gifPicker].forEach(p => p.classList.add('hidden'));
}

// File upload
elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUserId) {
        if (!selectedUserId) showNotification('⚠️ Chọn bạn chat trước!');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('⚠️ File tối đa 10MB!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: event.target.result,
            type: type
        });
        elements.imageInput.value = '';
    };
    reader.readAsDataURL(file);
});

// Send text message
function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message || !selectedUserId) {
        if (!selectedUserId) showNotification('⚠️ Chọn bạn chat trước!');
        return;
    }

    socket.emit('sendMessage', {
        receiver: selectedUserId,
        message: message,
        type: 'text'
    });
    elements.messageInput.value = '';
}

elements.sendBtn.addEventListener('click', sendMessage);
elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Notification
function showNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #ef4444; color: white; padding: 12px 20px;
        border-radius: 8px; z-index: 9999; font-weight: 600;
        box-shadow: 0 10px 30px rgba(239,68,68,0.4);
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 3000);
}

function showNoChatSelected() {
    elements.chatMessages.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 4rem; font-style: italic;">👆 Chọn bạn chat để bắt đầu...</div>';
}

// Click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon-btn') &&
        !e.target.closest('.picker-container') &&
        !e.target.closest('.message-input')) {
        hideAllPickers();
    }
});

// 🔥 SOCKET EVENTS
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

    if (selectedUsername && (
        (selectedUsername === message.sender && message.receiver === currentUser) ||
        (selectedUsername === message.receiver && message.sender === currentUser)
    )) {
        displayMessage(message);
    }

    updateUnreadCount();
});

// Update online users
function updateOnlineUsers(users) {
    elements.onlineCount.textContent = users.length + ' online';
    elements.onlineCount2.textContent = users.length;

    const otherUsers = users.filter(user => user.username !== currentUser);

    if (otherUsers.length === 0) {
        elements.onlineUsersList.innerHTML = '<div style="text-align: center; color: #9ca3af; padding: 2rem;">Chưa có ai online 😴</div>';
        return;
    }

    elements.onlineUsersList.innerHTML = otherUsers.map(user => {
        const unreadCount = getUnreadCount(user.username);
        return `
            <div class="user-item ${selectedUserId === user.id ? 'selected' : ''}" 
                 data-user-id="${user.id}" data-username="${user.username}"
                 onclick="selectUser('${user.id}', '${user.username}')">
                <div class="status"></div>
                <span>${escapeHtml(user.username)}</span>
                ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
            </div>
        `;
    }).join('');
}

// 🔥 SELECT USER - GLOBAL FUNCTION
window.selectUser = function (userId, username) {
    selectedUserId = userId;
    selectedUsername = username;

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.user-item').classList.add('selected');

    displayChatForUser(userId, username);
    updateUnreadCount();
    elements.messageInput.focus();
    hideAllPickers();
};

function displayChatForUser(userId, username) {
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];

    if (messages.length === 0) {
        elements.chatMessages.innerHTML = '<div style="text-align: center; color: #9ca3af; padding: 4rem; font-style: italic;">💭 Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>';
    } else {
        elements.chatMessages.innerHTML = messages.map(createMessageElement).join('');
    }
    scrollToBottom();
}

function displayMessage(message) {
    const messageElement = createMessageElement(message);
    elements.chatMessages.insertAdjacentHTML('beforeend', messageElement);
    scrollToBottom();
}

function createMessageElement(message) {
    const isSent = message.sender === currentUser;
    let content = '';

    switch (message.type) {
        case 'image':
            content = `<img src="${message.message}" alt="Ảnh" class="media-image" onerror="this.style.display='none'">`;
            break;
        case 'video':
            content = `<video src="${message.message}" class="media-video" controls></video>`;
            break;
        case 'gif':
            content = `<img src="${message.message}" alt="GIF" class="media-gif">`;
            break;
        case 'sticker':
            content = `<div class="message-sticker">${message.message}</div>`;
            break;
        default:
            content = `<div class="message-text">${escapeHtml(message.message)}</div>`;
    }

    const senderDisplay = isSent ? 'Bạn' : message.sender;

    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            <div class="message-bubble">
                ${content}
                <div class="message-meta">
                    <span class="sender-name">${senderDisplay}</span>
                    <span class="time">${message.time}</span>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function getUnreadCount(username) {
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];
    return messages.filter(msg => msg.sender !== currentUser).length;
}

function updateUnreadCount() {
    document.querySelectorAll('.user-item').forEach(item => {
        const username = item.dataset.username;
        const count = getUnreadCount(username);
        let countEl = item.querySelector('.unread-count');

        if (count > 0 && item.dataset.userId !== selectedUserId) {
            if (!countEl) {
                item.insertAdjacentHTML('beforeend', `<span class="unread-count">${count}</span>`);
            } else {
                countEl.textContent = count;
            }
        } else if (countEl) {
            countEl.remove();
        }
    });
}

function scrollToBottom() {
    setTimeout(() => {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }, 100);
}

// ESC to deselect user
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedUserId) {
        selectedUserId = null;
        selectedUsername = null;
        showNoChatSelected();
        document.querySelectorAll('.user-item').forEach(item => item.classList.remove('selected'));
        elements.messageInput.value = '';
        hideAllPickers();
    }
});
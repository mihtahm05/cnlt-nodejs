const socket = io();
let currentUser = '';
let selectedUserId = null;
let selectedUsername = null;
let chatHistories = {};

// DOM Elements
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
const gifBtn = document.getElementById('gifBtn');
const imageInput = document.getElementById('imageInput');
const emojiPicker = document.getElementById('emojiPicker');
const stickerPicker = document.getElementById('stickerPicker');
const gifPicker = document.getElementById('gifPicker');

// Lists
const emojis = ['😀', '😂', '😍', '😘', '😢', '😡', '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊', '😎', '🤔', '😴', '🤓', '🦁', '🐯', '🐻', '🐼'];
const stickers = ['🍕', '🍔', '🍟', '🌮', '🎂', '🍰', '🎁', '🎀', '🎈', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '🦄', '🚀', '⚡'];
const gifs = [
    'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    'https://media.giphy.com/media/26ufnwz3wDUfck3aI/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'https://media.giphy.com/media/3o7btMrD4Y7AAK2DqE/giphy.gif',
    'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif'
];

// Initialize pickers
function initEmojiPicker() {
    emojiPicker.innerHTML = '';
    emojis.forEach(emoji => {
        const el = document.createElement('div');
        el.className = 'picker-item emoji-item';
        el.textContent = emoji;
        el.onclick = () => addToInput(emoji);
        emojiPicker.appendChild(el);
    });
}

function initStickerPicker() {
    stickerPicker.innerHTML = '';
    stickers.forEach(sticker => {
        const el = document.createElement('div');
        el.className = 'picker-item sticker-item';
        el.textContent = sticker;
        el.onclick = () => sendMedia(sticker, 'sticker');
        stickerPicker.appendChild(el);
    });
}

function initGifPicker() {
    gifPicker.innerHTML = '';
    gifs.forEach(gif => {
        const el = document.createElement('div');
        el.className = 'picker-item gif-item';
        el.innerHTML = `<img src="${gif}" alt="GIF" class="gif-preview">`;
        el.onclick = () => sendMedia(gif, 'gif');
        gifPicker.appendChild(el);
    });
}

function addToInput(content) {
    messageInput.value += content;
    messageInput.focus();
    hideAllPickers();
}

function sendMedia(content, type) {
    if (!selectedUserId) {
        alert('⚠️ Chọn bạn chat trước!');
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

// Toggle pickers
function togglePicker(type) {
    hideAllPickers();
    const picker = type === 'emoji' ? emojiPicker :
        type === 'sticker' ? stickerPicker : gifPicker;

    picker.classList.toggle('hidden');
    if (!picker.classList.contains('hidden')) {
        if (type === 'emoji') initEmojiPicker();
        else if (type === 'sticker') initStickerPicker();
        else if (type === 'gif') initGifPicker();
    }
}

emojiBtn.onclick = () => togglePicker('emoji');
stickerBtn.onclick = () => togglePicker('sticker');
gifBtn.onclick = () => togglePicker('gif');

function hideAllPickers() {
    [emojiPicker, stickerPicker, gifPicker].forEach(p => p.classList.add('hidden'));
}

// File upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUserId) {
        if (!selectedUserId) alert('⚠️ Chọn bạn chat trước!');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('⚠️ File tối đa 10MB!');
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
        imageInput.value = '';
    };
    reader.readAsDataURL(file);
});

// Send text message
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !selectedUserId) {
        if (!selectedUserId) alert('⚠️ Chọn bạn chat trước!');
        return;
    }

    socket.emit('sendMessage', {
        receiver: selectedUserId,
        message: message,
        type: 'text'
    });
    messageInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Click outside to close pickers
document.addEventListener('click', (e) => {
    if (!e.target.closest('.icon-btn') &&
        !e.target.closest('.picker-container') &&
        !e.target.closest('.message-input')) {
        hideAllPickers();
    }
});

// 🔥 SOCKET EVENTS - ĐÃ FIX
socket.on('onlineUsers', (users) => {
    console.log('Online users:', users); // Debug
    updateOnlineUsers(users);
});

socket.on('chatHistory', (history) => {
    console.log('Chat history:', history.length, 'messages'); // Debug
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
    console.log('New message:', message); // Debug
    const chatKey = [message.sender, message.receiver].sort().join('_');
    if (!chatHistories[chatKey]) chatHistories[chatKey] = [];
    chatHistories[chatKey].push(message);

    // Hiển thị tin nhắn nếu đang chat với user này
    if (selectedUsername === message.sender ||
        selectedUsername === message.receiver ||
        message.sender === currentUser ||
        message.receiver === currentUser) {
        displayMessage(message);
    }

    updateUnreadCount();
});

// Update online users
function updateOnlineUsers(users) {
    onlineCount.textContent = users.length + ' online';
    onlineCount2.textContent = users.length;

    const otherUsers = users.filter(user => user.username !== currentUser);
    onlineUsersList.innerHTML = otherUsers.map(user => {
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

// 🔥 SELECT USER - ĐÃ FIX
function selectUser(userId, username) {
    console.log('Selected user:', username, 'ID:', userId); // Debug
    selectedUserId = userId;
    selectedUsername = username;

    // Update UI
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.user-item').classList.add('selected');

    displayChatForUser(userId, username);
    updateUnreadCount();
    messageInput.focus();
    hideAllPickers();
}

function displayChatForUser(userId, username) {
    console.log('Displaying chat for:', username); // Debug
    const chatKey = [currentUser, username].sort().join('_');
    const messages = chatHistories[chatKey] || [];

    console.log('Messages for this chat:', messages.length); // Debug
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

    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            <div class="message-bubble">
                ${content}
                <div class="message-meta">
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

        if (count > 0) {
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedUserId) {
        selectedUserId = null;
        selectedUsername = null;
        chatMessages.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 4rem; font-style: italic;">👆 Chọn bạn chat để bắt đầu...</div>';
        document.querySelectorAll('.user-item').forEach(item => item.classList.remove('selected'));
        messageInput.value = '';
        hideAllPickers();
    }
});
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

// Emoji, Sticker & GIF lists
const emojis = ['😀', '😂', '😍', '😘', '😢', '😡', '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '🎉', '🎊', '😎', '🤔', '😴', '🤓', '🦁', '🐯', '🐻', '🐼', '🙌', '👏', '🥳', '🎈', '🎁'];
const stickers = ['🍕', '🍔', '🍟', '🌮', '🎂', '🍰', '🎁', '🎀', '🎈', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '🦄', '🚀', '⚡', '💣', '🎯', '🔥', '💥', '🌺', '🌹', '💐', '🎵', '🎤', '🎧'];
const gifs = [
    'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    'https://media.giphy.com/media/26ufnwz3wDUfck3aI/giphy.gif',
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif',
    'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'https://media.giphy.com/media/3o7btMrD4Y7AAK2DqE/giphy.gif',
    'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
    'https://media.giphy.com/media/3o7aDgf124c7j8zLNu/giphy.gif',
    'https://media.giphy.com/media/xT9IgzoX5LXyN3nPu8/giphy.gif',
    'https://media.giphy.com/media/26ufnT9Dq5Z4w3sRa/giphy.gif',
    'https://media.giphy.com/media/l41lX9GcfSeKpo4ZO/giphy.gif',
    'https://media.giphy.com/media/3o7TKsQ8J2y5h9k0kQ/giphy.gif',
    'https://media.giphy.com/media/5b9V5L2SvlX0E/giphy.gif'
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

// Add to input or send
function addToInput(content) {
    messageInput.value += content;
    messageInput.focus();
    hideAllPickers();
}

function sendMedia(content, type) {
    if (selectedUserId) {
        socket.emit('sendMessage', {
            receiver: selectedUserId,
            message: content,
            type: type
        });
        hideAllPickers();
    } else {
        alert('⚠️ Chọn bạn chat trước!');
    }
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

// Button events
emojiBtn.addEventListener('click', () => togglePicker('emoji'));
stickerBtn.addEventListener('click', () => togglePicker('sticker'));
gifBtn.addEventListener('click', () => togglePicker('gif'));

function togglePicker(type) {
    hideAllPickers();
    const picker = {
        emoji: emojiPicker,
        sticker: stickerPicker,
        gif: gifPicker
    }[type];

    picker.classList.toggle('hidden');
    if (!picker.classList.contains('hidden')) {
        if (type === 'emoji') initEmojiPicker();
        if (type === 'sticker') initStickerPicker();
        if (type === 'gif') initGifPicker();
    }
}

function hideAllPickers() {
    emojiPicker.classList.add('hidden');
    stickerPicker.classList.add('hidden');
    gifPicker.classList.add('hidden');
}

// Image/GIF upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedUserId) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
    if (!e.target.closest('.icon-btn') && !e.target.closest('.picker-container')) {
        hideAllPickers();
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
    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    displayChatForUser(userId, username);
    updateUnreadCount();
    messageInput.focus();
    hideAllPickers();
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
            content = `<img src="${message.message}" alt="Ảnh" class="media-image" onerror="this.style.display='none'">`;
            break;
        case 'video':
            content = `<video src="${message.message}" class="media-video" controls preload="metadata"></video>`;
            break;
        case 'gif':
            content = `<img src="${message.message}" alt="GIF" class="media-gif" looping>`;
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
                    <span class="sender-name">${senderDisplay}</span>
                    <span class="time">${message.time}</span>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
            } else if (countEl) {
                countEl.remove();
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
        chatMessages.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 4rem; font-style: italic;">👆 Chọn bạn chat để bắt đầu...</div>';
        document.querySelectorAll('.user-item').forEach(item => item.classList.remove('selected'));
        messageInput.value = '';
        hideAllPickers();
    }
});
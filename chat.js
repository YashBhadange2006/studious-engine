const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId');
let groupNameText = 'Study Group Chat';

window.addEventListener('message', function(e) {
    groupNameText = e.data.group || 'Study Group Chat';
    document.getElementById('groupName').textContent = groupNameText;
});

const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const fileInput = document.getElementById('fileInput');
const chatMessages = document.getElementById('chatMessages');
const attachBtn = document.getElementById('attachBtn');
const speakBtn = document.getElementById('speakBtn');
const shareBtn = document.getElementById('shareBtn');
const pomodoroBtn = document.getElementById('pomodoroBtn');
const whiteboardBtn = document.getElementById('whiteboardBtn');
const flashcardBtn = document.getElementById('flashcardBtn');
const taskInput = document.getElementById('taskInput');
const addTask = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const resourceList = document.getElementById('resourceList');
const chatAvatar = document.getElementById('chatAvatar');

// Load Avatar
const savedAvatar = localStorage.getItem('userAvatar');
if (savedAvatar) chatAvatar.src = savedAvatar;

// Share link (GitHub Pages compatible)
shareBtn.addEventListener('click', function() {
    const basePath = window.location.pathname.includes('study-group-finder') ? '/study-group-finder' : '';
    const chatLink = `${window.location.origin}${basePath}/chat.html?groupId=${groupId}`;
    navigator.clipboard.writeText(chatLink).then(() => alert('Chat link copied!'));
});

// Message submission
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText) {
        addMessage(messageText, 'sent');
        messageInput.value = '';
        simulateReceivedMessage(messageText);
        updateGroupStats('messages');
        updateAchievements('messagesSent');
    }
});

// File attachment
attachBtn.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = file.type.startsWith('image/') 
                ? `<img src="${e.target.result}" alt="${file.name}">`
                : `<a href="${e.target.result}" download="${file.name}">${file.name}</a>`;
            addMessage(content, 'sent');
            addResource(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
    }
});

// Text-to-Speech
speakBtn.addEventListener('click', function() {
    const messageText = messageInput.value.trim();
    if (messageText) {
        const utterance = new SpeechSynthesisUtterance(messageText);
        window.speechSynthesis.speak(utterance);
    }
});

// Add message with pinning
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.innerHTML = `${content} <span class="pin-btn" onclick="pinMessage

(this)">📌</span>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function pinMessage(btn) {
    const message = btn.parentElement;
    message.classList.toggle('pinned');
    if (message.classList.contains('pinned')) {
        chatMessages.insertBefore(message, chatMessages.firstChild);
    }
}

// Simulate received message
function simulateReceivedMessage(sentMessage) {
    setTimeout(() => {
        addMessage(`Re: ${sentMessage}`, 'received');
    }, 1000);
}

// Add resource
function addResource(name, url) {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${url}" download="${name}">${name}</a>`;
    resourceList.appendChild(li);
}

// Task management
addTask.addEventListener('click', function() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);
        taskInput.value = '';
    }
});

// Pomodoro Timer
const pomodoroModal = document.getElementById('pomodoroModal');
const startTimer = document.getElementById('startTimer');
const resetTimer = document.getElementById('resetTimer');
const timerDisplay = document.getElementById('timerDisplay');
let timeLeft = 25 * 60;
let timerInterval;

pomodoroBtn.onclick = () => pomodoroModal.style.display = 'block';
document.querySelectorAll('.close')[0].onclick = () => pomodoroModal.style.display = 'none';

startTimer.addEventListener('click', function() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                alert('Pomodoro session complete!');
            }
        }, 1000);
    }
});

resetTimer.addEventListener('click', function() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    timerDisplay.textContent = '25:00';
});

// Whiteboard
const whiteboardModal = document.getElementById('whiteboardModal');
const canvas = document.getElementById('whiteboardCanvas');
const ctx = canvas.getContext('2d');
const clearWhiteboard = document.getElementById('clearWhiteboard');
let drawing = false;

whiteboardBtn.onclick = () => whiteboardModal.style.display = 'block';
document.querySelectorAll('.close')[1].onclick = () => whiteboardModal.style.display = 'none';

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => drawing = false);
clearWhiteboard.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// Flashcard Generator
const flashcardModal = document.getElementById('flashcardModal');
const flashcardForm = document.getElementById('flashcardForm');
const flashcardContainer = document.getElementById('flashcardContainer');
const nextFlashcardBtn = document.getElementById('nextFlashcard');
const shareFlashcardBtn = document.getElementById('shareFlashcard');
let flashcards = JSON.parse(localStorage.getItem(`flashcards_${groupId}`)) || [];
let currentFlashcardIndex = 0;

flashcardBtn.onclick = () => {
    flashcardModal.style.display = 'block';
    displayFlashcard();
};
document.querySelectorAll('.close')[2].onclick = () => flashcardModal.style.display = 'none';

flashcardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const term = document.getElementById('termInput').value.trim();
    const definition = document.getElementById('definitionInput').value.trim();
    if (term && definition) {
        flashcards.push({ term, definition });
        localStorage.setItem(`flashcards_${groupId}`, JSON.stringify(flashcards));
        this.reset();
        displayFlashcard();
    }
});

function displayFlashcard() {
    flashcardContainer.innerHTML = '';
    if (flashcards.length === 0) {
        flashcardContainer.textContent = 'No flashcards yet—add some!';
        return;
    }
    const flashcard = document.createElement('div');
    flashcard.classList.add('flashcard');
    flashcard.innerHTML = `
        <div class="flashcard-front">${flashcards[currentFlashcardIndex].term}</div>
        <div class="flashcard-back">${flashcards[currentFlashcardIndex].definition}</div>
    `;
    flashcard.onclick = () => flashcard.classList.toggle('flipped');
    flashcardContainer.appendChild(flashcard);
}

nextFlashcardBtn.addEventListener('click', function() {
    currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length;
    displayFlashcard();
});

shareFlashcardBtn.addEventListener('click', function() {
    if (flashcards.length > 0) {
        const flashcard = flashcards[currentFlashcardIndex];
        addMessage(`Flashcard: ${flashcard.term} → ${flashcard.definition}`, 'sent');
        flashcardModal.style.display = 'none';
        updateGroupStats('messages');
        updateAchievements('messagesSent');
    }
});

// Update group stats
function updateGroupStats(type) {
    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const group = savedGroups.find(g => g.id === groupId);
    if (group) {
        if (type === 'messages') group.messages++;
        localStorage.setItem('studyGroups', JSON.stringify(savedGroups));
    }
}

// Update achievements
function updateAchievements(action) {
    let achievements = JSON.parse(localStorage.getItem('achievements')) || { groupsCreated: 0, messagesSent: 0 };
    if (action === 'messagesSent') achievements.messagesSent++;
    localStorage.setItem('achievements', JSON.stringify(achievements));
    checkAchievements();
}

function checkAchievements() {
    const achievements = JSON.parse(localStorage.getItem('achievements')) || { groupsCreated: 0, messagesSent: 0 };
    if (achievements.messagesSent >= 10 && !localStorage.getItem('chatMasterBadge')) {
        alert('Achievement Unlocked: Chat Master!');
        localStorage.setItem('chatMasterBadge', true);
    }
}

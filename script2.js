document.addEventListener('DOMContentLoaded', function() {
    loadGroups();
    loadAvatar();
    checkAchievements();

    // Feedback Modal
    const modal = document.getElementById('feedbackModal');
    const feedbackLink = document.getElementById('feedbackLink');
    const closeBtn = document.querySelector('.close');
    const submitFeedback = document.getElementById('submitFeedback');

    feedbackLink.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    submitFeedback.onclick = () => {
        alert('Thank you for your feedback!');
        modal.style.display = 'none';
    };

    // Theme Switcher
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        themeToggle.innerHTML = document.body.classList.contains('dark-theme') ? '<i class="fas fa-sun"></i> Theme' : '<i class="fas fa-moon"></i> Theme';
    };
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Theme';
    }

    // Avatar Upload
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const avatar = document.getElementById('userAvatar');
                avatar.src = e.target.result;
                localStorage.setItem('userAvatar', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});

document.getElementById('groupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const subject = document.getElementById('subject').value;
    const interests = document.getElementById('interests').value;
    const description = document.getElementById('description').value;
    const privacy = document.getElementById('privacy').value;
    const password = document.getElementById('password').value;
    const id = Date.now().toString();

    const group = { id, name, subject, interests, description, privacy, password, members: 1, messages: 0 };

    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    savedGroups.push(group);
    localStorage.setItem('studyGroups', JSON.stringify(savedGroups));

    loadGroups();
    this.reset();
    document.getElementById('password').style.display = 'none';
    updateAchievements('groupCreated');
});

document.getElementById('privacy').addEventListener('change', function() {
    document.getElementById('password').style.display = this.value === 'private' ? 'block' : 'none';
});

function loadGroups() {
    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    savedGroups.forEach(group => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${group.name} - ${group.subject} (${group.interests})
            <div class="group-actions">
                <span onclick="joinGroup('${group.id}')">Join</span>
                <span onclick="renameGroup('${group.id}')">Rename</span>
                <span onclick="deleteGroup('${group.id}')">Delete</span>
                <span onclick="showGroupInfo('${group.id}')"><i class="fas fa-info-circle"></i></span>
            </div>
        `;
        groupList.appendChild(li);
    });
}

function joinGroup(groupId) {
    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const group = savedGroups.find(g => g.id === groupId);
    if (group) {
        if (group.privacy === 'private') {
            const pass = prompt('Enter group password:');
            if (pass !== group.password) {
                alert('Incorrect password!');
                return;
            }
        }
        const chatWindow = window.open(`chat.html?groupId=${groupId}`, '_blank');
        chatWindow.onload = function() {
            chatWindow.document.title = `Chat - ${group.name} (${group.subject})`;
            chatWindow.postMessage({ group: `${group.name} - ${group.subject} (${group.interests})`, groupId: groupId }, '*');
        };
    }
}

function renameGroup(groupId) {
    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const group = savedGroups.find(g => g.id === groupId);
    if (group) {
        const newName = prompt('Enter new group name:', group.name);
        if (newName) {
            group.name = newName;
            localStorage.setItem('studyGroups', JSON.stringify(savedGroups));
            loadGroups();
            alert('Group renamed successfully!');
        }
    }
}

function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
        const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
        const updatedGroups = savedGroups.filter(g => g.id !== groupId);
        localStorage.setItem('studyGroups', JSON.stringify(updatedGroups));
        loadGroups();
        alert('Group deleted successfully!');
    }
}

function showGroupInfo(groupId) {
    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const group = savedGroups.find(g => g.id === groupId);
    if (group) {
        alert(`Group Info:\nName: ${group.name}\nSubject: ${group.subject}\nInterests: ${group.interests}\nMembers: ${group.members}\nMessages: ${group.messages}\nDescription: ${group.description}`);
    }
}

function loadAvatar() {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        document.getElementById('userAvatar').src = savedAvatar;
    }
}

function updateAchievements(action) {
    let achievements = JSON.parse(localStorage.getItem('achievements')) || { groupsCreated: 0, messagesSent: 0 };
    if (action === 'groupCreated') achievements.groupsCreated++;
    localStorage.setItem('achievements', JSON.stringify(achievements));
    checkAchievements();
}

function checkAchievements() {
    const achievements = JSON.parse(localStorage.getItem('achievements')) || { groupsCreated: 0, messagesSent: 0 };
    if (achievements.groupsCreated >= 1 && !localStorage.getItem('groupCreatorBadge')) {
        alert('Achievement Unlocked: Group Creator!');
        localStorage.setItem('groupCreatorBadge', true);
    }
}

// Search and Filter
document.getElementById('search').addEventListener('input', filterGroups);
document.getElementById('categoryFilter').addEventListener('change', filterGroups);

function filterGroups() {
    const search = document.getElementById('search').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const savedGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    savedGroups.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(search) || group.subject.toLowerCase().includes(search) || group.interests.toLowerCase().includes(search);
        const matchesCategory = !category || group.interests.includes(category);
        return matchesSearch && matchesCategory;
    }).forEach(group => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${group.name} - ${group.subject} (${group.interests})
            <div class="group-actions">
                <span onclick="joinGroup('${group.id}')">Join</span>
                <span onclick="renameGroup('${group.id}')">Rename</span>
                <span onclick="deleteGroup('${group.id}')">Delete</span>
                <span onclick="showGroupInfo('${group.id}')"><i class="fas fa-info-circle"></i></span>
            </div>
        `;
        groupList.appendChild(li);
    });
}
// ===================== API CONFIGURATION =====================
const API_BASE = 'http://localhost:5000';

let authToken = localStorage.getItem('token');
let userRole = localStorage.getItem('role');
let userEmail = localStorage.getItem('email');

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    if (authToken) {
        showApp();
    } else {
        showAuth();
    }
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// ===================== AUTH FUNCTIONS =====================
function toggleAuth() {
    document.getElementById('login-form').classList.toggle('active');
    document.getElementById('register-form').classList.toggle('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('error', data.error || 'Login failed');
            return;
        }

        // Store credentials
        authToken = data.token;
        userRole = data.role;
        userEmail = email;
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('role', userRole);
        localStorage.setItem('email', userEmail);

        showMessage('success', 'Login successful! Redirecting...');
        setTimeout(() => showApp(), 500);
    } catch (error) {
        console.error('Login error:', error);
        showMessage('error', 'Connection error. Make sure the API is running.');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('error', data.error || 'Registration failed');
            return;
        }

        showMessage('success', 'Account created! Please login.');
        setTimeout(() => {
            toggleAuth();
            document.getElementById('registerForm').reset();
        }, 500);
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('error', 'Connection error. Make sure the API is running.');
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    authToken = null;
    userRole = null;
    userEmail = null;
    showAuth();
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

// ===================== UI STATE FUNCTIONS =====================
function showAuth() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').classList.remove('hidden');
    
    document.getElementById('user-email').textContent = userEmail;

    // Show/hide admin nav based on role
    if (userRole === 'admin') {
        document.getElementById('admin-nav').classList.remove('hidden');
    } else {
        document.getElementById('admin-nav').classList.add('hidden');
    }

    showStudentDashboard();
}

function showMessage(type, text) {
    const msgEl = document.getElementById('auth-message');
    msgEl.textContent = text;
    msgEl.className = `message ${type}`;
    setTimeout(() => {
        msgEl.className = 'message';
    }, 5000);
}

function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// ===================== PAGE NAVIGATION =====================
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId.replace('-page', '')) {
            link.classList.add('active');
        }
    });
}

function showStudentDashboard() {
    switchPage('dashboard-page');
    loadDashboard();
}

function showCourses() {
    switchPage('courses-page');
    loadCourses();
}

function showProgress() {
    switchPage('progress-page');
    loadProgress();
}

function showAdminDashboard() {
    switchPage('admin-page');
    loadAdminDashboard();
}

// ===================== DASHBOARD =====================
async function loadDashboard() {
    try {
        showLoading(true);
        
        // Get progress summary
        const progressRes = await fetchWithAuth(`${API_BASE}/student/progress`);
        if (progressRes) {
            const { total_topics, completed_topics, progress_percent } = progressRes;
            
            document.getElementById('total-topics').textContent = total_topics;
            document.getElementById('completed-topics').textContent = completed_topics;
            document.getElementById('progress-percent').textContent = progress_percent + '%';
            
            const progressBar = document.getElementById('progress-bar-overall');
            progressBar.style.width = progress_percent + '%';
            
            const progressText = document.getElementById('progress-text');
            progressText.textContent = `${completed_topics}/${total_topics} topics completed`;
        }

        // Get courses count
        const coursesRes = await fetch(`${API_BASE}/student/courses`);
        const courses = await coursesRes.json();
        document.getElementById('enrolled-count').textContent = courses.length || 0;

    } catch (error) {
        console.error('Dashboard error:', error);
    } finally {
        showLoading(false);
    }
}

// ===================== COURSES =====================
async function loadCourses() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/student/courses`);
        const courses = await response.json();

        const container = document.getElementById('courses-list');
        container.innerHTML = '';

        if (!courses || courses.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No courses available</p>';
            return;
        }

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <div class="course-icon">📖</div>
                <h3>${escapeHtml(course.name)}</h3>
                <p>${escapeHtml(course.description)}</p>
                <div class="course-meta">
                    <span class="course-status not-enrolled">Not Enrolled</span>
                    <button class="btn btn-sm btn-primary" onclick="enrollCourse(${course.id})">Enroll</button>
                </div>
            `;
            card.addEventListener('click', () => openCourseModal(course));
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Courses error:', error);
    } finally {
        showLoading(false);
    }
}

async function enrollCourse(courseId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/student/enroll`, {
            method: 'POST',
            body: JSON.stringify({ course_id: courseId })
        });

        if (response) {
            alert('Successfully enrolled in course!');
            loadCourses();
        }
    } catch (error) {
        console.error('Enroll error:', error);
        alert('Failed to enroll');
    }
}

async function openCourseModal(course) {
    try {
        document.getElementById('modal-course-title').textContent = course.name;
        document.getElementById('modal-course-desc').textContent = course.description;

        const subjectsRes = await fetchWithAuth(`${API_BASE}/student/subjects/${course.id}`);
        
        const container = document.getElementById('subjects-container');
        container.innerHTML = '';

        if (!subjectsRes || subjectsRes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No subjects in this course yet</p>';
            document.getElementById('course-modal').classList.remove('hidden');
            return;
        }

        for (const subject of subjectsRes) {
            const topicsRes = await fetchWithAuth(`${API_BASE}/student/topics/${subject.id}`);
            
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject-item';
            
            let topicsHtml = '<ul class="topics-list">';
            if (topicsRes && topicsRes.length > 0) {
                topicsRes.forEach(topic => {
                    const completedClass = topic.completed ? 'completed' : '';
                    topicsHtml += `
                        <li class="topic-item ${completedClass}">
                            <input type="checkbox" class="topic-checkbox" ${topic.completed ? 'checked' : ''} 
                                   onchange="toggleTopic(${topic.id})">
                            <label class="topic-label">${escapeHtml(topic.title)}</label>
                        </li>
                    `;
                });
            }
            topicsHtml += '</ul>';

            subjectDiv.innerHTML = `
                <div class="subject-name">📚 ${escapeHtml(subject.name)}</div>
                ${topicsHtml}
            `;
            
            container.appendChild(subjectDiv);
        }

        document.getElementById('course-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Modal error:', error);
    }
}

function closeCourseModal() {
    document.getElementById('course-modal').classList.add('hidden');
}

// ===================== PROGRESS =====================
async function loadProgress() {
    try {
        showLoading(true);

        const coursesRes = await fetch(`${API_BASE}/student/courses`);
        const courses = await coursesRes.json();

        const container = document.getElementById('progress-view');
        container.innerHTML = '';

        if (!courses || courses.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No enrolled courses</p>';
            return;
        }

        for (const course of courses) {
            const courseSection = document.createElement('div');
            courseSection.className = 'course-section';

            const subjectsRes = await fetchWithAuth(`${API_BASE}/student/subjects/${course.id}`);
            
            let html = `<h3 class="course-title">${escapeHtml(course.name)}</h3>`;
            
            if (subjectsRes && subjectsRes.length > 0) {
                html += '<div class="subjects-list">';
                
                for (const subject of subjectsRes) {
                    const topicsRes = await fetchWithAuth(`${API_BASE}/student/topics/${subject.id}`);
                    
                    let topicsHtml = '<ul class="topics-list">';
                    if (topicsRes && topicsRes.length > 0) {
                        topicsRes.forEach(topic => {
                            const completedClass = topic.completed ? 'completed' : '';
                            topicsHtml += `
                                <li class="topic-item ${completedClass}">
                                    <input type="checkbox" class="topic-checkbox" ${topic.completed ? 'checked' : ''} 
                                           onchange="toggleTopic(${topic.id})">
                                    <label class="topic-label">${escapeHtml(topic.title)}</label>
                                </li>
                            `;
                        });
                    }
                    topicsHtml += '</ul>';

                    html += `
                        <div class="subject-item">
                            <div class="subject-name">📚 ${escapeHtml(subject.name)}</div>
                            ${topicsHtml}
                        </div>
                    `;
                }
                
                html += '</div>';
            } else {
                html += '<p style="color: var(--text-secondary);">No subjects in this course</p>';
            }

            courseSection.innerHTML = html;
            container.appendChild(courseSection);
        }

    } catch (error) {
        console.error('Progress error:', error);
    } finally {
        showLoading(false);
    }
}

async function toggleTopic(topicId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/student/progress`, {
            method: 'POST',
            body: JSON.stringify({ topic_id: topicId })
        });

        if (response) {
            loadDashboard();
        }
    } catch (error) {
        console.error('Toggle error:', error);
    }
}

// ===================== ADMIN DASHBOARD =====================
async function loadAdminDashboard() {
    try {
        showLoading(true);

        // Get all courses
        const coursesRes = await fetch(`${API_BASE}/student/courses`);
        const courses = await coursesRes.json();

        // Get all progress data (simulated - you might need to extend your API)
        const progressRes = await fetchWithAuth(`${API_BASE}/student/progress`);

        document.getElementById('admin-courses').textContent = (courses || []).length;
        document.getElementById('admin-users').textContent = '2'; // Placeholder - extend API as needed
        document.getElementById('admin-topics').textContent = '0'; // Placeholder - extend API as needed

        // Performance metrics placeholder
        const performanceList = document.getElementById('admin-performance');
        performanceList.innerHTML = `
            <div class="performance-item">
                <strong>Current User Progress</strong>
                <span>${progressRes?.progress_percent || 0}%</span>
            </div>
            <div class="performance-item">
                <strong>Topics Completed</strong>
                <span>${progressRes?.completed_topics || 0}/${progressRes?.total_topics || 0}</span>
            </div>
        `;

    } catch (error) {
        console.error('Admin dashboard error:', error);
    } finally {
        showLoading(false);
    }
}

// ===================== HELPER FUNCTIONS =====================
async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        logout();
        return null;
    }

    return response.json();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ========================================
   STUDY CRUSHER - APP LOGIC (JavaScript)
   ======================================== */

// ============ CONFIGURATION ============
// EDIT THESE: YouTube video URLs
const YOUTUBE_VIDEOS = [
    {
        id: 'video-1',
        title: 'Lecture Video 1',
        youtubeUrl: '', // PASTE YOUR YOUTUBE URL HERE
    },
    {
        id: 'video-2', 
        title: 'Lecture Video 2',
        youtubeUrl: '', // PASTE YOUR YOUTUBE URL HERE
    }
];

// EDIT THESE: Monthly targets
const MONTHLY_TARGETS = {
    'February 2026': {
        1: ['Chemistry - Alcohols & Phenols', 'Biology - Human Reproduction', 'Physics - Current Electricity', 'Revision + Doubts'],
        2: ['Chemistry - Ethers', 'Biology - Reproductive Health', 'Physics - Moving Charges', 'Revision + Doubts'],
        3: ['Chemistry - Aldehydes & Ketones', 'Biology - Genetics', 'Physics - Magnetism', 'Revision + Doubts'],
        4: ['Chemistry - Carboxylic Acids', 'Biology - Molecular Basis', 'Physics - EMI', 'Revision + Doubts'],
        5: ['Chemistry - Amines', 'Biology - Evolution', 'Physics - AC', 'Revision + Doubts'],
    }
};

// Default targets if no monthly plan
const DEFAULT_TARGETS = [
    { name: 'Chemistry Practice', totalMinutes: 180, minMinutes: 120 },
    { name: 'Biology NCERT', totalMinutes: 150, minMinutes: 90 },
    { name: 'Physics Problems', totalMinutes: 120, minMinutes: 60 },
    { name: 'Revision + Doubts', totalMinutes: 90, minMinutes: 45 }
];

const COMMITMENT_PHRASE = "today i will finish all targets without distractions";
const REQUIRED_WATCH_TIME = 3600; // 1 hour in seconds

// ============ FIREBASE CONFIG ============
const firebaseConfig = {
    apiKey: "AIzaSyCAj23NPmCrVWzZFg9FwtBsm69HVpRqO18",
    authDomain: "air-100-972eb.firebaseapp.com",
    projectId: "air-100-972eb",
    storageBucket: "air-100-972eb.firebasestorage.app",
    messagingSenderId: "748658283943",
    appId: "1:748658283943:web:9e1c10bb833c05b953d282"
};

// ============ STATE ============
let state = {
    currentScreen: 'loading',
    session: {
        isActive: false,
        videos: [],
        targets: [],
        totalVideoWatchTime: 0,
        distractionCount: 0,
        aiTimeUsed: 0
    },
    stats: {
        streakCount: 0,
        lastCompletedDate: ''
    },
    calendarMarks: [],
    focusTimer: null,
    focusStartTime: null,
    currentTargetIndex: -1
};

// ============ UTILITIES ============
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatMinutes(mins) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
}

function getYouTubeVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

function getTodayTargets() {
    const today = new Date();
    const monthKey = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const day = today.getDate();
    
    if (MONTHLY_TARGETS[monthKey] && MONTHLY_TARGETS[monthKey][day]) {
        return MONTHLY_TARGETS[monthKey][day].map((name, i) => ({
            id: `target-${i + 1}`,
            name,
            totalMinutes: [180, 150, 120, 90][i] || 90,
            minMinutes: [120, 90, 60, 45][i] || 45,
            status: 'locked',
            timeSpent: 0,
            overtime: 0
        }));
    }
    
    return DEFAULT_TARGETS.map((t, i) => ({
        id: `target-${i + 1}`,
        ...t,
        status: 'locked',
        timeSpent: 0,
        overtime: 0
    }));
}

// ============ SCREENS ============
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
    state.currentScreen = screenId;
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ============ INITIALIZATION ============
async function init() {
    // Update date display
    const today = new Date();
    document.getElementById('date-display').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Load from localStorage (fallback when Firebase unavailable)
    loadState();
    
    // Check for incomplete yesterday
    const yesterdaySession = localStorage.getItem(`session-${getYesterdayKey()}`);
    if (yesterdaySession) {
        const parsed = JSON.parse(yesterdaySession);
        if (parsed.sessionStarted && !parsed.completed) {
            showModal('failure-modal');
        }
    }
    
    // Initialize calendar
    updateCalendar();
    
    // Update streak display
    document.getElementById('streak-count').textContent = state.stats.streakCount;
    
    // Setup event listeners
    setupEventListeners();
    
    // Show dashboard
    setTimeout(() => showScreen('dashboard-screen'), 500);
}

function loadState() {
    try {
        const saved = localStorage.getItem('studyCrusherState');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.stats = parsed.stats || state.stats;
            state.calendarMarks = parsed.calendarMarks || [];
        }
    } catch (e) {
        console.error('Error loading state:', e);
    }
}

function saveState() {
    localStorage.setItem('studyCrusherState', JSON.stringify({
        stats: state.stats,
        calendarMarks: state.calendarMarks
    }));
}

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    // Start session button
    document.getElementById('start-session-btn').addEventListener('click', () => {
        showScreen('commitment-screen');
    });
    
    // Overview button
    document.getElementById('overview-btn').addEventListener('click', () => {
        alert('Weekly Overview - Coming soon!');
    });
    
    // Commitment input
    const commitmentInput = document.getElementById('commitment-input');
    commitmentInput.addEventListener('input', checkCommitments);
    
    // Commitment checkboxes
    document.querySelectorAll('.commitment-check').forEach(cb => {
        cb.addEventListener('change', checkCommitments);
    });
    
    // Confirm start button
    document.getElementById('confirm-start-btn').addEventListener('click', startStudySession);
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => navigateCalendar(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateCalendar(1));
    
    // Focus check response
    document.getElementById('focus-yes-btn').addEventListener('click', () => {
        hideModal('focus-check-modal');
        scheduleFocusCheck();
    });
    
    // Target complete continue
    document.getElementById('target-continue-btn').addEventListener('click', () => {
        hideModal('target-complete-modal');
    });
    
    // Failure understand
    document.getElementById('understand-btn').addEventListener('click', () => {
        hideModal('failure-modal');
    });
    
    // Stop target button
    document.getElementById('stop-target-btn').addEventListener('click', completeTarget);
    
    // Reward home button
    document.getElementById('reward-home-btn').addEventListener('click', () => {
        showScreen('dashboard-screen');
        location.reload();
    });
    
    // AI button
    document.getElementById('ai-btn').addEventListener('click', () => {
        document.getElementById('ai-sidebar').classList.add('open');
    });
    
    // Close AI
    document.getElementById('close-ai').addEventListener('click', () => {
        document.getElementById('ai-sidebar').classList.remove('open');
    });
    
    // AI form
    document.getElementById('ai-form').addEventListener('submit', (e) => {
        e.preventDefault();
        sendAIMessage();
    });
    
    // Visibility change detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Before unload warning
    window.addEventListener('beforeunload', (e) => {
        if (state.session.isActive) {
            e.preventDefault();
            e.returnValue = 'Your study session is in progress!';
        }
    });
}

// ============ COMMITMENT CEREMONY ============
function checkCommitments() {
    const input = document.getElementById('commitment-input').value.toLowerCase().trim();
    const phraseMatches = input === COMMITMENT_PHRASE;
    const allChecked = Array.from(document.querySelectorAll('.commitment-check')).every(cb => cb.checked);
    
    const statusEl = document.getElementById('phrase-status');
    if (input.length > 10) {
        if (phraseMatches) {
            statusEl.textContent = '✓ Phrase matches!';
            statusEl.className = 'phrase-status success';
        } else {
            statusEl.textContent = 'Phrase doesn\'t match. Type exactly as shown.';
            statusEl.className = 'phrase-status error';
        }
    } else {
        statusEl.textContent = '';
    }
    
    const btn = document.getElementById('confirm-start-btn');
    if (phraseMatches && allChecked) {
        btn.disabled = false;
        btn.classList.remove('disabled');
        btn.textContent = 'Start Study Session 🔥';
    } else {
        btn.disabled = true;
        btn.classList.add('disabled');
        btn.textContent = 'Complete all requirements above';
    }
}

// ============ STUDY SESSION ============
function startStudySession() {
    state.session = {
        isActive: true,
        videos: YOUTUBE_VIDEOS.map((v, i) => ({
            ...v,
            status: i === 0 ? 'ready' : 'locked',
            watchedSeconds: 0
        })),
        targets: getTodayTargets(),
        totalVideoWatchTime: 0,
        distractionCount: 0,
        aiTimeUsed: 0,
        startTime: new Date().toISOString()
    };
    
    // Save session start
    localStorage.setItem(`session-${getTodayKey()}`, JSON.stringify({
        sessionStarted: state.session.startTime,
        completed: false
    }));
    
    showScreen('study-room-screen');
    renderVideos();
    renderTargets();
    updateProgress();
}

function renderVideos() {
    const container = document.getElementById('videos-container');
    container.innerHTML = '';
    
    state.session.videos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = `video-card ${video.status}`;
        card.id = `video-card-${index}`;
        
        const videoId = getYouTubeVideoId(video.youtubeUrl);
        
        card.innerHTML = `
            <div class="video-header">
                <div class="video-header-left">
                    <div class="video-icon ${video.status}">
                        ${video.status === 'locked' ? '🔒' : video.status === 'completed' ? '✓' : '▶'}
                    </div>
                    <div>
                        <div class="video-title">${video.title}</div>
                        <div class="video-subtitle">Video ${index + 1} of 2</div>
                    </div>
                </div>
                ${video.status === 'completed' ? '<div class="video-status">✓ Done</div>' : ''}
            </div>
            <div class="video-area">
                ${video.status === 'locked' ? `
                    <div class="video-locked-overlay">
                        <div class="lock-icon">🔒</div>
                        <p>Complete previous video first</p>
                    </div>
                ` : video.status === 'ready' ? `
                    <div class="video-play-overlay" onclick="playVideo(${index})">
                        <div class="play-btn-large">▶</div>
                        <p>Click to Play</p>
                        <small>No skipping allowed • 1x speed only counts</small>
                    </div>
                ` : video.status === 'playing' && videoId ? `
                    <iframe class="video-iframe" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&controls=0" allowfullscreen></iframe>
                ` : video.status === 'completed' ? `
                    <div class="video-complete-overlay">
                        <div class="check-icon">✅</div>
                        <h3>Video Complete!</h3>
                        <p>${index < 1 ? 'Next video unlocked' : 'All videos done!'}</p>
                    </div>
                ` : `
                    <div class="video-locked-overlay">
                        <p>No YouTube link configured</p>
                        <small>Edit youtubeUrl in app.js</small>
                    </div>
                `}
            </div>
            ${video.status === 'playing' || video.status === 'completed' ? `
                <div class="video-footer">
                    <div class="watch-time-display">
                        <span class="current">${formatTime(video.watchedSeconds)}</span>
                        <span class="required">/ ${formatTime(REQUIRED_WATCH_TIME / 2)}</span>
                    </div>
                    <div class="watch-progress-bar">
                        <div class="watch-progress-fill" style="width: ${Math.min((video.watchedSeconds / (REQUIRED_WATCH_TIME / 2)) * 100, 100)}%"></div>
                    </div>
                    ${video.status === 'playing' && video.watchedSeconds >= 1800 ? `
                        <button class="mark-complete-btn" onclick="completeVideo(${index})">✓ Mark Complete</button>
                    ` : ''}
                </div>
            ` : ''}
        `;
        
        container.appendChild(card);
    });
    
    // Update watch time message
    const allCompleted = state.session.videos.every(v => v.status === 'completed');
    const hasEnoughTime = state.session.totalVideoWatchTime >= REQUIRED_WATCH_TIME;
    const msg = document.getElementById('watch-time-message');
    
    if (!allCompleted || !hasEnoughTime) {
        msg.classList.remove('hidden');
        document.getElementById('current-watch-time').textContent = 
            `Current: ${Math.floor(state.session.totalVideoWatchTime / 60)} min / 60 min required`;
    } else {
        msg.classList.add('hidden');
    }
}

function playVideo(index) {
    const video = state.session.videos[index];
    if (video.status !== 'ready') return;
    
    video.status = 'playing';
    renderVideos();
    
    // Request fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});
    
    // Start watch time tracking
    startWatchTimeTracking(index);
    
    // Show AI button after first video starts
    document.getElementById('ai-btn').classList.remove('hidden');
}

let watchInterval = null;

function startWatchTimeTracking(videoIndex) {
    if (watchInterval) clearInterval(watchInterval);
    
    watchInterval = setInterval(() => {
        state.session.videos[videoIndex].watchedSeconds++;
        state.session.totalVideoWatchTime++;
        renderVideos();
    }, 1000);
}

function completeVideo(index) {
    if (watchInterval) clearInterval(watchInterval);
    
    state.session.videos[index].status = 'completed';
    
    // Unlock next video
    if (index < state.session.videos.length - 1) {
        state.session.videos[index + 1].status = 'ready';
    }
    
    // Check if all videos done and enough watch time
    const allCompleted = state.session.videos.every(v => v.status === 'completed');
    const hasEnoughTime = state.session.totalVideoWatchTime >= REQUIRED_WATCH_TIME;
    
    if (allCompleted && hasEnoughTime) {
        // Unlock first target
        state.session.targets[0].status = 'ready';
    }
    
    renderVideos();
    renderTargets();
    updateProgress();
}

function renderTargets() {
    const container = document.getElementById('targets-container');
    container.innerHTML = '';
    
    state.session.targets.forEach((target, index) => {
        const card = document.createElement('div');
        card.className = `target-card ${target.status}`;
        
        const statusIcons = {
            locked: '🔒',
            ready: '▶',
            in_progress: '⏱️',
            done: '✓'
        };
        
        const statusLabels = {
            locked: 'Locked',
            ready: 'Ready',
            in_progress: 'In Progress',
            done: target.overtime > 0 ? `Done +${formatMinutes(target.overtime)}` : 'Done'
        };
        
        card.innerHTML = `
            <div class="target-icon ${target.status}">${statusIcons[target.status]}</div>
            <div class="target-info">
                <div class="target-name">${target.name}</div>
                <div class="target-time">${target.totalMinutes} min (min: ${target.minMinutes})</div>
            </div>
            <div class="target-status ${target.status}">${statusLabels[target.status]}</div>
            ${target.status === 'ready' ? `
                <button class="start-target-btn" onclick="startTarget(${index})">Start</button>
            ` : ''}
        `;
        
        container.appendChild(card);
    });
}

function startTarget(index) {
    state.currentTargetIndex = index;
    state.session.targets[index].status = 'in_progress';
    state.focusStartTime = Date.now();
    
    const target = state.session.targets[index];
    document.getElementById('focus-target-name').textContent = target.name;
    
    showScreen('focus-screen');
    startFocusTimer(target);
    scheduleFocusCheck();
}

function startFocusTimer(target) {
    const totalSeconds = target.totalMinutes * 60;
    const minSeconds = target.minMinutes * 60;
    
    state.focusTimer = setInterval(() => {
        const elapsed = (Date.now() - state.focusStartTime) / 1000;
        const remaining = totalSeconds - elapsed;
        
        const timerEl = document.getElementById('focus-timer');
        const overtimeLabel = document.getElementById('overtime-label');
        const stopBtn = document.getElementById('stop-target-btn');
        const focusScreen = document.getElementById('focus-screen');
        
        if (remaining <= 0) {
            // Overtime
            const overtime = Math.abs(remaining);
            timerEl.textContent = '+' + formatTime(overtime);
            overtimeLabel.classList.remove('hidden');
            focusScreen.classList.add('overtime');
        } else {
            timerEl.textContent = formatTime(remaining);
            overtimeLabel.classList.add('hidden');
            focusScreen.classList.remove('overtime');
        }
        
        // Show stop button after minimum time
        if (elapsed >= minSeconds) {
            stopBtn.classList.remove('hidden');
        }
    }, 1000);
}

function scheduleFocusCheck() {
    // Random check between 30-45 minutes
    const delay = (30 + Math.random() * 15) * 60 * 1000;
    
    setTimeout(() => {
        if (state.currentTargetIndex >= 0) {
            showFocusCheckModal();
        }
    }, delay);
}

let focusCheckCountdown = null;

function showFocusCheckModal() {
    showModal('focus-check-modal');
    let countdown = 10;
    document.getElementById('focus-check-countdown').textContent = countdown;
    
    focusCheckCountdown = setInterval(() => {
        countdown--;
        document.getElementById('focus-check-countdown').textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(focusCheckCountdown);
            hideModal('focus-check-modal');
            handleDistraction();
        }
    }, 1000);
}

function completeTarget() {
    clearInterval(state.focusTimer);
    
    const target = state.session.targets[state.currentTargetIndex];
    const elapsed = (Date.now() - state.focusStartTime) / 1000;
    const timeSpentMinutes = Math.floor(elapsed / 60);
    const overtime = Math.max(0, timeSpentMinutes - target.totalMinutes);
    
    target.status = 'done';
    target.timeSpent = timeSpentMinutes;
    target.overtime = overtime;
    
    // Unlock next target
    if (state.currentTargetIndex < state.session.targets.length - 1) {
        state.session.targets[state.currentTargetIndex + 1].status = 'ready';
    }
    
    // Show completion modal
    document.getElementById('completed-target-name').textContent = target.name + ' Done! ✅';
    showModal('target-complete-modal');
    
    // Check if all done
    const allDone = state.session.targets.every(t => t.status === 'done');
    
    if (allDone) {
        setTimeout(() => {
            hideModal('target-complete-modal');
            showRewardScreen();
        }, 2000);
    } else {
        setTimeout(() => {
            hideModal('target-complete-modal');
            showScreen('study-room-screen');
            renderTargets();
            updateProgress();
        }, 2000);
    }
    
    state.currentTargetIndex = -1;
    document.getElementById('focus-screen').classList.remove('overtime');
    document.getElementById('stop-target-btn').classList.add('hidden');
}

function updateProgress() {
    const completedVideos = state.session.videos.filter(v => v.status === 'completed').length;
    const completedTargets = state.session.targets.filter(t => t.status === 'done').length;
    const total = state.session.videos.length + state.session.targets.length;
    const percentage = ((completedVideos + completedTargets) / total) * 100;
    
    document.getElementById('overall-progress').style.width = percentage + '%';
}

function handleDistraction() {
    state.session.distractionCount++;
    
    const warning = document.getElementById('distraction-warning');
    document.getElementById('distraction-count').textContent = state.session.distractionCount;
    warning.classList.remove('hidden');
    
    setTimeout(() => {
        warning.classList.add('hidden');
    }, 3000);
    
    if (state.session.distractionCount >= 3) {
        // Lock session
        clearInterval(state.focusTimer);
        alert('Too many distractions! Session reset.');
        location.reload();
    }
}

function handleVisibilityChange() {
    if (document.hidden && state.session.isActive && state.currentTargetIndex >= 0) {
        handleDistraction();
    }
}

function showRewardScreen() {
    // Update stats
    state.stats.streakCount++;
    state.stats.lastCompletedDate = getTodayKey();
    
    // Add calendar mark
    state.calendarMarks.push({
        date: getTodayKey(),
        status: 'full'
    });
    
    saveState();
    
    // Mark session complete
    localStorage.setItem(`session-${getTodayKey()}`, JSON.stringify({
        sessionStarted: state.session.startTime,
        completed: true
    }));
    
    // Update reward screen
    const totalTime = state.session.targets.reduce((sum, t) => sum + t.timeSpent, 0);
    document.getElementById('total-time').textContent = formatMinutes(totalTime);
    document.getElementById('reward-streak').textContent = state.stats.streakCount + ' days';
    document.getElementById('targets-done').textContent = `${state.session.targets.length}/${state.session.targets.length}`;
    document.getElementById('distractions').textContent = state.session.distractionCount;
    
    showScreen('reward-screen');
    
    // Confetti effect (simple version)
    createConfetti();
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: hsl(${Math.random() * 360}, 100%, 50%);
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            animation: fall ${2 + Math.random() * 3}s linear forwards;
            z-index: 1000;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
    
    // Add fall animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============ CALENDAR ============
let currentCalendarMonth = new Date();

function updateCalendar() {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    
    document.getElementById('month-display').textContent = 
        currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Empty cells for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day';
        grid.appendChild(empty);
    }
    
    // Days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const dayEl = document.createElement('div');
        const date = new Date(year, month, d);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString().split('T')[0];
        
        let status = '';
        if (date > today) {
            status = 'future';
        } else {
            const mark = state.calendarMarks.find(m => m.date === dateKey);
            if (mark) {
                status = mark.status;
            }
        }
        
        const isToday = date.getTime() === today.getTime();
        
        dayEl.className = `calendar-day ${status} ${isToday ? 'today' : ''}`;
        dayEl.innerHTML = `
            <span>${d}</span>
            ${status === 'full' ? '<span class="icon">✓</span>' : ''}
            ${status === 'partial' ? '<span class="icon">⚠</span>' : ''}
            ${status === 'missed' ? '<span class="icon">✗</span>' : ''}
        `;
        
        grid.appendChild(dayEl);
    }
}

function navigateCalendar(direction) {
    currentCalendarMonth = new Date(
        currentCalendarMonth.getFullYear(),
        currentCalendarMonth.getMonth() + direction,
        1
    );
    updateCalendar();
}

// ============ AI DOUBT SOLVER ============
function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;
    
    input.value = '';
    
    const messagesContainer = document.getElementById('ai-messages');
    
    // Remove placeholder if exists
    const placeholder = messagesContainer.querySelector('.ai-placeholder');
    if (placeholder) placeholder.remove();
    
    // Add user message
    messagesContainer.innerHTML += `
        <div class="ai-message user">${message}</div>
    `;
    
    // Add AI response (placeholder - replace with actual API call)
    setTimeout(() => {
        messagesContainer.innerHTML += `
            <div class="ai-message assistant">
                ⚠️ AI not configured. To enable:
                <br>1. Get API key from ai.google.dev
                <br>2. Update the sendAIMessage function
                <br>3. Add your Gemini API integration
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
}

// ============ START APP ============
document.addEventListener('DOMContentLoaded', init);

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}

<<<<<<< HEAD
// Desktop OS JavaScript - Unified & Refactored

// ============ State Management ============
const windowState = {
    activeWindow: null,
    openWindows: [],
    zIndex: 100,
    chatInstances: {}, // Map<windowId, { sessionId, history, ... }>
    activeChatWindow: null,
    previewTimeout: null
};

// Settings State (Restored)
=======
// Desktop OS JavaScript

// State Management
const windowState = {
    activeWindow: null,
    openWindows: [],
    zIndex: 10
};

// Simple Markdown Parser (fallback for when marked.js doesn't work)
function simpleMarkdown(text) {
    if (!text) return '';

    let html = text;

    // PREPROCESSING: Fix concatenated patterns by adding newlines
    // Add newlines before list markers that follow other text
    html = html.replace(/([^\n])(\s*- )/g, '$1\n$2');
    html = html.replace(/([^\n])(\s*\* )/g, '$1\n$2');
    html = html.replace(/([^\n])(\s*\d+\. )/g, '$1\n$2');

    // Add newlines before headers
    html = html.replace(/([^\n])(#{1,6} )/g, '$1\n$2');

    // Add newlines before blockquotes
    html = html.replace(/([^\n])(> )/g, '$1\n$2');

    // Escape HTML
    html = html.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Code blocks (triple backticks)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function (match, lang, code) {
        return '<pre><code class="language-' + lang + '">' + code.trim() + '</code></pre>';
    });

    // Inline code (single backticks)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic (be careful not to match list markers)
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Unordered lists - match lines starting with - or *
    html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li>[\s\S]*?<\/li>)(\s*<li>)/g, '$1$2');
    html = html.replace(/(<li>.*<\/li>(\n|<br>)?)+/g, '<ul>$&</ul>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr>');

    // Paragraphs - convert double newlines to paragraph breaks
    html = html.replace(/\n\n+/g, '</p><p>');

    // Single newlines to <br>
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }

    // Clean up empty paragraphs and fix structure
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<br>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<br>/g, '$1');

    return html;
}

// Helper function to parse markdown - uses marked.js if available, falls back to simple parser
function parseMarkdown(text) {
    if (!text) return '';

    // Try marked.js first
    if (typeof marked !== 'undefined') {
        try {
            if (typeof marked.parse === 'function') {
                return marked.parse(text);
            } else if (typeof marked === 'function') {
                return marked(text);
            }
        } catch (e) {
            console.warn('marked.js error, using fallback:', e);
        }
    }

    // Fallback to simple parser
    return simpleMarkdown(text);
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function () {
    initClock();
    initWindowDragging();
    initKeyboardShortcuts();
    initClickOutside();
    applyTranslations();
    loadChatSessions();
    renderChatHistory();
    updateWidgetStats();
    loadCustomWidgets();
});

// ============ Window Management ============

function toggleWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;

    if (window.style.display === 'none') {
        openWindow(windowId);
    } else {
        closeWindow(windowId);
    }
}

function openWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;

    window.style.display = 'flex';
    window.classList.remove('closing');
    bringToFront(windowId);
    updateTaskbarButton(windowId, true);

    if (!windowState.openWindows.includes(windowId)) {
        windowState.openWindows.push(windowId);
    }

    // Add class to body to hide footer logo
    document.body.classList.add('window-open');
}

function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;

    window.classList.add('closing');

    setTimeout(() => {
        window.style.display = 'none';
        window.classList.remove('closing');
        updateTaskbarButton(windowId, false);

        const index = windowState.openWindows.indexOf(windowId);
        if (index > -1) {
            windowState.openWindows.splice(index, 1);
        }

        // Remove class from body if no windows are open
        if (windowState.openWindows.length === 0) {
            document.body.classList.remove('window-open');
        }
    }, 200);
}

function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;

    window.style.display = 'none';
    updateTaskbarButton(windowId, false);

    // Remove class from body if no windows are open
    if (windowState.openWindows.length === 0) {
        document.body.classList.remove('window-open');
    }
}

function toggleMaximize(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;

    window.classList.toggle('maximized');
}

function bringToFront(windowId) {
    windowState.zIndex++;
    const window = document.getElementById(windowId);
    if (window) {
        window.style.zIndex = windowState.zIndex;
        windowState.activeWindow = windowId;
    }
}

function updateTaskbarButton(windowId, isActive) {
    const btn = document.querySelector(`[data-window="${windowId}"]`);
    if (btn) {
        btn.classList.toggle('active', isActive);
    }
}

// ============ Start Menu ============

function toggleStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.classList.toggle('show');
}

function closeStartMenu() {
    const menu = document.getElementById('startMenu');
    menu.classList.remove('show');
}

// ============ User Menu ============

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// ============ Clock ============

function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();

    // Taskbar time
    const timeStr = now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const dateStr = now.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'numeric'
    });

    const taskbarTime = document.getElementById('taskbarTime');
    const taskbarDate = document.getElementById('taskbarDate');
    if (taskbarTime) taskbarTime.textContent = timeStr;
    if (taskbarDate) taskbarDate.textContent = dateStr;

    // Header bar clock
    const headerTime = document.getElementById('headerTime');
    const headerDate = document.getElementById('headerDate');
    if (headerTime) headerTime.textContent = timeStr;
    if (headerDate) {
        headerDate.textContent = now.toLocaleDateString('ar-SA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Widget clock
    const clockTime = document.getElementById('clockTime');
    const clockDate = document.getElementById('clockDate');
    if (clockTime) clockTime.textContent = timeStr;
    if (clockDate) {
        clockDate.textContent = now.toLocaleDateString('ar-SA', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }
}

// ============ Language ============

function setLanguage(lang) {
    fetch('/set_language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update localStorage
                localStorage.setItem('preferredLanguage', lang);
                // Reload page to apply changes
                window.location.reload();
            }
        }).catch(err => {
            console.error('Language change error:', err);
            window.location.reload();
        });
}

function applyTranslations() {
    const lang = document.documentElement.lang || 'ar';
    if (typeof translations === 'undefined') return;

    const trans = translations[lang] || translations['ar'];

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (trans[key]) {
            el.textContent = trans[key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (trans[key]) {
            el.placeholder = trans[key];
        }
    });

    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (trans[key]) {
            el.title = trans[key];
        }
    });
}

function toggleLanguage() {
    const currentLang = document.getElementById('currentLang').textContent;
    const newLang = currentLang === 'ع' ? 'en' : 'ar';
    setLanguage(newLang);
}

// ============ Window Dragging ============

function initWindowDragging() {
    document.querySelectorAll('.window-header').forEach(header => {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', function (e) {
            if (e.target.closest('.window-controls')) return;

            const window = header.closest('.app-window');
            if (window.classList.contains('maximized')) return;

            isDragging = true;
            bringToFront(window.id);

            const rect = window.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            window.style.transition = 'none';
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;

            const window = header.closest('.app-window');
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            window.style.left = startLeft + deltaX + 'px';
            window.style.top = startTop + deltaY + 'px';
            window.style.transform = 'none';
        });

        document.addEventListener('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                const window = header.closest('.app-window');
                window.style.transition = '';
            }
        });
    });
}

// ============ Keyboard Shortcuts ============

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Escape to close active window
        if (e.key === 'Escape') {
            if (windowState.activeWindow) {
                closeWindow(windowState.activeWindow);
            }
            closeStartMenu();
        }

        // Enter to send message
        if (e.key === 'Enter' && !e.shiftKey) {
            const input = document.getElementById('messageInput');
            if (document.activeElement === input) {
                e.preventDefault();
                sendMessage();
            }
        }
    });
}

// ============ Click Outside ============

function initClickOutside() {
    document.addEventListener('click', function (e) {
        // Close start menu when clicking outside
        const startMenu = document.getElementById('startMenu');
        const startBtn = document.querySelector('.start-btn');
        if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
            closeStartMenu();
        }

        // Close user dropdown when clicking outside
        const userDropdown = document.getElementById('userDropdown');
        const userBtn = document.querySelector('.user-btn');
        if (userDropdown && !userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
}

// ============ Chat Functions ============

let conversationHistory = [];
let currentSessionId = null;
let chatSessions = [];

// Global variables for streaming control
let activeEventSource = null;
let isStreaming = false;

// Load chat sessions from localStorage
function loadChatSessions() {
    const saved = localStorage.getItem('chatSessions');
    if (saved) {
        chatSessions = JSON.parse(saved);
        renderChatHistory();
    }
}

// Save chat sessions to localStorage
function saveChatSessions() {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
}

// Render chat history in sidebar
function renderChatHistory() {
    const historyList = document.getElementById('chatHistoryList');
    if (!historyList) return;

    if (chatSessions.length === 0) {
        historyList.innerHTML = '<div class="no-history">لا توجد محادثات سابقة</div>';
        return;
    }

    historyList.innerHTML = chatSessions.map((session, index) => `
        <div class="history-item ${session.id === currentSessionId ? 'active' : ''}" 
             onclick="loadSession('${session.id}')" data-session="${session.id}">
            <div class="history-item-content">
                <span class="history-title">${session.title || 'محادثة جديدة'}</span>
                <span class="history-date">${formatDate(session.timestamp)}</span>
            </div>
            <button class="history-delete" onclick="event.stopPropagation(); deleteSession('${session.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
    return date.toLocaleDateString('ar-SA');
}

// Create new chat session
function newChat() {
    // Save current session if it has messages
    if (currentSessionId && conversationHistory.length > 0) {
        saveCurrentSession();
    }

    // Reset state - session will be created on first message
    conversationHistory = [];
    currentSessionId = null;

    renderChatHistory();

    const messagesContainer = document.getElementById('chatMessages');
    const welcomeScreen = document.getElementById('welcomeScreen');

    // Clear messages and show welcome screen
    if (messagesContainer && welcomeScreen) {
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(welcomeScreen);
        welcomeScreen.style.display = 'flex';
    }

    const input = document.getElementById('messageInput');
    if (input) input.value = '';
}

// Save current session
function saveCurrentSession() {
    const session = chatSessions.find(s => s.id === currentSessionId);
    if (session) {
        session.messages = conversationHistory;
        if (conversationHistory.length > 0) {
            // Use first user message as title
            const firstUserMsg = conversationHistory.find(m => m.type === 'user');
            if (firstUserMsg) {
                session.title = firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
            }
        }
        saveChatSessions();
        renderChatHistory();
    }
}

// Load a session
function loadSession(sessionId) {
    // Save current session first
    if (currentSessionId && conversationHistory.length > 0) {
        saveCurrentSession();
    }

    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    currentSessionId = sessionId;
    conversationHistory = session.messages || [];

    // Render messages
    const messagesContainer = document.getElementById('chatMessages');
    const welcomeScreen = document.getElementById('welcomeScreen');

    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';

    if (conversationHistory.length === 0) {
        if (welcomeScreen) {
            messagesContainer.appendChild(welcomeScreen);
            welcomeScreen.style.display = 'flex';
        }
    } else {
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        conversationHistory.forEach(msg => {
            addMessageToDOM(msg.text, msg.type);
        });
    }

    renderChatHistory();
}

// Delete a session
function deleteSession(sessionId) {
    chatSessions = chatSessions.filter(s => s.id !== sessionId);
    saveChatSessions();

    if (sessionId === currentSessionId) {
        if (chatSessions.length > 0) {
            loadSession(chatSessions[0].id);
        } else {
            newChat();
        }
    } else {
        renderChatHistory();
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    // Create a new session if one doesn't exist (first message)
    if (!currentSessionId) {
        currentSessionId = generateSessionId();
        const newSession = {
            id: currentSessionId,
            title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            timestamp: Date.now(),
            messages: []
        };
        chatSessions.unshift(newSession);
        saveChatSessions();
        renderChatHistory();
    }

    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    // Add user message to history first
    conversationHistory.push({ text: message, type: 'user', timestamp: Date.now() });

    // Add user message to DOM
    addMessageToDOM(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Change button to stop icon
    toggleSendButton(true);
    isStreaming = true;

    // Always use streaming for real-time response
    const url = '/stream-chat?' + new URLSearchParams({
        message: message,
        session_id: currentSessionId || ''
    });

    console.log('[Chat] Sending message to session:', currentSessionId);

    const eventSource = new EventSource(url);
    activeEventSource = eventSource;

    let botMessageDiv = null;
    let botContent = null;
    let fullResponse = '';
    let hasError = false;

    eventSource.onmessage = function (event) {
        // Hide typing indicator on first chunk
        if (!botMessageDiv) {
            hideTypingIndicator();
        }

        // Decode the JSON-encoded chunk
        let chunk;
        try {
            chunk = JSON.parse(event.data);
        } catch (e) {
            // Fallback for non-JSON data
            chunk = event.data;
        }

        fullResponse += chunk;

        // Create bot message div if it doesn't exist
        if (!botMessageDiv) {
            const container = document.getElementById('chatMessages');
            botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = 'AI';

            botContent = document.createElement('div');
            botContent.className = 'message-content';

            botMessageDiv.appendChild(avatar);
            botMessageDiv.appendChild(botContent);
            container.appendChild(botMessageDiv);
        }

        // Clean up raw response BEFORE markdown parsing
        let cleanedResponse = fullResponse
            // Remove leading/trailing whitespace and newlines
            .trim()
            // Remove excessive newlines at the beginning (keep max 1)
            .replace(/^(\n|\r\n|\r)+/, '')
            // Remove excessive newlines (more than 2 consecutive)
            .replace(/(\n|\r\n|\r){3,}/g, '\n\n')
            // Remove newlines right before tables
            .replace(/(\n|\r\n|\r)+(\|.*\|)/g, '\n$2')
            // Remove newlines right before markdown headers
            .replace(/(\n|\r\n|\r)+(\#{1,6}\s)/g, '\n$2');

        // Check if content is already HTML (starts with HTML tag)
        const isHTML = cleanedResponse.trim().startsWith('<');

        let parsedContent;
        if (isHTML) {
            // If it's already HTML, use it directly (don't convert newlines to br)
            parsedContent = cleanedResponse;
        } else {
            // Parse markdown only if it's not HTML
            parsedContent = parseMarkdown(cleanedResponse);
        }

        // Clean up excessive HTML elements after parsing
        parsedContent = parsedContent
            // Remove all br tags at the very beginning
            .replace(/^(\s*<br\s*\/?>\s*)+/gi, '')
            // Remove all br tags at the very end
            .replace(/(\s*<br\s*\/?>\s*)+$/gi, '')
            // Remove multiple consecutive br tags (keep max 1)
            .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
            // Remove br before and after tables
            .replace(/<br\s*\/?>\s*(<table)/gi, '$1')
            .replace(/(<\/table>)\s*<br\s*\/?>/gi, '$1')
            // Remove br after opening p tag
            .replace(/(<p>)\s*<br\s*\/?>/gi, '$1')
            // Remove br before closing p tag
            .replace(/<br\s*\/?>\s*(<\/p>)/gi, '$1')
            // Remove empty paragraphs
            .replace(/<p>\s*<\/p>/gi, '')
            // Remove paragraphs with only br
            .replace(/<p>\s*(<br\s*\/?>)+\s*<\/p>/gi, '')
            // Remove leading empty paragraphs or whitespace
            .replace(/^(\s*<p>\s*<\/p>\s*)+/gi, '')
            // Remove paragraphs between tables
            .replace(/(<\/table>)\s*<p>\s*<\/p>\s*(<table)/gi, '$1\n$2')
            // Remove empty paragraphs with only whitespace
            .replace(/<p>\s*(&nbsp;|\u00A0|\s)*\s*<\/p>/gi, '');

        // Debug: log the content to see what's happening
        console.log('[Debug] Raw response length:', fullResponse.length);
        console.log('[Debug] Cleaned response (first 200 chars):', cleanedResponse.substring(0, 200));
        console.log('[Debug] Parsed content (first 500 chars):', parsedContent.substring(0, 500));

        botContent.innerHTML = parsedContent;

        // Scroll to bottom
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    };

    eventSource.onerror = function (error) {
        hideTypingIndicator();
        toggleSendButton(false);
        isStreaming = false;
        activeEventSource = null;
        hasError = true;
        eventSource.close();

        console.error('Streaming error:', error);

        if (!fullResponse) {
            // No response received, show error message
            addMessageToDOM('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot');
            conversationHistory.push({ text: 'حدث خطأ في الاتصال', type: 'bot', timestamp: Date.now() });
        } else {
            // Partial response received, save it
            conversationHistory.push({ text: fullResponse, type: 'bot', timestamp: Date.now() });
        }

        saveCurrentSession();
    };

    eventSource.addEventListener('end', function (event) {
        eventSource.close();
        toggleSendButton(false);
        isStreaming = false;
        activeEventSource = null;

        if (!hasError && fullResponse) {
            // Save complete response to history
            conversationHistory.push({ text: fullResponse, type: 'bot', timestamp: Date.now() });
            saveCurrentSession();
        }
    });

    // Timeout safety - close after 5 minutes
    setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
            eventSource.close();
            toggleSendButton(false);
            isStreaming = false;
            activeEventSource = null;
            if (fullResponse) {
                conversationHistory.push({ text: fullResponse, type: 'bot', timestamp: Date.now() });
                saveCurrentSession();
            }
        }
    }, 300000);
}

// Toggle send button between send and stop icons
function toggleSendButton(showStop) {
    const sendIcon = document.getElementById('sendIcon');
    const stopIcon = document.getElementById('stopIcon');

    if (sendIcon && stopIcon) {
        if (showStop) {
            sendIcon.style.display = 'none';
            stopIcon.style.display = 'block';
        } else {
            sendIcon.style.display = 'block';
            stopIcon.style.display = 'none';
        }
    }
}

// Handle send button click - either send or stop
function handleSendButton() {
    if (isStreaming && activeEventSource) {
        // Stop streaming
        activeEventSource.close();
        activeEventSource = null;
        isStreaming = false;
        toggleSendButton(false);
        hideTypingIndicator();
    } else {
        // Send message
        sendMessage();
    }
}

function sendQuickMessage(message) {
    document.getElementById('messageInput').value = message;
    sendMessage();
}

// Clear all chat history
function clearHistory() {
    if (confirm('هل أنت متأكد من مسح جميع المحادثات؟')) {
        chatSessions = [];
        conversationHistory = [];
        currentSessionId = null;
        saveChatSessions();
        renderChatHistory();

        // Reset to welcome screen
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (messagesContainer && welcomeScreen) {
            messagesContainer.innerHTML = '';
            messagesContainer.appendChild(welcomeScreen);
            welcomeScreen.style.display = 'flex';
        }

        // Update stats
        updateWidgetStats();
    }
}

// Update widget statistics
function updateWidgetStats() {
    const totalChats = document.getElementById('totalChats');
    const todayChats = document.getElementById('todayChats');
    const totalMessages = document.getElementById('totalMessages');

    if (totalChats) totalChats.textContent = chatSessions.length;
    if (todayChats) {
        const today = new Date().toDateString();
        const todayCount = chatSessions.filter(s => new Date(s.timestamp).toDateString() === today).length;
        todayChats.textContent = todayCount;
    }
    if (totalMessages) {
        let msgCount = 0;
        chatSessions.forEach(s => { msgCount += (s.messages?.length || 0); });
        totalMessages.textContent = msgCount > 999 ? (msgCount / 1000).toFixed(1) + 'K' : msgCount;
    }
}

// Add message to DOM only (no save)
function addMessageToDOM(text, type) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? 'أ' : 'AI';

    const content = document.createElement('div');
    content.className = 'message-content';

    // Parse Markdown for bot messages
    if (type === 'bot') {
        content.innerHTML = parseMarkdown(text);
    } else {
        content.textContent = text;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    container.appendChild(messageDiv);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Add message and save to history
function addMessage(text, type) {
    // Add to DOM
    addMessageToDOM(text, type);

    // Save to conversation history
    conversationHistory.push({ text, type, timestamp: Date.now() });

    // Update session
    saveCurrentSession();
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');

    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============ Utility Functions ============

function attachFile() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            // Handle file upload
            console.log('File selected:', file.name);
        }
    };
    input.click();
}

function voiceInput() {
    // Voice input functionality
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = document.documentElement.lang === 'ar' ? 'ar-SA' : 'en-US';
        recognition.onresult = function (event) {
            const text = event.results[0][0].transcript;
            document.getElementById('messageInput').value = text;
        };
        recognition.start();
    } else {
        alert('المتصفح لا يدعم الإدخال الصوتي');
    }
}

// ============ Custom Widgets ============

async function loadCustomWidgets() {
    try {
        // Get ALL widgets (not just active) to know which ones to hide
        const response = await fetch('/api/widgets');
        const data = await response.json();
        const allWidgets = data.widgets || [];

        // Update default widget visibility based on active state
        updateDefaultWidgets(allWidgets);

        // Load only active custom widgets
        const activeCustomWidgets = allWidgets.filter(w => w.type === 'custom' && w.html_content && w.active);
        renderCustomWidgets(activeCustomWidgets);

    } catch (error) {
        console.error('Error loading widgets:', error);
    }
}

function updateDefaultWidgets(allWidgets) {
    const defaultWidgetIds = ['ai-models', 'chat-stats', 'system-status', 'quick-actions'];

    defaultWidgetIds.forEach(widgetId => {
        const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
        if (widgetElement) {
            const widgetData = allWidgets.find(w => w.id === widgetId);
            // Hide if widget exists in data and is not active
            if (widgetData && widgetData.active === false) {
                widgetElement.style.display = 'none';
            } else {
                widgetElement.style.display = '';
            }
        }
    });
}

function renderCustomWidgets(widgets) {
    const container = document.getElementById('customWidgetsContainer');
    if (!container) return;

    container.innerHTML = widgets.map(widget => `
        <div class="desktop-widget custom-widget" data-widget-id="${widget.id}">
            <div class="widget-header">
                <div class="widget-icon custom-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <circle cx="17.5" cy="17.5" r="3.5"/>
                    </svg>
                </div>
                <span class="widget-title">${widget.name}</span>
            </div>
            <div class="widget-body">
                ${widget.html_content}
            </div>
        </div>
    `).join('');
}

// ============ Advanced Settings ============

>>>>>>> c246036aed8941c43a9b1565584aabf71651f10a
const settingsState = {
    aiModel: 'gpt-4o',
    aiProvider: 'openai',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    systemPrompt: 'أنت مساعد ذكاء اصطناعي متقدم. تتحدث العربية بطلاقة وتقدم إجابات دقيقة ومفيدة.',
    expertMode: false,
    showTimestamps: true,
    streamResponses: true,
    markdownEnabled: true,
    codeHighlight: true,
    autoDarkMode: false,
    animationsEnabled: true,
    notificationsEnabled: true,
    soundEnabled: true,
    desktopNotifications: false,
    saveHistory: true,
    clearOnClose: false,
    timezone: 'Asia/Riyadh'
};

<<<<<<< HEAD
let chatSessions = [];
// conversationHistory/currentSessionId removed in favor of instance state, 
// but we might keep them as generic globals for backward compatibility if needed (but prefer not to).

// ============ DOM Initialization ============
document.addEventListener('DOMContentLoaded', function () {
    initClock();
    initWindowDragging();
    initKeyboardShortcuts();
    initClickOutside();
    initSettings(); // Restore settings

    loadChatSessions(); // Load global sessions list
    updateWidgetStats();
    loadCustomWidgets();

    applyTranslations();

    // Initialize Taskbar Events
    initTaskbarEvents();

    // Global Event Delegation
    initGlobalDelegation();
});

// ============ Window Management ============

function generateWindowId(prefix = 'window') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function createChatWindow(sessionId = null) {
    const template = document.getElementById('chat-window-template');
    if (!template) return;

    const windowId = generateWindowId('chatWindow');
    const clone = template.content.cloneNode(true);
    const windowEl = clone.querySelector('.app-window');

    windowEl.id = windowId;
    windowEl.style.display = 'none';
    windowEl.style.zIndex = ++windowState.zIndex;

    // Initialize Instance State
    windowState.chatInstances[windowId] = {
        id: windowId,
        sessionId: sessionId || null,
        history: [],
        isStreaming: false,
        eventSource: null,
        abortController: null
    };

    document.getElementById('windowsContainer').appendChild(windowEl);

    if (sessionId) {
        loadSessionIntoWindow(windowId, sessionId);
    } else {
        // New Chat Setup
        const welcome = windowEl.querySelector('.welcome-screen');
        const msgs = windowEl.querySelector('.chat-messages');
        if (welcome && msgs) {
            msgs.innerHTML = '';
            msgs.appendChild(welcome);
            welcome.style.display = 'flex';
        }
    }

    // Render this window's history sidebar immediately
    renderChatHistoryForWindow(windowEl);

    openWindow(windowId);
    toggleMaximize(windowId);

    updateTaskbar();
    return windowId;
}

function openWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;

    windowEl.style.display = 'flex';
    requestAnimationFrame(() => {
        windowEl.classList.remove('closing');
        windowEl.classList.add('opening');
    });

    bringToFront(windowId);

    if (!windowState.openWindows.includes(windowId)) {
        windowState.openWindows.push(windowId);
    }

    document.body.classList.add('window-open');
    updateTaskbar();
}

function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;

    windowEl.classList.add('closing');

    // Clean up if it's a chat window
    if (windowState.chatInstances[windowId]) {
        stopGeneration(windowId);
        delete windowState.chatInstances[windowId];
    }

    setTimeout(() => {
        // If it was dynamically created (chat), remove it. 
        // If it's a static window (settings), just hide it.
        if (windowId.startsWith('chatWindow-')) {
            windowEl.remove();
        } else {
            windowEl.style.display = 'none';
            windowEl.classList.remove('closing');
        }

        const index = windowState.openWindows.indexOf(windowId);
        if (index > -1) {
            windowState.openWindows.splice(index, 1);
        }

        if (windowState.openWindows.length === 0) {
            document.body.classList.remove('window-open');
        }
        updateTaskbar();
    }, 200);
}

function minimizeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    windowEl.style.display = 'none';
    updateTaskbar(); // Should uncheck active state
}

function toggleMaximize(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;
    windowEl.classList.toggle('maximized');
}

function bringToFront(windowId) {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
        windowState.zIndex++;
        windowEl.style.zIndex = windowState.zIndex;
        windowState.activeWindow = windowId;

        document.querySelectorAll('.app-window').forEach(w => w.classList.remove('active'));
        windowEl.classList.add('active');
    }
}

// ============ Taskbar & Previews ============

function initTaskbarEvents() {
    const chatBtn = document.getElementById('taskbarChatBtn');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => createChatWindow());
        chatBtn.addEventListener('mouseenter', showTaskbarPreviews);
        chatBtn.addEventListener('mouseleave', hideTaskbarPreviews);
    }

    const container = document.getElementById('taskbar-previews-container');
    if (container) {
        container.addEventListener('mouseenter', () => {
            clearTimeout(windowState.previewTimeout);
            container.classList.add('show');
        });
        container.addEventListener('mouseleave', hideTaskbarPreviews);
    }
}

function updateTaskbar() {
    const chatBtn = document.getElementById('taskbarChatBtn');
    const openChats = windowState.openWindows.filter(id => windowState.chatInstances[id]);

    if (chatBtn) {
        chatBtn.classList.toggle('active', openChats.length > 0);
    }

    // Update other static buttons
    ['settingsWindow', 'adminWindow', 'widgetsWindow'].forEach(id => {
        const btn = document.querySelector(`[data-window="${id}"]`);
        if (btn) btn.classList.toggle('active', windowState.openWindows.includes(id));
    });
}

function showTaskbarPreviews() {
    const container = document.getElementById('taskbar-previews-container');
    if (!container) return;

    const openChats = windowState.openWindows
        .filter(id => windowState.chatInstances[id])
        .map(id => {
            const win = document.getElementById(id);
            const title = win ? win.querySelector('.window-title-text').textContent : 'Chat';
            // Try to find subtitle/session title
            const instance = windowState.chatInstances[id];
            let sub = 'New Chat';
            if (instance.sessionId) {
                const s = chatSessions.find(x => x.id === instance.sessionId);
                if (s) sub = s.title;
            }
            return { id, title: sub }; // Use session title
        });

    if (openChats.length === 0) return;

    container.innerHTML = openChats.map(chat => `
        <div class="taskbar-preview-item" onclick="activateWindowFromPreview('${chat.id}')">
            <div class="preview-title">${chat.title}</div>
            <div class="preview-actions">
                <button class="preview-close" onclick="event.stopPropagation(); closeWindow('${chat.id}')">×</button>
            </div>
        </div>
    `).join('');

    container.classList.add('show');

    const btn = document.getElementById('taskbarChatBtn');
    const rect = btn.getBoundingClientRect();
    container.style.left = (rect.left - (container.offsetWidth / 2) + (rect.width / 2)) + 'px';
    container.style.bottom = '60px';

    // Make visible to calculate width? It's already flex but opacity 0.
    // Dimensions should be available.
}

function hideTaskbarPreviews() {
    windowState.previewTimeout = setTimeout(() => {
        const container = document.getElementById('taskbar-previews-container');
        if (container) container.classList.remove('show');
    }, 200);
}

window.activateWindowFromPreview = function (windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        if (win.style.display === 'none') win.style.display = 'flex';
        bringToFront(windowId);
        hideTaskbarPreviews();
    }
};

// ============ Global Delegation ============

function initGlobalDelegation() {
    document.addEventListener('click', function (e) {
        const target = e.target;
        const actionBtn = target.closest('[data-action]');

        if (actionBtn) {
            const action = actionBtn.dataset.action;
            const windowEl = actionBtn.closest('.app-window');
            const windowId = windowEl ? windowEl.id : null;

            if (windowId) {
                switch (action) {
                    case 'close': closeWindow(windowId); break;
                    case 'minimize': minimizeWindow(windowId); break;
                    case 'maximize': toggleMaximize(windowId); break;
                    case 'new-chat': createChatWindow(); break;
                    case 'toggle-view': toggleSidebarView(windowId, actionBtn.dataset.view); break;
                    case 'send-message': sendMessage(windowId); break;
                    case 'toggle-voice': toggleVoiceInput(windowId); break;
                    case 'quick-message':
                        setInputValue(windowId, actionBtn.dataset.message);
                        sendMessage(windowId);
                        break;
                    case 'toggle-search': toggleChatSearch(windowId); break;
                    case 'toggle-settings':
                        openWindow('settingsWindow');
                        showSettingsTab('chat');
                        break;
                    case 'attach-file': attachFile(windowId); break;
                    case 'insert-emoji': insertEmoji(windowId); break;
                    case 'export-chat': exportChat(windowId); break;
                }
            }

            // Sidebar Toggles handled above
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.target.classList.contains('message-input') && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const windowEl = e.target.closest('.app-window');
            if (windowEl) sendMessage(windowEl.id);
        }
    });

    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('message-input')) {
            autoResizeTextarea(e.target);
        }
    });
}

// ============ Chat Logic ============

function sendMessage(windowId) {
    const instance = windowState.chatInstances[windowId];
    if (!instance) return;

    const windowEl = document.getElementById(windowId);
    const input = windowEl.querySelector('.message-input');
    const message = input.value.trim();

    if (!message) return;

    input.value = '';
    input.style.height = 'auto';

    const welcome = windowEl.querySelector('.welcome-screen');
    if (welcome) welcome.style.display = 'none';

    if (!instance.sessionId) {
        instance.sessionId = generateSessionId();
        const newSession = {
            id: instance.sessionId,
            title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            timestamp: Date.now(),
            messages: []
        };
        chatSessions.unshift(newSession);
        saveChatSessions();
        refreshAllSidebars();
    }

    addMessageToWindow(windowId, message, 'user');
    instance.history.push({ text: message, type: 'user', timestamp: Date.now() });
    updateSessionHistory(instance.sessionId, instance.history);

    showTyping(windowId);

    const url = '/stream-chat?' + new URLSearchParams({
        message: message,
        session_id: instance.sessionId
    });

    const eventSource = new EventSource(url);
    instance.eventSource = eventSource;
    instance.isStreaming = true;

    let botMsgEl = null;
    let fullResponse = '';

    // STOP Handler
    const sendBtn = windowEl.querySelector('[data-action="send-message"]');
    if (sendBtn) {
        sendBtn.querySelector('.send-icon').style.display = 'none';
        sendBtn.querySelector('.stop-icon').style.display = 'block';
        // Need to change action or onclick to stop?
        // Actually delegation checks 'send-message'. 
        // We should temporarily change data-action or handle state in delegation.
        // Simplified: Global toggle.
    }

    let updatePending = false;

    eventSource.onmessage = function (event) {
        if (!botMsgEl) {
            hideTyping(windowId);
            botMsgEl = createMessageElement('bot');
            windowEl.querySelector('.chat-messages').appendChild(botMsgEl);
        }

        let chunk;
        try { chunk = JSON.parse(event.data); } catch (e) { chunk = event.data; }

        fullResponse += chunk;

        if (!updatePending) {
            updatePending = true;
            requestAnimationFrame(() => {
                const contentDiv = botMsgEl.querySelector('.message-content');
                contentDiv.innerHTML = parseMarkdown(fullResponse);
                scrollToBottom(windowId);
                updatePending = false;
            });
        }
    };

    const cleanup = () => {
        eventSource.close();
        instance.isStreaming = false;
        instance.eventSource = null;
        if (sendBtn) {
            sendBtn.querySelector('.send-icon').style.display = 'block';
            sendBtn.querySelector('.stop-icon').style.display = 'none';
        }
    };

    eventSource.onerror = function (err) {
        cleanup();
        instance.history.push({ text: fullResponse, type: 'bot', timestamp: Date.now() });
        updateSessionHistory(instance.sessionId, instance.history);
    };

    // We need to implement stop button logic in delegation or here.
}

function addMessageToWindow(windowId, text, type) {
    const windowEl = document.getElementById(windowId);
    const container = windowEl.querySelector('.chat-messages');
    const msgEl = createMessageElement(type);
    const content = msgEl.querySelector('.message-content');

    if (type === 'bot') content.innerHTML = parseMarkdown(text);
    else content.textContent = text;

    container.appendChild(msgEl);
    scrollToBottom(windowId);
}

function createMessageElement(type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `
        <div class="message-avatar">${type === 'user' ? '👤' : 'AI'}</div>
        <div class="message-content"></div>
    `;
    return div;
}

function showTyping(windowId) {
    const windowEl = document.getElementById(windowId);
    const container = windowEl.querySelector('.chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>
    `;
    container.appendChild(indicator);
    scrollToBottom(windowId);
}

function hideTyping(windowId) {
    const windowEl = document.getElementById(windowId);
    const indicator = windowEl.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

function scrollToBottom(windowId) {
    const windowEl = document.getElementById(windowId);
    const container = windowEl.querySelector('.chat-messages');
    container.scrollTop = container.scrollHeight;
}

function stopGeneration(windowId) {
    const instance = windowState.chatInstances[windowId];
    if (instance && instance.eventSource) {
        instance.eventSource.close();
        instance.isStreaming = false;
        hideTyping(windowId);
    }
}

// ============ Session Management ============

function loadChatSessions() {
    const saved = localStorage.getItem('chatSessions');
    if (saved) chatSessions = JSON.parse(saved);
}

function saveChatSessions() {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    updateWidgetStats();
}

function updateSessionHistory(sessionId, history) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
        session.messages = history;
        saveChatSessions();
    }
}

// Global function required for onclick in renderChatHistory (if we use strings)
window.loadSession = function (sessionId, element) {
    if (!element) return;
    const windowEl = element.closest('.app-window');
    if (windowEl) {
        loadSessionIntoWindow(windowEl.id, sessionId);
    }
};

window.deleteSession = function (sessionId) {
    chatSessions = chatSessions.filter(s => s.id !== sessionId);
    saveChatSessions();
    refreshAllSidebars();
};

function loadSessionIntoWindow(windowId, sessionId) {
    const instance = windowState.chatInstances[windowId];
    if (!instance) return;

    stopGeneration(windowId); // Stop current if any

    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    instance.sessionId = sessionId;
    instance.history = session.messages || [];

    const windowEl = document.getElementById(windowId);
    const msgs = windowEl.querySelector('.chat-messages');
    const welcome = windowEl.querySelector('.welcome-screen');

    msgs.innerHTML = '';

    if (instance.history.length === 0) {
        if (welcome) {
            msgs.appendChild(welcome);
            welcome.style.display = 'flex';
        }
    } else {
        if (welcome) welcome.style.display = 'none';
        instance.history.forEach(msg => addMessageToWindow(windowId, msg.text, msg.type));
    }

    // Highlight sidebar item
    const sidebar = windowEl.querySelector('.chat-history-list');
    if (sidebar) {
        sidebar.querySelectorAll('.history-item').forEach(item => {
            item.classList.toggle('active', item.dataset.session === sessionId);
        });
    }
}

function refreshAllSidebars() {
    Object.keys(windowState.chatInstances).forEach(id => {
        const win = document.getElementById(id);
        if (win) renderChatHistoryForWindow(win);
    });
}

function renderChatHistoryForWindow(windowEl) {
    const list = windowEl.querySelector('.chat-history-list');
    if (!list) return;

    const windowId = windowEl.id;
    const currentSession = windowState.chatInstances[windowId]?.sessionId;

    if (chatSessions.length === 0) {
        list.innerHTML = '<div class="no-history" data-i18n="noHistory">لا توجد محادثات سابقة</div>';
        return;
    }

    list.innerHTML = chatSessions.map(session => `
        <div class="history-item ${session.id === currentSession ? 'active' : ''}" 
             onclick="loadSession('${session.id}', this)" data-session="${session.id}">
            <div class="history-item-content">
                <span class="history-title">${session.title || 'محادثة جديدة'}</span>
                <span class="history-date">${formatDate(session.timestamp)}</span>
            </div>
            <button class="history-delete" onclick="event.stopPropagation(); deleteSession('${session.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} س`;
    return date.toLocaleDateString('ar-SA');
}

// ============ Settings System (Restored) ============

function initSettings() {
    const saved = localStorage.getItem('appSettings');
    if (saved) Object.assign(settingsState, JSON.parse(saved));
    applySettingsToUI();
    setupSettingsEventListeners();
}

=======
// Initialize settings on load
function initSettings() {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('appSettings');
    if (saved) {
        Object.assign(settingsState, JSON.parse(saved));
    }

    // Apply settings to UI
    applySettingsToUI();

    // Setup event listeners
    setupSettingsEventListeners();
}

// Show settings tab
function showSettingsTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all nav items
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById('tab-' + tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activate nav item
    const navItems = document.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
        if (item.textContent.trim().toLowerCase().includes(tabName) ||
            item.onclick?.toString().includes(tabName)) {
            item.classList.add('active');
        }
    });

    // Find the correct nav item by its onclick handler
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        const onclickStr = item.getAttribute('onclick');
        if (onclickStr && onclickStr.includes(`'${tabName}'`)) {
            item.classList.add('active');
        }
    });
}

// Apply settings state to UI elements
function applySettingsToUI() {
    // AI Model
    const modelSelect = document.getElementById('aiModelSelect');
    if (modelSelect) modelSelect.value = settingsState.aiModel;

    // AI Provider
    const providerSelect = document.getElementById('aiProvider');
    if (providerSelect) providerSelect.value = settingsState.aiProvider;

    // Temperature
    const tempSlider = document.getElementById('temperatureSlider');
    const tempValue = document.getElementById('temperatureValue');
    if (tempSlider) {
        tempSlider.value = settingsState.temperature * 100;
        if (tempValue) tempValue.textContent = settingsState.temperature;
    }

    // Top P
    const topPSlider = document.getElementById('topPSlider');
    const topPValue = document.getElementById('topPValue');
    if (topPSlider) {
        topPSlider.value = settingsState.topP * 100;
        if (topPValue) topPValue.textContent = settingsState.topP;
    }

    // Max Tokens
    const maxTokensSelect = document.getElementById('maxTokens');
    if (maxTokensSelect) maxTokensSelect.value = settingsState.maxTokens;

    // System Prompt
    const systemPrompt = document.getElementById('systemPrompt');
    if (systemPrompt) systemPrompt.value = settingsState.systemPrompt;

    // Toggle switches
    const toggles = {
        'autoDarkMode': settingsState.autoDarkMode,
        'animationsEnabled': settingsState.animationsEnabled,
        'expertMode': settingsState.expertMode,
        'showTimestamps': settingsState.showTimestamps,
        'streamResponses': settingsState.streamResponses
    };

    Object.entries(toggles).forEach(([id, value]) => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = value;
    });

    // Timezone
    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) timezoneSelect.value = settingsState.timezone;

    // Apply animations setting
    if (!settingsState.animationsEnabled) {
        document.body.classList.add('no-animations');
    }
}

// Setup all event listeners for settings
function setupSettingsEventListeners() {
    // Temperature Slider
    const tempSlider = document.getElementById('temperatureSlider');
    if (tempSlider) {
        tempSlider.addEventListener('input', function () {
            const value = (parseInt(this.value) / 100).toFixed(1);
            document.getElementById('temperatureValue').textContent = value;
            settingsState.temperature = parseFloat(value);
            saveSettings();
        });
    }

    // Top P Slider
    const topPSlider = document.getElementById('topPSlider');
    if (topPSlider) {
        topPSlider.addEventListener('input', function () {
            const value = (parseInt(this.value) / 100).toFixed(1);
            document.getElementById('topPValue').textContent = value;
            settingsState.topP = parseFloat(value);
            saveSettings();
        });
    }

    // AI Model Select
    const modelSelect = document.getElementById('aiModelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', function () {
            settingsState.aiModel = this.value;
            saveSettings();
            showSettingsNotification('تم تغيير نموذج الذكاء الاصطناعي');
        });
    }

    // AI Provider Select
    const providerSelect = document.getElementById('aiProvider');
    if (providerSelect) {
        providerSelect.addEventListener('change', function () {
            settingsState.aiProvider = this.value;
            saveSettings();
            showSettingsNotification('تم تغيير مزود الخدمة');
        });
    }

    // Max Tokens
    const maxTokensSelect = document.getElementById('maxTokens');
    if (maxTokensSelect) {
        maxTokensSelect.addEventListener('change', function () {
            settingsState.maxTokens = parseInt(this.value);
            saveSettings();
        });
    }

    // System Prompt
    const systemPrompt = document.getElementById('systemPrompt');
    if (systemPrompt) {
        systemPrompt.addEventListener('change', function () {
            settingsState.systemPrompt = this.value;
            saveSettings();
            showSettingsNotification('تم تحديث تعليمات النظام');
        });
    }

    // Timezone
    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) {
        timezoneSelect.addEventListener('change', function () {
            settingsState.timezone = this.value;
            saveSettings();
        });
    }

    // Toggle Switches
    setupToggleListeners();
}

// Setup toggle switch listeners
function setupToggleListeners() {
    const toggleMappings = {
        'autoDarkMode': { key: 'autoDarkMode', action: null },
        'animationsEnabled': { key: 'animationsEnabled', action: toggleAnimations },
        'expertMode': { key: 'expertMode', action: null },
        'showTimestamps': { key: 'showTimestamps', action: null },
        'streamResponses': { key: 'streamResponses', action: null }
    };

    Object.entries(toggleMappings).forEach(([id, config]) => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', function () {
                settingsState[config.key] = this.checked;
                saveSettings();
                if (config.action) config.action(this.checked);
            });
        }
    });
}

// Save settings to localStorage
>>>>>>> c246036aed8941c43a9b1565584aabf71651f10a
function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(settingsState));
}

<<<<<<< HEAD
function applySettingsToUI() {
    const mappings = {
        'aiModelSelect': settingsState.aiModel,
        'aiProvider': settingsState.aiProvider,
        'maxTokens': settingsState.maxTokens,
        'systemPrompt': settingsState.systemPrompt,
        'timezoneSelect': settingsState.timezone
    };
    for (const [id, val] of Object.entries(mappings)) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }
    // Toggles
    ['autoDarkMode', 'animationsEnabled', 'expertMode', 'showTimestamps', 'streamResponses'].forEach(k => {
        const el = document.getElementById(k);
        if (el) el.checked = settingsState[k];
    });

    if (!settingsState.animationsEnabled) document.body.classList.add('no-animations');
}

function setupSettingsEventListeners() {
    // Basic binding for select/inputs
    ['aiModelSelect', 'aiProvider', 'maxTokens', 'systemPrompt', 'timezoneSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', e => {
            // Mapping back to state key is approximate here, simplified
            // Real app needs explicit mapping.
            saveSettings();
        });
    });
    // Add specific settings logic if needed
}

function showSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById('tab-' + tabName);
    if (target) target.classList.add('active');
}

function showSettingsNotification(msg) {
    // Simple toast
}

// ============ Widgets System (Restored) ============

async function loadCustomWidgets() {
    try {
        const res = await fetch('/api/widgets');
        const data = await res.json();
        renderCustomWidgets(data.widgets || []);
    } catch (e) { console.error(e); }
}

function renderCustomWidgets(widgets) {
    const container = document.getElementById('customWidgetsContainer');
    if (!container) return;
    const custom = widgets.filter(w => w.type === 'custom' && w.active);
    container.innerHTML = custom.map(w => `
        <div class="desktop-widget custom-widget">
            <div class="widget-header"><span class="widget-title">${w.name}</span></div>
            <div class="widget-body">${w.html_content}</div>
        </div>
    `).join('');
}

function updateWidgetStats() {
    const total = document.getElementById('totalChats');
    if (total) total.textContent = chatSessions.length;
    // ... other stats
}

// ============ Utils ============

function simpleMarkdown(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}
function parseMarkdown(text) {
    return (typeof marked !== 'undefined') ? marked.parse(text) : simpleMarkdown(text);
}

function generateSessionId() { return 'session_' + Date.now(); }

function initClock() {
    setInterval(() => {
        const t = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        document.querySelectorAll('#taskbarTime, #headerTime').forEach(e => e.textContent = t);
    }, 1000);
}

function initWindowDragging() {
    document.addEventListener('mousedown', e => {
        const h = e.target.closest('.window-header');
        if (!h || e.target.closest('.window-controls')) return;
        const w = h.closest('.app-window');
        if (!w || w.classList.contains('maximized')) return;

        bringToFront(w.id);
        const rect = w.getBoundingClientRect();
        const offX = e.clientX - rect.left;
        const offY = e.clientY - rect.top;

        function move(ev) {
            w.style.left = (ev.clientX - offX) + 'px';
            w.style.top = (ev.clientY - offY) + 'px';
        }
        function up() {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        }
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    });
}

function initKeyboardShortcuts() { }
function initClickOutside() {
    document.addEventListener('click', e => {
        const w = document.getElementById('startMenu');
        const b = document.querySelector('.start-btn');
        if (w && w.classList.contains('show') && !w.contains(e.target) && !b.contains(e.target)) {
            w.classList.remove('show');
        }
    });
}
function applyTranslations() { } // simplified
function autoResizeTextarea(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
function toggleSidebarView(wid, view) {
    const win = document.getElementById(wid);
    if (!win) return;
    // Hide all panels
    win.querySelectorAll('.chat-history, .filters-panel').forEach(e => e.style.display = 'none');
    // Show target
    if (view === 'history') win.querySelector('.chat-history').style.display = 'block';
    else if (view === 'filters') win.querySelector('.filters-panel').style.display = 'block';
    // Update tabs
    win.querySelectorAll('.sidebar-toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
}
function toggleChatSearch(wid) {
    const win = document.getElementById(wid);
    const bar = win.querySelector('.chat-search-bar');
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
}
function exportChat(wid) { alert('Export feature pending rewrite per window'); }
function attachFile() { /* ... */ }
function insertEmoji() { /* ... */ }
function toggleVoiceInput() { /* ... */ }

// Global Exports
window.toggleStartMenu = function () { document.getElementById('startMenu').classList.toggle('show'); };
window.toggleWindow = function (id) {
    if (id === 'chatWindow') createChatWindow();
    else {
        const el = document.getElementById(id);
        if (el) el.style.display === 'none' ? openWindow(id) : closeWindow(id);
    }
};
=======
// Toggle animations
function toggleAnimations(enabled) {
    document.body.classList.toggle('no-animations', !enabled);
    showSettingsNotification(enabled ? 'تم تفعيل الحركات' : 'تم إيقاف الحركات');
}

// Show settings notification
function showSettingsNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.settings-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'settings-toast';
    notification.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
        </svg>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Export Data
function exportData() {
    const exportData = {
        settings: settingsState,
        chatSessions: chatSessions,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showSettingsNotification('تم تصدير البيانات بنجاح');
}

// Import Data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);

                if (data.settings) {
                    Object.assign(settingsState, data.settings);
                    saveSettings();
                    applySettingsToUI();
                }

                if (data.chatSessions) {
                    chatSessions = data.chatSessions;
                    saveChatSessions();
                    renderChatHistory();
                }

                showSettingsNotification('تم استيراد البيانات بنجاح');
            } catch (error) {
                showSettingsNotification('فشل في قراءة الملف');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}


// Clear All Data
function clearAllData() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        // Clear localStorage
        localStorage.removeItem('appSettings');
        localStorage.removeItem('chatSessions');

        // Reset state
        chatSessions = [];
        conversationHistory = [];
        currentSessionId = null;

        // Reload page
        window.location.reload();
    }
}

// Reset Settings to Default
function resetSettings() {
    if (confirm('هل تريد إعادة تعيين جميع الإعدادات إلى الافتراضية؟')) {
        const defaults = {
            aiModel: 'gpt-4o',
            aiProvider: 'openai',
            temperature: 0.7,
            topP: 0.9,
            maxTokens: 2048,
            systemPrompt: 'أنت مساعد ذكاء اصطناعي متقدم. تتحدث العربية بطلاقة وتقدم إجابات دقيقة ومفيدة.',
            expertMode: false,
            showTimestamps: true,
            streamResponses: true,
            markdownEnabled: true,
            codeHighlight: true,
            autoDarkMode: false,
            animationsEnabled: true,
            notificationsEnabled: true,
            soundEnabled: true,
            desktopNotifications: false,
            saveHistory: true,
            clearOnClose: false,
            timezone: 'Asia/Riyadh'
        };

        Object.assign(settingsState, defaults);
        saveSettings();
        applySettingsToUI();
        document.body.classList.remove('no-animations');
        showSettingsNotification('تم إعادة تعيين الإعدادات');
    }
}

// ============ Enhanced Chat Functions ============

// Toggle Chat Search
function toggleChatSearch() {
    const searchBar = document.getElementById('chatSearchBar');
    if (searchBar.style.display === 'none') {
        searchBar.style.display = 'block';
        document.getElementById('chatSearchInput').focus();
    } else {
        searchBar.style.display = 'none';
        document.getElementById('chatSearchInput').value = '';
        clearSearchHighlights();
    }
}

// Search Messages
function searchMessages(query) {
    const resultsCount = document.getElementById('searchResultsCount');
    const messages = document.querySelectorAll('.message .message-content');

    clearSearchHighlights();

    if (!query.trim()) {
        resultsCount.textContent = '';
        return;
    }

    let count = 0;
    messages.forEach(msg => {
        const text = msg.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            count++;
            // Highlight matching text
            const regex = new RegExp(`(${query})`, 'gi');
            msg.innerHTML = msg.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
        }
    });

    resultsCount.textContent = count > 0 ? `${count} نتيجة` : 'لا توجد نتائج';
}

// Clear Search Highlights
function clearSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.outerHTML = el.textContent;
    });
}

// Export Chat
function exportChat() {
    if (conversationHistory.length === 0) {
        alert('لا توجد رسائل لتصديرها');
        return;
    }

    const session = chatSessions.find(s => s.id === currentSessionId);
    const title = session ? session.title : 'محادثة';

    let content = `# ${title}\n`;
    content += `التاريخ: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
    content += '---\n\n';

    conversationHistory.forEach(msg => {
        const role = msg.type === 'user' ? '👤 أنت' : '🤖 المساعد';
        const time = new Date(msg.timestamp).toLocaleTimeString('ar-SA');
        content += `**${role}** (${time}):\n${msg.text}\n\n`;
    });

    // Create download
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

// Toggle Chat Settings
function toggleChatSettings() {
    // Open settings window with chat tab selected
    openWindow('settingsWindow');
    setTimeout(() => showSettingsTab('chat'), 100);
}

// Handle Input Keydown
function handleInputKeydown(event) {
    const textarea = event.target;

    // Send on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
        return;
    }

    // Command detection (/)
    if (event.key === '/' && textarea.value === '') {
        showCommandMenu();
    }
}

// Auto Resize Textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';

    // Update character count
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = textarea.value.length;
    }
}

// Toggle Voice Input
let isRecording = false;
let recognition = null;

function toggleVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('المتصفح لا يدعم الإدخال الصوتي');
        return;
    }

    if (isRecording) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.lang = document.documentElement.lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    const voiceBtn = document.getElementById('voiceBtn');
    const textarea = document.getElementById('messageInput');
    const statusText = document.getElementById('chatStatusText');

    recognition.onstart = function () {
        isRecording = true;
        voiceBtn.classList.add('recording');
        if (statusText) statusText.textContent = 'جارٍ الاستماع...';
        updateStatusIndicator('typing');
    };

    recognition.onresult = function (event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        textarea.value = transcript;
        autoResizeTextarea(textarea);
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
    };

    recognition.onend = function () {
        stopVoiceInput();
    };

    recognition.start();
}

function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
    }
    isRecording = false;

    const voiceBtn = document.getElementById('voiceBtn');
    const statusText = document.getElementById('chatStatusText');

    voiceBtn.classList.remove('recording');
    if (statusText) statusText.textContent = 'جاهز للمساعدة';
    updateStatusIndicator('online');
}

// Update Status Indicator
function updateStatusIndicator(status) {
    const indicator = document.querySelector('.chat-status-bar .status-indicator');
    if (indicator) {
        indicator.className = 'status-indicator ' + status;
    }
}

// Insert Emoji
function insertEmoji() {
    const emojis = ['😊', '👍', '🎉', '💡', '🚀', '✨', '🔥', '💪', '👏', '🙏', '❤️', '⭐'];
    const textarea = document.getElementById('messageInput');

    // Simple emoji picker
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.innerHTML = emojis.map(e => `<button onclick="insertEmojiChar('${e}')">${e}</button>`).join('');

    // Position and show
    const inputArea = document.querySelector('.input-container-modern');
    inputArea.appendChild(picker);

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closeEmoji(e) {
            if (!picker.contains(e.target)) {
                picker.remove();
                document.removeEventListener('click', closeEmoji);
            }
        });
    }, 100);
}

function insertEmojiChar(emoji) {
    const textarea = document.getElementById('messageInput');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + emoji + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;

    // Remove picker
    const picker = document.querySelector('.emoji-picker');
    if (picker) picker.remove();
}

// Command Menu
function showCommandMenu() {
    const commands = [
        { cmd: '/clear', desc: 'مسح المحادثة الحالية' },
        { cmd: '/new', desc: 'بدء محادثة جديدة' },
        { cmd: '/export', desc: 'تصدير المحادثة' },
        { cmd: '/help', desc: 'عرض المساعدة' },
        { cmd: '/model', desc: 'تغيير النموذج' }
    ];

    const menu = document.createElement('div');
    menu.className = 'command-menu';
    menu.innerHTML = commands.map(c => `
        <button class="command-item" onclick="executeCommand('${c.cmd}')">
            <span class="command-name">${c.cmd}</span>
            <span class="command-desc">${c.desc}</span>
        </button>
    `).join('');

    const inputArea = document.querySelector('.input-container-modern');
    inputArea.appendChild(menu);

    // Close on escape or outside click
    function closeMenu(e) {
        if (e.key === 'Escape' || (e.type === 'click' && !menu.contains(e.target))) {
            menu.remove();
            document.removeEventListener('keydown', closeMenu);
            document.removeEventListener('click', closeMenu);
        }
    }

    setTimeout(() => {
        document.addEventListener('keydown', closeMenu);
        document.addEventListener('click', closeMenu);
    }, 100);
}

function executeCommand(cmd) {
    const textarea = document.getElementById('messageInput');
    textarea.value = '';

    switch (cmd) {
        case '/clear':
            if (confirm('مسح المحادثة الحالية؟')) {
                conversationHistory = [];
                const messagesContainer = document.getElementById('chatMessages');
                const welcomeScreen = document.getElementById('welcomeScreen');
                messagesContainer.innerHTML = '';
                messagesContainer.appendChild(welcomeScreen);
                welcomeScreen.style.display = 'flex';
                saveCurrentSession();
            }
            break;
        case '/new':
            newChat();
            break;
        case '/export':
            exportChat();
            break;
        case '/help':
            sendQuickMessage('ما هي الأوامر المتاحة وكيف يمكنني استخدام هذا المساعد؟');
            break;
        case '/model':
            openWindow('settingsWindow');
            setTimeout(() => showSettingsTab('ai'), 100);
            break;
    }

    // Remove menu
    const menu = document.querySelector('.command-menu');
    if (menu) menu.remove();
}

// Enhanced Add Message with Actions
function addMessageToDOM(text, type, timestamp = null) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? 'أ' : 'AI';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    const content = document.createElement('div');
    content.className = 'message-content';

    // Parse markdown if enabled
    if (settingsState?.markdownEnabled) {
        content.innerHTML = parseMarkdown(text);
    } else {
        content.textContent = text;
    }

    contentWrapper.appendChild(content);

    // Add timestamp if enabled
    if (settingsState?.showTimestamps) {
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = timestamp ?
            new Date(timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) :
            new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        contentWrapper.appendChild(time);
    }

    // Add actions for bot messages
    if (type === 'bot') {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        actions.innerHTML = `
            <button class="msg-action-btn" onclick="copyMessage(this)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                نسخ
            </button>
            <button class="msg-action-btn" onclick="regenerateMessage()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                إعادة
            </button>
        `;
        contentWrapper.appendChild(actions);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentWrapper);
    container.appendChild(messageDiv);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Simple Markdown Parser
function parseMarkdown(text) {
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold and Italic
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

// Copy Message
function copyMessage(btn) {
    const content = btn.closest('.message-content-wrapper').querySelector('.message-content');
    const text = content.textContent || content.innerText;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            تم النسخ
        `;
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// Regenerate Message
function regenerateMessage() {
    if (conversationHistory.length < 2) return;

    // Remove last bot message
    conversationHistory.pop();
    const lastUserMsg = conversationHistory[conversationHistory.length - 1];

    // Remove last message from DOM
    const messages = document.querySelectorAll('.message');
    if (messages.length > 0) {
        messages[messages.length - 1].remove();
    }

    // Resend
    showTypingIndicator();

    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: lastUserMsg.text,
            session_id: currentSessionId
        })
    })
        .then(response => response.json())
        .then(data => {
            hideTypingIndicator();
            if (data.response) {
                addMessage(data.response, 'bot');
            }
        })
        .catch(error => {
            hideTypingIndicator();
            console.error('Error:', error);
        });
}

// File Attachment Handler
let attachedFiles = [];

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.json';
    input.multiple = true;

    input.onchange = function (e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`الملف ${file.name} أكبر من 10MB`);
                return;
            }

            attachedFiles.push(file);
            displayAttachment(file);
        });
    };

    input.click();
}

function displayAttachment(file) {
    const preview = document.getElementById('attachmentsPreview');
    const list = document.getElementById('attachmentsList');

    preview.style.display = 'block';

    const item = document.createElement('div');
    item.className = 'attachment-item';

    let icon = '📄';
    if (file.type.startsWith('image/')) icon = '🖼️';
    else if (file.type === 'application/pdf') icon = '📕';
    else if (file.type.includes('word')) icon = '📘';

    item.innerHTML = `
        <span>${icon}</span>
        <span>${file.name}</span>
        <button class="remove-attachment" onclick="removeAttachment('${file.name}', this)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    `;

    list.appendChild(item);
}

function removeAttachment(fileName, btn) {
    attachedFiles = attachedFiles.filter(f => f.name !== fileName);
    btn.parentElement.remove();

    if (attachedFiles.length === 0) {
        document.getElementById('attachmentsPreview').style.display = 'none';
    }
}

// Initialize session
generateSessionId();
loadChatSessions();

// Initialize first session if none exists
if (chatSessions.length === 0) {
    newChat();
}

// Initialize settings
initSettings();

// ============ Sidebar Toggle Functions ============

/**
 * Toggle between History and Filters view in sidebar
 * @param {string} view - 'history' or 'filters'
 */
function toggleSidebarView(view) {
    const historyPanel = document.querySelector('.chat-history');
    const filtersPanel = document.querySelector('.filters-panel');
    const historyBtn = document.querySelector('[data-view="history"]');
    const filtersBtn = document.querySelector('[data-view="filters"]');

    if (!historyPanel || !filtersPanel || !historyBtn || !filtersBtn) return;

    if (view === 'history') {
        // Show history, hide filters
        historyPanel.style.display = 'flex';
        filtersPanel.style.display = 'none';
        historyBtn.classList.add('active');
        filtersBtn.classList.remove('active');
    } else if (view === 'filters') {
        // Show filters, hide history
        historyPanel.style.display = 'none';
        filtersPanel.style.display = 'flex';
        historyBtn.classList.remove('active');
        filtersBtn.classList.add('active');
    }
}

/**
 * Filter entity cards based on search term
 * @param {string} searchTerm - Search query
 */
function filterEntities(searchTerm) {
    const cards = document.querySelectorAll('.entity-card');
    const term = searchTerm.toLowerCase().trim();

    cards.forEach(card => {
        const entityName = card.getAttribute('data-entity-name');
        if (!entityName) return;

        if (entityName.toLowerCase().includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}
>>>>>>> c246036aed8941c43a9b1565584aabf71651f10a

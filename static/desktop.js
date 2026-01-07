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

    // Initialize Wizard
    if (typeof initSidebarWizard === 'function') {
        initSidebarWizard(windowId);
    }

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
                    case 'send-message':
                        const instance = windowState.chatInstances[windowId];
                        if (instance && instance.isStreaming) {
                            stopGeneration(windowId);
                        } else {
                            sendMessage(windowId);
                        }
                        break;
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
    if (instance) {
        if (instance.eventSource) {
            instance.eventSource.close();
            instance.eventSource = null;
        }
        instance.isStreaming = false;
        hideTyping(windowId);

        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            const sendBtn = windowEl.querySelector('[data-action="send-message"]');
            if (sendBtn) {
                const sendIcon = sendBtn.querySelector('.send-icon');
                const stopIcon = sendBtn.querySelector('.stop-icon');
                if (sendIcon && stopIcon) {
                    sendIcon.style.display = 'block';
                    stopIcon.style.display = 'none';
                }
            }
        }
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

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(settingsState));
}

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
    // Check if the text is a full HTML document
    const trimmedText = text.trim();
    if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
        // Create an iframe to display the HTML report
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = '1px solid rgba(255,255,255,0.1)';
        iframe.style.borderRadius = '8px';
        iframe.style.minHeight = '600px';
        iframe.style.backgroundColor = '#fff';
        iframe.srcdoc = text;

        // Auto-adjust iframe height after content loads
        iframe.onload = function () {
            try {
                const iframeDoc = iframe.contentWindow.document;
                const height = iframeDoc.body.scrollHeight;
                iframe.style.height = (height + 20) + 'px';
            } catch (e) {
                console.warn('Could not adjust iframe height:', e);
                iframe.style.height = '800px'; // fallback height
            }
        };

        // Return the iframe wrapped in a container
        const container = document.createElement('div');
        container.className = 'html-report-container';
        container.appendChild(iframe);
        return container.outerHTML;
    }

    // Otherwise, parse as Markdown
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

// ============ Typing Indicator Functions ============
function showTypingIndicator(windowId) {
    const messagesContainer = document.querySelector(`#${windowId} .chat-messages`);
    if (!messagesContainer) return;

    // Remove existing typing indicator if any
    hideTypingIndicator(windowId);

    // Create typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-message';
    typingDiv.id = `typing-indicator-${windowId}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    messagesContainer.appendChild(typingDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator(windowId) {
    const typingIndicator = document.getElementById(`typing-indicator-${windowId}`);
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Make functions globally available
window.showTypingIndicator = showTypingIndicator;
window.hideTypingIndicator = hideTypingIndicator;

// ============ Language Toggle ============
function applyTranslations() {
    const lang = document.documentElement.lang || 'ar';
    if (typeof translations === 'undefined') return;

    const trans = translations[lang] || translations['ar'];

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (trans[key]) {
            // Check if it's an input/textarea (update placeholder) or regular element (update textContent)
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = trans[key];
            } else {
                el.textContent = trans[key];
            }
        }
    });
}

function setLanguage(lang) {
    fetch('/set_language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('preferredLanguage', lang);
                window.location.reload();
            }
        }).catch(err => {
            console.error('Language change error:', err);
            window.location.reload();
        });
}

function toggleLanguage() {
    const currentLangEl = document.getElementById('currentLang');
    if (!currentLangEl) {
        console.error('currentLang element not found');
        return;
    }
    const currentLang = currentLangEl.textContent;
    const newLang = currentLang === 'ع' ? 'en' : 'ar';
    setLanguage(newLang);
}

// Make functions available globally
window.toggleLanguage = toggleLanguage;
window.applyTranslations = applyTranslations;

// ============ Force Bot Avatar Icon to White ============
function forceAvatarWhite() {
    const botAvatars = document.querySelectorAll('.message.bot .message-avatar');
    botAvatars.forEach(avatar => {
        // Force white color on all child elements
        avatar.style.setProperty('color', 'white', 'important');
        avatar.style.setProperty('filter', 'none', 'important');

        const children = avatar.querySelectorAll('*');
        children.forEach(child => {
            child.style.setProperty('filter', 'brightness(0) invert(1)', 'important');
            child.style.setProperty('color', 'white', 'important');
            if (child.tagName === 'svg' || child.tagName === 'SVG') {
                child.style.setProperty('stroke', 'white', 'important');
                child.style.setProperty('fill', 'white', 'important');
            }
        });
    });
}

// Run on load and observe for new messages
document.addEventListener('DOMContentLoaded', () => {
    forceAvatarWhite();

    // Watch for new messages
    const observer = new MutationObserver(() => {
        forceAvatarWhite();
    });

    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        observer.observe(chatMessages, { childList: true, subtree: true });
    }
});

// ============ Force Bot Avatar Icon to White ============
function forceAvatarWhite() {
    const botAvatars = document.querySelectorAll('.message.bot .message-avatar');
    botAvatars.forEach(avatar => {
        // Force white color on all child elements
        avatar.style.setProperty('color', 'white', 'important');
        avatar.style.setProperty('filter', 'none', 'important');

        const children = avatar.querySelectorAll('*');
        children.forEach(child => {
            child.style.setProperty('filter', 'brightness(0) invert(1)', 'important');
            child.style.setProperty('color', 'white', 'important');
            if (child.tagName === 'svg' || child.tagName === 'SVG') {
                child.style.setProperty('stroke', 'white', 'important');
                child.style.setProperty('fill', 'white', 'important');
            }
        });
    });
}

// Run on load and observe for new messages
document.addEventListener('DOMContentLoaded', () => {
    forceAvatarWhite();

    // Watch for new messages
    const observer = new MutationObserver(() => {
        forceAvatarWhite();
    });

    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        observer.observe(chatMessages, { childList: true, subtree: true });
    }
});


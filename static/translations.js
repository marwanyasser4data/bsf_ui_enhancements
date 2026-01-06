// Translations
const translations = {
    ar: {
        // Header
        appTitle: 'مساعد الذكاء الاصطناعي',
        appSubtitle: 'مساعد ذكي متقدم لخدمتك',

        // Buttons
        newChat: 'محادثة جديدة',
        filters: 'الفلاتر',
        resetSession: 'إعادة تعيين الجلسة',
        send: 'إرسال',
        delete: 'حذف',
        deleteAll: 'حذف الكل',

        // Sidebar
        chatHistory: 'سجل المحادثات',
        welcome: 'مرحباً بك',
        userEmail: 'user@nhc.sa',

        // Welcome Message
        welcomeTitle: 'مرحباً بك في المساعد الذكي! 👋',
        welcomeDescription: 'يمكنني مساعدتك في الإجابة على الأسئلة وتقديم المعلومات التي تحتاجها.',
        feature1: '📊 استكشاف البيانات والمعلومات',
        feature2: '🔍 البحث والتحليل المتقدم',
        suggestionsLabel: 'جرب أحد هذه الأسئلة:',
        suggestion1: 'ما هي خدمات NHC؟',
        suggestion2: 'كيف يمكنني حجز وحدة سكنية؟',

        // Input
        placeholder: 'اسأل أي شيء...',
        inputHint: 'اضغط Enter للإرسال • Shift + Enter لسطر جديد',

        // Messages
        errorConnection: 'عذراً، حدث خطأ في الاتصال بالخادم.',
        errorOccurred: 'عذراً، حدث خطأ:',

        // Confirmations
        confirmNewChat: 'هل تريد بدء محادثة جديدة؟',
        confirmDelete: 'هل تريد حذف هذه المحادثة؟',
        confirmDeleteAll: 'هل تريد حذف جميع المحادثات؟ لا يمكن التراجع عن هذا الإجراء.',

        // Status
        typing: 'يكتب...',
        noHistory: 'لا توجد محادثات سابقة',
        loading: 'جاري التحميل...',

        // Time
        justNow: 'الآن',
        minuteAgo: 'منذ دقيقة',
        minutesAgo: 'منذ {n} دقائق',
        hourAgo: 'منذ ساعة',
        hoursAgo: 'منذ {n} ساعات',
        dayAgo: 'منذ يوم',
        daysAgo: 'منذ {n} أيام',

        // Settings
        settings: 'الإعدادات',
        settingsTitle: 'إعدادات النموذج',
        providerLabel: 'مزود الخدمة',
        providerFake: 'تجريبي (بدون API)',
        providerOpenAI: 'OpenAI',
        providerOpenRouter: 'OpenRouter',
        providerHint: 'اختر مزود خدمة LLM',
        modelLabel: 'النموذج',
        modelHint: 'اختر نموذج اللغة',
        temperatureLabel: 'درجة الإبداع (Temperature)',
        tempLow: 'منخفض (دقيق)',
        tempHigh: 'عالي (إبداعي)',
        maxTokensLabel: 'الحد الأقصى للرموز',
        maxTokensPlaceholder: '2000',
        maxTokensHint: 'عدد الرموز في الاستجابة (100-4000)',
        apiKeyLabel: 'مفتاح API',
        apiKeyPlaceholder: 'sk-...',
        apiKeyHint: 'سيتم تشفير المفتاح وحفظه بشكل آمن',
        testKeyBtn: 'اختبار المفتاح',
        saveBtn: 'حفظ التغييرات',
        cancelBtn: 'إلغاء',

        // Theme Settings
        themeLabel: 'تصميم الواجهة',
        themeHint: 'اختر التصميم المفضل لديك',
        themeNHC: 'NHC الاحترافي',
        themeNHCDesc: 'تصميم احترافي بألوان NHC المميزة',
        themeReadPo: 'ReadPo الداكن',
        themeReadPoDesc: 'تصميم داكن عصري واحترافي',

        // Desktop UI
        aiAssistant: 'مساعد الذكاء الاصطناعي',
        advancedAssistant: 'مساعد ذكي متقدم لخدمتك',
        typeMessage: 'اكتب رسالتك...',
        language: 'اللغة',
        aiModel: 'نموذج الذكاء الاصطناعي',
        controlPanel: 'لوحة التحكم',
        widgets: 'الأدوات',
        chat: 'الدردشة',

        // Widget Stats
        aiModels: 'نماذج الذكاء الاصطناعي',
        chatStats: 'إحصائيات الدردشة',
        totalConversations: 'إجمالي المحادثات',
        todayConversations: 'محادثات اليوم',
        totalMessages: 'إجمالي الرسائل',
        avgResponse: 'متوسط الاستجابة',
        systemStatus: 'حالة النظام',
        quickActions: 'إجراءات سريعة',
        readyToHelp: 'جاهز للمساعدة',
        connectedReady: 'متصل • جاهز',
        connected: 'متصل',
        offline: 'غير متصل',
        default: 'الافتراضي',

        // Chat Actions & Messages
        welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        explainConcepts: 'اشرح المفاهيم',
        writeCode: 'اكتب كود',
        analyzeData: 'حلل البيانات',
        translate: 'ترجم نصاً',
        tryAsking: 'جرب أن تسأل:',
        typeMessageAdvanced: 'اكتب رسالتك هنا... استخدم @ للإشارة، / للأوامر',
        chatSearchInput: 'ابحث في الرسائل...',
        bestPractices: 'أفضل ممارسات البرمجة',
        creativeStory: 'قصة إبداعية',
        learnML: 'تعلم Machine Learning',

        // Settings Tabs
        generalTab: 'عام',
        aiTab: 'الذكاء الاصطناعي',
        chatTab: 'المحادثة',
        voiceTab: 'الصوت والنطق',
        privacyTab: 'الخصوصية والأمان',
        notificationsTab: 'الإشعارات',
        accessibilityTab: 'إمكانية الوصول',
        advancedTab: 'متقدم',
        aboutTab: 'حول التطبيق',

        // General Settings
        generalSettings: 'الإعدادات العامة',
        languageRegion: 'اللغة والمنطقة',
        interfaceLanguage: 'لغة الواجهة',
        chooseAppLanguage: 'اختر لغة عرض التطبيق',
        timezone: 'المنطقة الزمنية',
        timezoneForDates: 'تحديد المنطقة الزمنية للتواريخ',
        appearance: 'المظهر',
        autoDarkMode: 'الوضع الداكن التلقائي',
        autoDarkNight: 'تفعيل الوضع الداكن تلقائياً ليلاً',
        animations: 'تأثيرات الحركة',
        enableAnimations: 'تفعيل الحركات والانتقالات',

        // AI Settings
        aiSettings: 'إعدادات الذكاء الاصطناعي',
        baseModel: 'النموذج الأساسي',
        serviceProvider: 'مزود الخدمة',
        chooseAIProvider: 'اختر مزود خدمة الذكاء الاصطناعي',
        model: 'النموذج',
        chooseAIModel: 'اختر نموذج الذكاء الاصطناعي',
        generationCriteria: 'معايير التوليد',
        creativityLevel: 'درجة الإبداعية (Temperature)',
        higherValuesCreative: 'قيمة أعلى = إجابات أكثر إبداعاً',
        maxTokens: 'الحد الأقصى للرموز',
        responseLength: 'أقصى طول للرد',
        topP: 'Top P (تنوع الكلمات)',
        controlResponseDiversity: 'التحكم في تنوع الردود',
        assistantPersonality: 'شخصية المساعد',
        systemPrompt: 'تعليمات النظام (System Prompt)',
        defineBehavior: 'حدد سلوك وشخصية المساعد',
        expertMode: 'وضع الخبير',
        detailedTechnical: 'ردود أكثر تفصيلاً وتقنية',

        // Chat Settings
        chatSettings: 'إعدادات المحادثة',
        messageDisplay: 'عرض الرسائل',
        showTimestamps: 'عرض الوقت مع الرسائل',
        displayMessageTime: 'إظهار وقت إرسال كل رسالة',
        liveStreaming: 'البث المباشر',
        displayCharacterByCharacter: 'عرض الرد حرفاً تلو الآخر',
        markdownFormatting: 'تنسيق Markdown',
        supportFormatting: 'دعم التنسيق في الرسائل',
        codeHighlighting: 'تمييز الكود',
        colorCode: 'تلوين أكواد البرمجة',
        historyMemory: 'السجل والذاكرة',
        autoSaveHistory: 'حفظ السجل تلقائياً',
        saveConversations: 'حفظ المحادثات للرجوع إليها',
        contextMemory: 'ذاكرة السياق',
        savedMessages: 'عدد الرسائل المحفوظة في الذاكرة',
        clearHistory: 'مسح السجل',
        deleteSavedConversations: 'حذف جميع المحادثات المحفوظة',

        // Voice Settings
        voiceSpeechSettings: 'إعدادات الصوت والنطق',
        voiceInput: 'الإدخال الصوتي',
        enableVoiceInput: 'تفعيل الإدخال الصوتي',
        speakInsteadWrite: 'التحدث بدلاً من الكتابة',
        speechLanguage: 'لغة التعرف الصوتي',
        languageToText: 'لغة تحويل الصوت لنص',
        autoSend: 'الإرسال التلقائي',
        sendMessageAuto: 'إرسال الرسالة تلقائياً بعد التحدث',

        // Text-to-Speech
        textToSpeech: 'النطق (Text-to-Speech)',
        readResponses: 'قراءة الردود صوتياً',
        readAssistantResponses: 'نطق ردود المساعد',
        speechVoice: 'صوت النطق',
        chooseReadingVoice: 'اختر صوت القراءة',
        speechSpeed: 'سرعة النطق',
        textReadingSpeed: 'سرعة قراءة النص',

        // Privacy Settings
        privacySecurity: 'الخصوصية والأمان',
        data: 'البيانات',
        shareAnalytics: 'مشاركة بيانات التحسين',
        helpImproveService: 'المساعدة في تحسين الخدمة',
        endToEndEncryption: 'التشفير من طرف لطرف',
        encryptConversations: 'تشفير المحادثات',
        deleteLocalData: 'حذف البيانات المحلية',
        clearStoredData: 'مسح جميع البيانات المخزنة',
        session: 'الجلسة',
        autoLogout: 'تسجيل الخروج التلقائي',
        afterInactivity: 'بعد فترة من عدم النشاط',

        // Notifications Settings
        notificationsSettings: 'إعدادات الإشعارات',
        notifications: 'الإشعارات',
        enableNotifications: 'تفعيل الإشعارات',
        receiveAppNotifications: 'تلقي إشعارات التطبيق',
        notificationSound: 'صوت الإشعارات',
        playSound: 'تشغيل صوت عند الإشعار',
        desktopNotifications: 'إشعارات سطح المكتب',
        showBrowserNotifications: 'عرض إشعارات المتصفح',

        // Accessibility Settings
        accessibilitySettings: 'إمكانية الوصول',
        display: 'العرض',
        fontSize: 'حجم الخط',
        enlargeShrinkText: 'تكبير أو تصغير النص',
        highContrast: 'تباين عالي',
        increaseColorClarity: 'زيادة وضوح الألوان',
        reduceMotion: 'تقليل الحركة',
        disableAnimations: 'تعطيل الحركات',
        screenReader: 'قارئ الشاشة',
        screenReaderSupport: 'دعم قارئ الشاشة',
        improveForVisuallyImpaired: 'تحسين للمستخدمين المكفوفين',

        // Advanced Settings
        advancedSettings: 'الإعدادات المتقدمة',
        apiConnection: 'API والاتصال',
        apiKey: 'مفتاح API',
        accessKey: 'مفتاح الوصول للخدمة',
        endpoint: 'نقطة النهاية (Endpoint)',
        customAPIAddress: 'عنوان API المخصص',
        connectionTimeout: 'مهلة الاتصال',
        maxWaitResponse: 'الحد الأقصى لانتظار الرد',
        developer: 'المطور',
        debugMode: 'وضع التصحيح',
        showDevLogs: 'عرض سجلات التطوير',
        exportSettings: 'تصدير الإعدادات',
        saveAsFile: 'حفظ الإعدادات كملف',
        importSettings: 'استيراد الإعدادات',
        loadFromFile: 'تحميل إعدادات من ملف',
        reset: 'إعادة الضبط',
        restoreDefaults: 'استعادة الإعدادات الافتراضية',

        // About
        aboutApp: 'حول التطبيق',
        version: 'الإصدار',
        features: 'المميزات',
        multipleAIModels: 'دعم نماذج AI متعددة',
        fullArabicInterface: 'واجهة عربية كاملة',
        voiceInputOutput: 'إدخال صوتي ونطق',
        encryptionDataProtection: 'تشفير وحماية البيانات',
        privacyPolicy: 'سياسة الخصوصية',
        termsOfUse: 'شروط الاستخدام',
        help: 'المساعدة',

        // Taskbar
        Dashboard: 'لوحة القيادة',
        chatTitle: 'الدردشة',
        widgetsTitle: 'الأدوات',
        settingsTitle: 'الإعدادات',
        controlPanelTitle: 'لوحة التحكم',
        search: 'ابحث...',
        aiChat: 'الدردشة الذكية',

        // User Menu
        logout: 'تسجيل الخروج',

        // Buttons
        clearAll: 'مسح الكل',
        export: 'تصدير',
        import: 'استيراد',
        resetSettings: 'إعادة الضبط',
        deleteData: 'حذف البيانات',

        // Widget Stats
        todayStats: 'إحصائيات اليوم',
        conversations: 'المحادثات',
        messages: 'الرسائل',

        // Filter Wizard
        advancedFilters: 'فلاتر متقدمة',
        filterWizardTitle: 'معالج الفلاتر المتقدم',
        step1Label: 'نوع البيانات',
        step2Label: 'الفئة',
        step3Label: 'التفاصيل',
        step1Title: 'اختر نوع البيانات',
        step1Description: 'حدد نوع البيانات التي تريد البحث عنها أو تصفيتها',
        step2Title: 'اختر الفئة',
        step2Description: 'حدد الفئة المحددة التي تريد التصفية بناءً عليها',
        step3Title: 'حدد التفاصيل',
        step3Description: 'اختر التفاصيل النهائية لتطبيق الفلتر',
        prevBtn: 'السابق',
        nextBtn: 'التالي',
        applyBtn: 'تطبيق الفلتر'

    },
    en: {
        // Header
        appTitle: 'AI Assistant',
        appSubtitle: 'Advanced intelligent assistant at your service',

        // Buttons
        newChat: 'New Chat',
        filters: 'Filters',
        resetSession: 'Reset Session',
        send: 'Send',
        delete: 'Delete',
        deleteAll: 'Delete All',

        // Sidebar
        chatHistory: 'Chat History',
        welcome: 'Welcome',
        userEmail: 'user@nhc.sa',

        // Welcome Message
        welcomeTitle: 'Welcome to AI Assistant! 👋',
        welcomeDescription: 'I can help you answer questions and provide the information you need.',
        feature1: '📊 Explore data and information',
        feature2: '🔍 Advanced search and analysis',
        suggestionsLabel: 'Try one of these questions:',
        suggestion1: 'What are NHC services?',
        suggestion2: 'How can I book a residential unit?',

        // Input
        placeholder: 'Ask anything...',
        inputHint: 'Press Enter to send • Shift + Enter for new line',

        // Messages
        errorConnection: 'Sorry, a connection error occurred.',
        errorOccurred: 'Sorry, an error occurred:',

        // Confirmations
        confirmNewChat: 'Do you want to start a new chat?',
        confirmDelete: 'Do you want to delete this conversation?',
        confirmDeleteAll: 'Do you want to delete all conversations? This action cannot be undone.',

        // Status
        typing: 'Typing...',
        noHistory: 'No previous conversations',
        loading: 'Loading...',

        // Time
        justNow: 'now',
        minuteAgo: '1 minute ago',
        minutesAgo: '{n} minutes ago',
        hourAgo: '1 hour ago',
        hoursAgo: '{n} hours ago',
        dayAgo: '1 day ago',
        daysAgo: '{n} days ago',

        // Settings
        settings: 'Settings',
        settingsTitle: 'Model Settings',
        providerLabel: 'Provider',
        providerFake: 'Demo (No API)',
        providerOpenAI: 'OpenAI',
        providerOpenRouter: 'OpenRouter',
        providerHint: 'Select LLM service provider',
        modelLabel: 'Model',
        modelHint: 'Select language model',
        temperatureLabel: 'Temperature',
        tempLow: 'Low (Precise)',
        tempHigh: 'High (Creative)',
        maxTokensLabel: 'Max Tokens',
        maxTokensPlaceholder: '2000',
        maxTokensHint: 'Number of tokens in response (100-4000)',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'sk-...',
        apiKeyHint: 'Your API key will be encrypted and stored securely',
        testKeyBtn: 'Test Key',
        saveBtn: 'Save Changes',
        cancelBtn: 'Cancel',

        // Theme Settings
        themeLabel: 'Interface Theme',
        themeHint: 'Choose your preferred theme',
        themeNHC: 'NHC Professional',
        themeNHCDesc: 'Professional design with NHC signature colors',
        themeReadPo: 'ReadPo Dark',
        themeReadPoDesc: 'Modern dark professional theme',

        // Desktop UI
        aiAssistant: 'AI Assistant',
        advancedAssistant: 'Advanced intelligent assistant at your service',
        typeMessage: 'Type your message...',
        language: 'Language',
        aiModel: 'AI Model',
        controlPanel: 'Control Panel',
        widgets: 'Widgets',
        chat: 'Chat',

        // Widget Stats
        aiModels: 'AI Models',
        chatStats: 'Chat Statistics',
        totalConversations: 'Total Conversations',
        todayConversations: 'Today\'s Conversations',
        totalMessages: 'Total Messages',
        avgResponse: 'Average Response Time',
        systemStatus: 'System Status',
        quickActions: 'Quick Actions',
        readyToHelp: 'Ready to Help',
        connectedReady: 'Connected • Ready',
        connected: 'Connected',
        offline: 'Offline',
        default: 'Default',

        // Chat Actions & Messages
        welcomeMessage: 'Hello! How can I help you today?',
        explainConcepts: 'Explain Concepts',
        writeCode: 'Write Code',
        analyzeData: 'Analyze Data',
        translate: 'Translate Text',
        tryAsking: 'Try Asking:',
        typeMessageAdvanced: 'Type your message here... Use @ to mention, / for commands',
        chatSearchInput: 'Search messages...',
        bestPractices: 'Best Programming Practices',
        creativeStory: 'Creative Story',
        learnML: 'Learn Machine Learning',

        // Settings Tabs
        generalTab: 'General',
        aiTab: 'AI',
        chatTab: 'Chat',
        voiceTab: 'Voice & Speech',
        privacyTab: 'Privacy & Security',
        notificationsTab: 'Notifications',
        accessibilityTab: 'Accessibility',
        advancedTab: 'Advanced',
        aboutTab: 'About',

        // General Settings
        generalSettings: 'General Settings',
        languageRegion: 'Language & Region',
        interfaceLanguage: 'Interface Language',
        chooseAppLanguage: 'Choose the application display language',
        timezone: 'Timezone',
        timezoneForDates: 'Timezone for date display',
        appearance: 'Appearance',
        autoDarkMode: 'Automatic Dark Mode',
        autoDarkNight: 'Automatically enable dark mode at night',
        animations: 'Motion Effects',
        enableAnimations: 'Enable animations and transitions',

        // AI Settings
        aiSettings: 'AI Settings',
        baseModel: 'Base Model',
        serviceProvider: 'Service Provider',
        chooseAIProvider: 'Choose AI service provider',
        model: 'Model',
        chooseAIModel: 'Choose AI model',
        generationCriteria: 'Generation Criteria',
        creativityLevel: 'Creativity Level (Temperature)',
        higherValuesCreative: 'Higher values = more creative responses',
        maxTokens: 'Maximum Tokens',
        responseLength: 'Maximum response length',
        topP: 'Top P (Word Diversity)',
        controlResponseDiversity: 'Control response diversity',
        assistantPersonality: 'Assistant Personality',
        systemPrompt: 'System Prompt (System Prompt)',
        defineBehavior: 'Define assistant behavior and personality',
        expertMode: 'Expert Mode',
        detailedTechnical: 'More detailed and technical responses',

        // Chat Settings
        chatSettings: 'Chat Settings',
        messageDisplay: 'Message Display',
        showTimestamps: 'Show timestamps with messages',
        displayMessageTime: 'Display time of each message',
        liveStreaming: 'Live Streaming',
        displayCharacterByCharacter: 'Display response character by character',
        markdownFormatting: 'Markdown Formatting',
        supportFormatting: 'Support formatting in messages',
        codeHighlighting: 'Code Highlighting',
        colorCode: 'Color programming code',
        historyMemory: 'History & Memory',
        autoSaveHistory: 'Auto-save history',
        saveConversations: 'Save conversations for reference',
        contextMemory: 'Context Memory',
        savedMessages: 'Number of messages saved in memory',
        clearHistory: 'Clear History',
        deleteSavedConversations: 'Delete all saved conversations',

        // Voice Settings
        voiceSpeechSettings: 'Voice & Speech Settings',
        voiceInput: 'Voice Input',
        enableVoiceInput: 'Enable Voice Input',
        speakInsteadWrite: 'Speak instead of typing',
        speechLanguage: 'Speech Recognition Language',
        languageToText: 'Language to convert speech to text',
        autoSend: 'Auto Send',
        sendMessageAuto: 'Send message automatically after speaking',

        // Text-to-Speech
        textToSpeech: 'Text-to-Speech',
        readResponses: 'Read responses aloud',
        readAssistantResponses: 'Read assistant responses',
        speechVoice: 'Speech Voice',
        chooseReadingVoice: 'Choose reading voice',
        speechSpeed: 'Speech Speed',
        textReadingSpeed: 'Text reading speed',

        // Privacy Settings
        privacySecurity: 'Privacy & Security',
        data: 'Data',
        shareAnalytics: 'Share improvement data',
        helpImproveService: 'Help improve the service',
        endToEndEncryption: 'End-to-End Encryption',
        encryptConversations: 'Encrypt conversations',
        deleteLocalData: 'Delete Local Data',
        clearStoredData: 'Clear all stored data',
        session: 'Session',
        autoLogout: 'Auto Logout',
        afterInactivity: 'After period of inactivity',

        // Notifications Settings
        notificationsSettings: 'Notifications Settings',
        notifications: 'Notifications',
        enableNotifications: 'Enable Notifications',
        receiveAppNotifications: 'Receive application notifications',
        notificationSound: 'Notification Sound',
        playSound: 'Play sound on notification',
        desktopNotifications: 'Desktop Notifications',
        showBrowserNotifications: 'Show browser notifications',

        // Accessibility Settings
        accessibilitySettings: 'Accessibility Settings',
        display: 'Display',
        fontSize: 'Font Size',
        enlargeShrinkText: 'Enlarge or shrink text',
        highContrast: 'High Contrast',
        increaseColorClarity: 'Increase color clarity',
        reduceMotion: 'Reduce Motion',
        disableAnimations: 'Disable animations',
        screenReader: 'Screen Reader',
        screenReaderSupport: 'Screen reader support',
        improveForVisuallyImpaired: 'Improve for visually impaired users',

        // Advanced Settings
        advancedSettings: 'Advanced Settings',
        apiConnection: 'API & Connection',
        apiKey: 'API Key',
        accessKey: 'Access key for the service',
        endpoint: 'Endpoint',
        customAPIAddress: 'Custom API address',
        connectionTimeout: 'Connection Timeout',
        maxWaitResponse: 'Maximum wait time for response',
        developer: 'Developer',
        debugMode: 'Debug Mode',
        showDevLogs: 'Show development logs',
        exportSettings: 'Export Settings',
        saveAsFile: 'Save settings as file',
        importSettings: 'Import Settings',
        loadFromFile: 'Load settings from file',
        reset: 'Reset',
        restoreDefaults: 'Restore default settings',

        // About
        aboutApp: 'About the Application',
        version: 'Version',
        features: 'Features',
        multipleAIModels: 'Support for multiple AI models',
        fullArabicInterface: 'Full Arabic interface',
        voiceInputOutput: 'Voice input and output',
        encryptionDataProtection: 'Encryption and data protection',
        privacyPolicy: 'Privacy Policy',
        termsOfUse: 'Terms of Use',
        help: 'Help',

        // Taskbar
        Dashboard: 'Dashboard',
        chatTitle: 'Chat',
        widgetsTitle: 'Widgets',
        settingsTitle: 'Settings',
        controlPanelTitle: 'Control Panel',
        search: 'Search...',
        aiChat: 'AI Chat',

        // User Menu
        logout: 'Logout',

        // Buttons
        clearAll: 'Clear All',
        export: 'Export',
        import: 'Import',
        resetSettings: 'Reset Settings',
        deleteData: 'Delete Data',

        // Widget Stats
        todayStats: 'Today\'s Statistics',
        conversations: 'Conversations',
        messages: 'Messages',

        // Filter Wizard
        advancedFilters: 'Advanced Filters',
        filterWizardTitle: 'Advanced Filter Wizard',
        step1Label: 'Data Type',
        step2Label: 'Category',
        step3Label: 'Details',
        step1Title: 'Choose Data Type',
        step1Description: 'Select the type of data you want to search for or filter',
        step2Title: 'Choose Category',
        step2Description: 'Select the specific category you want to filter by',
        step3Title: 'Specify Details',
        step3Description: 'Choose the final details to apply the filter',
        prevBtn: 'Previous',
        nextBtn: 'Next',
        applyBtn: 'Apply Filter'

    }
};

// Get translation
function t(key, params = {}) {
    const lang = currentLang || 'ar';
    let text = translations[lang][key] || translations['ar'][key] || key;

    // Replace parameters
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });

    return text;
}

// Change language
// Change language
window.changeLanguage = function (lang) {
    if (!translations[lang]) return;

    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);

    // Update HTML lang and dir
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });

    // Send to server
    fetch(`/change-language/${lang}`, { method: 'POST' })
        .catch(err => console.error('Language change error:', err));
}

// Get current language
let currentLang = localStorage.getItem('preferredLanguage') || 'ar';

// Toggle language function
window.toggleLanguage = function () {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);

    // Update language button text
    const langBtn = document.getElementById('currentLang');
    if (langBtn) {
        langBtn.textContent = newLang === 'ar' ? 'ع' : 'EN';
    }

    // Reload page to apply language change
    setTimeout(() => {
        window.location.reload();
    }, 100);
};

// Apply translations on page load
document.addEventListener('DOMContentLoaded', function () {
    // Get current language from localStorage or HTML lang attribute
    const storedLang = localStorage.getItem('preferredLanguage');
    const htmlLang = document.documentElement.lang;
    currentLang = storedLang || htmlLang || 'ar';

    // Apply translations to all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });

    // Update language button text
    const langBtn = document.getElementById('currentLang');
    if (langBtn) {
        langBtn.textContent = currentLang === 'ar' ? 'ع' : 'EN';
    }
});

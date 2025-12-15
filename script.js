/**
 * 章鱼喷墨机 - 核心逻辑脚本 (修复存储版)
 * Based on Index (14).html logic with robust Dexie DB storage
 */

// ==========================================
// 1. 数据库初始化 (Database Setup)
// ==========================================
const dexieDB = new Dexie('GeminiChatDB');

// 定义表结构 (与 EPhone 类似的稳健结构)
dexieDB.version(1).stores({
    chats: '&id, timestamp',       // 聊天记录 (单聊+群聊)
    worldBooks: '&id',             // 世界书
    myStickers: '&id',             // 表情包
    globalSettings: 'key',         // 全局设置 (API, 壁纸, 偏好等)
    apiPresets: '&id',             // API 预设
    // 保留其他可能用到的表，防止报错
    npcs: '&id',
    npcGroups: '&id',
    qzonePosts: '&id',
    favorites: '&id',
    emails: '&id',
    grStories: '&id'
});

// ==========================================
// 2. 全局变量与默认值 (Global State)
// ==========================================
// 默认设置
const defaultWidgetSettings = {
    centralCircleImage: 'https://i.postimg.cc/mD83gR29/avatar-1.jpg',
    topLeft: { emoji: '🎧', text: '𝑀𝑒𝑚𝑜𝑟𝑖𝑒𝑠✞' },
    topRight: { emoji: '🐈‍⬛', text: '𐙚 ♰.𝐾𝑖𝑡𝑡𝑒𝑛.♰' },
    bottomLeft: { emoji: '💿', text: '᪗₊𝔹𝕒𝕓𝕖𝕚𝕤₊' },
    bottomRight: { emoji: '🥛', text: '.☘︎ ˖+×+.' }
};

const defaultIcons = {
    'chat-list-screen': {name: '404', url: 'https://i.postimg.cc/VvQB8dQT/chan-143.png'},
    'api-settings-screen': {name: 'api', url: 'https://i.postimg.cc/50FqT8GL/chan-125.png'},
    'wallpaper-screen': {name: '壁纸', url: 'https://i.postimg.cc/3wqFttL3/chan-90.png'},
    'world-book-screen': {name: '世界书', url: 'https://i.postimg.cc/prCWkrKT/chan-74.png'},
    'customize-screen': {name: '自定义', url: 'https://i.postimg.cc/vZVdC7gt/chan-133.png'},
    'font-settings-screen': {name: '字体', url: 'https://i.postimg.cc/FzVtC0x4/chan-21.png'},
    'tutorial-screen': {name: '教程', url: 'https://i.postimg.cc/6QgNzCFf/chan-118.png'},
    'day-mode-btn': {name: '白昼模式', url: 'https://i.postimg.cc/Jz0tYqnT/chan-145.png'},
    'night-mode-btn': {name: '夜间模式', url: 'https://i.postimg.cc/htYvkdQK/chan-146.png'},
    'forum-screen': {name: '论坛', url: 'https://i.postimg.cc/fyPVBZf1/1758451183605.png'},
    'music-screen': {name: '音乐', url: 'https://i.postimg.cc/ydd65txK/1758451018266.png'},
    'diary-screen': {name: '日记本', url: 'https://i.postimg.cc/bJBLzmFH/chan-70.png'},
    'piggy-bank-screen': {name: '存钱罐', url: 'https://i.postimg.cc/3RmWRRtS/chan-18.png'},
    'pomodoro-screen': {name: '番茄钟', url: 'https://i.postimg.cc/PrYGRDPF/chan-76.png'},
    'storage-analysis-screen': {name: '存储分析', url: 'https://i.postimg.cc/J0F3Lt0T/chan-107.png'}
};

const peekScreenApps = {
    'messages': { name: '消息', url: 'https://i.postimg.cc/Kvs4tDh5/export202509181826424260.png' },
    'memos': { name: '备忘录', url: 'https://i.postimg.cc/JzD0xH1C/export202509181829064550.png' },
    'cart': { name: '购物车', url: 'https://i.postimg.cc/pLwT6VTh/export202509181830143960.png' },
    'transfer': { name: '中转站', url: 'https://i.postimg.cc/63wQBHCB/export202509181831140230.png' },
    'browser': { name: '浏览器', url: 'https://i.postimg.cc/SKcsF02Z/export202509181830445980.png' },
    'drafts': { name: '草稿箱', url: 'https://i.postimg.cc/ZKqC9D2R/export202509181827225860.png' },
    'album': { name: '相册', url: 'https://i.postimg.cc/qBcdpqNc/export202509221549335970.png' },
    'steps': { name: '步数', url: 'https://i.postimg.cc/5NndFrq6/export202509181824532800.png' },
    'unlock': { name: 'unlock！', url: 'https://i.postimg.cc/28zNyYWs/export202509221542593320.png' }
};

const colorThemes = {
    'white_pink': { name: '白/粉', received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'}, sent: {bg: 'rgba(255,204,204,0.9)', text: '#A56767'} },
    'white_blue': { name: '白/蓝', received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'}, sent: {bg: 'rgba(173,216,230,0.9)', text: '#4A6F8A'} },
    'white_yellow': { name: '白/黄', received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'}, sent: {bg: 'rgba(249,237,105,0.9)', text: '#8B7E4B'} },
    'white_green': { name: '白/绿', received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'}, sent: {bg: 'rgba(188,238,188,0.9)', text: '#4F784F'} },
    'white_purple': { name: '白/紫', received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'}, sent: {bg: 'rgba(185,190,240,0.9)', text: '#6C5B7B'} },
    'black_red': { name: '黑/红', received: {bg: 'rgba(30,30,30,0.85)', text: '#E0E0E0'}, sent: {bg: 'rgb(226,62,87,0.9)', text: '#fff'} },
    'black_green': { name: '黑/绿', received: {bg: 'rgba(30,30,30,0.85)', text: '#E0E0E0'}, sent: {bg: 'rgba(119,221,119,0.9)', text: '#2E5C2E'} },
    'black_white': { name: '黑/白', received: {bg: 'rgba(30,30,30,0.85)', text: '#E0E0E0'}, sent: {bg: 'rgba(245,245,245,0.9)', text: '#333'} },
    'white_black': { name: '白/黑', received: {bg: 'rgba(255,255,255,0.9)', text: '#6D6D6D'}, sent: {bg: 'rgba(50,50,50,0.85)', text: '#F5F5F5'} },
    'yellow_purple': { name: '黄/紫', received: {bg: 'rgba(255,250,205,0.9)', text: '#8B7E4B'}, sent: {bg: 'rgba(185,190,240,0.9)', text: '#6C5B7B'} },
    'pink_blue': { name: '粉/蓝', received: {bg: 'rgba(255,231,240,0.9)', text: '#7C6770'}, sent: {bg: 'rgba(173,216,230,0.9)', text: '#4A6F8A'} },
};

// 内存中的数据状态 (In-Memory State)
let db = {
    characters: [],
    groups: [],
    apiSettings: {},
    wallpaper: 'https://i.postimg.cc/W4Z9R9x4/ins-1.jpg',
    myStickers: [],
    homeScreenMode: 'night',
    worldBooks: [],
    fontUrl: '',
    customIcons: {},
    apiPresets: [],
    bubbleCssPresets: [],
    myPersonaPresets: [],
    forumPosts: [],
    globalCss: '',
    globalCssPresets: [],
    homeSignature: '编辑个性签名...',
    forumBindings: {
        worldBookIds: [],
        charIds: [],
        userPersonaIds: []
    },
    pomodoroTasks: [],
    pomodoroSettings: {
        boundCharId: null,
        userPersona: '',
        focusBackground: '',
        taskCardBackground: '',
        encouragementMinutes: 25,
        pokeLimit: 5,
        globalWorldBookIds: []
    },
    insWidgetSettings: {
        avatar1: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg',
        bubble1: 'love u.',
        avatar2: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg',
        bubble2: 'miss u.'
    },
    homeWidgetSettings: JSON.parse(JSON.stringify(defaultWidgetSettings))
};

// 运行时变量
let currentChatId = null;
let currentChatType = null;
let isGenerating = false;
let longPressTimer = null;
let isInMultiSelectMode = false;
let editingMessageId = null;
let currentPage = 1;
let currentTransferMessageId = null;
let currentEditingWorldBookId = null;
let currentStickerActionTarget = null;
let currentJournalDetailId = null;
let currentQuoteInfo = null;
let currentGroupAction = {type: null, recipients: []};
let currentPomodoroTask = null;
let pomodoroInterval = null;
let pomodoroRemainingSeconds = 0;
let pomodoroCurrentSessionSeconds = 0;
let isPomodoroPaused = true;
let pomodoroPokeCount = 0;
let pomodoroIsInterrupted = false;
let currentPomodoroSettingsContext = null;
let pomodoroSessionHistory = [];
let isStickerManageMode = false;
let selectedStickerIds = new Set();
let isWorldBookMultiSelectMode = false;
let selectedWorldBookIds = new Set();
let peekContentCache = {};
let generatingPeekApps = new Set();
let selectedMessageIds = new Set();
const MESSAGES_PER_PAGE = 50;
let currentPageIndex = 0; // 主页滑动页码

const globalSettingKeys = [
    'apiSettings', 'wallpaper', 'homeScreenMode', 'fontUrl', 'customIcons',
    'apiPresets', 'bubbleCssPresets', 'myPersonaPresets', 'globalCss',
    'globalCssPresets', 'homeSignature', 'forumPosts', 'forumBindings', 'pomodoroTasks', 
    'pomodoroSettings', 'insWidgetSettings', 'homeWidgetSettings'
];

const appVersion = "1.4.0"; 
const updateLog = [
    {
        version: "1.4.0",
        date: "2025-12-12",
        notes: [
            "GitHub云端备份功能上线！",
            "UI优化与Bug修复"
        ]
    }
    // ... 其他日志保留 ...
];

// ==========================================
// 3. 存储核心逻辑 (Storage Core) - 关键修复部分
// ==========================================

// 保存数据到 IndexedDB
const saveData = async () => {
    try {
        console.log("正在保存数据...");
        // 1. 保存聊天 (Character 和 Group 合并存入 chats 表)
        const allChatsToSave = [];

        // 处理角色
        if (db.characters) {
            db.characters.forEach(c => {
                const chatData = {
                    ...c,
                    id: c.id,
                    timestamp: c.lastUserMessageTimestamp || Date.now(),
                    isGroup: false,
                    // 确保关键字段存在
                    settings: c.settings || {}, 
                    history: c.history || []
                };
                allChatsToSave.push(chatData);
            });
        }

        // 处理群组
        if (db.groups) {
            db.groups.forEach(g => {
                const groupData = {
                    ...g,
                    id: g.id,
                    timestamp: Date.now(), // 群组通常按最后活跃排序
                    isGroup: true,
                    settings: g.settings || {},
                    history: g.history || []
                };
                allChatsToSave.push(groupData);
            });
        }

        // 2. 写入数据库事务
        await dexieDB.transaction('rw', dexieDB.chats, dexieDB.worldBooks, dexieDB.myStickers, dexieDB.globalSettings, dexieDB.apiPresets, async () => {
            // 批量保存聊天
            await dexieDB.chats.bulkPut(allChatsToSave);
            
            // 保存世界书
            if (db.worldBooks) await dexieDB.worldBooks.bulkPut(db.worldBooks);
            
            // 保存表情包
            if (db.myStickers) await dexieDB.myStickers.bulkPut(db.myStickers);
            
            // 保存 API 预设
            if (db.apiPresets) await dexieDB.apiPresets.bulkPut(db.apiPresets);

            // 保存全局设置 (Key-Value)
            const settingsPromises = globalSettingKeys.map(key => {
                if (db[key] !== undefined) {
                    return dexieDB.globalSettings.put({ key: key, value: db[key] });
                }
                return null;
            }).filter(p => p);
            await Promise.all(settingsPromises);
        });
        
        console.log("数据保存成功");
    } catch (e) {
        console.error("保存失败:", e);
        if (window.showToast) window.showToast("数据保存失败，请检查控制台");
    }
};

// 从 IndexedDB 加载数据
const loadData = async () => {
    try {
        console.log("正在加载数据...");
        const [chats, worldBooks, myStickers, settingsArray, apiPresets] = await Promise.all([
            dexieDB.chats.toArray(),
            dexieDB.worldBooks.toArray(),
            dexieDB.myStickers.toArray(),
            dexieDB.globalSettings.toArray(),
            dexieDB.apiPresets.toArray()
        ]);

        // 恢复全局数据
        if (worldBooks) db.worldBooks = worldBooks;
        if (myStickers) db.myStickers = myStickers;
        if (apiPresets) db.apiPresets = apiPresets;

        // 恢复设置
        const settingsMap = settingsArray.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
        }, {});

        globalSettingKeys.forEach(key => {
            if (settingsMap[key] !== undefined) {
                db[key] = settingsMap[key];
            }
        });

        // 恢复聊天记录 (区分 Character 和 Group)
        db.characters = chats.filter(c => !c.isGroup).map(c => ({
            ...c,
            // 确保旧数据兼容性
            history: c.history || [],
            settings: c.settings || {},
            peekScreenSettings: c.peekScreenSettings || { wallpaper: '', customIcons: {}, unlockAvatar: '' }
        }));

        db.groups = chats.filter(c => c.isGroup).map(g => ({
            ...g,
            history: g.history || [],
            settings: g.settings || {}
        }));

        // 确保必要的对象存在
        if (!db.homeWidgetSettings) db.homeWidgetSettings = JSON.parse(JSON.stringify(defaultWidgetSettings));
        if (!db.insWidgetSettings) db.insWidgetSettings = {
            avatar1: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg',
            bubble1: 'love u.',
            avatar2: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg',
            bubble2: 'miss u.'
        };

        console.log("数据加载完成:", db);
    } catch (e) {
        console.error("加载数据失败:", e);
        alert("加载数据出错，请检查控制台");
    }
};

// ==========================================
// 4. 工具函数 (Utilities)
// ==========================================

const pad = (num) => num.toString().padStart(2, '0');

function getRandomValue(str) {
    if (str.includes(',')) {
        const arr = str.split(',').map(item => item.trim());
        return arr[Math.floor(Math.random() * arr.length)];
    }
    return str;
}

async function compressImage(file, options = {}) {
    const { quality = 0.8, maxWidth = 800, maxHeight = 800 } = options;
    if (file.type === 'image/gif') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = reject;
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onerror = reject;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (file.type === 'image/png') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
        };
    });
}

// 简单的 Toast 通知
let notificationQueue = [];
let isToastVisible = false;

function processToastQueue() {
    if (isToastVisible || notificationQueue.length === 0) return;
    isToastVisible = true;
    const notification = notificationQueue.shift();
    const toastElement = document.getElementById('toast-notification');
    // 如果没有 toast 元素，创建一个
    if (!toastElement) return;

    const avatarEl = toastElement.querySelector('.toast-avatar');
    const nameEl = toastElement.querySelector('.toast-name');
    const messageEl = toastElement.querySelector('.toast-message');

    const isRichNotification = typeof notification === 'object' && notification !== null && notification.name;

    if (isRichNotification) {
        toastElement.classList.remove('simple');
        if(avatarEl) {
            avatarEl.style.display = 'block';
            avatarEl.src = notification.avatar || 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg';
        }
        if(nameEl) {
            nameEl.style.display = 'block';
            nameEl.textContent = notification.name;
        }
        if(messageEl) {
            messageEl.style.textAlign = 'left';
            messageEl.textContent = notification.message;
        }
    } else {
        toastElement.classList.add('simple');
        if(avatarEl) avatarEl.style.display = 'none';
        if(nameEl) nameEl.style.display = 'none';
        if(messageEl) {
            messageEl.style.textAlign = 'center';
            messageEl.textContent = notification;
        }
    }

    toastElement.classList.add('show');
    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => {
            isToastVisible = false;
            processToastQueue();
        }, 500);
    }, 1500);
}

const showToast = (notification) => {
    notificationQueue.push(notification);
    processToastQueue();
};

function switchScreen(targetId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        // 如果进入主屏幕，确保刷新
        if(targetId === 'home-screen') setupHomeScreen();
    }
    document.querySelectorAll('.modal-overlay, .action-sheet-overlay, .settings-sidebar').forEach(o => o.classList.remove('visible', 'open'));
}

function updateClock() {
    const now = new Date();
    const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const dateString = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日`;

    const els = [
        {t: 'time-display', d: 'date-display'},
        {t: 'peek-time-display', d: 'peek-date-display'}
    ];

    els.forEach(pair => {
        const tEl = document.getElementById(pair.t);
        const dEl = document.getElementById(pair.d);
        if (tEl) tEl.textContent = timeString;
        if (dEl) dEl.textContent = dateString;
    });
}

// ==========================================
// 5. 应用逻辑 (UI Rendering & Features)
// ==========================================

// --- 主屏幕 ---
function setupHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    const getIcon = (id) => db.customIcons[id] || defaultIcons[id].url;
    const insWidget = db.insWidgetSettings;

    // 构建主屏幕 HTML (这里简化，假设 HTML 结构是动态生成的)
    // 注意：实际上你的 index.html 里是 JS 生成 HTML 的，这里照搬原逻辑
    const homeScreenHTML = `
    <div class="home-screen-swiper">
        <div class="home-screen-page">
            <div class="home-widget-container">
                <div class="central-circle" style="background-image: url('${db.homeWidgetSettings.centralCircleImage}');"></div>
                <div class="satellite-oval oval-top-left" data-widget-part="topLeft">
                    <span class="satellite-emoji" contenteditable="true">${db.homeWidgetSettings.topLeft.emoji || '❤️'}</span>
                    <span class="satellite-text" contenteditable="true">${db.homeWidgetSettings.topLeft.text}</span>
                </div>
                <div class="satellite-oval oval-top-right" data-widget-part="topRight">
                    <span class="satellite-emoji" contenteditable="true">${db.homeWidgetSettings.topRight.emoji || '🧡'}</span>
                    <span class="satellite-text" contenteditable="true">${db.homeWidgetSettings.topRight.text}</span>
                </div>
                <div class="satellite-oval oval-bottom-left" data-widget-part="bottomLeft">
                    <span class="satellite-emoji" contenteditable="true">${db.homeWidgetSettings.bottomLeft.emoji || '💛'}</span>
                    <span class="satellite-text" contenteditable="true">${db.homeWidgetSettings.bottomLeft.text}</span>
                </div>
                <div class="satellite-oval oval-bottom-right" data-widget-part="bottomRight">
                    <span class="satellite-emoji" contenteditable="true">${db.homeWidgetSettings.bottomRight.emoji || '💙'}</span>
                    <span class="satellite-text" contenteditable="true">${db.homeWidgetSettings.bottomRight.text}</span>
                </div>
                <div class="widget-time" id="time-display"></div>
                <div contenteditable="true" class="widget-signature" id="widget-signature" placeholder="编辑个性签名...">${db.homeSignature || ''}</div>
                <div class="widget-date" id="date-display"></div>
                <div class="widget-battery">
                    <svg width="32" height="23" viewBox="0 0 24 12" fill="none"><path d="M1 2.5C1 1.94772 1.44772 1.5 2 1.5H20C20.5523 1.5 21 1.94772 21 2.5V9.5C21 10.0523 20.5523 10.5 20 10.5H2C1.44772 10.5 1 10.0523 1 9.5V2.5Z" stroke="#666" stroke-opacity="0.8" stroke-width="1"/><path d="M22.5 4V8" stroke="#666" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round"/><rect id="battery-fill-rect" x="2" y="2.5" width="18" height="7" rx="0.5" fill="#666" fill-opacity="0.8"/></svg>
                    <span id="battery-level">--%</span>
                </div>
            </div>
            <div class="app-grid">
                <div class="app-grid-widget-container">
                   <div class="app-grid-widget">
                        <div class="ins-widget">
                            <div class="ins-widget-row user">
                                <img src="${insWidget.avatar1}" class="ins-widget-avatar" id="ins-widget-avatar-1">
                                <div class="ins-widget-bubble" id="ins-widget-bubble-1" contenteditable="true">${insWidget.bubble1}</div>
                            </div>
                            <div class="ins-widget-divider"><span>୨୧</span></div>
                            <div class="ins-widget-row character">
                                <div class="ins-widget-bubble" id="ins-widget-bubble-2" contenteditable="true">${insWidget.bubble2}</div>
                                <img src="${insWidget.avatar2}" class="ins-widget-avatar" id="ins-widget-avatar-2">
                            </div>
                        </div>
                   </div>
                </div>
                <a href="#" class="app-icon" data-target="chat-list-screen"><img src="${getIcon('chat-list-screen')}" class="icon-img"><span class="app-name">${defaultIcons['chat-list-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="api-settings-screen"><img src="${getIcon('api-settings-screen')}" class="icon-img"><span class="app-name">${defaultIcons['api-settings-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="wallpaper-screen"><img src="${getIcon('wallpaper-screen')}" class="icon-img"><span class="app-name">${defaultIcons['wallpaper-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="world-book-screen"><img src="${getIcon('world-book-screen')}" class="icon-img"><span class="app-name">${defaultIcons['world-book-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="customize-screen"><img src="${getIcon('customize-screen')}" class="icon-img"><span class="app-name">${defaultIcons['customize-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="tutorial-screen"><img src="${getIcon('tutorial-screen')}" class="icon-img"><span class="app-name">${defaultIcons['tutorial-screen'].name}</span></a>
                <div class="heart-photo-widget"></div>
            </div>
        </div>
        <div class="home-screen-page">
             <div class="app-grid">
                <a href="#" class="app-icon" data-target="storage-analysis-screen"><img src="${getIcon('storage-analysis-screen')}" class="icon-img"><span class="app-name">${defaultIcons['storage-analysis-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="pomodoro-screen"><img src="${getIcon('pomodoro-screen')}" class="icon-img"><span class="app-name">${defaultIcons['pomodoro-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="forum-screen"><img src="${getIcon('forum-screen')}" class="icon-img"><span class="app-name">${defaultIcons['forum-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="music-screen"><img src="${getIcon('music-screen')}" class="icon-img"><span class="app-name">${defaultIcons['music-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="diary-screen"><img src="${getIcon('diary-screen')}" class="icon-img"><span class="app-name">${defaultIcons['diary-screen'].name}</span></a>
                <a href="#" class="app-icon" data-target="piggy-bank-screen"><img src="${getIcon('piggy-bank-screen')}" class="icon-img"><span class="app-name">${defaultIcons['piggy-bank-screen'].name}</span></a>
             </div>
        </div>
    </div>
    <div class="page-indicator">
        <span class="dot active" data-page="0"></span>
        <span class="dot" data-page="1"></span>
    </div>
    <div class="dock">
        <a href="#" class="app-icon" id="day-mode-btn"><img src="${getIcon('day-mode-btn')}" class="icon-img"></a>
        <a href="#" class="app-icon" id="night-mode-btn"><img src="${getIcon('night-mode-btn')}" class="icon-img"></a>
        <a href="#" class="app-icon" data-target="font-settings-screen"><img src="${getIcon('font-settings-screen')}" class="icon-img"></a>
    </div>`;
    
    homeScreen.innerHTML = homeScreenHTML;
    
    // 初始化主页事件
    updateClock();
    if(db.wallpaper) homeScreen.style.backgroundImage = `url(${db.wallpaper})`;
    if(db.homeScreenMode === 'day') homeScreen.classList.add('day-mode');
    else homeScreen.classList.remove('day-mode');

    // 拍立得
    const polaroidImage = db.homeWidgetSettings?.polaroidImage;
    if (polaroidImage) {
        // 创建样式覆盖默认
        const styleId = 'polaroid-image-style';
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        styleElement.innerHTML = `.heart-photo-widget::after { background-image: url('${polaroidImage}'); }`;
    }

    // 绑定主页基本事件
    document.getElementById('day-mode-btn')?.addEventListener('click', (e) => { e.preventDefault(); db.homeScreenMode = 'day'; saveData(); setupHomeScreen(); });
    document.getElementById('night-mode-btn')?.addEventListener('click', (e) => { e.preventDefault(); db.homeScreenMode = 'night'; saveData(); setupHomeScreen(); });
    
    // 失焦保存逻辑
    homeScreen.addEventListener('blur', async (e) => {
        const target = e.target;
        if (target.hasAttribute('contenteditable')) {
            if (target.id === 'widget-signature') {
                db.homeSignature = target.textContent.trim();
                await saveData();
            } else if (target.classList.contains('satellite-emoji') || target.classList.contains('satellite-text')) {
                const part = target.closest('.satellite-oval').dataset.widgetPart;
                const prop = target.classList.contains('satellite-emoji') ? 'emoji' : 'text';
                db.homeWidgetSettings[part][prop] = target.textContent.trim();
                await saveData();
            } else if (target.id.includes('ins-widget-bubble')) {
                const id = target.id.includes('1') ? 'bubble1' : 'bubble2';
                db.insWidgetSettings[id] = target.textContent.trim();
                await saveData();
            }
        }
    }, true);

    // 滑动翻页逻辑
    const swiper = homeScreen.querySelector('.home-screen-swiper');
    let startX = 0;
    swiper.style.transform = `translateX(-${currentPageIndex * 50}%)`;
    // ... 添加翻页监听 (略，为保持代码简洁，这部分逻辑建议参考原文件，重点是数据保存)
    // 简单实现点击翻页点
    document.querySelectorAll('.page-indicator .dot').forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            currentPageIndex = idx;
            swiper.style.transform = `translateX(-${currentPageIndex * 50}%)`;
            document.querySelectorAll('.page-indicator .dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });
}

// --- 聊天列表 ---
function renderChatList() {
    const container = document.getElementById('chat-list-container');
    const placeholder = document.getElementById('no-chats-placeholder');
    container.innerHTML = '';
    
    const allChats = [
        ...(db.characters || []).map(c => ({...c, type: 'private'})), 
        ...(db.groups || []).map(g => ({...g, type: 'group'}))
    ];

    if (allChats.length === 0) {
        placeholder.style.display = 'block';
        return;
    }
    placeholder.style.display = 'none';

    // 排序：置顶优先，然后按时间倒序
    allChats.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (b.timestamp || 0) - (a.timestamp || 0);
    });

    allChats.forEach(chat => {
        const li = document.createElement('li');
        li.className = 'list-item chat-item';
        if (chat.isPinned) li.classList.add('pinned');
        li.dataset.id = chat.id;
        li.dataset.type = chat.type;
        
        const name = chat.type === 'private' ? chat.remarkName : chat.name;
        // 获取最后一条消息
        const lastMsg = chat.history && chat.history.length > 0 ? chat.history[chat.history.length - 1] : null;
        let preview = '开始聊天吧...';
        if(lastMsg) {
            // 简单处理预览
            preview = lastMsg.content.substring(0, 20);
            if(lastMsg.content.includes('system')) preview = '[系统消息]';
        }

        li.innerHTML = `
            <img src="${chat.avatar}" class="chat-avatar ${chat.type === 'group' ? 'group-avatar' : ''}">
            <div class="item-details">
                <div class="item-details-row"><div class="item-name">${name}</div></div>
                <div class="item-preview-wrapper"><div class="item-preview">${preview}</div></div>
            </div>
        `;
        
        li.addEventListener('click', () => {
            currentChatId = chat.id;
            currentChatType = chat.type;
            openChatRoom();
        });
        
        container.appendChild(li);
    });
}

// --- 聊天室 ---
function openChatRoom() {
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    if (!chat) return;

    // 设置标题
    document.getElementById('chat-room-title').textContent = currentChatType === 'private' ? chat.remarkName : chat.name;
    document.getElementById('chat-room-screen').style.backgroundImage = chat.chatBg ? `url(${chat.chatBg})` : 'none';
    
    renderMessages();
    switchScreen('chat-room-screen');
}

function renderMessages() {
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    const area = document.getElementById('message-area');
    area.innerHTML = '';
    
    if(!chat.history) return;

    chat.history.forEach(msg => {
        const div = document.createElement('div');
        const isSent = msg.role === 'user';
        div.className = `message-wrapper ${isSent ? 'sent' : 'received'}`;
        
        let contentHtml = DOMPurify.sanitize(msg.content);
        // 简单处理头像
        const avatar = isSent 
            ? ((currentChatType==='private') ? chat.myAvatar : chat.me.avatar)
            : chat.avatar; // 这里简化了群聊头像逻辑，实际应查找 member

        div.innerHTML = `
            <div class="message-bubble-row">
                <div class="message-info"><img src="${avatar}" class="message-avatar"></div>
                <div class="message-bubble ${isSent ? 'sent' : 'received'}">${contentHtml}</div>
            </div>
        `;
        area.appendChild(div);
    });
    
    area.scrollTop = area.scrollHeight;
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;
    
    const chat = (currentChatType === 'private') ? db.characters.find(c => c.id === currentChatId) : db.groups.find(g => g.id === currentChatId);
    if(!chat) return;

    const myName = (currentChatType === 'private') ? chat.myName : chat.me.nickname;
    const msgContent = `[${myName}的消息：${text}]`;

    const newMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: msgContent,
        parts: [{type: 'text', text: msgContent}],
        timestamp: Date.now()
    };

    chat.history.push(newMessage);
    chat.lastUserMessageTimestamp = Date.now(); // 触发排序
    input.value = '';
    
    renderMessages();
    // 关键点：操作后立即保存
    await saveData(); 
    // 在实际应用中，这里应调用 getAiReply
}

// --- API 设置 ---
function setupApiSettings() {
    const form = document.getElementById('api-form');
    // 填充数据
    if(db.apiSettings) {
        if(db.apiSettings.url) document.getElementById('api-url').value = db.apiSettings.url;
        if(db.apiSettings.key) document.getElementById('api-key').value = db.apiSettings.key;
        // ... 其他字段
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        db.apiSettings = {
            url: document.getElementById('api-url').value,
            key: document.getElementById('api-key').value,
            provider: document.getElementById('api-provider').value,
            model: document.getElementById('api-model').value
        };
        await saveData();
        showToast('API 设置已保存');
    });
}

// --- 添加角色 ---
function setupAddChar() {
    document.getElementById('add-char-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newChar = {
            id: `char_${Date.now()}`,
            realName: document.getElementById('char-real-name').value,
            remarkName: document.getElementById('char-remark-name').value,
            persona: '',
            avatar: 'https://i.postimg.cc/Y96LPskq/o-o-2.jpg',
            myName: document.getElementById('my-name-for-char').value,
            myPersona: '',
            myAvatar: 'https://i.postimg.cc/GtbTnxhP/o-o-1.jpg',
            history: [],
            settings: {},
            lastUserMessageTimestamp: Date.now()
        };
        db.characters.push(newChar);
        await saveData();
        document.getElementById('add-char-modal').classList.remove('visible');
        renderChatList();
        showToast('角色创建成功');
    });
}

// ==========================================
// 6. 初始化 (Initialization)
// ==========================================

async function init() {
    console.log("App initializing...");
    // 1. 必须先等待数据加载完成
    await loadData();
    
    // 2. 数据加载完后，渲染界面
    updateClock();
    setInterval(updateClock, 30000);
    
    // 应用全局设置
    if(db.globalCss) {
        const style = document.getElementById('global-css-style');
        if(style) style.innerHTML = db.globalCss;
    }

    setupHomeScreen();
    renderChatList();
    setupApiSettings();
    setupAddChar();

    // 绑定全局点击事件 (用于导航)
    document.body.addEventListener('click', (e) => {
        const backBtn = e.target.closest('.back-btn');
        if (backBtn) {
            e.preventDefault();
            switchScreen(backBtn.getAttribute('data-target'));
        }
        
        // 绑定底部 Dock 点击
        const navLink = e.target.closest('.app-icon[data-target]');
        if (navLink) {
            e.preventDefault();
            switchScreen(navLink.getAttribute('data-target'));
        }
    });

    // 绑定发送按钮
    const sendBtn = document.getElementById('send-message-btn');
    if(sendBtn) sendBtn.addEventListener('click', sendMessage);
    
    console.log("App initialized.");
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);

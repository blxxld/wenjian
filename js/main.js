// 导入模块化代码
import { StorageUtil, DOMUtil, debounce, throttle } from './modules/utils.js';
import { Constants } from './modules/constants.js';
import { ResourceManager } from './modules/resourceManager.js';
import { FavoriteManager } from './modules/favoriteManager.js';
import { ResourceDisplay } from './modules/resourceDisplay.js';
import { FilterSystem } from './modules/filterSystem.js';
import { AnimationManager } from './modules/animationManager.js';
import { SearchSystem } from './modules/searchSystem.js';

// 统计功能模块
const StatsManager = {
    updateAboutStats() {
        const resourceCountElement = document.getElementById('resource-count');
        if (resourceCountElement && !resourceCountElement.textContent) {
            resourceCountElement.textContent = ResourceManager.getResources().length;
        }
        
        // 计算分类数量
        const categories = new Set(ResourceManager.getResources().map(r => r.category));
        const categoryCountElement = document.getElementById('category-count');
        if (categoryCountElement) {
            categoryCountElement.textContent = categories.size;
        }
    }
};

// 积分管理模块
const PointsManager = {
    // 积分配置
    pointConfig: {
        submitResource: 10, // 提交资源获得10积分
        resourceApproved: 20, // 资源审核通过获得20积分
        dailyLogin: 1, // 每日登录获得1积分
        shareResource: 2 // 分享资源获得2积分
    },
    
    // 初始化用户积分
    initUserPoints(username) {
        const users = this.getUsersPoints();
        if (!users[username]) {
            users[username] = {
                points: 0,
                username: username,
                lastLogin: null,
                submissions: 0
            };
            this.saveUsersPoints(users);
            console.log('初始化用户积分成功:', users[username]);
        }
        return users[username];
    },
    
    // 获取所有用户积分
    getUsersPoints() {
        return StorageUtil.get('usersPoints', {});
    },
    
    // 保存用户积分
    saveUsersPoints(users) {
        StorageUtil.set('usersPoints', users);
        // 触发storage事件，通知其他标签页更新
        localStorage.setItem('usersPointsUpdated', Date.now().toString());
        
        // 如果Firebase可用，同步到Firebase
        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                firebase.database().ref('usersPoints').set(users);
                console.log('积分数据已同步到Firebase');
            } catch (error) {
                console.error('同步到Firebase失败:', error);
            }
        }
    },
    
    // 增加用户积分
    addPoints(username, points, reason) {
        let users = this.getUsersPoints();
        if (!users[username]) {
            this.initUserPoints(username);
            // 重新获取更新后的用户数据
            users = this.getUsersPoints();
        }
        
        // 确保users[username]存在
        if (!users[username]) {
            users[username] = {
                points: 0,
                username: username,
                lastLogin: null,
                submissions: 0
            };
        }
        
        users[username].points += points;
        users[username].lastLogin = new Date().toISOString();
        
        if (reason === 'submitResource') {
            users[username].submissions = (users[username].submissions || 0) + 1;
        }
        
        this.saveUsersPoints(users);
        console.log('添加积分成功:', username, points, '积分', '原因:', reason, '当前积分:', users[username].points);
        return users[username];
    },
    
    // 获取用户积分
    getUserPoints(username) {
        const users = this.getUsersPoints();
        return users[username] || { points: 0, username: username, lastLogin: null, submissions: 0 };
    },
    
    // 获取积分排行榜
    getRanking(limit = 10, type = 'total') {
        const users = this.getUsersPoints();
        let filteredUsers = Object.values(users);
        
        // 根据类型筛选时间范围
        if (type !== 'total') {
            const now = new Date();
            let cutoffDate;
            
            if (type === 'daily') {
                // 24小时内
                cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (type === 'weekly') {
                // 7天内
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }
            
            // 筛选在时间范围内有活动的用户
            filteredUsers = filteredUsers.filter(user => {
                if (!user.lastLogin) return false;
                const lastLoginDate = new Date(user.lastLogin);
                return lastLoginDate >= cutoffDate;
            });
        }
        
        // 排序并返回前N名
        return filteredUsers
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    },
    
    // 记录每日登录积分
    claimDailyLoginPoints(username) {
        const user = this.getUserPoints(username);
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        const today = new Date();
        
        // 检查是否已经领取过今日积分
        if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
            const updatedUser = this.addPoints(username, this.pointConfig.dailyLogin, 'dailyLogin');
            console.log('领取每日登录积分成功:', updatedUser);
            return updatedUser;
        }
        console.log('今日已领取过积分:', user);
        return user;
    },
    
    // 从Firebase同步数据
    syncFromFirebase() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            try {
                firebase.database().ref('usersPoints').once('value')
                    .then(snapshot => {
                        const usersPoints = snapshot.val();
                        if (usersPoints) {
                            StorageUtil.set('usersPoints', usersPoints);
                            localStorage.setItem('usersPointsUpdated', Date.now().toString());
                            console.log('从Firebase同步积分数据成功');
                        }
                    })
                    .catch(error => {
                        console.error('从Firebase同步数据失败:', error);
                    });
            } catch (error) {
                console.error('从Firebase同步数据失败:', error);
            }
        }
    }
};

// 用户管理模块
const UserManager = {
    // 获取当前用户
    getCurrentUser() {
        try {
            return StorageUtil.get('currentUser', null);
        } catch (error) {
            console.error('获取当前用户失败:', error);
            return null;
        }
    },
    
    // 检查用户是否已登录
    isLoggedIn() {
        try {
            return this.getCurrentUser() !== null;
        } catch (error) {
            console.error('检查登录状态失败:', error);
            return false;
        }
    },
    
    // 检查用户是否为管理员
    isAdmin() {
        try {
            const user = this.getCurrentUser();
            return user && user.role === 'admin';
        } catch (error) {
            console.error('检查管理员状态失败:', error);
            return false;
        }
    },
    
    // 登出用户
    logout() {
        try {
            StorageUtil.remove('currentUser');
            this.updateUserMenu();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('登出失败:', error);
        }
    },
    
    // 更新用户菜单
    updateUserMenu() {
        try {
            const userMenu = DOMUtil.$('#user-menu');
            if (!userMenu) return;
            
            if (this.isLoggedIn()) {
                const user = this.getCurrentUser();
                if (!user) {
                    userMenu.innerHTML = '<a href="auth.html"><i class="fas fa-user"></i> 登录/注册</a>';
                    return;
                }
                
                let userPoints = { points: 0 };
                try {
                    userPoints = PointsManager.getUserPoints(user.username);
                } catch (error) {
                    console.error('获取用户积分失败:', error);
                }
                
                // 构建菜单内容
                let menuContent = `
                    <div class="user-dropdown">
                        <a href="#" class="user-profile">
                            <i class="fas fa-user-circle"></i> ${user.username}
                            <span class="user-points">${userPoints.points || 0} 积分</span>
                            <i class="fas fa-chevron-down"></i>
                        </a>
                        <div class="dropdown-menu">
                            <a href="#" class="dropdown-item"><i class="fas fa-user"></i> 个人中心</a>
                            <a href="ranking.html" class="dropdown-item"><i class="fas fa-trophy"></i> 积分排行榜</a>
                            <a href="#" class="dropdown-item"><i class="fas fa-heart"></i> 我的收藏</a>
                            <a href="ai-assistant.html" class="dropdown-item"><i class="fas fa-robot"></i> AI助手</a>
                            <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> 设置</a>
                `
                
                // 如果是管理员，添加管理员菜单
                if (this.isAdmin()) {
                    menuContent += `
                            <div class="dropdown-divider"></div>
                            <a href="admin.html" class="dropdown-item"><i class="fas fa-shield-alt"></i> 管理后台</a>
                    `;
                }
                
                menuContent += `
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i> 登出</a>
                        </div>
                    </div>
                `;
                
                userMenu.innerHTML = menuContent;
                
                // 绑定登出按钮事件
                const logoutBtn = userMenu.querySelector('.logout-btn');
                if (logoutBtn) {
                    DOMUtil.on(logoutBtn, 'click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
                
                // 绑定个人中心按钮事件
                const profileLink = userMenu.querySelector('.dropdown-item:nth-child(1)');
                if (profileLink) {
                    DOMUtil.on(profileLink, 'click', (e) => {
                        e.preventDefault();
                        window.location.href = 'profile.html';
                    });
                }
                
                // 绑定我的收藏按钮事件
                const favoritesLink = userMenu.querySelector('.dropdown-item:nth-child(3)');
                if (favoritesLink) {
                    DOMUtil.on(favoritesLink, 'click', (e) => {
                        e.preventDefault();
                        window.location.href = 'profile.html#favorites';
                    });
                }
                
                // 绑定下拉菜单事件
                const userProfile = userMenu.querySelector('.user-profile');
                const dropdownMenu = userMenu.querySelector('.dropdown-menu');
                
                if (userProfile && dropdownMenu) {
                    DOMUtil.on(userProfile, 'click', (e) => {
                        e.preventDefault();
                        dropdownMenu.classList.toggle('active');
                    });
                    
                    // 点击其他区域关闭下拉菜单
                    DOMUtil.on(document, 'click', (e) => {
                        if (!userMenu.contains(e.target)) {
                            dropdownMenu.classList.remove('active');
                        }
                    });
                }
            } else {
                userMenu.innerHTML = '<a href="auth.html"><i class="fas fa-user"></i> 登录/注册</a>';
            }
        } catch (error) {
            console.error('更新用户菜单失败:', error);
        }
    },
    
    // 确保管理员账户存在
    ensureAdminAccount() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // 检查是否已有管理员账户
            const existingAdmin = users.find(user => user.role === 'admin');
            if (existingAdmin) {
                return;
            }
            
            // 创建管理员账户
            const adminUser = {
                id: Date.now(),
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            
            // 添加到用户列表
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('管理员账户已创建：', adminUser.username);
        } catch (error) {
            console.error('确保管理员账户存在失败:', error);
        }
    }
};

// 页面初始化
async function initPage() {
    console.log('开始初始化页面...');
    const startTime = performance.now();
    
    // 先执行同步操作，确保页面基础功能正常
    function initSyncTasks() {
        console.log('执行同步任务...');
        // 确保管理员账户存在
        try {
            UserManager.ensureAdminAccount();
            console.log('管理员账户检查完成');
        } catch (error) {
            console.error('管理员账户检查失败:', error);
        }
        
        // 移动端菜单切换
        try {
            const navToggle = DOMUtil.$('.nav-toggle');
            const navMenu = DOMUtil.$('.nav-menu');
            
            if (navToggle && navMenu) {
                DOMUtil.on(navToggle, 'click', function() {
                    navMenu.classList.toggle('active');
                });
                console.log('移动端菜单初始化完成');
            }
        } catch (error) {
            console.error('移动端菜单初始化失败:', error);
        }
        
        // 更新用户菜单
        try {
            UserManager.updateUserMenu();
            console.log('用户菜单更新完成');
        } catch (error) {
            console.error('用户菜单更新失败:', error);
        }
        
        // 搜索功能初始化
        try {
            SearchSystem.init();
            console.log('搜索功能初始化完成');
        } catch (error) {
            console.error('搜索功能初始化失败:', error);
        }
        
        // 键盘快捷键支持
        try {
            DOMUtil.on(document, 'keydown', function(e) {
                // 按 Ctrl/Cmd + K 打开搜索
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    const searchBox = DOMUtil.$('#search-input');
                    if (searchBox) {
                        searchBox.focus();
                    }
                }
                
                // 按 Escape 关闭搜索
                if (e.key === 'Escape') {
                    const searchBox = DOMUtil.$('#search-input');
                    if (searchBox) {
                        searchBox.blur();
                        try {
                            SearchSystem.hideSearchSuggestions();
                        } catch (error) {
                            console.error('隐藏搜索建议失败:', error);
                        }
                    }
                }
                
                // 按 Ctrl/Cmd + Home 回到顶部
                if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            console.log('键盘快捷键初始化完成');
        } catch (error) {
            console.error('键盘快捷键初始化失败:', error);
        }
    }
    
    // 执行同步任务
    initSyncTasks();
    
    // 异步加载资源数据
    try {
        console.log('开始加载资源数据...');
        await ResourceManager.loadResources();
        console.log('资源数据加载完成');
        
        // 资源加载完成后执行后续操作
        try {
            const hotResourcesContainer = DOMUtil.$('#hot-resources');
            if (hotResourcesContainer) {
                const hotResources = ResourceManager.getHotResources(6);
                ResourceDisplay.displayResources(hotResources, hotResourcesContainer);
                console.log('热门资源显示完成');
                
                // 初始化动画（仅在首页）
                try {
                    AnimationManager.initAllAnimations();
                    console.log('动画初始化完成');
                } catch (error) {
                    console.error('动画初始化失败:', error);
                }
            }
        } catch (error) {
            console.error('显示热门资源失败:', error);
        }
        
        // 更新关于页面的统计数据
        try {
            StatsManager.updateAboutStats();
            console.log('统计数据更新完成');
        } catch (error) {
            console.error('统计数据更新失败:', error);
        }
        
        // 初始化筛选系统（在资源页面）
        try {
            FilterSystem.init();
            console.log('筛选系统初始化完成');
        } catch (error) {
            console.error('筛选系统初始化失败:', error);
        }
        
    } catch (error) {
        console.error('初始化页面失败:', error);
    }
    
    const endTime = performance.now();
    console.log('页面初始化完成，耗时:', (endTime - startTime).toFixed(2), 'ms');
    
    // 强制隐藏预加载动画
    try {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            console.log('隐藏预加载动画');
            preloader.classList.add('hidden');
            preloader.style.display = 'none';
        }
    } catch (error) {
        console.error('隐藏预加载动画失败:', error);
    }
}

// 预加载动画功能 (已移除)
function initPreloader() {
    // 预加载器已移除，不再需要初始化
}

// 滚动到顶部按钮功能
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('active');
        } else {
            scrollToTopBtn.classList.remove('active');
        }
    });
    
    // 点击回到顶部
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 移除预加载器元素
function removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.remove();
        console.log('预加载器已移除');
    }
}

// 定期检查并移除preloader元素
function checkAndRemovePreloader() {
    // 立即执行一次
    removePreloader();
    
    // 每500毫秒检查一次，持续3秒
    let count = 0;
    const interval = setInterval(() => {
        removePreloader();
        count++;
        if (count >= 6) {
            clearInterval(interval);
            console.log('预加载器检查完成');
        }
    }, 500);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 立即移除preloader元素
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.remove();
        console.log('Preloader removed on DOMContentLoaded');
    }
    
    // 定期检查并移除preloader元素
    checkAndRemovePreloader();
    
    // 初始化其他功能
    initPreloader();
    initPage();
    initScrollToTop();
});
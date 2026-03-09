// ==================== 通知系统模块 ====================

import { StorageUtil, DOMUtil } from './utils.js';

export const NotificationSystem = {
    init() {
        this.loadNotifications();
        this.loadSubscriptions();
        this.setupNotificationUI();
        this.setupSubscriptionForm();
        this.startCountdowns();
    },
    
    notifications: [],
    subscriptions: {
       竞赛信息: false,
       实习信息: false,
       就业信息: false,
       活动信息: false,
       资源更新: false
    },
    
    loadNotifications() {
        this.notifications = StorageUtil.get('notifications', []);
        // 过滤掉已过期的通知
        this.notifications = this.notifications.filter(notification => {
            if (notification.expiresAt) {
                return new Date(notification.expiresAt) > new Date();
            }
            return true;
        });
        StorageUtil.set('notifications', this.notifications);
    },
    
    loadSubscriptions() {
        const savedSubscriptions = StorageUtil.get('subscriptions', {});
        this.subscriptions = {
            ...this.subscriptions,
            ...savedSubscriptions
        };
    },
    
    setupNotificationUI() {
        // 显示通知列表
        this.displayNotifications();
        
        // 绑定通知标记为已读
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-mark-read')) {
                const notificationId = e.target.closest('.notification-mark-read').getAttribute('data-notification-id');
                this.markNotificationAsRead(notificationId);
            }
        });
        
        // 绑定通知删除
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-delete')) {
                const notificationId = e.target.closest('.notification-delete').getAttribute('data-notification-id');
                this.deleteNotification(notificationId);
            }
        });
        
        // 绑定通知菜单
        const notificationBell = DOMUtil.$('#notification-bell');
        const notificationMenu = DOMUtil.$('#notification-menu');
        
        if (notificationBell && notificationMenu) {
            DOMUtil.on(notificationBell, 'click', (e) => {
                e.preventDefault();
                notificationMenu.classList.toggle('active');
                this.displayNotifications();
                this.updateNotificationCount();
            });
            
            // 点击其他区域关闭通知菜单
            DOMUtil.on(document, 'click', (e) => {
                if (!notificationBell.contains(e.target) && !notificationMenu.contains(e.target)) {
                    notificationMenu.classList.remove('active');
                }
            });
        }
    },
    
    setupSubscriptionForm() {
        // 绑定订阅表单提交
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'subscription-form') {
                e.preventDefault();
                this.saveSubscriptions(e.target);
            }
        });
        
        // 填充订阅表单
        this.fillSubscriptionForm();
    },
    
    saveSubscriptions(form) {
        const subscriptions = {
            竞赛信息: form.elements['subscription-竞赛信息'].checked,
            实习信息: form.elements['subscription-实习信息'].checked,
            就业信息: form.elements['subscription-就业信息'].checked,
            活动信息: form.elements['subscription-活动信息'].checked,
            资源更新: form.elements['subscription-资源更新'].checked
        };
        
        this.subscriptions = subscriptions;
        StorageUtil.set('subscriptions', subscriptions);
        
        // 显示保存成功提示
        this.showSubscriptionSuccess();
        
        console.log('订阅设置保存成功:', subscriptions);
    },
    
    fillSubscriptionForm() {
        const form = DOMUtil.$('#subscription-form');
        if (!form) return;
        
        for (const [key, value] of Object.entries(this.subscriptions)) {
            const checkbox = form.elements[`subscription-${key}`];
            if (checkbox) {
                checkbox.checked = value;
            }
        }
    },
    
    showSubscriptionSuccess() {
        const successHTML = `
            <div class="subscription-success">
                <div class="subscription-success-content">
                    <i class="fas fa-check-circle"></i>
                    <h4>保存成功</h4>
                    <p>您的订阅设置已保存，我们将按照您的偏好发送通知！</p>
                    <button class="btn btn-primary" id="close-subscription-success">确定</button>
                </div>
            </div>
        `;
        
        // 移除已存在的成功提示
        const existingSuccess = document.querySelector('.subscription-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // 添加成功提示
        document.body.insertAdjacentHTML('beforeend', successHTML);
        
        // 绑定关闭按钮
        document.getElementById('close-subscription-success').addEventListener('click', () => {
            document.querySelector('.subscription-success').remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            const success = document.querySelector('.subscription-success');
            if (success) {
                success.remove();
            }
        }, 3000);
    },
    
    displayNotifications() {
        const notificationContainer = DOMUtil.$('#notification-list');
        if (!notificationContainer) return;
        
        if (this.notifications.length === 0) {
            notificationContainer.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>暂无通知</p>
                </div>
            `;
            return;
        }
        
        // 按时间排序，最新的在前面
        const sortedNotifications = [...this.notifications].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        notificationContainer.innerHTML = sortedNotifications.map(notification => {
            const isRead = notification.read || false;
            const readClass = isRead ? 'read' : '';
            const timeAgo = this.getTimeAgo(notification.createdAt);
            
            return `
                <div class="notification-item ${readClass}" data-notification-id="${notification.id}">
                    <div class="notification-icon">
                        <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <div class="notification-meta">
                            <span class="notification-time">${timeAgo}</span>
                            ${notification.expiresAt ? `<span class="notification-countdown" data-expires-at="${notification.expiresAt}"></span>` : ''}
                        </div>
                    </div>
                    <div class="notification-actions">
                        ${!isRead ? `<button class="notification-mark-read" data-notification-id="${notification.id}" title="标记为已读">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                        <button class="notification-delete" data-notification-id="${notification.id}" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // 初始化倒计时
        this.initCountdowns();
    },
    
    getNotificationIcon(type) {
        const iconMap = {
            竞赛: 'fa-trophy',
            实习: 'fa-briefcase',
            就业: 'fa-briefcase',
            活动: 'fa-calendar-alt',
            资源: 'fa-file-alt',
            系统: 'fa-bell'
        };
        return iconMap[type] || 'fa-bell';
    },
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) {
            return '刚刚';
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}分钟前`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}小时前`;
        } else if (diffInSeconds < 604800) {
            return `${Math.floor(diffInSeconds / 86400)}天前`;
        } else {
            return past.toLocaleDateString();
        }
    },
    
    markNotificationAsRead(notificationId) {
        const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
            this.notifications[notificationIndex].read = true;
            StorageUtil.set('notifications', this.notifications);
            this.displayNotifications();
            this.updateNotificationCount();
        }
    },
    
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        StorageUtil.set('notifications', this.notifications);
        this.displayNotifications();
        this.updateNotificationCount();
    },
    
    addNotification(notification) {
        const newNotification = {
            id: Date.now().toString(),
            title: notification.title,
            message: notification.message,
            type: notification.type || '系统',
            createdAt: new Date().toISOString(),
            expiresAt: notification.expiresAt,
            read: false,
            link: notification.link
        };
        
        this.notifications.unshift(newNotification);
        
        // 限制通知数量
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        StorageUtil.set('notifications', this.notifications);
        this.updateNotificationCount();
        
        console.log('新通知添加成功:', newNotification);
        return newNotification;
    },
    
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const countElement = DOMUtil.$('#notification-count');
        
        if (countElement) {
            if (unreadCount > 0) {
                countElement.textContent = unreadCount;
                countElement.classList.add('active');
            } else {
                countElement.textContent = '';
                countElement.classList.remove('active');
            }
        }
    },
    
    initCountdowns() {
        const countdownElements = document.querySelectorAll('.notification-countdown');
        countdownElements.forEach(element => {
            const expiresAt = element.getAttribute('data-expires-at');
            this.updateCountdown(element, expiresAt);
        });
    },
    
    updateCountdown(element, expiresAt) {
        const now = new Date();
        const expireTime = new Date(expiresAt);
        const diff = expireTime - now;
        
        if (diff <= 0) {
            element.textContent = '已结束';
            element.classList.add('expired');
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            element.textContent = `${days}天 ${hours}小时后结束`;
        } else if (hours > 0) {
            element.textContent = `${hours}小时 ${minutes}分钟后结束`;
        } else {
            element.textContent = `${minutes}分钟后结束`;
        }
    },
    
    startCountdowns() {
        // 每分钟更新一次倒计时
        setInterval(() => {
            this.initCountdowns();
        }, 60000);
    },
    
    // 发送竞赛报名提醒
    sendCompetitionReminder(competition) {
        if (this.subscriptions.竞赛信息) {
            this.addNotification({
                title: `竞赛报名提醒：${competition.title}`,
                message: `竞赛报名将于${new Date(competition.deadline).toLocaleDateString()}截止，赶快报名吧！`,
                type: '竞赛',
                expiresAt: competition.deadline,
                link: competition.link
            });
        }
    },
    
    // 发送实习信息提醒
    sendInternshipReminder(internship) {
        if (this.subscriptions.实习信息) {
            this.addNotification({
                title: `新实习信息：${internship.title}`,
                message: `${internship.company}发布了新的实习机会，不要错过！`,
                type: '实习',
                link: internship.link
            });
        }
    },
    
    // 发送资源更新提醒
    sendResourceUpdateReminder(resource) {
        if (this.subscriptions.资源更新) {
            this.addNotification({
                title: `新资源上线：${resource.title}`,
                message: `我们新增了${resource.title}资源，快来看看吧！`,
                type: '资源',
                link: resource.link
            });
        }
    },
    
    // 获取未读通知数量
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    },
    
    // 获取所有通知
    getAllNotifications() {
        return this.notifications;
    },
    
    // 获取用户订阅设置
    getSubscriptions() {
        return this.subscriptions;
    }
};

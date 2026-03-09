// ==================== 更新日志模块 ====================

import { StorageUtil, DOMUtil } from './utils.js';

export const UpdateLogSystem = {
    init() {
        this.loadUpdateLogs();
        this.setupUpdateLogDisplay();
    },
    
    updateLogs: [],
    
    loadUpdateLogs() {
        this.updateLogs = StorageUtil.get('updateLogs', this.getDefaultUpdateLogs());
    },
    
    getDefaultUpdateLogs() {
        return [
            {
                id: 1,
                date: '2024-09-10',
                title: '平台功能全面升级',
                content: [
                    '新增问卷社区功能，支持问卷发布和流量获取',
                    '添加充值中心，支持微信/支付宝购买积分',
                    '优化搜索系统，增加关键词联想和历史记录',
                    '添加资源反馈功能，支持用户举报失效资源',
                    '新增个性化推荐系统，根据用户专业推送资源',
                    '添加通知提醒功能，支持竞赛报名倒计时',
                    '完善社区共建模式，增加用户激励机制',
                    '新增原创内容板块，提供竞赛指南和工具清单'
                ],
                type: 'major'
            },
            {
                id: 2,
                date: '2024-09-05',
                title: '资源库更新',
                content: [
                    '新增2024年秋季学期课程资料',
                    '更新全国大学生竞赛日历',
                    '添加100+实用工具资源',
                    '优化资源分类结构',
                    '修复部分资源链接失效问题'
                ],
                type: 'resource'
            },
            {
                id: 3,
                date: '2024-09-01',
                title: '用户体验优化',
                content: [
                    '优化移动端适配，提升手机端浏览体验',
                    '改进页面加载速度',
                    '优化资源卡片布局',
                    '添加资源热度排序功能',
                    '完善搜索筛选功能'
                ],
                type: 'optimization'
            },
            {
                id: 4,
                date: '2024-08-25',
                title: '平台初始化',
                content: [
                    '平台正式上线',
                    '完成基础资源库搭建',
                    '实现核心功能模块',
                    '建立用户反馈机制'
                ],
                type: 'initial'
            }
        ];
    },
    
    setupUpdateLogDisplay() {
        // 显示更新日志
        this.displayUpdateLogs();
        
        // 绑定日志筛选事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.log-filter-btn')) {
                const filter = e.target.closest('.log-filter-btn').getAttribute('data-filter');
                this.filterUpdateLogs(filter);
            }
        });
    },
    
    displayUpdateLogs(logs = this.updateLogs) {
        const container = DOMUtil.$('#update-logs-container');
        if (!container) return;
        
        container.innerHTML = logs.map(log => {
            const typeClass = `log-type-${log.type}`;
            return `
                <div class="update-log-item animate-on-scroll ${typeClass}">
                    <div class="log-header">
                        <h3 class="log-title">${log.title}</h3>
                        <span class="log-date">${log.date}</span>
                        <span class="log-type">${this.getTypeText(log.type)}</span>
                    </div>
                    <div class="log-content">
                        <ul>
                            ${log.content.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    getTypeText(type) {
        const typeMap = {
            'major': '重大更新',
            'resource': '资源更新',
            'optimization': '体验优化',
            'initial': '平台初始化'
        };
        return typeMap[type] || type;
    },
    
    filterUpdateLogs(filter) {
        let filteredLogs;
        if (filter === 'all') {
            filteredLogs = this.updateLogs;
        } else {
            filteredLogs = this.updateLogs.filter(log => log.type === filter);
        }
        this.displayUpdateLogs(filteredLogs);
    },
    
    // 添加新的更新日志
    addUpdateLog(log) {
        const newLog = {
            id: this.updateLogs.length + 1,
            ...log,
            date: log.date || new Date().toISOString().split('T')[0]
        };
        this.updateLogs.unshift(newLog); // 新日志放在最前面
        StorageUtil.set('updateLogs', this.updateLogs);
        this.displayUpdateLogs();
    },
    
    // 获取最新的更新日志
    getLatestUpdateLogs(limit = 5) {
        return this.updateLogs.slice(0, limit);
    },
    
    // 获取所有更新日志
    getAllUpdateLogs() {
        return this.updateLogs;
    }
};
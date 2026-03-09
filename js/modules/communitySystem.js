// ==================== 社区共建模块 ====================

import { StorageUtil, DOMUtil } from './utils.js';
import { ResourceManager } from './resourceManager.js';
import { NotificationSystem } from './notificationSystem.js';

export const CommunitySystem = {
    init() {
        this.loadPendingResources();
        this.setupSubmitForm();
        this.setupResourceApproval();
    },
    
    pendingResources: [],
    
    loadPendingResources() {
        this.pendingResources = StorageUtil.get('pendingResources', []);
    },
    
    setupSubmitForm() {
        // 绑定资源提交表单
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'resource-submit-form') {
                e.preventDefault();
                this.submitResource(e.target);
            }
        });
    },
    
    setupResourceApproval() {
        // 绑定审核按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.approve-resource')) {
                const resourceId = e.target.closest('.approve-resource').getAttribute('data-resource-id');
                this.approveResource(resourceId);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.reject-resource')) {
                const resourceId = e.target.closest('.reject-resource').getAttribute('data-resource-id');
                this.rejectResource(resourceId);
            }
        });
    },
    
    submitResource(form) {
        const title = form.title.value;
        const description = form.description.value;
        const url = form.url.value;
        const category = form.category.value;
        const grade = form.grade.value;
        const tags = form.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const free = form.free.checked;
        const submitter = form.submitter.value || '匿名用户';
        
        // 验证表单
        if (!title || !description || !url || !category) {
            alert('请填写必填字段');
            return;
        }
        
        const newResource = {
            id: Date.now(),
            title,
            description,
            url,
            category,
            grade,
            tags,
            free,
            rating: 0,
            views: 0,
            submittedBy: submitter,
            submittedAt: new Date().toISOString(),
            status: 'pending' // pending, approved, rejected
        };
        
        this.pendingResources.push(newResource);
        StorageUtil.set('pendingResources', this.pendingResources);
        
        // 显示提交成功提示
        this.showSubmitSuccess();
        
        // 发送通知给管理员
        NotificationSystem.addNotification({
            title: '新资源推荐',
            message: `${submitter}推荐了新资源：${title}，等待审核`,
            type: '系统',
            link: 'admin.html#pending-resources'
        });
        
        console.log('资源提交成功:', newResource);
        
        // 清空表单
        form.reset();
    },
    
    showSubmitSuccess() {
        const successHTML = `
            <div class="submit-success">
                <div class="submit-success-content">
                    <i class="fas fa-check-circle"></i>
                    <h4>提交成功</h4>
                    <p>感谢您的推荐，我们会尽快审核您的资源！</p>
                    <button class="btn btn-primary" id="close-submit-success">确定</button>
                </div>
            </div>
        `;
        
        // 移除已存在的成功提示
        const existingSuccess = document.querySelector('.submit-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // 添加成功提示
        document.body.insertAdjacentHTML('beforeend', successHTML);
        
        // 绑定关闭按钮
        document.getElementById('close-submit-success').addEventListener('click', () => {
            document.querySelector('.submit-success').remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            const success = document.querySelector('.submit-success');
            if (success) {
                success.remove();
            }
        }, 3000);
    },
    
    approveResource(resourceId) {
        const resourceIndex = this.pendingResources.findIndex(r => r.id == resourceId);
        if (resourceIndex !== -1) {
            const resource = this.pendingResources[resourceIndex];
            
            // 更新资源状态
            resource.status = 'approved';
            resource.approvedAt = new Date().toISOString();
            
            // 添加到资源库
            ResourceManager.addResource(resource);
            
            // 移除待审核资源
            this.pendingResources.splice(resourceIndex, 1);
            StorageUtil.set('pendingResources', this.pendingResources);
            
            // 发送通知给提交者
            NotificationSystem.addNotification({
                title: '资源审核通过',
                message: `您推荐的资源 "${resource.title}" 已通过审核，感谢您的贡献！`,
                type: '系统',
                link: `resources.html?category=${resource.category}`
            });
            
            // 给提交者添加积分奖励
            if (resource.submittedBy && resource.submittedBy !== '匿名用户') {
                // 假设存在PointsManager模块
                if (typeof PointsManager !== 'undefined') {
                    PointsManager.addPoints(resource.submittedBy, 10, 'submitResource');
                }
            }
            
            console.log('资源审核通过:', resource);
            
            // 刷新页面或更新UI
            this.displayPendingResources();
        }
    },
    
    rejectResource(resourceId) {
        const resourceIndex = this.pendingResources.findIndex(r => r.id == resourceId);
        if (resourceIndex !== -1) {
            const resource = this.pendingResources[resourceIndex];
            
            // 更新资源状态
            resource.status = 'rejected';
            resource.rejectedAt = new Date().toISOString();
            
            // 移除待审核资源
            this.pendingResources.splice(resourceIndex, 1);
            StorageUtil.set('pendingResources', this.pendingResources);
            
            // 发送通知给提交者
            NotificationSystem.addNotification({
                title: '资源审核拒绝',
                message: `您推荐的资源 "${resource.title}" 未通过审核，感谢您的参与！`,
                type: '系统'
            });
            
            console.log('资源审核拒绝:', resource);
            
            // 刷新页面或更新UI
            this.displayPendingResources();
        }
    },
    
    displayPendingResources() {
        const container = DOMUtil.$('#pending-resources');
        if (!container) return;
        
        if (this.pendingResources.length === 0) {
            container.innerHTML = `
                <div class="empty-pending">
                    <i class="fas fa-inbox"></i>
                    <p>暂无待审核资源</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.pendingResources.map(resource => {
            return `
                <div class="pending-resource-item" data-resource-id="${resource.id}">
                    <div class="pending-resource-header">
                        <h4>${resource.title}</h4>
                        <span class="pending-resource-status">待审核</span>
                    </div>
                    <div class="pending-resource-meta">
                        <span class="pending-resource-submitter">提交者: ${resource.submittedBy}</span>
                        <span class="pending-resource-date">${new Date(resource.submittedAt).toLocaleString()}</span>
                    </div>
                    <p class="pending-resource-description">${resource.description}</p>
                    <div class="pending-resource-info">
                        <span class="pending-resource-category">分类: ${resource.category}</span>
                        <span class="pending-resource-grade">年级: ${resource.grade}</span>
                        <span class="pending-resource-free">${resource.free ? '免费' : '付费'}</span>
                    </div>
                    <div class="pending-resource-tags">
                        ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="pending-resource-actions">
                        <button class="btn btn-primary approve-resource" data-resource-id="${resource.id}">
                            <i class="fas fa-check"></i> 通过
                        </button>
                        <button class="btn btn-secondary reject-resource" data-resource-id="${resource.id}">
                            <i class="fas fa-times"></i> 拒绝
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // 获取待审核资源
    getPendingResources() {
        return this.pendingResources;
    },
    
    // 获取资源推荐规则
    getSubmissionRules() {
        return [
            '资源必须与大学生学习、生活相关',
            '资源链接必须有效且安全',
            '资源描述必须真实准确',
            '不得推荐违法、违规或侵权内容',
            '优先推荐免费、高质量的资源',
            '推荐时请选择正确的分类和适用年级'
        ];
    },
    
    // 获取审核标准
    getReviewCriteria() {
        return [
            '资源的相关性和实用性',
            '资源的质量和可靠性',
            '资源的安全性和合法性',
            '资源描述的准确性',
            '资源的独特性和价值',
            '资源的可访问性和稳定性'
        ];
    },
    
    // 获取用户激励机制
    getIncentiveMechanism() {
        return [
            '推荐资源通过审核：+10积分',
            '推荐资源被评为优质：+20积分',
            '推荐资源被大量使用：额外积分奖励',
            '月度推荐之星：特殊标识和额外奖励',
            '连续推荐优质资源：等级提升'
        ];
    }
};

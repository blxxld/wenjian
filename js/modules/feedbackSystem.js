// ==================== 反馈系统模块 ====================

import { DOMUtil, StorageUtil } from './utils.js';

export const FeedbackSystem = {
    init() {
        this.loadFeedbackData();
        this.setupFeedbackButtons();
        this.setupFeedbackForm();
    },
    
    feedbackData: {},
    
    loadFeedbackData() {
        this.feedbackData = StorageUtil.get('feedbackData', {});
    },
    
    setupFeedbackButtons() {
        // 为所有资源卡片添加反馈按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.feedback-btn')) {
                const feedbackBtn = e.target.closest('.feedback-btn');
                const resourceId = feedbackBtn.getAttribute('data-resource-id');
                this.openFeedbackModal(resourceId);
            }
        });
    },
    
    setupFeedbackForm() {
        // 绑定反馈表单提交
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'feedback-form') {
                e.preventDefault();
                this.submitFeedback(e.target);
            }
        });
        
        // 绑定关闭按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('.close-feedback-modal')) {
                this.closeFeedbackModal();
            }
        });
        
        // 点击模态框外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feedback-modal')) {
                this.closeFeedbackModal();
            }
        });
    },
    
    openFeedbackModal(resourceId) {
        // 创建反馈模态框
        const modalHTML = `
            <div class="feedback-modal">
                <div class="feedback-modal-content">
                    <div class="feedback-modal-header">
                        <h3>资源反馈</h3>
                        <button class="close-feedback-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="feedback-form" data-resource-id="${resourceId}">
                        <div class="form-group">
                            <label for="feedback-type">反馈类型</label>
                            <select id="feedback-type" name="feedbackType" required>
                                <option value="">请选择反馈类型</option>
                                <option value="link_broken">链接失效</option>
                                <option value="info_error">信息错误</option>
                                <option value="content_inappropriate">内容不当</option>
                                <option value="other">其他问题</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="feedback-message">详细描述</label>
                            <textarea id="feedback-message" name="feedbackMessage" rows="4" required placeholder="请详细描述您遇到的问题..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="feedback-contact">联系方式（可选）</label>
                            <input type="text" id="feedback-contact" name="feedbackContact" placeholder="邮箱或手机号，便于我们回复您">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="close-feedback-modal btn btn-secondary">取消</button>
                            <button type="submit" class="btn btn-primary">提交反馈</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // 移除已存在的模态框
        const existingModal = document.querySelector('.feedback-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 添加新模态框
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    },
    
    closeFeedbackModal() {
        const modal = document.querySelector('.feedback-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },
    
    submitFeedback(form) {
        const resourceId = form.getAttribute('data-resource-id');
        const feedbackType = form.feedbackType.value;
        const feedbackMessage = form.feedbackMessage.value;
        const feedbackContact = form.feedbackContact.value;
        
        // 生成反馈ID
        const feedbackId = Date.now().toString();
        
        // 构建反馈对象
        const feedback = {
            id: feedbackId,
            resourceId,
            type: feedbackType,
            message: feedbackMessage,
            contact: feedbackContact,
            submittedAt: new Date().toISOString(),
            status: 'pending' // pending, processing, resolved
        };
        
        // 存储反馈数据
        if (!this.feedbackData[resourceId]) {
            this.feedbackData[resourceId] = [];
        }
        this.feedbackData[resourceId].push(feedback);
        StorageUtil.set('feedbackData', this.feedbackData);
        
        // 显示成功提示
        this.showFeedbackSuccess();
        
        // 关闭模态框
        this.closeFeedbackModal();
        
        console.log('反馈提交成功:', feedback);
    },
    
    showFeedbackSuccess() {
        const successHTML = `
            <div class="feedback-success">
                <div class="feedback-success-content">
                    <i class="fas fa-check-circle"></i>
                    <h4>反馈提交成功</h4>
                    <p>感谢您的反馈，我们会尽快处理！</p>
                    <button class="btn btn-primary" id="close-success">确定</button>
                </div>
            </div>
        `;
        
        // 移除已存在的成功提示
        const existingSuccess = document.querySelector('.feedback-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // 添加成功提示
        document.body.insertAdjacentHTML('beforeend', successHTML);
        
        // 绑定关闭按钮
        document.getElementById('close-success').addEventListener('click', () => {
            document.querySelector('.feedback-success').remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            const success = document.querySelector('.feedback-success');
            if (success) {
                success.remove();
            }
        }, 3000);
    },
    
    // 获取资源的反馈列表
    getResourceFeedback(resourceId) {
        return this.feedbackData[resourceId] || [];
    },
    
    // 获取所有反馈
    getAllFeedback() {
        const allFeedback = [];
        for (const resourceId in this.feedbackData) {
            allFeedback.push(...this.feedbackData[resourceId]);
        }
        return allFeedback.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    },
    
    // 标记反馈为已处理
    markFeedbackAsProcessed(feedbackId) {
        for (const resourceId in this.feedbackData) {
            const feedbackIndex = this.feedbackData[resourceId].findIndex(f => f.id === feedbackId);
            if (feedbackIndex !== -1) {
                this.feedbackData[resourceId][feedbackIndex].status = 'processed';
                StorageUtil.set('feedbackData', this.feedbackData);
                return true;
            }
        }
        return false;
    },
    
    // 标记反馈为已解决
    markFeedbackAsResolved(feedbackId) {
        for (const resourceId in this.feedbackData) {
            const feedbackIndex = this.feedbackData[resourceId].findIndex(f => f.id === feedbackId);
            if (feedbackIndex !== -1) {
                this.feedbackData[resourceId][feedbackIndex].status = 'resolved';
                StorageUtil.set('feedbackData', this.feedbackData);
                return true;
            }
        }
        return false;
    },
    
    // 删除反馈
    deleteFeedback(feedbackId) {
        for (const resourceId in this.feedbackData) {
            const initialLength = this.feedbackData[resourceId].length;
            this.feedbackData[resourceId] = this.feedbackData[resourceId].filter(f => f.id !== feedbackId);
            if (this.feedbackData[resourceId].length < initialLength) {
                StorageUtil.set('feedbackData', this.feedbackData);
                return true;
            }
        }
        return false;
    }
};

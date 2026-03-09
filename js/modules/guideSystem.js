// ==================== 引导系统模块 ====================

import { StorageUtil, DOMUtil } from './utils.js';

export const GuideSystem = {
    init() {
        this.checkFirstVisit();
        this.setupGuideEvents();
    },
    
    // 检查是否首次访问
    checkFirstVisit() {
        const hasVisited = StorageUtil.get('hasVisited', false);
        if (!hasVisited) {
            this.showWelcomeGuide();
            StorageUtil.set('hasVisited', true);
        }
    },
    
    // 显示欢迎引导
    showWelcomeGuide() {
        const guideHTML = `
            <div class="guide-modal">
                <div class="guide-content">
                    <div class="guide-header">
                        <h3>欢迎使用问茧</h3>
                        <button class="close-guide">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="guide-body">
                        <div class="guide-step active" data-step="1">
                            <div class="guide-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <h4>精准搜索</h4>
                            <p>使用搜索框快速找到你需要的资源，支持关键词搜索和筛选</p>
                        </div>
                        <div class="guide-step" data-step="2">
                            <div class="guide-icon">
                                <i class="fas fa-layer-group"></i>
                            </div>
                            <h4>资源分类</h4>
                            <p>浏览不同分类的资源，包括学习资料、竞赛信息、实习机会等</p>
                        </div>
                        <div class="guide-step" data-step="3">
                            <div class="guide-icon">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <h4>问卷社区</h4>
                            <p>发布问卷获取流量，或参与问卷帮助他人</p>
                        </div>
                        <div class="guide-step" data-step="4">
                            <div class="guide-icon">
                                <i class="fas fa-upload"></i>
                            </div>
                            <h4>社区共建</h4>
                            <p>提交优质资源，获得积分奖励，共同建设平台</p>
                        </div>
                    </div>
                    <div class="guide-footer">
                        <div class="guide-indicators">
                            <span class="guide-indicator active"></span>
                            <span class="guide-indicator"></span>
                            <span class="guide-indicator"></span>
                            <span class="guide-indicator"></span>
                        </div>
                        <div class="guide-buttons">
                            <button class="guide-prev" disabled>上一步</button>
                            <button class="guide-next">下一步</button>
                            <button class="guide-finish" style="display: none;">开始使用</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', guideHTML);
        this.setupGuideNavigation();
    },
    
    // 设置引导导航
    setupGuideNavigation() {
        const modal = document.querySelector('.guide-modal');
        const steps = document.querySelectorAll('.guide-step');
        const indicators = document.querySelectorAll('.guide-indicator');
        const prevBtn = document.querySelector('.guide-prev');
        const nextBtn = document.querySelector('.guide-next');
        const finishBtn = document.querySelector('.guide-finish');
        const closeBtn = document.querySelector('.close-guide');
        
        let currentStep = 0;
        
        // 更新引导状态
        const updateGuide = () => {
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === currentStep);
            });
            
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentStep);
            });
            
            prevBtn.disabled = currentStep === 0;
            
            if (currentStep === steps.length - 1) {
                nextBtn.style.display = 'none';
                finishBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                finishBtn.style.display = 'none';
            }
        };
        
        // 下一步
        nextBtn.addEventListener('click', () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateGuide();
            }
        });
        
        // 上一步
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateGuide();
            }
        });
        
        // 完成
        finishBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        // 关闭
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        // 点击指示器切换步骤
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentStep = index;
                updateGuide();
            });
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        // 初始化状态
        updateGuide();
    },
    
    // 设置引导事件
    setupGuideEvents() {
        // 帮助按钮点击事件
        const helpBtn = DOMUtil.$('#help-btn');
        if (helpBtn) {
            DOMUtil.on(helpBtn, 'click', () => {
                this.showHelpGuide();
            });
        }
        
        // 新手引导按钮
        const guideBtn = DOMUtil.$('#guide-btn');
        if (guideBtn) {
            DOMUtil.on(guideBtn, 'click', () => {
                this.showWelcomeGuide();
            });
        }
    },
    
    // 显示帮助引导
    showHelpGuide() {
        const helpHTML = `
            <div class="guide-modal">
                <div class="guide-content">
                    <div class="guide-header">
                        <h3>使用帮助</h3>
                        <button class="close-guide">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="guide-body">
                        <div class="help-section">
                            <h4><i class="fas fa-search"></i> 如何搜索资源？</h4>
                            <p>在首页顶部的搜索框中输入关键词，或使用筛选标签缩小范围，点击搜索按钮即可找到相关资源。</p>
                        </div>
                        <div class="help-section">
                            <h4><i class="fas fa-star"></i> 如何收藏资源？</h4>
                            <p>在资源卡片上点击星标图标，即可将资源添加到收藏夹，方便后续查看。</p>
                        </div>
                        <div class="help-section">
                            <h4><i class="fas fa-upload"></i> 如何提交资源？</h4>
                            <p>点击导航栏中的"提交资源"按钮，填写资源信息并提交，审核通过后即可获得积分奖励。</p>
                        </div>
                        <div class="help-section">
                            <h4><i class="fas fa-clipboard-list"></i> 如何发布问卷？</h4>
                            <p>进入问卷社区页面，点击"发布问卷"按钮，填写问卷信息并支付相应积分，即可获得流量支持。</p>
                        </div>
                        <div class="help-section">
                            <h4><i class="fas fa-bell"></i> 如何设置通知？</h4>
                            <p>进入用户中心的"订阅设置"页面，选择你感兴趣的通知类型，即可及时获取相关信息。</p>
                        </div>
                    </div>
                    <div class="guide-footer">
                        <button class="guide-finish">我知道了</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', helpHTML);
        
        const modal = document.querySelector('.guide-modal');
        const closeBtn = document.querySelector('.close-guide');
        const finishBtn = document.querySelector('.guide-finish');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        finishBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }
};
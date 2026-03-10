// ==================== 资源显示模块 ====================

import { Constants } from './constants.js';
import { FavoriteManager } from './favoriteManager.js';

export const ResourceDisplay = {
    displayResources(resourceList, container) {
        const startTime = performance.now();
        container.innerHTML = '';
        
        if (resourceList.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>没有找到匹配的资源</h3>
                    <p>尝试调整筛选条件或搜索关键词</p>
                    <button id="clear-filters-btn" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> 清除所有筛选
                    </button>
                </div>
            `;
            
            // 绑定清除筛选按钮
            document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
                if (window.FilterSystem) {
                    window.FilterSystem.resetFilters();
                }
            });
            return;
        }
        
        // 使用DocumentFragment批量添加元素，减少重排重绘
        const fragment = document.createDocumentFragment();
        
        // 预生成所有资源卡片的HTML
        const cardsHTML = resourceList.map(resource => this.createResourceHTML(resource)).join('');
        
        // 创建一个临时容器来解析HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = cardsHTML;
        
        // 将所有卡片添加到fragment
        while (tempContainer.firstChild) {
            fragment.appendChild(tempContainer.firstChild);
        }
        
        container.appendChild(fragment);
        
        // 批量绑定事件监听器
        this.bindEvents(container);
        
        const endTime = performance.now();
        console.log('显示资源完成，共', resourceList.length, '条资源，耗时:', (endTime - startTime).toFixed(2), 'ms');
    },
    
    createResourceHTML(resource) {
        // 生成星级评分
        const stars = '★'.repeat(resource.rating) + '☆'.repeat(5 - resource.rating);
        
        // 生成标签HTML
        const tagsHtml = resource.tags.map(tag => {
            // 确保标签是字符串，处理数组格式的标签
            const tagText = Array.isArray(tag) ? tag.join('') : tag;
            return `<span class="tag">${tagText}</span>`;
        }).join('');
        
        // 免费/付费标签
        const freeBadge = resource.free ? 
            '<span class="free-badge">免费</span>' : 
            '<span class="paid-badge">付费</span>';
        
        // 使用映射转换分类和年级
        const displayCategory = Constants.categoryMap[resource.category] || resource.category;
        const displayGrade = Constants.gradeMap[resource.grade] || resource.grade;
        
        // 为分类添加图标
        const getCategoryIcon = (category) => {
            const icons = {
                'website': 'fas fa-globe',
                'information': 'fas fa-newspaper'
            };
            return icons[category] || 'fas fa-book';
        };
        
        const categoryIcon = getCategoryIcon(resource.category);
        
        // 检查是否已收藏
        const isFavorited = FavoriteManager.isResourceFavorited(resource.id);
        const favoriteIcon = isFavorited ? 'fas fa-heart' : 'far fa-heart';
        const favoriteClass = isFavorited ? 'favorited' : '';
        
        // 根据资源类型生成不同的HTML结构
        if (resource.category === 'information') {
            // 信息类资源的UI设计
            return `
                <div class="resource-card animate-on-scroll">
                    <div class="resource-header">
                        <div class="resource-meta">
                            <span class="resource-category">
                                <i class="${categoryIcon}"></i> ${displayCategory}
                            </span>
                            ${freeBadge}
                            <button class="favorite-btn ${favoriteClass}" data-resource-id="${resource.id}">
                                <i class="${favoriteIcon}"></i>
                            </button>
                            <button class="feedback-btn" data-resource-id="${resource.id}" title="反馈问题">
                                <i class="fas fa-exclamation-circle"></i>
                            </button>
                        </div>
                        <h3 class="resource-title">${resource.title}</h3>
                        <p class="resource-description">${resource.description}</p>
                        ${resource.content ? `
                            <div class="info-detail">
                                <div class="info-content-preview">
                                    ${resource.content.substring(0, 150)}${resource.content.length > 150 ? '...' : ''}
                                </div>
                                ${resource.content.length > 150 ? `
                                    <div class="info-content-full" style="display: none;">
                                        ${resource.content}
                                    </div>
                                    <button class="read-more-btn">
                                        <i class="fas fa-chevron-down"></i> 查看更多
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                        <div class="resource-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                    <div class="resource-footer">
                        <div class="resource-info">
                            <span class="resource-grade">
                                <i class="fas fa-user-graduate"></i> ${displayGrade}
                            </span>
                            <span class="resource-rating" title="评分：${resource.rating}/5">
                                ${stars}
                            </span>
                        </div>
                        ${resource.url ? `<a href="${resource.url}" target="_blank" class="resource-link">
                            <i class="fas fa-external-link-alt"></i> 查看详情
                        </a>` : ''}
                    </div>
                </div>
            `;
        } else {
            // 网站类资源的UI设计（保持原有）
            return `
                <div class="resource-card animate-on-scroll">
                    <div class="resource-header">
                        <div class="resource-meta">
                            <span class="resource-category">
                                <i class="${categoryIcon}"></i> ${displayCategory}
                            </span>
                            ${freeBadge}
                            <button class="favorite-btn ${favoriteClass}" data-resource-id="${resource.id}">
                                <i class="${favoriteIcon}"></i>
                            </button>
                            <button class="feedback-btn" data-resource-id="${resource.id}" title="反馈问题">
                                <i class="fas fa-exclamation-circle"></i>
                            </button>
                        </div>
                        <h3 class="resource-title">${resource.title}</h3>
                        <p class="resource-description">${resource.description}</p>
                        <div class="resource-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                    <div class="resource-footer">
                        <div class="resource-info">
                            <span class="resource-grade">
                                <i class="fas fa-user-graduate"></i> ${displayGrade}
                            </span>
                            <span class="resource-rating" title="评分：${resource.rating}/5">
                                ${stars}
                            </span>
                        </div>
                        <a href="${resource.url}" target="_blank" class="resource-link">
                            <i class="fas fa-external-link-alt"></i> 访问网站
                        </a>
                    </div>
                </div>
            `;
        }
    },
    
    // 批量绑定事件监听器
    bindEvents(container) {
        // 绑定收藏按钮事件（使用事件委托）
        container.addEventListener('click', (e) => {
            // 处理收藏按钮点击
            if (e.target.closest('.favorite-btn')) {
                const favoriteBtn = e.target.closest('.favorite-btn');
                const resourceId = favoriteBtn.getAttribute('data-resource-id');
                FavoriteManager.toggleFavorite(resourceId);
                const icon = favoriteBtn.querySelector('i');
                if (favoriteBtn.classList.contains('favorited')) {
                    favoriteBtn.classList.remove('favorited');
                    icon.className = 'far fa-heart';
                } else {
                    favoriteBtn.classList.add('favorited');
                    icon.className = 'fas fa-heart';
                }
            }
            
            // 处理查看更多按钮点击
            if (e.target.closest('.read-more-btn')) {
                const readMoreBtn = e.target.closest('.read-more-btn');
                const resourceCard = readMoreBtn.closest('.resource-card');
                const fullContent = resourceCard.querySelector('.info-content-full');
                if (fullContent.style.display === 'none') {
                    fullContent.style.display = 'block';
                    readMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> 收起';
                } else {
                    fullContent.style.display = 'none';
                    readMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> 查看更多';
                }
            }
            
            // 处理标签点击事件
            if (e.target.closest('.tag')) {
                const tagElement = e.target.closest('.tag');
                const tagText = tagElement.textContent.trim();
                
                // 使用搜索功能来实现标签筛选
                if (window.FilterSystem) {
                    // 设置搜索词为标签文本
                    window.FilterSystem.currentFilters.searchTerm = tagText;
                    // 应用筛选
                    window.FilterSystem.applyFilters();
                    
                    // 更新搜索框的值
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = tagText;
                    }
                }
            }
        });
    }
};

// ==================== 搜索功能模块 ====================

import { debounce, DOMUtil, StorageUtil } from './utils.js';
import { ResourceManager } from './resourceManager.js';

export const SearchSystem = {
    searchHistory: [],
    searchSuggestions: [],
    hotSearches: [],
    
    init() {
        this.loadSearchHistory();
        this.loadHotSearches();
        this.setupSearchInput();
        this.setupSearchHistoryPage();
    },
    
    setupSearchInput() {
        const searchInput = DOMUtil.$('#search-input');
        if (!searchInput) return;
        
        // 搜索防抖
        const debouncedSearch = debounce((searchTerm) => {
            if (searchTerm.length > 1) {
                this.showSearchSuggestions(searchTerm);
            } else {
                this.showHotSearches();
            }
        }, 300);
        
        // 搜索输入事件
        DOMUtil.on(searchInput, 'input', (e) => {
            const searchTerm = e.target.value.trim();
            debouncedSearch(searchTerm);
        });
        
        // 搜索提交事件
        const searchBtn = DOMUtil.$('#search-btn');
        if (searchBtn) {
            DOMUtil.on(searchBtn, 'click', () => this.performSearch());
        }
        
        // 回车键搜索
        DOMUtil.on(searchInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 点击其他区域隐藏搜索建议
        DOMUtil.on(document, 'click', (e) => {
            if (!searchInput.contains(e.target) && !e.target.closest('.search-suggestions')) {
                this.hideSearchSuggestions();
            }
        });
        
        // 初始显示热门搜索
        this.showHotSearches();
    },
    
    performSearch() {
        const searchInput = DOMUtil.$('#search-input');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        if (searchTerm) {
            // 添加到搜索历史
            this.addToSearchHistory(searchTerm);
            // 更新热门搜索
            this.updateHotSearches(searchTerm);
        }
        
        // 直接跳转到资源页面并传递搜索参数
        window.location.href = `resources.html?search=${encodeURIComponent(searchTerm)}`;
        
        // 隐藏搜索建议
        this.hideSearchSuggestions();
    },
    
    showSearchSuggestions(searchTerm) {
        const searchInput = DOMUtil.$('#search-input');
        if (!searchInput) return;
        
        // 生成搜索建议
        this.searchSuggestions = this.generateSearchSuggestions(searchTerm);
        
        // 创建搜索建议容器
        let suggestionsContainer = DOMUtil.$('.search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = DOMUtil.createElement('div', {
                className: 'search-suggestions'
            });
            searchInput.parentNode.appendChild(suggestionsContainer);
        }
        
        // 渲染搜索建议
        if (this.searchSuggestions.length > 0) {
            suggestionsContainer.innerHTML = this.searchSuggestions.map(suggestion => {
                // 根据建议类型选择图标
                let icon = 'fas fa-search';
                let typeClass = 'search-suggestion-type-' + suggestion.type;
                
                switch (suggestion.type) {
                    case 'history':
                        icon = 'fas fa-history';
                        break;
                    case 'tag':
                        icon = 'fas fa-tag';
                        break;
                    case 'title':
                        icon = 'fas fa-file-alt';
                        break;
                    case 'description':
                        icon = 'fas fa-align-left';
                        break;
                    case 'hot':
                        icon = 'fas fa-fire';
                        break;
                }
                
                // 高亮搜索词
                const highlightedText = suggestion.text.replace(
                    new RegExp(`(${searchTerm})`, 'gi'),
                    '<span class="search-highlight">$1</span>'
                );
                
                return `
                    <div class="search-suggestion-item ${typeClass}" data-term="${suggestion.text}">
                        <i class="${icon}"></i>
                        <span>${highlightedText}</span>
                    </div>
                `;
            }).join('');
            
            // 绑定点击事件
            DOMUtil.$$('.search-suggestion-item', suggestionsContainer).forEach(item => {
                DOMUtil.on(item, 'click', () => {
                    const term = item.getAttribute('data-term');
                    searchInput.value = term;
                    this.performSearch();
                });
            });
            
            suggestionsContainer.classList.add('active');
        } else {
            this.showHotSearches();
        }
    },
    
    showHotSearches() {
        const searchInput = DOMUtil.$('#search-input');
        if (!searchInput) return;
        
        // 创建搜索建议容器
        let suggestionsContainer = DOMUtil.$('.search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = DOMUtil.createElement('div', {
                className: 'search-suggestions'
            });
            searchInput.parentNode.appendChild(suggestionsContainer);
        }
        
        // 渲染热门搜索
        if (this.hotSearches.length > 0) {
            suggestionsContainer.innerHTML = `
                <div class="search-suggestions-header">
                    <i class="fas fa-fire"></i>
                    <span>热门搜索</span>
                </div>
                ${this.hotSearches.map((term, index) => `
                    <div class="search-suggestion-item search-suggestion-type-hot" data-term="${term}">
                        <span class="hot-rank ${index < 3 ? 'top-rank' : ''}">${index + 1}</span>
                        <span>${term}</span>
                        <span class="hot-icon">🔥</span>
                    </div>
                `).join('')}
            `;
            
            // 绑定点击事件
            DOMUtil.$$('.search-suggestion-item', suggestionsContainer).forEach(item => {
                DOMUtil.on(item, 'click', () => {
                    const term = item.getAttribute('data-term');
                    searchInput.value = term;
                    this.performSearch();
                });
            });
            
            suggestionsContainer.classList.add('active');
        } else {
            this.hideSearchSuggestions();
        }
    },
    
    hideSearchSuggestions() {
        const suggestionsContainer = DOMUtil.$('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('active');
        }
    },
    
    generateSearchSuggestions(searchTerm) {
        const resources = ResourceManager.getResources();
        const suggestions = [];
        const seenSuggestions = new Set();
        
        // 从资源标题、描述和标签中提取建议
        resources.forEach(resource => {
            // 标题建议
            if (resource.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                const titleSuggestion = {
                    text: resource.title,
                    type: 'title',
                    resourceId: resource.id,
                    score: 10 // 标题匹配得分最高
                };
                if (!seenSuggestions.has(titleSuggestion.text)) {
                    suggestions.push(titleSuggestion);
                    seenSuggestions.add(titleSuggestion.text);
                }
            }
            
            // 标签建议
            resource.tags.forEach(tag => {
                const tagText = Array.isArray(tag) ? tag.join('') : tag;
                if (tagText.toLowerCase().includes(searchTerm.toLowerCase())) {
                    const tagSuggestion = {
                        text: tagText,
                        type: 'tag',
                        score: 8 // 标签匹配得分较高
                    };
                    if (!seenSuggestions.has(tagSuggestion.text)) {
                        suggestions.push(tagSuggestion);
                        seenSuggestions.add(tagSuggestion.text);
                    }
                }
            });
            
            // 描述建议
            if (resource.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                // 提取描述中的相关短语
                const descLower = resource.description.toLowerCase();
                const startIndex = descLower.indexOf(searchTerm.toLowerCase());
                if (startIndex !== -1) {
                    const endIndex = descLower.indexOf(' ', startIndex + searchTerm.length + 20);
                    const suggestionText = resource.description.substring(
                        Math.max(0, startIndex - 10),
                        endIndex !== -1 ? endIndex : resource.description.length
                    ).trim();
                    if (suggestionText.length > 10) {
                        const descSuggestion = {
                            text: suggestionText,
                            type: 'description',
                            resourceId: resource.id,
                            score: 6 // 描述匹配得分较低
                        };
                        if (!seenSuggestions.has(descSuggestion.text)) {
                            suggestions.push(descSuggestion);
                            seenSuggestions.add(descSuggestion.text);
                        }
                    }
                }
            }
        });
        
        // 添加搜索历史中的相关项
        this.searchHistory.forEach(historyItem => {
            if (historyItem.toLowerCase().includes(searchTerm.toLowerCase())) {
                const historySuggestion = {
                    text: historyItem,
                    type: 'history',
                    score: 9 // 历史记录得分较高
                };
                if (!seenSuggestions.has(historySuggestion.text)) {
                    suggestions.push(historySuggestion);
                    seenSuggestions.add(historySuggestion.text);
                }
            }
        });
        
        // 添加热门搜索中的相关项
        this.hotSearches.forEach(hotTerm => {
            if (hotTerm.toLowerCase().includes(searchTerm.toLowerCase())) {
                const hotSuggestion = {
                    text: hotTerm,
                    type: 'hot',
                    score: 7 // 热门搜索得分
                };
                if (!seenSuggestions.has(hotSuggestion.text)) {
                    suggestions.push(hotSuggestion);
                    seenSuggestions.add(hotSuggestion.text);
                }
            }
        });
        
        // 按得分排序，然后按字母顺序排序
        suggestions.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.text.localeCompare(b.text);
        });
        
        // 最多返回8个建议
        return suggestions.slice(0, 8);
    },
    
    addToSearchHistory(searchTerm) {
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item !== searchTerm);
        
        // 添加到开头
        this.searchHistory.unshift(searchTerm);
        
        // 限制历史记录数量
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // 保存到本地存储
        StorageUtil.set('searchHistory', this.searchHistory);
    },
    
    loadSearchHistory() {
        this.searchHistory = StorageUtil.get('searchHistory', []);
    },
    
    // 加载热门搜索
    loadHotSearches() {
        // 从本地存储加载热门搜索
        this.hotSearches = StorageUtil.get('hotSearches', [
            '学习资源',
            '实习就业',
            '竞赛资讯',
            '实用工具',
            '设计网站',
            '学术资源'
        ]);
    },
    
    // 更新热门搜索
    updateHotSearches(searchTerm) {
        // 从本地存储加载热门搜索数据
        const hotSearchesData = StorageUtil.get('hotSearchesData', {});
        
        // 更新搜索次数
        hotSearchesData[searchTerm] = (hotSearchesData[searchTerm] || 0) + 1;
        
        // 保存数据
        StorageUtil.set('hotSearchesData', hotSearchesData);
        
        // 重新计算热门搜索
        this.calculateHotSearches();
    },
    
    // 计算热门搜索
    calculateHotSearches() {
        const hotSearchesData = StorageUtil.get('hotSearchesData', {});
        
        // 按搜索次数排序
        const sortedSearches = Object.entries(hotSearchesData)
            .sort((a, b) => b[1] - a[1])
            .map(([term]) => term)
            .slice(0, 6);
        
        // 如果没有足够的搜索数据，使用默认值
        if (sortedSearches.length < 6) {
            const defaultSearches = [
                '学习资源',
                '实习就业',
                '竞赛资讯',
                '实用工具',
                '设计网站',
                '学术资源'
            ];
            
            // 补充默认搜索词
            defaultSearches.forEach(term => {
                if (!sortedSearches.includes(term) && sortedSearches.length < 6) {
                    sortedSearches.push(term);
                }
            });
        }
        
        this.hotSearches = sortedSearches;
        StorageUtil.set('hotSearches', this.hotSearches);
    },
    
    // 清除搜索历史
    clearSearchHistory() {
        this.searchHistory = [];
        StorageUtil.remove('searchHistory');
        console.log('搜索历史已清除');
    },
    
    // 清除热门搜索
    clearHotSearches() {
        this.hotSearches = [
            '学习资源',
            '实习就业',
            '竞赛资讯',
            '实用工具',
            '设计网站',
            '学术资源'
        ];
        StorageUtil.set('hotSearches', this.hotSearches);
        StorageUtil.remove('hotSearchesData');
        console.log('热门搜索已重置');
    },
    
    // 设置搜索历史页面
    setupSearchHistoryPage() {
        const historyContainer = DOMUtil.$('#search-history-container');
        if (!historyContainer) return;
        
        // 显示搜索历史
        this.displaySearchHistory(historyContainer);
        
        // 绑定清除历史按钮
        const clearHistoryBtn = DOMUtil.$('#clear-history-btn');
        if (clearHistoryBtn) {
            DOMUtil.on(clearHistoryBtn, 'click', () => {
                this.clearSearchHistory();
                this.displaySearchHistory(historyContainer);
            });
        }
        
        // 绑定清除热门搜索按钮
        const clearHotBtn = DOMUtil.$('#clear-hot-btn');
        if (clearHotBtn) {
            DOMUtil.on(clearHotBtn, 'click', () => {
                this.clearHotSearches();
                this.displayHotSearches(DOMUtil.$('#hot-searches-container'));
            });
        }
        
        // 显示热门搜索
        this.displayHotSearches(DOMUtil.$('#hot-searches-container'));
    },
    
    // 显示搜索历史
    displaySearchHistory(container) {
        if (this.searchHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>暂无搜索历史</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.searchHistory.map((term, index) => `
            <div class="history-item">
                <span class="history-index">${index + 1}</span>
                <span class="history-term">${term}</span>
                <button class="history-remove" data-term="${term}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // 绑定移除历史项按钮
        DOMUtil.$$('.history-remove', container).forEach(btn => {
            DOMUtil.on(btn, 'click', function() {
                const term = this.getAttribute('data-term');
                SearchSystem.searchHistory = SearchSystem.searchHistory.filter(item => item !== term);
                StorageUtil.set('searchHistory', SearchSystem.searchHistory);
                SearchSystem.displaySearchHistory(container);
            });
        });
        
        // 绑定历史项点击
        DOMUtil.$$('.history-term', container).forEach(item => {
            DOMUtil.on(item, 'click', function() {
                const term = this.textContent;
                window.location.href = `resources.html?search=${encodeURIComponent(term)}`;
            });
        });
    },
    
    // 显示热门搜索
    displayHotSearches(container) {
        if (!container) return;
        
        container.innerHTML = this.hotSearches.map((term, index) => `
            <div class="hot-search-item">
                <span class="hot-rank ${index < 3 ? 'top-rank' : ''}">${index + 1}</span>
                <span class="hot-term">${term}</span>
            </div>
        `).join('');
        
        // 绑定热门搜索项点击
        DOMUtil.$$('.hot-term', container).forEach(item => {
            DOMUtil.on(item, 'click', function() {
                const term = this.textContent;
                window.location.href = `resources.html?search=${encodeURIComponent(term)}`;
            });
        });
    }
};
